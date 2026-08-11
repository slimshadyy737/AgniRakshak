"""
AgniRakshak AI Risk Classification & Fire Weather Intelligence Engine
Combines Scikit-Learn Random Forest classification, deterministic heuristic safety rules,
Vapor Pressure Deficit (VPD), Fire Weather Index (FWI), and Rate of Spread (ROS) modeling.
"""

import numpy as np
import pandas as pd
import joblib
import os
import math
from typing import Dict, Tuple, Any

MODEL_PATH = "wildfire_model.pkl"
SCALER_PATH = "scaler.pkl"

FEATURE_NAMES = [
    'temperature',
    'humidity',
    'co_ppm',
    'smoke_raw',
    'dT_dt',
    'dCO_dt',
    'dH_dt',
    'combustion_idx'
]

RISK_LEVELS = {
    0: ("NORMAL", "Green", "#10B981"),
    1: ("WARNING", "Yellow", "#F59E0B"),
    2: ("HIGH RISK", "Red", "#EF4444")
}

def calculate_sensor_compensation(temp: float, humidity: float) -> float:
    """Computes environmental correction factor K(T, H) for SnO2 gas sensors."""
    a0, a1, a2, a3, a4, a5 = 1.215, -0.0118, -0.0032, 0.00014, 0.000021, 0.000045
    k_factor = a0 + a1 * temp + a2 * humidity + a3 * (temp**2) + a4 * (humidity**2) + a5 * (temp * humidity)
    return max(0.4, min(2.0, k_factor))

def calculate_vpd(temp: float, humidity: float) -> float:
    """
    Computes Vapor Pressure Deficit (VPD) in kilopascals (kPa).
    High VPD (> 2.0 kPa) indicates severe fuel moisture depletion & elevated fire danger.
    """
    svp = 0.61078 * math.exp((17.27 * temp) / (temp + 237.3)) # Saturated vapor pressure
    avp = svp * (humidity / 100.0)                            # Actual vapor pressure
    vpd = max(0.0, svp - avp)
    return round(vpd, 2)

def calculate_fire_weather_index(temp: float, hum: float, wind_kmh: float = 12.0) -> Dict[str, Any]:
    """
    Calculates Fire Weather Index (FWI) components:
    - Fine Fuel Moisture Code (FFMC)
    - Initial Spread Index (ISI)
    - Fire Weather Danger Category
    """
    vpd = calculate_vpd(temp, hum)
    
    # FFMC proxy based on humidity and VPD
    ffmc = min(99.0, max(20.0, 85.0 + (vpd * 4.5) - (hum * 0.2)))
    
    # Initial Spread Index (ISI) combining FFMC and wind speed
    isi = max(0.0, (math.exp(0.05039 * ffmc) * math.exp(0.0272 * wind_kmh)) * 0.02)
    
    # Rate of Spread (ROS) in meters/minute
    ros_m_per_min = max(0.1, round(isi * 1.4, 2))
    
    # Determine Danger Rating
    if isi >= 12.0 or vpd >= 2.5:
        category = "EXTREME DANGER"
        color = "#EF4444"
    elif isi >= 6.0 or vpd >= 1.5:
        category = "HIGH DANGER"
        color = "#F59E0B"
    elif isi >= 2.5:
        category = "MODERATE DANGER"
        color = "#38BDF8"
    else:
        category = "LOW DANGER"
        color = "#10B981"
        
    return {
        "vpd_kpa": vpd,
        "ffmc": round(ffmc, 1),
        "isi": round(isi, 1),
        "rate_of_spread_m_min": ros_m_per_min,
        "danger_category": category,
        "color": color
    }

def extract_features(telemetry: Dict[str, float], prev_telemetry: Dict[str, float] = None, dt_seconds: float = 60.0) -> np.ndarray:
    temp = telemetry.get('temperature', 25.0)
    hum = telemetry.get('humidity', 50.0)
    co = telemetry.get('co_ppm', 5.0)
    smoke = telemetry.get('smoke_raw', 300.0)
    
    dt_min = max(0.1, dt_seconds / 60.0)
    if prev_telemetry:
        prev_temp = prev_telemetry.get('temperature', temp)
        prev_co = prev_telemetry.get('co_ppm', co)
        prev_hum = prev_telemetry.get('humidity', hum)
        
        dT_dt = (temp - prev_temp) / dt_min
        dCO_dt = (co - prev_co) / dt_min
        dH_dt = (hum - prev_hum) / dt_min
    else:
        dT_dt = 0.0
        dCO_dt = 0.0
        dH_dt = 0.0
        
    combustion_idx = (co * max(0.0, dT_dt) * max(0.1, dCO_dt + 1.0)) / (hum + 1.0)
    
    features = np.array([
        temp, hum, co, smoke, dT_dt, dCO_dt, dH_dt, combustion_idx
    ], dtype=np.float64).reshape(1, -1)
    
    return features

def heuristic_rule_check(temp: float, hum: float, co: float, dT_dt: float, dCO_dt: float, smoke: float) -> Tuple[int, str]:
    if (temp >= 50.0 and co >= 80.0) or (dT_dt >= 3.5 and co >= 40.0) or (co >= 150.0 and smoke >= 1500.0):
        return 2, "Critical Threshold Exceeded: Extreme temperature rise & toxic gas spike detected!"
        
    if (co >= 30.0 and dCO_dt >= 3.0) or (dT_dt >= 1.5 and hum <= 30.0) or (co >= 40.0 and hum <= 25.0) or (smoke >= 1000.0):
        return 1, "Warning: Rapid rate of carbon monoxide elevation or dry heating trend detected."
        
    if temp >= 40.0 and hum <= 18.0 and dT_dt >= 0.8:
        return 1, "Elevated Risk: Extreme temperature & low humidity weather warning."
        
    return 0, "Normal environmental parameters."

class WildfireAIRiskEngine:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.load_or_train_model()

    def load_or_train_model(self):
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
                return
            except Exception as e:
                print(f"Error loading model artifacts: {e}. Re-training model...")
        self.train_and_save_model()

    def train_and_save_model(self):
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.preprocessing import StandardScaler
        
        np.random.seed(42)
        n_samples = 4000
        
        # Scenario 1: Normal
        n_norm = int(n_samples * 0.6)
        norm_temp = np.random.normal(24.0, 5.0, n_norm)
        norm_hum = np.random.normal(60.0, 12.0, n_norm)
        norm_co = np.random.normal(4.0, 2.0, n_norm)
        norm_smoke = np.random.normal(300.0, 50.0, n_norm)
        norm_dT_dt = np.random.normal(0.0, 0.2, n_norm)
        norm_dCO_dt = np.random.normal(0.0, 0.1, n_norm)
        norm_dH_dt = np.random.normal(0.0, 0.2, n_norm)
        norm_labels = np.zeros(n_norm)
        
        # Scenario 2: Warning
        n_warn = int(n_samples * 0.25)
        warn_temp = np.random.uniform(32.0, 44.0, n_warn)
        warn_hum = np.random.uniform(15.0, 35.0, n_warn)
        warn_co = np.random.uniform(18.0, 45.0, n_warn)
        warn_smoke = np.random.uniform(500.0, 1100.0, n_warn)
        warn_dT_dt = np.random.uniform(0.8, 2.2, n_warn)
        warn_dCO_dt = np.random.uniform(1.0, 4.0, n_warn)
        warn_dH_dt = np.random.uniform(-1.5, -0.2, n_warn)
        warn_labels = np.ones(n_warn)
        
        # Scenario 3: High Risk
        n_high = n_samples - n_norm - n_warn
        high_temp = np.random.uniform(42.0, 68.0, n_high)
        high_hum = np.random.uniform(5.0, 20.0, n_high)
        high_co = np.random.uniform(45.0, 220.0, n_high)
        high_smoke = np.random.uniform(1100.0, 3000.0, n_high)
        high_dT_dt = np.random.uniform(2.5, 7.0, n_high)
        high_dCO_dt = np.random.uniform(4.5, 18.0, n_high)
        high_dH_dt = np.random.uniform(-4.0, -0.8, n_high)
        high_labels = np.full(n_high, 2)
        
        temp = np.clip(np.concatenate([norm_temp, warn_temp, high_temp]), 0.0, 80.0)
        hum = np.clip(np.concatenate([norm_hum, warn_hum, high_hum]), 1.0, 100.0)
        co = np.clip(np.concatenate([norm_co, warn_co, high_co]), 0.0, 300.0)
        smoke = np.clip(np.concatenate([norm_smoke, warn_smoke, high_smoke]), 100.0, 4000.0)
        dT_dt = np.concatenate([norm_dT_dt, warn_dT_dt, high_dT_dt])
        dCO_dt = np.concatenate([norm_dCO_dt, warn_dCO_dt, high_dCO_dt])
        dH_dt = np.concatenate([norm_dH_dt, warn_dH_dt, high_dH_dt])
        labels = np.concatenate([norm_labels, warn_labels, high_labels])
        
        combustion_idx = (co * np.maximum(0.0, dT_dt) * np.maximum(0.1, dCO_dt + 1.0)) / (hum + 1.0)
        
        X = np.column_stack([temp, hum, co, smoke, dT_dt, dCO_dt, dH_dt, combustion_idx])
        y = labels
        
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        self.model = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
        self.model.fit(X_scaled, y)
        
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)

    def predict_risk(self, telemetry: Dict[str, float], prev_telemetry: Dict[str, float] = None, dt_seconds: float = 60.0) -> Dict[str, Any]:
        features = extract_features(telemetry, prev_telemetry, dt_seconds)
        
        temp, hum, co, smoke, dT_dt, dCO_dt = features[0, 0], features[0, 1], features[0, 2], features[0, 3], features[0, 4], features[0, 5]
        wind_kmh = telemetry.get("wind_speed_kmh", 12.0)
        
        heuristic_level, heuristic_msg = heuristic_rule_check(temp, hum, co, dT_dt, dCO_dt, smoke)
        
        features_scaled = self.scaler.transform(features)
        ml_probs = self.model.predict_proba(features_scaled)[0]
        ml_level = int(np.argmax(ml_probs))
        
        final_level = max(ml_level, heuristic_level)
        label_str, color_name, color_hex = RISK_LEVELS[final_level]
        
        # Calculate Fire Weather Index & Rate of Spread
        fwi_analytics = calculate_fire_weather_index(temp, hum, wind_kmh)
        
        explanation = []
        if heuristic_level > 0:
            explanation.append(f"[Rule Trigger] {heuristic_msg}")
        if ml_level > 0:
            explanation.append(f"[ML Model] Classified as {RISK_LEVELS[ml_level][0]} with {ml_probs[ml_level]*100:.1f}% confidence.")
        if final_level == 0:
            explanation.append("All environmental parameters within normal ambient operating limits.")
            
        return {
            'risk_level': final_level,
            'risk_label': label_str,
            'color': color_hex,
            'confidence': float(ml_probs[final_level]),
            'ml_probabilities': {
                'NORMAL': float(ml_probs[0]),
                'WARNING': float(ml_probs[1]),
                'HIGH_RISK': float(ml_probs[2])
            },
            'derivatives': {
                'dT_dt': float(dT_dt),
                'dCO_dt': float(dCO_dt),
                'combustion_index': float(features[0, 7])
            },
            'fwi_analytics': fwi_analytics,
            'explanation': " ".join(explanation)
        }
