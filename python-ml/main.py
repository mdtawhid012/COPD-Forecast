import io
import base64
from typing import Annotated
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import torch
import torch.nn.functional as F
import numpy as np
import cv2
from PIL import Image
import shap
import joblib
from captum.attr import LayerGradCam

from generate_models import LungCNN

# ------------------------------
# Global State
# ------------------------------
ehr_model = None
ehr_scaler = None
cnn_model = None
shap_explainer = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ehr_model, ehr_scaler, cnn_model, shap_explainer

    # Load EHR XGB Classifier
    try:
        ehr_model = joblib.load("ehr_xgb_model.pkl")
        print("EHR XGB Model loaded successfully")
        
        # Initialize SHAP Explainer
        shap_explainer = shap.TreeExplainer(ehr_model)
        print("SHAP Explainer loaded successfully")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Warning: Could not load EHR model. {e}")

    # Load CNN
    try:
        cnn_model = LungCNN()
        checkpoint = torch.load("lung_cnn_model.pth", map_location=device)
        if "model_state_dict" in checkpoint:
            cnn_model.load_state_dict(checkpoint["model_state_dict"])
        else:
            cnn_model.load_state_dict(checkpoint)
        cnn_model.eval()
        cnn_model.to(device)
        print("CNN Model loaded successfully")
    except Exception as e:
        print(f"Warning: Could not load CNN model. {e}")

    yield

    # Clean up
    ehr_model = None
    cnn_model = None
    shap_explainer = None


app = FastAPI(title="COPD Multimodal Prediction API", lifespan=lifespan)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("VALIDATION ERROR:", exc.errors())
    print("BODY:", exc.body)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

# ------------------------------
# Schemas
# ------------------------------

class EHRInput(BaseModel):
    AGE: float
    smoking: int
    gender: int
    Diabetes: int
    hypertension: int
    AtrialFib: int
    IHD: int


class EHRResponse(BaseModel):
    ehr_risk: float
    top_features: dict[str, float]


class ClassProbs(BaseModel):
    small: float
    medium: float
    large: float


class CTResponse(BaseModel):
    ct_risk: float
    class_probs: ClassProbs
    gradcam_image: str | None


class FusionInput(BaseModel):
    ehrRisk: float
    ctRisk: float


class FusionResponse(BaseModel):
    final_probability: float
    category: str
    recommendation: str


# ------------------------------
# Endpoints
# ------------------------------

@app.post("/predict/ehr", response_model=EHRResponse)
def predict_ehr(data: EHRInput) -> EHRResponse:
    feature_names = [
        "AGE", "smoking", "gender", "Diabetes", "hypertension", "AtrialFib", "IHD"
    ]
    
    features_list = [
        data.AGE, data.smoking, data.gender, data.Diabetes, data.hypertension, data.AtrialFib, data.IHD
    ]
    
    features_arr = np.array([features_list])
    
    prob = float(ehr_model.predict_proba(features_arr)[0][1])

    # SHAP explanations
    top_features = {}
    try:
        if shap_explainer:
            shap_values = shap_explainer.shap_values(features_arr)
            sv = np.array(shap_values)
            
            if isinstance(shap_values, list) and len(shap_values) == 2:
                sv_arr = np.array(shap_values[1])
            elif sv.ndim == 3 and sv.shape[-1] == 2:
                sv_arr = sv[..., 1]
            elif sv.ndim == 3 and sv.shape[0] == 2:
                sv_arr = sv[1]
            else:
                sv_arr = sv
                
            sv_flat = sv_arr.flatten()
            if len(sv_flat) > len(feature_names):
                sv_flat = sv_flat[-len(feature_names):]
            
            feature_impacts = {name: float(val) for name, val in zip(feature_names, sv_flat)}
            sorted_features = dict(sorted(feature_impacts.items(), key=lambda item: abs(item[1]), reverse=True))
            top_features = sorted_features
    except Exception as e:
        print(f"SHAP Error: {e}")

    return EHRResponse(ehr_risk=prob, top_features=top_features)


@app.post("/predict/ct", response_model=CTResponse)
async def predict_ct(file: Annotated[UploadFile, File(...)]) -> CTResponse:
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("L")
    image = image.resize((128, 128))

    img_arr = np.array(image) / 255.0
    img_tensor = torch.tensor(img_arr, dtype=torch.float32).unsqueeze(0).unsqueeze(0).to(device)

    img_tensor.requires_grad = True

    outputs = cnn_model(img_tensor)
    probs = F.softmax(outputs, dim=1)
    
    predicted_class = torch.argmax(probs, dim=1).item()
    small, medium, large = probs[0].cpu().detach().numpy()
    
    ct_risk = float(large + 0.5 * medium)

    base64_img = None
    try:
        layer_gc = LayerGradCam(cnn_model, cnn_model.features[14])
        attr = layer_gc.attribute(img_tensor, target=predicted_class)
        
        attr_resized = F.interpolate(attr, size=(128, 128), mode='bilinear', align_corners=False)
        heatmap = attr_resized.squeeze().cpu().detach().numpy()
        
        heatmap = np.maximum(heatmap, 0)
        max_val = np.max(heatmap)
        if max_val > 0:
            heatmap /= max_val
            
        heatmap_uint8 = np.uint8(255 * heatmap)
        heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        
        img_cv = np.uint8(255 * img_arr)
        img_cv_bgr = cv2.cvtColor(img_cv, cv2.COLOR_GRAY2BGR)
        
        overlay = cv2.addWeighted(img_cv_bgr, 0.6, heatmap_color, 0.4, 0)
        
        _, buffer = cv2.imencode('.png', overlay)
        base64_img = base64.b64encode(buffer).decode('utf-8')
    except Exception as e:
        print(f"Error generating Grad-CAM: {e}")

    return CTResponse(
        ct_risk=ct_risk,
        class_probs=ClassProbs(small=float(small), medium=float(medium), large=float(large)),
        gradcam_image=base64_img
    )


@app.post("/predict/fusion", response_model=FusionResponse)
def predict_fusion(data: FusionInput) -> FusionResponse:
    final_risk = (0.6 * data.ehrRisk) + (0.4 * data.ctRisk)

    category = "Low"
    message = "Routine monitoring recommended."

    if final_risk > 0.7:
        category = "High"
        message = "High exacerbation risk. Clinical review recommended."
    elif final_risk > 0.4:
        category = "Moderate"
        message = "Moderate risk. Consider therapy optimization."

    return FusionResponse(
        final_probability=float(final_risk),
        category=category,
        recommendation=message
    )
