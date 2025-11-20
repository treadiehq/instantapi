# Railway Deployment Guide - Quick Start

Deploy Instant API to Railway in **15 minutes** using Railway's PostgreSQL database.

## Prerequisites
- [ ] GitHub account
- [ ] Railway account (free to start)
- [ ] Your code pushed to GitHub
- [ ] Cloudflare Sandbox Worker URL (we'll do this first if needed)

---

## Step 0: Quick Cloudflare Worker Setup (5 mins)

Before deploying to Railway, you need the Cloudflare Sandbox Worker URL.

### 0.1: Install Wrangler & Login
```bash
npm install -g wrangler
wrangler login
```

### 0.2: Upgrade to Workers Paid Plan
⚠️ **Required:** Go to https://dash.cloudflare.com
1. Click **"Workers & Pages"**
2. Click **"Plans"** → **"Upgrade to Paid"** ($5/month)
3. Complete payment setup

### 0.3: Deploy Sandbox Worker
```bash
cd sandbox-worker
npm install
npm run deploy
```

**Save the URL** that appears (e.g., `https://instant-api-sandbox.YOUR-NAME.workers.dev`)

---

## Step 1: Push to GitHub (2 mins)

If you haven't already:

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
gh repo create instantapi --private --source=. --push
# OR manually create on github.com and:
git remote add origin https://github.com/YOUR-USERNAME/instantapi.git
git push -u origin main
```

---

## Step 2: Create Railway Account (1 min)

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Click **"Login with GitHub"**
4. Authorize Railway to access your repositories

---

## Step 3: Deploy Backend with PostgreSQL (5 mins)

### 3.1: Create New Project
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your `instantapi` repository
4. Railway will detect it's a monorepo

### 3.2: Configure Backend Service
Railway will show the repo. Now:
1. Click **"Add variables"** → **"Add service"** → **"PostgreSQL"**
2. Railway provisions a PostgreSQL database (takes ~30 seconds)

### 3.3: Configure Backend
1. Click back to your main service
2. Click **"Settings"**
3. Set **"Root Directory"**: `/backend`
4. Set **"Watch Paths"**: `/backend/**`

### 3.4: Set Environment Variables
Click **"Variables"** tab and add these:

**Reference the database:**
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Add these variables:**
```bash
# Cloudflare Sandbox (from Step 0)
CLOUDFLARE_SANDBOX_URL=https://instant-api-sandbox.YOUR-NAME.workers.dev

# Server Config
PORT=3001
NODE_ENV=production

# JWT Secret - Generate with: openssl rand -base64 32
JWT_SECRET=<paste-your-generated-secret-here>

# Resend (get from https://resend.com - free account)
RESEND_API_KEY=re_<your-api-key>
EMAIL_FROM=onboarding@resend.dev

# These will be updated after deployment
BACKEND_URL=https://placeholder.railway.app
FRONTEND_URL=https://placeholder.railway.app
```

### 3.5: Generate JWT Secret
Open a terminal and run:
```bash
openssl rand -base64 32
```
Copy the output and paste it as `JWT_SECRET` value in Railway.

### 3.6: Get Resend API Key
1. Go to https://resend.com
2. Sign up (free)
3. Click **"API Keys"** → **"Create API Key"**
4. Name it `instantapi-prod` → **"Create"**
5. Copy the key (starts with `re_`) and paste as `RESEND_API_KEY`

For now, use `EMAIL_FROM=onboarding@resend.dev` (or your verified domain).

### 3.7: Deploy Backend
1. Click **"Settings"** → **"Networking"** → **"Generate Domain"**
2. Railway generates a URL like: `https://instantapi-backend-production.up.railway.app`
3. **Copy this URL!**

### 3.8: Update Backend URLs
Go back to **"Variables"** and update:
```bash
BACKEND_URL=https://instantapi-backend-production.up.railway.app
```

Leave `FRONTEND_URL` for now (we'll update after frontend deploys).

Railway will automatically redeploy when you change variables.

### 3.9: Check Deployment
1. Click **"Deployments"** tab
2. Wait for "Success" status (~2-3 minutes)
3. Click **"View Logs"** to see the deployment
4. You should see "🚀 Instant API Backend running on..."

### 3.10: Test Backend
```bash
curl https://instantapi-backend-production.up.railway.app/health
```

You should see a response (might be JSON or "OK").

---

## Step 4: Deploy Frontend (5 mins)

### 4.1: Add Frontend Service
1. In Railway project, click **"New"** (top right)
2. Select **"GitHub Repo"**
3. Select the same `instantapi` repository
4. This creates a second service

### 4.2: Configure Frontend Service
1. Click on the new service
2. Click **"Settings"**
3. Set **"Root Directory"**: `/frontend`
4. Set **"Watch Paths"**: `/frontend/**`
5. Set **"Service Name"**: `frontend` (optional, for clarity)

### 4.3: Set Environment Variables
Click **"Variables"** tab and add:

```bash
# Backend API URL (from Step 3.7)
NUXT_PUBLIC_API_BASE=https://instantapi-backend-production.up.railway.app

NODE_ENV=production
```

### 4.4: Generate Frontend Domain
1. Click **"Settings"** → **"Networking"** → **"Generate Domain"**
2. Railway generates: `https://instantapi-frontend-production.up.railway.app`
3. **Copy this URL!**

### 4.5: Update Backend CORS
Go back to **Backend service**:
1. Click **"Variables"**
2. Update:
```bash
FRONTEND_URL=https://instantapi-frontend-production.up.railway.app
```

Railway will redeploy the backend automatically.

### 4.6: Check Frontend Deployment
1. Click **"Deployments"** on frontend service
2. Wait for "Success" (~2-3 minutes)
3. Visit: `https://instantapi-frontend-production.up.railway.app`

You should see the Instant API homepage! 🎉

---

## Step 5: Test Everything (3 mins)

### 5.1: Test Sign Up Flow
1. Visit your frontend URL
2. Click **"Sign up"**
3. Enter your email
4. Check your email inbox for magic link
5. Click the magic link
6. You should be redirected and logged in ✅

### 5.2: Test API Creation
1. On the dashboard, paste this code:
```javascript
function handler(input) {
  return { 
    message: `Hello, ${input.name || 'World'}!`,
    timestamp: new Date().toISOString(),
    env: 'production'
  };
}
```
2. Click **"Create API"**
3. Copy the endpoint URL
4. Test it:
```bash
curl -X POST https://instantapi-backend-production.up.railway.app/run/YOUR-ENDPOINT-ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Railway"}'
```

You should see:
```json
{
  "result": {
    "message": "Hello, Railway!",
    "timestamp": "2025-11-20T...",
    "env": "production"
  }
}
```

### 5.3: Test Tunnel/Expose Mode
```bash
# On your local machine
cd cli
npm run build

# Start a local server
# In another terminal:
python -m http.server 8000

# Expose it
node dist/index.js expose http://localhost:8000
```

This should create a tunnel through your production backend!

---

## Step 6: Optional - Custom Domains

### 6.1: Add Custom Domain for Backend
1. Go to Railway backend service → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Enter: `api.yourdomain.com`
4. Add CNAME to your DNS provider:
   ```
   Type: CNAME
   Name: api
   Value: instantapi-backend-production.up.railway.app
   ```
5. Wait 5-10 minutes for SSL certificate

### 6.2: Add Custom Domain for Frontend
1. Go to Railway frontend service → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Enter: `app.yourdomain.com` (or just `yourdomain.com`)
4. Add CNAME record:
   ```
   Type: CNAME
   Name: app
   Value: instantapi-frontend-production.up.railway.app
   ```

### 6.3: Update Environment Variables
After custom domains are active:

**Backend:**
```bash
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://app.yourdomain.com
```

**Frontend:**
```bash
NUXT_PUBLIC_API_BASE=https://api.yourdomain.com
```

---

## Costs

### Free Tier (Trial)
Railway gives you **$5 in free credits** each month:
- Suitable for testing and low traffic
- ~500 hours of usage per month

### Hobby Plan ($5/month)
- $5 gets you $5 in credits
- Good for personal projects
- Handles moderate traffic

### Pro Plan ($20/month)
- $20 gets you $20 in credits
- Better for production apps
- Higher limits

**Plus Cloudflare Workers:** $5/month (required for sandbox)

**Total:** ~$5-10/month to start

---

## Monitoring & Logs

### View Logs
1. Click on a service (backend or frontend)
2. Click **"Deployments"** → Click a deployment → **"View Logs"**
3. See real-time logs

### Metrics
1. Click on a service
2. Click **"Metrics"** tab
3. See CPU, Memory, Network usage

### Set Up Alerts
1. Click **"Settings"** → **"Alerts"**
2. Add email for deployment failures
3. Get notified if service goes down

---

## Troubleshooting

### Backend won't deploy
**Check logs:**
1. Click backend service → **"Deployments"** → Latest → **"View Logs"**

**Common issues:**
- `DATABASE_URL` not set → Check Postgres service is linked
- Prisma migration failed → Run manually in Railway CLI
- Build fails → Check Node version (Railway uses Node 18+)

### Frontend won't deploy
**Check logs** in deployments tab.

**Common issues:**
- `NUXT_PUBLIC_API_BASE` not set correctly
- Build timeout → Increase timeout in Settings
- Missing dependencies → Check package.json

### CORS errors
→ Make sure `FRONTEND_URL` in backend matches your actual frontend URL exactly (including `https://`)

### Magic links not working
→ Check `RESEND_API_KEY` is valid
→ Check logs for email sending errors
→ Verify email isn't in spam folder

### Database connection fails
→ Check `DATABASE_URL` references `${{Postgres.DATABASE_URL}}`
→ Make sure PostgreSQL service is running
→ Check logs for connection errors

### Can't run migrations
Install Railway CLI:
```bash
npm install -g @railway/cli
railway login
railway link  # Select your project
railway run npx prisma migrate deploy
```

---

## Updating Your Deployment

### Push Changes
```bash
git add .
git commit -m "Your changes"
git push
```

Railway automatically detects the push and redeploys! 🚀

### Rollback
1. Go to service → **"Deployments"**
2. Find the previous successful deployment
3. Click **"⋯"** → **"Redeploy"**

---

## Next Steps

✅ **You're live in production!**

Optional enhancements:
1. Set up custom domains (Step 6)
2. Configure monitoring/alerting
3. Add CI/CD with GitHub Actions
4. Set up database backups (automatic in Railway)
5. Add analytics
6. Set up error tracking (Sentry)

---

## Useful Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# View logs
railway logs

# Run command in Railway environment
railway run <command>

# Open dashboard
railway open

# Deploy manually (if not auto-deploying)
railway up
```

---

## Need Help?

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Railway Status:** https://status.railway.app

**Congratulations! You're now running in production on Railway! 🎉**

