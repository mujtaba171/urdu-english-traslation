
import React, { useState, useEffect, useRef } from 'react';
import { translateUrduToEnglish } from './services/geminiService';
import { TranslationRecord, TranslationStatus } from './types';
import TranslationCard from './components/TranslationCard';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<TranslationStatus>(TranslationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TranslationRecord[]>([]);
  const [showToast, setShowToast] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('urdu_translation_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('urdu_translation_history', JSON.stringify(history));
  }, [history]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setStatus(TranslationStatus.LOADING);
    setError(null);
    setResult(null);

    try {
      const translated = await translateUrduToEnglish(inputText);
      setResult(translated);
      setStatus(TranslationStatus.SUCCESS);
      
      const newRecord: TranslationRecord = {
        id: Date.now().toString(),
        original: inputText,
        translated: translated,
        timestamp: Date.now(),
      };
      
      setHistory(prev => [newRecord, ...prev].slice(0, 50)); 
      
      if (window.innerWidth < 768) {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setStatus(TranslationStatus.ERROR);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setStatus(TranslationStatus.IDLE);
    setError(null);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700">
            <i className="fa-solid fa-circle-check text-indigo-400"></i>
            <span className="text-sm font-bold">Copied to clipboard</span>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200">
              <i className="fa-solid fa-language"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">Urdu2English Pro</h1>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1">Professional Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Production Mode
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <i className="fa-solid fa-keyboard text-xs"></i>
                <span className="text-xs font-bold uppercase tracking-wider">Input Source</span>
              </div>
              {inputText && (
                <button 
                  onClick={handleClear}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <i className="fa-solid fa-trash-can"></i> Clear
                </button>
              )}
            </div>
            
            <textarea
              className="w-full h-56 p-6 text-xl text-slate-800 placeholder:text-slate-300 focus:outline-none resize-none urdu-font bg-white"
              placeholder="Type Urdu or Roman Urdu... (e.g. Aaj mausam kaisa hai?)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <div className="flex gap-4">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{inputText.length} chars</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{wordCount(inputText)} words</span>
              </div>
              <button
                onClick={handleTranslate}
                disabled={!inputText.trim() || status === TranslationStatus.LOADING}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  !inputText.trim() || status === TranslationStatus.LOADING
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {status === TranslationStatus.LOADING ? (
                  <><i className="fa-solid fa-spinner animate-spin"></i> Processing...</>
                ) : (
                  <><i className="fa-solid fa-bolt"></i> Convert to English</>
                )}
              </button>
            </div>
          </div>

          <div ref={resultsRef} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                <i className="fa-solid fa-circle-exclamation"></i>
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-white rounded-2xl shadow-xl shadow-indigo-50 border border-indigo-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                <div className="p-4 bg-indigo-600 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <i className="fa-solid fa-circle-check"></i>
                    <span className="text-xs font-bold uppercase tracking-widest">Corrected English Output</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(result)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/20 transition-all"
                  >
                    <i className="fa-regular fa-copy"></i> Copy
                  </button>
                </div>
                <div className="p-10 bg-white">
                  <p className="text-2xl text-slate-900 font-semibold leading-relaxed font-serif">
                    {result}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
              <i className="fa-solid fa-history"></i>
              History
            </h2>

            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <i className="fa-solid fa-quote-left text-slate-100 text-6xl mb-4"></i>
                  <p className="text-slate-400 font-bold text-sm">No translations recorded</p>
                </div>
              ) : (
                history.map(record => (
                  <TranslationCard 
                    key={record.id} 
                    record={record} 
                    onDelete={handleDeleteHistory}
                    onCopy={copyToClipboard}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default App;
