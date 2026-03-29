export const getRiskColor = (prob) => {
    if (prob < 0.4) return "text-emerald-400";
    if (prob < 0.7) return "text-amber-400";
    return "text-rose-500";
};

export const formatRiskPercentage = (prob) => {
    return `${(prob * 100).toFixed(1)}%`;
};
