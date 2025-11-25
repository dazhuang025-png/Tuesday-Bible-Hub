import React, { useState } from 'react';
import { Feather, BookMarked, ScrollText } from 'lucide-react';
import Button from '../components/Button';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { generatePastorInsights } from '../services/geminiService';
import { LoadingState } from '../types';

const PastorCorner: React.FC = () => {
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState('');
  const [focus, setFocus] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !chapter) return;

    setStatus(LoadingState.LOADING);
    setResult(null);

    try {
      const markdown = await generatePastorInsights(book, chapter, focus);
      setResult(markdown);
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50/50 p-6 rounded-xl shadow-sm border border-amber-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Feather className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 serif">牧者研经室 (The Study)</h2>
            <p className="text-slate-600 text-sm">仅提供原文考古、神学互文与学术观点，作为您深度带领的研究素材。</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">书卷</label>
              <input
                type="text"
                value={book}
                onChange={(e) => setBook(e.target.value)}
                placeholder="例如: 罗马书"
                className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">章节</label>
              <input
                type="number"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="例如: 8"
                className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">特定研究方向 (可选)</label>
            <textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="例如：请分析本章中某个希腊文动词的时态意义，或者对比加尔文与阿米念对此处的不同解释..."
              className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none h-24"
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-amber-700 hover:bg-amber-800 focus:ring-amber-600 text-white" 
              loading={status === LoadingState.LOADING}
            >
              <ScrollText className="w-4 h-4 mr-2" />
              生成研经素材
            </Button>
            <p className="text-xs text-slate-500 mt-2 text-center">
              使用 Pro 模型进行原文溯源与神学推理，耗时可能稍长。
            </p>
          </div>
        </form>
      </div>

      {status === LoadingState.ERROR && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          生成失败，请稍后重试。
        </div>
      )}

      {result && (
        <div className="animate-fade-in">
          <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-900 text-sm flex gap-2">
            <BookMarked className="w-5 h-5 flex-shrink-0" />
            <span>素材已就绪。包含原文语文学分析与救赎历史连接，供您分辨使用。</span>
          </div>
          <MarkdownRenderer content={result} />
        </div>
      )}
    </div>
  );
};

export default PastorCorner;