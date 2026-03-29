const Patient = require('../models/Patient');
const logger = require('../config/logger');

const getPatientById = async (req, res) => {
    try {
        const patientId = req.params.id;
        const patient = await Patient.findOne({ id: patientId });

        if (!patient) {
            logger.warn(`Patient not found in DB: ${patientId}`);
            return res.status(404).json({
                error: "Patient not found (Try ID 301 to 317)"
            });
        }

        logger.info(`Patient fetched from DB: ${patientId}`);
        res.json(patient);
    } catch (error) {
        logger.error(`Error fetching patient ${req.params.id}: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getPatientById
};
