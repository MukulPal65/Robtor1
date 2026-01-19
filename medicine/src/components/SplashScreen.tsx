import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Heart className="w-24 h-24 text-white animate-pulse-slow" fill="white" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">
          ROBTOR
        </h1>
        <div className="h-1 w-32 bg-white mx-auto mb-6 rounded-full"></div>
        <p className="text-2xl text-white font-light tracking-wider">
          Your Health Matters
        </p>
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
