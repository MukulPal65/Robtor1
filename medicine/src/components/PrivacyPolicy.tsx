import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-green-600 p-8 text-white relative">
                    <button
                        onClick={onBack}
                        className="absolute top-8 left-8 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <Shield className="w-16 h-16 mx-auto mb-4 opacity-90" />
                        <h1 className="text-3xl font-bold">Privacy Policy</h1>
                        <p className="mt-2 text-green-100">Last updated: January 27, 2026</p>
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <Lock className="w-6 h-6 mr-2 text-green-600" />
                            1. Your Data Protection
                        </h2>
                        <p>
                            At Robtor, we take your health data privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal and medical information. We use industry-standard encryption and follow best practices for healthcare data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <Eye className="w-6 h-6 mr-2 text-green-600" />
                            2. Information We Collect
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Information:</strong> Name, email address, and security credentials.</li>
                            <li><strong>Health Data:</strong> Information you provide about your age, weight, height, medical history, and symptoms.</li>
                            <li><strong>Medical Reports:</strong> Images of lab reports or prescriptions that you upload for AI analysis.</li>
                            <li><strong>Wearable Data:</strong> Data synced from your connected health devices (if enabled).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <FileText className="w-6 h-6 mr-2 text-green-600" />
                            3. How We Use Your Data
                        </h2>
                        <p>
                            Your data is used solely to provide personalized health insights, analyze medical reports through our AI engine, and help you track your wellness journey. We <strong>never</strong> sell your health data to third parties.
                        </p>
                    </section>

                    <section className="bg-red-50 p-6 rounded-2xl border border-red-100">
                        <h2 className="text-xl font-bold text-red-900 mb-2">Important Medical Disclaimer</h2>
                        <p className="text-red-800 text-sm">
                            Robtor is an AI-powered health assistant and does <strong>not</strong> provide medical diagnoses. The insights provided are for informational purposes only. Always consult with a qualified healthcare professional for medical advice, diagnosis, or treatment.
                        </p>
                    </section>

                    <div className="pt-8 border-t text-center">
                        <button
                            onClick={onBack}
                            className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
