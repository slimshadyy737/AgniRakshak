"""
AgniRakshak - AI-Powered Wildfire Early Detection Dashboard
Theme: Open Innovation | Team: Hell Fire Club
Built with Streamlit, Scikit-Learn, Plotly & Folium
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import folium
from streamlit_folium import st_folium
import time
from typing import Dict, Any

from ai_engine import WildfireAIRiskEngine, RISK_LEVELS
from simulator import TelemetrySimulator, NODES

# Page Configuration
st.set_page_config(
    page_title="AgniRakshak - Wildfire AI Early Detection",
    page_icon="🔥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Premium Design Aesthetics
st.markdown("""
<style>
    /* Global Styling */
    .stApp {
        background-color: #0F172A;
        color: #F8FAFC;
    }
    
    /* Header Container */
    .main-header {
        background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 20px 25px;
        margin-bottom: 25px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .main-title {
        font-family: 'Inter', sans-serif;
        font-weight: 800;
        font-size: 2.2rem;
        background: linear-gradient(90deg, #F97316 0%, #EF4444 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
    }
    .sub-title {
        color: #94A3B8;
        font-size: 1.0rem;
        margin-top: 4px;
    }
    
    /* Risk Badge Styling */
    .risk-badge-normal {
        background-color: rgba(16, 185, 129, 0.15);
        color: #10B981;
        border: 1px solid #10B981;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 1.2rem;
        text-align: center;
    }
    .risk-badge-warning {
        background-color: rgba(245, 158, 11, 0.15);
        color: #F59E0B;
        border: 1px solid #F59E0B;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 1.2rem;
        text-align: center;
    }
    .risk-badge-high {
        background-color: rgba(239, 68, 68, 0.2);
        color: #EF4444;
        border: 1px solid #EF4444;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 1.2rem;
        text-align: center;
        animation: pulse 2s infinite;
    }
    
    /* Card Glassmorphism */
    .glass-card {
        background: #1E293B;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 18px;
        margin-bottom: 15px;
    }
</style>
""", unsafe_allow_html=True)

# Initialize Session State
if 'ai_engine' not in st.session_state:
    st.session_state.ai_engine = WildfireAIRiskEngine()
if 'simulator' not in st.session_state:
    st.session_state.simulator = TelemetrySimulator()
if 'history' not in st.session_state:
    st.session_state.history = {node['id']: [] for node in NODES}
if 'step' not in st.session_state:
    st.session_state.step = 0

# --- HEADER SECTION ---
st.markdown("""
<div class="main-header">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h1 class="main-title">🛡️ AgniRakshak (अग्निरक्षक)</h1>
            <p class="sub-title">Distributed Edge-AI & Multi-Sensor Wildfire Early Detection Network | <b>Team: Hell Fire Club</b> (Open Innovation)</p>
        </div>
        <div style="text-align: right;">
            <span style="background-color: #334155; color: #F8FAFC; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">
                IIC 3.0 Prototype MVP
            </span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# --- SIDEBAR CONTROLS ---
st.sidebar.image("https://img.icons8.com/color/96/000000/fire-element-sensor.png", width=70)
st.sidebar.title("🎛️ Simulation Controls")

scenario = st.sidebar.selectbox(
    "Select Telemetry Scenario",
    ["NORMAL", "HOT_DRY", "SMOLDERING", "ACTIVE_FIRE"],
    format_func=lambda x: {
        "NORMAL": "🌲 Normal Ambient Forest",
        "HOT_DRY": "☀️ Hot & Dry Weather Alert",
        "SMOLDERING": "💨 Smoldering Fire Ignition",
        "ACTIVE_FIRE": "🔥 Active Wildfire Emergency"
    }[x]
)

auto_simulate = st.sidebar.checkbox("Auto-Advance Telemetry Clock", value=True)
if st.sidebar.button("🔄 Step Next Telemetry Frame"):
    st.session_state.step += 1

if auto_simulate:
    st.session_state.step += 1

st.sidebar.markdown("---")
st.sidebar.subheader("📡 Live Node Selector")
selected_node_id = st.sidebar.selectbox("Active Focus Node", [n["id"] for n in NODES])

# Generate telemetry frame for all nodes
current_node_data = {}
node_predictions = {}

for node in NODES:
    telemetry = st.session_state.simulator.generate_node_telemetry(
        node["id"], scenario=scenario, step=st.session_state.step
    )
    
    # Fetch previous telemetry if available
    prev_telemetry = st.session_state.history[node["id"]][-1] if st.session_state.history[node["id"]] else None
    
    # Run AI Risk Prediction
    prediction = st.session_state.ai_engine.predict_risk(telemetry, prev_telemetry, dt_seconds=60.0)
    
    current_node_data[node["id"]] = telemetry
    node_predictions[node["id"]] = prediction
    
    # Store history (max 30 frames)
    combined_record = {**telemetry, **prediction['derivatives'], 'risk_level': prediction['risk_level'], 'risk_label': prediction['risk_label']}
    st.session_state.history[node["id"]].append(combined_record)
    if len(st.session_state.history[node["id"]]) > 30:
        st.session_state.history[node["id"]].pop(0)

# Calculate System-Wide Overall Status
max_system_risk = max(pred['risk_level'] for pred in node_predictions.values())
system_risk_label, system_color_name, system_color_hex = RISK_LEVELS[max_system_risk]

# --- METRIC CARDS ROW ---
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.markdown(f"""
    <div class="glass-card">
        <span style="color: #94A3B8; font-size: 0.85rem;">SYSTEM RISK STATUS</span>
        <div style="color: {system_color_hex}; font-size: 1.6rem; font-weight: 800; margin-top: 4px;">
            {system_risk_label}
        </div>
    </div>
    """, unsafe_allow_html=True)

focus_pred = node_predictions[selected_node_id]
focus_telemetry = current_node_data[selected_node_id]

with col2:
    st.markdown(f"""
    <div class="glass-card">
        <span style="color: #94A3B8; font-size: 0.85rem;">TEMPERATURE & DERIVATIVE</span>
        <div style="color: #F8FAFC; font-size: 1.5rem; font-weight: 700; margin-top: 4px;">
            {focus_telemetry['temperature']} °C 
            <span style="font-size: 0.9rem; color: {'#EF4444' if focus_pred['derivatives']['dT_dt'] > 1.0 else '#10B981'};">
                ({focus_pred['derivatives']['dT_dt']:+.2f} °C/min)
            </span>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown(f"""
    <div class="glass-card">
        <span style="color: #94A3B8; font-size: 0.85rem;">CARBON MONOXIDE (CO)</span>
        <div style="color: #F8FAFC; font-size: 1.5rem; font-weight: 700; margin-top: 4px;">
            {focus_telemetry['co_ppm']} ppm
            <span style="font-size: 0.9rem; color: {'#EF4444' if focus_pred['derivatives']['dCO_dt'] > 2.0 else '#10B981'};">
                ({focus_pred['derivatives']['dCO_dt']:+.2f} ppm/min)
            </span>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col4:
    st.markdown(f"""
    <div class="glass-card">
        <span style="color: #94A3B8; font-size: 0.85rem;">AI CONFIDENCE SCORE</span>
        <div style="color: #38BDF8; font-size: 1.5rem; font-weight: 700; margin-top: 4px;">
            {focus_pred['confidence']*100:.1f}%
        </div>
    </div>
    """, unsafe_allow_html=True)

# --- EMERGENCY ALERT BANNER ---
if max_system_risk == 2:
    st.error(f"🚨 **CRITICAL EMERGENCY WILDFIRE ALERT TRIGGERED!** High-risk ignition patterns detected. Incident Response Team dispatched to location of **{focus_telemetry['node_name']}** ({focus_telemetry['latitude']:.4f}, {focus_telemetry['longitude']:.4f}).")
elif max_system_risk == 1:
    st.warning(f"⚠️ **ELEVATED WILDFIRE WARNING!** Abnormal micro-climate heating or Carbon Monoxide build-up detected on active mesh nodes.")

# --- MAIN DASHBOARD LAYOUT (MAP + AI BREAKDOWN) ---
tab1, tab2, tab3 = st.tabs(["🗺️ Geospatial Sensor Map", "📊 Live Telemetry & AI Model Breakdown", "📝 Round 1 Pitch & Technical Specs"])

with tab1:
    col_map, col_details = st.columns([2, 1])
    
    with col_map:
        st.subheader("🌲 Forest Sensor Node Mesh (Real-Time Location)")
        
        # Center map around nodes
        avg_lat = sum(n["lat"] for n in NODES) / len(NODES)
        avg_lon = sum(n["lon"] for n in NODES) / len(NODES)
        
        m = folium.Map(location=[avg_lat, avg_lon], zoom_start=15, tiles="CartoDB dark_matter")
        
        for n in NODES:
            n_id = n["id"]
            n_pred = node_predictions[n_id]
            n_tel = current_node_data[n_id]
            
            color = "#10B981" if n_pred["risk_level"] == 0 else ("#F59E0B" if n_pred["risk_level"] == 1 else "#EF4444")
            
            popup_html = f"""
            <div style="font-family: Arial; width: 180px;">
                <b>{n['name']}</b> ({n_id})<br/>
                <b>Status:</b> <span style="color:{color}; font-weight:bold;">{n_pred['risk_label']}</span><br/>
                <b>Temp:</b> {n_tel['temperature']} °C<br/>
                <b>CO:</b> {n_tel['co_ppm']} ppm<br/>
                <b>Humidity:</b> {n_tel['humidity']} %<br/>
                <b>Battery:</b> {n_tel['battery_level']}%
            </div>
            """
            
            folium.CircleMarker(
                location=[n["lat"], n["lon"]],
                radius=12 if n_id == selected_node_id else 8,
                popup=folium.Popup(popup_html, max_width=220),
                color=color,
                fill=True,
                fill_color=color,
                fill_opacity=0.7
            ).add_to(m)
            
        st_folium(m, width=800, height=450)

    with col_details:
        st.subheader(f"📡 Node Telemetry: {selected_node_id}")
        
        st.markdown(f"**Node Name:** {focus_telemetry['node_name']}")
        st.markdown(f"**Location:** `{focus_telemetry['latitude']:.4f}°N, {focus_telemetry['longitude']:.4f}°E`")
        st.markdown(f"**Altitude:** `{focus_telemetry['altitude']} meters`")
        st.markdown(f"**Battery Level:** `{focus_telemetry['battery_level']}%` | **RSSI:** `{focus_telemetry['rssi_dbm']} dBm`")
        st.markdown("---")
        st.markdown(f"**AI Risk Level:** `<span style='color:{focus_pred['color']}; font-weight:bold; font-size:1.1rem;'>{focus_pred['risk_label']}</span>`", unsafe_allow_html=True)
        st.info(f"**AI Explanation:** {focus_pred['explanation']}")

with tab2:
    st.subheader(f"📈 Real-Time Environmental Telemetry ({selected_node_id})")
    
    df_hist = pd.DataFrame(st.session_state.history[selected_node_id])
    
    if not df_hist.empty:
        col_c1, col_c2 = st.columns(2)
        
        with col_c1:
            fig_temp = px.line(df_hist, x='timestamp', y=['temperature', 'dT_dt'],
                               title="Temperature (°C) & Temporal Derivative dT/dt (°C/min)",
                               color_discrete_sequence=['#F97316', '#EF4444'], template="plotly_dark")
            fig_temp.update_layout(paper_bgcolor="#1E293B", plot_bgcolor="#0F172A", height=280)
            st.plotly_chart(fig_temp, use_container_width=True)
            
            fig_hum = px.line(df_hist, x='timestamp', y=['humidity'],
                              title="Relative Humidity (%)",
                              color_discrete_sequence=['#38BDF8'], template="plotly_dark")
            fig_hum.update_layout(paper_bgcolor="#1E293B", plot_bgcolor="#0F172A", height=280)
            st.plotly_chart(fig_hum, use_container_width=True)

        with col_c2:
            fig_co = px.line(df_hist, x='timestamp', y=['co_ppm', 'dCO_dt'],
                             title="Carbon Monoxide CO (ppm) & Rate of Change dCO/dt",
                             color_discrete_sequence=['#F59E0B', '#F43F5E'], template="plotly_dark")
            fig_co.update_layout(paper_bgcolor="#1E293B", plot_bgcolor="#0F172A", height=280)
            st.plotly_chart(fig_co, use_container_width=True)

            fig_smoke = px.line(df_hist, x='timestamp', y=['smoke_raw'],
                                title="MQ-2 Smoke / Air Quality Signal (ADC)",
                                color_discrete_sequence=['#A855F7'], template="plotly_dark")
            fig_smoke.update_layout(paper_bgcolor="#1E293B", plot_bgcolor="#0F172A", height=280)
            st.plotly_chart(fig_smoke, use_container_width=True)
            
    st.markdown("---")
    st.subheader("🧠 Scikit-Learn Model Class Probability Distribution")
    
    probs = focus_pred['ml_probabilities']
    fig_prob = go.Figure(go.Bar(
        x=['NORMAL', 'WARNING', 'HIGH RISK'],
        y=[probs['NORMAL'], probs['WARNING'], probs['HIGH_RISK']],
        marker_color=['#10B981', '#F59E0B', '#EF4444']
    ))
    fig_prob.update_layout(
        title="Random Forest Classification Probability Breakdown",
        yaxis_title="Probability",
        template="plotly_dark",
        paper_bgcolor="#1E293B",
        plot_bgcolor="#0F172A",
        height=250
    )
    st.plotly_chart(fig_prob, use_container_width=True)

with tab3:
    st.subheader("📄 International Innovation Challenge 3.0 Strategy Summary")
    st.markdown("""
    ### Project AgniRakshak (अग्निरक्षक)
    - **Track:** Open Innovation
    - **Team Name:** Hell Fire Club
    - **Host Institution:** Manipal University Jaipur
    
    #### Strategic Architecture:
    1. **Multi-Sensor Fusion Edge Node**: Combines CO (MQ-7), Smoke (MQ-2), Temp & Humidity (BME280) on an ESP32.
    2. **Temporal Derivative Engine**: Computes $dT/dt$ and $dCO/dt$ rate-of-change metrics to detect early ignition prior to visible flames.
    3. **Scikit-Learn ML Risk Classifier**: Random Forest model trained on multi-sensor physics features with a deterministic safety fallback rule engine.
    4. **Off-Grid Autonomous Operation**: MPPT solar charging circuit with dual-rail voltage regulators and deep-sleep duty cycling (< 13 mA average draw).
    """)

st.markdown("---")
st.caption("AgniRakshak Hackathon MVP Dashboard | Developed for IIC 3.0 Open Innovation Track | Hell Fire Club")
