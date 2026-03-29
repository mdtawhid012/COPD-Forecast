import axios from 'axios';

const API_BASE = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
});

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error("API Error:", error);
        return Promise.reject(error.response?.data?.error || "An unexpected error occurred");
    }
);

export const fetchPatient = (id) => api.get(`/patient/${id}`);
export const predictEHR = (patientData) => api.post('/predict/ehr', patientData);
export const predictCT = (formData) => api.post('/predict/ct', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const predictFuse = (ehrRisk, ctRisk) => api.post('/predict/fuse', { ehrRisk, ctRisk });

export default api;
