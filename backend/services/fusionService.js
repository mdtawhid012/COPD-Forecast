const calculateFusion = (ehrRisk, ctRisk) => {
    // Confidence-based Fusion Algorithm
    // High risk scores towards extremes (close to 0 or 1) have higher confidence
    
    // Calculate distance from 0.5 (uncertainty point)
    const ehrConfidence = Math.abs(ehrRisk - 0.5) * 2; // scale 0 to 1
    const ctConfidence = Math.abs(ctRisk - 0.5) * 2;   // scale 0 to 1
    
    // Base weights
    let ehrWeight = 0.6;
    let ctWeight = 0.4;
    
    // Adjust weights based on confidence difference
    if (ctConfidence > ehrConfidence + 0.3) {
        // CT is significantly more confident
        ehrWeight = 0.4;
        ctWeight = 0.6;
    } else if (ehrConfidence > ctConfidence + 0.3) {
        // EHR is significantly more confident
        ehrWeight = 0.7;
        ctWeight = 0.3;
    }
    
    const finalRisk = (ehrWeight * ehrRisk) + (ctWeight * ctRisk);
    
    let category = "Low";
    let recommendation = "Routine follow-up recommended.";

    if (finalRisk > 0.7) {
        category = "High";
        recommendation = "High exacerbation risk. Urgent clinical review recommended.";
    } else if (finalRisk > 0.4) {
        category = "Moderate";
        recommendation = "Moderate risk. Optimize therapy and monitor closely.";
    }

    return {
        final_probability: finalRisk,
        category,
        recommendation,
        weights_used: { ehr: ehrWeight, ct: ctWeight }
    };
};

module.exports = {
    calculateFusion
};
