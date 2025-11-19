# Deploy to Production

Get Instant API running live in ~30 minutes.

## What You Need

- Cloudflare account with Workers Paid plan ($5/month)
- PostgreSQL database (Neon, Supabase, or Railway)
- Email service for magic links (Resend - free tier works)

## Step 1: Deploy Sandbox Worker

```bash
# Install and login to Cloudflare
npm install -g wrangler
wrangler login

# Deploy
cd sandbox-worker
npm run deploy
```

You'll get a URL like: `https://instant-api-sandbox.YOUR_SUBDOMAIN.workers.dev`

**Save this URL** - you need it for backend config.

## Step 2: Set Up Database

Pick a PostgreSQL provider (all have free tiers):

- **Neon** - https://neon.tech ✅ Recommended
- **Supabase** - https://supabase.com
- **Railway** - https://railway.app

Create a database and save the connection string:
```
postgresql://user:password@host:5432/dbname?schema=public
```

## Step 3: Deploy Backend

**Recommended:** Railway (https://railway.app) - easiest setup.

**Set these environment variables:**

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public

# Cloudflare Sandbox
CLOUDFLARE_SANDBOX_URL=https://instant-api-sandbox.YOUR_SUBDOMAIN.workers.dev

# Server
PORT=3001
NODE_ENV=production
BACKEND_URL=https://your-backend-url.railway.app

# Authentication
JWT_SECRET=your-secure-random-string-here  # Generate with: openssl rand -base64 32
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Email (for magic links)
RESEND_API_KEY=re_your_resend_api_key  # Get from https://resend.com
EMAIL_FROM=noreply@yourdomain.com
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

**Run migrations:**
```bash
cd backend
npx prisma migrate deploy
```

**Deploy on Railway:**
```bash
npm install -g railway
railway login
railway init
railway up
```

Save your backend URL (e.g., `https://your-app.railway.app`)

## Step 4: Deploy Frontend

**Update `frontend/nuxt.config.ts`:**
```typescript
runtimeConfig: {
  public: {
    apiBase: 'https://your-backend-url.railway.app',
  },
}
```

**Deploy to Vercel:**
```bash
npm install -g vercel
vercel login
cd frontend
vercel
```

## Step 5: Configure CORS

Update `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: ['https://your-frontend.vercel.app'],
  credentials: true,
});
```

Redeploy backend.

## Step 6: Set Up Email (Resend)

1. Sign up at https://resend.com (free tier works)
2. Generate an API key
3. Add to backend: `RESEND_API_KEY=re_xxx`
4. For custom domain: Add DNS records from Resend dashboard

That's it! Magic links will now send via email.

## Step 7: Test Everything

1. **Sign up** → Check email → Click magic link ✅
2. **Create API** → Copy URL → Test with curl ✅
3. **Generate API key** → Use with CLI ✅
4. **Check dashboard** → See all your APIs ✅

Done! 🎉

## Monthly Costs

- **Cloudflare Workers**: $5/month (required)
- **Database**: $0 (Neon/Supabase free tier)
- **Backend**: $0-5 (Railway/Render free or paid)
- **Frontend**: $0 (Vercel/Netlify free tier)
- **Email**: $0 (Resend free tier: 3,000/month)

**Total: $5-10/month** 🎯

## Security Checklist

Before launching:

- [ ] Strong `JWT_SECRET` (32+ chars)
- [ ] HTTPS enabled everywhere
- [ ] Resend API key configured
- [ ] CORS set to your frontend domain
- [ ] Database backups enabled
- [ ] Test magic link flow
- [ ] Test API key generation

## Optional: Monitoring

Add these if you need them:
- **Sentry** - Error tracking
- **UptimeRobot** - Uptime monitoring
- **Cloudflare Analytics** - Built-in metrics

## Common Issues

**"Sandbox binding not found"**
→ Check you're on Workers Paid plan, redeploy worker

**CORS errors**
→ Update frontend domain in `backend/src/main.ts`

**Magic links not sending**
→ Check `RESEND_API_KEY` is set correctly

**Database connection errors**
→ Verify `DATABASE_URL` and run migrations

## Maintenance

Instant API is mostly self-managing. Optional tasks:
- Set up a cron to clean expired endpoints (`/api/cleanup`)
- Check error logs occasionally
- Update dependencies quarterly

---

That's it! You're live. 🚀

