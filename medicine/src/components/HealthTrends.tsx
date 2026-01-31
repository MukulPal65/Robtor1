import React, { useState, useEffect } from 'react';
import {
    Activity,
    Heart,
    TrendingUp,
    Moon,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { HealthService, HealthMetric } from '../services/healthService';

interface HealthTrendsProps {
    onBack?: () => void;
}

const HealthTrends: React.FC<HealthTrendsProps> = () => {
    const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [insights, setInsights] = useState<any>(null);

    useEffect(() => {
        fetchTrendData();
    }, [viewMode]);

    const fetchTrendData = async () => {
        try {
            const data = viewMode === 'weekly'
                ? await HealthService.getWeeklyMetrics()
                : await HealthService.getMonthlyMetrics();

            const trendInsights = await HealthService.getTrendInsights();

            setMetrics(data);
            setInsights(trendInsights);
        } catch (error) {
            console.error('Failed to fetch trend data:', error);
        }
    };

    const formatChartData = () => {
        return metrics.map(m => ({
            date: new Date(m.date).toLocaleDateString('en-US', {
                weekday: viewMode === 'weekly' ? 'short' : undefined,
                day: 'numeric',
                month: viewMode === 'monthly' ? 'short' : undefined
            }),
            steps: m.steps,
            hr: m.heart_rate,
            sleep: m.sleep_hours
        }));
    };

    const chartData = formatChartData();

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 md:p-6 lg:p-8">
            {/* Header */}
            <header className="p-4 md:p-0 flex items-center justify-between mb-8 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-10">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" />
                        Health Trends
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Deep analysis of your vitals</p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
                    <button
                        onClick={() => setViewMode('weekly')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'weekly' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500'
                            }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setViewMode('monthly')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'monthly' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500'
                            }`}
                    >
                        Monthly
                    </button>
                </div>
            </header>

            <div className="px-4 md:px-0 space-y-6">
                {/* AI Insights Summary */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-xl shadow-blue-200">
                    <Sparkles className="absolute -top-4 -right-4 w-32 h-32 opacity-10 animate-pulse" />
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-lg">AI Progress Insights</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium opacity-80">Step Activity</span>
                                {insights?.stepChange >= 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-300" /> : <ArrowDownRight className="w-4 h-4 text-rose-300" />}
                            </div>
                            <p className="text-2xl font-black">{Math.abs(insights?.stepChange || 0)}%</p>
                            <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider font-bold">
                                {insights?.stepChange >= 0 ? 'Increase vs last period' : 'Decrease vs last period'}
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium opacity-80">Avg Heart Rate</span>
                                <Heart className="w-4 h-4 text-rose-300" />
                            </div>
                            <p className="text-2xl font-black">{metrics.length > 0 ? Math.round(metrics.reduce((acc, m) => acc + m.heart_rate, 0) / metrics.length) : 0}</p>
                            <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider font-bold">bpm Average Resting</p>
                        </div>
                    </div>

                    <p className="mt-6 text-xs font-medium text-blue-50 leading-relaxed italic">
                        "Your consistency in activity levels is improving. Maintain your current heart rate baseline for optimal recovery."
                    </p>
                </div>

                {/* Heart Rate Chart */}
                <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-rose-50 p-3 rounded-2xl">
                                <Heart className="w-6 h-6 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Heart Rate Baseline</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Historical Trend</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                <YAxis domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="hr" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorHr)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Steps Accumulation Chart */}
                <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-50 p-3 rounded-2xl">
                                <Activity className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Activity & Steps</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Goal: 10,000 steps</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#F1F5F9' }}
                                />
                                <ReferenceLine y={10000} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'right', value: 'GOAL', fill: '#10b981', fontSize: 8, fontWeight: 'bold' }} />
                                <Bar dataKey="steps" fill="#10b981" radius={[8, 8, 8, 8]} barSize={viewMode === 'weekly' ? 20 : 8} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sleep Patterns */}
                <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-lg mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-50 p-3 rounded-2xl">
                                <Moon className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Sleep Patterns</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Recovery Analysis</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="step" dataKey="sleep" stroke="#6366f1" strokeWidth={2} fill="#e0e7ff" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthTrends;
