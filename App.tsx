import React, { useState, useCallback } from 'react';
import ProductForm from './components/ProductForm';
import AnalysisView from './components/AnalysisView';
import RuleGuide from './components/RuleGuide';
import { ProductInput, AnalysisResult } from './types';
import { analyzeProductContent } from './services/geminiService';

const App: React.FC = () => {
  const [productInput, setProductInput] = useState<ProductInput>({
    description: '',
    image: null,
    imagePreview: null,
  });

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((newInput: ProductInput) => {
    setProductInput(newInput);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!productInput.description && !productInput.image) {
      setError("请至少提供商品描述或商品图片。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let imageBase64: string | null = null;
      let mimeType: string | null = null;

      if (productInput.imagePreview && productInput.image) {
        // Extract base64 data from the preview URL (data:image/xyz;base64,...)
        const parts = productInput.imagePreview.split(',');
        if (parts.length === 2) {
            imageBase64 = parts[1];
            // Get mime type from header
            const header = parts[0]; 
            const mimeMatch = header.match(/:(.*?);/);
            if(mimeMatch) mimeType = mimeMatch[1];
        }
      }

      const analysis = await analyzeProductContent(
        productInput.description,
        imageBase64,
        mimeType
      );
      
      setResult(analysis);
    } catch (e) {
      console.error(e);
      setError("审核分析过程中发生错误，请重试。请检查 API Key 是否配置正确。");
    } finally {
      setIsLoading(false);
    }
  }, [productInput]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <h1 className="text-xl font-bold text-slate-800">ContentModerator (内容审核)</h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Error Banner */}
        {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-start">
                <div className="flex-shrink-0">
                   <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                   </svg>
                </div>
                <div className="ml-3">
                   <p className="text-sm text-red-700">{error}</p>
                </div>
            </div>
        )}

        <RuleGuide />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[calc(100vh-14rem)] lg:min-h-[600px]">
          {/* Input Section - Left Col */}
          <div className="lg:col-span-5 xl:col-span-4 h-full">
            <ProductForm 
              input={productInput}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>

          {/* Result Section - Right Col */}
          <div className="lg:col-span-7 xl:col-span-8 h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto">
             <div className="p-6 h-full">
                <AnalysisView result={result!} isLoading={isLoading} />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;