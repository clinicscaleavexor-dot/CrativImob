import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  createCustomer,
  findCustomerByEmail,
  createSubscription,
  getSubscriptionPayments,
} from "@/lib/asaas";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { planId, cpfCnpj } = await req.json();

    if (!planId || !cpfCnpj) {
      return NextResponse.json(
        { error: "planId e cpfCnpj são obrigatórios" },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Get plan details
    const { data: plan, error: planError } = await serviceClient
      .from("plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    if (plan.price_cents === 0) {
      return NextResponse.json(
        { error: "Plano Free não requer assinatura" },
        { status: 400 }
      );
    }

    // Get or create Asaas customer
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("asaas_customer_id, full_name, phone")
      .eq("id", user.id)
      .single();

    let asaasCustomerId = profile?.asaas_customer_id;

    if (!asaasCustomerId) {
      const existing = await findCustomerByEmail(user.email!);
      if (existing) {
        asaasCustomerId = existing.id;
      } else {
        const customer = await createCustomer({
          name: profile?.full_name || user.email!.split("@")[0],
          email: user.email!,
          cpfCnpj: cpfCnpj.replace(/\D/g, ""),
          phone: profile?.phone || undefined,
        });
        asaasCustomerId = customer.id;
      }

      // Save customer ID and CPF/CNPJ to profile
      await serviceClient
        .from("profiles")
        .update({
          asaas_customer_id: asaasCustomerId,
          cpf_cnpj: cpfCnpj.replace(/\D/g, ""),
        })
        .eq("id", user.id);
    }

    // Calculate next due date (tomorrow)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);
    const dueDateStr = nextDueDate.toISOString().split("T")[0];

    // Build externalReference: "user_{USER_ID}_plan_{SLUG}"
    const externalReference = `user_${user.id}_plan_${plan.slug}`;

    // Create subscription in Asaas with billingType UNDEFINED
    const asaasSub = await createSubscription({
      customer: asaasCustomerId,
      billingType: "UNDEFINED",
      value: plan.price_cents / 100,
      nextDueDate: dueDateStr,
      cycle: "MONTHLY",
      description: `CrativImob - Plano ${plan.name}`,
      externalReference,
    });

    // Fetch first payment to get invoiceUrl
    let invoiceUrl: string | null = null;
    try {
      const payments = await getSubscriptionPayments(asaasSub.id);
      if (payments.length > 0) {
        invoiceUrl = payments[0].invoiceUrl;
      }
    } catch (err) {
      console.error("Failed to fetch invoiceUrl:", err);
    }

    // Calculate period end (30 days from now)
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    // Deactivate any existing active subscription
    await serviceClient
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("user_id", user.id)
      .eq("status", "active");

    // Create local subscription record
    const { error: subError } = await serviceClient
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id: planId,
        status: "pending",
        external_subscription_id: asaasSub.id,
        external_reference: externalReference,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
      });

    if (subError) {
      console.error("Error creating subscription:", subError);
      return NextResponse.json(
        { error: "Erro ao salvar assinatura" },
        { status: 500 }
      );
    }

    // Update profile plan_id
    await serviceClient
      .from("profiles")
      .update({ plan_id: planId })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      subscriptionId: asaasSub.id,
      invoiceUrl,
      status: asaasSub.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Subscription error:", message);
    return NextResponse.json(
      { error: `Erro ao criar assinatura: ${message}` },
      { status: 500 }
    );
  }
}
