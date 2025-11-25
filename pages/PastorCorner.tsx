import React, { useState } from 'react';
import { Feather, BookMarked, ScrollText, AlertTriangle, Sparkles, ArrowRight, Info } from 'lucide-react';
import Button from '../components/Button';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { generatePastorInsights, generateTheologicalTopics, SuggestedTopic } from '../services/geminiService';
import { LoadingState } from '../types';

const PastorCorner: React.FC = () => {
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState('');
  const [focus, setFocus] = useState('');
  
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // New state for Topic Suggestions
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [topicError, setTopicError] = useState<string>('');
  const [topicsFetched, setTopicsFetched] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !chapter) return;

    setStatus(LoadingState.LOADING);
    setResult(null);
    setErrorMsg('');

    try {
      const markdown = await generatePastorInsights(book, chapter, focus);
      setResult(markdown);
      setStatus(LoadingState.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setStatus(LoadingState.ERROR);
      setErrorMsg(error.message || "未知错误");
    }
  };

  const handleInspire = async () => {
    if (!book || !chapter) {
      alert("请先输入书卷名和章节号，AI 才能帮您探测关键议题。");
      return;
    }
    
    setLoadingTopics(true);
    setTopicError('');
    setTopicsFetched(false);
    setSuggestedTopics([]);

    try {
      const topics = await generateTheologicalTopics(book, chapter);
      setSuggestedTopics(topics);
      setTopicsFetched(true);
    } catch (e: any) {
      console.error("Topic error:", e);
      setTopicError(e.message || "无法获取议题");
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleTopicClick = (query: string) => {
    setFocus(query);
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

        <form onSubmit={handleGenerate} className="space-y-6">
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
          
          {/* Smart Topic Detection Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">特定研究方向 (可选)</label>
              <button 
                type="button"
                onClick={handleInspire}
                disabled={loadingTopics}
                className={`text-xs flex items-center gap-1 px-3 py-1 rounded-full border transition-all ${
                  loadingTopics ? 'opacity-70 cursor-wait' : 'cursor-pointer hover:shadow-sm'
                } ${
                  book && chapter 
                    ? 'border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100' 
                    : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                }`}
              >
                {loadingTopics ? (
                  <Sparkles className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                {loadingTopics ? "分析中..." : "🔍 探测关键议题"}
              </button>
            </div>

            {/* Error Message for Topics */}
            {topicError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-start gap-2 animate-fade-in">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{topicError}</span>
              </div>
            )}

            {/* Empty State for Topics */}
            {topicsFetched && suggestedTopics.length === 0 && !topicError && (
              <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded flex items-center gap-2 animate-fade-in">
                <Info className="w-3 h-3" />
                <span>未探测到特定的争议议题，请尝试手动输入。</span>
              </div>
            )}

            {/* Topic Chips */}
            {suggestedTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 animate-fade-in">
                {suggestedTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTopicClick(topic.query)}
                    className="inline-flex items-center text-xs px-3 py-1.5 bg-white border border-amber-200 text-amber-800 rounded-md hover:bg-amber-50 hover:border-amber-300 transition-colors shadow-sm text-left"
                  >
                    {topic.title}
                    <ArrowRight className="w-3 h-3 ml-1 opacity-50 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="如果您有特定的神学负担，请在此输入。或点击上方“探测关键议题”获取灵感..."
              className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none h-24 text-sm"
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
               基于 gemini-2.5-flash 模型进行深度神学分析
            </p>
          </div>
        </form>
      </div>

      {status === LoadingState.ERROR && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">生成失败</p>
            <p className="text-sm mt-1 whitespace-pre-wrap">{errorMsg}</p>
          </div>
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
