import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 800);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950 transition-all duration-1000 ease-in-out ${fadeOut ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
        }`}
    >
      {/* Decorative Background effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full filter blur-[100px] animate-pulse"></div>

      <div className="text-center relative z-10 px-6">
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-emerald-400 to-teal-600 p-6 rounded-[2.5rem] shadow-2xl animate-float">
              <Activity size={60} className="text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            ROBTOR<span className="text-emerald-500">.</span>
          </h1>
          <div className="relative h-[2px] w-48 mx-auto bg-slate-800 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-full animate-progress-slide"></div>
          </div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em] mt-4 opacity-70">
            Intelligent Health Assistant
          </p>
        </div>

        <div className="mt-12 flex justify-center space-x-3">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>

      <style>{`
        @keyframes progress-slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-progress-slide {
            animation: progress-slide 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
