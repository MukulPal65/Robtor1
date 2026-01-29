import React from 'react';
import { ArrowLeft, Scale, AlertTriangle, UserCheck, ShieldAlert, Activity } from 'lucide-react';

interface TermsOfServiceProps {
    onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12 relative overflow-hidden">
            {/* Background Blur */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[100px]"></div>

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <button
                        onClick={onBack}
                        className="bg-slate-900 border border-white/5 p-4 rounded-2xl hover:bg-slate-800 transition-all text-emerald-400 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="text-right">
                        <h1 className="text-3xl font-black text-white tracking-tight">Legal Protocol</h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Revision: Jan 2026</p>
                    </div>
                </div>

                <div className="card p-10 space-y-12 text-left">
                    <div className="text-center pb-8 border-b border-white/5">
                        <div className="bg-slate-800 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-2xl">
                            <Scale size={40} className="text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">Terms of Service</h2>
                    </div>

                    <section className="bg-amber-500/5 p-8 rounded-[2rem] border border-amber-500/10">
                        <h3 className="text-lg font-black text-amber-500 mb-4 flex items-center uppercase tracking-tight">
                            <AlertTriangle className="w-6 h-6 mr-3" />
                            1. Regulatory Disclosure
                        </h3>
                        <p className="text-sm text-amber-200/50 leading-relaxed font-medium">
                            The Robtor neural architecture provides <strong>informational data extraction only</strong>. This is not a clinical diagnosis system. Data output must be validated by licensed medical personnel before any health decisions are enacted.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-black text-white flex items-center uppercase tracking-tight">
                            <UserCheck className="w-6 h-6 mr-3 text-emerald-400" />
                            2. Human Governance
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            The user maintains 100% autonomy and responsibility for all actions taken based on system insights. Robtor serves as a data aggregator and translator, not a decision-maker.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-black text-white flex items-center uppercase tracking-tight">
                            <ShieldAlert className="w-6 h-6 mr-3 text-emerald-400" />
                            3. Data Integrity
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            Users must provide authentic clinical records. Attempting to bypass diagnostic protocols or uploading corrupted datasets is strictly prohibited and may result in permanent access revocation.
                        </p>
                    </section>

                    <div className="pt-10 border-t border-white/5 flex flex-col items-center">
                        <button
                            onClick={onBack}
                            className="btn-primary px-12 group"
                        >
                            Confirm Protocol Acceptance
                            <Activity className="ml-3 w-4 h-4 animate-pulse" />
                        </button>
                        <p className="mt-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">End of Document</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
