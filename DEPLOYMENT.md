# 🚀 AgniRakshak — Render Web Service Field Settings

Here are the exact values to enter into your Render Web Service creation screen:

| Field Name | Value to Enter / Select |
| :--- | :--- |
| **Name** | `AgniRakshak` (or `agnirakshak-backend`) |
| **Language** | `Python 3` |
| **Branch** | `main` |
| **Region** | `Ohio (US East)` |
| **Root Directory** | *(leave blank)* |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free ($0/month)` |

### Environment Variables (Click "Add Environment Variable")

- **Key**: `PYTHON_VERSION`
- **Value**: `3.11.0`

---

Once set, click **Create Web Service** at the bottom of the page!
Render will build and give you your live API URL (e.g. `https://agnirakshak-backend.onrender.com`).
