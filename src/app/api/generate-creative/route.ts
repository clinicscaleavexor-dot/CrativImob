import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Explicit types to avoid postgrest-js GenericTable resolution issues
type CreditsRow = { balance: number };
type PropertyRow = {
  id: string;
  title: string;
  type: string;
  city: string | null;
  price_cents: number | null;
};
type TemplateRow = {
  id: string;
  name: string;
  config: Record<string, unknown> | null;
};
type CreativeId = { id: string };

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await request.json()) as Record<string, any>;
    const { property_id, template_id, format, creative_type, headline, copy_text, cta_text } = body;

    if (!property_id || !template_id || !format) {
      return NextResponse.json({ error: "Parâmetros obrigatórios ausentes" }, { status: 400 });
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar créditos disponíveis
    const { data: creditsRaw } = await db
      .from("credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    const creditsRow = creditsRaw as CreditsRow | null;

    if (!creditsRow || creditsRow.balance < 1) {
      return NextResponse.json({ error: "Créditos insuficientes" }, { status: 402 });
    }

    // Buscar dados do imóvel
    const { data: propertyRaw, error: propError } = await db
      .from("properties")
      .select("id,title,type,city,price_cents")
      .eq("id", property_id)
      .eq("user_id", user.id)
      .single();

    const property = propertyRaw as PropertyRow | null;

    if (propError || !property) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    // Buscar template
    const { data: templateRaw, error: tplError } = await db
      .from("templates")
      .select("id,name,config")
      .eq("id", template_id)
      .single();

    const template = templateRaw as TemplateRow | null;

    if (tplError || !template) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }

    // Criar registro de creative (status: processing) — usa db (any) para bypass de tipos
    const { data: creativeRaw, error: createError } = await db
      .from("creatives")
      .insert({
        user_id: user.id,
        property_id,
        template_id,
        format,
        type: creative_type ?? "post",
        status: "processing",
        headline: headline ?? "",
        copy_text: copy_text ?? "",
        cta_text: cta_text ?? "Saiba mais",
      })
      .select("id")
      .single();

    const creative = creativeRaw as CreativeId | null;

    if (createError || !creative) {
      return NextResponse.json({ error: "Erro ao criar criativo" }, { status: 500 });
    }

    // Debitar 1 crédito
    await db.from("credits").update({ balance: creditsRow.balance - 1 }).eq("user_id", user.id);

    // Registrar transação de crédito
    await db.from("credits_transactions").insert({
      user_id: user.id,
      amount: -1,
      type: "debit",
      description: `Geração de criativo: ${property.title}`,
    });

    // Montar prompt para geração de imagem
    const formatDimensions: Record<string, string> = {
      "1080x1080": "square 1080x1080",
      "1080x1920": "vertical stories 1080x1920",
      "1200x628": "horizontal banner 1200x628",
    };

    const promptText = buildPrompt({
      property,
      template,
      format: formatDimensions[format] ?? format,
      headline: headline ?? "",
      copy_text: copy_text ?? "",
      cta_text: cta_text ?? "Saiba mais",
    });

    // Tentar chamar Banana.dev se API key configurada
    const bananaApiKey = process.env.BANANA_API_KEY;
    let imageUrl: string | null = null;

    if (bananaApiKey) {
      try {
        imageUrl = await callBananaDev(bananaApiKey, promptText, format);
      } catch (err) {
        console.error("Banana.dev error:", err);
      }
    }

    // Atualizar creative com resultado
    await db.from("creatives").update({
      status: imageUrl ? "completed" : "failed",
      image_url: imageUrl ?? null,
      ai_prompt: promptText,
    }).eq("id", creative.id);

    return NextResponse.json({
      success: true,
      creative_id: creative.id,
      image_url: imageUrl,
      status: imageUrl ? "completed" : "failed",
    });
  } catch (err) {
    console.error("generate-creative error:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

function buildPrompt({
  property,
  template,
  format,
  headline,
  copy_text,
  cta_text,
}: {
  property: Record<string, unknown>;
  template: Record<string, unknown>;
  format: string;
  headline: string;
  copy_text: string;
  cta_text: string;
}): string {
  const style = (template.config as Record<string, unknown>)?.style ?? template.name ?? "modern real estate";
  const propType = property.type ?? "property";
  const city = property.city ?? "";
  const price = property.price_cents
    ? `R$ ${(Number(property.price_cents) / 100).toLocaleString("pt-BR")}`
    : "";

  return `Professional real estate advertisement creative, ${format} format.
Style: ${style}
Property: ${propType}${city ? ` in ${city}` : ""}${price ? `, ${price}` : ""}
Headline: ${headline}
${copy_text ? `Copy: ${copy_text}` : ""}
CTA: ${cta_text}
High quality, photorealistic, professional marketing material, clean layout, bold typography.`;
}

async function callBananaDev(
  apiKey: string,
  prompt: string,
  format: string
): Promise<string | null> {
  const dimensions: Record<string, { width: number; height: number }> = {
    "1080x1080": { width: 1080, height: 1080 },
    "1080x1920": { width: 1080, height: 1920 },
    "1200x628": { width: 1200, height: 628 },
  };

  const size = dimensions[format] ?? { width: 1080, height: 1080 };

  const response = await fetch("https://api.banana.dev/v1/run/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      modelKey: process.env.BANANA_MODEL_KEY ?? "stable-diffusion-xl",
      modelInputs: {
        prompt,
        negative_prompt: "blurry, low quality, text errors, watermark",
        width: size.width,
        height: size.height,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Banana.dev returned ${response.status}`);
  }

  const data = (await response.json()) as {
    modelOutputs?: Array<{ image_base64?: string; image?: string }>;
  };

  const output = data.modelOutputs?.[0];
  if (!output) return null;

  // Retorna base64 data URL ou URL direta
  if (output.image_base64) {
    return `data:image/png;base64,${output.image_base64}`;
  }
  if (output.image) {
    return output.image;
  }

  return null;
}
