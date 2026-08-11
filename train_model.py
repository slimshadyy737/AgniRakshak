"""
Standalone Model Training Script for AgniRakshak AI Risk Engine
"""

from ai_engine import WildfireAIRiskEngine

if __name__ == "__main__":
    print("Initializing AgniRakshak AI Risk Engine and training ML model...")
    engine = WildfireAIRiskEngine()
    print("Model training complete.")
    
    # Test sample inference
    sample_normal = {'temperature': 24.0, 'humidity': 55.0, 'co_ppm': 3.5, 'smoke_raw': 290.0}
    sample_fire = {'temperature': 52.0, 'humidity': 12.0, 'co_ppm': 95.0, 'smoke_raw': 1800.0}
    
    res_norm = engine.predict_risk(sample_normal)
    print("\nNormal Sample Prediction:", res_norm['risk_label'], "| Confidence:", f"{res_norm['confidence']*100:.1f}%")
    
    res_fire = engine.predict_risk(sample_fire)
    print("Fire Sample Prediction:", res_fire['risk_label'], "| Confidence:", f"{res_fire['confidence']*100:.1f}%")
