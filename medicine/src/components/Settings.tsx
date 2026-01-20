import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  User,
  Bell,
  Shield,
  Lock,
  Mail,
  Smartphone,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Loader,
  CheckCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink
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
  const [uploading, setUploading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState(patientEmail);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTwoFactorForm, setShowTwoFactorForm] = useState(false);
  const [showLoginActivity, setShowLoginActivity] = useState(false);
  const [loginActivity, setLoginActivity] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState([
    { id: 1, message: "The diet plan is really helpful!", date: "2026-01-10", status: "Replied" },
    { id: 2, message: "Can I sync data from my Mi Band?", date: "2026-01-09", status: "Pending" }
  ]);
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

  const [privacy, setPrivacy] = useState({
    shareHealthData: false,
    analyticsTracking: true,
    locationServices: false,
    twoStepEnabled: false,
  });

  useEffect(() => {
    fetchProfile();
    fetchLoginActivity();
  }, []);



  const fetchLoginActivity = async () => {
    try {
      const { ProfileService } = await import('../services/profileService');
      const activity = await ProfileService.getLoginActivity();
      setLoginActivity(activity);
    } catch (error) {
      console.error('Error fetching login activity:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setSessionEmail(user.email || '');
        setUserId(user.id);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

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

          if (data.notifications) {
            setNotifications(data.notifications);
          }
          if (data.privacy) {
            setPrivacy(data.privacy);
            if (data.privacy.twoStepEnabled) {
              setTwoFactorEnabled(true);
            }
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

      if (!user) throw new Error('No user logged in');

      const updates = {
        full_name: profile.full_name,
        age: profile.age ? parseInt(profile.age.toString()) : null,
        gender: profile.gender,
        height: profile.height ? parseFloat(profile.height.toString()) : null,
        weight: profile.weight ? parseFloat(profile.weight.toString()) : null,
        blood_type: profile.blood_type,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update({
          notifications: notifications,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Notification preferences saved!');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: 'pro' | 'elite') => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, subscription_tier: tier, subscription_status: 'active' }));
      alert(`Successfully upgraded to ${tier.toUpperCase()}!`);
    } catch (error: any) {
      console.error('Error upgrading subscription:', error);
      alert('Failed to upgrade: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const { ProfileService } = await import('../services/profileService');
      await ProfileService.exportData();
      alert('Your data has been exported and download should start shortly.');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      alert('Failed to export data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('ARE YOU SURE? This will permanently delete your health records and profile. This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const { ProfileService } = await import('../services/profileService');
      await ProfileService.deleteProfileData();
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      alert('Please enter your feedback before submitting.');
      return;
    }

    try {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setFeedbackHistory(prev => [
        {
          id: Date.now(),
          message: feedback,
          date: new Date().toISOString().split('T')[0],
          status: 'Sent'
        },
        ...prev
      ]);
      alert('Thank you! Your feedback has been sent to our support team.');
      setFeedback('');
    } catch (error: any) {
      console.error('Error sending feedback:', error);
      alert('Failed to send feedback: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update({
          privacy: privacy,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Privacy settings saved!');
    } catch (error: any) {
      console.error('Error saving privacy settings:', error);
      alert('Failed to save settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error('Error updating password:', error);
      alert('Failed to update password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    const newState = !twoFactorEnabled;
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          privacy: { ...privacy, twoStepEnabled: newState },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setTwoFactorEnabled(newState);
      setPrivacy({ ...privacy, twoStepEnabled: newState });
      alert(newState ? 'Two-Factor Authentication enabled!' : 'Two-Factor Authentication disabled.');
    } catch (error: any) {
      console.error('Error toggling 2FA:', error);
      alert('Failed to update 2FA status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'devices', name: 'Connected Devices', icon: Smartphone },
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
    { id: 'support', name: 'Help & Support', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await supabase.auth.signOut();
        if (onLogout) {
          onLogout();
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error logging out:', error);
        alert('Failed to logout. Please try again.');
      }
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: updateError } = await supabase.from('profiles').update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        }).eq('id', user.id);

        if (updateError) throw updateError;
        alert('Profile picture updated!');
      }

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{tab.name}</span>
                  </button>
                );
              })}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-semibold">Log Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
                    {loading && <span className="text-sm text-green-600 flex items-center"><Loader className="w-4 h-4 mr-2 animate-spin" /> Saving...</span>}
                  </div>

                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                          {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}

                      <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-gray-200 hover:bg-gray-50">
                        <User className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div>
                      <div className="relative">
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                        <label
                          htmlFor="avatar-upload"
                          className={`btn-primary mb-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer inline-block ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {uploading ? 'Uploading...' : 'Change Photo'}
                        </label>
                      </div>
                      <p className="text-sm text-gray-500">JPG, GIF or PNG. Max size 5MB</p>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={sessionEmail}
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">User ID (for Bridge App)</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={userId}
                          readOnly
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none bg-gray-50 text-xs font-mono"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(userId);
                            alert('User ID copied to clipboard!');
                          }}
                          className="px-4 py-2 bg-gray-800 text-white rounded-xl text-xs font-bold hover:bg-gray-900 transition-all"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                        placeholder="e.g. 30"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                      <select
                        value={profile.gender}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/*
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={profile.dob}
                        onChange={(e) => setProfile({...profile, dob: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    */}
                  </div>

                  {/* Health Info */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Health Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                        <input
                          type="number"
                          value={profile.height}
                          onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                          placeholder="175"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                        <input
                          type="number"
                          value={profile.weight}
                          onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                          placeholder="70"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Type</label>
                        <select
                          value={profile.blood_type}
                          onChange={(e) => setProfile({ ...profile, blood_type: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      onClick={() => fetchProfile()}
                      className="px-6 py-2 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-all"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Notification Preferences</h2>

                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                            </p>
                            <p className="text-sm text-gray-600">
                              Receive notifications about {key.toLowerCase()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [key]: !value })}
                          className={`relative w-14 h-7 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'transform translate-x-7' : ''
                              }`}
                          ></div>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleSaveNotifications}
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center"
                    >
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Privacy & Security</h2>

                  {/* Privacy Settings */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold text-gray-800">Privacy Settings</h3>
                    {Object.entries(privacy).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                            </p>
                            <p className="text-sm text-gray-600">
                              {key === 'shareHealthData' && 'Share your health data with healthcare providers'}
                              {key === 'analyticsTracking' && 'Help us improve our services'}
                              {key === 'locationServices' && 'Enable location-based health features'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setPrivacy({ ...privacy, [key]: !value })}
                          className={`relative w-14 h-7 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'transform translate-x-7' : ''
                              }`}
                          ></div>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleSavePrivacy}
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center"
                    >
                      {loading ? 'Saving...' : 'Save Privacy Settings'}
                    </button>
                  </div>

                  {/* Security Actions */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Security</h3>
                    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                      <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Lock className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-800">Change Password</span>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
                      </button>

                      {showPasswordForm && (
                        <div className="p-4 bg-white border-t border-gray-100 space-y-4 animate-slide-up">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Min 6 characters"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repeat password"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                          </div>
                          <button
                            onClick={handlePasswordChange}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:shadow-md transition-all disabled:opacity-50"
                          >
                            {loading ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                      <button
                        onClick={() => setShowTwoFactorForm(!showTwoFactorForm)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Smartphone className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-800">Two-Step Verification</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                            {twoFactorEnabled ? 'PROTECTED' : 'OFF'}
                          </span>
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showTwoFactorForm ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      {showTwoFactorForm && (
                        <div className="p-4 bg-white border-t border-gray-100 animate-slide-up">
                          <p className="text-sm text-gray-600 mb-4">
                            Add an extra layer of security to your account. When enabled, you'll need to enter a secondary code during sign-in.
                          </p>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-bold text-gray-800">Authenticator App</p>
                              <p className="text-xs text-gray-500">Use apps like Google Authenticator or Authy</p>
                            </div>
                            <button
                              onClick={handleToggleTwoFactor}
                              disabled={loading}
                              className={`relative w-12 h-6 rounded-full transition-colors ${twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${twoFactorEnabled ? 'transform translate-x-6' : ''}`} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                      <button
                        onClick={() => setShowLoginActivity(!showLoginActivity)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-800">Login Activity</span>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showLoginActivity ? 'rotate-90' : ''}`} />
                      </button>

                      {showLoginActivity && (
                        <div className="p-4 bg-white border-t border-gray-100 animate-slide-up">
                          <div className="space-y-3">
                            {loginActivity.length === 0 ? (
                              <p className="text-xs text-gray-500 italic text-center py-2">No recent activity found</p>
                            ) : (
                              loginActivity.map((log: any, index: number) => (
                                <div key={index} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                                  <div className="flex items-start space-x-2">
                                    <div className="mt-1">
                                      {log.device_type === 'mobile' ? <Smartphone className="w-3 h-3 text-gray-400" /> : <Shield className="w-3 h-3 text-gray-400" />}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-gray-800">{log.browser || 'Browser'} on {log.os || 'Unknown OS'}</p>
                                      <p className="text-[10px] text-gray-500">{log.ip_address || 'Private IP'} • {new Date(log.created_at).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  {index === 0 && (
                                    <span className="text-[8px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">ACTIVE</span>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Data Management */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h3>
                    <div className="space-y-3">
                      <button
                        onClick={handleExportData}
                        disabled={loading}
                        className="w-full flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        <span className="font-semibold text-blue-700">Download My Data</span>
                        <ChevronRight className="w-5 h-5 text-blue-600" />
                      </button>

                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="w-full flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <span className="font-semibold text-red-700">Delete Account</span>
                        <ChevronRight className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <div className="space-y-8 animate-fade-in text-left">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Subscription Plan</h2>
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-green-700 uppercase">{profile.subscription_tier || 'FREE'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Plan */}
                    <div className={`p-6 rounded-2xl border-2 transition-all ${profile.subscription_tier === 'free' ? 'border-green-500 bg-green-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Free</h3>
                      <p className="text-2xl font-black text-gray-900 mb-4">₹0 <span className="text-sm font-normal text-gray-500">/mo</span></p>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Basic health tracking</span>
                        </li>
                        <li className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Limited AI chat (10/day)</span>
                        </li>
                        <li className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Manual report entry</span>
                        </li>
                      </ul>
                      <button
                        disabled={profile.subscription_tier === 'free'}
                        className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${profile.subscription_tier === 'free' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                      >
                        {profile.subscription_tier === 'free' ? 'Current Plan' : 'Downgrade'}
                      </button>
                    </div>

                    {/* Pro Plan */}
                    <div className={`p-6 rounded-2xl border-2 relative overflow-hidden transition-all ${profile.subscription_tier === 'pro' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'}`}>
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Pro</h3>
                      <p className="text-2xl font-black text-gray-900 mb-4">₹49 <span className="text-sm font-normal text-gray-500">/mo</span></p>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          <span>Everything in Free</span>
                        </li>
                        <li className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          <span>Unlimited AI chat</span>
                        </li>
                        <li className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          <span>AI Medical Report translation</span>
                        </li>
                        <li className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          <span>Advanced risk predictions</span>
                        </li>
                      </ul>
                      <button
                        onClick={() => handleUpgrade('pro')}
                        disabled={loading || profile.subscription_tier === 'pro'}
                        className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${profile.subscription_tier === 'pro' ? 'bg-blue-100 text-blue-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
                      >
                        {profile.subscription_tier === 'pro' ? 'Current Plan' : profile.subscription_tier === 'elite' ? 'Downgrade' : 'Upgrade to Pro'}
                      </button>
                    </div>

                    {/* Elite Plan */}
                    <div className={`p-6 rounded-2xl border-2 transition-all ${profile.subscription_tier === 'elite' ? 'border-purple-600 bg-purple-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Elite</h3>
                      <p className="text-2xl font-black text-gray-900 mb-4">₹99 <span className="text-sm font-normal text-gray-500">/mo</span></p>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <span>Everything in Pro</span>
                        </li>
                        <li className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <span>24/7 Priority Support</span>
                        </li>
                        <li className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <span>Wearable device integration</span>
                        </li>
                        <li className="flex items-start space-x-2 text-xs text-gray-600">
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <span>Family sharing (up to 4 accounts)</span>
                        </li>
                      </ul>
                      <button
                        onClick={() => handleUpgrade('elite')}
                        disabled={loading || profile.subscription_tier === 'elite'}
                        className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${profile.subscription_tier === 'elite' ? 'bg-purple-100 text-purple-700 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'}`}
                      >
                        {profile.subscription_tier === 'elite' ? 'Current Plan' : 'Upgrade to Elite'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                      <HelpCircle className="w-4 h-4 mr-2 text-gray-500" />
                      Subscription Information
                    </h4>
                    <p className="text-xs text-gray-600">
                      Your subscription is currently billed monthly. You can cancel or change your plan at any time.
                      Changes to your subscription will take effect at the start of your next billing cycle.
                    </p>
                  </div>
                </div>
              )}

              {/* Help & Support Tab */}
              {activeTab === 'support' && (
                <div className="space-y-8 animate-fade-in text-left">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Help & Support Center</h2>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">24/7 AI ASSISTANCE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* FAQ Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <HelpCircle className="w-5 h-5 mr-2 text-green-600" />
                        Frequently Asked Questions
                      </h3>
                      <div className="space-y-2">
                        {[
                          { q: "How does Robtor protect my data?", a: "Your health data is encrypted at rest and in transit. We use Supabase security protocols and never share your identifiable data without permission." },
                          { q: "Is the AI medical analysis accurate?", a: "Our AI (powered by Gemini) provides high-accuracy translations of reports, but it is intended for informational purposes and NOT as a medical diagnosis." },
                          { q: "Can I connect my smartwatch?", a: "Yes! If you have a Pro or Elite plan, you can sync data from Google Fit, Apple Health, and other major wearable platforms." }
                        ].map((faq, i) => (
                          <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <span className="text-sm font-semibold text-gray-800">{faq.q}</span>
                              {expandedFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </button>
                            {expandedFaq === i && (
                              <div className="p-4 bg-white border-t border-gray-100 animate-slide-up">
                                <p className="text-xs text-gray-600 leading-relaxed">{faq.a}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact & Feedback */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                          <Mail className="w-5 h-5 mr-2 text-blue-600" />
                          Contact Support
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <a href="mailto:support@robtor.ai" className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
                            <Mail className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-gray-800">Email Us</span>
                            <span className="text-[10px] text-gray-500 text-center mt-1">Response &lt; 24h</span>
                          </a>
                          <button
                            onClick={() => alert('Live Chat starting... Reconnecting to support representative.')}
                            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-green-200 hover:shadow-md transition-all group"
                          >
                            <MessageSquare className="w-6 h-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-gray-800">Live Chat</span>
                            <span className="text-[10px] text-gray-500 text-center mt-1">Avg 2 min wait</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                          <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                          Send Feedback
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Tell us how we can improve..."
                            className="w-full h-24 p-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all"
                          />
                          <button
                            onClick={handleFeedbackSubmit}
                            disabled={loading}
                            className={`w-full mt-3 py-2 rounded-xl text-sm font-bold shadow-md transition-all ${!feedback.trim() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg'}`}
                          >
                            {loading ? 'Sending...' : !feedback.trim() ? 'Write Feedback First' : 'Submit Feedback'}
                          </button>
                        </div>
                      </div>

                      {/* Feedback History */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                          <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
                          My Recent Feedback
                        </h3>
                        <div className="space-y-3">
                          {feedbackHistory.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">No feedback sent yet</p>
                          ) : (
                            feedbackHistory.map(item => (
                              <div key={item.id} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.date}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'Replied' ? 'bg-green-100 text-green-700' : item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {item.status}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 italic">"{item.message}"</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-4">
                    <button onClick={() => alert('Documentation coming soon!')} className="flex items-center text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Help Center
                    </button>
                    <button onClick={() => alert('Privacy Policy coming soon!')} className="flex items-center text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Privacy Policy
                    </button>
                    <button onClick={() => alert('Terms of Service coming soon!')} className="flex items-center text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Terms of Service
                    </button>
                    <button onClick={() => alert('API Documentation coming soon!')} className="flex items-center text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      API Documentation
                    </button>
                  </div>
                </div>
              )}

              {/* Connected Devices Tab */}
              {activeTab === 'devices' && (
                <div className="space-y-8 animate-fade-in text-center">
                  <div className="flex justify-center items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Connected Devices</h2>
                  </div>

                  {/* Coming Soon Card */}
                  <div className="max-w-md mx-auto">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border-2 border-blue-200 shadow-lg">
                      <div className="flex justify-center mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-full shadow-xl">
                          <Smartphone className="w-12 h-12 text-white" />
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-800 mb-3">Coming Soon!</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        We're working on bringing you seamless integration with your favorite health devices and wearables.
                      </p>

                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                        <p className="text-sm font-semibold text-blue-800 mb-2">Planned Features:</p>
                        <ul className="text-xs text-gray-700 space-y-2 text-left">
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-blue-500 mr-2 shrink-0" />
                            <span>Google Fit & Apple Health sync</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-blue-500 mr-2 shrink-0" />
                            <span>Smartwatch integration</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-blue-500 mr-2 shrink-0" />
                            <span>Automatic health data syncing</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
