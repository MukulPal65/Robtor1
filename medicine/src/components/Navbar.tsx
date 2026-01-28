import React from 'react';

type View =
  | 'splash'
  | 'login'
  | 'signup'
  | 'onboarding'
  | 'dashboard'
  | 'chat'
  | 'report'
  | 'symptom'
  | 'settings'
  | 'emergency'
  | 'privacy'
  | 'terms'
  | 'apitest';

interface Props {
  isAuthenticated: boolean;
  currentView: View;
  setCurrentView: (v: View) => void;
}

const Navbar: React.FC<Props> = ({ isAuthenticated, currentView, setCurrentView }) => {
  // Only render when authenticated and not on splash/login/signup/onboarding
  if (!isAuthenticated || ['splash', 'login', 'signup', 'onboarding'].includes(currentView)) {
    return null;
  }

  const navItems: { key: string; view: View; label: string; icon: JSX.Element; accent?: string }[] = [
    {
      key: 'home',
      view: 'dashboard',
      label: 'Home',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      key: 'report',
      view: 'report',
      label: 'Reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      key: 'chat',
      view: 'chat',
      label: 'Chat',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      key: 'symptom',
      view: 'symptom',
      label: 'Symptoms',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      key: 'emergency',
      view: 'emergency',
      label: 'Emergency',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      accent: 'text-red-600 bg-red-50',
    },
    {
      key: 'settings',
      view: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-[100] px-4">
      <nav
        role="navigation"
        aria-label="Main"
        className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] px-2 py-3"
      >
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.view)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`nav-item relative px-3 py-2 rounded-2xl transition-all duration-500 group ${isActive ? 'bg-green-500/10 scale-110' : 'hover:bg-gray-100/50'
                  }`}
              >
                <div className={`transition-all duration-500 ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {item.icon}
                </div>

                {/* Active Bar indicator */}
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-500 ${isActive ? 'bg-green-600 w-4' : 'opacity-0'}`} aria-hidden />

                {/* Label Tooltip */}
                <span className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold shadow-xl`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;