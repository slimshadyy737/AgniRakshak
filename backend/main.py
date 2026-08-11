"""
AgniRakshak Python FastAPI Backend Server
Integrated with Global Wildfire Region Switcher, Dynamic Node Deployment, CSV Telemetry Export, WebSockets, NASA FIRMS, and High-Quality HTML Dispatch Sheets.
"""

import os
import sys
import time
import asyncio
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, HTMLResponse
from pydantic import BaseModel

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from ai_engine import WildfireAIRiskEngine, RISK_LEVELS
from simulator import TelemetrySimulator, NODES as DEFAULT_NODES, REGIONS
from backend.nasa_firms import NASAFirmsClient
from backend.ai_report import GemmaWildfireReportEngine

app = FastAPI(
    title="AgniRakshak API",
    description="Distributed Edge-AI & NASA FIRMS Satellite Wildfire Detection Backend",
    version="4.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_engine = WildfireAIRiskEngine()
simulator = TelemetrySimulator()
firms_client = NASAFirmsClient()
gemma_engine = GemmaWildfireReportEngine(offline_mode=False)

active_nodes = list(DEFAULT_NODES)

state = {
    "current_scenario": "NORMAL",
    "simulation_step": 0,
    "active_region": "JAIPUR",
    "node_history": {node["id"]: [] for node in active_nodes},
    "manual_overrides": {}
}

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# Pydantic Schemas
class RegionSwitchPayload(BaseModel):
    region_id: str

class DeployNodePayload(BaseModel):
    name: str
    latitude: float
    longitude: float
    altitude: Optional[float] = 380.0

class InjectTelemetryPayload(BaseModel):
    node_id: str
    temperature: float
    humidity: float
    co_ppm: float
    smoke_raw: float
    wind_speed_kmh: Optional[float] = 15.0

class ScenarioRequest(BaseModel):
    scenario: str

class FireAnalysisRequest(BaseModel):
    latitude: float
    longitude: float
    node_id: Optional[str] = "NODE-01"

def process_node_data(node_id: str, scenario: str, step: int):
    node_info = next((n for n in active_nodes if n["id"] == node_id), None)
    if not node_info:
        node_info = {"id": node_id, "name": f"Sensor {node_id}", "lat": 26.8430, "lon": 75.5655, "altitude": 380}
        
    if node_id in state["manual_overrides"]:
        telemetry = state["manual_overrides"][node_id]
    else:
        telemetry = simulator.generate_node_telemetry(node_id, scenario=scenario, step=step)
        
    prev_telemetry = state["node_history"].get(node_id, [])[-1] if state["node_history"].get(node_id) else None
    prediction = ai_engine.predict_risk(telemetry, prev_telemetry, dt_seconds=60.0)
    
    combined = {
        **telemetry,
        "derivatives": prediction["derivatives"],
        "fwi_analytics": prediction["fwi_analytics"],
        "risk_level": prediction["risk_level"],
        "risk_label": prediction["risk_label"],
        "color": prediction["color"],
        "confidence": prediction["confidence"],
        "ml_probabilities": prediction["ml_probabilities"],
        "explanation": prediction["explanation"]
    }
    
    if node_id not in state["node_history"]:
        state["node_history"][node_id] = []
        
    state["node_history"][node_id].append(combined)
    if len(state["node_history"][node_id]) > 40:
        state["node_history"][node_id].pop(0)
        
    return combined

@app.get("/")
def read_root():
    return {
        "status": "online",
        "project": "AgniRakshak",
        "track": "Open Innovation",
        "team": "Hell Fire Club",
        "version": "4.0.0",
        "active_region": state["active_region"],
        "active_nodes_count": len(active_nodes)
    }

@app.get("/api/regions")
def get_regions():
    """Returns list of global wildfire monitoring regions."""
    return {"active_region": state["active_region"], "regions": list(REGIONS.values())}

@app.post("/api/region/switch")
def switch_region(payload: RegionSwitchPayload):
    """Switches active wildfire region and relocates node network."""
    region_id = payload.region_id
    if region_id not in REGIONS:
        raise HTTPException(status_code=400, detail=f"Invalid region. Must be one of {list(REGIONS.keys())}")
        
    state["active_region"] = region_id
    simulator.set_region(region_id)
    state["simulation_step"] += 1
    state["manual_overrides"].clear()
    
    # Process updated node telemetry for new region
    for node in active_nodes:
        process_node_data(node["id"], state["current_scenario"], state["simulation_step"])
        
    return {"status": "switched", "active_region": REGIONS[region_id]}

@app.get("/api/system/status")
def get_system_status():
    state["simulation_step"] += 1
    nodes_summary = []
    max_risk = 0
    max_temp = 0.0
    max_co = 0.0
    max_dT_dt = 0.0
    
    for node in active_nodes:
        node_data = process_node_data(node["id"], state["current_scenario"], state["simulation_step"])
        nodes_summary.append(node_data)
        
        if node_data["risk_level"] > max_risk:
            max_risk = node_data["risk_level"]
        if node_data["temperature"] > max_temp:
            max_temp = node_data["temperature"]
        if node_data["co_ppm"] > max_co:
            max_co = node_data["co_ppm"]
        if node_data["derivatives"]["dT_dt"] > max_dT_dt:
            max_dT_dt = node_data["derivatives"]["dT_dt"]
            
    risk_label, color_name, color_hex = RISK_LEVELS[max_risk]
    
    return {
        "system_risk_level": max_risk,
        "system_risk_label": risk_label,
        "system_color": color_hex,
        "active_nodes_count": len(active_nodes),
        "peak_temperature": max_temp,
        "peak_co_ppm": max_co,
        "peak_dT_dt": max_dT_dt,
        "current_scenario": state["current_scenario"],
        "active_region": REGIONS[state["active_region"]],
        "simulation_step": state["simulation_step"],
        "timestamp": time.strftime("%H:%M:%S")
    }

@app.get("/api/nodes")
def get_nodes():
    result = []
    for node in active_nodes:
        latest = state["node_history"].get(node["id"], [])[-1] if state["node_history"].get(node["id"]) else process_node_data(node["id"], state["current_scenario"], state["simulation_step"])
        result.append(latest)
    return result

@app.post("/api/nodes/deploy")
def deploy_node(payload: DeployNodePayload):
    node_idx = len(active_nodes) + 1
    new_id = f"NODE-0{node_idx}" if node_idx < 10 else f"NODE-{node_idx}"
    
    new_node = {
        "id": new_id,
        "name": payload.name or f"Sector Outpost {node_idx}",
        "offset_lat": payload.latitude - REGIONS[state["active_region"]]["lat"],
        "offset_lon": payload.longitude - REGIONS[state["active_region"]]["lon"],
        "altitude": payload.altitude or 380
    }
    
    active_nodes.append(new_node)
    state["node_history"][new_id] = []
    processed = process_node_data(new_id, state["current_scenario"], state["simulation_step"])
    return {"status": "deployed", "node": new_node, "data": processed}

@app.delete("/api/nodes/{node_id}")
def delete_node(node_id: str):
    global active_nodes
    active_nodes = [n for n in active_nodes if n["id"] != node_id]
    if node_id in state["node_history"]:
        del state["node_history"][node_id]
    return {"status": "deleted", "node_id": node_id}

@app.get("/api/nodes/{node_id}/history")
def get_node_history(node_id: str):
    if node_id not in state["node_history"]:
        raise HTTPException(status_code=404, detail="Node ID not found")
    return state["node_history"][node_id]

@app.get("/api/telemetry/export-csv")
def export_telemetry_csv(node_id: Optional[str] = None):
    csv_content = "timestamp,node_id,node_name,latitude,longitude,temperature,humidity,co_ppm,smoke_raw,wind_speed_kmh,risk_level,risk_label,confidence,dT_dt,dCO_dt\n"
    nodes_to_export = [node_id] if node_id and node_id in state["node_history"] else list(state["node_history"].keys())
    
    for nid in nodes_to_export:
        for entry in state["node_history"].get(nid, []):
            csv_content += f"{entry.get('timestamp')},{entry.get('node_id')},{entry.get('node_name')},{entry.get('latitude')},{entry.get('longitude')},{entry.get('temperature')},{entry.get('humidity')},{entry.get('co_ppm')},{entry.get('smoke_raw')},{entry.get('wind_speed_kmh', 15.0)},{entry.get('risk_level')},{entry.get('risk_label')},{entry.get('confidence')},{entry.get('derivatives', {}).get('dT_dt', 0.0)},{entry.get('derivatives', {}).get('dCO_dt', 0.0)}\n"
            
    return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=agnirakshak_telemetry_export.csv"})

@app.post("/api/nodes/inject-telemetry")
def inject_telemetry(payload: InjectTelemetryPayload):
    node_id = payload.node_id
    node_info = next((n for n in active_nodes if n["id"] == node_id), active_nodes[0])
    
    telemetry = {
        "node_id": node_id,
        "node_name": node_info.get("name", "Outpost"),
        "latitude": REGIONS[state["active_region"]]["lat"] + node_info.get("offset_lat", 0),
        "longitude": REGIONS[state["active_region"]]["lon"] + node_info.get("offset_lon", 0),
        "altitude": node_info.get("altitude", 380),
        "temperature": payload.temperature,
        "humidity": payload.humidity,
        "co_ppm": payload.co_ppm,
        "smoke_raw": payload.smoke_raw,
        "wind_speed_kmh": payload.wind_speed_kmh or 15.0,
        "wind_direction_deg": 180,
        "battery_level": 92.0,
        "rssi_dbm": -60,
        "timestamp": time.strftime("%H:%M:%S")
    }
    
    state["manual_overrides"][node_id] = telemetry
    processed = process_node_data(node_id, state["current_scenario"], state["simulation_step"])
    return {"status": "injected", "node_data": processed}

@app.post("/api/nodes/clear-override")
def clear_override(node_id: str = "NODE-01"):
    if node_id in state["manual_overrides"]:
        del state["manual_overrides"][node_id]
    return {"status": "cleared", "node_id": node_id}

@app.get("/api/incidents/export-html", response_class=HTMLResponse)
def export_incident_html():
    status = get_system_status()
    nodes = get_nodes()
    
    badge_color = status["system_color"]
    badge_label = status["system_risk_label"]
    region = REGIONS[state["active_region"]]
    
    table_rows = ""
    for n in nodes:
        table_rows += f"""
        <tr>
            <td><strong>{n['node_name']}</strong><br><span class="subtext">({n['node_id']})</span></td>
            <td><code>{n['latitude']:.4f}°, {n['longitude']:.4f}°</code></td>
            <td><span class="status-badge" style="background:{n['color']}18; color:{n['color']}; border-color:{n['color']};">{n['risk_label']}</span></td>
            <td><strong>{n['temperature']} °C</strong> <span class="subtext">({n['derivatives']['dT_dt']:+.2f})</span></td>
            <td><strong>{n['co_ppm']} ppm</strong> <span class="subtext">({n['derivatives']['dCO_dt']:+.2f})</span></td>
            <td><strong>{n['fwi_analytics']['danger_category']}</strong><br><span class="subtext">ROS: {n['fwi_analytics']['rate_of_spread_m_min']} m/min</span></td>
            <td><strong>{n['confidence']*100:.1f}%</strong></td>
        </tr>
        """

    html = f"""<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <title>AgniRakshak Emergency Incident Dispatch Sheet</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-body: #F1F5F9;
            --bg-card: #FFFFFF;
            --bg-box: #F8FAFC;
            --border-card: #E2E8F0;
            --text-heading: #0F172A;
            --text-muted: #64748B;
            --shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
        }}
        [data-theme="dark"] {{
            --bg-body: #0B1120;
            --bg-card: #1E293B;
            --bg-box: #0F172A;
            --border-card: #334155;
            --text-heading: #F8FAFC;
            --text-muted: #94A3B8;
            --shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
        }}
        body {{
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: var(--bg-body);
            color: var(--text-heading);
            margin: 0;
            padding: 40px 20px;
            transition: background 0.3s ease, color 0.3s ease;
        }}
        .dispatch-card {{
            max-width: 980px;
            margin: 0 auto;
            background: var(--bg-card);
            border-radius: 24px;
            padding: 44px;
            border: 1px solid var(--border-card);
            box-shadow: var(--shadow);
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--border-card);
            padding-bottom: 24px;
            margin-bottom: 28px;
        }}
        .brand {{
            display: flex;
            align-items: center;
            gap: 18px;
        }}
        .brand img {{
            width: 64px;
            height: 64px;
            border-radius: 16px;
            box-shadow: 0 4px 18px rgba(249, 115, 22, 0.35);
            background: #0B1120;
        }}
        .brand h1 {{
            margin: 0;
            font-family: 'Outfit', sans-serif;
            font-size: 2.2rem;
            font-weight: 800;
            color: #EA580C;
            letter-spacing: -0.5px;
        }}
        .badge {{
            background: {badge_color}20;
            color: {badge_color};
            border: 2px solid {badge_color};
            padding: 10px 24px;
            border-radius: 30px;
            font-weight: 800;
            font-size: 1.05rem;
            letter-spacing: 0.5px;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 28px;
        }}
        .metric-box {{
            background: var(--bg-box);
            padding: 20px;
            border-radius: 14px;
            border: 1px solid var(--border-card);
        }}
        .metric-box label {{
            font-size: 0.72rem;
            color: var(--text-muted);
            font-weight: 800;
            letter-spacing: 0.6px;
        }}
        .metric-box .val {{
            font-size: 1.5rem;
            font-weight: 800;
            margin-top: 6px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 28px;
            background: var(--bg-box);
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid var(--border-card);
        }}
        th, td {{
            padding: 14px 18px;
            text-align: left;
            border-bottom: 1px solid var(--border-card);
            font-size: 0.88rem;
        }}
        th {{
            background: var(--bg-card);
            color: var(--text-muted);
            font-weight: 800;
            font-size: 0.76rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .subtext {{
            color: var(--text-muted);
            font-size: 0.76rem;
        }}
        .status-badge {{
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 800;
            border: 1px solid;
            display: inline-block;
        }}
        .toolbar {{
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-bottom: 24px;
        }}
        .btn {{
            background: linear-gradient(135deg, #EA580C 0%, #C2410C 100%);
            color: white;
            border: none;
            padding: 11px 22px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 0.9rem;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
            display: flex;
            align-items: center;
            gap: 8px;
        }}
        .btn-secondary {{
            background: var(--bg-card);
            border: 1px solid var(--border-card);
            color: var(--text-heading);
            padding: 11px 18px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 0.88rem;
            cursor: pointer;
        }}
        @media print {{
            body {{
                background: #FFFFFF !important;
                color: #0F172A !important;
                padding: 0 !important;
            }}
            .dispatch-card {{
                border: none !important;
                box-shadow: none !important;
                background: #FFFFFF !important;
                color: #0F172A !important;
                padding: 0 !important;
                max-width: 100% !important;
            }}
            .header {{
                border-bottom-color: #CBD5E1 !important;
            }}
            .brand h1 {{
                color: #EA580C !important;
            }}
            .metric-box {{
                background: #F8FAFC !important;
                border-color: #CBD5E1 !important;
            }}
            .metric-box label {{
                color: #475569 !important;
            }}
            table {{
                background: #FFFFFF !important;
                border: 1px solid #CBD5E1 !important;
            }}
            th {{
                background: #F1F5F9 !important;
                color: #1E293B !important;
                border-bottom-color: #CBD5E1 !important;
            }}
            td {{
                border-bottom-color: #E2E8F0 !important;
                color: #0F172A !important;
            }}
            .toolbar {{
                display: none !important;
            }}
        }}
    </style>
</head>
<body>
    <div class="dispatch-card">
        <div class="toolbar">
            <button class="btn-secondary" onclick="toggleTheme()">🌗 Toggle Light / Dark View</button>
            <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>
        
        <div class="header">
            <div class="brand">
                <img src="/AgniRakshak.png" alt="AgniRakshak Logo">
                <div>
                    <h1>AgniRakshak Emergency Dispatch</h1>
                    <p style="margin:4px 0 0 0; color:var(--text-muted); font-size:0.88rem; font-weight:500;">
                        {region['flag']} {region['name']} ({region['lat']}°, {region['lon']}°)
                    </p>
                </div>
            </div>
            <div class="badge">{badge_label}</div>
        </div>

        <div class="grid">
            <div class="metric-box">
                <label>DISPATCH TIMESTAMP</label>
                <div class="val" style="color:#0EA5E9;">{time.strftime("%H:%M:%S IST")}</div>
            </div>
            <div class="metric-box">
                <label>ACTIVE MESH NODES</label>
                <div class="val" style="color:#10B981;">{status['active_nodes_count']} Nodes</div>
            </div>
            <div class="metric-box">
                <label>PEAK TEMPERATURE</label>
                <div class="val" style="color:#EA580C;">{status['peak_temperature']} °C</div>
            </div>
            <div class="metric-box">
                <label>PEAK CO LEVEL</label>
                <div class="val" style="color:#EF4444;">{status['peak_co_ppm']} ppm</div>
            </div>
        </div>

        <h3 style="color:#EA580C; margin-bottom:14px; font-size:1.15rem; font-weight:800;">📡 Edge Mesh Sensor Telemetry Audit</h3>
        <table>
            <thead>
                <tr>
                    <th>Node Name</th>
                    <th>Coordinates</th>
                    <th>Risk Status</th>
                    <th>Temperature</th>
                    <th>CO Level</th>
                    <th>Fire Weather Index</th>
                    <th>AI Confidence</th>
                </tr>
            </thead>
            <tbody>
                {table_rows}
            </tbody>
        </table>

        <div style="border-top: 2px dashed var(--border-card); padding-top: 24px; margin-top: 36px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong style="font-size:0.92rem;">Incident Command Officer Signature:</strong> <span style="display:inline-block; border-bottom:1.5px solid var(--text-muted); width:220px; vertical-align:bottom;"></span>
            </div>
            <div style="color:var(--text-muted); font-size:0.82rem; font-weight:500;">
                AgniRakshak Powered by Google Gemma 3n & NASA FIRMS Satellite Radiometry
            </div>
        </div>
    </div>

    <script>
        function toggleTheme() {{
            const html = document.documentElement;
            const current = html.getAttribute('data-theme');
            html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
        }}
    </script>
</body>
</html>"""
    return HTMLResponse(content=html)

@app.get("/api/firms/active-fires")
def get_firms_active_fires(lat: float = 26.8430, lon: float = 75.5655):
    fires = firms_client.get_active_fires(lat, lon)
    return {"status": "success", "satellites": ["VIIRS_NPP", "MODIS_TERRA"], "active_fires": fires}

@app.post("/api/analyze-fire-map")
async def analyze_fire_map(req: FireAnalysisRequest):
    try:
        node_id = req.node_id or "NODE-01"
        node_data = state["node_history"].get(node_id, [])[-1] if state["node_history"].get(node_id) else None
        
        if not node_data:
            node_data = process_node_data(node_id, state["current_scenario"], state["simulation_step"])
            
        sat_fires = firms_client.get_active_fires(req.latitude, req.longitude)
        prompt = f"Analyze wildfire threat at {req.latitude}, {req.longitude} with temperature {node_data['temperature']}C and CO {node_data['co_ppm']} ppm."
        analysis_result = await gemma_engine.generate_analysis(prompt, node_data, sat_fires)
        
        return {
            "status": "success",
            "analysis": analysis_result.get("analysis", ""),
            "source": analysis_result.get("source", "offline_cache"),
            "location": {"latitude": req.latitude, "longitude": req.longitude},
            "timestamp": time.strftime("%H:%M:%S")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulation/scenario")
def set_scenario(req: ScenarioRequest):
    valid_scenarios = ["NORMAL", "HOT_DRY", "SMOLDERING", "ACTIVE_FIRE"]
    if req.scenario not in valid_scenarios:
        raise HTTPException(status_code=400, detail=f"Invalid scenario. Must be one of {valid_scenarios}")
    
    state["current_scenario"] = req.scenario
    state["simulation_step"] += 1
    state["manual_overrides"].clear()
    
    for node in active_nodes:
        process_node_data(node["id"], state["current_scenario"], state["simulation_step"])
        
    return {"status": "updated", "current_scenario": state["current_scenario"]}

@app.post("/api/simulation/step")
def step_simulation():
    state["simulation_step"] += 1
    for node in active_nodes:
        process_node_data(node["id"], state["current_scenario"], state["simulation_step"])
    return {"status": "stepped", "step": state["simulation_step"]}

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(1.5)
            status = get_system_status()
            nodes = get_nodes()
            await websocket.send_json({
                "type": "telemetry_update",
                "status": status,
                "nodes": nodes
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)

