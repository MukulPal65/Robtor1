import React, { useState } from 'react';
import { Stethoscope, Search, AlertCircle, CheckCircle, Info, Loader, Activity, Pill, ShieldAlert, X } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

interface Symptom {
  id: number;
  name: string;
  selected: boolean;
}

const SymptomChecker: React.FC = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([
    { id: 1, name: 'Headache', selected: false },
    { id: 2, name: 'Fever', selected: false },
    { id: 3, name: 'Cough', selected: false },
    { id: 4, name: 'Fatigue', selected: false },
    { id: 5, name: 'Body Aches', selected: false },
    { id: 6, name: 'Sore Throat', selected: false },
    { id: 7, name: 'Nausea', selected: false },
    { id: 8, name: 'Dizziness', selected: false },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);

  const toggleSymptom = (id: number) => {
    setSymptoms(
      symptoms.map((symptom) =>
        symptom.id === id ? { ...symptom, selected: !symptom.selected } : symptom
      )
    );
  };

  const handleAnalyze = async () => {
    const selectedSymptoms = symptoms.filter(s => s.selected).map(s => s.name);
    if (selectedSymptoms.length === 0) return;

    setAnalyzing(true);
    try {
      const result = await GeminiService.analyzeSymptoms(selectedSymptoms);
      setAssessment(result);
      setShowResults(true);
    } catch (error) {
      alert("Failed to analyze symptoms. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedCount = symptoms.filter((s) => s.selected).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 pb-40 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/5 rounded-full filter blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10 text-left">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-blue-200 p-4 rounded-[2rem] animate-float">
              <Stethoscope className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">AI Differential</h1>
              <p className="text-gray-600 font-medium">Neural symptom mapping & triage</p>
            </div>
          </div>
        </div>

        {/* Search Bar - Integrated style */}
        <div className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-md rounded-[2.5rem] p-2 mb-8">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
            <input
              type="text"
              placeholder="Filter symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-transparent border-none text-gray-800 focus:ring-0 placeholder-slate-400 font-bold outline-none"
            />
          </div>
        </div>

        {/* Symptoms Grid */}
        {!showResults && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Database</h3>
              <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                {selectedCount} Selected
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {symptoms
                .filter((symptom) =>
                  symptom.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-6 rounded-[2rem] border-2 transition-all duration-300 text-left relative overflow-hidden group shadow-sm ${symptom.selected
                      ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xl shadow-rose-500/20'
                      : 'border-slate-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                  >
                    <span className={`text-sm font-black tracking-tight ${symptom.selected ? '' : 'group-hover:text-gray-800'}`}>
                      {symptom.name}
                    </span>
                    {symptom.selected && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="bg-rose-500 p-1 rounded-full shadow-lg">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
            </div>

            {selectedCount > 0 && (
              <div className="pt-10 flex justify-center sticky bottom-40 z-[90]">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="btn-primary min-w-[300px] shadow-emerald-500/30 text-lg py-5 px-10"
                >
                  {analyzing ? <Loader size={20} className="animate-spin mr-3" /> : <Activity size={20} className="mr-3" />}
                  {analyzing ? 'Processing Telemetry...' : 'Initialize AI Analysis'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {showResults && assessment && (
          <div className="space-y-8 animate-slide-up text-left">
            <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-rose-100 rounded-[2.5rem] p-10">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center space-x-6">
                  <div className="bg-rose-500 p-5 rounded-[2rem] shadow-premium">
                    <AlertCircle className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-2">Identified Condition</p>
                    <h3 className="text-3xl font-black text-gray-800 tracking-tight uppercase italic">{assessment.possible_condition}</h3>
                  </div>
                </div>
                <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-2xl">
                  <span className="text-xs font-black text-rose-600 uppercase tracking-widest">{assessment.confidence_score}% Confidence</span>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Info size={16} className="text-emerald-600" />
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Clinical Explanation</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">{assessment.explanation}</p>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Deployment Directives</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessment.recommendations?.map((rec: any, i: number) => (
                  <div key={i} className="bg-white p-8 border border-slate-200 rounded-[2.5rem] shadow-sm hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200">
                        {rec.type === 'medication' ? <Pill className="w-6 h-6 text-blue-600" /> :
                          rec.type === 'lifestyle' ? <CheckCircle className="w-6 h-6 text-emerald-600" /> :
                            <Activity className="w-6 h-6 text-purple-600" />}
                      </div>
                      <h4 className="font-black text-gray-800 uppercase tracking-tight text-sm">{rec.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Signals */}
            <div className="card p-10 bg-rose-600 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="flex items-center space-x-6 mb-8 relative z-10">
                <ShieldAlert size={48} className="text-white animate-pulse" />
                <h3 className="text-2xl font-black italic uppercase tracking-tight">Critical Indicators</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {assessment.urgent_signs?.map((sign: string, i: number) => (
                  <div key={i} className="flex items-center space-x-4 p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <span className="font-black text-xs uppercase tracking-tighter">{sign}</span>
                  </div>
                ))}
              </div>
              <p className="mt-10 text-[9px] font-black text-white/50 uppercase tracking-[0.3em] text-center border-t border-white/10 pt-6">Emergency Protocol: If present, contact 911 immediately</p>
            </div>

            {/* Reset Button */}
            <div className="pt-6 pb-12 flex justify-center">
              <button
                onClick={() => {
                  setShowResults(false);
                  setAssessment(null);
                  setSymptoms(symptoms.map((s) => ({ ...s, selected: false })));
                }}
                className="btn-secondary min-w-[250px] shadow-sm flex items-center justify-center p-5"
              >
                <X size={18} className="mr-3" />
                New Assessment Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomChecker;
