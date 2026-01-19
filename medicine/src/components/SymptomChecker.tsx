import React, { useState } from 'react';
import { Stethoscope, Search, AlertCircle, CheckCircle, Info, Loader, Activity, Pill, ShieldAlert } from 'lucide-react';
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
      console.error("Error checking symptoms:", error);
      alert("Failed to analyze symptoms. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedCount = symptoms.filter((s) => s.selected).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-2xl">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">AI Symptom Checker</h1>
              <p className="text-gray-600">Get instant guidance on your symptoms</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Symptoms Grid */}
        {!showResults && (
          <div className="card mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Your Symptoms</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {symptoms
                .filter((symptom) =>
                  symptom.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${symptom.selected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 bg-white'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={symptom.selected ? 'text-red-700 font-semibold' : 'text-gray-700'}>
                        {symptom.name}
                      </span>
                      {symptom.selected && (
                        <CheckCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </button>
                ))}
            </div>

            {selectedCount > 0 && (
              <div className="mt-6 flex items-center justify-between bg-red-50 rounded-xl p-4">
                <p className="text-gray-700">
                  <strong>{selectedCount}</strong> symptom{selectedCount !== 1 ? 's' : ''} selected
                </p>
                <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary flex items-center">
                  {analyzing && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  {analyzing ? 'Analyzing...' : 'Analyze Symptoms'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {showResults && assessment && (
          <div className="space-y-6 animate-slide-up">
            {/* Main Assessment */}
            <div className="card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
              <div className="flex items-start space-x-4">
                <div className="bg-red-500 p-3 rounded-2xl shadow-lg">
                  <AlertCircle className="w-8 h-8 text-white flex-shrink-0" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">AI Assessment</h3>
                  <p className="text-2xl font-bold text-red-700 mb-2">{assessment.possible_condition}</p>
                  <div className="flex items-center space-x-2 bg-red-100 rounded-lg px-3 py-1 inline-flex">
                    <span className="text-sm font-bold text-red-800">Match Confidence: {assessment.confidence_score}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card border-2 border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-500" />
                What This Means
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                {assessment.explanation}
              </p>
            </div>

            {/* Recommendations */}
            <div className="card border-2 border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Recommended Actions
              </h3>
              <div className="space-y-4">
                {assessment.recommendations?.map((rec: any, i: number) => (
                  <div key={i} className={`flex items-start space-x-3 p-4 rounded-xl border ${rec.type === 'medication' ? 'bg-blue-50 border-blue-100' :
                      rec.type === 'lifestyle' ? 'bg-green-50 border-green-100' :
                        'bg-purple-50 border-purple-100'
                    }`}>
                    {rec.type === 'medication' ? <Pill className="w-6 h-6 text-blue-600 mt-0.5" /> :
                      rec.type === 'lifestyle' ? <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" /> :
                        <Activity className="w-6 h-6 text-purple-600 mt-0.5" />}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Signs */}
            <div className="card bg-gradient-to-br from-red-600 to-pink-700 text-white border-0 shadow-xl">
              <div className="flex items-start space-x-3">
                <ShieldAlert className="w-8 h-8 text-white mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-3">Seek Immediate Care If:</h3>
                  <ul className="space-y-2">
                    {assessment.urgent_signs?.map((sign: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2 text-white/70">•</span>
                        <span className="font-medium">{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="card bg-gray-50 border-2 border-gray-200">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                <strong>IMPORTANT:</strong> {assessment.disclaimer}
              </p>
            </div>

            <button
              onClick={() => {
                setShowResults(false);
                setAssessment(null);
                setSymptoms(symptoms.map((s) => ({ ...s, selected: false })));
              }}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-sm"
            >
              Start New Check
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default SymptomChecker;
