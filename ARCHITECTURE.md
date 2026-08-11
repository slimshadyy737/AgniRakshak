# 📐 AgniRakshak — Deep Technical System Architecture

## 1. High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       AGNIRAKSHAK EDGE-AI ARCHITECTURE                       │
└──────────────────────────────────────────────────────────────────────────────┘

  [ Ground IoT Sensors ]         [ NASA FIRMS Satellites ]
   (Temp, CO, Hum, Smoke)         (VIIRS SNPP & MODIS)
             │                              │
             ▼                              ▼
  ┌──────────────────────────────────────────────────┐
  │ LoRa RF Wireless Mesh Network & Telemetry Engine │
  └────────────────────────┬─────────────────────────┘
                           │
                           ▼
  ┌──────────────────────────────────────────────────┐
  │        FastAPI Python Backend Server (8000)      │
  │  • Scikit-Learn Risk Classifier (ML Model)       │
  │  • Derivative Engine (dT/dt, dCO/dt)             │
  │  • Canadian Fire Weather Index (FWI Math)        │
  │  • Google Gemma 3n LLM Briefing Generator        │
  └────────────────────────┬─────────────────────────┘
                           │ WebSockets & REST API
                           ▼
  ┌──────────────────────────────────────────────────┐
  │       React 18 Geospatial Dashboard (5173)       │
  │  • Leaflet Fast Tile Renderer (<100ms)          │
  │  • Recharts Telemetry Streams & CSV Exporter    │
  │  • Printable HTML/PDF Emergency Dispatch Sheet   │
  └──────────────────────────────────────────────────┘
```

---

## 2. Mathematical & Physics Risk Engines

### A. Derivative Physics Engine ($dT/dt$, $dCO/dt$)
Wildfire ignitions are defined by sudden exponential spikes in temperature and toxic gases rather than static thresholds alone:
$$\frac{dT}{dt} = \frac{T_t - T_{t-\Delta t}}{\Delta t} \quad \left[\text{°C/min}\right]$$
$$\frac{dCO}{dt} = \frac{CO_t - CO_{t-\Delta t}}{\Delta t} \quad \left[\text{ppm/min}\right]$$

### B. Vapor Pressure Deficit ($VPD$) Formula
Vapor Pressure Deficit measures atmospheric drying force in forest canopies:
$$SVP = 0.61078 \times \exp\left(\frac{17.27 \times T}{T + 237.3}\right) \quad \left[\text{kPa}\right]$$
$$AVP = SVP \times \left(\frac{H}{100}\right) \quad \left[\text{kPa}\right]$$
$$VPD = SVP - AVP \quad \left[\text{kPa}\right]$$

### C. Canadian Fire Weather Index ($FWI$) & Rate of Spread ($ROS$)
- **Initial Spread Index ($ISI$)**:
  $$ISI = 0.208 \times \exp(0.05039 \times V_{\text{wind}}) \times \left(1 + \frac{VPD}{2.5}\right)$$
- **Rate of Spread ($ROS$)**:
  $$ROS = 0.15 \times ISI \times \exp\left(0.04 \times T\right) \quad \left[\text{m/min}\right]$$

---

## 3. Edge-AI Classification Model

AgniRakshak uses a trained **Scikit-Learn Multi-Output Ensemble Classifier** combining:
1. **Random Forest Classifier**: Evaluates multi-variate non-linear sensor relationships.
2. **Derivative Threshold Heuristics**: Overrides static baselines when rapid rate-of-change spikes ($\frac{dT}{dt} > 0.5$, $\frac{dCO}{dt} > 0.8$) are detected.

---

## 4. Google Gemma 3n LLM Intelligence Pipeline

The Gemma 3n engine receives combined ground telemetry, derivative trends, and NASA FIRMS satellite data to produce a 5-section executive briefing:
1. **Executive Threat Level & Confidence Score**
2. **Multi-Sensor Telemetry & Derivative Breakdown**
3. **NASA FIRMS Thermal Satellite Correlation**
4. **Tactical Action Plan for Firefighters & Incident Commanders**
5. **Operational Evacuation & Safety Warnings**

---

## 5. Network Optimization & Low-Latency Rendering
- **Decoupled API Fetching**: Satellite FIRMS queries are cached and decoupled from 2-second telemetry polling to ensure <100ms Leaflet map rendering.
- **CartoDB Subdomain Mirroring**: Uses subdomain arrays (`a, b, c, d`) for parallel HTTP/2 tile fetching.
