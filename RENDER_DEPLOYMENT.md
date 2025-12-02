# Render Deployment Guide

This guide will help you deploy both the frontend and backend to Render and fix connection issues.

## 🚨 Current Issue

The frontend is trying to connect to the backend but failing because:
1. The `VITE_API_URL` environment variable is not set in Render
2. The backend URL needs to be configured correctly

## 📋 Prerequisites

- Backend deployed on Render at: `https://debt-payoff-optimizer-backend.onrender.com`
- Frontend deployed on Render (your frontend URL)

## 🔧 Backend Configuration

### Environment Variables

In your **Backend** Render service, set these environment variables:

```env
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.onrender.com
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
SESSION_TIMEOUT_HOURS=24
```

**Important Notes:**
- `PORT` should be `10000` (Render's default) or the port Render assigns
- `FRONTEND_URL` should be your frontend's Render URL (e.g., `https://debt-payoff-optimizer.onrender.com`)
- If you have multiple frontend URLs, separate them with commas: `https://url1.com,https://url2.com`

### Build & Start Commands

**Build Command:**
```bash
cd backend && npm install && npm run build
```

**Start Command:**
```bash
cd backend && npm start
```

## 🎨 Frontend Configuration

### Environment Variables

In your **Frontend** Render service, set this environment variable:

```env
VITE_API_URL=https://debt-payoff-optimizer-backend.onrender.com
```

**Important Notes:**
- Do NOT include a port number (Render uses standard HTTPS ports)
- Make sure there's no trailing slash
- The URL should be exactly: `https://debt-payoff-optimizer-backend.onrender.com`

### Build & Start Commands

**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Start Command:**
```bash
cd frontend && npm run preview
```

Or if using a static site:
- **Publish Directory:** `frontend/dist`

## 🔍 Verification Steps

1. **Check Backend Health:**
   ```bash
   curl https://debt-payoff-optimizer-backend.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Check CORS:**
   - Open browser DevTools → Network tab
   - Try to make a request from your frontend
   - Check if CORS errors appear in console
   - If CORS errors, verify `FRONTEND_URL` in backend matches your frontend URL exactly

3. **Check Frontend Environment:**
   - After building, the `VITE_API_URL` should be baked into the build
   - You can verify by checking the network requests in DevTools
   - They should go to `https://debt-payoff-optimizer-backend.onrender.com`

## 🐛 Troubleshooting

### Error: "Failed to connect to backend"

**Possible Causes:**
1. `VITE_API_URL` not set in frontend environment variables
2. Backend not running or not accessible
3. CORS configuration blocking requests

**Solutions:**
1. ✅ Set `VITE_API_URL` in Render frontend environment variables
2. ✅ Verify backend is running (check `/health` endpoint)
3. ✅ Check backend logs for CORS errors
4. ✅ Ensure `FRONTEND_URL` in backend matches your frontend URL exactly

### CORS Errors

If you see CORS errors in the browser console:

1. **Check Backend Logs:**
   - Look for: `CORS: Origin "..." not allowed`
   - This tells you what origin is being rejected

2. **Update Backend CORS:**
   - Add your frontend URL to `FRONTEND_URL` environment variable
   - Or update the `allowedOrigins` array in `backend/src/index.ts`

3. **Verify URLs Match:**
   - Frontend URL: `https://your-frontend.onrender.com`
   - Backend `FRONTEND_URL`: `https://your-frontend.onrender.com`
   - They must match exactly (including `https://` and no trailing slash)

### Backend Not Starting

1. **Check PORT:**
   - Render uses port `10000` by default
   - Make sure `PORT=10000` in backend environment variables

2. **Check Build:**
   - Ensure `npm run build` completes successfully
   - Check for TypeScript errors

3. **Check Logs:**
   - View Render service logs for error messages

## 📝 Quick Checklist

### Backend
- [ ] `PORT=10000` (or Render-assigned port)
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` set to your frontend Render URL
- [ ] `GEMINI_API_KEY` set (if using AI features)
- [ ] Build command: `cd backend && npm install && npm run build`
- [ ] Start command: `cd backend && npm start`

### Frontend
- [ ] `VITE_API_URL=https://debt-payoff-optimizer-backend.onrender.com`
- [ ] Build command: `cd frontend && npm install && npm run build`
- [ ] Start command: `cd frontend && npm run preview` (or use static site with `dist` folder)

## 🔄 After Making Changes

1. **Redeploy both services** after changing environment variables
2. **Clear browser cache** if issues persist
3. **Check browser console** for specific error messages
4. **Check Render logs** for backend errors

## 💡 Additional Notes

- Render free tier services may spin down after inactivity
- First request after spin-down may take longer (cold start)
- Consider upgrading to paid tier for always-on services
- Backend CORS now automatically allows any `.onrender.com` subdomain in production

