import React, { useState } from 'react';
import { Mic, UploadCloud, FileAudio, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { generateMeetingSummary } from '../services/geminiService';
import { LoadingState } from '../types';

const MeetingSummary: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setStatus(LoadingState.IDLE);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setStatus(LoadingState.LOADING);
    try {
      const markdown = await generateMeetingSummary(file);
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
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Mic className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 serif">会议精华归档</h2>
            <p className="text-slate-500 text-sm">上传Zoom录音 (MP3/M4A/MP4)，自动整理主领人与牧者的分享</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 transition-colors hover:bg-slate-100">
          <input
            type="file"
            id="audio-upload"
            accept="audio/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {!file ? (
            <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
              <span className="text-slate-700 font-medium">点击上传会议录音文件</span>
              <span className="text-slate-500 text-xs mt-1">支持 MP3, M4A, MP4 (最大 2GB)</span>
            </label>
          ) : (
            <div className="flex flex-col items-center">
              <FileAudio className="w-12 h-12 text-emerald-600 mb-3" />
              <span className="text-slate-900 font-medium">{file.name}</span>
              <span className="text-slate-500 text-xs mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              <button 
                onClick={() => setFile(null)}
                className="text-red-500 text-xs mt-2 hover:underline"
              >
                移除文件
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleProcess} 
            disabled={!file} 
            loading={status === LoadingState.LOADING}
            variant="secondary"
          >
            {status === LoadingState.LOADING ? '正在听录音并整理中...' : '开始整理摘要'}
          </Button>
        </div>
      </div>

      {status === LoadingState.LOADING && (
        <div className="p-6 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 animate-pulse">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-4 h-4 bg-emerald-400 rounded-full animate-bounce"></div>
             <p className="font-semibold">AI 正在处理音频...</p>
           </div>
           <p className="text-sm opacity-80 pl-7">这可能需要几分钟，取决于录音长度。Gemini 模型正在区分主领人分享与牧者总结。</p>
        </div>
      )}

      {status === LoadingState.ERROR && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          处理失败。请确保文件是有效的音频格式，并且 API Key 配置正确。
        </div>
      )}

      {result && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">整理完成！您可以复制下方内容分享给团契。</span>
          </div>
          <MarkdownRenderer content={result} />
        </div>
      )}
    </div>
  );
};

export default MeetingSummary;