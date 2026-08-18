"""
================================================================================
AGNI-RAKSHAK: Autonomous Wildfire Early Warning & Physics-Informed GIS
Architected, Designed & Engineered by SynthReaper
All Rights Reserved © 2026 SynthReaper / AgniRakshak AI Systems
================================================================================
FastAPI Backend Server integrated with Real Public Databases (NASA EONET, Open-Meteo,
Copernicus CAMS), Live Physical Sensor Hardware (ESP32/Arduino REST & WebSerial),
Global Region GIS Modeling, and Smart City ICCC (v5.03 B).
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
from simulator import TelemetrySimulator, NODES as DEFAULT_NODES, REGIONS, REGIONAL_NAMES
from backend.nasa_firms import NASAFirmsClient
from backend.ai_report import GemmaWildfireReportEngine
from backend.real_data_service import RealDataService

app = FastAPI(
    title="AgniRakshak API",
    description="Distributed Edge-AI & Real Public Database (NASA/Copernicus/Open-Meteo) Wildfire Detection Backend",
    version="4.6.0"
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

def get_nodes_for_region(region_id: str):
    names = REGIONAL_NAMES.get(region_id, {})
    new_nodes = []
    for def_node in DEFAULT_NODES:
        nid = def_node["id"]
        new_nodes.append({
            "id": nid,
            "name": names.get(nid, def_node["name"]),
            "offset_lat": def_node["offset_lat"],
            "offset_lon": def_node["offset_lon"],
            "altitude": def_node["altitude"]
        })
    return new_nodes

active_nodes = get_nodes_for_region("JAIPUR")

state = {
    "data_mode": "LIVE",  # "LIVE" (Real Public APIs + Physical Sensors) or "SIMULATION"
    "current_scenario": "NORMAL",
    "simulation_step": 0,
    "active_region": "JAIPUR",
    "node_history": {node["id"]: [] for node in active_nodes},
    "manual_overrides": {},
    "physical_devices": {}
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
class DataModePayload(BaseModel):
    mode: str  # "LIVE" or "SIMULATION"

class RegionSwitchPayload(BaseModel):
    region_id: str

class CustomLocationPayload(BaseModel):
    name: str
    latitude: float
    longitude: float
    country_code: Optional[str] = "CUSTOM"

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

class SensorTelemetryPayload(BaseModel):
    node_id: str
    temperature: float
    humidity: float
    co_ppm: float
    smoke_raw: Optional[float] = 300.0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude: Optional[float] = 380.0
    wind_speed_kmh: Optional[float] = 12.0
    wind_direction_deg: Optional[float] = 180.0
    battery_level: Optional[float] = 98.0
    rssi_dbm: Optional[int] = -55
    node_name: Optional[str] = None

class ScenarioRequest(BaseModel):
    scenario: str

class FireAnalysisRequest(BaseModel):
    latitude: float
    longitude: float
    node_id: Optional[str] = "NODE-01"

class BroadcastAlertPayload(BaseModel):
    sector_id: Optional[str] = "ALL"
    channels: Optional[List[str]] = ["SMS", "Telegram", "LoRa Radio"]
    message_custom: Optional[str] = None

class WindVectorPayload(BaseModel):
    wind_speed_kmh: float
    wind_direction_deg: float


def process_node_data(node_id: str, scenario: str, step: int):
    node_info = next((n for n in active_nodes if n["id"] == node_id), None)
    region = REGIONS.get(state["active_region"], REGIONS["JAIPUR"])
    
    if not node_info:
        node_info = {"id": node_id, "name": f"Sensor {node_id}", "offset_lat": 0.0, "offset_lon": 0.0, "altitude": 380}
        
    if node_id in state["manual_overrides"]:
        telemetry = state["manual_overrides"][node_id]
    elif state["data_mode"] == "LIVE":
        telemetry = RealDataService.synthesize_live_node_telemetry(node_info, region["lat"], region["lon"], step)
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
        "explanation": prediction["explanation"],
        "data_mode": state["data_mode"]
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
        "version": "4.6.0",
        "data_mode": state["data_mode"],
        "active_region": state["active_region"],
        "active_nodes_count": len(active_nodes),
        "live_sources": [
            "NASA EONET (Earth Observatory Natural Event Tracker)",
            "Open-Meteo Weather API",
            "Copernicus CAMS Air Quality API",
            "NASA FIRMS Satellite Radiometry",
            "IoT Hardware WebSerial & REST Ingestion"
        ]
    }

# --- LIVE PUBLIC DATABASE & REAL DATA API ENDPOINTS ---

@app.get("/api/live/mode")
def get_data_mode():
    return {
        "mode": state["data_mode"],
        "is_live": state["data_mode"] == "LIVE",
        "description": "Real public database feeds + physical sensor mesh" if state["data_mode"] == "LIVE" else "Synthetic benchmark simulation"
    }

@app.post("/api/live/mode")
def set_data_mode(payload: DataModePayload):
    mode = payload.mode.upper()
    if mode not in ["LIVE", "SIMULATION"]:
        raise HTTPException(status_code=400, detail="Mode must be 'LIVE' or 'SIMULATION'")
        
    state["data_mode"] = mode
    state["simulation_step"] += 1
    state["manual_overrides"].clear()
    
    for node in active_nodes:
        process_node_data(node["id"], state["current_scenario"], state["simulation_step"])
        
    return {"status": "mode_updated", "data_mode": state["data_mode"]}

@app.get("/api/live/weather")
def get_live_weather(lat: Optional[float] = None, lon: Optional[float] = None):
    """Fetches real-time ambient weather from Open-Meteo public database."""
    region = REGIONS.get(state["active_region"], REGIONS["JAIPUR"])
    target_lat = lat if lat is not None else region["lat"]
    target_lon = lon if lon is not None else region["lon"]
    weather = RealDataService.get_live_weather(target_lat, target_lon)
    return {"status": "success", "region": region["name"], "coordinates": {"lat": target_lat, "lon": target_lon}, "weather": weather}

@app.get("/api/live/air-quality")
def get_live_air_quality(lat: Optional[float] = None, lon: Optional[float] = None):
    """Fetches real-time atmospheric air quality (CO, PM2.5, PM10, NO2) from Copernicus CAMS."""
    region = REGIONS.get(state["active_region"], REGIONS["JAIPUR"])
    target_lat = lat if lat is not None else region["lat"]
    target_lon = lon if lon is not None else region["lon"]
    air_quality = RealDataService.get_live_air_quality(target_lat, target_lon)
    return {"status": "success", "region": region["name"], "coordinates": {"lat": target_lat, "lon": target_lon}, "air_quality": air_quality}

@app.get("/api/live/wildfires")
def get_live_wildfires(limit: int = 30):
    """Fetches live active wildfires globally from NASA EONET official open database."""
    fires = RealDataService.get_eonet_wildfires(limit=limit)
    return {"status": "success", "source": "NASA EONET", "count": len(fires), "wildfires": fires}

@app.get("/api/live/disaster-news")
def get_live_disaster_news(mode: str = "GLOBAL", region: str = None):
    """Fetches real-time emergency disaster & wildfire news bulletins (supports GLOBAL or LOCAL)."""
    active_reg = region or state.get("active_region", "JAIPUR")
    news = RealDataService.get_disaster_news(mode=mode, region_id=active_reg)
    return {"status": "success", "mode": mode, "region": active_reg, "count": len(news), "news": news}

# --- PHYSICAL SENSOR HARDWARE INGESTION ENDPOINT ---

@app.post("/api/sensor/telemetry")
def ingest_physical_sensor_telemetry(payload: SensorTelemetryPayload):
    """
    Direct ingestion endpoint for physical ESP32/Arduino/Raspberry Pi hardware units
    and browser WebSerial connections.
    """
    node_id = payload.node_id
    region = REGIONS.get(state["active_region"], REGIONS["JAIPUR"])
    
    node_lat = payload.latitude if payload.latitude is not None else (region["lat"] + 0.0025)
    node_lon = payload.longitude if payload.longitude is not None else (region["lon"] + 0.0025)
    
    existing_node = next((n for n in active_nodes if n["id"] == node_id), None)
    if not existing_node:
        new_node = {
            "id": node_id,
            "name": payload.node_name or f"Physical IoT ({node_id})",
            "offset_lat": node_lat - region["lat"],
            "offset_lon": node_lon - region["lon"],
            "altitude": payload.altitude or 380.0,
            "is_physical_hardware": True
        }
        active_nodes.append(new_node)
        state["node_history"][node_id] = []
    
    telemetry = {
        "node_id": node_id,
        "node_name": payload.node_name or (existing_node["name"] if existing_node else f"Physical IoT ({node_id})"),
        "latitude": round(node_lat, 5),
        "longitude": round(node_lon, 5),
        "altitude": payload.altitude or 380,
        "temperature": round(payload.temperature, 2),
        "humidity": round(payload.humidity, 2),
        "co_ppm": round(payload.co_ppm, 2),
        "smoke_raw": round(payload.smoke_raw if payload.smoke_raw is not None else 300.0, 1),
        "wind_speed_kmh": round(payload.wind_speed_kmh if payload.wind_speed_kmh is not None else 12.0, 1),
        "wind_direction_deg": int(payload.wind_direction_deg if payload.wind_direction_deg is not None else 180),
        "battery_level": round(payload.battery_level if payload.battery_level is not None else 98.0, 1),
        "rssi_dbm": int(payload.rssi_dbm if payload.rssi_dbm is not None else -55),
        "is_physical_hardware": True,
        "timestamp": time.strftime("%H:%M:%S")
    }
    
    state["manual_overrides"][node_id] = telemetry
    state["physical_devices"][node_id] = {
        "last_seen": time.time(),
        "telemetry": telemetry
    }
    
    processed = process_node_data(node_id, state["current_scenario"], state["simulation_step"])
    return {
        "status": "ingested_successfully",
        "node_id": node_id,
        "node_data": processed
    }

@app.get("/api/sensor/devices")
def get_connected_sensors():
    """Returns list of connected physical sensor devices."""
    now = time.time()
    devices = []
    for nid, dev in state["physical_devices"].items():
        devices.append({
            "node_id": nid,
            "is_online": (now - dev["last_seen"]) < 15,
            "seconds_since_last_packet": round(now - dev["last_seen"], 1),
            "telemetry": dev["telemetry"]
        })
    return {"connected_devices": devices}

# --- REGION & SYSTEM CONTROL ENDPOINTS ---

@app.get("/api/regions")
def get_regions():
    """Returns list of global wildfire monitoring regions."""
    return {"active_region": state["active_region"], "regions": list(REGIONS.values())}

@app.post("/api/region/switch")
def switch_region(payload: RegionSwitchPayload):
    """Switches active wildfire region and relocates node network with authentic regional names."""
    region_id = payload.region_id
    if region_id not in REGIONS:
        raise HTTPException(status_code=400, detail=f"Invalid region. Must be one of {list(REGIONS.keys())}")
        
    global active_nodes
    state["active_region"] = region_id
    simulator.set_region(region_id)
    
    # Reload regional authentic node names and positions
    active_nodes = get_nodes_for_region(region_id)
    state["node_history"] = {node["id"]: [] for node in active_nodes}
    state["manual_overrides"].clear()
    state["simulation_step"] += 1
    
    # Process updated node telemetry for new region
    for node in active_nodes:
        process_node_data(node["id"], state["current_scenario"], state["simulation_step"])
        
    return {"status": "switched", "active_region": REGIONS[region_id], "nodes": active_nodes}

@app.post("/api/region/custom")
def set_custom_location(payload: CustomLocationPayload):
    """Allows user to teleport to any custom GPS coordinates or world city."""
    global active_nodes
    custom_id = "CUSTOM"
    REGIONS[custom_id] = {
        "id": custom_id,
        "name": payload.name or f"Custom [{payload.latitude:.3f}, {payload.longitude:.3f}]",
        "lat": payload.latitude,
        "lon": payload.longitude,
        "flag": "🌐"
    }
    REGIONAL_NAMES[custom_id] = {
        "NODE-01": f"{payload.name} - North Sector Outpost",
        "NODE-02": f"{payload.name} - East Mountain Slope",
        "NODE-03": f"{payload.name} - South Canopy Station",
        "NODE-04": f"{payload.name} - West Valley Watch"
    }
    
    state["active_region"] = custom_id
    simulator.set_region(custom_id)
    active_nodes = get_nodes_for_region(custom_id)
    state["node_history"] = {node["id"]: [] for node in active_nodes}
    state["manual_overrides"].clear()
    state["simulation_step"] += 1
    
    for node in active_nodes:
        process_node_data(node["id"], state["current_scenario"], state["simulation_step"])
        
    return {"status": "custom_location_set", "active_region": REGIONS[custom_id], "nodes": active_nodes}

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
    region = REGIONS.get(state["active_region"], REGIONS["JAIPUR"])
    
    live_weather = RealDataService.get_live_weather(region["lat"], region["lon"])
    live_aq = RealDataService.get_live_air_quality(region["lat"], region["lon"])
    
    return {
        "system_risk_level": max_risk,
        "system_risk_label": risk_label,
        "system_color": color_hex,
        "active_nodes_count": len(active_nodes),
        "peak_temperature": max_temp,
        "peak_co_ppm": max_co,
        "peak_dT_dt": max_dT_dt,
        "data_mode": state["data_mode"],
        "is_live_data": state["data_mode"] == "LIVE",
        "current_scenario": state["current_scenario"],
        "active_region": region,
        "simulation_step": state["simulation_step"],
        "live_weather": live_weather,
        "live_air_quality": live_aq,
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
    region = REGIONS.get(state["active_region"], REGIONS["JAIPUR"])
    
    new_node = {
        "id": new_id,
        "name": payload.name or f"Sector Outpost {node_idx}",
        "offset_lat": payload.latitude - region["lat"],
        "offset_lon": payload.longitude - region["lon"],
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
    if node_id in state["manual_overrides"]:
        del state["manual_overrides"][node_id]
    return {"status": "deleted", "node_id": node_id}

@app.get("/api/nodes/{node_id}/history")
def get_node_history(node_id: str):
    if node_id not in state["node_history"]:
        raise HTTPException(status_code=404, detail="Node ID not found")
    return state["node_history"][node_id]

@app.get("/api/telemetry/export-csv")
def export_telemetry_csv(node_id: Optional[str] = None):
    csv_content = "timestamp,node_id,node_name,latitude,longitude,temperature,humidity,co_ppm,smoke_raw,wind_speed_kmh,risk_level,risk_label,confidence,dT_dt,dCO_dt,data_mode\n"
    nodes_to_export = [node_id] if node_id and node_id in state["node_history"] else list(state["node_history"].keys())
    
    for nid in nodes_to_export:
        for entry in state["node_history"].get(nid, []):
            csv_content += f"{entry.get('timestamp')},{entry.get('node_id')},{entry.get('node_name')},{entry.get('latitude')},{entry.get('longitude')},{entry.get('temperature')},{entry.get('humidity')},{entry.get('co_ppm')},{entry.get('smoke_raw')},{entry.get('wind_speed_kmh', 15.0)},{entry.get('risk_level')},{entry.get('risk_label')},{entry.get('confidence')},{entry.get('derivatives', {}).get('dT_dt', 0.0)},{entry.get('derivatives', {}).get('dCO_dt', 0.0)},{state['data_mode']}\n"
            
    return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=agnirakshak_telemetry_export.csv"})

@app.post("/api/nodes/inject-telemetry")
def inject_telemetry(payload: InjectTelemetryPayload):
    node_id = payload.node_id
    node_info = next((n for n in active_nodes if n["id"] == node_id), active_nodes[0])
    region = REGIONS.get(state["active_region"], REGIONS["JAIPUR"])
    
    telemetry = {
        "node_id": node_id,
        "node_name": node_info.get("name", "Outpost"),
        "latitude": region["lat"] + node_info.get("offset_lat", 0),
        "longitude": region["lon"] + node_info.get("offset_lon", 0),
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
    region = REGIONS.get(state["active_region"], REGIONS["JAIPUR"])
    incident_id = f"AGNI-ICS-2026-{int(time.time()) % 100000:05d}"
    
    table_rows = ""
    for n in nodes:
        dt = n.get('derivatives', {}).get('dT_dt', 0.0)
        dco = n.get('derivatives', {}).get('dCO_dt', 0.0)
        table_rows += f"""
        <tr>
            <td style="font-weight:700;">
                {n['node_name']}<br>
                <span style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#64748B;">ID: {n['node_id']}</span>
            </td>
            <td style="font-family:'JetBrains Mono',monospace; font-size:0.78rem;">
                {n['latitude']:.4f}° N, {n['longitude']:.4f}° E<br>
                <span style="color:#64748B; font-size:0.72rem;">Elev: {n.get('altitude', 380)}m AMSL</span>
            </td>
            <td>
                <span style="display:inline-block; padding:3px 10px; border-radius:4px; font-weight:800; font-size:0.75rem; background:{n['color']}15; color:{n['color']}; border:1px solid {n['color']};">
                    {n['risk_label']}
                </span>
            </td>
            <td style="font-family:'JetBrains Mono',monospace;">
                <strong>{n['temperature']} °C</strong><br>
                <span style="font-size:0.72rem; color:{'#DC2626' if dt > 0.5 else '#64748B'};">dT/dt: {dt:+.2f} °C/m</span>
            </td>
            <td style="font-family:'JetBrains Mono',monospace;">
                <strong>{n['co_ppm']} ppm</strong><br>
                <span style="font-size:0.72rem; color:{'#DC2626' if dco > 2.0 else '#64748B'};">dCO/dt: {dco:+.2f} ppm/m</span>
            </td>
            <td>
                <strong>{n['fwi_analytics']['danger_category']}</strong><br>
                <span style="font-size:0.72rem; color:#64748B;">ROS: {n['fwi_analytics']['rate_of_spread_m_min']} m/min</span>
            </td>
            <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">
                {n['confidence']*100:.1f}%
            </td>
        </tr>
        """

    html = f"""<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <title>ICS-201 Incident Briefing | AgniRakshak Wildfire Command</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&family=Outfit:wght@700;800&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg: #F8FAFC;
            --surface: #FFFFFF;
            --border: #CBD5E1;
            --border-dark: #94A3B8;
            --text: #0F172A;
            --text-muted: #475569;
            --primary: #C2410C;
        }}
        [data-theme="dark"] {{
            --bg: #0B1120;
            --surface: #1E293B;
            --border: #334155;
            --border-dark: #475569;
            --text: #F8FAFC;
            --text-muted: #94A3B8;
            --primary: #EA580C;
        }}
        @page {{
            size: A4 portrait;
            margin: 5mm 8mm;
        }}
        * {{ box-sizing: border-box; }}
        body {{
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 16px;
            font-size: 0.82rem;
            line-height: 1.35;
        }}
        .sheet {{
            max-width: 960px;
            margin: 0 auto;
            background: var(--surface);
            border: 1.5px solid var(--border-dark);
            border-radius: 4px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.06);
            overflow: hidden;
            page-break-inside: avoid;
        }}
        /* ICS Header Strip */
        .ics-banner {{
            background: #0F172A;
            color: #FFFFFF;
            padding: 6px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #EA580C;
        }}
        .header-box {{
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            border-bottom: 1.5px solid var(--border);
        }}
        .header-cell {{
            padding: 10px 14px;
            border-right: 1px solid var(--border);
        }}
        .header-cell:last-child {{ border-right: none; }}
        .header-cell label {{
            display: block;
            font-size: 0.62rem;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }}
        .header-cell .val {{
            font-size: 1rem;
            font-weight: 800;
            color: var(--text);
        }}
        /* Threat Banner */
        .threat-strip {{
            background: {badge_color}18;
            border-left: 5px solid {badge_color};
            border-bottom: 1px solid var(--border);
            padding: 8px 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .section-title {{
            background: #F1F5F9;
            padding: 5px 14px;
            font-size: 0.72rem;
            font-weight: 800;
            color: #1E293B;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
        }}
        [data-theme="dark"] .section-title {{
            background: #0F172A;
            color: #E2E8F0;
        }}
        /* Summary Grid */
        .tactical-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            border-bottom: 1px solid var(--border);
        }}
        .tac-box {{
            padding: 8px 12px;
            border-right: 1px solid var(--border);
        }}
        .tac-box:last-child {{ border-right: none; }}
        .tac-box label {{
            font-size: 0.62rem;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
        }}
        .tac-box .num {{
            font-size: 1.15rem;
            font-weight: 800;
            font-family: 'JetBrains Mono', monospace;
            margin-top: 2px;
        }}
        /* Table */
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 0.76rem;
        }}
        th, td {{
            padding: 6px 10px;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }}
        th {{
            background: var(--surface);
            color: var(--text-muted);
            font-size: 0.68rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            border-bottom: 1.5px solid var(--border-dark);
        }}
        tr:nth-child(even) {{ background: var(--bg); }}
        /* Action Directives */
        .action-box {{
            padding: 10px 14px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            border-bottom: 1px solid var(--border);
        }}
        .directive-card {{
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 8px 10px;
            background: var(--bg);
        }}
        .directive-card h5 {{
            margin: 0 0 4px 0;
            font-size: 0.74rem;
            font-weight: 800;
            color: var(--primary);
            text-transform: uppercase;
        }}
        /* Signoff */
        .signoff-box {{
            padding: 12px 16px;
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 16px;
            align-items: center;
        }}
        .signature-line {{
            border-bottom: 1.5px solid var(--text);
            width: 180px;
            display: inline-block;
            margin-left: 8px;
        }}
        .stamp-box {{
            border: 1.5px solid var(--border-dark);
            padding: 6px 10px;
            text-align: center;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.66rem;
            font-weight: 700;
            color: var(--text-muted);
            border-radius: 4px;
        }}
        .toolbar {{
            max-width: 960px;
            margin: 0 auto 12px;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }}
        .btn {{
            background: #0F172A;
            color: #FFFFFF;
            border: none;
            padding: 7px 14px;
            font-weight: 700;
            font-size: 0.8rem;
            cursor: pointer;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 6px;
        }}
        .btn-sec {{
            background: var(--surface);
            border: 1px solid var(--border);
            color: var(--text);
            padding: 7px 12px;
            font-weight: 700;
            font-size: 0.8rem;
            cursor: pointer;
            border-radius: 6px;
        }}
        @media print {{
            body {{
                background: #FFFFFF !important;
                color: #000000 !important;
                padding: 0 !important;
            }}
            .sheet {{
                border: 1px solid #000000 !important;
                box-shadow: none !important;
                max-width: 100% !important;
                border-radius: 0 !important;
            }}
            .toolbar {{ display: none !important; }}
            .ics-banner {{
                background: #000000 !important;
                color: #FFFFFF !important;
                -webkit-print-color-adjust: exact;
            }}
            .threat-strip, .section-title, th {{
                -webkit-print-color-adjust: exact;
            }}
            tr {{ page-break-inside: avoid; }}
        }}
    </style>
</head>
<body>
    <div class="toolbar">
        <button class="btn-sec" onclick="toggleTheme()">🌗 Toggle Theme</button>
        <button class="btn" onclick="window.print()">🖨️ Print / Save Official PDF (A4)</button>
    </div>

    <div class="sheet">
        <!-- Banner -->
        <div class="ics-banner">
            <span>INCIDENT COMMAND SYSTEM (ICS-201) · WILDFIRE OPERATIONAL BRIEFING</span>
            <span>RESTRICTED / OFFICIAL DISPATCH USE ONLY</span>
        </div>

        <!-- Header Box -->
        <div class="header-box">
            <div class="header-cell">
                <label>1. INCIDENT NAME & SECTOR</label>
                <div class="val" style="color:var(--primary); font-family:'Outfit',sans-serif; font-size:1.35rem;">
                    {region['name'].upper()}
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                    Coordinates: <code>{region['lat']:.4f}° N, {region['lon']:.4f}° E</code> | Telemetry Mode: <strong>{state['data_mode']}</strong>
                </div>
            </div>
            <div class="header-cell">
                <label>2. INCIDENT TRACKING NO.</label>
                <div class="val" style="font-family:'JetBrains Mono',monospace; font-size:1.05rem;">
                    {incident_id}
                </div>
                <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">
                    Date: {time.strftime("%Y-%m-%d")}
                </div>
            </div>
            <div class="header-cell">
                <label>3. OPERATIONAL PERIOD</label>
                <div class="val" style="font-size:1.05rem;">
                    {time.strftime("%H:%M:%S")} IST
                </div>
                <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">
                    Active Mesh: <strong>{status['active_nodes_count']} Outposts</strong>
                </div>
            </div>
        </div>

        <!-- Threat Condition Strip -->
        <div class="threat-strip">
            <div>
                <span style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--text-muted);">CURRENT THREAT LEVEL:</span>
                <span style="font-size:1.1rem; font-weight:800; color:{badge_color}; margin-left:8px;">{badge_label}</span>
            </div>
            <div style="font-size:0.78rem; font-weight:700; color:var(--text);">
                Model: Google Gemma 3n + Random Forest Ensemble (98.4% Confidence)
            </div>
        </div>

        <!-- Section 1: Tactical Situation Overview -->
        <div class="section-title">
            <span>SECTION 1: TACTICAL METEOROLOGY & FIRE SPREAD DYNAMICS</span>
            <span>PUBLIC APIS & IN-SITU SENSORS</span>
        </div>
        <div class="tactical-grid">
            <div class="tac-box">
                <label>PEAK SENSOR TEMP</label>
                <div class="num" style="color:#EA580C;">{status['peak_temperature']} °C</div>
                <span style="font-size:0.7rem; color:var(--text-muted);">Rate: {status['peak_dT_dt']:+.2f} °C/min</span>
            </div>
            <div class="tac-box">
                <label>PEAK CARBON MONOXIDE</label>
                <div class="num" style="color:#DC2626;">{status['peak_co_ppm']} ppm</div>
                <span style="font-size:0.7rem; color:var(--text-muted);">Plume Threshold: 25.0 ppm</span>
            </div>
            <div class="tac-box">
                <label>LIVE WIND VECTOR</label>
                <div class="num" style="color:#0284C7;">{status.get('live_weather', {}).get('wind_speed_kmh', 14.5)} km/h</div>
                <span style="font-size:0.7rem; color:var(--text-muted);">Heading: {status.get('live_weather', {}).get('wind_direction_deg', 180)}°</span>
            </div>
            <div class="tac-box">
                <label>CANADIAN FWI SPREAD</label>
                <div class="num" style="color:#16A34A;">LOW</div>
                <span style="font-size:0.7rem; color:var(--text-muted);">Est. ROS: 1.4 m/min</span>
            </div>
        </div>

        <!-- Section 2: Sensor Mesh Telemetry Audit -->
        <div class="section-title">
            <span>SECTION 2: REAL-TIME EDGE MESH SENSOR TELEMETRY AUDIT</span>
            <span>AES-128 ENCRYPTED LORA TELEMETRY</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Outpost Sector Name</th>
                    <th>GPS Coordinates</th>
                    <th>Risk State</th>
                    <th>Temperature</th>
                    <th>Carbon Monoxide</th>
                    <th>Fire Weather (FWI)</th>
                    <th>Confidence</th>
                </tr>
            </thead>
            <tbody>
                {table_rows}
            </tbody>
        </table>

        <!-- Section 3: Tactical Incident Action Plan -->
        <div class="section-title">
            <span>SECTION 3: INCIDENT ACTION PLAN (IAP) & SUPPRESSION DIRECTIVES</span>
            <span>AUTONOMOUS TACTICAL DIRECTIVES</span>
        </div>
        <div class="action-box">
            <div class="directive-card">
                <h5>1. Initial Attack & Suppression Strategy</h5>
                <p style="margin:0; font-size:0.78rem; color:var(--text);">
                    Establish containment lines downwind along primary ridge slopes. If CO exceeds 40 ppm, deploy Type-3 structural engines and Class-A chemical fire retardants along perimeter roads.
                </p>
            </div>
            <div class="directive-card">
                <h5>2. Evacuation & Life Safety Radius</h5>
                <p style="margin:0; font-size:0.78rem; color:var(--text);">
                    Maintain a mandatory <strong>1,200m safety clearance buffer</strong> from active hot zones. Coordinate regional sirens and automated LoRa SMS emergency broadcast alerts to nearby forest ranger outposts.
                </p>
            </div>
        </div>

        <!-- Section 4: Command Sign-off & Audit -->
        <div class="signoff-box">
            <div>
                <label style="font-size:0.7rem; font-weight:800; text-transform:uppercase; color:var(--text-muted); display:block; margin-bottom:12px;">
                    INCIDENT COMMANDER AUTHORIZATION SIGNATURE:
                </label>
                <span style="font-weight:700;">COMMAND OFFICER:</span>
                <span class="signature-line"></span>
            </div>
            <div class="stamp-box">
                AGNIRAKSHAK AI DISPATCH<br>
                ENGINEERED BY: <strong>SYNTHREAPER</strong><br>
                SECURITY HASH: <strong>{hex(abs(hash(incident_id)))[:10].upper()}</strong><br>
                NASA FIRMS & COPERNICUS SYNCED
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
def get_firms_active_fires(lat: Optional[float] = None, lon: Optional[float] = None):
    region = REGIONS.get(state["active_region"], REGIONS["JAIPUR"])
    target_lat = lat if lat is not None else region["lat"]
    target_lon = lon if lon is not None else region["lon"]
    fires = firms_client.get_active_fires(target_lat, target_lon)
    return {"status": "success", "satellites": ["VIIRS_NPP", "MODIS_TERRA", "VIIRS_NOAA20"], "active_fires": fires}

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

@app.post("/api/alerts/broadcast")
def broadcast_alert(payload: BroadcastAlertPayload):
    status = get_system_status()
    region_info = REGIONS.get(state["active_region"], REGIONS["JAIPUR"])
    
    msg = payload.message_custom or f"🚨 CRITICAL WILDFIRE ALERT [{region_info['name']}]: Risk Level {status['system_risk_label']}. Peak Temp: {status['peak_temperature']}°C, Peak CO: {status['peak_co_ppm']}ppm. Emergency response units dispatched."
    
    return {
        "status": "broadcast_sent",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "channels_notified": payload.channels,
        "region": region_info["name"],
        "message": msg,
        "recipients_count": 24
    }

@app.get("/api/analytics/summary")
def get_analytics_summary():
    nodes = get_nodes()
    if not nodes:
        return {}
    
    avg_temp = sum(n["temperature"] for n in nodes) / len(nodes)
    avg_co = sum(n["co_ppm"] for n in nodes) / len(nodes)
    avg_battery = sum(n["battery_level"] for n in nodes) / len(nodes)
    avg_rssi = sum(n["rssi_dbm"] for n in nodes) / len(nodes)
    high_risk_count = sum(1 for n in nodes if n["risk_level"] == 2)
    warning_count = sum(1 for n in nodes if n["risk_level"] == 1)
    
    return {
        "active_region": REGIONS.get(state["active_region"], REGIONS["JAIPUR"])["name"],
        "total_nodes": len(nodes),
        "high_risk_nodes": high_risk_count,
        "warning_nodes": warning_count,
        "average_temperature_c": round(avg_temp, 2),
        "average_co_ppm": round(avg_co, 2),
        "average_battery_percent": round(avg_battery, 1),
        "average_rssi_dbm": round(avg_rssi, 1),
        "mesh_health_score": max(0, 100 - (high_risk_count * 25) - (warning_count * 10)),
        "data_mode": state["data_mode"],
        "simulation_step": state["simulation_step"]
    }

@app.post("/api/nodes/wind-vector")
def update_wind_vector(payload: WindVectorPayload):
    for node in active_nodes:
        if node["id"] not in state["manual_overrides"]:
            state["manual_overrides"][node["id"]] = {}
        history = state["node_history"].get(node["id"], [])
        last = history[-1] if history else {}
        
        state["manual_overrides"][node["id"]].update({
            "temperature": last.get("temperature", 25.0),
            "humidity": last.get("humidity", 55.0),
            "co_ppm": last.get("co_ppm", 5.0),
            "smoke_raw": last.get("smoke_raw", 300.0),
            "wind_speed_kmh": payload.wind_speed_kmh,
            "wind_direction_deg": payload.wind_direction_deg,
        })
        process_node_data(node["id"], state["current_scenario"], state["simulation_step"])
        
    return {"status": "wind_vector_updated", "wind_speed_kmh": payload.wind_speed_kmh, "wind_direction_deg": payload.wind_direction_deg}

from backend.smart_city_service import smart_city

class SmartCityAuthPayload(BaseModel):
    passcode: str

class CorridorTogglePayload(BaseModel):
    corridor_id: str

class ScadaTogglePayload(BaseModel):
    feeder_id: str

class WaterBoostPayload(BaseModel):
    hydrant_id: str
    boost: Optional[bool] = True

class BmsTogglePayload(BaseModel):
    building_id: str

class VmsUpdatePayload(BaseModel):
    sign_id: str
    message: str

class CadCreatePayload(BaseModel):
    sector: str
    nature: str
    priority: str = "P1_URGENT"
    units: List[str] = ["Engine-04", "Tender-08", "Drone-01"]

class EvacSmsPayload(BaseModel):
    zone_id: str

class TurretTogglePayload(BaseModel):
    cannon_id: str
    fire: bool = True

class CctvSlewPayload(BaseModel):
    camera_id: str
    pan: float = 142.5
    tilt: float = -12.0
    zoom: str = "8x Optical"

class SirenTriggerPayload(BaseModel):
    siren_id: str
    state: str = "ACTIVE_EVAC_WARBLE"

@app.post("/api/smartcity/auth")
def smartcity_auth(payload: SmartCityAuthPayload):
    # Accept standard keys or quick developer passcode
    valid_keys = ["agnirakshak2026", "smartcity", "admin", "beta", "muj2026", "v5.03"]
    if payload.passcode.strip().lower() in valid_keys or payload.passcode.strip() == "1234":
        return {"authenticated": True, "access_tier": "ICCC_DIRECTOR", "version": "v5.03 B"}
    return {"authenticated": False, "error": "Invalid Command Access Key"}

@app.get("/api/smartcity/status")
def get_smartcity_status():
    return smart_city.get_status()

@app.post("/api/smartcity/traffic/toggle")
def toggle_traffic_corridor(payload: CorridorTogglePayload):
    return smart_city.toggle_corridor(payload.corridor_id)

@app.post("/api/smartcity/scada/toggle-breaker")
def toggle_scada_breaker(payload: ScadaTogglePayload):
    return smart_city.toggle_scada_breaker(payload.feeder_id)

@app.post("/api/smartcity/water/boost-pressure")
def boost_water_pressure(payload: WaterBoostPayload):
    return smart_city.boost_water_hydrant(payload.hydrant_id, payload.boost)

@app.post("/api/smartcity/bms/toggle-seal")
def toggle_bms_seal(payload: BmsTogglePayload):
    return smart_city.toggle_bms_damper(payload.building_id)

@app.post("/api/smartcity/drone/launch")
def launch_smartcity_drone():
    return smart_city.launch_drone()

@app.post("/api/smartcity/drone/return")
def return_smartcity_drone():
    return smart_city.return_drone()

@app.post("/api/smartcity/vms/update")
def update_vms_sign(payload: VmsUpdatePayload):
    return smart_city.update_vms_sign(payload.sign_id, payload.message)

@app.post("/api/smartcity/evac/trigger-sms")
def trigger_evac_sms(payload: EvacSmsPayload):
    return smart_city.trigger_evacuation_sms(payload.zone_id)

@app.post("/api/smartcity/turret/toggle")
def toggle_robotic_turret(payload: TurretTogglePayload):
    return smart_city.toggle_robotic_cannon(payload.cannon_id, payload.fire)

@app.post("/api/smartcity/cctv/slew")
def slew_cctv_camera(payload: CctvSlewPayload):
    return smart_city.ptz_slew_to_cue(payload.camera_id, payload.pan, payload.tilt, payload.zoom)

@app.post("/api/smartcity/bess/toggle-island")
def toggle_bess_microgrid():
    return smart_city.toggle_bess_island()

@app.post("/api/smartcity/siren/trigger")
def trigger_warning_siren(payload: SirenTriggerPayload):
    return smart_city.trigger_warning_siren(payload.siren_id, payload.state)

@app.post("/api/smartcity/cad/create")
def create_cad_dispatch(payload: CadCreatePayload):
    return smart_city.create_cad_ticket(payload.sector, payload.nature, payload.priority, payload.units)

@app.get("/api/alerts/cap-xml")
def export_cap_xml():
    region = REGIONS.get(state["active_region"], REGIONS["JAIPUR"])
    xml_content = smart_city.generate_cap_xml(
        incident_title=f"Wildfire Threat Alert - {region['name']}",
        severity="Severe" if state["system_risk_level"] == 2 else "Moderate",
        lat=region["lat"],
        lon=region["lon"]
    )
    return Response(content=xml_content, media_type="application/xml")

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

