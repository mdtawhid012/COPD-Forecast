import React from 'react';
import { Loader2, Activity, ChevronRight, BarChart3 } from 'lucide-react';
import { getRiskColor, formatRiskPercentage } from '../utils/helpers';

const getFeatureExplanation = (feature, impact, patientData) => {
    const isPositive = impact > 0;
    const value = patientData[feature];

    switch (feature) {
        case 'AGE':
            return isPositive ? `Age (${value} yrs) increases risk` : `Age (${value} yrs) lowers risk in this profile`;
        case 'smoking':
            if (Number(value) === 1) return isPositive ? `Current/past smoking increases risk` : `Current/past smoking unexpectedly lowers risk in this profile`;
            return isPositive ? `Non-smoker status unexpectedly increases risk here` : `Non-smoker status lowers risk`;
        case 'Diabetes':
            if (Number(value) === 1) return isPositive ? `Presence of diabetes increases risk` : `Presence of diabetes unexpectedly lowers risk here`;
            return isPositive ? `Absence of diabetes unexpectedly increases risk here` : `Absence of diabetes lowers risk`;
        case 'hypertension':
            if (Number(value) === 1) return isPositive ? `Hypertension increases risk` : `Hypertension unexpectedly lowers risk here`;
            return isPositive ? `Normal blood pressure unexpectedly increases risk here` : `Normal blood pressure lowers risk`;
        case 'AtrialFib':
            if (Number(value) === 1) return isPositive ? `Atrial Fibrillation increases risk` : `Atrial Fibrillation unexpectedly lowers risk here`;
            return isPositive ? `No Atrial Fibrillation unexpectedly increases risk here` : `No Atrial Fibrillation lowers risk`;
        case 'IHD':
            if (Number(value) === 1) return isPositive ? `Ischemic Heart Disease increases risk` : `Ischemic Heart Disease unexpectedly lowers risk here`;
            return isPositive ? `No Heart Disease unexpectedly increases risk here` : `No Heart Disease lowers risk`;
        case 'gender':
            if (Number(value) === 1) return isPositive ? `Male gender increases risk` : `Male gender lowers risk`;
            return isPositive ? `Female gender increases risk` : `Female gender lowers risk`;
        // Fallback for older model parameters if they ever appear
        case 'PackHistory':
            return isPositive ? `High smoking pack history increases risk` : `Low pack history lowers risk`;
        case 'CAT':
            return isPositive ? `High CAT score (${value}) increases risk` : `Low CAT score (${value}) lowers risk`;
        case 'SGRQ':
            return isPositive ? `High SGRQ score (${value}) increases risk` : `Low SGRQ score (${value}) lowers risk`;
        case 'FEV1':
            return isPositive ? `High FEV1 increases risk` : `Low FEV1 (${value} L) lowers risk`;
        case 'FEV1PRED':
            return isPositive ? `High FEV1% Predicted increases risk` : `Low FEV1% Predicted lowers risk`;
        case 'FVC':
            return isPositive ? `High FVC increases risk` : `Low FVC lowers risk`;
        case 'HAD':
            return isPositive ? `High anxiety/depression score increases risk` : `Low HAD score lowers risk`;
        case 'MWT1':
            return isPositive ? `Low 6-minute walk distance (baseline) increases risk` : `Higher walk distance (${value}m) lowers risk`;
        case 'MWT2':
            return isPositive ? `Low 6-minute walk distance (retest) increases risk` : `Higher walk distance retest (${value}m) lowers risk`;
        case 'FVCPRED':
            return isPositive ? `High FVC% Predicted increases risk` : `Low FVC% Predicted lowers risk`;
        case 'muscular':
             if (Number(value) === 1) return isPositive ? `Muscular issues increase risk` : `Muscular issues unexpectedly lower risk here`;
             return isPositive ? `Lack of muscular issues unexpectedly increases risk here` : `No muscular issues lower risk`;
        default:
            return isPositive ? `${feature} increases risk` : `${feature} lowers risk`;
    }
};

export default function EHRResults({ patientData, onAnalyze, loading, result }) {
    if (!patientData) return null;

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg ring-1 ring-white/5 relative overflow-hidden transition-all duration-500">
            <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    EHR Analysis
                </h3>
            </div>

            {!result ? (
                <button
                    onClick={onAnalyze}
                    disabled={loading.ehr}
                    className="w-full py-3 bg-cyan-600/90 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] flex items-center justify-center gap-2"
                >
                    {loading.ehr ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Clinical Data...</>
                    ) : (
                        <>Run Prediction Model <ChevronRight className="w-4 h-4" /></>
                    )}
                </button>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                        <span className="text-sm text-slate-400 font-medium">EHR Risk Assessment</span>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-bold tracking-tight ${getRiskColor(result.ehr_risk)}`}>
                                {formatRiskPercentage(result.ehr_risk)}
                            </span>
                        </div>
                    </div>

                    {result.top_features && Object.keys(result.top_features).length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <BarChart3 className="w-3.5 h-3.5" />
                                Model Explainability (SHAP)
                            </h4>
                            <div className="space-y-3">
                                {Object.entries(result.top_features)
                                    .slice(0, 6)
                                    .map(([feature, impact], idx) => {
                                    // Scale to percentage for visual bar, max absolute value is approx the first one since it's sorted
                                    const maxImpact = Math.abs(Object.values(result.top_features)[0]) || 1;
                                    const width = Math.max(5, (Math.abs(impact) / maxImpact) * 100);
                                    const isPositive = impact > 0;
                                    
                                    return (
                                        <div key={idx} className="flex flex-col gap-1.5 mb-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${isPositive ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                                                    <span className="text-slate-300 font-medium text-xs">{getFeatureExplanation(feature, impact, patientData)}</span>
                                                </div>
                                                <span className={`text-[10px] font-mono font-bold ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                    {isPositive ? '+' : ''}{impact.toFixed(3)} SHAP
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden flex">
                                                <div 
                                                    className={`h-full rounded-full ${isPositive ? 'bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} 
                                                    style={{ width: `${width}%`, marginLeft: isPositive ? '0' : 'auto', marginRight: isPositive ? 'auto' : '0' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
