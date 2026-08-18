"""
AgniRakshak - Physical Sensor Hardware USB Serial Bridge
Auto-detects USB-connected microcontrollers (ESP32, Arduino, Raspberry Pi Pico)
and continuously streams parsed sensor telemetry to the AgniRakshak backend API.

Usage:
    python live_serial_sensor_bridge.py [--port COM3] [--baud 115200] [--server http://localhost:8000]
"""

import sys
import time
import json
import argparse
import urllib.request

def find_serial_ports():
    """Lists available serial ports across Windows / Linux / macOS."""
    ports = []
    try:
        import serial.tools.list_ports
        ports = [p.device for p in serial.tools.list_ports.comports()]
    except ImportError:
        if sys.platform.startswith('win'):
            ports = [f'COM{i + 1}' for i in range(256)]
        elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
            import glob
            ports = glob.glob('/dev/tty[A-Za-z]*')
        elif sys.platform.startswith('darwin'):
            import glob
            ports = glob.glob('/dev/tty.*')
    return ports

def post_telemetry(server_url: str, payload: dict):
    url = f"{server_url.rstrip('/')}/api/sensor/telemetry"
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json', 'User-Agent': 'AgniRakshak-Serial-Bridge/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=3) as resp:
            if resp.status == 200:
                result = json.loads(resp.read().decode('utf-8'))
                print(f"✅ Ingested: Node {payload.get('node_id')} | Temp: {payload.get('temperature')}°C | CO: {payload.get('co_ppm')}ppm | Risk: {result.get('node_data', {}).get('risk_label')}")
    except Exception as e:
        print(f"⚠️ Failed to transmit to server ({url}): {e}")

def main():
    parser = argparse.ArgumentParser(description="AgniRakshak Hardware Serial Bridge")
    parser.add_argument("--port", default=None, help="Serial port name (e.g. COM3, /dev/ttyUSB0)")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate (default: 115200)")
    parser.add_argument("--server", default="http://localhost:8000", help="AgniRakshak API server URL")
    parser.add_argument("--node-id", default="NODE-PHYSICAL-01", help="Node identifier")
    args = parser.parse_args()

    print("=" * 65)
    print("🛡️ AgniRakshak Physical IoT Hardware Serial Bridge")
    print("=" * 65)

    try:
        import serial
    except ImportError:
        print("❌ 'pyserial' package not found. Installing via pip...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyserial"])
        import serial

    port = args.port
    if not port:
        available = find_serial_ports()
        print(f"🔍 Scanning available COM ports: {available}")
        if available:
            port = available[0]
            print(f"👉 Defaulting to port: {port}")
        else:
            print("⚠️ No physical serial port found. Running mock hardware streamer test...")
            run_mock_hardware_streamer(args.server, args.node_id)
            return

    try:
        ser = serial.Serial(port, args.baud, timeout=1)
        print(f"🟢 Connected to {port} at {args.baud} baud!")
        print("📡 Listening for incoming telemetry packets...\n")

        while True:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if not line:
                continue
            
            # Support JSON format: {"temperature": 32.5, "humidity": 45.0, "co_ppm": 8.5, "smoke_raw": 340}
            # Or CSV format: temp,humidity,co_ppm,smoke_raw
            payload = {}
            if line.startswith("{") and line.endswith("}"):
                try:
                    payload = json.loads(line)
                except Exception:
                    pass
            elif "," in line:
                parts = line.split(",")
                if len(parts) >= 4:
                    try:
                        payload = {
                            "temperature": float(parts[0]),
                            "humidity": float(parts[1]),
                            "co_ppm": float(parts[2]),
                            "smoke_raw": float(parts[3]),
                        }
                    except ValueError:
                        pass
            
            if payload:
                payload["node_id"] = payload.get("node_id", args.node_id)
                post_telemetry(args.server, payload)
            else:
                print(f"[RAW SERIAL]: {line}")

    except Exception as e:
        print(f"❌ Serial error: {e}")
        print("💡 Falling back to mock hardware test...")
        run_mock_hardware_streamer(args.server, args.node_id)

def run_mock_hardware_streamer(server_url: str, node_id: str):
    import random
    print("🚀 Simulating physical microcontroller UART stream...")
    step = 0
    while True:
        step += 1
        payload = {
            "node_id": node_id,
            "node_name": "Physical ESP32 DevKit (USB)",
            "temperature": round(26.0 + random.uniform(-0.5, 1.5), 1),
            "humidity": round(52.0 + random.uniform(-1.0, 1.0), 1),
            "co_ppm": round(3.5 + random.uniform(-0.3, 0.6), 1),
            "smoke_raw": round(290 + random.randint(-5, 10), 1),
            "wind_speed_kmh": 12.5,
            "battery_level": 97.5,
            "rssi_dbm": -55
        }
        post_telemetry(server_url, payload)
        time.sleep(2.5)

if __name__ == "__main__":
    main()
