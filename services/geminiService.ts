import { GoogleGenAI, Type, Content } from "@google/genai";
import type { FormState } from '../types';
import { MENTAL_TRIGGERS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateCopywritingTriggers = async (
  formState: FormState,
  selectedTriggers: string[]
): Promise<Record<string, string>> => {
  const { product, audience, benefit, cta, image } = formState;

  const triggerDetails = selectedTriggers.map(key => {
    const trigger = MENTAL_TRIGGERS.find(t => t.key === key);
    return trigger ? `${trigger.name} (${trigger.description})` : key;
  }).join(', ');

  const prompt = `
    Você é um copywriter especialista em marketing digital e psicologia do consumidor, mestre em criar textos persuasivos usando gatilhos mentais.

    INFORMAÇÕES DO PRODUTO:
    - Produto/Serviço: ${product}
    - Público-alvo: ${audience}
    - Principal benefício/transformação: ${benefit}
    ${cta ? `- Chamada para Ação (CTA): ${cta}`: ''}
    ${image ? `- Uma imagem do produto foi fornecida. Use-a como inspiração visual para a copy.` : ''}

    TAREFA:
    Crie exemplos de copy (textos para marketing) para cada um dos seguintes gatilhos mentais: ${triggerDetails}.
    Para cada gatilho, forneça um parágrafo curto e direto que possa ser usado em anúncios, e-mails ou páginas de vendas.
    O texto deve ser altamente persuasivo e focado no público-alvo e benefício fornecidos.
  `;
  
  const properties: Record<string, { type: Type, description: string }> = {};
    selectedTriggers.forEach(triggerKey => {
        const trigger = MENTAL_TRIGGERS.find(t => t.key === triggerKey);
        properties[triggerKey] = {
            type: Type.STRING,
            description: `A copy persuasiva gerada para o gatilho de ${trigger?.name || triggerKey}`
        };
    });

  const responseSchema = {
    type: Type.OBJECT,
    properties,
  };
  
  const contents: Content = image && image.base64 && image.mimeType
    ? {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: image.mimeType, data: image.base64 } }
        ]
      }
    : prompt;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate copywriting from Gemini API.");
  }
};
