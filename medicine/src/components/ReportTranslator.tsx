import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GeminiService } from '../services/geminiService';
import { HealthService } from '../services/healthService';
import { FileText, Upload, CheckCircle, Activity, Loader, Utensils, Dumbbell, AlertTriangle, PlayCircle, RefreshCw } from 'lucide-react';

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
      // 1. Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      console.log("Starting analysis process...");

      // Safe auth check - if it fails, proceed as guest
      let user = null;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.warn("Auth check failed (proceeding as guest):", error.message);
        } else {
          user = data.user;
        }
      } catch (e) {
        console.warn("Auth detection error:", e);
      }

      let filePath = '';


      // Only upload to Supabase if user is authenticated
      // Only upload to Supabase if user is authenticated
      if (user) {
        try {
          console.log("User found, attempting upload...");
          const filePathRaw = `${user.id}/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from('reports')
            .upload(filePathRaw, selectedFile);

          if (uploadError) {
            console.warn("Upload failed (continuing without save):", uploadError);
            // Don't throw, just don't set filePath so we skip DB insert
          } else {
            filePath = filePathRaw;
            console.log("Upload successful to", filePath);
          }
        } catch (uploadCatchError) {
          console.warn("Upload error caught (continuing):", uploadCatchError);
        }
      } else {
        console.log("No user found, skipping upload (Guest Mode)");
      }

      // 2. Analyze with Gemini
      console.log("Starting Gemini analysis service call...");
      const aiResults = await GeminiService.analyzeImage(selectedFile);
      console.log("Gemini Results:", aiResults);
      
      // Validate the results have the expected structure
      if (!aiResults || typeof aiResults !== 'object') {
        throw new Error('Invalid response from AI service. Please try again.');
      }
      
      // Ensure minimum required fields (AI should calculate score, but have fallback)
      if (!aiResults.health_score || aiResults.health_score === 0) {
        // Calculate basic score from results if AI didn't provide one or returned 0
        if (aiResults.results && Array.isArray(aiResults.results) && aiResults.results.length > 0) {
          const normalCount = aiResults.results.filter((r: any) => r.status?.toLowerCase() === 'normal').length;
          const totalCount = aiResults.results.length;
          aiResults.health_score = Math.round((normalCount / totalCount) * 100);
        } else {
          aiResults.health_score = 75; // Default moderate score if no results
        }
      }
      if (!aiResults.summary) {
        aiResults.summary = 'Medical report analyzed. Please review the results below.';
      }
      if (!Array.isArray(aiResults.results)) {
        aiResults.results = [];
      }
      if (!Array.isArray(aiResults.recommendations)) {
        aiResults.recommendations = ['Consult with your healthcare provider to discuss these results.'];
      }
      
      setAnalysis(aiResults);

      // 3. Create record in reports table only if authenticated
      // 3. Create record in reports table only if authenticated and upload succeeded
      if (user && filePath) {
        try {
          const { error: dbError } = await supabase
            .from('reports')
            .insert({
              user_id: user.id,
              file_name: selectedFile.name,
              file_url: filePath,
              analysis_result: aiResults
            });

          if (dbError) console.warn("DB Insert failed (non-fatal):", dbError);
        } catch (dbCatchError) {
          console.warn("DB Insert error caught (non-fatal):", dbCatchError);
        }
      }

      setAnalyzing(false);
      setShowResults(true);

    } catch (error: any) {
      console.error("Error processing report (Detailed):", error);
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to analyze report. ";
      if (error.message?.includes('JSON')) {
        errorMessage += "The AI had trouble reading the report format. Please try:\n• A clearer image\n• Better lighting\n• A different report format";
      } else if (error.message?.includes('API')) {
        errorMessage += "Connection issue with AI service. Please check your internet and try again.";
      } else {
        errorMessage += error.message || "Unknown error occurred.";
      }
      
      alert(errorMessage);
      setAnalyzing(false);
    }
  };

  const handleUpdateDashboard = async () => {
    if (!analysis) return;

    setUpdatingDashboard(true);
    try {
      // Extract health metrics from the report analysis
      const metrics: any = {};

      // Try to extract heart rate from results
      const heartRateResult = analysis.results?.find((r: any) => 
        r.test_name.toLowerCase().includes('heart rate') || 
        r.test_name.toLowerCase().includes('pulse')
      );
      if (heartRateResult) {
        const hrValue = parseInt(heartRateResult.value);
        if (!isNaN(hrValue)) metrics.heart_rate = hrValue;
      }

      // Try to extract blood oxygen
      const o2Result = analysis.results?.find((r: any) => 
        r.test_name.toLowerCase().includes('oxygen') || 
        r.test_name.toLowerCase().includes('spo2')
      );
      if (o2Result) {
        const o2Value = parseInt(o2Result.value);
        if (!isNaN(o2Value)) metrics.blood_oxygen = o2Value;
      }

      // Set default steps if not found
      if (!metrics.steps) {
        metrics.steps = 0; // Will be updated by wearable or manual entry
      }

      // Set default sleep if not found
      if (!metrics.sleep_hours) {
        metrics.sleep_hours = 7; // Default healthy sleep
      }

      // Update or create today's health metric
      await HealthService.upsertMetric(metrics);

      // Call the callback to refresh dashboard
      if (onDashboardUpdate) {
        onDashboardUpdate();
      }

      alert('✅ Dashboard updated successfully with your report data!');
    } catch (error) {
      console.error('Error updating dashboard:', error);
      alert('Failed to update dashboard. Please try again.');
    } finally {
      setUpdatingDashboard(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Medical Report Translator</h1>
              <p className="text-gray-600">Transform complex lab results into simple insights</p>
            </div>
          </div>
        </div>

        {/* Warning Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-tight">
            <strong>Important:</strong> This AI tool is for informational purposes only. It does not provide medical diagnosis. Always review lab results with a qualified healthcare professional.
          </p>
        </div>

        {/* Upload Section */}
        {!showResults && (
          <div className="card mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Your Medical Report</h3>
              <p className="text-gray-600 mb-4">PDF, JPEG, PNG - Maximum file size 10MB</p>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload" className="btn-primary inline-block cursor-pointer">
                Choose File
              </label>
              {selectedFile && (
                <div className="mt-4 bg-green-50 rounded-lg p-4">
                  <p className="text-green-700 font-semibold">{selectedFile.name}</p>
                  <p className="text-green-700 font-semibold">{selectedFile.name}</p>
                  <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary mt-3 flex items-center justify-center mx-auto">
                    {analyzing && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    {analyzing ? 'Analyzing...' : 'Analyze Report'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        {showResults && analysis && (
          <div className="space-y-6 animate-slide-up">
            {/* Update Dashboard Button */}
            <div className="flex justify-center">
              <button
                onClick={handleUpdateDashboard}
                disabled={updatingDashboard}
                className="btn-primary flex items-center space-x-2 px-8 py-4 text-lg"
              >
                {updatingDashboard ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Updating Dashboard...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>Update Dashboard with Report Data</span>
                  </>
                )}
              </button>
            </div>

            {/* Overall Health Score */}
            <div className={`card border-2 ${analysis.health_score > 70 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'} `}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Overall Health Score</h3>
                <CheckCircle className={`w-8 h-8 ${analysis.health_score > 70 ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div className="flex items-end space-x-2">
                <span className={`text-5xl font-bold ${analysis.health_score > 70 ? 'text-green-600' : 'text-yellow-600'}`}>{analysis.health_score}</span>
                <span className="text-2xl text-gray-600 mb-2">/100</span>
              </div>
              <p className="text-gray-700 mt-2">{analysis.summary}</p>
            </div>

            {/* Lab Results Breakdown */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Lab Results - Simplified</h3>
              <div className="space-y-4">
                {analysis.results && analysis.results.length > 0 ? (
                  analysis.results.map((result: any, index: number) => (
                    <div key={index} className={`rounded-lg p-4 border ${result.status.toLowerCase() === 'normal' ? 'bg-green-50 border-green-200' :
                      result.status.toLowerCase() === 'high' ? 'bg-red-50 border-red-200' :
                        'bg-yellow-50 border-yellow-200'
                      }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Activity className={`w-5 h-5 ${result.status.toLowerCase() === 'normal' ? 'text-green-600' :
                            result.status.toLowerCase() === 'high' ? 'text-red-600' :
                              'text-yellow-600'
                            }`} />
                          <h4 className="font-semibold text-gray-800">{result.test_name}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${result.status.toLowerCase() === 'normal' ? 'bg-green-500' :
                          result.status.toLowerCase() === 'high' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}>
                          {result.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-800">{result.value}</p>
                          {result.normal_range && <p className="text-sm text-gray-600">Normal: {result.normal_range}</p>}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-3">
                        <strong>Analysis:</strong> {result.interpretation}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No specific test results extracted.</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 text-purple-600 mr-2" />
                Key Recommendations
              </h3>
              <ul className="space-y-3">
                {analysis.recommendations && analysis.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Diet Plan */}
            {analysis.diet_plan && (
              <div className="card bg-white border-2 border-green-200 overflow-hidden">
                <div className="bg-green-500 p-4 flex items-center space-x-3">
                  <Utensils className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-bold text-white">Your Guided Diet Plan</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <p className="text-xs font-bold text-green-600 uppercase mb-1">Breakfast</p>
                      <p className="text-gray-800">{analysis.diet_plan.breakfast}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <p className="text-xs font-bold text-green-600 uppercase mb-1">Lunch</p>
                      <p className="text-gray-800">{analysis.diet_plan.lunch}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <p className="text-xs font-bold text-green-600 uppercase mb-1">Dinner</p>
                      <p className="text-gray-800">{analysis.diet_plan.dinner}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Healthy Snacks
                      </h4>
                      <ul className="space-y-2">
                        {analysis.diet_plan.snacks?.map((snack: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">{snack}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                        Foods to Avoid
                      </h4>
                      <ul className="space-y-2">
                        {analysis.diet_plan.avoid?.map((item: string, i: number) => (
                          <li key={i} className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fitness Plan */}
            {analysis.fitness_plan && (
              <div className="card bg-white border-2 border-blue-200 overflow-hidden">
                <div className="bg-blue-600 p-4 flex items-center space-x-3">
                  <Dumbbell className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-bold text-white">Your Fitness Regimen</h3>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-1">{analysis.fitness_plan.routine_name}</h4>
                    <p className="text-blue-600 font-medium">{analysis.fitness_plan.weekly_goal}</p>
                  </div>

                  <div className="space-y-4">
                    {analysis.fitness_plan.exercises?.map((ex: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-600 p-2 rounded-lg">
                            <PlayCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{ex.name}</p>
                            <p className="text-xs text-gray-600">{ex.benefit}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-700">{ex.duration}</p>
                          <p className="text-xs font-medium text-blue-500 uppercase">{ex.intensity} Intensity</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            <button
              onClick={() => {
                setShowResults(false);
                setSelectedFile(null);
              }}
              className="btn-secondary w-full"
            >
              Analyze Another Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportTranslator;
