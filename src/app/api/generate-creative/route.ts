import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateMockup } from "@/lib/make-mockup";

// Extend Vercel serverless function timeout to 60s for AI image generation
export const maxDuration = 60;

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
  images: string[] | null;
  image_labels: string[] | null;
};
type ProfileBriefing = {
  company_name: string | null;
  company_description: string | null;
  brand_personality: string | null;
  target_audience: string | null;
  preferred_style: string | null;
  brand_colors: Record<string, string> | null;
  company_logo_url: string | null;
};
type CategoryRow = {
  id: string;
  slug: string;
  label: string;
  prompt_template: string;
};
type CreativeId = { id: string };
type ImagePart = { inlineData: { mimeType: string; data: string } };
type GeneratedImage = { base64: string; model: string };

const DEFAULT_PROMPT_SLUG = "prompt-padrao";

const FORMAT_CONFIGS: Record<
  string,
  {
    label: string;
    size: string;
    aspectRatio: "1:1" | "9:16" | "16:9";
    layoutInstruction: string;
  }
> = {
  "1080x1080": {
    label: "Feed quadrado",
    size: "1080x1080",
    aspectRatio: "1:1",
    layoutInstruction:
      "Composição pensada para feed, com equilíbrio central, boa leitura em miniatura e margem segura para textos e CTA.",
  },
  "1080x1920": {
    label: "Stories vertical",
    size: "1080x1920",
    aspectRatio: "9:16",
    layoutInstruction:
      "Composição vertical para stories, com elementos principais concentrados no centro e espaço respirando no topo e no rodapé.",
  },
  "1200x628": {
    label: "Anúncio horizontal",
    size: "1200x628",
    aspectRatio: "16:9",
    layoutInstruction:
      "Composição horizontal para mídia paga, preservando área segura central para possível recorte em 1200x628 e leitura rápida do texto.",
  },
};

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

    // 3. Property (includes images and labels)
    const { data: propertyRaw, error: propError } = await db
      .from("properties")
      .select("id,title,type,city,state,price_cents,bedrooms,bathrooms,area_sqm,highlights,location,images,image_labels")
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

    // 4. Profile briefing (now includes logo)
    const { data: profileRaw } = await db
      .from("profiles")
      .select(
        "company_name,company_description,brand_personality,target_audience,preferred_style,brand_colors,company_logo_url"
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
      company_logo_url: null,
    };

    // 5. Category prompt template + default prompt template
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

    const { data: defaultPromptRaw } = await db
      .from("prompt_categories")
      .select("id,slug,label,prompt_template")
      .eq("slug", DEFAULT_PROMPT_SLUG)
      .eq("is_active", true)
      .maybeSingle();

    const defaultPrompt = defaultPromptRaw as CategoryRow | null;

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

    // 7. Fetch property photo + logo as base64 for multimodal input
    const propertyPhotoUrl = property.images?.[0] ?? null;
    const logoUrl = profile.company_logo_url ?? null;

    const [propertyPhotoPart, logoPart] = await Promise.all([
      propertyPhotoUrl ? fetchImageAsBase64(propertyPhotoUrl) : Promise.resolve(null),
      logoUrl ? fetchImageAsBase64(logoUrl) : Promise.resolve(null),
    ]);

    const hasPhoto = propertyPhotoPart !== null;

    // 8. HEADLINE/COPY GENERATION STEP (dedicated, before image)
    const formatConfig = FORMAT_CONFIGS[format] ?? FORMAT_CONFIGS["1080x1080"];
    let finalHeadline = headline ?? "";
    let finalCopy = copy_text ?? "";
    let generatedCopy: string | null = null;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Chave da API de IA não configurada" },
        { status: 500 }
      );
    }
    if (!finalHeadline || !finalCopy) {
      const copyResult = await callGeminiCopy(geminiApiKey, property, categoryData, profile);
      if (copyResult) {
        // Heuristic: first line = headline, rest = copy
        const [first, ...rest] = copyResult.split("\n").map((s) => s.trim()).filter(Boolean);
        finalHeadline = finalHeadline || first || "";
        finalCopy = finalCopy || rest.join(" ") || copyResult;
        generatedCopy = copyResult;
      }
    }

    // 9. PROMPT LAYERING (faithful to admin/master config)
    const compositePrompt = buildCompositePrompt({
      defaultTemplate: defaultPrompt?.prompt_template ?? "",
      categoryTemplate: categoryData.prompt_template,
      property,
      profile,
      formatId: format,
      formatLabel: `${formatConfig.label} ${formatConfig.size}`,
      aspectRatio: formatConfig.aspectRatio,
      layoutInstruction: formatConfig.layoutInstruction,
      headline: finalHeadline,
      copyText: finalCopy,
      ctaText: cta_text ?? "Saiba mais",
      hasPhoto,
      hasLogo: logoPart !== null,
    });
    // Log the full composite prompt for debugging
    console.log("[Gemini] compositePrompt:", compositePrompt);

    // 10. IMAGE GENERATION (dedicated step, after headline/copy)
    const variationGroupId = crypto.randomUUID();
    const imageParts: ImagePart[] = [];
    if (propertyPhotoPart) imageParts.push(propertyPhotoPart);
    if (logoPart) imageParts.push(logoPart);
    let image1: string | null = null;
    let aiModelUsed: string | null = null;
    let imageGenError: string | null = null;
    try {
      const aiImageResult = await callGeminiImage(
        geminiApiKey,
        compositePrompt,
        "Professional marketing creative with clean layout",
        imageParts,
        formatConfig.aspectRatio
      );
      image1 = aiImageResult.base64;
      aiModelUsed = aiImageResult.model;
    } catch (err) {
      imageGenError = String(err);
      console.error("AI image generation failed:", err);
    }

    // If AI failed but property has additional photos, continue with mockups only
    const hasAdditionalPhotos = (property.images?.length ?? 0) > 1;
    if (!image1 && !hasAdditionalPhotos) {
      console.error("AI image generation failed and no additional photos for mockups. Error:", imageGenError);
      return NextResponse.json(
        { error: `Falha na geração de imagem pela IA: ${imageGenError ?? "sem imagem retornada"}` },
        { status: 500 }
      );
    }
    if (!image1) {
      console.warn("AI image generation failed but continuing with mockups. Error:", imageGenError);
    }

    // Generate mockups for additional labeled photos (photos index 1+)
    const additionalPhotos: { url: string; label: string | null }[] = [];
    if (property.images && property.images.length > 1) {
      for (let i = 1; i < property.images.length; i++) {
        const photoUrl = property.images[i];
        const label = property.image_labels?.[i] ?? null;
        if (photoUrl) additionalPhotos.push({ url: photoUrl, label });
      }
    }

    const mockupBase64Results = await Promise.allSettled(
      additionalPhotos.map(({ url, label }) =>
        generateMockup(url, logoUrl, label, format)
      )
    );

    // 10. Upload images to Supabase Storage and create creative records
    // Slot 1: AI-generated image; slots 2+: mockups for labeled photos
    const imageUrls: (string | null)[] = [];
    const creativeIds: string[] = [];
    const modelUsed = aiModelUsed ?? "gemini-3-pro-image-preview";

    // Build unified list: [AI image, ...mockup images]
    const allImages: { base64: string | null; label: string | null; isMockup: boolean }[] = [
      { base64: image1, label: null, isMockup: false },
      ...mockupBase64Results.map((r, i) => ({
        base64: r.status === "fulfilled" ? r.value : null,
        label: additionalPhotos[i]?.label ?? null,
        isMockup: true,
      })),
    ];

    for (let i = 0; i < allImages.length; i++) {
      const { base64: imageBase64, label: roomLabel, isMockup } = allImages[i];
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
          original_image_url: propertyPhotoUrl,
          ai_prompt: isMockup ? null : compositePrompt,
          generated_copy: generatedCopy,
          variation_number: i + 1,
          variation_group_id: variationGroupId,
          ai_metadata: {
            category: categoryData.slug,
            category_label: categoryData.label,
            default_prompt_slug: defaultPrompt?.slug ?? null,
            model: isMockup ? "mockup" : modelUsed,
            has_photo: hasPhoto,
            has_logo: logoPart !== null,
            room_label: roomLabel,
            is_mockup: isMockup,
            selected_format: format,
            selected_aspect_ratio: formatConfig.aspectRatio,
          },
        })
        .select("id")
        .single();

      const creative = creativeRaw as CreativeId | null;
      if (!createError && creative) creativeIds.push(creative.id);
      imageUrls.push(imageUrl);
    }

    return NextResponse.json({
      success: true,
      creative_ids: creativeIds,
      image_urls: imageUrls,
      generated_copy: generatedCopy,
      variation_group_id: variationGroupId,
      status: imageUrls.some((u) => u !== null) ? "completed" : "failed",
      debug_prompt: compositePrompt, // For admin/debugging only
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

async function fetchImageAsBase64(url: string): Promise<ImagePart | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const arrayBuf = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString("base64");
    return { inlineData: { mimeType: contentType, data: base64 } };
  } catch (err) {
    console.error("fetchImageAsBase64 failed:", url, err);
    return null;
  }
}

function buildCompositePrompt({
  defaultTemplate,
  categoryTemplate,
  property,
  profile,
  formatId,
  formatLabel,
  aspectRatio,
  layoutInstruction,
  headline,
  copyText,
  ctaText,
  hasPhoto,
  hasLogo,
}: {
  defaultTemplate: string;
  categoryTemplate: string;
  property: PropertyRow;
  profile: ProfileBriefing;
  formatId: string;
  formatLabel: string;
  aspectRatio: string;
  layoutInstruction: string;
  headline: string;
  copyText: string;
  ctaText: string;
  hasPhoto: boolean;
  hasLogo: boolean;
}): string {
  const price = property.price_cents
    ? `R$ ${(property.price_cents / 100).toLocaleString("pt-BR")}`
    : "";

  const propertyParts = [
    `Property title: ${property.title}`,
    `Property type: ${property.type}`,
    property.city ? `City: ${property.city}` : "",
    property.state ? `State: ${property.state}` : "",
    property.location ? `Location reference: ${property.location}` : "",
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

  const brandBriefing = briefingParts || "Modern professional real estate brand";
  const formatInstructions = `${formatLabel}. Exact output target: ${formatId}. Aspect ratio to honor: ${aspectRatio}. ${layoutInstruction}`;

  const replacements: Record<string, string> = {
    property_details: propertyParts,
    briefing: brandBriefing,
    format: formatInstructions,
    brand_details: brandBriefing,
    selected_size: formatId,
    aspect_ratio: aspectRatio,
    headline: headline || "",
    copy_text: copyText || "",
    cta_text: ctaText || "",
  };

  const renderedDefaultPrompt = renderPromptTemplate(defaultTemplate, replacements);
  const renderedCategoryPrompt = renderPromptTemplate(categoryTemplate, replacements);

  const promptSections = [
    renderedDefaultPrompt
      ? `GLOBAL SYSTEM INSTRUCTIONS:\n${renderedDefaultPrompt}`
      : "",
    renderedCategoryPrompt
      ? `CATEGORY-SPECIFIC INSTRUCTIONS (${categoryTemplate ? "selected category" : ""}):\n${renderedCategoryPrompt}`
      : "",
    `BRAND INFORMATION:\n${brandBriefing}`,
    `PROPERTY DETAILS:\n${propertyParts}`,
    `FORMAT REQUIREMENTS:\n${formatInstructions}`,
    headline ? `HEADLINE TO INCLUDE: \"${headline}\"` : "",
    copyText ? `SUPPORTING DESCRIPTION TO INCLUDE: \"${copyText}\"` : "",
    ctaText ? `CTA TEXT TO INCLUDE: \"${ctaText}\"` : "",
  ].filter(Boolean);

  let prompt = promptSections.join("\n\n");

  if (hasPhoto) {
    prompt +=
      "\n\nIMPORTANT: The first attached image is a REAL PHOTO of this property. Use it as the main background/hero image for the creative. Apply professional color grading, overlay the text elements (headline, price, CTA) on top with a semi-transparent overlay to ensure readability. Do NOT replace this photo with an AI-generated image — use the actual photo provided.";
  }

  if (hasLogo) {
    prompt +=
      "\n\nThe second attached image is the company LOGO. Place it in the bottom-right corner of the creative as a brand watermark. Keep it small (roughly 10-15% of image width), with slight transparency so it doesn't overpower the design.";
  }

  prompt +=
    "\n\nThe final image must be high resolution, professional marketing material with clean layout and bold typography. No watermarks other than the provided logo. No blurry elements.";

  return prompt;
}

function renderPromptTemplate(
  template: string,
  replacements: Record<string, string>
): string {
  if (!template) return "";

  let rendered = template;
  for (const [key, value] of Object.entries(replacements)) {
    rendered = rendered.replaceAll(`{${key}}`, value);
  }

  return rendered;
}


// Model priority: gemini-3.1-flash-image-preview (primary), fallback to gemini-3-pro-image-preview, then gemini-2.5-flash-image
const IMAGE_MODELS = [
  "gemini-3.1-flash-image-preview",
  "gemini-3-pro-image-preview",
  "gemini-2.5-flash-image",
];

async function callGeminiImage(
  apiKey: string,
  prompt: string,
  variationHint: string,
  imageParts: ImagePart[],
  aspectRatio: "1:1" | "9:16" | "16:9"
): Promise<GeneratedImage> {
  const fullPrompt = `${prompt}\n\nGenerate a unique creative variation (${variationHint}). Make it visually distinct from other variations while keeping the same brand and property context.`;

  // Build multimodal content parts: images first, then text
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [
    ...imageParts.map((ip) => ({ inlineData: ip.inlineData })),
    { text: fullPrompt },
  ];

  let lastError: string | null = null;

  for (const modelName of IMAGE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const requestBody = {
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
        imageConfig:
          modelName === "gemini-3-pro-image-preview" ||
          modelName === "gemini-3.1-flash-image-preview"
            ? {
                aspectRatio,
                imageSize: "2K",
              }
            : {
                aspectRatio,
              },
      },
    };

    try {
      console.log(`callGeminiImage: trying model ${modelName}`);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(50000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`callGeminiImage ${modelName} HTTP ${res.status}:`, errText);
        lastError = `${modelName} HTTP ${res.status}: ${errText.slice(0, 200)}`;
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json: any = await res.json();
      const candidates = json.candidates;
      if (!candidates?.[0]?.content?.parts) {
        console.error(`callGeminiImage ${modelName}: no parts in response`, JSON.stringify(json).slice(0, 500));
        lastError = `${modelName}: no parts in response`;
        continue;
      }

      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          console.log(`callGeminiImage: success with model ${modelName}`);
          return {
            base64: part.inlineData.data as string,
            model: modelName,
          };
        }
      }

      console.error(`callGeminiImage ${modelName}: response had parts but no image data`);
      lastError = `${modelName}: no image in response parts`;
    } catch (err) {
      console.error(`callGeminiImage ${modelName} error:`, err);
      lastError = `${modelName}: ${String(err)}`;
    }
  }

  throw new Error(lastError ?? "All image models failed");
}

async function callGeminiCopy(
  apiKey: string,
  property: PropertyRow,
  category: CategoryRow,
  profile: ProfileBriefing
): Promise<string | null> {
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
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
