# COPD Exacerbation Risk Prediction System

A full-stack, multimodal machine learning decision support system for predicting COPD (Chronic Obstructive Pulmonary Disease) exacerbation risk.

It combines **EHR tabular data** (XGBoost) with **CT scans** (PyTorch CNN) to present a confidence-weighted fusion score to clinicians. The system features model explainability through **SHAP** for tabular features and **Grad-CAM** for imaging.

## Architecture

1. **Frontend (React + Tailwind CSS)**
   - Modular UI for Patient selection, EHR analysis, and CT scan uploads.
   - Built with Vite.
2. **Backend (Node.js + Express)**
   - REST API containing the confidence-based fusion logic.
   - Modular architecture (Routes, Controllers, Services, Middlewares).
   - Validates requests via Joi.
   - Acts as the orchestrator to the ML service.

3. **ML Service (Python + FastAPI)**
   - Serves the XGBoost (.pkl) and PyTorch (.pth) models.
   - Computes SHAP feature importance for EHR data.
   - Computes Grad-CAM heatmaps for CT images.

## Setup Instructions

### Using Docker (Recommended)

Make sure you have Docker and Docker Compose installed.

```bash
docker-compose up --build
```

- Frontend: http://localhost:80
- Backend API: http://localhost:5000
- ML Service API: http://localhost:8000

### Manual Setup

_Ensure you have Node.js 18+ and Python 3.10+ installed._

#### 1. ML Service

```bash
cd python-ml
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

_(Ensure `ehr_xgb_model.pkl` and `lung_cnn_model.pth` exist in the `python-ml` directory)._

#### 2. Backend

```bash
cd backend
npm install
npm start
```

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Features Demo

- Choose **"Random"** in Patient Selection to pull a dummy patient EHR record.
- Upload any image for the CT scan (resized to 128x128 internally).
- View the SHAP feature importances and Grad-CAM activations alongside the fused risk probability.
