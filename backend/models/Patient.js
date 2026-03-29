const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    AGE: { type: Number, required: true },
    smoking: { type: Number, required: true },
    gender: { type: Number, required: true },
    Diabetes: { type: Number, required: true },
    hypertension: { type: Number, required: true },
    AtrialFib: { type: Number, required: true },
    IHD: { type: Number, required: true },
    // Core Legacy ML Features
    PackHistory: { type: Number },
    CAT: { type: Number },
    SGRQ: { type: Number },
    HAD: { type: Number },
    // 14-Feature ML Model Specific Additions
    FEV1: { type: Number, required: true },
    FEV1PRED: { type: Number, required: true },
    FVC: { type: Number, required: true },
    FVCPRED: { type: Number, required: true },
    MWT1: { type: Number, required: true },
    MWT2: { type: Number, required: true },
    muscular: { type: Number, required: true },
    // UI Metadata
    summary: { type: String }
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
