# **AgniRakshak (अग्निरक्षक) — Official 9-Slide Presentation Deck**
### **International Innovation Challenge 3.0 (IIC 3.0)**
**Host:** Manipal University Jaipur (MUJ), Dahmi Kalan, Rajasthan  
**Track:** Open Innovation  
**Team Name:** Hell Fire Club  
**Project Title:** AgniRakshak: Distributed Edge-AI & Multi-Sensor Wildfire Early Detection Network  

---

## **Slide 1 — IDEA TITLE & TEAM DETAILS**

- **Theme / Track:** `Open Innovation`
- **Idea Title:** `AgniRakshak`
- **Tagline:** *Detect Early. Alert Faster. Prevent Wildfires.*
- **Team Name:** `Hell Fire Club`
- **Team Members:** `[Member 1] | [Member 2] | [Member 3] | [Member 4]`
- **Institution:** `Manipal University Jaipur / Partner Institutions`

> **Core Value Proposition:** An autonomous, low-cost solar-powered IoT sensor network combined with edge-based temporal derivative AI feature fusion ($dT/dt, dCO/dt$) for early-stage wildfire ignition detection before visible flames or satellite imagery can detect smoke.

---

## **Slide 2 — PROBLEM STATEMENT**

### **The Challenge:**
1. **Critical Detection Latency:** Current wildfire detection relies heavily on satellite imaging, thermal cameras, and human lookouts. Satellites can take 1–3 hours to pass over, by which time a small smoldering fire expands into an uncontrollable mega-fire.
2. **Environmental & Economic Destruction:** Wildfires burn millions of hectares annually, destroying biodiversity, releasing megatons of $CO_2$, destroying forest infrastructure, and risking human lives.
3. **Remote Monitoring Blindspots:** Deep forest zones lack power grid infrastructure and continuous human surveillance.
4. **Failure of Single-Parameter Alarms:** Conventional temperature alarms trigger false positives from hot weather, while simple smoke detectors fail in outdoor wind currents.

---

## **Slide 3 — PROPOSED SOLUTION**

### **AgniRakshak Multi-Sensor Edge-AI Network:**
- **Distributed Micro-Climate Sensing Nodes:** Deployed across high-risk forest zones to continuously sample ambient Carbon Monoxide ($CO$), Smoke/Air Quality, Temperature, and Relative Humidity.
- **Physics-Informed Sensor Fusion:** Replaces single-threshold alarms with multi-parameter temporal trend analysis ($dT/dt$, $dCO/dt$, $dH/dt$).
- **Scikit-Learn Machine Learning Risk Engine:** Classifies conditions into **NORMAL**, **WARNING**, or **HIGH RISK** with confidence scores.
- **Instant Geolocation Telemetry:** Transmits GPS-tagged coordinates over long-range LoRa / Wi-Fi mesh to dispatch emergency responders within 60 seconds of anomaly detection.

---

## **Slide 4 — INNOVATION & UNIQUENESS**

| Conventional Wildfire Systems | AgniRakshak Innovative System |
| :--- | :--- |
| **Single Threshold Alarms** (e.g., $Temp > 50^\circ C$) | **Temporal Derivative Fusion Engine** ($dT/dt + dCO/dt + \text{Humidity Slope}$) |
| **High Latency** (Satellite 1–3 hr pass delay) | **Sub-Minute Latency** (Real-time telemetry & local alert buzzer) |
| **High Power & Expensive** ($500+ per node) | **Ultra-Low Cost & Off-Grid Solar** (< $35 Bill of Materials) |
| **High False Alarm Rate** (Sunlight/Heat trigger) | **Bivariate Temperature/Humidity Sensor Compensation** $K(T,H)$ |

---

## **Slide 5 — TECHNICAL APPROACH & SYSTEM ARCHITECTURE**

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ SENSING LAYER   │ ────> │ COMPUTE LAYER   │ ────> │ CLOUD & DISPLAY │
│                 │       │                 │       │                 │
│ • Bosch BME280  │       │ • ESP32 MCU     │       │ • Streamlit     │
│   (Temp/Hum)    │       │   (FreeRTOS)    │       │   Web Dashboard │
│ • MQ-7 (CO)     │       │ • Temporal      │       │ • Scikit-Learn  │
│   5V/1.4V Cycle │       │   Derivatives   │       │   Random Forest │
│ • MQ-2 (Smoke)  │       │ • Local OLED    │       │ • Folium Map    │
│ • NEO-6M GPS    │       │   & Buzzer      │       │ • SMS/API Alert │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

- **Sensors:** BME280 (I2C), MQ-7 (ADC1), MQ-2 (ADC1), u-blox GPS (UART2).
- **Firmware:** ESP32 C++ with FreeRTOS dual-core task execution and dynamic SnO2 ceramic heater signal compensation polynomial.
- **AI Backend:** Hybrid engine using Random Forest Classifier + Scikit-Learn + deterministic safety rule engine.

---

## **Slide 6 — PROTOTYPE & WORKING DEMONSTRATION**

### **Working Deliverables:**
1. **Interactive Web Dashboard:** Real-time multi-node monitoring interface built with Streamlit & Plotly featuring dynamic risk gauges and geospatial node maps.
2. **Live Scenario Simulator:** Demonstrates 4 simulated real-world conditions: *Normal Ambient*, *Hot & Dry Weather*, *Smoldering Fire*, and *Active Wildfire*.
3. **ESP32 Hardware Firmware:** C++/Arduino code implementing FreeRTOS dual-core execution, OLED diagnostic readout, active buzzer sounder, and Wi-Fi JSON payload POSTing.
4. **Trained ML Model Artifacts:** Scikit-Learn `RandomForestClassifier` persisted with `joblib`.

---

## **Slide 7 — FEASIBILITY, POWER & COST VIABILITY**

### **Bill of Materials (BOM) — < $35 Total Node Cost:**
- **ESP32 Microcontroller:** $4.50
- **Bosch BME280 Sensor:** $3.20
- **MQ-7 CO & MQ-2 Smoke Modules:** $4.80
- **NEO-6M GPS & SSD1306 OLED:** $6.50
- **Solar MPPT Charge Controller + LiFePO4 Battery (6000mAh):** $12.00
- **Weatherproof Louvered IP65 Enclosure:** $4.00

### **Off-Grid Solar Power Strategy:**
- 5-minute periodic duty cycling reduces average node power consumption to **12.63 mA** at 3.3V (0.041 W).
- 6000 mAh battery ensures **> 19 days of continuous operation** even in complete darkness without solar replenishment.

---

## **Slide 8 — ECOLOGICAL & ECONOMIC IMPACT**

- **Forest & Biodiversity Preservation:** Enables early intervention to contain smoldering fires before mega-burn thresholds.
- **Carbon Reduction:** Prevents millions of tons of unmitigated forest $CO_2$ emissions.
- **Economic Loss Prevention:** Protects timber reserves, agricultural lands, and nearby rural community infrastructure.
- **Scalable Deployment Roadmap:** LoRa sub-GHz RF mesh enables deployment over thousands of hectares without cellular towers.

---

## **Slide 9 — SUMMARY VISION & CONCLUSION**

> **"Detect Early. Alert Faster. Prevent Wildfires."**

```
   MONITOR           DETECT           ANALYZE           ALERT            ACT
┌───────────┐     ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│ Sensor    │ ──> │ Edge MCU  │ ─> │ ML Risk   │ ─> │ Dashboard │ ─> │ Forest    │
│ Telemetry │     │ Derivatives│   │ Classifier│    │ Broadcast │    │ Response  │
└───────────┘     └───────────┘    └───────────┘    └───────────┘    └───────────┘
```

- **AgniRakshak** delivers an end-to-end open-innovation solution bridging hardware, IoT sensor fusion, and machine learning to safeguard ecosystems worldwide.
