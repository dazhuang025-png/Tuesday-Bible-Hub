import React, { useState } from 'react';
import { BookOpen, Search, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { generatePrepOutline } from '../services/geminiService';
import { LoadingState } from '../types';

const PrepAssistant: React.FC = () => {
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !chapter) return;

    setStatus(LoadingState.LOADING);
    setResult(null);

    try {
      const markdown = await generatePrepOutline(book, chapter);
      setResult(markdown);
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 serif">查经背景资料库</h2>
            <p className="text-slate-500 text-sm">快速查找背景、生僻词与平行经文，把思考和感动留给您自己。</p>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 text-sm text-indigo-800 flex gap-2">
          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            <strong>设计初衷：</strong> AI 不会告诉您这段经文的“属灵亮光”，因为那是圣灵给您的独特领受。
            此工具仅帮您节省翻阅工具书的时间，提供客观的历史、地理和串珠信息。
          </p>
        </div>

        <form onSubmit={handleGenerate} className="grid md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">书卷 (例如: 约翰福音)</label>
            <input
              type="text"
              value={book}
              onChange={(e) => setBook(e.target.value)}
              placeholder="输入书卷名..."
              className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">章节 (例如: 3)</label>
            <input
              type="number"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="章数..."
              className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              required
            />
          </div>
          <div>
            <Button 
              type="submit" 
              className="w-full" 
              loading={status === LoadingState.LOADING}
            >
              <Search className="w-4 h-4 mr-2" />
              检索资料
            </Button>
          </div>
        </form>
      </div>

      {status === LoadingState.ERROR && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          生成失败，请检查网络或稍后重试。
        </div>
      )}

      {result && (
        <div className="animate-fade-in">
          <MarkdownRenderer content={result} />
        </div>
      )}
    </div>
  );
};

export default PrepAssistant;