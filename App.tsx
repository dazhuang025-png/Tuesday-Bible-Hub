import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Mic, Users, Feather } from 'lucide-react';
import PrepAssistant from './pages/PrepAssistant';
import MeetingSummary from './pages/MeetingSummary';
import PastorCorner from './pages/PastorCorner';
import Dashboard from './pages/Dashboard';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '概览' },
    { path: '/prep', icon: BookOpen, label: '1. 主领预备' },
    { path: '/pastor', icon: Feather, label: '2. 牧者助手' },
    { path: '/summary', icon: Mic, label: '3. 会议纪要' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <h1 className="text-xl font-bold text-slate-800 serif">周二查经汇</h1>
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <nav className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-900 serif tracking-tight">周二查经汇</h1>
          <p className="text-xs text-slate-500 mt-2">Connecting Word & Spirit</p>
        </div>
        
        <div className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 text-slate-500">
            <Users className="w-5 h-5" />
            <span className="text-sm">团契内部专用</span>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-20 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive ? 'text-indigo-700' : 'text-slate-400'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-60px)] md:h-screen p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/prep" element={<PrepAssistant />} />
          <Route path="/pastor" element={<PastorCorner />} />
          <Route path="/summary" element={<MeetingSummary />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;