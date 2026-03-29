require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const connectDB = require('../config/db');
const patientsData = require('../data/patients');

const seedPatients = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Patient.deleteMany();
        console.log('Cleared existing Patient collection');

        const patientsArray = Object.values(patientsData).map(p => {
            // Synthesize the 3 missing features needed for the new 14-feature XGBoost model
            // FVCPRED: FVC is usually around 80% to 100% of FVCPRED in healthy, lower in COPD.
            // A rough estimation: FVCPRED ≈ FVC / FEV1PRED ratio or just a flat multiplier.
            // Let's create a proxy: FVC / (p.FEV1 / p.FEV1PRED) 
            const ratio = p.FEV1 / p.FEV1PRED;
            const fvcPred = p.FVC / ratio;

            // MWT1 & MWT2: 6-minute walk test distances in meters.
            // Healthy > 400m. Severe COPD < 300m.
            // We can roughly proxy this based on CAT score or FEV1.
            let mwt1 = 400; // default healthy
            if (p.CAT > 20) mwt1 = 250 + Math.random() * 50; // Severe
            else if (p.CAT > 10) mwt1 = 300 + Math.random() * 80; // Moderate

            const mwt2 = mwt1 + (Math.random() * 20 - 10); // slightly different retest

            return {
                ...p,
                FVCPRED: parseFloat(fvcPred.toFixed(2)),
                MWT1: Math.round(mwt1),
                MWT2: Math.round(mwt2)
            };
        });

        const createdPatients = await Patient.insertMany(patientsArray);
        console.log(`Successfully seeded ${createdPatients.length} patients into MongoDB!`);

        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedPatients();
