"""
AgniRakshak IoT Sensor Node Simulator
Generates multi-node sensor telemetry streams with global wildfire region support.
"""

import time
import math
import random
from typing import Dict, List, Any

REGIONS = {
    "JAIPUR": {
        "id": "JAIPUR",
        "name": "Jaipur Ridge Forest Reserve, India",
        "lat": 26.8430,
        "lon": 75.5655,
        "flag": "🇮🇳"
    },
    "CALIFORNIA": {
        "id": "CALIFORNIA",
        "name": "Sierra Nevada Forest, California, USA",
        "lat": 37.8651,
        "lon": -119.5383,
        "flag": "🇺🇸"
    },
    "AMAZON": {
        "id": "AMAZON",
        "name": "Amazon Rainforest Basin, Brazil",
        "lat": -3.4653,
        "lon": -62.2159,
        "flag": "🇧🇷"
    },
    "AUSTRALIA": {
        "id": "AUSTRALIA",
        "name": "New South Wales Bushlands, Australia",
        "lat": -33.8688,
        "lon": 151.2093,
        "flag": "🇦🇺"
    },
    "GREECE": {
        "id": "GREECE",
        "name": "Attica Pine Forest, Greece",
        "lat": 38.0742,
        "lon": 23.8243,
        "flag": "🇬🇷"
    }
}

NODES = [
    {"id": "NODE-01", "name": "North Ridge Outpost", "offset_lat": 0.0005, "offset_lon": -0.0013, "altitude": 380},
    {"id": "NODE-02", "name": "East Pine Slope", "offset_lat": 0.0050, "offset_lon": 0.0055, "altitude": 410},
    {"id": "NODE-03", "name": "South Valley Canopy", "offset_lat": -0.0040, "offset_lon": 0.0025, "altitude": 340},
    {"id": "NODE-04", "name": "West Watchtower", "offset_lat": -0.0015, "offset_lon": -0.0065, "altitude": 425}
]

REGIONAL_NAMES = {
    "JAIPUR": {
        "NODE-01": "Nahargarh Fort Ridge",
        "NODE-02": "Jaigarh Pine Slopes",
        "NODE-03": "Amer Reserve Canopy",
        "NODE-04": "Jhalana Forest Sector"
    },
    "CALIFORNIA": {
        "NODE-01": "Yosemite Valley Station",
        "NODE-02": "El Capitan Ridge Outpost",
        "NODE-03": "Mariposa Grove Canopy",
        "NODE-04": "Glacier Point Watchtower"
    },
    "AMAZON": {
        "NODE-01": "Manaus Canopy Tower",
        "NODE-02": "Tapajós River Station",
        "NODE-03": "Rio Negro Sector Delta",
        "NODE-04": "Xingu Primary Forest"
    },
    "AUSTRALIA": {
        "NODE-01": "Blue Mountains Ridge",
        "NODE-02": "Katoomba Eucalyptus Slope",
        "NODE-03": "Hawkesbury River Valley",
        "NODE-04": "Wolgan Bushland Watch"
    },
    "GREECE": {
        "NODE-01": "Mount Parnitha Outpost",
        "NODE-02": "Tatoi Pine Forest Ridge",
        "NODE-03": "Penteli Canopy Sector",
        "NODE-04": "Marathon Coastal Watch"
    }
}

class TelemetrySimulator:
    def __init__(self):
        self.step_counter = 0
        self.active_region = "JAIPUR"

    def set_region(self, region_id: str):
        if region_id in REGIONS:
            self.active_region = region_id

    def generate_node_telemetry(self, node_id: str, scenario: str = "NORMAL", step: int = 0) -> Dict[str, Any]:
        node_info = next((n for n in NODES if n["id"] == node_id), NODES[0])
        region = REGIONS.get(self.active_region, REGIONS["JAIPUR"])
        
        offset = sum(ord(c) for c in node_id) % 7
        
        base_lat = region["lat"] + node_info["offset_lat"]
        base_lon = region["lon"] + node_info["offset_lon"]
        
        if scenario == "NORMAL":
            base_temp = 24.0 + 3.0 * math.sin(step * 0.05 + offset) + random.uniform(-0.5, 0.5)
            base_hum = 60.0 - 5.0 * math.sin(step * 0.05 + offset) + random.uniform(-1.0, 1.0)
            base_co = 3.5 + random.uniform(-0.3, 0.4)
            base_smoke = 280.0 + random.uniform(-15.0, 15.0)
            wind_kmh = 10.0 + random.uniform(-2.0, 3.0)
            wind_deg = (45 + offset * 20) % 360
            battery = max(80.0, 98.0 - step * 0.01)
            
        elif scenario == "HOT_DRY":
            base_temp = 38.0 + min(6.0, step * 0.4) + random.uniform(-0.4, 0.4)
            base_hum = max(10.0, 28.0 - step * 0.5) + random.uniform(-0.8, 0.8)
            base_co = 8.0 + random.uniform(0.0, 2.0)
            base_smoke = 450.0 + random.uniform(-20.0, 30.0)
            wind_kmh = 22.0 + random.uniform(-3.0, 5.0)
            wind_deg = (90 + offset * 15) % 360
            battery = 92.0
            
        elif scenario == "SMOLDERING":
            base_temp = 32.0 + min(8.0, step * 0.6) + random.uniform(-0.3, 0.3)
            base_hum = max(18.0, 45.0 - step * 0.8) + random.uniform(-1.0, 1.0)
            base_co = 12.0 + min(75.0, step * 4.5) + random.uniform(-1.5, 2.5)
            base_smoke = 400.0 + min(1200.0, step * 85.0) + random.uniform(-30.0, 30.0)
            wind_kmh = 16.0 + random.uniform(-2.0, 4.0)
            wind_deg = 180
            battery = 88.0
            
        elif scenario == "ACTIVE_FIRE":
            base_temp = 48.0 + min(25.0, step * 2.2) + random.uniform(-1.0, 1.5)
            base_hum = max(5.0, 20.0 - step * 1.2) + random.uniform(-0.5, 0.5)
            base_co = 60.0 + min(180.0, step * 12.0) + random.uniform(-4.0, 6.0)
            base_smoke = 1200.0 + min(2200.0, step * 150.0) + random.uniform(-50.0, 50.0)
            wind_kmh = 35.0 + random.uniform(-5.0, 8.0)
            wind_deg = 225
            battery = 75.0
            
        else:
            base_temp, base_hum, base_co, base_smoke, wind_kmh, wind_deg, battery = 25.0, 55.0, 4.0, 300.0, 12.0, 90, 95.0

        node_name_base = REGIONAL_NAMES.get(self.active_region, {}).get(node_id, node_info.get("name", f"Sector {node_id}"))
        node_name = f"{region['flag']} {node_name_base}"

        return {
            "node_id": node_info["id"],
            "node_name": node_name,
            "latitude": round(base_lat + random.uniform(-0.0001, 0.0001), 5),
            "longitude": round(base_lon + random.uniform(-0.0001, 0.0001), 5),
            "altitude": node_info["altitude"],
            "temperature": round(float(base_temp), 2),
            "humidity": round(float(base_hum), 2),
            "co_ppm": round(float(base_co), 2),
            "smoke_raw": round(float(base_smoke), 1),
            "wind_speed_kmh": round(float(wind_kmh), 1),
            "wind_direction_deg": int(wind_deg),
            "battery_level": round(float(battery), 1),
            "rssi_dbm": random.randint(-75, -55),
            "timestamp": time.strftime("%H:%M:%S")
        }
