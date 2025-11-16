import { GoogleGenAI, Type, Content } from "@google/genai";
import type { FormState } from '../types';
import { MENTAL_TRIGGERS } from '../constants';

/**
 * Obtém a API Key do ambiente e lança um erro claro se não estiver definida.
 * Isso é crucial para o diagnóstico de problemas no deploy da Vercel.
 * @returns A API Key.
 * @throws {Error} Se a API_KEY não estiver nas variáveis de ambiente.
 */
const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY não encontrada. Por favor, adicione a variável de ambiente API_KEY nas configurações do seu projeto na Vercel para que a aplicação possa funcionar corretamente.");
  }
  return apiKey;
};


export const analyzeImageWithGemini = async (
  image: { base64: string; mimeType: string; }
): Promise<{ product: string; audience: string; benefit: string; }> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analise a imagem deste produto e identifique:
    1.  **Nome do Produto/Serviço:** Um nome descritivo ou o nome exato se for visível.
    2.  **Público-Alvo:** O perfil de cliente ideal para este produto.
    3.  **Principal Benefício:** A principal vantagem ou transformação que o produto oferece.

    Seja conciso e direto. Retorne a resposta estritamente como um objeto JSON.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      product: {
        type: Type.STRING,
        description: 'O nome do produto ou serviço identificado na imagem.'
      },
      audience: {
        type: Type.STRING,
        description: 'O público-alvo ideal para este produto.'
      },
      benefit: {
        type: Type.STRING,
        description: 'O principal benefício ou transformação que o produto oferece.'
      }
    },
    required: ['product', 'audience', 'benefit']
  };

  const contents: Content = {
    parts: [
      { text: prompt },
      { inlineData: { mimeType: image.mimeType, data: image.base64 } }
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error analyzing image with Gemini API:", error);
    if (error instanceof Error) {
        // Propaga a mensagem de erro específica (ex: chave faltando)
        throw error;
    }
    throw new Error("Failed to analyze image with Gemini API.");
  }
};


export const generateCopywritingTriggers = async (
  formState: FormState,
  selectedTriggers: string[]
): Promise<Record<string, string>> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
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
    if (error instanceof Error) {
        // Propaga a mensagem de erro específica (ex: chave faltando)
        throw error;
    }
    throw new Error("Failed to generate copywriting from Gemini API.");
  }
};