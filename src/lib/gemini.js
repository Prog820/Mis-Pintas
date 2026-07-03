const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`

// Convierte un archivo a base64
async function archivoABase64(archivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(archivo)
  })
}

// Describe una prenda a partir de su foto
export async function describirPrenda(archivo) {
  const base64 = await archivoABase64(archivo)

  for (let intento = 0; intento < 3; intento++) {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: {
                mime_type: archivo.type,
                data: base64,
              }
            },
            {
              text: `Describe esta prenda de ropa en detalle para usarla en un sistema de recomendación de outfits.
Incluye: tipo de prenda, color exacto, material si se puede inferir, fit (ajustado/suelto/regular), largo, estilo (casual/formal/deportivo/etc), y cualquier detalle relevante como estampados, texturas, bordados o detalles especiales.
Responde en español, en máximo 6 oraciones, de forma descriptiva y precisa. La respuesta tiene que ser extremadamente detallada, llegando a describir incluso los detalles más pequeños de la prenda. No incluyas opiniones ni sugerencias de uso, solo descripción objetiva.`
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      const error = await response.text()

      if (response.status === 503 && intento < 2) {
        console.log(`Gemini ocupado. Reintentando (${intento + 1}/3)...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        continue
      }

      console.error("ERROR DE GEMINI:", error)
      throw new Error(error)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }

  throw new Error("No se pudo obtener una respuesta de Gemini.")
}

// Sugiere un outfit basado en descripciones de prendas y una foto de inspo
export async function sugerirOutfit(prendas, inspoBase64, inspoMimeType, ocasiones) {
  const listaPrendas = prendas.map(p => `- ${p.categoria}: ${p.nombre} — ${p.descripcion_ia || 'sin descripción'}`).join('\n')

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: inspoMimeType,
              data: inspoBase64,
            }
          },
          {
            text: `Eres un estilista profesional especializado en crear outfits equilibrados.

Analiza cuidadosamente la foto de inspiración, la ocasión y las prendas disponibles.

No es obligatorio usar una chaqueta. Solo inclúyela cuando realmente mejore el outfit o sea apropiada para la ocasión o el estilo de la imagen de referencia.

Prioriza que el resultado se parezca visualmente a la inspiración utilizando únicamente las prendas disponibles.

PRENDAS DISPONIBLES:
${listaPrendas}

OCASIÓN: ${ocasiones.join(', ')}

Responde ÚNICAMENTE en este formato JSON exacto, sin texto adicional:
{
  "top": "nombre exacto de la prenda",
  "chaqueta": "nombre exacto de la prenda o 'ninguna'",
  "pantalon": "nombre exacto de la prenda",
  "bolso": "nombre exacto de la prenda",
  "zapatos": "nombre exacto de la prenda",
  "accesorio": "nombre exacto de la prenda",
  "explicacion": "explicación breve en 2-3 oraciones de por qué este outfit combina con la inspiración"
}

Si la pinta no necesita una chaqueta, responde exactamente:

"chaqueta": "ninguna"

Nunca inventes prendas que no estén en la lista disponible. Usa únicamente los nombres exactos proporcionados.`
          }
        ]
      }]
    })
  })

  if (!response.ok) throw new Error('Error sugiriendo outfit')

  const data = await response.json()
  const texto = data.candidates[0].content.parts[0].text
  const clean = texto.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
