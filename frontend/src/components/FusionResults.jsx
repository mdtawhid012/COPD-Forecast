import React from 'react';
import { getRiskColor, formatRiskPercentage } from '../utils/helpers';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function FusionResults({ fusedResult }) {
    if (!fusedResult) return null;

    const prob = fusedResult.final_probability;
    const isHigh = prob > 0.7;
    const isModerate = prob > 0.4 && prob <= 0.7;

    const Icon = isHigh ? AlertTriangle : (isModerate ? Info : CheckCircle2);
    const ringColor = isHigh ? 'ring-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)]' : 
                      (isModerate ? 'ring-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)]' : 
                                    'ring-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]');

    return (
        <section className={`col-span-full bg-slate-900 border border-slate-800 p-8 rounded-2xl ring-1 ${ringColor} transition-all duration-700 animate-in fade-in zoom-in-95`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                
                <div className="flex-1 text-center md:text-left space-y-2">
                    <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">
                        Multimodal Prediction
                    </p>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Final Exacerbation Risk
                    </h2>
                    <p className="text-slate-400 max-w-md mx-auto md:mx-0">
                        This prediction combines EHR clinical markers with CT imaging analysis using a confidence-weighted algorithm.
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="relative flex items-center justify-center">
                        {/* Circular Progress */}
                        <svg className="w-40 h-40 transform -rotate-90">
                            <circle cx="80" cy="80" r="70" className="stroke-slate-800" strokeWidth="12" fill="none" />
                            <circle 
                                cx="80" cy="80" r="70" 
                                className={`transition-all duration-1000 ease-out fill-none 
                                    ${isHigh ? 'stroke-rose-500' : (isModerate ? 'stroke-amber-500' : 'stroke-emerald-500')}`}
                                strokeWidth="12" 
                                strokeLinecap="round"
                                strokeDasharray="439.8" 
                                strokeDashoffset={439.8 - (439.8 * prob)}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-black tabular-nums ${getRiskColor(prob)}`}>
                                {(prob * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center bg-slate-950/50 p-6 rounded-xl border border-slate-800/80 w-full md:w-auto">
                    <div className="flex items-start gap-4">
                        <div className={`mt-1 p-2 rounded-full shrink-0 ${isHigh ? 'bg-rose-500/20 text-rose-400' : (isModerate ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400')} `}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div className="w-full">
                            <h4 className="text-lg font-semibold text-white mb-1 uppercase tracking-wide">
                                {fusedResult.category} RISK
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {fusedResult.recommendation}
                            </p>
                            
                            {/* Weights used visualization */}
                            {fusedResult.weights_used && (
                                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-500 font-mono">
                                    <span>EHR Weight: {fusedResult.weights_used.ehr.toFixed(2)}</span>
                                    <span>CT Weight: {fusedResult.weights_used.ct.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
