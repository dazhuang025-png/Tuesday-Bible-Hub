import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginGateProps {
  children: React.ReactNode;
}

const LoginGate: React.FC<LoginGateProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  // Default password is '123456' if not set in environment variables
  const CORRECT_PASSWORD = process.env.APP_PASSWORD || '123456';

  useEffect(() => {
    // Check session storage on load
    const authStatus = sessionStorage.getItem('tbh_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('tbh_auth', 'true');
      setError('');
    } else {
      setError('密码错误，请重试');
      setInput('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-indigo-900 p-8 text-center">
          <div className="w-16 h-16 bg-indigo-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-indigo-200" />
          </div>
          <h1 className="text-2xl font-bold text-white serif tracking-wide">周二查经汇</h1>
          <p className="text-indigo-200 text-sm mt-2">Tuesday Bible Hub · 团契内部专用</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                请输入访问密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  placeholder="默认密码: 123456"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center justify-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              进入系统 <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-6 text-center">
             <p className="text-xs text-slate-400">
               如果您是团契成员但不知道密码，请联系管理员。
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginGate;