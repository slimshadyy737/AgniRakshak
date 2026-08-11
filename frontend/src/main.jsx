import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App'
import './index.css'

// Configure Axios Base URL for Local Dev & Production Cloud Backend
const defaultBaseUrl = import.meta.env.DEV
  ? ''
  : 'https://agnirakshak-backend-kgsy.onrender.com';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || defaultBaseUrl;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
