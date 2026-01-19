import React, { useState } from 'react';
import { Activity, Moon, Droplet, TrendingUp, Clock, Apple, Pill, Brain, Heart, Smartphone, Zap, Plus, ArrowRight, Calendar, X, Utensils, Dumbbell, ChevronRight, PlayCircle, AlertTriangle } from 'lucide-react';
import { ReportService, Report } from '../services/reportService';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface DashboardSimpleProps {
  patientName?: string;
}

const DashboardSimple: React.FC<DashboardSimpleProps> = ({ patientName = 'User' }) => {
  const [waterCount, setWaterCount] = useState(6);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showDietPlan, setShowDietPlan] = useState(false);
  const [showFitnessPlan, setShowFitnessPlan] = useState(false);
  const [medications] = useState([
    { id: 1, name: 'Morning Vitamins', time: '8:00 AM', frequency: 'Daily' },
  ]);
  const [latestReport, setLatestReport] = useState<Report | null>(null);

  React.useEffect(() => {
    fetchLatestData();
  }, []);

  const fetchLatestData = async () => {
    try {
      const report = await ReportService.getLatestReport();
      setLatestReport(report);
    } catch (e) {
      console.error(e);
    }
  };

  // Static Health Data for users without wearables
  // Heart Rate Data - Manual entries or estimated based on activity
  /* Unused variables - commenting out to satisfy compiler */
  // const heartRateData = [
  //   { time: 'Morning', bpm: 68, status: 'Resting' },
  //   { time: 'Afternoon', bpm: 82, status: 'Active' },
  //   { time: 'Evening', bpm: 75, status: 'Normal' },
  // ];

  // Activity Summary - Manual tracking
  const activitySummary = {
    steps: 7500,
    stepsGoal: 10000,
    activeMinutes: 45,
    activeGoal: 60,
    distance: 5.2, // km
  };

  // Sleep Tracking - Manual entry
  const sleepTracking = {
    lastNight: 7.5,
    quality: 'Good',
    weekAverage: 7.2,
    goal: 8,
  };

  // Weekly Activity Pattern
  // const weeklyActivity = [
  //   { day: 'Mon', minutes: 30, type: 'Walking' },
  //   { day: 'Tue', minutes: 45, type: 'Yoga' },
  //   { day: 'Wed', minutes: 0, type: 'Rest' },
  //   { day: 'Thu', minutes: 60, type: 'Gym' },
  //   { day: 'Fri', minutes: 30, type: 'Walking' },
  //   { day: 'Sat', minutes: 90, type: 'Hiking' },
  //   { day: 'Sun', minutes: 45, type: 'Cycling' },
  // ];

  // Weekly Steps Data for Graph
  const weeklyStepsData = [
    { day: 'Mon', steps: 8234 },
    { day: 'Tue', steps: 9567 },
    { day: 'Wed', steps: 7834 },
    { day: 'Thu', steps: 10178 },
    { day: 'Fri', steps: 9456 },
    { day: 'Sat', steps: 10890 },
    { day: 'Sun', steps: 9234 },
  ];

  // Nutrition Tracking
  // const nutritionData = {
  //   caloriesConsumed: 1850,
  //   caloriesGoal: 2100,
  //   protein: 85, // grams
  //   carbs: 220,
  //   fats: 65,
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-24 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 text-white px-6 py-10 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Header Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 border-2 border-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="flex items-center justify-between mb-2 relative z-10">
          <div>
            <h1 className="text-3xl font-bold mb-1 drop-shadow-lg">Hello, {patientName}! 👋</h1>
            <p className="text-purple-100 text-base">Let's build healthy habits together</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-lg">
            <Heart className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs mb-1">Today's Health Score</p>
              <p className="text-3xl font-bold">85%</p>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-xs mb-1">Streak</p>
              <p className="text-2xl font-bold">7 days 🔥</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8">
        {/* Connect Device CTA - Featured */}
        <div className="card bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white mb-6 shadow-2xl border-0 transform hover:scale-[1.02] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <span className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                  RECOMMENDED
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Connect Your Device</h3>
              <p className="text-white/90 text-sm mb-4 leading-relaxed">
                Sync your smartwatch or fitness tracker for automatic health monitoring, real-time insights, and personalized AI recommendations.
              </p>
              <button className="w-full bg-white text-purple-600 py-3 rounded-xl text-sm font-bold hover:shadow-xl transition-all flex items-center justify-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Connect Device Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Activity Card */}
          <div className="card hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Daily Steps</h3>
            <p className="text-2xl font-bold text-gray-800 mb-1">{activitySummary.steps.toLocaleString()}</p>
            <p className="text-xs text-blue-600 font-semibold">{Math.round((activitySummary.steps / activitySummary.stepsGoal) * 100)}% of goal →</p>
          </div>

          {/* Meals Card */}
          <div className="card hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <Apple className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Meals</h3>
            <p className="text-2xl font-bold text-gray-800 mb-1">Track</p>
            <p className="text-xs text-orange-600 font-semibold">Food diary →</p>
          </div>

          {/* Water Card */}
          <div className="card hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <Droplet className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Water Intake</h3>
            <p className="text-2xl font-bold text-gray-800 mb-1">{waterCount}/8</p>
            <button
              onClick={() => setWaterCount(prev => Math.min(prev + 1, 8))}
              className="text-xs text-cyan-600 font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add glass</span>
            </button>
          </div>

          {/* Sleep Card */}
          <div className="card hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <Moon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Sleep</h3>
            <p className="text-2xl font-bold text-gray-800 mb-1">{sleepTracking.lastNight}h</p>
            <p className="text-xs text-purple-600 font-semibold">{sleepTracking.quality} quality →</p>
          </div>
        </div>

        {/* Health Insights */}
        <div className="card mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">AI Health Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-white border-2 border-green-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Great Progress! 🎉</p>
                  <p className="text-xs text-gray-600 mt-1">You're doing amazing! Just 2 more glasses to reach your daily water goal.</p>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-blue-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600 flex-shrink-0" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Time to Move! 🚶</p>
                  <p className="text-xs text-gray-600 mt-1">Try to get at least 30 minutes of activity today for optimal health.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Steps Analysis Graph */}
        <div className="card mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Weekly Steps Trends</h3>
                <p className="text-xs text-gray-600">Your activity over the last 7 days</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">65,403</p>
              <p className="text-xs text-blue-600 font-bold">Total Steps</p>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 h-64 w-full border border-blue-100 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStepsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} steps`, 'Steps']}
                  labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                />
                <Bar dataKey="steps" radius={[6, 6, 0, 0]} barSize={32}>
                  {weeklyStepsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === weeklyStepsData.length - 1 ? '#4f46e5' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Custom Diet & Fitness Plans - Same as Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Custom Diet Plan */}
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-lg transition-all">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">Custom Diet Plan</h3>
                <p className="text-xs text-gray-600 mt-1">AI-generated based on your goals</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-800">Today's Goal</span>
                  <span className="text-xs text-green-600 font-bold">2,150 cal</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">1,462 consumed • 688 remaining</p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Recommended Meals:</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {latestReport?.analysis_result?.diet_plan?.breakfast || 'High-protein breakfast with oats'}
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {latestReport?.analysis_result?.diet_plan?.lunch || 'Grilled chicken with vegetables'}
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {latestReport?.analysis_result?.diet_plan?.dinner || 'Light dinner with salmon'}
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowDietPlan(true)}
              className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2">
              <span>View Full Plan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Custom Fitness Plan */}
          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:shadow-lg transition-all">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">Custom Fitness Plan</h3>
                <p className="text-xs text-gray-600 mt-1">Personalized workout schedule</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-800">Weekly Progress</span>
                  <span className="text-xs text-blue-600 font-bold">4/5 days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">1 workout remaining this week</p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Today's Workout:</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  {latestReport?.analysis_result?.fitness_plan?.exercises ? (
                    latestReport.analysis_result.fitness_plan.exercises.map((ex: any, i: number) => (
                      <li key={i} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {ex.name} ({ex.duration})
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        30 min cardio workout
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Upper body strength training
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowFitnessPlan(true)}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2">
              <span>Start Workout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Medications & Reminders */}
        <div className="card mb-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 rounded-xl shadow-lg">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Medication Reminders</h3>
                <p className="text-xs text-gray-600">Stay on track with your meds</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddMedication(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-2 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 relative z-10">
            {medications.map((med) => (
              <div key={med.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Pill className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{med.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{med.time}</span>
                        <span className="text-purple-600">• {med.frequency}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-green-600 hover:text-green-700 bg-green-100 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-md">
                    Take
                  </button>
                </div>
              </div>
            ))}
          </div>

          {medications.length === 0 && (
            <div className="text-center py-8 text-gray-500 relative z-10">
              <Pill className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No medications added yet</p>
              <p className="text-xs mt-1">Click + to add your first medication</p>
            </div>
          )}
        </div>

        {/* Add Medication Modal */}
        {showAddMedication && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add Medication</h3>
                <button
                  onClick={() => setShowAddMedication(false)}
                  className="text-gray-400 hover:text-gray-600 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medication Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Aspirin, Vitamin C"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Daily</option>
                    <option>Twice Daily</option>
                    <option>Three Times Daily</option>
                    <option>Weekly</option>
                    <option>As Needed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    placeholder="e.g., Take with food"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddMedication(false)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add medication logic here
                    setShowAddMedication(false);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Add Reminder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Health Goals */}
        <div className="card mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
          <div className="flex items-center space-x-3 mb-5">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Your Health Goals</h3>
          </div>
          <div className="space-y-5">
            {/* Water Goal */}
            <div className="bg-white rounded-xl p-4 border-2 border-cyan-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Droplet className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm font-bold text-gray-700">Daily Water</span>
                </div>
                <span className="text-sm font-bold text-cyan-600">{waterCount}/8 glasses</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${(waterCount / 8) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Activity Goal */}
            <div className="bg-white rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-gray-700">Weekly Activity</span>
                </div>
                <span className="text-sm font-bold text-green-600">3/5 days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all shadow-lg" style={{ width: '60%' }}></div>
              </div>
            </div>

            {/* Sleep Goal */}
            <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-bold text-gray-700">Sleep Quality</span>
                </div>
                <span className="text-sm font-bold text-purple-600">Excellent</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all shadow-lg" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="card bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-2.5 rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">This Week</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border-2 border-amber-200">
              <p className="text-2xl font-bold text-amber-600">52</p>
              <p className="text-xs text-gray-600 mt-1">Glasses</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border-2 border-green-200">
              <p className="text-2xl font-bold text-green-600">3</p>
              <p className="text-xs text-gray-600 mt-1">Workouts</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border-2 border-purple-200">
              <p className="text-2xl font-bold text-purple-600">7.5h</p>
              <p className="text-xs text-gray-600 mt-1">Avg Sleep</p>
            </div>
          </div>
        </div>
      </div>

      {/* Same Modals as Dashboard */}
      {
        showDietPlan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                    <Utensils className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Your Custom Diet Plan</h3>
                </div>
                <button onClick={() => setShowDietPlan(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-gray-800 mb-2">Breakfast</h4>
                  <p className="text-sm text-gray-700">{latestReport?.analysis_result?.diet_plan?.breakfast || 'Oatmeal with berries and almonds'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-gray-800 mb-2">Lunch</h4>
                  <p className="text-sm text-gray-700">{latestReport?.analysis_result?.diet_plan?.lunch || 'Grilled chicken breast'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-gray-800 mb-2">Dinner</h4>
                  <p className="text-sm text-gray-700">{latestReport?.analysis_result?.diet_plan?.dinner || 'Baked salmon'}</p>
                </div>
                {latestReport?.analysis_result?.diet_plan?.avoid && (
                  <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> Avoid</h4>
                    <ul className="text-sm text-red-700">
                      {latestReport.analysis_result.diet_plan.avoid.map((f: string, i: number) => <li key={i}>• {f}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {
        showFitnessPlan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Your Custom Fitness Plan</h3>
                </div>
                <button onClick={() => setShowFitnessPlan(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800">{latestReport?.analysis_result?.fitness_plan?.routine_name || 'Daily Routine'}</h4>
                <p className="text-blue-600 font-medium mb-4">{latestReport?.analysis_result?.fitness_plan?.weekly_goal}</p>

                {latestReport?.analysis_result?.fitness_plan?.exercises?.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <PlayCircle className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{ex.name}</p>
                        <p className="text-xs text-gray-500">{ex.benefit}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-blue-700">{ex.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default DashboardSimple;
