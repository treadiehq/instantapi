# Deployment Guide

Deploy Instant API to production in about 20 minutes.

## What You'll Need

- GitHub account
- Railway account (free to start - https://railway.app)
- Cloudflare account with Workers Paid plan ($5/month)
- Your code pushed to GitHub

---

## Part 1: Deploy Cloudflare Sandbox Worker (5 mins)

The sandbox worker executes user code safely.

### 1. Install Wrangler & Login

```bash
npm install -g wrangler
wrangler login
```

### 2. Upgrade to Workers Paid Plan

Go to https://dash.cloudflare.com:
1. Click **"Workers & Pages"**
2. Click **"Plans"** → **"Upgrade to Paid"** ($5/month)
3. Complete payment

### 3. Deploy Sandbox Worker

```bash
cd sandbox-worker
npm install
npx wrangler deploy
```

Save the URL you get (like `https://instant-api-sandbox.YOUR-NAME.workers.dev`).

**Wait 2-3 minutes** after first deployment for containers to provision.

### 4. Test It

```bash
curl https://instant-api-sandbox.YOUR-NAME.workers.dev/run
# Should return: {"output":"4","error":"","exitCode":0,"success":true}
```

✅ **Sandbox deployed!** Now let's deploy the app.

---

## Part 2: Deploy to Railway (15 mins)

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push
```

### 2. Create Railway Project

1. Go to https://railway.app and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `instantapi` repository

### 3. Add Database

1. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway creates the database automatically

### 4. Configure Backend Service

**Set Root Directory:**
1. Click on your main service
2. Go to **"Settings"**
3. Set **Root Directory**: `backend`
4. Set **Watch Paths**: `backend/**`

**Add Environment Variables:**

Click **"Variables"** tab:

```bash
# Database (auto-linked)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Cloudflare Sandbox (from Part 1)
CLOUDFLARE_SANDBOX_URL=https://instant-api-sandbox.YOUR-NAME.workers.dev

# Server Config
PORT=3001
NODE_ENV=production

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=<paste-generated-secret-here>

# Email (get free key from resend.com)
RESEND_API_KEY=re_<your-key>
EMAIL_FROM=onboarding@yourcompany.com

# URLs (update after deployment)
BACKEND_URL=https://placeholder.railway.app
FRONTEND_URL=https://placeholder.railway.app
```

**Generate Domain:**
1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the URL (like `https://instantapi-backend-xxx.railway.app`)
4. Update `BACKEND_URL` with this URL

Wait for deployment to finish (~2 minutes).

**Test Backend:**
```bash
curl https://instantapi-backend-xxx.railway.app/health
# Should return health check response
```

### 5. Configure Frontend Service

**Add Another Service:**
1. Click **"New"** → **"GitHub Repo"**
2. Select the same `instantapi` repo
3. This creates a second service

**Set Root Directory:**
1. Click the new service → **"Settings"**
2. Set **Root Directory**: `frontend`
3. Set **Watch Paths**: `frontend/**`

**Add Environment Variables:**

Click **"Variables"** tab:

```bash
# Backend API URL (from step 4)
NUXT_PUBLIC_API_BASE=https://instantapi-backend-xxx.railway.app

NODE_ENV=production
```

**Generate Domain:**
1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the frontend URL

**Update Backend Variables:**

Go back to backend service → **"Variables"** and update:

```bash
FRONTEND_URL=https://instantapi-frontend-xxx.railway.app
```

### 6. Test Everything

Visit your frontend URL. You should see the Instant API homepage!

**Test API Creation:**
1. Paste this code:
```javascript
function handler(input) {
  return { message: `Hello ${input.name}!` };
}
```
2. Click "Create API"
3. Test the endpoint:
```bash
curl -X POST https://instantapi-backend-xxx.railway.app/run/YOUR-ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Production"}'
```

---

## Custom Domains (Optional)

### Backend Domain

1. Backend service → **"Settings"** → **"Networking"** → **"Custom Domain"**
2. Enter `api.yourdomain.com`
3. Add CNAME to your DNS:
   ```
   Type: CNAME
   Name: api
   Value: <your-railway-backend-url>
   ```

### Frontend Domain

1. Frontend service → **"Settings"** → **"Networking"** → **"Custom Domain"**
2. Enter `yourdomain.com` or `app.yourdomain.com`
3. Add CNAME to your DNS

**Update environment variables** with new domains after DNS propagates.

---

## Costs

**Railway:**
- Free tier: $5 credit/month (good for testing)
- Hobby: $5/month (personal projects)
- Pro: $20/month (production apps)

**Cloudflare:**
- Workers Paid: $5/month (required)

**Total:** $5-10/month to start

---

## Troubleshooting

**Backend won't deploy:**
- Check logs: Service → **"Deployments"** → **"View Logs"**
- Verify `DATABASE_URL` is set
- Check Prisma migrations ran

**Frontend shows errors:**
- Verify `NUXT_PUBLIC_API_BASE` matches backend URL
- Check backend is running
- Clear cache and redeploy

**CORS errors:**
- Ensure `FRONTEND_URL` in backend matches frontend domain exactly

**Magic links not working:**
- Verify `RESEND_API_KEY` is valid
- Check email isn't in spam

**Database issues:**
- Ensure PostgreSQL service is running
- Verify `DATABASE_URL` references `${{Postgres.DATABASE_URL}}`

---

## Updating

Just push to GitHub:

```bash
git add .
git commit -m "Update"
git push
```

Railway auto-deploys! 🚀

---

## Rollback

1. Go to service → **"Deployments"**
2. Find previous successful deployment
3. Click **"⋯"** → **"Redeploy"**

---

## Monitoring

**View Logs:**
- Service → **"Deployments"** → Click deployment → **"View Logs"**

**Metrics:**
- Service → **"Metrics"** tab for CPU/Memory/Network

**Alerts:**
- Service → **"Settings"** → **"Alerts"** to get notified of issues

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Cloudflare Docs: https://developers.cloudflare.com/sandbox/

**Congratulations! You're live in production! 🎉**
