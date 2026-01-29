import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Loader,
  Plus,
  Activity,
  Droplet,
  Camera,
  Globe,
  Trash2,
  Download,
  Heart
} from 'lucide-react';

interface SettingsProps {
  patientName?: string;
  patientEmail?: string;
  onLogout?: () => void;
}

interface ProfileData {
  full_name: string;
  age: number | string;
  gender: string;
  height: number | string;
  weight: number | string;
  blood_type: string;
  phone: string;
  dob: string;
  avatar_url?: string;
  subscription_tier?: 'free' | 'pro' | 'elite';
  subscription_status?: 'active' | 'expired' | 'trialing';
}

const Settings: React.FC<SettingsProps> = ({
  patientName = '',
  patientEmail = '',
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState(patientEmail);
  const [feedback, setFeedback] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Profile State
  const [profile, setProfile] = useState<ProfileData>({
    full_name: patientName,
    age: '',
    gender: '',
    height: '',
    weight: '',
    blood_type: '',
    phone: '',
    dob: '',
    avatar_url: '',
    subscription_tier: 'free',
    subscription_status: 'active'
  });

  const [notifications, setNotifications] = useState({
    healthAlerts: true,
    medicationReminders: true,
    appointmentReminders: true,
    weeklyReports: true,
    marketingEmails: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setSessionEmail(user.email || '');

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProfile({
            full_name: data.full_name || '',
            age: data.age || '',
            gender: data.gender || '',
            height: data.height || '',
            weight: data.weight || '',
            blood_type: data.blood_type || '',
            phone: data.phone || '',
            dob: data.dob || '',
            avatar_url: data.avatar_url || '',
            subscription_tier: data.subscription_tier || 'free',
            subscription_status: data.subscription_status || 'active'
          });

          if (data.notifications) setNotifications(data.notifications);
          if (data.privacy) {
            setTwoFactorEnabled(!!data.privacy.twoStepEnabled);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          age: profile.age ? parseInt(profile.age.toString()) : null,
          gender: profile.gender,
          height: profile.height ? parseFloat(profile.height.toString()) : null,
          weight: profile.weight ? parseFloat(profile.weight.toString()) : null,
          blood_type: profile.blood_type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Profile updated! ✨');
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to end your session?')) {
      await supabase.auth.signOut();
      if (onLogout) onLogout();
      else window.location.reload();
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User, desc: 'Personal details & health info' },
    { id: 'notifications', name: 'Alerts', icon: Bell, desc: 'Customize your reminders' },
    { id: 'privacy', name: 'Security', icon: Shield, desc: 'Manage data & privacy' },
    { id: 'subscription', name: 'Plans', icon: CreditCard, desc: 'Manage your subscription' },
    { id: 'support', name: 'Help', icon: HelpCircle, desc: 'FAQs and direct support' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-32">
      {/* Decorative background components */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 animate-blob animation-delay-2000"></div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Settings</h1>
          <p className="text-slate-500 font-medium">Control your health data and account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Enhanced Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card p-4 space-y-2 bg-white/70">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full group flex items-start space-x-4 px-4 py-4 rounded-3xl transition-all duration-300 ${isActive
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                      : 'text-slate-600 hover:bg-white hover:shadow-md'
                      }`}
                  >
                    <div className={`p-2.5 rounded-2xl transition-colors duration-300 ${isActive ? 'bg-emerald-500' : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}>
                      <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500'} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm tracking-tight">{tab.name}</p>
                      <p className={`text-[10px] uppercase font-black tracking-widest mt-0.5 opacity-60 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {tab.desc}
                      </p>
                    </div>
                  </button>
                );
              })}

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-4 px-4 py-4 text-rose-500 hover:bg-rose-50 rounded-3xl transition-all group"
                >
                  <div className="p-2.5 rounded-2xl bg-rose-100 group-hover:bg-rose-200">
                    <LogOut size={20} />
                  </div>
                  <span className="font-bold text-sm">Log Out</span>
                </button>
              </div>
            </div>

            {/* Quick Status Card */}
            <div className="card p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Shield size={18} className="text-emerald-400" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Security Pulse</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Account Type</span>
                  <span className="font-bold capitalize">{profile.subscription_tier}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">2FA Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {twoFactorEnabled ? 'Protected' : 'Risk'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Workspace Area */}
          <div className="lg:col-span-8">
            <div className="card p-10 bg-white/70 min-h-[600px]">
              {/* Profile Tab Workspace */}
              {activeTab === 'profile' && (
                <div className="space-y-10 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Public Profile</h2>
                      <p className="text-slate-500 text-sm mt-1">Manage how your health portal looks</p>
                    </div>
                    {loading && (
                      <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                        <Loader size={16} className="animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-wider">Syncing</span>
                      </div>
                    )}
                  </div>

                  {/* Profile Image Section */}
                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 pb-10 border-b border-slate-100">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden relative">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl font-black text-emerald-600">{profile.full_name?.charAt(0) || 'U'}</span>
                        )}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="text-white" />
                        </div>
                      </div>
                      <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        onChange={() => {/* Handle Upload */ }}
                      />
                      <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg border border-slate-100 cursor-pointer hover:scale-110 transition-transform">
                        <Plus size={16} className="text-emerald-500" />
                      </label>
                    </div>
                    <div className="text-center md:text-left">
                      <h4 className="text-lg font-bold text-slate-800">{profile.full_name || 'Set your name'}</h4>
                      <p className="text-slate-400 text-sm mb-4">{sessionEmail}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        <div className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase text-slate-400">ID: RS-{profile.full_name?.substring(0, 3).toUpperCase() || 'USR'}</div>
                        <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black uppercase text-emerald-600">Active Member</div>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Gender</label>
                      <select
                        value={profile.gender}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        className="input-field appearance-none cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Non-binary</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Biological Age</label>
                      <input
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                        className="input-field"
                        placeholder="Years"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Blood Type</label>
                      <select
                        value={profile.blood_type}
                        onChange={(e) => setProfile({ ...profile, blood_type: e.target.value })}
                        className="input-field appearance-none cursor-pointer"
                      >
                        <option value="">Unknown</option>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-10 border-b border-slate-100">
                    <div className="bg-slate-50 p-6 rounded-3xl group hover:bg-emerald-50 transition-colors cursor-pointer">
                      <Activity className="text-slate-400 group-hover:text-emerald-500 mb-4 transition-colors" />
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Height (cm)</label>
                      <input
                        type="number"
                        className="bg-transparent text-xl font-black text-slate-800 outline-none w-full"
                        value={profile.height}
                        onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                      />
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl group hover:bg-emerald-50 transition-colors cursor-pointer">
                      <Droplet className="text-slate-400 group-hover:text-emerald-500 mb-4 transition-colors" />
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Weight (kg)</label>
                      <input
                        type="number"
                        className="bg-transparent text-xl font-black text-slate-800 outline-none w-full"
                        value={profile.weight}
                        onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="btn-primary min-w-[200px]"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Notification Tab Workspace */}
              {activeTab === 'notifications' && (
                <div className="space-y-8 animate-fade-in text-left">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Delivery Methods</h2>
                    <p className="text-slate-500 text-sm mt-1">Select how you want to be reached</p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-200 transition-all group">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-2xl ${value ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                            <Bell size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 capitalize leading-tight">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Push & Email Sync</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [key]: !value })}
                          className={`w-14 h-8 rounded-full transition-all duration-300 relative ${value ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${value ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-10 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Data Governance</h2>
                    <p className="text-slate-500 text-sm mt-1">Control your data visibility and security protocols</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-emerald-50 rounded-[2.5rem] relative overflow-hidden border border-emerald-100 group">
                      <Shield className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-500" size={32} />
                      <h4 className="font-black text-slate-900 mb-2 uppercase tracking-tighter text-sm">Two-Factor Auth</h4>
                      <p className="text-xs text-slate-600 mb-6 leading-relaxed">Adds an extra layer of security to your health records.</p>
                      <button
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${twoFactorEnabled ? 'bg-slate-900 text-white' : 'bg-white text-emerald-600 shadow-md'
                          }`}
                      >
                        {twoFactorEnabled ? 'Enabled' : 'Activate Now'}
                      </button>
                    </div>

                    <div className="p-8 bg-blue-50 rounded-[2.5rem] relative overflow-hidden border border-blue-100 group">
                      <Globe className="text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-500" size={32} />
                      <h4 className="font-black text-slate-900 mb-2 uppercase tracking-tighter text-sm">Health Network</h4>
                      <p className="text-xs text-slate-600 mb-6 leading-relaxed">Anonymously share data for medical research advancement.</p>
                      <button
                        className="px-6 py-2.5 rounded-2xl bg-white text-blue-600 shadow-md text-[10px] font-black uppercase tracking-widest"
                      >
                        Manage Sharing
                      </button>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-100 space-y-4">
                    <button className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-colors group">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm"><Download size={20} className="text-slate-600" /></div>
                        <span className="font-bold text-slate-700 text-sm">Request Health Data Export</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-3xl hover:bg-rose-50 transition-colors group">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-rose-500"><Trash2 size={20} /></div>
                        <span className="font-bold text-rose-500 text-sm">Permanently Deactivate Account</span>
                      </div>
                      <ChevronRight size={18} className="text-rose-200 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {/* Simplified Support Area */}
              {activeTab === 'support' && (
                <div className="space-y-10 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Priority Support</h2>
                    <p className="text-slate-500 text-sm mt-1">How can we help you today?</p>
                  </div>

                  <div className="space-y-6">
                    <textarea
                      rows={6}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="input-field p-8"
                      placeholder="Describe your issue or suggest a feature..."
                    />
                    <button className="btn-primary w-full shadow-emerald-500/20">Send Secure Message</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-3xl text-center border border-slate-100">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Live Chat</p>
                      <p className="font-bold text-slate-800">10 Min Wait</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl text-center border border-slate-100">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Email Resp</p>
                      <p className="font-bold text-slate-800">4 Hours</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription placeholder */}
              {activeTab === 'subscription' && (
                <div className="space-y-10 animate-fade-in py-10 text-center">
                  <div className="inline-flex items-center justify-center p-6 bg-emerald-50 rounded-[3rem] mb-6">
                    <Heart size={64} className="text-emerald-500 fill-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">You're on our <span className="text-emerald-500 italic">Elite</span> Plan</h2>
                  <p className="text-slate-500 max-w-sm mx-auto font-medium">Enjoy unlimited AI analysis, priority support, and real-time medical insights.</p>
                  <div className="pt-10 flex justify-center">
                    <button className="btn-secondary px-10">Manage Billing</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scale-in-center {
            animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
        @keyframes scale-in-center {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Settings;
