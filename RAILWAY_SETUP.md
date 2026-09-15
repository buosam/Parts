# Railway Deployment Environment Variables for IQAutoMarket

Copy and paste the following block into your Railway Web Service:

### How to Apply:
1. Open your project in [Railway.com](https://railway.com)
2. Click on your **Web / Node.js Service** (not the Postgres service)
3. Navigate to the **Variables** tab
4. Click **Raw Editor** at the top right
5. Paste the lines below and click **Save**

---

```env
NODE_ENV=production
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
DATABASE_URL=postgresql://postgres:CaraWHCiJFwBWNvLXHKTzMEqmcLcZIHd@postgres.railway.internal:5432/railway
PGHOST=postgres.railway.internal
PGPORT=5432
PGUSER=postgres
PGPASSWORD=CaraWHCiJFwBWNvLXHKTzMEqmcLcZIHd
PGDATABASE=railway
APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
GITHUB_TOKEN=
```

---

### Variable Descriptions:
* **`NODE_ENV`**: Set to `production` for optimized Vite asset serving and secure SSL.
* **`GEMINI_API_KEY`**: Your Google Gemini API key for photo part analysis & quote extraction.
* **`DATABASE_URL`**: Internal connection string to your Railway PostgreSQL service.
* **`PGHOST` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` / `PGPORT`**: Standard PostgreSQL connection credentials.
* **`APP_URL`**: Dynamically resolves to your Railway public domain name.
