import React from 'react';
import {
  Activity,
  Heart,
  TrendingUp,
  Bell,
  Droplets,
  Moon,
  Flame,
  Target,
  AlertTriangle,
  Shield,
  Apple,
  Dumbbell,
  Brain,
  Sparkles,
  ArrowRight,
  Zap
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  patientName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ patientName = 'User' }) => {
  // Sample data for charts
  const weeklyStepsData = [
    { day: 'Mon', steps: 8234, goal: 10000 },
    { day: 'Tue', steps: 12450, goal: 10000 },
    { day: 'Wed', steps: 9876, goal: 10000 },
    { day: 'Thu', steps: 11234, goal: 10000 },
    { day: 'Fri', steps: 10543, goal: 10000 },
    { day: 'Sat', steps: 13678, goal: 10000 },
    { day: 'Sun', steps: 10247, goal: 10000 },
  ];

  const heartRateData = [
    { time: '00:00', bpm: 65 },
    { time: '04:00', bpm: 62 },
    { time: '08:00', bpm: 75 },
    { time: '12:00', bpm: 80 },
    { time: '16:00', bpm: 78 },
    { time: '20:00', bpm: 72 },
    { time: '24:00', bpm: 68 },
  ];

  const sleepData = [
    { name: 'Deep', value: 25, color: '#8b5cf6' },
    { name: 'Light', value: 45, color: '#a78bfa' },
    { name: 'REM', value: 20, color: '#c4b5fd' },
    { name: 'Awake', value: 10, color: '#e9d5ff' },
  ];

  const caloriesData = [
    { day: 'Mon', burned: 2400, consumed: 2100 },
    { day: 'Tue', burned: 2800, consumed: 2300 },
    { day: 'Wed', burned: 2200, consumed: 2000 },
    { day: 'Thu', burned: 2600, consumed: 2200 },
    { day: 'Fri', burned: 2500, consumed: 2400 },
    { day: 'Sat', burned: 2900, consumed: 2600 },
    { day: 'Sun', burned: 2300, consumed: 2100 },
  ];

  // Calculate progress percentage
  const stepsToday = 10247;
  const stepsGoal = 10000;
  const stepsProgress = Math.min((stepsToday / stepsGoal) * 100, 100);

  const waterIntake = 6;
  const waterGoal = 8;
  const waterProgress = (waterIntake / waterGoal) * 100;

  const caloriesProgress = 72;

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
          <button className="relative p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
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
            <p className="text-3xl font-bold">72 <span className="text-lg">bpm</span></p>
            <p className="text-xs opacity-80 mt-1">Resting: 65 bpm</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Moon className="w-8 h-8 opacity-90" />
              <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">Good</span>
            </div>
            <h3 className="text-sm opacity-90 mb-1">Sleep</h3>
            <p className="text-3xl font-bold">7.5 <span className="text-lg">hrs</span></p>
            <p className="text-xs opacity-80 mt-1">Quality: 85%</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8 opacity-90" />
              <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">-8%</span>
            </div>
            <h3 className="text-sm opacity-90 mb-1">Calories</h3>
            <p className="text-3xl font-bold">2,300</p>
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
            <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
              PREMIUM
            </span>
          </div>

          {/* Risk Analysis */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Low Risk */}
            <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-800 text-sm">Cardiovascular Health</h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                      Low Risk
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Your heart rate and activity levels are excellent. Keep maintaining your current routine.
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-green-700 font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>Continue daily exercise</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Risk */}
            <div className="bg-white rounded-xl p-4 border-2 border-yellow-200 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-800 text-sm">Sleep Quality</h4>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
                      Monitor
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Your sleep pattern shows slight irregularity. Consider improving bedtime routine.
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-yellow-700 font-semibold">
                    <Brain className="w-4 h-4" />
                    <span>Set consistent sleep schedule</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Recommendations */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
            <h4 className="font-bold mb-2 flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>AI Recommendations</span>
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <span className="text-blue-200">•</span>
                <span>Maintain 150 minutes of moderate exercise per week</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-200">•</span>
                <span>Improve sleep hygiene - avoid screens 1 hour before bed</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-200">•</span>
                <span>Stay hydrated - drink 2-3 liters of water daily</span>
              </li>
            </ul>
            <button className="w-full mt-4 bg-white text-purple-600 py-2 rounded-lg font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center space-x-2">
              <span>View Detailed Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI-Generated Diet & Fitness Plans */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Custom Diet Plan */}
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-xl transition-all cursor-pointer">
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
                <span className="font-semibold text-gray-800">450 kcal</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">🥗 Lunch</span>
                <span className="font-semibold text-gray-800">600 kcal</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">🍽️ Dinner</span>
                <span className="font-semibold text-gray-800">550 kcal</span>
              </div>
            </div>
          </div>

          <div className="bg-green-100 rounded-lg p-3 mb-3">
            <p className="text-xs text-green-800 font-semibold mb-1">✨ AI Suggestion</p>
            <p className="text-xs text-green-700">Add more leafy greens for better iron levels based on your recent reports.</p>
          </div>

          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center space-x-2">
            <span>View Full Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Fitness Plan */}
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-xl transition-all cursor-pointer">
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
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">🏃 Cardio</span>
                <span className="font-semibold text-gray-800">30 min</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">💪 Strength</span>
                <span className="font-semibold text-gray-800">20 min</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">🧘 Stretching</span>
                <span className="font-semibold text-gray-800">10 min</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-100 rounded-lg p-3 mb-3">
            <p className="text-xs text-blue-800 font-semibold mb-1">✨ AI Suggestion</p>
            <p className="text-xs text-blue-700">Focus on lower body exercises to improve your step count consistency.</p>
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
        <div className="card text-center hover:shadow-lg transition-all">
          <div className="relative inline-block mb-3">
            <svg className="w-24 h-24 transform -rotate-90">
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
                stroke="url(#stepsGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${stepsProgress * 2.51} 251`}
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
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Steps</h4>
          <p className="text-xs text-gray-500">{Math.round(stepsProgress)}%</p>
        </div>

        {/* Water Progress */}
        <div className="card text-center hover:shadow-lg transition-all">
          <div className="relative inline-block mb-3">
            <svg className="w-24 h-24 transform -rotate-90">
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
                stroke="url(#waterGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${waterProgress * 2.51} 251`}
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
              <Droplets className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Water</h4>
          <p className="text-xs text-gray-500">{waterIntake}/{waterGoal} glasses</p>
        </div>

        {/* Calories Progress */}
        <div className="card text-center hover:shadow-lg transition-all">
          <div className="relative inline-block mb-3">
            <svg className="w-24 h-24 transform -rotate-90">
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
                stroke="url(#caloriesGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${caloriesProgress * 2.51} 251`}
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
              <Flame className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Calories</h4>
          <p className="text-xs text-gray-500">{caloriesProgress}%</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Steps */}
        <div className="card">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
            <span>Weekly Steps</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyStepsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="steps" fill="url(#colorSteps)" radius={[8, 8, 0, 0]} />
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
        <div className="card">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
            <span>Heart Rate Trend</span>
            <Heart className="w-5 h-5 text-red-600" />
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={heartRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
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
        <div className="card">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
            <span>Sleep Analysis</span>
            <Moon className="w-5 h-5 text-purple-600" />
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={sleepData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {sleepData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {sleepData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600">{item.name}: {item.value}%</span>
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
  );
};

export default Dashboard;
