# **AgniRakshak — 2-Minute Demo Video Script & Judge Q&A Defense Notes**
### **International Innovation Challenge 3.0 (IIC 3.0) — Open Innovation Track**

---

## 🎬 Part 1: 2-Minute Hackathon Demo Video Script

### **Video Target Duration:** 120 Seconds (2 Minutes)
### **Screen Layout:** Split screen showing the **Streamlit Live Dashboard** + **Physical Hardware Node Diagram**.

---

### **Timestamped Narration Guide:**

| Time | On-Screen Visual | Audio Narration (Voiceover Script) |
| :--- | :--- | :--- |
| **0:00 – 0:15** | Title Slide: *AgniRakshak — Team Hell Fire Club (Open Innovation)* | *"Hello judges! Every year, devastating wildfires burn millions of forest hectares because traditional detection method—satellites and thermal cameras—suffer from multi-hour pass delays. By the time smoke is visible from space, a minor ignition has escalated into an uncontainable mega-fire."* |
| **0:15 – 0:40** | Switch to **Streamlit Dashboard (Normal Mode)** showing Folium Map with 4 green nodes. | *"Presenting **AgniRakshak**: an autonomous, solar-powered multi-sensor IoT network driven by Edge-AI for early wildfire detection. Here on our live Streamlit dashboard, you see a mesh of sensor nodes continuously monitoring ambient Temperature, Relative Humidity, Carbon Monoxide, and Smoke."* |
| **0:40 – 1:10** | Select **Smoldering Fire Scenario** in sidebar. Show $dCO/dt$ derivative spike & yellow WARNING badge. | *"Unlike conventional alarms that rely on static temperature thresholds, AgniRakshak computes temporal rate-of-change metrics ($dT/dt$ and $dCO/dt$). Notice how as smoldering combustion begins, Carbon Monoxide spikes at +4.5 ppm/min. Our hybrid Scikit-Learn Random Forest model immediately raises a **WARNING** alert before any open flame occurs."* |
| **1:10 – 1:35** | Select **Active Wildfire Scenario**. Red alert banner pulses, Folium map turns red, active alarm triggers. | *"If dry heating and toxic gas concentrations escalate into an active ignition, the system triggers a **HIGH RISK** critical alert, broadcasting GPS coordinates to emergency teams in sub-60 seconds."* |
| **1:35 – 2:00** | Slide 7/9 Architecture diagram: ESP32 + BME280 + MQ-7 heating cycle + Solar power. | *"Our physical hardware utilizes an ESP32 running FreeRTOS with dynamic temperature/humidity signal compensation and 5-minute solar duty cycling—providing over 19 days of continuous off-grid autonomy for under $35 per node. AgniRakshak: Detect Early, Alert Faster, Prevent Wildfires. Thank you!"* |

---

## 🛡️ Part 2: Technical Q&A Defense Guide for Judges

### **Q1: How do you prevent false alarms from ambient heat waves or sunlight?**
> **Answer:** "Single-parameter threshold alarms (e.g., triggering when $Temp > 45^\circ C$) fail during summer heatwaves. AgniRakshak solves this using **Multi-Sensor Temporal Derivative Fusion**. Our AI model evaluates the rate of temperature rise ($dT/dt$), rate of CO concentration increase ($dCO/dt$), and humidity drop ($dH/dt$) simultaneously. A hot afternoon increases temperature slowly without CO elevation, whereas combustion produces rapid concurrent spikes in both $dT/dt$ and $dCO/dt$."

---

### **Q2: Metal-oxide gas sensors (MQ-7) are notoriously uncalibrated and temperature-sensitive. How do you handle sensor drift?**
> **Answer:** "MQ-series ceramic sensors ($SnO_2$) shift resistance with weather. We implement two solutions:
> 1. **Bivariate Polynomial Signal Compensation**: Our ESP32 firmware dynamically evaluates $K(T, H) = \alpha_0 + \alpha_1 T + \alpha_2 H + \dots$ using live Bosch BME280 temperature and humidity data to correct raw sensor resistance $R_s$.
> 2. **Cyclical Heating Protocol**: The MQ-7 operates under a 2-stage cycle ($5.0\text{V}$ for 60s purge to clean the ceramic surface, followed by $1.4\text{V}$ for 90s low-temp CO measurement). We treat low-cost gas sensors as **relative anomaly trend indicators** rather than absolute lab instruments."

---

### **Q3: How does the node operate off-grid deep in the forest without cellular connectivity?**
> **Answer:** "The physical node uses an ultra-low power **5-minute periodic duty cycle**. Between sampling windows, the ESP32 enters deep sleep ($10\,\mu\text{A}$ draw). Average power consumption is just **12.63 mA at 3.3V** ($0.041\,\text{W}$). Powered by a 5W monocrystalline solar panel and a 6000 mAh $\text{LiFePO}_4$ battery, the node operates autonomously for over 19 days in total darkness. Communication uses long-range sub-GHz **LoRa RF mesh** (Semtech SX1278) to relay packets node-to-node back to a gateway."

---

### **Q4: Why did you choose the Open Innovation track at IIC 3.0?**
> **Answer:** "Per the official competition rules, standard domain tracks (like AgriTech or HealthTech) issue a new problem statement for the offline final round, invalidating Round 1 development. The **Open Innovation track** explicitly grants teams the right to continue developing, refining, and demonstrating their original Round 1 problem statement and physical prototype at the offline final at Manipal University Jaipur."
