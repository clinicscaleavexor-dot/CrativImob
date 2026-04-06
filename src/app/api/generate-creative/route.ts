import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateMockup, generateMockupFromBase64 } from "@/lib/make-mockup";

// Extend Vercel serverless function timeout to 60s for AI image generation
export const maxDuration = 60;

// ---------- Types ----------

type CreditsRow = { balance: number };
type ProfileRow = {
  company_name: string | null;
  company_description: string | null;
  brand_personality: string | null;
  target_audience: string | null;
  preferred_style: string | null;
  company_logo_url: string | null;
  brand_colors: { primary?: string; secondary?: string; accent?: string } | null;
};
type PromptRow = { prompt_template: string; label?: string };
type CreativeId = { id: string };
type ImagePart = { inlineData: { mimeType: string; data: string } };
type GeneratedImage = { base64: string; model: string };

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
      "Composicao pensada para feed, com equilibrio central, boa leitura em miniatura e margem segura para textos e CTA.",
  },
  "1080x1920": {
    label: "Stories vertical",
    size: "1080x1920",
    aspectRatio: "9:16",
    layoutInstruction:
      "Composicao vertical para stories, com elementos principais concentrados no centro e espaco respirando no topo e no rodape.",
  },
  "1200x628": {
    label: "Anuncio horizontal",
    size: "1200x628",
    aspectRatio: "16:9",
    layoutInstruction:
      "Composicao horizontal para midia paga, preservando area segura central para possivel recorte em 1200x628 e leitura rapida do texto.",
  },
};

// Model names — gemini-2.5-flash-image is confirmed working, always try first
const PRIMARY_FLASH_MODEL = "gemini-2.5-flash-image";
const SECONDARY_FLASH_MODEL = "gemini-3.1-flash-image-preview";
const PRO_MODEL = "gemini-3-pro-image-preview";

// ---------- POST Handler ----------

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await request.json()) as Record<string, any>;
    const {
      // New flow fields
      style_category_id,
      property_info,
      primary_images,   // Array<{base64: string, mime_type: string}>
      secondary_images, // Array<{base64: string, mime_type: string}>
      // Legacy fields (keep for backward compat)
      property_id,
      prompt: userPrompt,
      image_base64,
      image_mime_type,
      // Shared fields
      format,
      creative_type,
      headline,
      copy_text,
      cta_text,
      model,
    } = body;

    // Detect which flow we're in
    const isNewFlow =
      property_info !== undefined ||
      (Array.isArray(primary_images) && primary_images.length > 0);

    if (!format) {
      return NextResponse.json(
        { error: "Parametro obrigatorio ausente (format)" },
        { status: 400 }
      );
    }

    if (!isNewFlow && !userPrompt) {
      return NextResponse.json(
        { error: "Parametros obrigatorios ausentes (prompt ou property_info)" },
        { status: 400 }
      );
    }

    const supabaseAuth = await createClient();
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // 1. Auth (use cookie-based client to read JWT)
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
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
        { error: "Creditos insuficientes" },
        { status: 402 }
      );
    }

    // 3. Profile (includes brand colors and logo)
    const { data: profileRaw } = await db
      .from("profiles")
      .select(
        "company_name,company_description,brand_personality,target_audience,preferred_style,company_logo_url,brand_colors"
      )
      .eq("id", user.id)
      .single();

    const profile = (profileRaw as ProfileRow | null) ?? {
      company_name: null,
      company_description: null,
      brand_personality: null,
      target_audience: null,
      preferred_style: null,
      company_logo_url: null,
      brand_colors: null,
    };

    const logoUrl = profile.company_logo_url ?? null;

    // 4. Debit 1 credit
    const { error: creditError } = await db
      .from("credits")
      .update({ balance: creditsRow.balance - 1 })
      .eq("user_id", user.id);

    if (creditError) {
      console.error("[credits] deduction failed:", creditError);
    }

    const { error: txError } = await db.from("credits_transactions").insert({
      user_id: user.id,
      amount: -1,
      type: "debit",
      description: `Geracao de criativo (${format})`,
    });

    if (txError) {
      console.error("[credits_transactions] insert failed:", txError);
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Chave da API de IA nao configurada" },
        { status: 500 }
      );
    }

    const formatConfig = FORMAT_CONFIGS[format] ?? FORMAT_CONFIGS["1080x1080"];

    // ---------- NEW FLOW ----------
    if (isNewFlow) {
      // 5a. Fetch Prompt Padrão
      const { data: promptPadraoRaw } = await db
        .from("prompt_categories")
        .select("prompt_template")
        .eq("slug", "prompt-padrao")
        .single();

      const promptPadrao = (promptPadraoRaw as PromptRow | null)?.prompt_template ?? "";

      // 5b. Fetch style prompt (if selected)
      let stylePrompt = "";
      if (style_category_id) {
        const { data: styleRaw } = await db
          .from("prompt_categories")
          .select("prompt_template, label")
          .eq("id", style_category_id)
          .eq("is_active", true)
          .single();

        if (styleRaw) {
          stylePrompt = (styleRaw as PromptRow).prompt_template;
        }
      }

      // 5c. Compose final prompt
      const parts: string[] = [];

      if (promptPadrao) parts.push(promptPadrao);
      if (stylePrompt) parts.push(stylePrompt);

      if (property_info) {
        parts.push(`Informacoes do imovel: ${property_info as string}`);
      }

      const colors = profile.brand_colors;
      if (colors) {
        const colorParts = [
          colors.primary && `primaria ${colors.primary}`,
          colors.secondary && `secundaria ${colors.secondary}`,
          colors.accent && `accent ${colors.accent}`,
        ].filter(Boolean);
        if (colorParts.length > 0) {
          parts.push(`Cores da marca: ${colorParts.join(", ")}.`);
        }
      }

      parts.push(
        `Formato: ${formatConfig.label}. ${formatConfig.layoutInstruction}`
      );

      if (headline) parts.push(`Headline: ${headline as string}`);
      if (copy_text) parts.push(`Descricao: ${copy_text as string}`);
      if (cta_text) parts.push(`CTA: ${cta_text as string}`);

      // Build primary image parts for Gemini
      const primaryImageParts: ImagePart[] = [];
      if (Array.isArray(primary_images)) {
        for (const img of (primary_images as { base64: string; mime_type: string }[]).slice(0, 3)) {
          if (img.base64 && img.mime_type) {
            primaryImageParts.push({
              inlineData: { mimeType: img.mime_type, data: img.base64 },
            });
          }
        }
      }

      if (primaryImageParts.length > 0) {
        parts.push(
          "IMPORTANT: The attached image(s) show the real property. Use them as the main background/hero for the creative. Apply professional color grading and overlay text elements on top. Do NOT replace these photos with AI-generated images."
        );
      }

      if (logoUrl) {
        parts.push(
          "IMPORTANT: One of the attached images is the company logo. Place it in the bottom-right corner as a small brand watermark (~10% width), slightly transparent."
        );
      }

      const finalPrompt = parts.join("\n\n");
      console.log("[Gemini] new-flow finalPrompt length:", finalPrompt.length);

      // Fetch logo for Gemini if available
      const logoPart = logoUrl ? await fetchImageAsBase64(logoUrl) : null;

      const allImageParts: ImagePart[] = [...primaryImageParts];
      if (logoPart) allImageParts.push(logoPart);

      // 6a. Generate AI image
      const variationGroupId = crypto.randomUUID();
      let aiImage: string | null = null;
      let aiModelUsed: string | null = null;
      let imageGenError: string | null = null;

      try {
        const result = await callGeminiImage(
          geminiApiKey,
          finalPrompt,
          allImageParts,
          formatConfig.aspectRatio,
          model as string | undefined
        );
        aiImage = result.base64;
        aiModelUsed = result.model;
      } catch (err) {
        imageGenError = String(err);
        console.error("AI image generation failed:", err);
      }

      // 6b. Generate mockups for secondary images
      const secondaryList = Array.isArray(secondary_images)
        ? (secondary_images as { base64: string; mime_type: string }[]).slice(0, 4)
        : [];

      const mockupResults = await Promise.allSettled(
        secondaryList.map((img) =>
          generateMockupFromBase64(img.base64, logoUrl, null, format as string)
        )
      );

      // If AI completely failed and no mockups at all, return error
      const hasMockups = mockupResults.some((r) => r.status === "fulfilled");
      if (!aiImage && !hasMockups) {
        return NextResponse.json(
          {
            error: `Falha na geracao de imagem pela IA: ${imageGenError ?? "sem imagem retornada"}`,
          },
          { status: 500 }
        );
      }

      // 7. Upload and save
      const imageUrls: (string | null)[] = [];
      const creativeIds: string[] = [];
      const modelUsed = aiModelUsed ?? PRIMARY_FLASH_MODEL;

      const allImages: { base64: string | null; isMockup: boolean }[] = [
        { base64: aiImage, isMockup: false },
        ...mockupResults.map((r) => ({
          base64: r.status === "fulfilled" ? r.value : null,
          isMockup: true,
        })),
      ];

      for (let i = 0; i < allImages.length; i++) {
        const { base64: imageBase64, isMockup } = allImages[i];
        let imageUrl: string | null = null;

        if (imageBase64) {
          imageUrl = await uploadToStorage(db, user.id, variationGroupId, i + 1, imageBase64);
        }

        const { data: creativeRaw, error: createError } = await db
          .from("creatives")
          .insert({
            user_id: user.id,
            property_id: null,
            template_id: null,
            format,
            type: creative_type ?? "post",
            status: imageUrl ? "completed" : "failed",
            title: property_info ? (property_info as string).slice(0, 80) : `Criativo ${format}`,
            headline: headline ?? "",
            copy_text: copy_text ?? "",
            cta_text: cta_text ?? "Saiba mais",
            image_url: imageUrl,
            original_image_url: null,
            ai_prompt: isMockup ? null : finalPrompt,
            generated_copy: null,
            variation_number: i + 1,
            variation_group_id: variationGroupId,
            ai_metadata: {
              model: isMockup ? "mockup" : modelUsed,
              has_logo: logoPart !== null,
              is_mockup: isMockup,
              selected_format: format,
              selected_aspect_ratio: formatConfig.aspectRatio,
              style_category_id: style_category_id ?? null,
            },
          })
          .select("id")
          .single();

        const creative = creativeRaw as CreativeId | null;
        if (createError) {
          console.error("[creatives] insert failed (new-flow):", createError);
        }
        if (!createError && creative) creativeIds.push(creative.id);
        imageUrls.push(imageUrl);
      }

      return NextResponse.json({
        success: true,
        creative_ids: creativeIds,
        image_urls: imageUrls,
        generated_copy: null,
        variation_group_id: variationGroupId,
        status: imageUrls.some((u) => u !== null) ? "completed" : "failed",
      });
    }

    // ---------- LEGACY FLOW (prompt + optional property_id) ----------

    // 5. Property (optional)
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

    let property: PropertyRow | null = null;
    if (property_id) {
      const { data: propertyRaw, error: propError } = await db
        .from("properties")
        .select(
          "id,title,type,city,state,price_cents,bedrooms,bathrooms,area_sqm,highlights,location,images,image_labels"
        )
        .eq("id", property_id)
        .eq("user_id", user.id)
        .single();

      property = propertyRaw as PropertyRow | null;

      if (propError || !property) {
        return NextResponse.json({ error: "Imovel nao encontrado" }, { status: 404 });
      }
    }

    const propertyPhotoUrl = property?.images?.[0] ?? null;

    let propertyPhotoPart: ImagePart | null = null;
    if (image_base64 && image_mime_type) {
      propertyPhotoPart = {
        inlineData: { mimeType: image_mime_type as string, data: image_base64 as string },
      };
    }

    const [fetchedPhotoPart, logoPart] = await Promise.all([
      !propertyPhotoPart && propertyPhotoUrl
        ? fetchImageAsBase64(propertyPhotoUrl)
        : Promise.resolve(null),
      logoUrl ? fetchImageAsBase64(logoUrl) : Promise.resolve(null),
    ]);

    if (!propertyPhotoPart && fetchedPhotoPart) {
      propertyPhotoPart = fetchedPhotoPart;
    }

    const hasPhoto = propertyPhotoPart !== null;

    let finalPrompt = userPrompt as string;

    if (hasPhoto) {
      finalPrompt +=
        "\n\nIMPORTANT: The first attached image is a REAL PHOTO of this property. Use it as the main background/hero image for the creative. Apply professional color grading, overlay the text elements (headline, price, CTA) on top with a semi-transparent overlay to ensure readability. Do NOT replace this photo with an AI-generated image.";
    }

    if (logoPart !== null) {
      finalPrompt +=
        "\n\nThe second attached image is the company LOGO. Place it in the bottom-right corner of the creative as a brand watermark. Keep it small (roughly 10-15% of image width), with slight transparency.";
    }

    finalPrompt +=
      "\n\nThe final image must be high resolution, professional marketing material with clean layout and bold typography. No watermarks other than the provided logo.";

    console.log("[Gemini] legacy finalPrompt:", finalPrompt);

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
        finalPrompt,
        imageParts,
        formatConfig.aspectRatio,
        model as string | undefined
      );
      image1 = aiImageResult.base64;
      aiModelUsed = aiImageResult.model;
    } catch (err) {
      imageGenError = String(err);
      console.error("AI image generation failed:", err);
    }

    const hasAdditionalPhotos = (property?.images?.length ?? 0) > 1;
    if (!image1 && !hasAdditionalPhotos) {
      return NextResponse.json(
        {
          error: `Falha na geracao de imagem pela IA: ${imageGenError ?? "sem imagem retornada"}`,
        },
        { status: 500 }
      );
    }

    const additionalPhotos: { url: string; label: string | null }[] = [];
    if (property?.images && property.images.length > 1) {
      for (let i = 1; i < property.images.length; i++) {
        const photoUrl = property.images[i];
        const label = property.image_labels?.[i] ?? null;
        if (photoUrl) additionalPhotos.push({ url: photoUrl, label });
      }
    }

    const mockupBase64Results = await Promise.allSettled(
      additionalPhotos.map(({ url, label }) => generateMockup(url, logoUrl, label, format))
    );

    const imageUrls: (string | null)[] = [];
    const creativeIds: string[] = [];
    const modelUsed = aiModelUsed ?? PRIMARY_FLASH_MODEL;

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
        imageUrl = await uploadToStorage(db, user.id, variationGroupId, i + 1, imageBase64);
      }

      const { data: creativeRaw, error: createError } = await db
        .from("creatives")
        .insert({
          user_id: user.id,
          property_id: property_id ?? null,
          template_id: null,
          format,
          type: creative_type ?? "post",
          status: imageUrl ? "completed" : "failed",
          headline: headline ?? "",
          copy_text: copy_text ?? "",
          cta_text: cta_text ?? "Saiba mais",
          image_url: imageUrl,
          original_image_url: propertyPhotoUrl,
          ai_prompt: isMockup ? null : finalPrompt,
          generated_copy: null,
          variation_number: i + 1,
          variation_group_id: variationGroupId,
          ai_metadata: {
            user_prompt: isMockup ? null : (userPrompt as string),
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
      if (createError) {
        console.error("[creatives] insert failed (legacy-flow):", createError);
      }
      if (!createError && creative) creativeIds.push(creative.id);
      imageUrls.push(imageUrl);
    }

    return NextResponse.json({
      success: true,
      creative_ids: creativeIds,
      image_urls: imageUrls,
      generated_copy: null,
      variation_group_id: variationGroupId,
      status: imageUrls.some((u) => u !== null) ? "completed" : "failed",
    });
  } catch (err) {
    console.error("generate-creative error:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
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

async function callGeminiImage(
  apiKey: string,
  prompt: string,
  imageParts: ImagePart[],
  aspectRatio: "1:1" | "9:16" | "16:9",
  modelPreference?: string
): Promise<GeneratedImage> {
  const models =
    modelPreference === "pro"
      ? [PRO_MODEL, PRIMARY_FLASH_MODEL, SECONDARY_FLASH_MODEL]
      : [PRIMARY_FLASH_MODEL, SECONDARY_FLASH_MODEL, PRO_MODEL];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [
    ...imageParts.map((ip) => ({ inlineData: ip.inlineData })),
    { text: prompt },
  ];
  const requestBody = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"],
      imageConfig: { aspectRatio },
    },
  };

  let lastError = "All image models failed";

  for (const modelName of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    try {
      console.log(`callGeminiImage: trying model ${modelName}`);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(18000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`callGeminiImage ${modelName} HTTP ${res.status}:`, errText);
        lastError = `${modelName} HTTP ${res.status}: ${errText.slice(0, 200)}`;
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json: any = await res.json();
      const responseParts = json.candidates?.[0]?.content?.parts;
      if (!responseParts) {
        console.error(
          `callGeminiImage ${modelName}: no parts`,
          JSON.stringify(json).slice(0, 500)
        );
        lastError = `${modelName}: no parts in response`;
        continue;
      }

      for (const part of responseParts) {
        if (part.thought) continue;
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          console.log(`callGeminiImage: success with model ${modelName}`);
          return { base64: part.inlineData.data as string, model: modelName };
        }
      }

      console.error(`callGeminiImage ${modelName}: no image in parts`);
      lastError = `${modelName}: no image in response parts`;
    } catch (err) {
      console.error(`callGeminiImage ${modelName} error:`, err);
      lastError = `${modelName}: ${String(err)}`;
    }
  }

  throw new Error(lastError);
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
      .upload(path, buffer, { contentType: "image/png", upsert: true });

    if (error) {
      console.error("Storage upload error:", error);
      return `data:image/png;base64,${base64Data}`;
    }

    const { data: urlData } = supabase.storage.from("creatives").getPublicUrl(path);
    return urlData?.publicUrl ?? `data:image/png;base64,${base64Data}`;
  } catch (err) {
    console.error("Upload error:", err);
    return `data:image/png;base64,${base64Data}`;
  }
}
