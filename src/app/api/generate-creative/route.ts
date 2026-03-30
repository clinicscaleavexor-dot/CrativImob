import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------- Types ----------

type CreditsRow = { balance: number };
type PropertyRow = {
  id: string;
  title: string;
  type: string;
  city: string | null;
  state: string | null;
  price_cents: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  highlights: string[] | null;
  location: string | null;
};
type ProfileBriefing = {
  company_name: string | null;
  company_description: string | null;
  brand_personality: string | null;
  target_audience: string | null;
  preferred_style: string | null;
  brand_colors: Record<string, string> | null;
};
type CategoryRow = {
  id: string;
  slug: string;
  label: string;
  prompt_template: string;
};
type CreativeId = { id: string };

// ---------- POST Handler ----------

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await request.json()) as Record<string, any>;
    const {
      property_id,
      category,
      format,
      creative_type,
      headline,
      copy_text,
      cta_text,
    } = body;

    if (!property_id || !category || !format) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios ausentes (property_id, category, format)" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // 1. Auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // 2. Credits
    const { data: creditsRaw } = await db
      .from("credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    const creditsRow = creditsRaw as CreditsRow | null;

    if (!creditsRow || creditsRow.balance < 1) {
      return NextResponse.json(
        { error: "Créditos insuficientes" },
        { status: 402 }
      );
    }

    // 3. Property
    const { data: propertyRaw, error: propError } = await db
      .from("properties")
      .select("id,title,type,city,state,price_cents,bedrooms,bathrooms,area_sqm,highlights,location")
      .eq("id", property_id)
      .eq("user_id", user.id)
      .single();

    const property = propertyRaw as PropertyRow | null;

    if (propError || !property) {
      return NextResponse.json(
        { error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    // 4. Profile briefing
    const { data: profileRaw } = await db
      .from("profiles")
      .select(
        "company_name,company_description,brand_personality,target_audience,preferred_style,brand_colors"
      )
      .eq("id", user.id)
      .single();

    const profile = (profileRaw as ProfileBriefing | null) ?? {
      company_name: null,
      company_description: null,
      brand_personality: null,
      target_audience: null,
      preferred_style: null,
      brand_colors: null,
    };

    // 5. Category prompt template
    const { data: categoryRaw, error: catError } = await db
      .from("prompt_categories")
      .select("id,slug,label,prompt_template")
      .eq("slug", category)
      .eq("is_active", true)
      .single();

    const categoryData = categoryRaw as CategoryRow | null;

    if (catError || !categoryData) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // 6. Debit 1 credit (1 credit = 2 variations)
    await db
      .from("credits")
      .update({ balance: creditsRow.balance - 1 })
      .eq("user_id", user.id);

    await db.from("credits_transactions").insert({
      user_id: user.id,
      amount: -1,
      type: "debit",
      description: `Geração de criativo: ${property.title} (${categoryData.label})`,
    });

    // 7. Build prompt
    const formatDimensions: Record<string, string> = {
      "1080x1080": "square 1080x1080 (Instagram post)",
      "1080x1920": "vertical 1080x1920 (Instagram/Facebook Stories)",
      "1200x628": "horizontal 1200x628 (Facebook/Google Ads banner)",
    };

    const compositePrompt = buildCompositePrompt({
      template: categoryData.prompt_template,
      property,
      profile,
      format: formatDimensions[format] ?? format,
      headline: headline ?? "",
      copyText: copy_text ?? "",
      ctaText: cta_text ?? "Saiba mais",
    });

    // 8. Generate images + copy in parallel
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Chave da API de IA não configurada" },
        { status: 500 }
      );
    }

    const variationGroupId = crypto.randomUUID();

    const [image1Result, image2Result, copyResult] = await Promise.allSettled([
      callGeminiImage(geminiApiKey, compositePrompt, "Variation 1"),
      callGeminiImage(geminiApiKey, compositePrompt, "Variation 2"),
      callGeminiCopy(geminiApiKey, property, categoryData, profile),
    ]);

    const image1 =
      image1Result.status === "fulfilled" ? image1Result.value : null;
    const image2 =
      image2Result.status === "fulfilled" ? image2Result.value : null;
    const generatedCopy =
      copyResult.status === "fulfilled" ? copyResult.value : null;

    if (!image1 && !image2) {
      console.error(
        "Both image generations failed:",
        image1Result.status === "rejected" ? image1Result.reason : "ok",
        image2Result.status === "rejected" ? image2Result.reason : "ok"
      );
    }

    // 9. Upload images to Supabase Storage and create creative records
    const imageUrls: (string | null)[] = [];
    const creativeIds: string[] = [];

    for (let i = 0; i < 2; i++) {
      const imageBase64 = i === 0 ? image1 : image2;
      let imageUrl: string | null = null;

      if (imageBase64) {
        imageUrl = await uploadToStorage(
          db,
          user.id,
          variationGroupId,
          i + 1,
          imageBase64
        );
      }

      const { data: creativeRaw, error: createError } = await db
        .from("creatives")
        .insert({
          user_id: user.id,
          property_id,
          template_id: null,
          format,
          type: creative_type ?? "post",
          status: imageUrl ? "completed" : "failed",
          headline: headline ?? "",
          copy_text: copy_text ?? "",
          cta_text: cta_text ?? "Saiba mais",
          image_url: imageUrl,
          ai_prompt: compositePrompt,
          generated_copy: generatedCopy,
          variation_number: i + 1,
          variation_group_id: variationGroupId,
          ai_metadata: {
            category: categoryData.slug,
            category_label: categoryData.label,
            model: "gemini-2.0-flash-exp",
          },
        })
        .select("id")
        .single();

      const creative = creativeRaw as CreativeId | null;

      if (!createError && creative) {
        creativeIds.push(creative.id);
      }

      imageUrls.push(imageUrl);
    }

    return NextResponse.json({
      success: true,
      creative_ids: creativeIds,
      image_urls: imageUrls,
      generated_copy: generatedCopy,
      variation_group_id: variationGroupId,
      status: imageUrls.some((u) => u !== null) ? "completed" : "failed",
    });
  } catch (err) {
    console.error("generate-creative error:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// ---------- Helpers ----------

function buildCompositePrompt({
  template,
  property,
  profile,
  format,
  headline,
  copyText,
  ctaText,
}: {
  template: string;
  property: PropertyRow;
  profile: ProfileBriefing;
  format: string;
  headline: string;
  copyText: string;
  ctaText: string;
}): string {
  const price = property.price_cents
    ? `R$ ${(property.price_cents / 100).toLocaleString("pt-BR")}`
    : "";

  const propertyParts = [
    `Property type: ${property.type}`,
    property.city ? `City: ${property.city}` : "",
    property.state ? `State: ${property.state}` : "",
    price ? `Price: ${price}` : "",
    property.bedrooms ? `Bedrooms: ${property.bedrooms}` : "",
    property.bathrooms ? `Bathrooms: ${property.bathrooms}` : "",
    property.area_sqm ? `Area: ${property.area_sqm}m²` : "",
    property.highlights?.length
      ? `Highlights: ${property.highlights.join(", ")}`
      : "",
    headline ? `Headline text: "${headline}"` : "",
    copyText ? `Description: "${copyText}"` : "",
    ctaText ? `CTA button: "${ctaText}"` : "",
  ]
    .filter(Boolean)
    .join(". ");

  const briefingParts = [
    profile.company_name ? `Company: ${profile.company_name}` : "",
    profile.company_description ? `About: ${profile.company_description}` : "",
    profile.brand_personality
      ? `Brand personality: ${profile.brand_personality}`
      : "",
    profile.target_audience
      ? `Target audience: ${profile.target_audience}`
      : "",
    profile.preferred_style ? `Visual style: ${profile.preferred_style}` : "",
    profile.brand_colors
      ? `Brand colors: primary ${(profile.brand_colors as Record<string, string>).primary ?? "#2563eb"}, secondary ${(profile.brand_colors as Record<string, string>).secondary ?? "#0f172a"}`
      : "",
  ]
    .filter(Boolean)
    .join(". ");

  let prompt = template
    .replace("{property_details}", propertyParts)
    .replace(
      "{briefing}",
      briefingParts || "Modern professional real estate brand"
    )
    .replace("{format}", format);

  prompt +=
    " The image must be photorealistic, high resolution, professional marketing material with clean layout and bold typography. No watermarks. No blurry elements.";

  return prompt;
}

async function callGeminiImage(
  apiKey: string,
  prompt: string,
  variationHint: string
): Promise<string | null> {
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      // @ts-expect-error — responseModalities supported by API but not yet in SDK types
      responseModalities: ["IMAGE", "TEXT"],
    },
  });

  const fullPrompt = `${prompt}\n\nGenerate a unique creative variation (${variationHint}). Make it visually distinct from other variations while keeping the same brand and property context.`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) return null;

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      return part.inlineData.data as string;
    }
  }

  return null;
}

async function callGeminiCopy(
  apiKey: string,
  property: PropertyRow,
  category: CategoryRow,
  profile: ProfileBriefing
): Promise<string | null> {
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const price = property.price_cents
    ? `R$ ${(property.price_cents / 100).toLocaleString("pt-BR")}`
    : "";

  const prompt = `Você é um copywriter especialista em marketing imobiliário brasileiro.
Crie uma copy para postagem em redes sociais (Instagram/Facebook) para o seguinte imóvel:

Tipo: ${property.type}
Título: ${property.title}
${property.city ? `Cidade: ${property.city}` : ""}
${property.state ? `Estado: ${property.state}` : ""}
${price ? `Preço: ${price}` : ""}
${property.bedrooms ? `Quartos: ${property.bedrooms}` : ""}
${property.bathrooms ? `Banheiros: ${property.bathrooms}` : ""}
${property.area_sqm ? `Área: ${property.area_sqm}m²` : ""}
${property.highlights?.length ? `Diferenciais: ${property.highlights.join(", ")}` : ""}

Categoria/Estilo: ${category.label}
${profile.company_name ? `Imobiliária: ${profile.company_name}` : ""}
${profile.brand_personality ? `Tom da marca: ${profile.brand_personality}` : ""}
${profile.target_audience ? `Público-alvo: ${profile.target_audience}` : ""}

Regras:
- Escreva em português brasileiro
- Use emojis relevantes (🏠 🌊 🏢 🌴 etc)
- Inclua 3-5 hashtags relevantes no final
- Seja persuasivo mas profissional
- Máximo 300 caracteres no corpo principal (sem contar hashtags)
- Inclua um CTA (chamada para ação) no final antes das hashtags
- Formato: texto principal + linha em branco + CTA + linha em branco + hashtags`;

  const result = await model.generateContent(prompt);
  const response = result.response;

  return response.text() || null;
}

async function uploadToStorage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  groupId: string,
  variationNumber: number,
  base64Data: string
): Promise<string | null> {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    const path = `${userId}/${groupId}_v${variationNumber}.png`;

    const { error } = await supabase.storage
      .from("creatives")
      .upload(path, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return `data:image/png;base64,${base64Data}`;
    }

    const { data: urlData } = supabase.storage
      .from("creatives")
      .getPublicUrl(path);

    return urlData?.publicUrl ?? `data:image/png;base64,${base64Data}`;
  } catch (err) {
    console.error("Upload error:", err);
    return `data:image/png;base64,${base64Data}`;
  }
}
