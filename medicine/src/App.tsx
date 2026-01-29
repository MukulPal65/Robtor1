import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import SplashScreen from './components/SplashScreen';
import Login from './components/Login';
import Signup from './components/Signup';
import Onboarding, { PatientData } from './components/Onboarding';
import DashboardNew from './components/DashboardNew';
import DashboardSimple from './components/DashboardSimple';
import ChatAssistant from './components/ChatAssistant';
import ReportTranslator from './components/ReportTranslator';
import SymptomChecker from './components/SymptomChecker';
import Settings from './components/Settings';
import EmergencyContacts from './components/EmergencyContacts';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import APITestPanel from './components/APITestPanel';
import Navbar from './components/Navbar';

type View = 'splash' | 'login' | 'signup' | 'onboarding' | 'dashboard' | 'chat' | 'report' | 'symptom' | 'settings' | 'emergency' | 'privacy' | 'terms' | 'apitest';

function App() {
  const [currentView, setCurrentView] = useState<View>('splash');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData();
    }
  }, [isAuthenticated]);

  const loadProfileData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      // Map DB fields to PatientData structure
      const mappedData: any = {
        fullName: data.full_name || 'User',
        age: data.age?.toString() || '',
        gender: data.gender || '',
        height: data.height?.toString() || '',
        weight: data.weight?.toString() || '',
        bloodType: data.blood_type || '',
        hasWearable: data.has_wearable || false,
        wearableType: data.wearable_type || '',
        medicalHistory: data.medical_history || [],
        chronicConditions: data.chronic_conditions || [],
        medications: data.medications || [],
        allergies: data.allergies || [],
        emergencyContact: Array.isArray(data.emergency_contact)
          ? data.emergency_contact[0]
          : data.emergency_contact || { name: '', phone: '', relation: '' }
      };
      setPatientData(mappedData);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) {
        // If logged in, go to dashboard (or wherever appropriate)
        if (currentView === 'login' || currentView === 'signup') {
          setCurrentView('dashboard');
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);

      if (session) {
        if (currentView === 'login' || currentView === 'signup' || currentView === 'splash') {
          setCurrentView('dashboard');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView]);

  const handleSplashFinish = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard'); // Always go to onboarding to check wearable status
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPatientData(null);
    setCurrentView('login');
  };

  const handleSignup = () => {
    setCurrentView('onboarding');
  };

  const handleOnboardingComplete = (data: PatientData) => {
    setPatientData(data);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleDashboardRefresh = () => {
    // Reload profile data to refresh dashboard
    loadProfileData();
    // Switch to dashboard view
    setCurrentView('dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'splash':
        return <SplashScreen onFinish={handleSplashFinish} />;
      case 'login':
        return (
          <Login
            onLogin={handleLogin}
            onSignup={() => setCurrentView('signup')}
            onPrivacy={() => setCurrentView('privacy')}
            onTerms={() => setCurrentView('terms')}
          />
        );
      case 'signup':
        return (
          <Signup
            onSignup={handleSignup}
            onLogin={() => setCurrentView('login')}
            onPrivacy={() => setCurrentView('privacy')}
            onTerms={() => setCurrentView('terms')}
          />
        );
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case 'dashboard':
        // Show different dashboard based on wearable availability
        if (patientData?.hasWearable) {
          return <DashboardNew patientName={patientData?.fullName} />;
        } else {
          return <DashboardSimple patientName={patientData?.fullName} />;
        }
      case 'chat':
        return <ChatAssistant patientName={patientData?.fullName} />;
      case 'report':
        return <ReportTranslator onDashboardUpdate={handleDashboardRefresh} />;
      case 'symptom':
        return <SymptomChecker />;
      case 'settings':
        return <Settings patientName={patientData?.fullName} onLogout={handleLogout} onUpdate={handleDashboardRefresh} />;
      case 'emergency':
        return <EmergencyContacts />;
      case 'privacy':
        return <PrivacyPolicy onBack={() => setCurrentView('login')} />;
      case 'terms':
        return <TermsOfService onBack={() => setCurrentView('login')} />;
      case 'apitest':
        return <APITestPanel />;
      default:
        return <DashboardNew />;
    }
  };

  return (
    <div className="relative">
      {renderView()}
      <Navbar isAuthenticated={isAuthenticated} currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

export default App;
