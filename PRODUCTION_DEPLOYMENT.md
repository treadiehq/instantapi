# Production Deployment Guide

Complete step-by-step guide to deploy Instant API to production.

**Stack:**
- 🔒 **Resend** - Email service for magic links
- 🗄️ **PlanetScale** - MySQL database
- ⚡ **Cloudflare Workers** - Sandbox execution
- 🚂 **Railway** - Backend & Frontend hosting

**Estimated Time:** 45 minutes  
**Monthly Cost:** ~$5-15

---

## Prerequisites

- [ ] GitHub account (for Railway deployment)
- [ ] Cloudflare account
- [ ] Credit card (for Cloudflare Workers paid plan)

---

## Part 1: Set Up PlanetScale Database (10 mins)

### Step 1.1: Create PlanetScale Account
1. Go to https://planetscale.com
2. Click **"Sign up"**
3. Sign in with GitHub or email
4. Verify your email if needed

### Step 1.2: Create Database
1. Click **"Create database"**
2. Name: `instantapi-prod` (or your choice)
3. Region: Choose closest to your users (e.g., `us-east-1`)
4. Plan: Select **"Hobby" (Free)** or **"Scaler Pro"** if needed
5. Click **"Create database"**
6. Wait ~30 seconds for provisioning

### Step 1.3: Get Connection String
1. In your database dashboard, click **"Connect"**
2. Select **"Prisma"** from the framework dropdown
3. **IMPORTANT:** Click **"New password"** to generate a password
4. Copy the connection string that looks like:
   ```
   mysql://xxxxxxxx:pscale_pw_xxxxxxxx@aws.connect.psdb.cloud/instantapi-prod?sslaccept=strict
   ```
5. **Save this securely** - you'll need it for Railway

### Step 1.4: Note About PlanetScale
⚠️ **Important:** PlanetScale uses MySQL, but your schema is PostgreSQL. We need to update the Prisma schema:

**Option A: Stay with PostgreSQL on Railway**
- Railway offers free PostgreSQL (easier, recommended)
- Skip PlanetScale and use Railway's built-in database
- Jump to [Part 4A](#part-4a-railway-with-postgresql-recommended)

**Option B: Migrate to MySQL for PlanetScale**
- Requires schema changes and migration
- See [Part 1.5](#step-15-migrate-to-mysql-optional)

### Step 1.5: Migrate to MySQL (Optional)
If you want to use PlanetScale, update `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"  // Changed from postgresql
  url      = env("DATABASE_URL")
  relationMode = "prisma"  // Required for PlanetScale
}

// Add @@index for all @relation fields
model User {
  // ... existing fields
  @@index([organizationId])  // Already exists, keep it
}

model Endpoint {
  // ... existing fields
  @@index([organizationId])  // Already exists, keep it
}

// etc. Check each model for relation indexes
```

Then run:
```bash
cd backend
npx prisma generate
```

⚠️ **Recommendation:** For simplicity, use Railway's PostgreSQL instead (Part 4A).

---

## Part 2: Set Up Resend for Email (5 mins)

### Step 2.1: Create Resend Account
1. Go to https://resend.com
2. Click **"Sign up"** or **"Start for free"**
3. Sign up with email or GitHub
4. Verify your email

### Step 2.2: Generate API Key
1. In Resend dashboard, click **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. Name: `instantapi-production`
4. Permission: **"Sending access"** (default)
5. Click **"Create"**
6. **Copy the API key** - it starts with `re_`
7. **Save it securely** - you can't see it again!

### Step 2.3: Verify Domain (Optional but Recommended)
For production, you should send from your own domain instead of `onboarding@resend.dev`:

1. In Resend dashboard, click **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records shown to your domain provider:
   - SPF record
   - DKIM records (2-3 records)
   - DMARC record (optional)
5. Wait for verification (5-30 minutes)
6. Your verified domain will show ✅ green

**For testing:** You can skip this and use `onboarding@resend.dev` (limited to 1 email per day per recipient)

**For production:** Verify your domain to send unlimited emails.

### Step 2.4: Note Your Email
Choose your sender email:
- **Without custom domain:** `onboarding@resend.dev` (testing only)
- **With custom domain:** `noreply@yourdomain.com`

Save this for the Railway configuration.

---

## Part 3: Deploy Cloudflare Sandbox Worker (10 mins)

### Step 3.1: Install Wrangler CLI
```bash
npm install -g wrangler
```

### Step 3.2: Login to Cloudflare
```bash
wrangler login
```
This opens your browser to authenticate. Click **"Allow"**.

### Step 3.3: Upgrade to Workers Paid Plan
⚠️ **Required:** Cloudflare Sandbox binding requires the Workers Paid plan ($5/month).

1. Go to https://dash.cloudflare.com
2. Click **"Workers & Pages"** in the left sidebar
3. Click **"Plans"** tab
4. Click **"Upgrade to Paid"**
5. Select **"Workers Paid"** ($5/month)
6. Enter payment details
7. Confirm upgrade

### Step 3.4: Deploy Sandbox Worker
```bash
cd sandbox-worker
npm install
npm run deploy
```

You'll see output like:
```
✅ Successfully published your script to
   https://instant-api-sandbox.YOUR-SUBDOMAIN.workers.dev
```

### Step 3.5: Save Worker URL
**Copy and save this URL!** You'll need it for Railway.

Example: `https://instant-api-sandbox.myaccount.workers.dev`

### Step 3.6: Test the Worker
```bash
curl https://instant-api-sandbox.YOUR-SUBDOMAIN.workers.dev/health
```

You should see a health check response.

---

## Part 4A: Deploy to Railway with PostgreSQL (Recommended - 15 mins)

### Step 4.1: Create Railway Account
1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Login with GitHub
4. Authorize Railway

### Step 4.2: Create New Project
1. Click **"New Project"**
2. Select **"Provision PostgreSQL"**
3. Railway creates a PostgreSQL database

### Step 4.3: Get Database Connection String
1. Click on the **PostgreSQL** service
2. Go to **"Variables"** tab
3. Find `DATABASE_URL` and copy the value
4. It looks like: `postgresql://postgres:xxxx@hostname.railway.app:5432/railway`

### Step 4.4: Deploy Backend
1. In Railway dashboard, click **"New"** → **"GitHub Repo"**
2. Select your `instantapi` repository
3. Railway will detect the monorepo

#### Configure Backend Service:
1. **Root Directory:** `/backend`
2. **Build Command:** `npm install && npx prisma generate && npm run build`
3. **Start Command:** `npm run start:prod`
4. **Port:** Railway auto-detects (uses `$PORT`)

#### Set Environment Variables:
Click on the backend service → **"Variables"** → **"New Variable"**

Add these one by one:

```bash
# Database (already exists from PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Cloudflare Sandbox (from Part 3)
CLOUDFLARE_SANDBOX_URL=https://instant-api-sandbox.YOUR-SUBDOMAIN.workers.dev

# Server
PORT=3001
NODE_ENV=production

# Generate this JWT secret
JWT_SECRET=<generate-with-command-below>

# Email (from Part 2)
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```
Copy the output and use it for `JWT_SECRET`.

### Step 4.5: Run Database Migrations
1. In Railway backend service, click **"Settings"**
2. Scroll to **"Deploy"**
3. Click **"Open Terminal"** (or use Railway CLI)

Run:
```bash
npx prisma migrate deploy
```

**Alternative via Railway CLI:**
```bash
npm install -g @railway/cli
railway login
railway link
railway run npx prisma migrate deploy
```

### Step 4.6: Get Backend URL
1. Click on your backend service
2. Go to **"Settings"** → **"Networking"**
3. Click **"Generate Domain"**
4. Railway generates a URL like: `https://your-app-production.up.railway.app`
5. **Save this URL!**

### Step 4.7: Update Backend Environment
Add two more variables:

```bash
BACKEND_URL=https://your-app-production.up.railway.app
FRONTEND_URL=https://your-frontend-production.up.railway.app
```
(We'll get the frontend URL in the next step)

---

## Part 5: Deploy Frontend to Railway (10 mins)

### Step 5.1: Update Frontend Config
Update `frontend/nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://your-backend-production.up.railway.app',
  },
}
```

### Step 5.2: Deploy Frontend on Railway
1. In Railway dashboard, click **"New"** → **"GitHub Repo"**
2. Select the same `instantapi` repository
3. Configure:
   - **Root Directory:** `/frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node .output/server/index.mjs`

#### Set Environment Variables:
```bash
NUXT_PUBLIC_API_BASE=https://your-backend-production.up.railway.app
NODE_ENV=production
```

### Step 5.3: Generate Frontend Domain
1. Click on frontend service
2. Go to **"Settings"** → **"Networking"**
3. Click **"Generate Domain"**
4. Railway generates: `https://your-frontend-production.up.railway.app`
5. **Copy this URL!**

### Step 5.4: Update Backend CORS
Go back to your backend service and update the `FRONTEND_URL` variable:

```bash
FRONTEND_URL=https://your-frontend-production.up.railway.app
```

Railway will automatically redeploy the backend.

---

## Part 6: Test Your Deployment (5 mins)

### Step 6.1: Open Frontend
1. Visit your frontend URL: `https://your-frontend-production.up.railway.app`
2. You should see the Instant API homepage

### Step 6.2: Test Sign Up
1. Click **"Sign up"**
2. Enter your email
3. Check your email for the magic link (sent via Resend)
4. Click the magic link
5. You should be logged in

### Step 6.3: Create a Test API
1. Paste this code:
```javascript
function handler(input) {
  return { 
    message: `Hello, ${input.name || 'World'}!`,
    timestamp: new Date().toISOString()
  };
}
```
2. Click **"Create API"**
3. Copy the endpoint URL
4. Test it:
```bash
curl -X POST https://your-backend-production.up.railway.app/run/abc123 \
  -H "Content-Type: application/json" \
  -d '{"name": "Production"}'
```

### Step 6.4: Test Tunnel Mode
```bash
# On your local machine
cd cli
npm run build
node dist/index.js expose http://localhost:3000
```

---

## Part 7: Custom Domains (Optional)

### Step 7.1: Add Custom Domain to Railway

**For Backend:**
1. Go to backend service → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Enter: `api.yourdomain.com`
4. Add the CNAME record to your DNS:
   ```
   CNAME api.yourdomain.com → your-app-production.up.railway.app
   ```
5. Wait for SSL certificate (automatic, ~5 minutes)

**For Frontend:**
1. Go to frontend service → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Enter: `app.yourdomain.com` (or just `yourdomain.com`)
4. Add the CNAME record:
   ```
   CNAME app.yourdomain.com → your-frontend-production.up.railway.app
   ```

### Step 7.2: Update Environment Variables
After custom domains are active, update:

**Backend:**
```bash
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://app.yourdomain.com
```

**Frontend:**
```bash
NUXT_PUBLIC_API_BASE=https://api.yourdomain.com
```

Railway will redeploy automatically.

---

## Costs Breakdown

| Service | Plan | Cost |
|---------|------|------|
| **Cloudflare Workers** | Paid ($5/mo) | **$5/month** |
| **PlanetScale** | Hobby (Free) or Scaler Pro | **$0** or **$39/month** |
| **Railway** | Hobby ($5/mo) + usage | **$5-20/month** |
| **Resend** | Free tier (3K emails/mo) | **$0** |
| **Total** | | **$10-64/month** |

**Recommended starter:**
- Railway PostgreSQL (free 500hrs/mo): **$5 Cloudflare only**
- Upgrade later when you need more resources

---

## Security Checklist

Before going live, verify:

- [ ] Strong `JWT_SECRET` (32+ characters, randomly generated)
- [ ] `RESEND_API_KEY` is set and valid
- [ ] Custom domain uses HTTPS (Railway provides SSL automatically)
- [ ] `FRONTEND_URL` matches your actual frontend domain
- [ ] `BACKEND_URL` matches your actual backend domain
- [ ] CORS allows only your frontend domain
- [ ] Database backups enabled (Railway auto-backups)
- [ ] Test magic link email flow end-to-end
- [ ] Test API creation and execution
- [ ] Test tunnel/expose mode with CLI

---

## Troubleshooting

### "Sandbox binding not found"
→ You're not on Cloudflare Workers Paid plan. Upgrade at https://dash.cloudflare.com

### CORS errors in browser console
→ Check `FRONTEND_URL` matches your frontend domain exactly (including https://)

### Magic links not sending
→ Check `RESEND_API_KEY` is correct. Test in Resend dashboard: API Keys → Test

### Database connection errors
→ Verify `DATABASE_URL` is set correctly. Run `railway run npx prisma migrate deploy`

### Railway build fails
→ Check root directory is correct (`/backend` or `/frontend`)
→ Verify build command includes `npx prisma generate` for backend

### Endpoint execution times out
→ Check `CLOUDFLARE_SANDBOX_URL` is correct and accessible

### CLI can't connect
→ Make sure API key is generated in the dashboard and starts with `ik_`

---

## Maintenance

### Monitor Your Services
1. **Railway:** Dashboard shows CPU, memory, and error logs
2. **Cloudflare:** Workers dashboard shows request count and errors
3. **Resend:** Dashboard shows email delivery stats
4. **PlanetScale/PostgreSQL:** Monitor query performance

### Regular Tasks
- **Weekly:** Check error logs in Railway
- **Monthly:** Review usage and costs
- **Quarterly:** Update dependencies
  ```bash
  npm outdated
  npm update
  ```

### Scaling
When you outgrow free tiers:
- **Railway:** Upgrade to Pro ($20/mo) for more resources
- **PlanetScale:** Upgrade to Scaler Pro ($39/mo) for more storage/queries
- **Resend:** Upgrade to Pro ($20/mo) for 50K emails/month

---

## Need Help?

- **Railway:** https://help.railway.app
- **Cloudflare Workers:** https://developers.cloudflare.com/workers
- **PlanetScale:** https://planetscale.com/docs
- **Resend:** https://resend.com/docs

---

## Next Steps

1. ✅ Set up monitoring (optional): Sentry, LogRocket, UptimeRobot
2. ✅ Configure custom domains for professional URLs
3. ✅ Set up GitHub Actions for automated deployments
4. ✅ Create a status page for users
5. ✅ Set up analytics (optional): Plausible, Fathom

**Congratulations! Your Instant API is now live in production! 🎉**
