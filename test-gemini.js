const fs = require('fs');
const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_KEY_HERE';
const MODEL = 'gemini-3-pro-image-preview';

async function run() {
  const imgBuf = fs.readFileSync('c:/Projeto-claude-code/CrativImob/FOTOS/teset-input.jpg');
  const b64 = imgBuf.toString('base64');

  const prompt = `Create a modern real estate advertisement overlay on top of this property image. Keep the original photo fully visible as background.

Property: Lancamento Predio Residencial Vila das Flores, Betim/MG, R$199.900. 3 quartos, sala, cozinha, banheiro, 2 vagas.

Headline: Seu Novo Lar em Betim
CTA: Saiba Mais

Format: 1:1 Instagram post. Professional gradient overlay, bold typography, real estate marketing style. DO NOT distort or alter the original photo. High resolution, ultra-detailed, professional graphic design, sharp text, perfect composition.`;

  const body = {
    contents: [{
      role: 'user',
      parts: [
        { inline_data: { mime_type: 'image/jpeg', data: b64 } },
        { text: prompt }
      ]
    }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      imageConfig: { aspectRatio: '1:1', imageSize: '2K' }
    }
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000)
    }
  );

  const json = await res.json();
  const parts = json.candidates?.[0]?.content?.parts ?? [];

  let imageSaved = false;
  for (const p of parts) {
    if (p.inlineData?.mimeType?.startsWith('image/')) {
      fs.writeFileSync('c:/Projeto-claude-code/CrativImob/FOTOS/test-output.png', Buffer.from(p.inlineData.data, 'base64'));
      console.log('SUCESSO! Imagem salva em FOTOS/test-output.png');
      imageSaved = true;
      break;
    }
    if (p.text) console.log('Texto:', p.text.slice(0, 200));
  }

  if (!imageSaved) {
    console.log('Status HTTP:', res.status);
    console.log('Resposta:', JSON.stringify(json).slice(0, 1000));
  }
}

run().catch(console.error);
