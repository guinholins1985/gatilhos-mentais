import { GoogleGenAI, Type, Content } from "@google/genai";
import type { FormState } from '../types';
import { MENTAL_TRIGGERS } from '../constants';

// A instância do GoogleGenAI é criada usando a API Key do ambiente.
// Isso evita a necessidade de passar a chave como parâmetro em todas as chamadas.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Analisa uma imagem de produto usando a API Gemini para extrair informações.
 * @param image - O objeto da imagem contendo base64 e mimeType.
 * @returns Uma promessa que resolve para um objeto com produto, público e benefício.
 */
export const analyzeImageWithGemini = async (
  image: { base64: string; mimeType: string; }
): Promise<{ product: string; audience: string; benefit: string; }> => {

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
    throw new Error("Falha ao analisar a imagem. A API pode estar indisponível ou a imagem pode ser inválida.");
  }
};

/**
 * Gera textos de copywriting com base nas informações do formulário e gatilhos mentais.
 * @param formState - O estado atual do formulário.
 * @param selectedTriggers - Uma lista dos gatilhos mentais selecionados.
 * @returns Uma promessa que resolve para um record onde a chave é o gatilho e o valor é a copy gerada.
 */
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
    throw new Error("Falha ao gerar a copy. A API pode estar indisponível ou a requisição é inválida.");
  }
};
