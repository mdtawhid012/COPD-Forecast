import React, { useState } from "react";
import { Activity, ShieldAlert } from "lucide-react";
import PatientSearch from "./components/PatientSearch";
import EHRResults from "./components/EHRResults";
import CTUpload from "./components/CTUpload";
import FusionResults from "./components/FusionResults";
import { fetchPatient, predictEHR, predictCT, predictFuse } from "./services/api";

export default function App() {
    const [patientData, setPatientData] = useState(null);
    const [ehrResult, setEhrResult] = useState(null);
    const [ctResult, setCtResult] = useState(null);
    const [fusedResult, setFusedResult] = useState(null);

    const [ctFile, setCtFile] = useState(null);
    const [ctPreview, setCtPreview] = useState(null);

    const [loading, setLoading] = useState({
        patient: false,
        ehr: false,
        ct: false,
        fuse: false
    });
    const [error, setError] = useState("");

    const handlePatientFound = async (id) => {
        setLoading(prev => ({ ...prev, patient: true }));
        setError("");
        
        try {
            const data = await fetchPatient(id);
            // Reset all previous results
            setPatientData(data);
            setEhrResult(null);
            setCtResult(null);
            setFusedResult(null);
            setCtFile(null);
            setCtPreview(null);
        } catch (err) {
            setError(String(err));
            setPatientData(null);
        } finally {
            setLoading(prev => ({ ...prev, patient: false }));
        }
    };

    const handlePatientManualData = (data) => {
        setPatientData(data);
        setEhrResult(null);
        setCtResult(null);
        setFusedResult(null);
        setCtFile(null);
        setCtPreview(null);
        setError("");
    };

    const handleAnalyzeEHR = async () => {
        if (!patientData) return;
        setLoading(prev => ({ ...prev, ehr: true }));
        setError("");

        try {
            const result = await predictEHR(patientData);
            setEhrResult(result);
            if (ctResult) {
                await computeFusion(result.ehr_risk, ctResult.ct_risk);
            }
        } catch (err) {
            setError("EHR analysis failed: " + String(err));
        } finally {
            setLoading(prev => ({ ...prev, ehr: false }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCtFile(file);
        setCtPreview(URL.createObjectURL(file));
        setCtResult(null);
        setFusedResult(null);
    };

    const handleAnalyzeCT = async () => {
        if (!ctFile) return;
        setLoading(prev => ({ ...prev, ct: true }));
        setError("");

        const formData = new FormData();
        formData.append("ct_image", ctFile);

        try {
            const result = await predictCT(formData);
            setCtResult(result);
            if (ehrResult) {
                await computeFusion(ehrResult.ehr_risk, result.ct_risk);
            }
        } catch (err) {
            setError("CT analysis failed: " + String(err));
        } finally {
            setLoading(prev => ({ ...prev, ct: false }));
        }
    };

    const computeFusion = async (ehrRisk, ctRisk) => {
        setLoading(prev => ({ ...prev, fuse: true }));
        try {
            const result = await predictFuse(ehrRisk, ctRisk);
            setFusedResult(result);
        } catch (err) {
            setError("Fusion calculation failed: " + String(err));
        } finally {
            setLoading(prev => ({ ...prev, fuse: false }));
        }
    };

    const handleClear = () => {
        setPatientData(null);
        setEhrResult(null);
        setCtResult(null);
        setFusedResult(null);
        setCtFile(null);
        setCtPreview(null);
        setError("");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-2 rounded-xl shadow-lg ring-1 ring-white/10">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                                COPD Forecast
                            </h1>
                            <p className="text-xs text-indigo-400/80 font-medium uppercase tracking-widest mt-0.5">
                                Machine Learning Decision Support System
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                {/* Error Banner */}
                {error && (
                    <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                        <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-rose-500">Operation Error</h3>
                            <p className="text-sm text-rose-400/90 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left Column - Patient & EHR */}
                    <div className="lg:col-span-7 space-y-8 flex flex-col h-full">
                        <PatientSearch 
                            onPatientFound={handlePatientFound} 
                            onPatientManualData={handlePatientManualData}
                            patientData={patientData} 
                            loading={loading} 
                            onClear={handleClear}
                        />

                        <div className="flex-1">
                            <EHRResults 
                                patientData={patientData}
                                onAnalyze={handleAnalyzeEHR}
                                loading={loading}
                                result={ehrResult}
                            />
                        </div>
                    </div>

                    {/* Right Column - CT Upload */}
                    <div className="lg:col-span-5 flex flex-col h-full">
                        {patientData ? (
                            <CTUpload 
                                file={ctFile}
                                preview={ctPreview}
                                onFileChange={handleFileChange}
                                onAnalyze={handleAnalyzeCT}
                                loading={loading}
                                result={ctResult}
                            />
                        ) : (
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative flex items-center justify-center h-full min-h-[300px] opacity-50">
                                <p className="text-slate-500 text-sm">Select a patient to upload CT scan</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Row - Fusion Results */}
                    {fusedResult && (
                        <FusionResults fusedResult={fusedResult} />
                    )}
                </div>
            </main>
        </div>
    );
}