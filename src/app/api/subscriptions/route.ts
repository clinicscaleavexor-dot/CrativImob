import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  createCustomer,
  findCustomerByEmail,
  createSubscription,
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

    const { planId, cpfCnpj, billingType } = await req.json();

    if (!planId || !cpfCnpj || !billingType) {
      return NextResponse.json(
        { error: "planId, cpfCnpj e billingType são obrigatórios" },
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
      // Try to find existing customer by email
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

    // Create subscription in Asaas
    const asaasSub = await createSubscription({
      customer: asaasCustomerId,
      billingType: billingType as "BOLETO" | "CREDIT_CARD" | "PIX",
      value: plan.price_cents / 100,
      nextDueDate: dueDateStr,
      cycle: "MONTHLY",
      description: `CrativImob - Plano ${plan.name}`,
      externalReference: user.id,
    });

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
      status: asaasSub.status,
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar assinatura" },
      { status: 500 }
    );
  }
}
