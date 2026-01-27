import React from 'react';
import { ArrowLeft, Scale, AlertTriangle, UserCheck, ShieldAlert } from 'lucide-react';

interface TermsOfServiceProps {
    onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-emerald-600 p-8 text-white relative">
                    <button
                        onClick={onBack}
                        className="absolute top-8 left-8 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <Scale className="w-16 h-16 mx-auto mb-4 opacity-90" />
                        <h1 className="text-3xl font-bold">Terms of Service</h1>
                        <p className="mt-2 text-emerald-100">Last updated: January 27, 2026</p>
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
                    <section className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
                        <h2 className="text-xl font-bold text-yellow-900 mb-2 flex items-center">
                            <AlertTriangle className="w-6 h-6 mr-2" />
                            1. Not Medical Advice
                        </h2>
                        <p className="text-yellow-800">
                            The services provided by Robtor, including AI-generated health metrics and report analysis, are for <strong>educational and informational purposes only</strong>. We do not provide professional medical advice, diagnosis, or treatment.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <UserCheck className="w-6 h-6 mr-2 text-emerald-600" />
                            2. User Responsibilities
                        </h2>
                        <p>
                            By using Robtor, you agree that you are responsible for your own health decisions. You should always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <ShieldAlert className="w-6 h-6 mr-2 text-emerald-600" />
                            3. Privacy and Data
                        </h2>
                        <p>
                            Usage of our services is also governed by our Privacy Policy. You agree to provide accurate information and not to upload malicious files or deceptive content.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitation of Liability</h2>
                        <p>
                            Robtor and its creators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the service or for the cost of procurement of substitute goods and services.
                        </p>
                    </section>

                    <div className="pt-8 border-t text-center">
                        <button
                            onClick={onBack}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg"
                        >
                            I Accept These Terms
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
