import React, { useRef, useState } from 'react';
import { ProductInput } from '../types';
import { extractTextFromImage } from '../services/geminiService';

interface ProductFormProps {
  input: ProductInput;
  onChange: (input: ProductInput) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ input, onChange, onSubmit, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...input, description: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          ...input,
          image: file,
          imagePreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange({ ...input, image: null, imagePreview: null });
  };

  const handleExtractText = async () => {
    if (!input.imagePreview) return;

    setIsExtracting(true);
    try {
      const parts = input.imagePreview.split(',');
      if (parts.length === 2) {
        const imageBase64 = parts[1];
        const header = parts[0];
        const mimeMatch = header.match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

        const text = await extractTextFromImage(imageBase64, mimeType);
        
        if (text) {
          const newDescription = input.description 
            ? `${input.description}\n\n[图片提取文字]: ${text}`
            : text;
          onChange({ ...input, description: newDescription });
        }
      }
    } catch (error) {
      console.error("Failed to extract text", error);
      // Optional: Add a toast notification here
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        商品信息录入
      </h2>
      
      {/* Image Upload Area */}
      <div className="mb-6 flex-grow-0">
        <label className="block text-sm font-medium text-slate-700 mb-2">商品主图 (Product Image)</label>
        
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          id="image-upload"
        />

        {!input.imagePreview ? (
          <label 
            htmlFor="image-upload" 
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">点击上传</span> 或拖拽图片至此处</p>
              <p className="text-xs text-slate-500">支持 PNG, JPG</p>
            </div>
          </label>
        ) : (
          <div className="relative w-full h-48 bg-slate-900 rounded-lg overflow-hidden group">
            <img src={input.imagePreview} alt="Preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={clearImage}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                title="删除图片"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Description Text Area */}
      <div className="mb-6 flex-grow">
        <div className="flex justify-between items-end mb-2">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">商品标题与描述 (Title & Description)</label>
            {input.imagePreview && (
                <button
                    onClick={handleExtractText}
                    disabled={isExtracting || isLoading}
                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                        isExtracting 
                        ? 'bg-indigo-50 text-indigo-400 border-indigo-200 cursor-wait' 
                        : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                    }`}
                >
                    {isExtracting ? (
                         <svg className="animate-spin h-3 w-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                    ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    )}
                    {isExtracting ? '正在识别...' : '自动提取图中文字'}
                </button>
            )}
        </div>
        <textarea
          id="description"
          rows={6}
          className="block p-3 w-full text-sm text-slate-900 bg-white rounded-lg border border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 resize-none h-full"
          placeholder="例如：'搞怪T恤，印有特殊图案...' 或 '如何快速致富的秘籍...'"
          value={input.description}
          onChange={handleTextChange}
        ></textarea>
      </div>

      {/* Action Button */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <button
          onClick={onSubmit}
          disabled={isLoading || (!input.description && !input.image) || isExtracting}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-semibold shadow-md transition-all
            ${isLoading || (!input.description && !input.image) || isExtracting
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform active:scale-[0.98]'
            }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在智能审核...
            </>
          ) : (
            <>
              开始智能审核
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductForm;