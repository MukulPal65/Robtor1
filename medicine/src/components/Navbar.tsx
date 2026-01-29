import React from 'react';
import { Home, FileText, MessageSquare, Activity, PhoneCall, Settings, LucideIcon } from 'lucide-react';

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

interface NavItem {
  key: string;
  view: View;
  label: string;
  icon: LucideIcon;
  color: string;
}

const Navbar: React.FC<Props> = ({ isAuthenticated, currentView, setCurrentView }) => {
  // Only render when authenticated and not on splash/login/signup/onboarding
  if (!isAuthenticated || ['splash', 'login', 'signup', 'onboarding'].includes(currentView)) {
    return null;
  }

  const navItems: NavItem[] = [
    { key: 'home', view: 'dashboard', label: 'Home', icon: Home, color: 'text-emerald-500' },
    { key: 'report', view: 'report', label: 'Reports', icon: FileText, color: 'text-blue-500' },
    { key: 'chat', view: 'chat', label: 'Chat', icon: MessageSquare, color: 'text-indigo-500' },
    { key: 'symptom', view: 'symptom', label: 'Analysis', icon: Activity, color: 'text-teal-500' },
    { key: 'emergency', view: 'emergency', label: 'SOS', icon: PhoneCall, color: 'text-rose-500' },
    { key: 'settings', view: 'settings', label: 'Settings', icon: Settings, color: 'text-slate-500' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-[100] px-4">
      <nav
        role="navigation"
        aria-label="Main Navigation"
        className="bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-2"
      >
        <div className="flex items-center justify-between px-2">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.view)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 group ${isActive ? 'bg-slate-900 shadow-lg shadow-slate-900/20' : 'hover:bg-slate-50'
                  }`}
              >
                <Icon
                  size={isActive ? 22 : 24}
                  className={`transition-all duration-500 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                />

                {/* Active Dot indicator */}
                {isActive && (
                  <div className="absolute -bottom-1.5 w-1 h-1 bg-emerald-500 rounded-full animate-pulse" aria-hidden />
                )}

                {/* Floating Label - Only on Hover */}
                <span className="absolute -top-12 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none shadow-xl border border-white/10">
                  {item.label}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10" />
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