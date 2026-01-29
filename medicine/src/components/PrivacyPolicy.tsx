import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/5 rounded-full filter blur-[150px] pointer-events-none"></div>

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <button
                        onClick={onBack}
                        className="bg-slate-900 border border-white/5 p-4 rounded-2xl hover:bg-slate-800 transition-all text-emerald-400 group shadow-2xl"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="text-right">
                        <h1 className="text-3xl font-black text-white tracking-tight">Security Vault</h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Status: Fully Encrypted</p>
                    </div>
                </div>

                <div className="card p-10 space-y-12 text-left bg-slate-900/80 backdrop-blur-2xl">
                    <div className="text-center pb-10 border-b border-white/5">
                        <div className="bg-emerald-500/10 w-24 h-24 rounded-[3rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-premium">
                            <Shield size={48} className="text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">Privacy Infrastructure</h2>
                        <p className="mt-2 text-slate-500 text-xs font-bold uppercase tracking-widest">Global Data Standard v2.0</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-slate-950/50 rounded-[2rem] border border-white/5 space-y-4">
                            <Lock className="text-emerald-400 mb-2" size={24} />
                            <h4 className="text-white font-black text-sm uppercase">AES-256 Protocol</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">All health data is shard-encrypted at rest and in transit using military-grade cryptographic standards.</p>
                        </div>
                        <div className="p-8 bg-slate-950/50 rounded-[2rem] border border-white/5 space-y-4">
                            <CheckCircle className="text-emerald-400 mb-2" size={24} />
                            <h4 className="text-white font-black text-sm uppercase">Zero Knowledge</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Internal systems are designed with zero-knowledge architecture, ensuring only you can decode your clinical records.</p>
                        </div>
                    </div>

                    <section className="space-y-6">
                        <h3 className="text-lg font-black text-white flex items-center uppercase tracking-tight">
                            <Eye className="w-6 h-6 mr-4 text-emerald-400" />
                            Data Access Parameters
                        </h3>
                        <div className="space-y-3">
                            {[
                                "Primary Identity: Verified email & biometric signatures.",
                                "Clinical Telemetry: Height, weight, and chronic vitals.",
                                "Neural Analysis: Lab results processed via Gemini-1.5-Pro.",
                                "Temporal Data: Wearable sync (Heart Rate, Sleep Patterns)."
                            ].map((item, i) => (
                                <div key={i} className="flex items-center space-x-3 p-4 bg-slate-950/30 rounded-2xl border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                                    <span className="text-xs text-slate-400 font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-rose-500/5 p-8 rounded-[2rem] border border-rose-500/20">
                        <div className="flex items-center space-x-3 mb-4">
                            <FileText className="text-rose-500" size={20} />
                            <h4 className="text-sm font-black text-rose-500 uppercase">Non-Diagnostic Clause</h4>
                        </div>
                        <p className="text-xs text-rose-200/50 leading-relaxed font-medium">
                            Robtor AI architecture provides statistical analysis of data. It does not possess medical certification. Clinical decisions must originate from qualified human professionals.
                        </p>
                    </section>

                    <div className="pt-10 border-t border-white/5 flex flex-col items-center">
                        <button
                            onClick={onBack}
                            className="btn-primary px-14 group"
                        >
                            <Shield className="mr-3 w-4 h-4" />
                            Secure Session Start
                        </button>
                        <p className="mt-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Privacy Guardian Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
