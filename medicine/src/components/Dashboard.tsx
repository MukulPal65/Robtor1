import React, { useState } from 'react';
import { Activity, Heart, Moon, Flame, Bell, TrendingUp, AlertTriangle, Utensils, Dumbbell, ArrowRight, ChevronRight, Pill, Clock, Plus, X, RefreshCw, Droplet, Shield } from 'lucide-react';

import { HealthService, HealthMetric } from '../services/healthService';
import { ReportService, Report } from '../services/reportService';
import { RecommendationService, PersonalizedRecommendation } from '../services/recommendationService';
import { RiskAnalysisService } from '../services/riskAnalysisService';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  patientName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ patientName = 'User' }) => {
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showDietPlan, setShowDietPlan] = useState(false);
  const [showFitnessPlan, setShowFitnessPlan] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Medical Report Ready', message: 'Your latest blood test results have been analyzed.', time: '2 hours ago', unread: true },
    { id: 2, title: 'Medication Reminder', message: 'Time to take your Vitamin D.', time: '1 hour ago', unread: true },
    { id: 3, title: 'Health Goal Reached', message: 'Congratulations! You reached your 10,000 steps goal.', time: 'Yesterday', unread: false },
  ]);
  const [medications] = useState([
    { id: 1, name: 'Vitamin D', time: '8:00 AM', frequency: 'Daily' },
    { id: 2, name: 'Omega-3', time: '8:00 AM', frequency: 'Daily' },
  ]);

  // Real data states
  const [weeklyMetrics, setWeeklyMetrics] = useState<HealthMetric[]>([]);
  const [todayMetric, setTodayMetric] = useState<HealthMetric | null>(null);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = await HealthService.getTodayMetric();
      const weekly = await HealthService.getWeeklyMetrics();
      const report = await ReportService.getLatestReport();
      const recs = await RecommendationService.getPersonalizedRecommendations();

      setLatestReport(report);
      setRecommendations(recs);

      // If no data exists, let's seed some for the user so the dashboard isn't empty
      if (weekly.length === 0) {
        await HealthService.seedDemoData();
        // Fetch again
        const newWeekly = await HealthService.getWeeklyMetrics();
        setWeeklyMetrics(newWeekly);

        // Should also have today now
        const newToday = await HealthService.getTodayMetric();
        setTodayMetric(newToday);
      } else {
        setWeeklyMetrics(weekly);
        setTodayMetric(today);
      }
    } catch (error) {
      console.error("Failed to fetch health data:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);



  const handleRefresh = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  const handleShowAnalytics = async () => {
    setShowAnalytics(true);
    if (!riskAnalysis) {
      // Fast local calculation - no API calls!
      const risk = await RiskAnalysisService.calculateLocalRisk();
      setRiskAnalysis(risk);
    }
  };


  // Format data for charts - use static fallback if no database data
  const weeklyStepsData = weeklyMetrics.length > 0
    ? weeklyMetrics.map(m => ({
      day: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
      steps: m.steps
    }))
    : [
      { day: 'Mon', steps: 8234 },
      { day: 'Tue', steps: 9567 },
      { day: 'Wed', steps: 7834 },
      { day: 'Thu', steps: 10178 },
      { day: 'Fri', steps: 9456 },
      { day: 'Sat', steps: 10890 },
      { day: 'Sun', steps: 9234 },
    ];

  // If we have no data yet (loading or empty), use static fallback values
  const currentSteps = todayMetric?.steps || 9234; // Static fallback: 9,234 steps (92% of 10,000 goal)
  const currentHeartRate = todayMetric?.heart_rate || 78; // Static fallback: 78 bpm (normal resting)
  const currentSleep = todayMetric?.sleep_hours || 7.5; // Static fallback: 7.5 hours

  // Calculate overall health score from latest report or use default
  const overallHealthScore = latestReport?.analysis_result?.health_score || 87;
  const healthScoreLabel = overallHealthScore >= 80 ? 'Excellent' : overallHealthScore >= 60 ? 'Good' : overallHealthScore >= 40 ? 'Fair' : 'Needs Attention';
  const healthScoreColor = overallHealthScore >= 80 ? 'green' : overallHealthScore >= 60 ? 'blue' : overallHealthScore >= 40 ? 'yellow' : 'red';



  // Static Heart Rate Data - 24-hour trend with realistic variations
  const heartRateData = [
    { time: '12am', bpm: 58 },
    { time: '2am', bpm: 55 },
    { time: '4am', bpm: 54 },
    { time: '6am', bpm: 65 },
    { time: '8am', bpm: 72 },
    { time: '10am', bpm: 78 },
    { time: '12pm', bpm: 82 },
    { time: '2pm', bpm: 85 },
    { time: '4pm', bpm: 88 },
    { time: '6pm', bpm: 90 },
    { time: '8pm', bpm: 75 },
    { time: '10pm', bpm: 68 },
  ];

  // Static Sleep Analysis Data - Detailed breakdown of sleep stages
  const sleepData = [
    { name: 'Deep Sleep', value: 35, color: '#6366f1', percentage: '35%' },
    { name: 'Light Sleep', value: 45, color: '#a78bfa', percentage: '45%' },
    { name: 'REM Sleep', value: 15, color: '#c4b5fd', percentage: '15%' },
    { name: 'Awake', value: 5, color: '#e9d5ff', percentage: '5%' },
  ];

  // Static Calories Data - Weekly burned vs consumed comparison
  const caloriesData = [
    { day: 'Mon', burned: 2340, consumed: 1980 },
    { day: 'Tue', burned: 2567, consumed: 2100 },
    { day: 'Wed', burned: 2234, consumed: 1850 },
    { day: 'Thu', burned: 2678, consumed: 2200 },
    { day: 'Fri', burned: 2456, consumed: 2050 },
    { day: 'Sat', burned: 2890, consumed: 2400 },
    { day: 'Sun', burned: 2345, consumed: 2150 },
  ];

  // Static Heart Rate Zones Data - Distribution of time in different HR zones
  // const heartRateZones = [
  //   { zone: 'Resting', range: '50-70 bpm', minutes: 720, color: '#10b981', percentage: 50 },
  //   { zone: 'Fat Burn', range: '70-100 bpm', minutes: 360, color: '#f59e0b', percentage: 25 },
  //   { zone: 'Cardio', range: '100-140 bpm', minutes: 288, color: '#ef4444', percentage: 20 },
  //   { zone: 'Peak', range: '140+ bpm', minutes: 72, color: '#dc2626', percentage: 5 },
  // ];

  // Static Blood Pressure Data (if available from wearable)
  // const bloodPressureData = [
  //   { time: '6am', systolic: 118, diastolic: 76 },
  //   { time: '12pm', systolic: 122, diastolic: 78 },
  //   { time: '6pm', systolic: 125, diastolic: 80 },
  //   { time: '10pm', systolic: 120, diastolic: 77 },
  // ];

  // Static Stress Level Data
  // const stressLevelData = [
  //   { time: '6am', level: 25 },
  //   { time: '9am', level: 45 },
  //   { time: '12pm', level: 60 },
  //   { time: '3pm', level: 75 },
  //   { time: '6pm', level: 55 },
  //   { time: '9pm', level: 30 },
  // ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative overflow-hidden">
      <div className="container mx-auto px-4 mt-4">

      </div>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 text-slate-900 px-6 py-10 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        {/* Header Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-48 h-48 border-2 border-emerald-500 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 border-2 border-teal-500 rounded-full translate-y-1/2 opacity-20 animate-float"></div>
        </div>

        <div className="flex items-center justify-between mb-2 relative z-10 max-w-5xl mx-auto">
          <div>
            <h1 className="text-2xl font-black mb-1 tracking-tight text-slate-900">Welcome back, {patientName}! 👋</h1>
            <p className="text-emerald-600/80 text-sm font-bold">Your vitals are looking excellent today</p>
          </div>
          <div className="flex items-center space-x-4 relative z-10">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="bg-gray-100 p-4 rounded-3xl hover:bg-gray-200 transition-all shadow-xl relative border border-gray-200 active:scale-95 text-slate-900"
            >
              <Bell className="w-6 h-6" />
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-bounce"></span>
              )}
            </button>
            <button
              onClick={handleRefresh}
              className="bg-gray-100 p-4 rounded-3xl hover:bg-gray-200 transition-all shadow-xl active:scale-95 border border-gray-200 text-slate-900"
            >
              <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Drawer Overlay */}
      {showNotifications && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowNotifications(false)}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl animate-fade-in-right overflow-y-auto border-l border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 text-slate-900">
              <h2 className="text-xl font-black flex items-center">
                <Bell className="w-5 h-5 mr-2 text-emerald-600" />
                Notifications
              </h2>
              <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-bold">No new notifications</div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-5 rounded-[2rem] border transition-all hover:border-emerald-500/30 ${notification.unread ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/40 border-white/5'}`}
                  >
                    <div className="flex justify-between items-start mb-1 text-white">
                      <h3 className={`font-black text-sm ${notification.unread ? 'text-emerald-400' : 'text-slate-200'}`}>{notification.title}</h3>
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{notification.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{notification.message}</p>
                    {notification.unread && (
                      <button
                        onClick={() => setNotifications(notifications.map(n => n.id === notification.id ? { ...n, unread: false } : n))}
                        className="mt-3 text-[10px] font-black text-emerald-400 uppercase hover:underline tracking-widest"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )
      }

      <div className="px-6 -mt-6">
        {/* Overall Health Score */}
        <div className="card mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Overall Health Score</h3>
                <p className="text-xs text-gray-600">Based on your wearable data & activity</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle cx="48" cy="48" r="40" stroke="url(#healthGradient)" strokeWidth="8" fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (overallHealthScore / 100))}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-600">{overallHealthScore}%</span>
                </div>
              </div>
              <p className={`text-xs font-semibold text-${healthScoreColor}-600 mt-1`}>{healthScoreLabel}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Steps Card */}
          <div className="card hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="bg-blue-50 p-4 rounded-2xl group-hover:bg-blue-500 transition-colors duration-300">
                <Activity className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
            </div>
            <h3 className="text-xs font-bold text-gray-500 mb-1">Steps</h3>
            <p className="text-2xl font-bold text-gray-800 tracking-tighter">{currentSteps.toLocaleString()}</p>
            <div className="flex items-center mt-3 relative z-10">
              <div className="flex-1 bg-gray-100 rounded-full h-2.5 mr-2 overflow-hidden shadow-inner">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full shadow-lg" style={{ width: '92%' }}></div>
              </div>
              <span className="text-[10px] font-black text-blue-600">92%</span>
            </div>
          </div>

          {/* Heart Rate Card */}
          <div className="card hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="bg-red-50 p-4 rounded-2xl group-hover:bg-red-500 transition-colors duration-300">
                <Heart className="w-6 h-6 text-red-600 group-hover:text-white" />
              </div>
            </div>
            <h3 className="text-xs font-bold text-gray-500 mb-1">Heart Rate</h3>
            <p className="text-2xl font-bold text-gray-800 tracking-tighter">{currentHeartRate} <span className="text-xs font-medium text-gray-400">bpm</span></p>
            <div className="flex items-center mt-3 text-[10px] font-bold text-green-600 uppercase tracking-widest">
              <span className="flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Healthy resting
            </div>
          </div>

          {/* Sleep Card */}
          <div className="card hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="bg-purple-50 p-4 rounded-2xl group-hover:bg-purple-500 transition-colors duration-300">
                <Moon className="w-6 h-6 text-purple-600 group-hover:text-white" />
              </div>
            </div>
            <h3 className="text-xs font-bold text-gray-500 mb-1">Sleep</h3>
            <p className="text-2xl font-bold text-gray-800 tracking-tighter">{currentSleep} <span className="text-xs font-medium text-gray-400">hrs</span></p>
            <p className="text-[10px] font-bold text-purple-600 mt-3 uppercase tracking-widest">+12 min vs avg</p>
          </div>

          {/* Calories Card */}
          <div className="card hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="bg-orange-50 p-4 rounded-2xl group-hover:bg-orange-500 transition-colors duration-300">
                <Flame className="w-6 h-6 text-orange-600 group-hover:text-white" />
              </div>
            </div>
            <h3 className="text-xs font-bold text-gray-500 mb-1">Calories</h3>
            <p className="text-2xl font-bold text-gray-800 tracking-tighter">2,345</p>
            <p className="text-[10px] font-bold text-orange-600 mt-3 uppercase tracking-widest">Today's burn</p>
          </div>
        </div>

        {/* Early Risk Prediction - Main Feature */}
        <div className="card mb-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-red-500 to-orange-600 p-3 rounded-xl shadow-lg">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-800 mb-2">Early Risk Prediction</h3>
              <p className="text-sm text-gray-600 mb-3">
                AI-powered analysis of your health trends to predict and prevent future risks
              </p>

              {/* Risk Cards */}
              <div className="space-y-3">
                {/* Low Risk */}
                <div className="bg-white rounded-xl p-4 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">Cardiovascular Health</span>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">Low Risk</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Your heart rate and activity levels are excellent. Keep up the good work!</p>
                  <div className="flex items-center text-xs text-green-700">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="font-semibold">Prevention: Continue regular exercise and balanced diet</span>
                  </div>
                </div>

                {/* Medium Risk */}
                <div className="bg-white rounded-xl p-4 border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">Sleep Quality</span>
                    <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">Medium Risk</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Slight irregularities detected in sleep patterns over the past week.</p>
                  <div className="flex items-center text-xs text-yellow-700">
                    <Moon className="w-4 h-4 mr-1" />
                    <span className="font-semibold">Treatment: Aim for consistent 8-hour sleep schedule</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleShowAnalytics}
                className="w-full mt-4 bg-gradient-to-r from-red-500 to-orange-600 text-white py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                <span>View Detailed Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Custom Diet & Fitness Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Custom Diet Plan */}
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-lg transition-all">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-800">Custom Diet Plan</h3>
                <p className="text-xs text-gray-600 mt-1">AI-generated based on your health data</p>
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
                <h3 className="text-base font-bold text-gray-800">Custom Fitness Plan</h3>
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
                        30 min cardio (based on heart rate)
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

        {/* Medication Reminders */}
        <div className="card mb-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Medication Reminders</h3>
                <p className="text-xs text-gray-600">Never miss your medications</p>
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
            <div className="text-center py-8 text-gray-500">
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

        {/* Analytics Section */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Your Health Analytics</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weekly Steps */}
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-4">Weekly Steps</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyStepsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Bar dataKey="steps" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Heart Rate Trend */}
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-4">Heart Rate Trend</h4>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={heartRateData}>
                  <defs>
                    <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="bpm" stroke="#ef4444" fillOpacity={1} fill="url(#colorBpm)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Sleep Analysis */}
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-4">Sleep Analysis</h4>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={sleepData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sleepData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-2">
                {sleepData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calories Burned vs Consumed */}
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-4">Calories: Burned vs Consumed</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={caloriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="burned" fill="#f97316" radius={[8, 8, 0, 0]} name="Burned" />
                  <Bar dataKey="consumed" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Consumed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Daily Goals Progress */}
        <div className="card mb-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Today's Progress</h3>
          <div className="grid grid-cols-3 gap-6">
            {/* Steps Circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.92)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-800">92%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700 mt-2">Steps</p>
              <p className="text-xs text-gray-500">9,234/10,000</p>
            </div>

            {/* Water Circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#06b6d4"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.75)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-800">75%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700 mt-2">Water</p>
              <p className="text-xs text-gray-500">6/8 glasses</p>
            </div>

            {/* Calories Circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#f97316"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.88)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-800">88%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700 mt-2">Calories</p>
              <p className="text-xs text-gray-500">2,345/2,650</p>
            </div>
          </div>
        </div>
      </div>

      {/* Diet Plan Modal */}
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

              <div className="space-y-6">
                {/* Daily Nutrition Goals */}
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <h4 className="font-bold text-gray-800 mb-3">Daily Nutrition Goals</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600">Calories</p>
                      <p className="text-lg font-bold text-gray-800">2,150</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600">Protein</p>
                      <p className="text-lg font-bold text-gray-800">120g</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600">Carbs</p>
                      <p className="text-lg font-bold text-gray-800">200g</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600">Fats</p>
                      <p className="text-lg font-bold text-gray-800">65g</p>
                    </div>
                  </div>
                </div>

                {/* Meal Plan */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Today's Meal Plan</h4>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-gray-800">Breakfast</h5>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {recommendations?.diet.breakfast.map((item, i) => (
                          <li key={i}>• {item}</li>
                        )) || <li>• Oatmeal with berries and almonds</li>}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-gray-800">Lunch</h5>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {recommendations?.diet.lunch.map((item, i) => (
                          <li key={i}>• {item}</li>
                        )) || <li>• Grilled chicken breast with vegetables</li>}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-gray-800">Dinner</h5>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {recommendations?.diet.dinner.map((item, i) => (
                          <li key={i}>• {item}</li>
                        )) || <li>• Baked salmon with steamed broccoli</li>}
                      </ul>
                    </div>

                    {recommendations?.diet.snacks && recommendations.diet.snacks.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-gray-800">Snacks</h5>
                        </div>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {recommendations.diet.snacks.map((snack: string, i: number) => (
                            <li key={i}>• {snack}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {recommendations?.diet.avoid && recommendations.diet.avoid.length > 0 && (
                      <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-red-800">Foods to Avoid</h5>
                        </div>
                        <ul className="space-y-1 text-sm text-red-700">
                          {recommendations.diet.avoid.map((food: string, i: number) => (
                            <li key={i}>• {food}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-200">
                  <h4 className="font-bold text-gray-800 mb-2">💡 Nutrition Tips</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• {recommendations?.diet.hydration || 'Drink 8-10 glasses of water throughout the day'}</li>
                    <li>• Eat slowly and mindfully</li>
                    <li>• Avoid processed foods and added sugars</li>
                    <li>• Include protein in every meal for sustained energy</li>
                    {recommendations?.lifestyle.habits.slice(0, 2).map((habit, i) => (
                      <li key={i}>• {habit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Fitness Plan Modal */}
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

              <div className="space-y-6">
                {/* Weekly Progress */}
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <h4 className="font-bold text-gray-800 mb-3">This Week's Progress</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">4/5</p>
                      <p className="text-xs text-gray-600">Workouts</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">245</p>
                      <p className="text-xs text-gray-600">Minutes</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-orange-600">1,850</p>
                      <p className="text-xs text-gray-600">Calories</p>
                    </div>
                  </div>
                </div>

                {/* Today's Workout */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Personalized Workout Plan</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {recommendations?.exercise.duration} • {recommendations?.exercise.frequency}
                  </p>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-gray-800">Cardio Exercises</h5>
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Primary</span>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {recommendations?.exercise.cardio.map((exercise, i) => (
                          <li key={i} className="flex items-center">
                            <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold">{i + 1}</span>
                            {exercise}
                          </li>
                        )) || <li>• Brisk walking 30 minutes</li>}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-gray-800">Strength Training</h5>
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Build</span>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {recommendations?.exercise.strength.map((exercise, i) => (
                          <li key={i} className="flex items-center">
                            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold">{i + 1}</span>
                            {exercise}
                          </li>
                        )) || <li>• Bodyweight exercises</li>}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-gray-800">Flexibility & Recovery</h5>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Essential</span>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {recommendations?.exercise.flexibility.map((exercise, i) => (
                          <li key={i} className="flex items-center">
                            <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold">{i + 1}</span>
                            {exercise}
                          </li>
                        )) || <li>• Stretching routine</li>}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-200">
                  <h4 className="font-bold text-gray-800 mb-2">💪 Fitness Tips</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Stay hydrated - drink water before, during, and after exercise</li>
                    <li>• Listen to your body - rest if you feel pain</li>
                    <li>• Maintain proper form to prevent injuries</li>
                    <li>• Your heart rate data helps optimize cardio intensity</li>
                  </ul>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                  Start Workout Session
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Analytics Modal */}
      {
        showAnalytics && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-red-500 to-orange-600 p-3 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Detailed Risk Analysis</h3>
                </div>
                <button onClick={() => setShowAnalytics(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {riskAnalysis ? (
                <div className="space-y-6">
                  {/* Risk Overview */}
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border-2 border-red-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-800 mb-0 text-lg">Health Risk Overview</h4>
                      <span className={`px-4 py-2 rounded-full font-bold text-sm ${riskAnalysis.overall_risk === 'Low' ? 'bg-green-100 text-green-700' :
                        riskAnalysis.overall_risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {riskAnalysis.overall_risk} Risk Overall
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Analysis Confidence: {riskAnalysis.confidence}% • Based on your latest health reports and activity metrics
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {riskAnalysis.risk_areas.slice(0, 3).map((area: any, idx: number) => {
                        const IconComponent = area.icon_suggestion === 'Heart' ? Heart :
                          area.icon_suggestion === 'Moon' ? Moon :
                            area.icon_suggestion === 'Droplet' ? Droplet :
                              area.icon_suggestion === 'Shield' ? Shield : Activity;
                        const riskColor = area.risk_level === 'Low' ? 'green' :
                          area.risk_level === 'Medium' ? 'yellow' : 'red';

                        return (
                          <div key={idx} className={`bg-white rounded-lg p-4 text-center border-2 border-${riskColor}-200`}>
                            <div className={`w-16 h-16 mx-auto bg-${riskColor}-100 rounded-full flex items-center justify-center mb-2`}>
                              <IconComponent className={`w-8 h-8 text-${riskColor}-600`} />
                            </div>
                            <p className={`text-2xl font-bold text-${riskColor}-600`}>{area.risk_level}</p>
                            <p className="text-xs text-gray-600 mt-1">{area.category}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Analysis */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-4 text-lg">Detailed Analysis</h4>
                    <div className="space-y-4">
                      {riskAnalysis.risk_areas.map((area: any, idx: number) => {
                        const riskColor = area.risk_level === 'Low' ? 'green' :
                          area.risk_level === 'Medium' ? 'yellow' : 'red';
                        const IconComponent = area.icon_suggestion === 'Heart' ? Heart :
                          area.icon_suggestion === 'Moon' ? Moon :
                            area.icon_suggestion === 'Droplet' ? Droplet :
                              area.icon_suggestion === 'Shield' ? Shield : Activity;

                        return (
                          <div key={idx} className={`bg-${riskColor}-50 rounded-xl p-5 border-2 border-${riskColor}-200`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <IconComponent className={`w-6 h-6 text-${riskColor}-600`} />
                                <h5 className="font-bold text-gray-800">{area.category}</h5>
                              </div>
                              <span className={`bg-${riskColor}-100 text-${riskColor}-600 px-3 py-1 rounded-full text-sm font-bold`}>
                                {area.risk_level} Risk
                              </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-700">
                              <p><strong>Current Status:</strong> {area.current_status}</p>
                              <p><strong>Prediction:</strong> {area.prediction}</p>
                              <p className={`text-${riskColor}-700 font-semibold mt-3`}>
                                {area.risk_level === 'Low' ? '✓' : '⚠'} Recommendations: {area.recommendations}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Positive Trends & Improvements */}
                  {(riskAnalysis.positive_trends?.length > 0 || riskAnalysis.areas_for_improvement?.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {riskAnalysis.positive_trends?.length > 0 && (
                        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                          <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                            Positive Trends
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {riskAnalysis.positive_trends.map((trend: string, i: number) => (
                              <li key={i}>✓ {trend}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {riskAnalysis.areas_for_improvement?.length > 0 && (
                        <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                          <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                            Areas for Improvement
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {riskAnalysis.areas_for_improvement.map((area: string, i: number) => (
                              <li key={i}>• {area}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Plan */}
                  {riskAnalysis.action_plan && (
                    <div className="bg-indigo-50 rounded-xl p-5 border-2 border-indigo-200">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                        30-Day Action Plan
                      </h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>• <strong>Week 1-2:</strong> {riskAnalysis.action_plan.week_1_2}</p>
                        <p>• <strong>Week 2-3:</strong> {riskAnalysis.action_plan.week_2_3}</p>
                        <p>• <strong>Week 3-4:</strong> {riskAnalysis.action_plan.week_3_4}</p>
                        <p>• <strong>Ongoing:</strong> {riskAnalysis.action_plan.ongoing}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Unable to load risk analysis</p>
                  <button
                    onClick={async () => {
                      const risk = await RiskAnalysisService.calculateLocalRisk();
                      setRiskAnalysis(risk);
                    }}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Dashboard;
