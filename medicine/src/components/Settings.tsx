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
  Heart,
  Smartphone,
  Bluetooth,
  Wifi,
  Radio,
  X,
  Sparkles
} from 'lucide-react';
import { useBluetooth } from '../lib/BluetoothContext';

interface SettingsProps {
  patientName?: string;
  patientEmail?: string;
  onLogout?: () => void;
  onUpdate?: () => void;
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
  has_wearable?: boolean;
  subscription_tier?: 'free' | 'pro' | 'elite';
  subscription_status?: 'active' | 'expired' | 'trialing';
}

const Settings: React.FC<SettingsProps> = ({
  patientName = '',
  patientEmail = '',
  onLogout,
  onUpdate
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
    has_wearable: false,
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

  // Bluetooth State from Context
  const { btData, isScanning, connect, disconnect } = useBluetooth();

  const handleBluetoothConnect = async () => {
    try {
      await connect();
      alert('Device paired successfully! ✨ Vitals are now live.');
    } catch (error: any) {
      if (error.name === 'NotFoundError' || error.message?.includes('User cancelled')) {
        console.log('User cancelled the pairing dialog.');
        return;
      }

      console.error('Handled Bluetooth error:', error);
      alert('Connection Error: ' + (error.message || 'Unknown error occurred. Please check mobile bluetooth settings and try again.'));
    }
  };

  const handleBluetoothDisconnect = async () => {
    try {
      await disconnect();
      alert('Device disconnected.');
    } catch (error: any) {
      alert('Error disconnecting: ' + error.message);
    }
  };

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
            has_wearable: data.has_wearable || false,
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
          has_wearable: profile.has_wearable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      if (onUpdate) onUpdate();
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
    { id: 'devices', name: 'Devices', icon: Smartphone, desc: 'Manage wearables & apps' },
    { id: 'notifications', name: 'Alerts', icon: Bell, desc: 'Customize your reminders' },
    { id: 'privacy', name: 'Security', icon: Shield, desc: 'Manage data & privacy' },
    { id: 'subscription', name: 'Plans', icon: CreditCard, desc: 'Manage your subscription' },
    { id: 'support', name: 'Help', icon: HelpCircle, desc: 'FAQs and direct support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden pb-32">
      {/* Decorative background components */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/5 rounded-full mix-blend-screen filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-500/5 rounded-full mix-blend-screen filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 animate-blob animation-delay-2000"></div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12 text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Settings</h1>
          <p className="text-slate-600 font-medium">Control your health data and account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Enhanced Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white shadow-xl border border-gray-200 rounded-3xl p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full group flex items-start space-x-4 px-4 py-4 rounded-3xl transition-all duration-300 ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/30'
                      : 'text-slate-500 hover:bg-gray-100 hover:text-slate-900'
                      }`}
                  >
                    <div className={`p-2.5 rounded-2xl transition-colors duration-300 ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                      <Icon size={20} className={isActive ? 'text-white' : 'text-blue-600'} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm tracking-tight">{tab.name}</p>
                      <p className={`text-[10px] uppercase font-black tracking-widest mt-0.5 opacity-60 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                        {tab.desc}
                      </p>
                    </div>
                  </button>
                );
              })}

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-4 px-4 py-4 text-rose-500 hover:bg-rose-50 rounded-3xl transition-all group"
                >
                  <div className="p-2.5 rounded-2xl bg-rose-50 group-hover:bg-rose-100">
                    <LogOut size={20} />
                  </div>
                  <span className="font-bold text-sm">Log Out</span>
                </button>
              </div>
            </div>

            {/* Quick Status Card */}
            <div className="bg-white shadow-xl border border-gray-200 rounded-3xl p-6 text-slate-900">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gray-50 rounded-xl">
                  <Shield size={18} className="text-blue-600" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Security Pulse</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Account Type</span>
                  <span className="font-bold capitalize">{profile.subscription_tier}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">2FA Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${twoFactorEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {twoFactorEnabled ? 'Protected' : 'Risk'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Workspace Area */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow-xl border border-gray-200 rounded-3xl p-10 min-h-[600px]">
              {/* Profile Tab Workspace */}
              {activeTab === 'profile' && (
                <div className="space-y-10 animate-fade-in text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Public Profile</h2>
                      <p className="text-slate-600 text-sm mt-1">Manage how your health portal looks</p>
                    </div>
                    {loading && (
                      <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                        <Loader size={16} className="animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Syncing</span>
                      </div>
                    )}
                  </div>

                  {/* Profile Image Section */}
                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 pb-10 border-b border-gray-100">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-gray-100 flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden relative">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl font-black text-emerald-600">{profile.full_name?.charAt(0) || 'U'}</span>
                        )}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="text-slate-900" />
                        </div>
                      </div>
                      <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        onChange={() => {/* Handle Upload */ }}
                      />
                      <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 p-3 bg-white text-emerald-600 rounded-2xl shadow-lg border border-gray-100 cursor-pointer hover:scale-110 transition-transform">
                        <Plus size={16} />
                      </label>
                    </div>
                    <div className="text-center md:text-left">
                      <h4 className="text-lg font-bold text-slate-900">{profile.full_name || 'Set your name'}</h4>
                      <p className="text-slate-500 text-sm mb-4">{sessionEmail}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-black uppercase text-slate-500">ID: RS-{profile.full_name?.substring(0, 3).toUpperCase() || 'USR'}</div>
                        <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black uppercase text-emerald-600">Active Member</div>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Preferred Gender</label>
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
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Biological Age</label>
                      <input
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                        className="input-field"
                        placeholder="Years"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Blood Type</label>
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

                  <div className="grid grid-cols-2 gap-4 pb-10 border-b border-gray-100">
                    <div className="bg-gray-50 p-6 rounded-3xl group hover:bg-white hover:shadow-md transition-all cursor-pointer border border-gray-100 shadow-sm text-left">
                      <Activity className="text-gray-400 group-hover:text-blue-500 mb-4 transition-colors" />
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Height (cm)</label>
                      <input
                        type="number"
                        className="bg-transparent text-xl font-black text-slate-900 outline-none w-full placeholder-gray-400"
                        value={profile.height}
                        onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                      />
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl group hover:bg-white hover:shadow-md transition-all cursor-pointer border border-gray-100 shadow-sm text-left">
                      <Droplet className="text-gray-400 group-hover:text-blue-500 mb-4 transition-colors" />
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Weight (kg)</label>
                      <input
                        type="number"
                        className="bg-transparent text-xl font-black text-slate-900 outline-none w-full placeholder-gray-400"
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

              {/* Devices Tab Workspace */}
              {activeTab === 'devices' && (
                <div className="space-y-10 animate-fade-in text-left">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Health Devices</h2>
                    <p className="text-slate-500 text-sm mt-1">Connect wearables to sync vitals automatically</p>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 mb-8">
                    <div className="flex items-start space-x-3">
                      <Shield size={18} className="text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">Watch not showing up?</h4>
                        <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc">
                          <li>Keep watch screen <strong>ON</strong> while scanning</li>
                          <li>Turn phone Bluetooth **OFF and ON**</li>
                          <li>Ensure watch is **NOT connected** to any other app (like Da Fit)</li>
                          <li>Restart the watch if connection fails repeatedly</li>
                          <li className="text-blue-700 font-bold">Open the Heart Rate app on your watch to start streaming</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Web Bluetooth Integration Card */}
                    <div className="p-8 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-[2.5rem] relative overflow-hidden border border-blue-500/10 group col-span-1 md:col-span-2">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Bluetooth size={120} className="text-blue-500" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center space-x-4">
                            <div className={`p-4 rounded-2xl ${btData?.connected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-gray-100 text-slate-400'}`}>
                              <Bluetooth size={32} className={btData?.connected ? 'animate-pulse' : ''} />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-slate-900">Web Bluetooth Bridge</h3>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Real-time hardware sync</p>
                            </div>
                          </div>
                          {btData?.connected && (
                            <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                              <Radio size={14} className="animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {btData.heartRate > 0 ? 'Signal: Excellent' : 'Status: Syncing Data...'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          <div>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                              Connect medical-grade Bluetooth LE devices (Heart Rate Monitors, Pulse Oximeters) directly to your browser for real-time AI processing.
                            </p>
                            <ul className="space-y-2">
                              {['Secure GATT Streaming', 'Standard Medical Protocols', 'Zero Latency Analysis'].map(feature => (
                                <li key={feature} className="flex items-center text-[10px] font-black uppercase tracking-widest text-blue-600">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {btData?.connected && (
                            <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-blue-100 flex items-center justify-center">
                              <div className="text-center">
                                <div className="space-y-6">
                                  <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Live Heart Rate</p>
                                    <div className="flex items-baseline justify-center space-x-2">
                                      <span className="text-5xl font-black text-slate-900 tabular-nums animate-pulse">{btData.heartRate || 0}</span>
                                      <span className="text-sm font-black text-rose-500 uppercase">BPM</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/40 p-4 rounded-2xl border border-blue-50/50 text-center">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Steps Today</p>
                                      <div className="flex items-baseline justify-center space-x-1">
                                        <span className="text-2xl font-black text-slate-900">{btData.steps || 0}</span>
                                        <span className="text-[10px] font-bold text-blue-500 uppercase">Steps</span>
                                      </div>
                                    </div>
                                    <div className="bg-white/40 p-4 rounded-2xl border border-blue-50/50 text-center">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Energy Burn</p>
                                      <div className="flex items-baseline justify-center space-x-1">
                                        <span className="text-2xl font-black text-slate-900">{btData.calories || 0}</span>
                                        <span className="text-[10px] font-bold text-orange-500 uppercase">Kcal</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 flex items-center justify-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    <Droplet size={12} className="text-blue-500" />
                                    <span className="text-[10px] font-bold text-slate-600">{btData.batteryLevel || '--'}% Batt</span>
                                  </div>
                                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                  <span className="text-[10px] font-bold text-slate-600 truncate max-w-[100px]">{btData.deviceName}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={btData?.connected ? handleBluetoothDisconnect : handleBluetoothConnect}
                            disabled={isScanning}
                            className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center ${btData?.connected
                              ? 'bg-white text-rose-600 border-2 border-rose-100 hover:bg-rose-50 hover:border-rose-200'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-500/20 hover:shadow-blue-500/40'}`}
                          >
                            {isScanning ? (
                              <>
                                <Loader size={16} className="animate-spin mr-3" />
                                Negotiating...
                              </>
                            ) : (
                              <>
                                <Bluetooth size={16} className="mr-3" />
                                {btData?.connected ? 'Terminate Session' : 'Initialize Discovery'}
                              </>
                            )}
                          </button>

                          {!btData?.connected && (
                            <div className="flex items-center space-x-3 px-4 py-4 bg-amber-50 rounded-2xl border border-amber-100">
                              <Wifi size={14} className="text-amber-600" />
                              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest leading-none">HTTPS Context Required for hardware access</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Notification Tab Workspace */}
              {activeTab === 'notifications' && (
                <div className="space-y-8 animate-fade-in text-left">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Delivery Methods</h2>
                    <p className="text-slate-600 text-sm mt-1">Select how you want to be reached</p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-6 bg-gray-50 border border-gray-100 rounded-3xl hover:shadow-lg transition-all group shadow-sm">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-2xl ${value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-slate-400'}`}>
                            <Bell size={20} className={value ? 'animate-pulse' : ''} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 capitalize leading-tight">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-left">Push & Email Sync</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [key]: !value })}
                          className={`w-14 h-8 rounded-full transition-all duration-300 relative ${value ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${value ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-10 animate-fade-in text-left">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Data Governance</h2>
                    <p className="text-slate-600 text-sm mt-1">Control your data visibility and security protocols</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-emerald-50 rounded-[2.5rem] relative overflow-hidden border border-emerald-100 group text-left">
                      <Shield className="text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-500" size={32} />
                      <h4 className="font-black text-slate-900 mb-2 uppercase tracking-tighter text-sm">Two-Factor Auth</h4>
                      <p className="text-xs text-gray-500 mb-6 leading-relaxed">Adds an extra layer of security to your health records.</p>
                      <button
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${twoFactorEnabled ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-gray-100 text-slate-400 shadow-md border border-gray-200'
                          }`}
                      >
                        {twoFactorEnabled ? 'Enabled' : 'Activate Now'}
                      </button>
                    </div>

                    <div className="p-8 bg-blue-50 rounded-[2.5rem] relative overflow-hidden border border-blue-100 group text-left">
                      <Globe className="text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-500" size={32} />
                      <h4 className="font-black text-slate-900 mb-2 uppercase tracking-tighter text-sm">Health Network</h4>
                      <p className="text-xs text-gray-500 mb-6 leading-relaxed">Anonymously share data for medical research advancement.</p>
                      <button
                        className="px-6 py-2.5 rounded-2xl bg-gray-100 text-blue-600 shadow-md border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                      >
                        Manage Sharing
                      </button>
                    </div>

                    <div className="p-8 bg-purple-50 rounded-[2.5rem] relative overflow-hidden border border-purple-100 group text-left col-span-1 md:col-span-2">
                      <CreditCard className="text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-500" size={32} />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-slate-900 mb-2 uppercase tracking-tighter text-sm">Payment Methods</h4>
                          <p className="text-xs text-gray-500 mb-4 leading-relaxed max-w-md">Securely manage your saved cards and billing details.</p>
                        </div>
                        <button
                          className="px-6 py-2.5 rounded-2xl bg-gray-100 text-purple-600 shadow-md border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                        >
                          Manage Cards
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-gray-100 space-y-4">
                    <button className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-colors group border border-gray-100 shadow-sm">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm"><Download size={20} className="text-slate-400" /></div>
                        <span className="font-bold text-slate-700 text-sm">Request Health Data Export</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="w-full flex items-center justify-between p-6 bg-rose-50 rounded-3xl hover:bg-rose-100 transition-colors group border border-rose-100 shadow-sm">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-rose-500"><Trash2 size={20} /></div>
                        <span className="font-bold text-rose-600 text-sm">Permanently Deactivate Account</span>
                      </div>
                      <ChevronRight size={18} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {/* Simplified Support Area */}
              {activeTab === 'support' && (
                <div className="space-y-10 animate-fade-in text-left">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Priority Support</h2>
                    <p className="text-slate-600 text-sm mt-1">How can we help you today?</p>
                  </div>

                  <div className="space-y-6">
                    <textarea
                      rows={6}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-all duration-300"
                      placeholder="Describe your issue or suggest a feature..."
                    />
                    <button className="btn-primary w-full shadow-emerald-500/20">Send Secure Message</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-gray-50 rounded-3xl text-center border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Live Chat</p>
                      <p className="font-bold text-slate-900">10 Min Wait</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl text-center border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email Resp</p>
                      <p className="font-bold text-slate-900">4 Hours</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Plans Grid */}
              {activeTab === 'subscription' && (
                <div className="space-y-10 animate-fade-in py-6">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Health Platform Plans</h2>
                    <p className="text-slate-600 font-medium">Choose the level of care that fits your lifestyle</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Plan */}
                    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all flex flex-col group">
                      <div className="p-4 bg-slate-50 rounded-2xl w-fit mb-6 group-hover:bg-slate-100 transition-colors">
                        <Activity size={24} className="text-slate-400" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Free</h3>
                      <p className="text-3xl font-black text-slate-900 mb-6">$0<span className="text-sm text-slate-400 font-bold ml-1">/mo</span></p>

                      <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                          <Shield size={16} className="text-emerald-500" />
                          <span>Basic Monitoring</span>
                        </li>
                        <li className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                          <Shield size={16} className="text-emerald-500" />
                          <span>Emergency Contacts</span>
                        </li>
                        <li className="flex items-center space-x-3 text-sm text-slate-400 font-medium opacity-50">
                          <X size={16} className="text-slate-300" />
                          <span>Bluetooth Vitals</span>
                        </li>
                      </ul>

                      <button className="w-full py-4 rounded-2xl bg-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest cursor-not-allowed">
                        Current Tier
                      </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-white border-2 border-blue-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all flex flex-col relative overflow-hidden group">
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-tighter">Recommended</div>
                      <div className="p-4 bg-blue-50 rounded-2xl w-fit mb-6 group-hover:bg-blue-100 transition-colors">
                        <Smartphone size={24} className="text-blue-600" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Pro</h3>
                      <p className="text-3xl font-black text-slate-900 mb-6">$12<span className="text-sm text-slate-400 font-bold ml-1">/mo</span></p>

                      <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                          <Shield size={16} className="text-emerald-500" />
                          <span>Real-time Bluetooth</span>
                        </li>
                        <li className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                          <Shield size={16} className="text-emerald-500" />
                          <span>AI Chat Assistant</span>
                        </li>
                        <li className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                          <Shield size={16} className="text-emerald-500" />
                          <span>Personalized Goals</span>
                        </li>
                      </ul>

                      <button className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                        Upgrade Now
                      </button>
                    </div>

                    {/* Elite Plan */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 shadow-2xl flex flex-col relative overflow-hidden group">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-tighter shadow-lg">Active</div>
                      <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 text-emerald-400 rotate-12" />
                      <div className="p-4 bg-white/10 rounded-2xl w-fit mb-6">
                        <Heart size={24} className="text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">Elite</h3>
                      <p className="text-3xl font-black text-white mb-6">$29<span className="text-sm text-slate-400 font-bold ml-1">/mo</span></p>

                      <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center space-x-3 text-sm text-slate-200 font-medium">
                          <Shield size={16} className="text-emerald-400" />
                          <span>Priority Report Analysis</span>
                        </li>
                        <li className="flex items-center space-x-3 text-sm text-slate-200 font-medium">
                          <Shield size={16} className="text-emerald-400" />
                          <span>Medical Network Access</span>
                        </li>
                        <li className="flex items-center space-x-3 text-sm text-slate-200 font-medium">
                          <Shield size={16} className="text-emerald-400" />
                          <span>24/7 Premium Support</span>
                        </li>
                      </ul>

                      <button className="w-full py-4 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest shadow-xl hover:bg-gray-100 transition-all">
                        In Progress
                      </button>
                    </div>
                  </div>

                  <div className="pt-10 flex flex-col items-center">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-center">Your billing is managed via encrypted Stripe gateway</p>
                    <button className="btn-secondary px-10 bg-white shadow-md border border-slate-200 hover:border-blue-400 transition-all">Manage Previous Invoices</button>
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
