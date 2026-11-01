# Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
```bash
git clone <repository-url>
cd digital-dark-spot

# Install all dependencies
npm install
cd apps/api && npm install
cd ../web && npm install
cd ../..

# Configure environment
cp .env.example apps/api/.env
# Edit apps/api/.env with your settings

# Start development servers
npm run dev
```

Frontend runs on http://localhost:5173
Backend runs on http://localhost:3001

## Production Deployment

### Frontend — Vercel

1. Connect your GitHub repository to Vercel
2. Configure:
   - **Framework**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://api.yourdomain.com`)
4. Deploy

### Frontend — Netlify

1. Connect your GitHub repository
2. Configure:
   - **Base directory**: `apps/web`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/web/dist`
3. Add `_redirects` file for SPA routing:
   ```
   /*    /index.html   200
   ```
4. Environment Variables:
   - `VITE_API_URL`: Your backend API URL

### Backend — Railway

1. Connect your GitHub repository
2. Configure:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. Environment Variables: Set all from `.env.example`
4. Railway provides a public URL automatically

### Backend — Render

1. Create a new Web Service
2. Configure:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Environment Variables: Set all from `.env.example`

### Database — Supabase (Recommended)

1. Create a free project at https://supabase.com/dashboard
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql` to create tables
3. Go to **Settings → API** and copy:
   - **Project URL** → set as `SUPABASE_URL`
   - **anon / public key** → set as `SUPABASE_KEY`
   - **service_role key** → set as `SUPABASE_SERVICE_ROLE_KEY` (used server-side)

The app works without Supabase using a local file-backed / in-memory store. Data persists in `apps/api/data/` while the server is running.

## AI Provider Setup

### Google Gemini (Recommended)

1. Visit https://aistudio.google.com/apikey
2. Create an API key
3. Set `GEMINI_API_KEY` in your environment
4. Set `AI_PROVIDER=gemini`

### OpenAI (Alternative)

1. Visit https://platform.openai.com/api-keys
2. Create an API key
3. Set `OPENAI_API_KEY` in your environment
4. Set `AI_PROVIDER=openai`

### Demo Mode

If no AI provider is configured, the app uses built-in demo data. All demo results are clearly labelled.

## PWA Installation

1. Open the deployed frontend in Chrome, Edge, or Safari
2. Look for the "Install" option in the browser's address bar or menu
3. Click "Install" to add Digital Dark Spot to your device
4. The app works as a standalone application with offline shell support

## Health Check

```bash
curl https://your-api-url/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "services": {
      "database": "not_configured",
      "ai": "configured",
      "search": "not_configured"
    }
  }
}
```

