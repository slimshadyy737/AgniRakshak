# 🛡️ AgniRakshak — Next-Generation Environmental AI & Wildfire Response Network

![Theme](https://img.shields.io/badge/Theme-Open%20Innovation-orange?style=for-the-badge)
![Team](https://img.shields.io/badge/Team-Hell%20Fire%20Club-red?style=for-the-badge)
![AI Engine](https://img.shields.io/badge/AI-Google%20Gemma%203n-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> **AgniRakshak** is an enterprise-grade, distributed Edge-AI and NASA FIRMS satellite-powered wildfire detection & emergency crisis response platform.

---

## ⚡ Quick 1-Click Launch (For Judges & Reviewers)

To boot the entire application (Backend + Frontend + Browser) in **1 click**:
```cmd
# Simply double click or execute in command prompt:
run_agnirakshak.bat
```
> The script automatically checks prerequisites (Python & Node.js), installs missing packages, starts the Python FastAPI server (`port 8000`), starts the Vite React frontend (`port 5173`), and opens `http://localhost:5173` automatically in your browser!

👉 **[Click Here to View 2-Minute Judge Evaluation Guide](./HACKATHON_JUDGE_GUIDE.md)**

---

## 🔥 Key Features

- **🌐 Global Wildfire Region Switcher**: Instant location presets for **Jaipur Forest (India)**, **Sierra Nevada (USA)**, **Amazon Basin (Brazil)**, **NSW Bushlands (Australia)**, and **Attica Forest (Greece)**.
- **📡 Click-to-Deploy IoT Mesh Nodes**: Click anywhere on the Leaflet map to deploy new sensor outposts at exact GPS coordinates in real-time.
- **🗑️ Node Decommissioning**: Remove old or damaged IoT outposts directly from the active node panel.
- **⚡ High-Performance Geospatial Map**: Instant tile loading (<100ms) with CartoDB Voyager raster mirrors and satellite overlays.
- **🛰️ NASA FIRMS Thermal Satellite Correlation**: Live VIIRS SNPP & MODIS satellite active fire radiometry integration.
- **🔥 Fire Weather Index (FWI) & Rate of Spread Math**: Real-time Vapor Pressure Deficit ($VPD$), Initial Spread Index ($ISI$), and Rate of Spread ($ROS$ in m/min).
- **🤖 Gemma 3n 5-Section Crisis Briefings**: Multi-tab executive intelligence reports with bold formatting, telemetry audit grids, numbered tactical action plans, and printable emergency dispatch sheets.
- **📢 Emergency Alert Broadcast System (`POST /api/alerts/broadcast`)**: Simulated multi-channel emergency alert dispatch (SMS, Telegram, LoRa Radio Mesh).
- **🌬️ Dynamic Wind Vector Simulator (`POST /api/nodes/wind-vector`)**: Live wind speed & direction vector tuning with instant FWI Rate of Spread recalculation.
- **📊 Mesh Health & Analytics Summary (`GET /api/analytics/summary`)**: Real-time aggregate health score, average temperature, CO ppm, battery level, and RSSI quality.
- **🖨️ High-Contrast Emergency Dispatch Sheet (`/api/incidents/export-html`)**: Executive printable HTML/PDF dispatch sheet with officer signature blocks.
- **📊 Raw Telemetry CSV Data Exporter (`/api/telemetry/export-csv`)**: 1-click download of raw sensor time-series dataset for data scientists.
- **🔊 Web Audio API Emergency Siren**: Real-time auditory emergency synthesizer triggering during critical risk detections.
- **✨ 10/10 Animated Boot Screen**: State-of-the-art loading overlay featuring dual orbital rings, real-time percentage progress bar, and sequential hardware boot logs.

---

## 📐 Architecture Blueprint

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
  │  • Emergency Broadcast & Analytics Engine        │
  └────────────────────────┬─────────────────────────┘
                           │ WebSockets & REST API
                           ▼
  ┌──────────────────────────────────────────────────┐
  │       React 18 Geospatial Dashboard (5173)       │
  │  • Leaflet Fast Tile Renderer (<100ms)          │
  │  • Recharts Telemetry Streams & CSV Exporter    │
  │  • Multi-Tab Gemma 3n Briefing & Dispatch Sheet  │
  └──────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite 5, Recharts, Lucide Icons |
| **Geospatial & Maps** | Leaflet 1.9, React-Leaflet, CartoDB Maps |
| **Backend API Server** | Python 3.11, FastAPI, Uvicorn, WebSockets |
| **AI & Physics Engines** | Scikit-Learn, Google Gemma 3n, NumPy, SciPy |
| **Satellite Data** | NASA FIRMS (VIIRS SNPP & MODIS Radiometry) |
| **Design System** | Clean Light Mode UI Tokens, Glassmorphism, Responsive CSS Grid |

---

## 📡 REST API Documentation

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/system/status` | GET | System risk level, active node count, peak metrics |
| `GET /api/nodes` | GET | List of all active ground IoT sensor nodes |
| `POST /api/nodes/deploy` | POST | Deploy new IoT node at custom GPS coordinates |
| `DELETE /api/nodes/{id}` | DELETE | Remove node from active network mesh |
| `GET /api/regions` | GET | List of global wildfire region location presets |
| `POST /api/region/switch` | POST | Switch active region location & relocate nodes |
| `POST /api/alerts/broadcast` | POST | Broadcast multi-channel emergency alert (SMS/Telegram) |
| `GET /api/analytics/summary` | GET | Retrieve aggregate mesh health score & average telemetry stats |
| `POST /api/nodes/wind-vector` | POST | Update wind speed & direction vector across mesh nodes |
| `GET /api/telemetry/export-csv` | GET | Download raw sensor time-series dataset in CSV |
| `GET /api/incidents/export-html` | GET | Executive printable HTML/PDF emergency dispatch sheet |
| `POST /api/nodes/inject-telemetry` | POST | Manual telemetry injection for testing model reactions |
| `POST /api/nodes/clear-override` | POST | Reset node back to automated telemetry stream |
| `POST /api/simulation/scenario` | POST | Inject scenario (`NORMAL`, `HOT_DRY`, `SMOLDERING`, `ACTIVE_FIRE`) |
| `POST /api/simulation/step` | POST | Manually step simulation tick counter |

---

## 📜 Documentation Files

- **[HACKATHON_JUDGE_GUIDE.md](./HACKATHON_JUDGE_GUIDE.md)**: 2-minute evaluation guide for hackathon judges.
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Deep technical architecture & physics math documentation.
- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Open-source contribution guidelines.
- **[LICENSE](./LICENSE)**: MIT License.

---

## 👥 Team & License
Developed for Open Innovation Hackathon by **Team Hell Fire Club**. Licensed under the [MIT License](./LICENSE).
