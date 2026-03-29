import React, { useRef } from 'react';
import { Loader2, UploadCloud, FileImage, Image as ImageIcon } from 'lucide-react';
import { getRiskColor, formatRiskPercentage } from '../utils/helpers';

export default function CTUpload({ file, preview, onFileChange, onAnalyze, loading, result }) {
    const fileInputRef = useRef(null);

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg ring-1 ring-white/5 relative overflow-hidden transition-all duration-500 h-full">
            <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <FileImage className="w-5 h-5 text-fuchsia-400" />
                    CT Imaging
                </h3>
            </div>

            <div
                onClick={() => !loading.ct && fileInputRef.current?.click()}
                className={`border-2 border-dashed ${file ? 'border-fuchsia-500/30 bg-fuchsia-500/5' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'} 
                rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center relative min-h-[200px]`}
            >
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={onFileChange}
                    disabled={loading.ct}
                />

                {preview ? (
                    <div className="relative w-full h-full flex items-center justify-center group">
                        <img
                            src={preview}
                            alt="CT scan"
                            className="max-h-48 object-contain rounded-lg shadow-md transition-opacity duration-300 group-hover:opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-slate-900/80 text-white px-3 py-1.5 rounded-md text-xs font-medium backdrop-blur-sm">
                                Change Image
                            </span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-slate-400 group-hover:text-white transition-colors">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <p className="text-sm text-slate-300 font-medium">Click to upload CT scan</p>
                        <p className="text-xs text-slate-500 mt-2">JPEG, PNG supporting up to 10MB</p>
                    </>
                )}
            </div>

            {file && !result && (
                <button
                    onClick={onAnalyze}
                    disabled={loading.ct}
                    className="w-full mt-6 py-3 bg-fuchsia-600/90 hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(192,38,211,0.3)] hover:shadow-[0_0_25px_rgba(192,38,211,0.5)] flex items-center justify-center gap-2"
                >
                    {loading.ct ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Image...</>
                    ) : (
                        <><ImageIcon className="w-4 h-4" /> Process CT Scan</>
                    )}
                </button>
            )}

            {result && (
                <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                        <span className="text-sm text-slate-400 font-medium">Radiology Risk</span>
                        <span className={`text-4xl font-bold tracking-tight ${getRiskColor(result.ct_risk)}`}>
                            {formatRiskPercentage(result.ct_risk)}
                        </span>
                    </div>

                    {result.gradcam_image && (
                         <div className="mt-4 border border-slate-700/50 rounded-lg overflow-hidden bg-slate-950/50 p-1">
                             <div className="px-3 py-2 border-b border-slate-800 flex justify-between items-center">
                                 <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grad-CAM Activation</h4>
                             </div>
                             <div className="p-2 flex justify-center bg-black/20">
                                <img 
                                    src={`data:image/png;base64,${result.gradcam_image}`} 
                                    alt="Grad-CAM Heatmap" 
                                    className="max-h-48 object-contain rounded"
                                />
                             </div>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
}
