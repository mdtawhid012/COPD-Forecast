const axios = require('axios');
const env = require('../config/env');

const predictEHR = async (patientData) => {
    // Build feature set expected by XGBoost ML layer (7 inputs)
    const payload = {
        AGE: patientData.AGE ?? 50,
        smoking: patientData.smoking ?? 0,
        gender: patientData.gender ?? 0,
        Diabetes: patientData.Diabetes ?? 0,
        hypertension: patientData.hypertension ?? 0,
        AtrialFib: patientData.AtrialFib ?? 0,
        IHD: patientData.IHD ?? 0
    };

    const response = await axios.post(
        `${env.ML_SERVICE_URL}/predict/ehr`,
        payload,
        { timeout: env.REQUEST_TIMEOUT }
    );
    return response.data;
};

const predictCT = async (form, headers) => {
    const response = await axios.post(
        `${env.ML_SERVICE_URL}/predict/ct`,
        form,
        {
            headers: headers,
            timeout: env.REQUEST_TIMEOUT
        }
    );
    return response.data;
};

module.exports = {
    predictEHR,
    predictCT
};
