import sharp from "sharp";

const FORMAT_SIZES: Record<string, { width: number; height: number }> = {
  "1080x1080": { width: 1080, height: 1080 },
  "1080x1920": { width: 1080, height: 1920 },
  "1200x628":  { width: 1200, height: 628 },
};

export async function generateMockup(
  photoUrl: string,
  logoUrl: string | null,
  roomLabel: string | null,
  format: string
): Promise<string> {
  const { width, height } = FORMAT_SIZES[format] ?? FORMAT_SIZES["1080x1080"];

  // 1. Fetch room photo
  const photoRes = await fetch(photoUrl, { signal: AbortSignal.timeout(15000) });
  if (!photoRes.ok) throw new Error(`Falha ao buscar foto: ${photoRes.status}`);
  const photoBuffer = Buffer.from(await photoRes.arrayBuffer());

  return composeMockup(photoBuffer, logoUrl, roomLabel, format, width, height);
}

export async function generateMockupFromBase64(
  photoBase64: string,
  logoUrl: string | null,
  roomLabel: string | null,
  format: string
): Promise<string> {
  const { width, height } = FORMAT_SIZES[format] ?? FORMAT_SIZES["1080x1080"];
  const photoBuffer = Buffer.from(photoBase64, "base64");
  return composeMockup(photoBuffer, logoUrl, roomLabel, format, width, height);
}

async function composeMockup(
  photoBuffer: Buffer,
  logoUrl: string | null,
  roomLabel: string | null,
  format: string,
  width: number,
  height: number
): Promise<string> {

  // 2. Resize/crop background to fill output size
  const bgBuffer = await sharp(photoBuffer)
    .resize(width, height, { fit: "cover", position: "center" })
    .toBuffer();

  // 3. Bottom gradient bar overlay with optional room label
  const barHeight = Math.round(height * 0.20);
  const fontSize = Math.round(barHeight * 0.36);
  const labelText = roomLabel ?? "";

  const overlaySvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.80"/>
      </linearGradient>
    </defs>
    <rect x="0" y="${height - barHeight}" width="${width}" height="${barHeight}" fill="url(#grad)"/>
    ${labelText ? `<text
      x="${Math.round(width * 0.055)}"
      y="${height - Math.round(barHeight * 0.25)}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${fontSize}"
      font-weight="bold"
      fill="white"
      opacity="0.95">${escapeXml(labelText)}</text>` : ""}
  </svg>`;

  const composites: sharp.OverlayOptions[] = [
    { input: Buffer.from(overlaySvg), top: 0, left: 0 },
  ];

  // 4. Logo top-right if provided
  if (logoUrl) {
    try {
      const logoRes = await fetch(logoUrl, { signal: AbortSignal.timeout(10000) });
      if (logoRes.ok) {
        const logoBuffer = Buffer.from(await logoRes.arrayBuffer());
        const logoSize = Math.round(width * 0.18);
        const logoPad = Math.round(width * 0.04);

        const resizedLogo = await sharp(logoBuffer)
          .resize(logoSize, logoSize, { fit: "inside" })
          .png()
          .toBuffer();

        composites.push({
          input: resizedLogo,
          top: logoPad,
          left: width - logoSize - logoPad,
        });
      }
    } catch {
      // logo fetch failed — skip
    }
  }

  // 5. Compose final image
  const finalBuffer = await sharp(bgBuffer)
    .composite(composites)
    .png({ quality: 90 })
    .toBuffer();

  return finalBuffer.toString("base64");
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
