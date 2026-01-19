import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, ArrowRight, ArrowLeft, CheckCircle, Smartphone, Activity, Calendar, AlertCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (data: PatientData) => void;
}

export interface PatientData {
  age: string;
  gender: string;
  height: string;
  weight: string;
  bloodType: string;
  hasWearable: boolean;
  wearableType: string;
  medicalHistory: string[];
  chronicConditions: string[];
  medications: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [patientData, setPatientData] = useState<PatientData>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    bloodType: '',
    hasWearable: false,
    wearableType: '',
    medicalHistory: [],
    chronicConditions: [],
    medications: [],
    allergies: [],
    emergencyContact: { name: '', phone: '', relation: '' },
  });

  const [loading, setLoading] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding and send data to server
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("No authenticated user found");
        }

        const { error } = await supabase.from('profiles').update({
          age: parseInt(patientData.age) || null,
          gender: patientData.gender,
          height: parseFloat(patientData.height) || null,
          weight: parseFloat(patientData.weight) || null,
          blood_type: patientData.bloodType,
          has_wearable: patientData.hasWearable,
          wearable_type: patientData.wearableType,
          medical_history: patientData.medicalHistory,
          chronic_conditions: patientData.chronicConditions,
          medications: patientData.medications,
          allergies: patientData.allergies,
          emergency_contact: [patientData.emergencyContact]
        }).eq('id', user.id);

        if (error) {
          throw error;
        }

        alert("Profile completed successfully!");
        onComplete(patientData);

      } catch (error: any) {
        console.error('Error saving onboarding data:', error);
        alert(error.message || "Error saving profile data. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const commonConditions = [
    'Diabetes', 'Hypertension', 'Asthma', 'Heart Disease',
    'Arthritis', 'Thyroid Disorder', 'High Cholesterol', 'Migraine'
  ];

  const toggleCondition = (condition: string) => {
    setPatientData(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter(c => c !== condition)
        : [...prev.chronicConditions, condition]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
              <Heart className="w-12 h-12 text-white" fill="white" />
            </div>
          </div>
          <div className="flex justify-end absolute top-6 right-6">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Sign Out / Reset
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Help us personalize your health experience</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">Step {step} of {totalSteps}</span>
            <span className="text-sm font-semibold text-green-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-slide-up">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={patientData.age}
                    onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                    placeholder="25"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    value={patientData.gender}
                    onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={patientData.height}
                    onChange={(e) => setPatientData({ ...patientData, height: e.target.value })}
                    placeholder="170"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={patientData.weight}
                    onChange={(e) => setPatientData({ ...patientData, weight: e.target.value })}
                    placeholder="70"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPatientData({ ...patientData, bloodType: type })}
                        className={`py-3 rounded-xl font-semibold transition-all ${patientData.bloodType === type
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Wearable Devices */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Wearable Devices</h2>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Connecting wearable devices helps us provide more accurate health insights and real-time monitoring.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Do you have a smartwatch or fitness tracker?
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setPatientData({ ...patientData, hasWearable: true })}
                    className={`flex-1 py-4 rounded-xl font-semibold transition-all ${patientData.hasWearable
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Yes, I have one
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientData({ ...patientData, hasWearable: false, wearableType: '' })}
                    className={`flex-1 py-4 rounded-xl font-semibold transition-all ${!patientData.hasWearable
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    No, I don't
                  </button>
                </div>
              </div>

              {patientData.hasWearable && (
                <div className="animate-slide-up">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select your device
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Apple Watch', icon: '⌚' },
                      { name: 'Fitbit', icon: '📱' },
                      { name: 'Samsung Galaxy', icon: '⌚' },
                      { name: 'Garmin', icon: '🏃' },
                      { name: 'Xiaomi Mi Band', icon: '⌚' },
                      { name: 'Other', icon: '📲' },
                    ].map((device) => (
                      <button
                        key={device.name}
                        type="button"
                        onClick={() => setPatientData({ ...patientData, wearableType: device.name })}
                        className={`p-4 rounded-xl font-semibold transition-all text-left ${patientData.wearableType === device.name
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        <span className="text-2xl mb-2 block">{device.icon}</span>
                        <span className="text-sm">{device.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Medical History */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Medical History</h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Do you have any of these chronic conditions?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {commonConditions.map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => toggleCondition(condition)}
                      className={`p-3 rounded-xl text-sm font-semibold transition-all ${patientData.chronicConditions.includes(condition)
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Medications (Optional)
                </label>
                <textarea
                  value={patientData.medications.join(', ')}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    medications: e.target.value.split(',').map(m => m.trim()).filter(m => m)
                  })}
                  placeholder="List your current medications, separated by commas"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Allergies (Optional)
                </label>
                <textarea
                  value={patientData.allergies.join(', ')}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                  })}
                  placeholder="List any allergies, separated by commas"
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 4: Emergency Contact */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Emergency Contact</h2>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-purple-800">
                  This information will be used only in case of emergencies and will be kept secure.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name</label>
                <input
                  type="text"
                  value={patientData.emergencyContact.name}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    emergencyContact: { ...patientData.emergencyContact, name: e.target.value }
                  })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={patientData.emergencyContact.phone}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    emergencyContact: { ...patientData.emergencyContact, phone: e.target.value }
                  })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                <select
                  value={patientData.emergencyContact.relation}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    emergencyContact: { ...patientData.emergencyContact, relation: e.target.value }
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mt-6">
                <h3 className="font-bold text-gray-800 mb-3">🎉 You're all set!</h3>
                <p className="text-sm text-gray-600">
                  Complete your profile to start your personalized health journey with Robtor.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${step === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{step === totalSteps ? (loading ? 'Saving...' : 'Complete') : 'Next'}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
              {loading && <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;