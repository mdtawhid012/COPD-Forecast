const mlService = require('../services/mlService');
const fusionService = require('../services/fusionService');
const logger = require('../config/logger');
const FormData = require('form-data');

const predictEHR = async (req, res, next) => {
    try {
        const result = await mlService.predictEHR(req.body);
        logger.info(`EHR prediction completed`, { risk: result.ehr_risk });
        res.json(result);
    } catch (error) {
        logger.error(`EHR prediction error: ${error.message}`);
        next(error);
    }
};

const predictCT = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No CT image uploaded" });
        }

        const form = new FormData();
        form.append("file", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        const result = await mlService.predictCT(form, form.getHeaders());
        logger.info(`CT prediction completed`, { risk: result.ct_risk });
        res.json(result);
    } catch (error) {
        logger.error(`CT prediction error: ${error.message}`);
        next(error);
    }
};

const predictFuse = (req, res) => {
    const { ehrRisk, ctRisk } = req.body;

    if (typeof ehrRisk !== "number" || typeof ctRisk !== "number") {
        return res.status(400).json({ error: "Invalid risk scores" });
    }

    const result = fusionService.calculateFusion(ehrRisk, ctRisk);
    logger.info(`Fusion calculation completed`, { final_risk: result.final_probability });
    
    res.json(result);
};

const predictFull = async (req, res, next) => {
    try {
        if (!req.file || !req.body.patientData) {
            return res.status(400).json({ error: "Missing CT image or patient data" });
        }

        const patientData = JSON.parse(req.body.patientData);
        
        // Parallel requests
        const form = new FormData();
        form.append("file", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        const [ehrResult, ctResult] = await Promise.all([
            mlService.predictEHR(patientData),
            mlService.predictCT(form, form.getHeaders())
        ]);

        const fusionResult = fusionService.calculateFusion(ehrResult.ehr_risk, ctResult.ct_risk);

        res.json({
            ehr: ehrResult,
            ct: ctResult,
            fusion: fusionResult
        });
    } catch (error) {
        logger.error(`Full prediction error: ${error.message}`);
        next(error);
    }
};

module.exports = {
    predictEHR,
    predictCT,
    predictFuse,
    predictFull
};
