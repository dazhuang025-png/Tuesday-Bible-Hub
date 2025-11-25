import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mic, Feather, ArrowRight, Globe, ShieldAlert } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-indigo-900 serif mb-4">周二查经汇 · Tuesday Bible Hub</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          专为我们团契打造的线上助手。
          <br />
          连接周二晚上的<strong>主领人分享</strong>与<strong>牧者深度查考</strong>。
        </p>
        <div className="flex justify-center gap-4 mt-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                <Globe className="w-3 h-3 mr-1" /> 网页版工具
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                <Mic className="w-3 h-3 mr-1" /> 支持 2小时+ 长录音分析
            </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Card 1: Leader Prep */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <BookOpen className="w-24 h-24 text-indigo-600" />
          </div>
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
            <BookOpen className="w-6 h-6 text-indigo-600 group-hover:text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 serif">1. 主领人预备</h2>
          <div className="h-24">
             <p className="text-slate-600 text-sm leading-relaxed mb-1 font-semibold text-indigo-900/70">前半场 (30-40分钟)</p>
             <p className="text-slate-600 text-sm leading-relaxed">
              为当晚带领读经的弟兄姊妹服务。快速生成背景知识与分享结构，完成“抛砖引玉”的预备。
            </p>
          </div>
          <Link to="/prep" className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors w-full justify-center">
            开始预备 <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        {/* Card 2: Pastor's Corner */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <Feather className="w-24 h-24 text-amber-600" />
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-600 transition-colors">
            <Feather className="w-6 h-6 text-amber-600 group-hover:text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 serif">2. 牧者深度助手</h2>
          <div className="h-24">
            <p className="text-slate-600 text-sm leading-relaxed mb-1 font-semibold text-amber-900/70">后半场 (1.5小时)</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              专为牧者设计。提供逐节解经素材、原文微距观察及护教回应，支撑90分钟的深度带领。
            </p>
          </div>
          <Link to="/pastor" className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors w-full justify-center">
            深度研经 <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        {/* Card 3: Meeting Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <Mic className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
            <Mic className="w-6 h-6 text-emerald-600 group-hover:text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 serif">3. 录音精华归档</h2>
          <div className="h-24">
            <p className="text-slate-600 text-sm leading-relaxed mb-1 font-semibold text-emerald-900/70">聚会结束后</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              自动识别前半场分享与后半场牧者教导。精准提取牧者在1.5小时内的神学精华，生成回顾。
            </p>
          </div>
          <Link to="/summary" className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors w-full justify-center">
            上传录音 <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      <div className="mt-16 border-t border-slate-200 pt-8">
        <div className="flex flex-col md:flex-row items-center justify-between text-slate-400 text-sm gap-4">
          <p>"他们在那里聚集，要听神的话。"</p>
          
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md text-xs">
            <ShieldAlert className="w-3 h-3 text-slate-500" />
            <span>网络提示：中国大陆用户需配置 BaseURL 或使用 VPN 访问</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;