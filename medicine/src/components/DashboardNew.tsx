import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  TrendingUp,
  Bell,
  Droplets,
  Moon,
  Flame,
  Target,
  Shield,
  Apple,
  Dumbbell,
  Brain,
  Sparkles,
  ArrowRight,
  Zap,
  Plus,
  X,
  PlayCircle
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { HealthService, HealthMetric } from '../services/healthService';
import { ReportService, Report } from '../services/reportService';
import { RecommendationService, PersonalizedRecommendation } from '../services/recommendationService';
import { RiskAnalysisService } from '../services/riskAnalysisService';

interface DashboardProps {
  patientName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ patientName = 'User' }) => {
  // Real data states
  const [weeklyMetrics, setWeeklyMetrics] = useState<HealthMetric[]>([]);
  const [todayMetric, setTodayMetric] = useState<HealthMetric | null>(null);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showDietPlan, setShowDietPlan] = useState(false);
  const [showFitnessPlan, setShowFitnessPlan] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = await HealthService.getTodayMetric();
      const weekly = await HealthService.getWeeklyMetrics();
      const report = await ReportService.getLatestReport();
      const recs = await RecommendationService.getPersonalizedRecommendations();
      const risk = await RiskAnalysisService.calculateLocalRisk();

      setLatestReport(report);
      setRecommendations(recs);
      setRiskAnalysis(risk);

      if (weekly.length === 0) {
        await HealthService.seedDemoData();
        const newWeekly = await HealthService.getWeeklyMetrics();
        setWeeklyMetrics(newWeekly);
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

  useEffect(() => {
    fetchData();
  }, []);

  // Format data for charts - use static fallback if no database data or loading
  const stepsGoal = 10000;
  const waterGoal = 8;

  const stepsToday = todayMetric?.steps || 9234;
  const heartRateToday = todayMetric?.heart_rate || 72;
  const sleepToday = todayMetric?.sleep_hours || 7.5;
  const caloriesBurnedToday = Math.round(stepsToday * 0.04) || 2300;

  const stepsProgress = Math.min((stepsToday / stepsGoal) * 100, 100);
  const waterIntake = 6; // To be connected to water service if available
  const waterProgress = (waterIntake / waterGoal) * 100;
  const caloriesProgress = 72; // Sample progress for now

  // Process weekly data
  const processedWeeklySteps = weeklyMetrics.length > 0
    ? weeklyMetrics.map(m => ({
      day: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
      steps: m.steps,
      goal: stepsGoal
    }))
    : [
      { day: 'Mon', steps: 8234, goal: 10000 },
      { day: 'Tue', steps: 9567, goal: 10000 },
      { day: 'Wed', steps: 7834, goal: 10000 },
      { day: 'Thu', steps: 10178, goal: 10000 },
      { day: 'Fri', steps: 9456, goal: 10000 },
      { day: 'Sat', steps: 10890, goal: 10000 },
      { day: 'Sun', steps: 9234, goal: 10000 },
    ];

  const processedHeartRateTrend = [
    { time: '00:00', bpm: 65 },
    { time: '04:00', bpm: 62 },
    { time: '08:00', bpm: 75 },
    { time: '12:00', bpm: 80 },
    { time: '16:00', bpm: 78 },
    { time: '20:00', bpm: 72 },
    { time: '24:00', bpm: 68 },
  ];

  const processedSleepAnalysis = [
    { name: 'Deep', value: 25, color: '#8b5cf6' },
    { name: 'Light', value: 45, color: '#a78bfa' },
    { name: 'REM', value: 20, color: '#c4b5fd' },
    { name: 'Awake', value: 10, color: '#e9d5ff' },
  ];

  const processedCaloriesData = [
    { day: 'Mon', burned: 2400, consumed: 2100 },
    { day: 'Tue', burned: 2800, consumed: 2300 },
    { day: 'Wed', burned: 2200, consumed: 2000 },
    { day: 'Thu', burned: 2600, consumed: 2200 },
    { day: 'Fri', burned: 2500, consumed: 2400 },
    { day: 'Sat', burned: 2900, consumed: 2600 },
    { day: 'Sun', burned: 2300, consumed: 2100 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-green-500 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-6 pb-24">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Welcome back, {patientName}! 👋
            </h1>
            <p className="text-gray-600">Your AI-powered health companion</p>
          </div>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 opacity-90" />
              <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-sm opacity-90 mb-1">Steps Today</h3>
            <p className="text-3xl font-bold">{stepsToday.toLocaleString()}</p>
            <p className="text-xs opacity-80 mt-1">Goal: {stepsGoal.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 opacity-90" />
              <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">Normal</span>
            </div>
            <h3 className="text-sm opacity-90 mb-1">Heart Rate</h3>
            <p className="text-3xl font-bold">{heartRateToday} <span className="text-lg">bpm</span></p>
            <p className="text-xs opacity-80 mt-1">Resting: 65 bpm</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Moon className="w-8 h-8 opacity-90" />
              <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">Good</span>
            </div>
            <h3 className="text-sm opacity-90 mb-1">Sleep</h3>
            <p className="text-3xl font-bold">{sleepToday} <span className="text-lg">hrs</span></p>
            <p className="text-xs opacity-80 mt-1">Quality: 85%</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8 opacity-90" />
              <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">-8%</span>
            </div>
            <h3 className="text-sm opacity-90 mb-1">Calories</h3>
            <p className="text-3xl font-bold">{caloriesBurnedToday.toLocaleString()}</p>
            <p className="text-xs opacity-80 mt-1">Burned today</p>
          </div>
        </div>
      </header>


      {/* Early Risk Prediction - MAIN FEATURE */}
      <div className="mb-6">
        <div className="card bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-amber-300 shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-2xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <span>AI Health Risk Prediction</span>
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </h3>
                <p className="text-sm text-gray-600">Powered by advanced AI analysis</p>
              </div>
            </div>
            {riskAnalysis && (
              <span className={`px-4 py-1 rounded-full text-xs font-bold ${riskAnalysis.overall_risk === 'Low' ? 'bg-green-100 text-green-700' :
                riskAnalysis.overall_risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                {riskAnalysis.overall_risk} Risk
              </span>
            )}
          </div>

          {/* Risk Analysis Areas */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {(riskAnalysis?.risk_areas || []).slice(0, 2).map((area: any, idx: number) => {
              const riskStyles = area.risk_level === 'Low'
                ? { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', badge: 'bg-green-100 text-green-700', trend: 'text-green-700' }
                : area.risk_level === 'Medium'
                  ? { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', trend: 'text-yellow-700' }
                  : { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200', badge: 'bg-red-100 text-red-700', trend: 'text-red-700' };

              return (
                <div key={idx} className={`bg-white rounded-xl p-4 border-2 shadow-sm ${riskStyles.border}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${riskStyles.bg}`}>
                      {area.category === 'Heart' ? <Heart className={`w-5 h-5 ${riskStyles.text}`} /> :
                        area.category === 'Sleep' ? <Moon className={`w-5 h-5 ${riskStyles.text}`} /> :
                          <Activity className={`w-5 h-5 ${riskStyles.text}`} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800 text-sm">{area.category}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${riskStyles.badge}`}>
                          {area.risk_level}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-600 mb-2">
                        {area.current_status}
                      </p>
                      <div className={`flex items-center space-x-2 text-[10px] font-semibold ${riskStyles.trend}`}>
                        <TrendingUp className="w-3 h-3" />
                        <span>Actionable Insights Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) || (
                <div className="text-center py-4 text-gray-400 text-sm col-span-2">
                  Predicting risks...
                </div>
              )}
          </div>

          {/* AI Recommendations Summary */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
            <h4 className="font-bold mb-2 flex items-center space-x-2 text-sm">
              <Zap className="w-4 h-4" />
              <span>AI Action Plan</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-blue-50">
              {(riskAnalysis?.positive_trends || []).slice(0, 1).map((trend: string, i: number) => (
                <li key={i} className="flex items-start space-x-2">
                  <span>✨</span>
                  <span>{trend}</span>
                </li>
              ))}
              {riskAnalysis?.action_plan && (
                <li className="flex items-start space-x-2">
                  <span>🎯</span>
                  <span>{riskAnalysis.action_plan.week_1_2}</span>
                </li>
              )}
            </ul>
            <button
              onClick={() => setShowAnalytics(true)}
              className="w-full mt-4 bg-white text-purple-600 py-2.5 rounded-lg font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center space-x-2">
              <span>View Detailed Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI-Generated Diet & Fitness Plans */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Custom Diet Plan */}
        <div
          onClick={() => setShowDietPlan(true)}
          className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-xl transition-all cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
              <Apple className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">AI Diet Plan</h3>
              <p className="text-xs text-green-600 font-semibold">Based on your health data</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-3 border border-green-200">
            <h4 className="font-bold text-sm text-gray-800 mb-2">Today's Meal Plan</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">🍳 Breakfast</span>
                <span className="font-semibold text-gray-800 truncate ml-2">
                  {latestReport?.analysis_result?.diet_plan?.breakfast || 'Protein Oatmeal'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">🥗 Lunch</span>
                <span className="font-semibold text-gray-800 truncate ml-2">
                  {latestReport?.analysis_result?.diet_plan?.lunch || 'Chicken Breast Salad'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-100 rounded-lg p-3 mb-3">
            <p className="text-[10px] text-green-800 font-bold mb-0.5 uppercase tracking-wide">AI Tip</p>
            <p className="text-[11px] text-green-700 line-clamp-2">
              {recommendations?.diet.hydration || "Drink 8-10 glasses of water for optimal metabolism."}
            </p>
          </div>

          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center space-x-2">
            <span>View Full Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Fitness Plan */}
        <div
          onClick={() => setShowFitnessPlan(true)}
          className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-xl transition-all cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">AI Fitness Plan</h3>
              <p className="text-xs text-blue-600 font-semibold">Personalized workout routine</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-3 border border-blue-200">
            <h4 className="font-bold text-sm text-gray-800 mb-2">Today's Workout</h4>
            <div className="space-y-2">
              {latestReport?.analysis_result?.fitness_plan?.exercises?.slice(0, 2).map((ex: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate">{ex.name}</span>
                  <span className="font-semibold text-gray-800 ml-2">{ex.duration}</span>
                </div>
              )) || (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">🏃 Cardio</span>
                      <span className="font-semibold text-gray-800">30 min</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">💪 Strength</span>
                      <span className="font-semibold text-gray-800">20 min</span>
                    </div>
                  </>
                )}
            </div>
          </div>

          <div className="bg-blue-100 rounded-lg p-3 mb-3">
            <p className="text-[10px] text-blue-800 font-bold mb-0.5 uppercase tracking-wide">AI Recommendation</p>
            <p className="text-[11px] text-blue-700 line-clamp-2">
              {recommendations?.exercise.duration || "Try 30 mins of moderate activity."} {recommendations?.exercise.frequency}
            </p>
          </div>

          <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center space-x-2">
            <span>View Full Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Progress Rings */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Steps Progress */}
        {/* Steps Progress */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 text-center hover:shadow-lg transition-all">
          <div className="relative inline-block mb-3">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#f1f5f9"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="url(#stepsGradient)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${stepsProgress * 2.13} 213`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="stepsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h4 className="text-[10px] font-bold text-gray-500 mb-0.5 uppercase tracking-widest">Steps</h4>
          <p className="text-sm font-bold text-gray-800">{Math.round(stepsProgress)}%</p>
        </div>

        {/* Water Progress */}
        {/* Water Progress */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 text-center hover:shadow-lg transition-all">
          <div className="relative inline-block mb-3">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#f1f5f9"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="url(#waterGradient)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${waterProgress * 2.13} 213`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
          <h4 className="text-[10px] font-bold text-gray-500 mb-0.5 uppercase tracking-widest">Water</h4>
          <p className="text-sm font-bold text-gray-800">{waterIntake}/{waterGoal}</p>
        </div>

        {/* Calories Progress */}
        {/* Calories Progress */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 text-center hover:shadow-lg transition-all">
          <div className="relative inline-block mb-3">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#f1f5f9"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="url(#caloriesGradient)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${caloriesProgress * 2.13} 213`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="caloriesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h4 className="text-[10px] font-bold text-gray-500 mb-0.5 uppercase tracking-widest">Calories</h4>
          <p className="text-sm font-bold text-gray-800">{caloriesProgress}%</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Weekly Steps */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
            <span>Weekly Steps</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={processedWeeklySteps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="steps" fill="url(#colorSteps)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Heart Rate Trend */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
            <span>Heart Rate Trend</span>
            <Heart className="w-5 h-5 text-red-600" />
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={processedHeartRateTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="bpm"
                stroke="#ef4444"
                fill="url(#colorHeart)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sleep Analysis */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
            <span>Sleep Analysis</span>
            <Moon className="w-5 h-5 text-violet-600" />
          </h4>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={processedSleepAnalysis}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {processedSleepAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[10px]">
              {processedSleepAnalysis.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600 font-bold">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calories Burned vs Consumed */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
          <h4 className="font-semibold text-gray-800 mb-4">Calories: Burned vs Consumed</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={processedCaloriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10, paddingTop: '10px' }} />
              <Bar dataKey="burned" fill="#f97316" radius={[4, 4, 0, 0]} name="Burned" />
              <Bar dataKey="consumed" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Consumed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddMedication(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg shadow-green-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Notifications Overlay */}
      {showNotifications && (
        <div className="fixed inset-0 z-[100] flex justify-end p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-in-right">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {[
                { id: 1, title: 'Medical Report Ready', message: 'Your latest blood test results have been analyzed.', time: '2h ago', icon: <Activity className="w-5 h-5 text-blue-500" />, unread: true },
                { id: 2, title: 'Medication Reminder', message: 'Time to take your Vitamin D.', time: '1h ago', icon: <Heart className="w-5 h-5 text-red-500" />, unread: true },
                { id: 3, title: 'Goal Reached!', message: 'You reached your 10k steps goal.', time: 'Yesterday', icon: <Sparkles className="w-5 h-5 text-amber-500" />, unread: false },
              ].map(notif => (
                <div key={notif.id} className={`p-4 rounded-2xl flex items-start space-x-3 transition-all ${notif.unread ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    {notif.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-800 text-sm whitespace-nowrap">{notif.title}</h4>
                      <span className="text-[10px] text-gray-500">{notif.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button className="w-full text-center py-2 text-sm font-bold text-green-600 hover:text-green-700">
                Mark all as read
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diet Plan Modal */}
      {showDietPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg">
                  <Apple className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-800 tracking-tight">AI Diet Plan</h3>
                  <p className="text-green-600 font-bold">Today's Personalized Nutrition</p>
                </div>
              </div>
              <button onClick={() => setShowDietPlan(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Calories', value: '1,850', color: 'bg-green-50 text-green-700' },
                  { label: 'Protein', value: '120g', color: 'bg-blue-50 text-blue-700' },
                  { label: 'Carbs', value: '180g', color: 'bg-amber-50 text-amber-700' },
                  { label: 'Fats', value: '55g', color: 'bg-red-50 text-red-700' },
                ].map(stat => (
                  <div key={stat.label} className={`${stat.color} p-4 rounded-3xl text-center`}>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-70">{stat.label}</p>
                    <p className="text-xl font-black">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-black text-gray-800 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span>Meal Schedule</span>
                </h4>
                <div className="grid gap-4">
                  {[
                    { time: '08:00 AM', meal: 'Breakfast', menu: latestReport?.analysis_result?.diet_plan?.breakfast || 'Protein Oatmeal with Berries', cal: '450' },
                    { time: '01:00 PM', meal: 'Lunch', menu: latestReport?.analysis_result?.diet_plan?.lunch || 'Chicken Avocado Salad', cal: '620' },
                    { time: '07:30 PM', meal: 'Dinner', menu: latestReport?.analysis_result?.diet_plan?.dinner || 'Baked Salmon with Greens', cal: '580' },
                  ].map(item => (
                    <div key={item.meal} className="bg-gray-50 border border-gray-100 p-5 rounded-3xl flex items-center justify-between hover:border-green-200 transition-all group">
                      <div className="flex items-center space-x-4">
                        <div className="text-center min-w-[70px]">
                          <p className="text-[10px] font-black text-gray-400 uppercase">{item.time}</p>
                          <p className="font-bold text-gray-800">{item.meal}</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200 group-hover:bg-green-200" />
                        <p className="font-bold text-gray-700">{item.menu}</p>
                      </div>
                      <span className="text-xs font-black bg-white px-3 py-1.5 rounded-full shadow-sm text-gray-500">
                        {item.cal} kcal
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-[2rem] p-6 text-white text-sm leading-relaxed relative overflow-hidden">
                <Brain className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                <h4 className="font-black mb-3 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>AI Recommendations</span>
                </h4>
                <p className="text-gray-300 font-medium italic">
                  "{recommendations?.diet.hydration || "Ensure consistent protein intake throughout the day to maintain muscle mass while you follow this routine."}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fitness Plan Modal */}
      {showFitnessPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                  <Dumbbell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-800 tracking-tight">AI Fitness Plan</h3>
                  <p className="text-blue-600 font-bold">Personalized Workout Routine</p>
                </div>
              </div>
              <button onClick={() => setShowFitnessPlan(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4">
                {(latestReport?.analysis_result?.fitness_plan?.exercises || [
                  { name: 'Warm-up Activity', duration: '10 min', reps: 'Light' },
                  { name: 'Strength Training', duration: '20 min', reps: '3 sets of 12' },
                  { name: 'Cardio Blast', duration: '15 min', reps: 'High Intensity' },
                  { name: 'Cool-down Stretch', duration: '10 min', reps: 'Static' }
                ]).map((ex: any, i: number) => (
                  <div key={i} className="bg-blue-50/50 border border-blue-100 p-5 rounded-3xl flex items-center justify-between group hover:bg-blue-50 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-600">
                        <PlayCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{ex.name}</h4>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{ex.reps || 'Duration'}</p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-white text-blue-700 font-black rounded-2xl shadow-sm text-sm">
                      {ex.duration}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-6 text-white">
                <div className="flex items-center space-x-3 mb-3">
                  <Zap className="w-6 h-6 text-amber-400" />
                  <h4 className="font-black text-lg">Trainer's Insight</h4>
                </div>
                <p className="text-blue-50 opacity-90 leading-relaxed font-medium">
                  {recommendations?.exercise.duration || "Consistency is key. Focus on form over weight today."} {recommendations?.exercise.frequency || "Aim for 3-4 sessions per week."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-800 tracking-tight">Health Insights</h3>
                  <p className="text-amber-600 font-bold">Deep Dive Analysis</p>
                </div>
              </div>
              <button onClick={() => setShowAnalytics(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Detailed Risk Areas */}
              <div className="grid md:grid-cols-2 gap-6">
                {(riskAnalysis?.risk_areas || []).map((area: any, i: number) => {
                  const riskStyles = area.risk_level === 'Low'
                    ? { container: 'border-green-100 bg-green-50/30', title: 'text-green-800', badge: 'bg-green-100 text-green-700', rec: 'border-green-100 text-green-600' }
                    : area.risk_level === 'Medium'
                      ? { container: 'border-yellow-100 bg-yellow-50/30', title: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-700', rec: 'border-yellow-100 text-yellow-600' }
                      : { container: 'border-red-100 bg-red-50/30', title: 'text-red-800', badge: 'bg-red-100 text-red-700', rec: 'border-red-100 text-red-600' };

                  return (
                    <div key={i} className={`p-6 rounded-[2rem] border-2 ${riskStyles.container}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`text-lg font-black ${riskStyles.title}`}>{area.category}</h4>
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${riskStyles.badge}`}>
                          {area.risk_level} Risk
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium mb-4 leading-relaxed">{area.current_status}</p>
                      <div className={`p-4 bg-white rounded-2xl border shadow-sm ${riskStyles.rec}`}>
                        <p className={`text-[10px] font-bold uppercase mb-1 tracking-wide ${riskStyles.rec}`}>Recommendation</p>
                        <p className="text-xs text-gray-800 font-bold">{area.recommendations}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Plan */}
              {riskAnalysis?.action_plan && (
                <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                  <TrendingUp className="absolute -top-10 -right-10 w-48 h-48 opacity-5 text-emerald-400" />
                  <h4 className="text-xl font-black mb-6 flex items-center space-x-3">
                    <Target className="w-6 h-6 text-emerald-400" />
                    <span>30-Day Health Roadmap</span>
                  </h4>
                  <div className="space-y-6">
                    {[
                      { period: 'Week 1-2', goal: 'Initial Phase', task: riskAnalysis.action_plan.week_1_2 },
                      { period: 'Week 3-4', goal: 'Performance Phase', task: riskAnalysis.action_plan.week_3_4 },
                    ].map(stage => (
                      <div key={stage.period} className="flex space-x-4">
                        <div className="text-center min-w-[80px]">
                          <p className="text-xs font-black text-emerald-400 uppercase tracking-tighter">{stage.period}</p>
                        </div>
                        <div className="flex-1 pb-6 border-l-2 border-white/10 pl-6 relative">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-900" />
                          <h5 className="font-bold mb-1">{stage.goal}</h5>
                          <p className="text-sm text-slate-400">{stage.task}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMedication && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">New Reminder</h3>
              </div>
              <button onClick={() => setShowAddMedication(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Medication Name</label>
                <input
                  type="text"
                  placeholder="e.g., Vitamin D, Omega-3"
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:outline-none transition-all font-bold text-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Daily Time</label>
                  <input
                    type="time"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:outline-none transition-all font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Frequency</label>
                  <select className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:outline-none transition-all font-bold text-gray-800">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>As Needed</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowAddMedication(false)}
                className="w-full py-5 bg-gradient-to-r from-red-500 to-pink-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-red-500/20 hover:-translate-y-1 hover:shadow-red-500/30 transition-all text-lg mt-4"
              >
                Set Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

