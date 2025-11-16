import React, { useState, useCallback, useEffect } from 'react';
import type { FormState, GeneratedCopy } from './types';
import { MENTAL_TRIGGERS } from './constants';
import { generateCopywritingTriggers, analyzeImageWithGemini } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import InputField from './components/InputField';
import TriggerSelector from './components/TriggerSelector';
import CopyCard from './components/CopyCard';
import ImageUploader from './components/ImageUploader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { LoaderIcon } from './components/icons/LoaderIcon';

const App: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    product: '',
    audience: '',
    benefit: '',
    cta: '',
    image: undefined,
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [generatedCopy, setGeneratedCopy] = useState<GeneratedCopy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    // Verifica a API Key na montagem do componente.
    // Isso fornece feedback imediato ao desenvolvedor se a Vercel não estiver configurada.
    if (!process.env.API_KEY) {
      setConfigError(
        'Atenção: A API_KEY não está configurada. Para que o aplicativo funcione, você precisa adicionar a variável de ambiente API_KEY nas configurações do seu projeto na Vercel.'
      );
    }
  }, []);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
      setFormState(prevState => ({ 
          ...prevState, 
          image: {
              base64: (reader.result as string).split(',')[1],
              mimeType: file.type,
          }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setImagePreviewUrl(null);
    setFormState(prevState => ({ ...prevState, image: undefined }));
  };
  
  const handleImageAnalysis = useCallback(async () => {
    if (!formState.image) {
        setError('Por favor, adicione uma imagem primeiro.');
        return;
    }

    setIsAnalyzingImage(true);
    setError(null);

    try {
        const analysisResult = await analyzeImageWithGemini(formState.image);
        setFormState(prevState => ({
            ...prevState,
            product: analysisResult.product,
            audience: analysisResult.audience,
            benefit: analysisResult.benefit,
        }));
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'Não foi possível analisar a imagem. Tente novamente.';
        setError(errorMessage);
    } finally {
        setIsAnalyzingImage(false);
    }
  }, [formState.image]);


  const toggleTrigger = (triggerKey: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(triggerKey)
        ? prev.filter((t) => t !== triggerKey)
        : [...prev, triggerKey]
    );
  };

  const isFormValid =
    formState.product && formState.audience && formState.benefit && selectedTriggers.length > 0;

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) {
      setError('Por favor, preencha os campos obrigatórios (Produto, Público-Alvo, Benefício) e selecione ao menos um gatilho mental.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedCopy([]);

    try {
      const result = await generateCopywritingTriggers(formState, selectedTriggers);
      
      const formattedResult: GeneratedCopy[] = Object.entries(result).map(([key, value]) => {
          const trigger = MENTAL_TRIGGERS.find(t => t.key === key);
          return {
              triggerKey: key,
              triggerName: trigger?.name || key,
              copy: typeof value === 'string' ? value : JSON.stringify(value),
          };
      });
      setGeneratedCopy(formattedResult);

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro ao gerar a copy. Por favor, tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formState, selectedTriggers, isFormValid]);

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {configError && (
            <div className="mb-8 bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg text-center">
              <p className="font-bold">Ação Necessária</p>
              <p className="text-sm">{configError}</p>
            </div>
           )}
          <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Informações do Produto/Serviço
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <InputField
                label="Nome do Produto/Serviço"
                name="product"
                value={formState.product}
                onChange={handleInputChange}
                placeholder="Ex: Curso de React Avançado"
                disabled={isAnalyzingImage}
              />
              <InputField
                label="Público-Alvo"
                name="audience"
                value={formState.audience}
                onChange={handleInputChange}
                placeholder="Ex: Desenvolvedores júnior"
                disabled={isAnalyzingImage}
              />
              <div className="md:col-span-2">
                 <ImageUploader 
                  onImageChange={handleImageChange}
                  onImageRemove={handleImageRemove}
                  previewUrl={imagePreviewUrl}
                />
                 {imagePreviewUrl && (
                    <div className="text-center mt-4">
                        <button
                            onClick={handleImageAnalysis}
                            disabled={isAnalyzingImage || isLoading}
                            className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-full shadow-md transition-all duration-300 ease-in-out hover:from-teal-600 hover:to-cyan-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            {isAnalyzingImage ? (
                                <>
                                    <LoaderIcon />
                                    Analisando...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon />
                                    Preencher com IA
                                </>
                            )}
                        </button>
                    </div>
                )}
              </div>
              <div className="md:col-span-2">
                <InputField
                  label="Principal Benefício/Transformação"
                  name="benefit"
                  value={formState.benefit}
                  onChange={handleInputChange}
                  placeholder="Ex: Conseguir um emprego sênior em 6 meses"
                  isTextArea
                  disabled={isAnalyzingImage}
                />
              </div>
              <div className="md:col-span-2">
                <InputField
                  label="Chamada para Ação (CTA)"
                  name="cta"
                  value={formState.cta}
                  onChange={handleInputChange}
                  placeholder="Ex: Inscreva-se agora"
                  isTextArea
                  optional={true}
                />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Selecione os Gatilhos Mentais
            </h2>
            <TriggerSelector
              triggers={MENTAL_TRIGGERS}
              selectedTriggers={selectedTriggers}
              onToggle={toggleTrigger}
            />

            <div className="text-center mt-10">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading || isAnalyzingImage}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-full shadow-lg transition-all duration-300 ease-in-out hover:from-blue-700 hover:to-purple-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon />
                    Gerando...
                  </>
                ) : (
                  <>
                    <SparklesIcon />
                    Gerar Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="mt-12 space-y-6">
            {generatedCopy.length > 0 ? (
                generatedCopy.map((item) => (
                    <CopyCard
                    key={item.triggerKey}
                    triggerName={item.triggerName}
                    copyText={item.copy}
                    />
                ))
            ) : (
                !isLoading && (
                    <div className="text-center text-slate-500 py-10 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                        <p className="text-lg">Sua copy persuasiva aparecerá aqui.</p>
                        <p>Preencha os campos e clique em "Gerar Copy" para começar.</p>
                    </div>
                )
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;