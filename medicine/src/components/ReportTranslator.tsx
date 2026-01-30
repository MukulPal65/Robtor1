import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GeminiService } from '../services/geminiService';
import { HealthService } from '../services/healthService';
import { FileText, Upload, CheckCircle, Activity, Loader, Utensils, Dumbbell, AlertTriangle, PlayCircle, RefreshCw, X } from 'lucide-react';

interface ReportTranslatorProps {
  onDashboardUpdate?: () => void;
}

const ReportTranslator: React.FC<ReportTranslatorProps> = ({ onDashboardUpdate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [updatingDashboard, setUpdatingDashboard] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      let user = null;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error) user = data.user;
      } catch (e) {
        console.warn("Auth detection error:", e);
      }

      let filePath = '';
      if (user) {
        try {
          const filePathRaw = `${user.id}/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from('reports')
            .upload(filePathRaw, selectedFile);

          if (!uploadError) filePath = filePathRaw;
        } catch (uploadCatchError) {
          console.warn("Upload error caught:", uploadCatchError);
        }
      }

      const aiResults = await GeminiService.analyzeImage(selectedFile);

      if (!aiResults || typeof aiResults !== 'object') {
        throw new Error('Invalid response from AI service. Please try again.');
      }

      if (!aiResults.health_score || aiResults.health_score === 0) {
        if (aiResults.results && Array.isArray(aiResults.results) && aiResults.results.length > 0) {
          const normalCount = aiResults.results.filter((r: any) => r.status?.toLowerCase() === 'normal').length;
          aiResults.health_score = Math.round((normalCount / aiResults.results.length) * 100);
        } else {
          aiResults.health_score = 75;
        }
      }

      setAnalysis(aiResults);

      if (user && filePath) {
        try {
          await supabase.from('reports').insert({
            user_id: user.id,
            file_name: selectedFile.name,
            file_url: filePath,
            analysis_result: aiResults
          });
        } catch (dbError) {
          console.warn("DB Insert failed:", dbError);
        }
      }

      setAnalyzing(false);
      setShowResults(true);

    } catch (error: any) {
      console.error("Error processing report:", error);
      alert("Failed to analyze report: " + (error.message || "Unknown error"));
      setAnalyzing(false);
    }
  };

  const handleUpdateDashboard = async () => {
    if (!analysis) return;
    setUpdatingDashboard(true);
    try {
      const metrics: any = { steps: 0, sleep_hours: 7 };

      const heartRateResult = analysis.results?.find((r: any) =>
        r.test_name.toLowerCase().includes('heart rate') || r.test_name.toLowerCase().includes('pulse')
      );
      if (heartRateResult) metrics.heart_rate = parseInt(heartRateResult.value);

      const o2Result = analysis.results?.find((r: any) =>
        r.test_name.toLowerCase().includes('oxygen') || r.test_name.toLowerCase().includes('spo2')
      );
      if (o2Result) metrics.blood_oxygen = parseInt(o2Result.value);

      await HealthService.upsertMetric(metrics);
      if (onDashboardUpdate) onDashboardUpdate();
      alert('✅ Dashboard updated successfully!');
    } catch (error) {
      alert('Failed to update dashboard. Please try again.');
    } finally {
      setUpdatingDashboard(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 pb-24 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full mix-blend-screen filter blur-[120px] animate-pulse animation-delay-2000"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10 text-left">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-blue-200 p-4 rounded-[2rem] animate-float">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">Report Translator</h1>
              <p className="text-gray-600 font-medium">AI-powered medical insight extraction</p>
            </div>
          </div>
        </div>

        {/* Warning Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 mb-10 flex items-start space-x-4 backdrop-blur-md">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-800/70 leading-relaxed font-medium">
            This AI system is for informational assistance only. It cannot replace a professional medical consultation. Always discuss clinical findings with your doctor.
          </p>
        </div>

        {/* Upload Section */}
        {!showResults && (
          <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-blue-100 rounded-[2rem] p-2 group transition-all duration-700 hover:border-blue-500/20">
            <div className="bg-white/50 border-2 border-dashed border-blue-200 rounded-[2rem] p-12 text-center group-hover:bg-blue-50/50 transition-all">
              {selectedFile ? (
                <div className="animate-fade-in">
                  <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6 opacity-50" />
                  <h3 className="text-xl font-black text-gray-800 mb-2">{selectedFile.name}</h3>
                  <p className="text-gray-500 text-sm mb-8 uppercase tracking-widest font-black">File Selected & Ready</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary min-w-[200px]">
                      {analyzing ? <Loader size={20} className="animate-spin mr-2" /> : <Activity size={20} className="mr-2" />}
                      {analyzing ? 'Analyzing Vitals...' : 'Start Extraction'}
                    </button>
                    <button onClick={() => setSelectedFile(null)} className="btn-secondary">
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-blue-100 group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-10 h-10 text-blue-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="text-xl font-black text-gray-800 mb-2 tracking-tight">Universal File Intake</h3>
                  <p className="text-gray-500 text-sm mb-8 font-medium">Drop any PDF or JPG lab result here</p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file-upload" className="btn-primary inline-flex cursor-pointer px-10">
                    Choose Sample Or Upload
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        {showResults && analysis && (
          <div className="space-y-8 animate-slide-up text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={handleUpdateDashboard}
                disabled={updatingDashboard}
                className="btn-primary w-full sm:w-auto"
              >
                {updatingDashboard ? <Loader size={18} className="animate-spin mr-2" /> : <RefreshCw size={18} className="mr-2" />}
                Sync to My Dashboard
              </button>
              <button
                onClick={() => { setShowResults(false); setSelectedFile(null); }}
                className="btn-secondary w-full sm:w-auto text-xs"
              >
                Process New Data
              </button>
            </div>

            {/* Overall Health Score Card */}
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-[2.5rem] shadow-xl border border-blue-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Diagnostic Profile</p>
                  <h3 className="text-3xl font-black text-gray-800 tracking-tight">AI Health Score</h3>
                </div>
                <div className={`w-24 h-24 rounded-full border-8 ${analysis.health_score > 70 ? 'border-emerald-500/20' : 'border-amber-500/20'} flex items-center justify-center relative`}>
                  <span className={`text-4xl font-black ${analysis.health_score > 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{analysis.health_score}</span>
                  <div className={`absolute inset-0 rounded-full blur-md opacity-20 ${analysis.health_score > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl border border-slate-200">{analysis.summary}</p>
            </div>

            {/* Results Grid - Using modern card theme */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-4">Biomarker Data Extraction</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.results?.map((result: any, index: number) => {
                  const isNormal = result.status.toLowerCase() === 'normal';
                  return (
                    <div key={index} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-gray-800 text-sm">{result.test_name}</h4>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isNormal ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {result.status}
                        </span>
                      </div>
                      <div className="flex items-baseline space-x-2 mb-4">
                        <span className="text-2xl font-black text-gray-900">{result.value}</span>
                        <span className="text-[10px] font-black text-gray-500 uppercase">{result.normal_range}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-medium italic">"{result.interpretation}"</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-blue-100">
              <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                <CheckCircle className="text-emerald-500 mr-3" />
                Clinical Recommendations
              </h3>
              <div className="space-y-4">
                {analysis.recommendations?.map((rec: string, i: number) => (
                  <div key={i} className="flex space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-1.5 h-6 bg-slate-300 rounded-full flex-shrink-0" />
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Diet & Fitness Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
              {analysis.diet_plan && (
                <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-xl overflow-hidden border border-emerald-100">
                  <div className="p-8 bg-emerald-50 border-b border-emerald-100 flex items-center space-x-4">
                    <Utensils className="text-emerald-600" />
                    <h3 className="text-lg font-black text-gray-800">Dietary Adjustment</h3>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-3 gap-2">
                      {['breakfast', 'lunch', 'dinner'].map(time => (
                        <div key={time} className="p-3 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{time}</p>
                          <p className="text-[10px] text-gray-800 font-bold leading-tight line-clamp-2">{analysis.diet_plan[time]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {analysis.fitness_plan && (
                <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-xl overflow-hidden border border-blue-100">
                  <div className="p-8 bg-blue-50 border-b border-blue-100 flex items-center space-x-4">
                    <Dumbbell className="text-blue-600" />
                    <h3 className="text-lg font-black text-gray-800">Fitness Optimization</h3>
                  </div>
                  <div className="p-8 space-y-4">
                    {analysis.fitness_plan.exercises?.slice(0, 3).map((ex: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <PlayCircle size={16} className="text-blue-500" />
                          <p className="text-[11px] font-black text-gray-800 uppercase tracking-tight">{ex.name}</p>
                        </div>
                        <span className="text-[9px] font-black text-gray-400 uppercase">{ex.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportTranslator;
