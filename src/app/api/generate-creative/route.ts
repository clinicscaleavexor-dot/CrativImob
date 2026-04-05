import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
  company_logo_url: string | null;
};
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

// Model names
const FLASH_MODEL = "gemini-2.5-flash-image";
const PRO_MODEL = "gemini-3.1-flash-image-preview";

// ---------- POST Handler ----------

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await request.json()) as Record<string, any>;
    const {
      property_id,
      prompt: userPrompt,
      format,
      creative_type,
      headline,
      copy_text,
      cta_text,
      model,
    } = body;

    if (!property_id || !userPrompt || !format) {
      return NextResponse.json(
        { error: "Parametros obrigatorios ausentes (property_id, prompt, format)" },
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
        { error: "Imovel nao encontrado" },
        { status: 404 }
      );
    }

    // 4. Profile briefing
    const { data: profileRaw } = await db
      .from("profiles")
      .select(
        "company_name,company_description,brand_personality,target_audience,preferred_style,company_logo_url"
      )
      .eq("id", user.id)
      .single();

    const profile = (profileRaw as ProfileBriefing | null) ?? {
      company_name: null,
      company_description: null,
      brand_personality: null,
      target_audience: null,
      preferred_style: null,
      company_logo_url: null,
    };

    // 5. Debit 1 credit
    await db
      .from("credits")
      .update({ balance: creditsRow.balance - 1 })
      .eq("user_id", user.id);

    await db.from("credits_transactions").insert({
      user_id: user.id,
      amount: -1,
      type: "debit",
      description: `Geracao de criativo: ${property.title} (${format})`,
    });

    // 6. Fetch property photo + logo as base64 for multimodal input
    const propertyPhotoUrl = property.images?.[0] ?? null;
    const logoUrl = profile.company_logo_url ?? null;

    const [propertyPhotoPart, logoPart] = await Promise.all([
      propertyPhotoUrl ? fetchImageAsBase64(propertyPhotoUrl) : Promise.resolve(null),
      logoUrl ? fetchImageAsBase64(logoUrl) : Promise.resolve(null),
    ]);

    const hasPhoto = propertyPhotoPart !== null;

    // 7. Build final image prompt from user input + attachment hints
    const formatConfig = FORMAT_CONFIGS[format] ?? FORMAT_CONFIGS["1080x1080"];
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Chave da API de IA nao configurada" },
        { status: 500 }
      );
    }

    let finalPrompt = userPrompt as string;

    if (hasPhoto) {
      finalPrompt +=
        "\n\nIMPORTANT: The first attached image is a REAL PHOTO of this property. Use it as the main background/hero image for the creative. Apply professional color grading, overlay the text elements (headline, price, CTA) on top with a semi-transparent overlay to ensure readability. Do NOT replace this photo with an AI-generated image - use the actual photo provided.";
    }

    if (logoPart !== null) {
      finalPrompt +=
        "\n\nThe second attached image is the company LOGO. Place it in the bottom-right corner of the creative as a brand watermark. Keep it small (roughly 10-15% of image width), with slight transparency so it does not overpower the design.";
    }

    finalPrompt +=
      "\n\nThe final image must be high resolution, professional marketing material with clean layout and bold typography. No watermarks other than the provided logo. No blurry elements.";

    console.log("[Gemini] finalPrompt:", finalPrompt);

    // 8. IMAGE GENERATION
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

    // If AI failed but property has additional photos, continue with mockups only
    const hasAdditionalPhotos = (property.images?.length ?? 0) > 1;
    if (!image1 && !hasAdditionalPhotos) {
      console.error("AI image generation failed and no additional photos for mockups. Error:", imageGenError);
      return NextResponse.json(
        { error: `Falha na geracao de imagem pela IA: ${imageGenError ?? "sem imagem retornada"}` },
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

    // 9. Upload images to Supabase Storage and create creative records
    const imageUrls: (string | null)[] = [];
    const creativeIds: string[] = [];
    const modelUsed = aiModelUsed ?? FLASH_MODEL;

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

async function callGeminiImage(
  apiKey: string,
  prompt: string,
  imageParts: ImagePart[],
  aspectRatio: "1:1" | "9:16" | "16:9",
  modelPreference?: string
): Promise<GeneratedImage> {
  const primaryModel = modelPreference === "pro" ? PRO_MODEL : FLASH_MODEL;
  const fallbackModel = modelPreference === "pro" ? FLASH_MODEL : PRO_MODEL;
  const models = [primaryModel, fallbackModel];
  const primaryImagePart = imageParts[0] ?? null;
  let lastError: string | null = null;

  // Attempt 1: generateImages endpoint
  for (const modelName of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateImages?key=${apiKey}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestBody: Record<string, any> = {
      prompt,
      outputOptions: {
        numberOfImages: 1,
        aspectRatio,
        outputMimeType: "image/jpeg",
      },
    };

    if (primaryImagePart) {
      requestBody.imageContext = {
        referenceImages: [
          {
            image: {
              imageBytes: primaryImagePart.inlineData.data,
              mimeType: primaryImagePart.inlineData.mimeType,
            },
          },
        ],
      };
    }

    try {
      console.log(`callGeminiImage (generateImages): trying model ${modelName}`);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(50000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`callGeminiImage ${modelName} generateImages HTTP ${res.status}:`, errText);
        lastError = `${modelName} generateImages HTTP ${res.status}: ${errText.slice(0, 200)}`;
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json: any = await res.json();
      const imageBytes = json.generatedImages?.[0]?.image?.imageBytes;
      if (imageBytes) {
        console.log(`callGeminiImage: success with model ${modelName} (generateImages)`);
        return { base64: imageBytes as string, model: modelName };
      }

      console.error(`callGeminiImage ${modelName}: generateImages had no image data`, JSON.stringify(json).slice(0, 500));
      lastError = `${modelName}: generateImages no image in response`;
    } catch (err) {
      console.error(`callGeminiImage ${modelName} generateImages error:`, err);
      lastError = `${modelName} generateImages: ${String(err)}`;
    }
  }

  // Attempt 2: generateContent fallback (multimodal with responseModalities)
  for (const modelName of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
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

    try {
      console.log(`callGeminiImage (generateContent fallback): trying model ${modelName}`);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(50000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`callGeminiImage ${modelName} generateContent HTTP ${res.status}:`, errText);
        lastError = `${modelName} generateContent HTTP ${res.status}: ${errText.slice(0, 200)}`;
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json: any = await res.json();
      const candidates = json.candidates;
      if (!candidates?.[0]?.content?.parts) {
        console.error(`callGeminiImage ${modelName} generateContent: no parts`, JSON.stringify(json).slice(0, 500));
        lastError = `${modelName} generateContent: no parts in response`;
        continue;
      }

      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          console.log(`callGeminiImage: success with model ${modelName} (generateContent)`);
          return { base64: part.inlineData.data as string, model: modelName };
        }
      }

      console.error(`callGeminiImage ${modelName} generateContent: no image in parts`);
      lastError = `${modelName} generateContent: no image in response parts`;
    } catch (err) {
      console.error(`callGeminiImage ${modelName} generateContent error:`, err);
      lastError = `${modelName} generateContent: ${String(err)}`;
    }
  }

  throw new Error(lastError ?? "All image models failed");
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