# 🏆 AgniRakshak — 2-Minute Hackathon Judge Evaluation Guide

> **Theme:** Open Innovation  
> **Team Name:** Hell Fire Club  
> **Project:** AgniRakshak Environmental AI Network  

Welcome Judges! This quick evaluation guide will walk you through testing all core innovations of **AgniRakshak** in under 2 minutes.

---

## ⚡ 1-Click Launch Instructions

Simply double-click **`run_agnirakshak.bat`** in the repository root directory!
- The script automatically checks prerequisites, installs Python (`requirements.txt`) and Node.js (`npm install`) dependencies if missing, boots the FastAPI backend and React frontend, and opens `http://localhost:5173` in your default browser automatically.

---

## 🎯 2-Minute Interactive Demo Walkthrough

### 1. 🌐 Switch Global Wildfire Monitoring Regions (0:00 - 0:30)
- Look at the top right header **Region Dropdown** (or keyboard shortcut `1-4` for tabs).
- Select **🇮🇳 Jaipur Ridge**, **🇺🇸 Sierra Nevada**, **🇧🇷 Amazon Rainforest**, **🇦🇺 NSW Bushlands**, or **🇬🇷 Attica Pine Forest**.
- **Observe**: The Leaflet map smoothly animates to the selected country, relocates the IoT ground sensor mesh, and fetches live satellite radiometry around those coordinates!

### 2. 📍 Click-to-Deploy & Decommission IoT Sensor Nodes (0:30 - 0:50)
- Click anywhere on the forest map.
- A green **"Deploy at [Lat, Lon]"** button will pop up in the header.
- Click it, enter a Sector Name (e.g. `Sector Alpha`), and watch the node dynamically register into the LoRa RF wireless mesh lines in real-time!
- Need to decommission a node? Click **"Decommission"** in the `Active Node Metadata` card.

### 3. 🎛️ Interactive Manual Telemetry Injector & Wind Vector Simulator (0:50 - 1:10)
- Navigate to the **Sensor Network** tab (`Key 2`).
- Drag the **Temperature Slider** above `50°C` or the **CO Level Slider** above `80 ppm`.
- Click **"⚡ Inject Override Telemetry"**.
- **Observe**: The AI engine immediately flags a **CRITICAL HIGH RISK EMERGENCY**, triggers the Web Audio Emergency Siren synthesizer, and updates the risk badges across the network!

### 4. 📄 Executive Printable Emergency Dispatch Sheet & CSV Export (1:10 - 1:30)
- In the top header navigation, click **"Dispatch"**.
- A new browser tab will open displaying `/api/incidents/export-html`.
- Click **"Export CSV"** in the header to download the raw telemetry time-series dataset (`/api/telemetry/export-csv`).

### 5. 🤖 Google Gemma 3n AI Crisis Intelligence Briefing (1:30 - 2:00)
- Click **"AI Report"** (or press `R`) in the top header.
- Explore the 4 interactive tabs (*Executive Briefing*, *Telemetry Audit*, *Tactical Action Plan*, *Raw JSON Log*).
- Click **"Copy"** or **"Print / PDF"**.

---

## 📊 Evaluation Criteria Scoring Alignment

| Criteria | How AgniRakshak Excels |
| :--- | :--- |
| **Technical Innovation** | Combines physical derivative math ($dT/dt$, $dCO/dt$), Canadian FWI formulas ($VPD$, $ROS$), and Scikit-Learn ML classifiers with Google Gemma 3n LLM intelligence. |
| **UI/UX Design** | Clean, state-of-the-art light-mode interface, instant Leaflet map rendering (<100ms), 10/10 animated boot screen, web audio siren, and responsive analytics charts. |
| **Completeness & Rigor** | 1-click automated setup script, zero dummy placeholders, live WebSockets streaming, multi-channel alert dispatcher (`/api/alerts/broadcast`), and CSV data exporter (`/api/telemetry/export-csv`). |
| **Practical Impact** | Fills the latency gap of traditional satellite-only wildfire systems by pairing ground IoT mesh sensors with NASA FIRMS satellite correlation. |

---

Thank you for reviewing **AgniRakshak**! 🔥
