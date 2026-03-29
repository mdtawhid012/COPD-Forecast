require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5000,
    ML_SERVICE_URL: process.env.ML_SERVICE_URL || "http://127.0.0.1:8000",
    REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT, 10) || 15000,
};
