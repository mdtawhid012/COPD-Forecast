import React, { useState } from 'react';
import { Loader2, Search, Dices, UserPlus, SlidersHorizontal } from 'lucide-react';

export default function PatientSearch({ onPatientFound, onPatientManualData, patientData, loading, onClear }) {
    const [mode, setMode] = useState('search'); // 'search' or 'manual'
    const [patientId, setPatientId] = useState("");
    const [manualData, setManualData] = useState({
        AGE: 50,
        smoking: 0,
        gender: 0,
        Diabetes: 0,
        hypertension: 0,
        AtrialFib: 0,
        IHD: 0,
        FEV1: 2.5,
        FEV1PRED: 3.0,
        FVC: 3.5,
        FVCPRED: 4.0,
        MWT1: 400,
        MWT2: 400,
        muscular: 0
    });

    const handleFetch = (e) => {
        e.preventDefault();
        if (patientId.trim()) onPatientFound(patientId);
    };

    const handleRandom = () => {
        // Random ID between 301 and 317 (17 patients total)
        const randomId = Math.floor(Math.random() * 17) + 301;
        setPatientId(String(randomId));
        onPatientFound(String(randomId));
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        // Construct patient object
        const data = {
            id: "Manual",
            summary: "Manually entered patient data.",
            ...manualData
        };
        onPatientManualData(data);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setManualData(prev => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    return (
        <section className="flex flex-col gap-4">
            <div className="flex justify-between items-center mr-2">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    {mode === 'search' ? <Search className="w-5 h-5 text-indigo-400" /> : <SlidersHorizontal className="w-5 h-5 text-indigo-400" />}
                    Patient Selection
                </h2>
                {/* <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700/50">
                    <button 
                        onClick={() => setMode('search')}
                        className={`text-xs px-3 py-1.5 rounded-md transition-colors ${mode === 'search' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >Database</button>
                    <button 
                        onClick={() => setMode('manual')}
                        className={`text-xs px-3 py-1.5 rounded-md transition-colors ${mode === 'manual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >Manual Entry</button>
                </div> */}
            </div>
            
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg ring-1 ring-white/5 transition-all">
                {mode === 'search' ? (
                    <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Enter Patient ID (e.g., 301)"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500"
                        />
                        <div className="flex gap-2">
                            {/* <button
                                type="button"
                                onClick={handleRandom}
                                disabled={loading.patient}
                                className="bg-slate-800 border border-slate-700 hover:bg-slate-700 px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 text-slate-200"
                            >
                                <Dices className="w-4 h-4" />
                                Random
                            </button> */}
                            <button
                                type="submit"
                                disabled={loading.patient || !patientId.trim()}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent px-6 py-2.5 rounded-lg text-sm font-medium transition-colors text-white min-w-[100px] flex justify-center items-center"
                            >
                                {loading.patient ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch EHR"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleManualSubmit} className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">AGE</label>
                                <input type="number" name="AGE" value={manualData.AGE} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200" required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">Smoking</label>
                                <select name="smoking" value={manualData.smoking} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200">
                                    <option value={0}>No</option>
                                    <option value={1}>Yes</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">Gender</label>
                                <select name="gender" value={manualData.gender} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200">
                                    <option value={0}>Female</option>
                                    <option value={1}>Male</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">Diabetes</label>
                                <select name="Diabetes" value={manualData.Diabetes} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200">
                                    <option value={0}>No</option>
                                    <option value={1}>Yes</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">Hypertension</label>
                                <select name="hypertension" value={manualData.hypertension} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200">
                                    <option value={0}>No</option>
                                    <option value={1}>Yes</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">Atrial Fibrillation</label>
                                <select name="AtrialFib" value={manualData.AtrialFib} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200">
                                    <option value={0}>No</option>
                                    <option value={1}>Yes</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">Ischemic Heart Disease</label>
                                <select name="IHD" value={manualData.IHD} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200">
                                    <option value={0}>No</option>
                                    <option value={1}>Yes</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">FEV1 (L)</label>
                                <input type="number" step="0.1" name="FEV1" value={manualData.FEV1} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200" required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">FEV1 Predicted (L)</label>
                                <input type="number" step="0.1" name="FEV1PRED" value={manualData.FEV1PRED} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200" required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">FVC (L)</label>
                                <input type="number" step="0.1" name="FVC" value={manualData.FVC} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200" required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">FVC Predicted (L)</label>
                                <input type="number" step="0.1" name="FVCPRED" value={manualData.FVCPRED} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200" required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">MWT1 (m)</label>
                                <input type="number" name="MWT1" value={manualData.MWT1} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200" required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">MWT2 (m)</label>
                                <input type="number" name="MWT2" value={manualData.MWT2} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200" required />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400 font-medium ml-1">Muscular Issues</label>
                                <select name="muscular" value={manualData.muscular} onChange={handleInputChange} className="bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200">
                                    <option value={0}>No</option>
                                    <option value={1}>Yes</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2 border-t border-slate-800">
                            <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-500 border border-transparent px-6 py-2 rounded-lg text-sm font-medium transition-colors text-white min-w-[120px] flex justify-center items-center gap-2 shadow-sm shadow-indigo-500/20"
                            >
                                <UserPlus className="w-4 h-4" /> Load Profile
                            </button>
                        </div>
                    </form>
                )}

                {patientData && (
                    <div className="mt-6 p-4 bg-slate-800/40 rounded-lg border border-slate-700/50 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <div className="flex-1">
                            <p className="text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wider">Patient {patientData.id !== 'Manual' ? `#${patientData.id}` : '(Manual Profile)'}</p>
                            <p className="text-sm text-slate-300 leading-relaxed">{patientData.summary}</p>
                            
                            {patientData.id === 'Manual' && (
                                <div className="flex flex-wrap gap-1.5 mt-2.5">
                                    <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-950 text-slate-400 px-2.5 py-1 rounded ring-1 ring-slate-800">Age: <span className="text-slate-200">{patientData.AGE}</span></span>
                                    {patientData.smoking === 1 && <span className="text-[10px] uppercase font-bold tracking-wider bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded ring-1 ring-rose-500/20">Smoker</span>}
                                    <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-950 text-slate-400 px-2.5 py-1 rounded ring-1 ring-slate-800">{patientData.gender === 1 ? 'Male' : 'Female'}</span>
                                    {patientData.Diabetes === 1 && <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded ring-1 ring-amber-500/20">Diabetes</span>}
                                    {patientData.hypertension === 1 && <span className="text-[10px] uppercase font-bold tracking-wider bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded ring-1 ring-orange-500/20">HTN</span>}
                                    {patientData.AtrialFib === 1 && <span className="text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded ring-1 ring-cyan-500/20">AFib</span>}
                                    {patientData.IHD === 1 && <span className="text-[10px] uppercase font-bold tracking-wider bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded ring-1 ring-purple-500/20">IHD</span>}
                                </div>
                            )}
                        </div>
                        <button onClick={onClear} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors shrink-0">Clear Session</button>
                    </div>
                )}
            </div>
        </section>
    );
}
