const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const logger = require('./config/logger');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const apiRoutes = require('./routes/api');

const app = express();

// -----------------------------
// Middleware
// -----------------------------
app.use(cors());
app.use(express.json());
// Connect morgan to winston logger
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// -----------------------------
// Health Check
// -----------------------------
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        service: "COPD Backend",
        ml_service: env.ML_SERVICE_URL
    });
});

// -----------------------------
// Routes
// -----------------------------
app.use('/api', apiRoutes);

// -----------------------------
// Global Error Handler
// -----------------------------
app.use(errorHandler);

// -----------------------------
// Start Server
// -----------------------------
connectDB().then(() => {
    app.listen(env.PORT, () => {
        logger.info(`COPD Backend running at http://localhost:${env.PORT}`);
    });
});