const express = require('express');
const multer = require('multer');
const patientController = require('../controllers/patientController');
const predictController = require('../controllers/predictController');
const { validateEHR } = require('../middlewares/validation');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/patient/:id', patientController.getPatientById);

router.post('/predict/ehr', validateEHR, predictController.predictEHR);
router.post('/predict/ct', upload.single('ct_image'), predictController.predictCT);
router.post('/predict/fuse', predictController.predictFuse);
router.post('/predict/full', upload.single('ct_image'), predictController.predictFull);

module.exports = router;
