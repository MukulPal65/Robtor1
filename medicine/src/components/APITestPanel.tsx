import React, { useState } from 'react';
import { APITester } from '../services/apiTester';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';

const APITestPanel: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    const testResults = await APITester.testAllAPIs();
    setResults(testResults);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'not_configured':
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'not_configured':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const workingAPIs = results.filter(r => r.status === 'success').length;
  const failedAPIs = results.filter(r => r.status === 'failed').length;
  const notConfiguredAPIs = results.filter(r => r.status === 'not_configured').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <Zap className="w-8 h-8 text-yellow-500" />
                <span>API Status Checker</span>
              </h1>
              <p className="text-gray-600 mt-2">Test all AI APIs and check their status</p>
            </div>
            <button
              onClick={runTests}
              disabled={testing}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Run Tests'}</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Working</p>
                  <p className="text-4xl font-bold text-green-600">{workingAPIs}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Failed</p>
                  <p className="text-4xl font-bold text-red-600">{failedAPIs}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Not Configured</p>
                  <p className="text-4xl font-bold text-gray-600">{notConfiguredAPIs}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-gray-500" />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 shadow-lg border-2 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{result.name}</h3>
                      
                      {result.status === 'success' && (
                        <div className="mt-2">
                          <p className="text-green-700 font-semibold">✓ API is working!</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Response time: <span className="font-bold">{result.responseTime}ms</span>
                          </p>
                          {result.response && (
                            <details className="mt-2">
                              <summary className="text-sm text-blue-600 cursor-pointer hover:underline">
                                View response
                              </summary>
                              <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs overflow-x-auto">
                                {JSON.stringify(result.response, null, 2).substring(0, 500)}...
                              </pre>
                            </details>
                          )}
                        </div>
                      )}

                      {result.status === 'failed' && (
                        <div className="mt-2">
                          <p className="text-red-700 font-semibold">✗ API failed</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Response time: <span className="font-bold">{result.responseTime}ms</span>
                          </p>
                          {result.error && (
                            <div className="mt-2 p-3 bg-red-100 rounded-lg">
                              <p className="text-xs text-red-800 font-mono break-all">
                                {result.error}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {result.status === 'not_configured' && (
                        <div className="mt-2">
                          <p className="text-gray-700 font-semibold">⚠ Not configured</p>
                          <p className="text-sm text-gray-600 mt-1">
                            API key is missing or invalid in .env file
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Initial State */}
        {results.length === 0 && !testing && (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <Zap className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Test APIs</h3>
            <p className="text-gray-600 mb-6">
              Click "Run Tests" to check the status of all configured AI APIs
            </p>
            <p className="text-sm text-gray-500">
              This will test: Gemini Direct, Groq, Hugging Face, OpenRouter, and OpenAI
            </p>
          </div>
        )}

        {/* Loading State */}
        {testing && (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <RefreshCw className="w-20 h-20 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Testing APIs...</h3>
            <p className="text-gray-600">Please wait while we check each API</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default APITestPanel;
