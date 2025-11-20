# Railway Deployment Checklist

Use this checklist to track your deployment progress.

## Before You Start
- [ ] Code is working locally
- [ ] All changes committed to git
- [ ] Have GitHub account
- [ ] Have credit card ready (for Cloudflare Workers)

---

## Phase 1: Cloudflare Worker (5 mins)

- [ ] Install Wrangler: `npm install -g wrangler`
- [ ] Login: `wrangler login`
- [ ] Upgrade to Workers Paid plan ($5/month) at https://dash.cloudflare.com
- [ ] Deploy worker: `cd sandbox-worker && npm run deploy`
- [ ] Copy worker URL: `https://instant-api-sandbox._______.workers.dev`
- [ ] Test: `curl https://your-worker-url/health`

**Worker URL:** `_________________________________`

---

## Phase 2: Resend Setup (3 mins)

- [ ] Create account at https://resend.com
- [ ] Verify email
- [ ] Create API Key (name: `instantapi-prod`)
- [ ] Copy API key (starts with `re_`)
- [ ] (Optional) Verify custom domain for production emails

**Resend API Key:** `re_________________________`
**Email From:** `_________________________________`

---

## Phase 3: Push to GitHub (2 mins)

- [ ] Create GitHub repo (if not exists)
- [ ] Push code: `git push -u origin main`
- [ ] Verify code is on GitHub

**GitHub Repo:** `https://github.com/________/________`

---

## Phase 4: Generate Secrets (1 min)

- [ ] Generate JWT Secret: `openssl rand -base64 32`
- [ ] Copy the output

**JWT Secret:** `_________________________________`

---

## Phase 5: Railway Backend (5 mins)

- [ ] Sign up at https://railway.app with GitHub
- [ ] Create new project → "Deploy from GitHub repo"
- [ ] Select your `instantapi` repository
- [ ] Add PostgreSQL service
- [ ] Configure backend service:
  - [ ] Root Directory: `/backend`
  - [ ] Watch Paths: `/backend/**`
- [ ] Add environment variables (see below)
- [ ] Generate domain for backend
- [ ] Wait for deployment to succeed
- [ ] Test: `curl https://your-backend-url/health`

**Backend URL:** `_________________________________`

### Environment Variables for Backend:
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
CLOUDFLARE_SANDBOX_URL=<your-worker-url>
PORT=3001
NODE_ENV=production
JWT_SECRET=<generated-secret>
RESEND_API_KEY=<your-resend-key>
EMAIL_FROM=<your-email>
BACKEND_URL=<your-backend-url>
FRONTEND_URL=<will-add-later>
```

---

## Phase 6: Railway Frontend (5 mins)

- [ ] In Railway project, click "New" → "GitHub Repo"
- [ ] Select same `instantapi` repository
- [ ] Configure frontend service:
  - [ ] Root Directory: `/frontend`
  - [ ] Watch Paths: `/frontend/**`
- [ ] Add environment variables (see below)
- [ ] Generate domain for frontend
- [ ] Wait for deployment to succeed
- [ ] Open frontend URL in browser

**Frontend URL:** `_________________________________`

### Environment Variables for Frontend:
```bash
NUXT_PUBLIC_API_BASE=<your-backend-url>
NODE_ENV=production
```

---

## Phase 7: Update Backend CORS (1 min)

- [ ] Go to backend service → Variables
- [ ] Update `FRONTEND_URL=<your-frontend-url>`
- [ ] Wait for automatic redeploy

---

## Phase 8: Test Everything (5 mins)

- [ ] Visit frontend URL
- [ ] Sign up with your email
- [ ] Check email for magic link
- [ ] Click magic link
- [ ] Verify you're logged in
- [ ] Create a test API endpoint
- [ ] Test the API with curl
- [ ] Try the tunnel/expose feature

---

## Phase 9: Optional - Custom Domains

### Backend (api.yourdomain.com)
- [ ] Add custom domain in Railway backend settings
- [ ] Add CNAME record to DNS:
  ```
  CNAME api → your-backend-railway-url
  ```
- [ ] Wait for SSL certificate (~5 min)
- [ ] Update `BACKEND_URL` environment variable

### Frontend (app.yourdomain.com)
- [ ] Add custom domain in Railway frontend settings
- [ ] Add CNAME record to DNS:
  ```
  CNAME app → your-frontend-railway-url
  ```
- [ ] Wait for SSL certificate (~5 min)
- [ ] Update `FRONTEND_URL` in backend
- [ ] Update `NUXT_PUBLIC_API_BASE` in frontend

---

## Final Checklist

- [ ] Backend is accessible
- [ ] Frontend is accessible
- [ ] Sign up/login works
- [ ] Magic links are being sent
- [ ] API creation works
- [ ] API execution works
- [ ] Tunnel/expose mode works
- [ ] No CORS errors
- [ ] All services showing "Success" in Railway

---

## Quick Reference

| Service | URL | Status |
|---------|-----|--------|
| **Cloudflare Worker** | `___________________` | ⬜ |
| **Backend** | `___________________` | ⬜ |
| **Frontend** | `___________________` | ⬜ |
| **Database** | (in Railway) | ⬜ |

---

## Troubleshooting

### If backend won't deploy:
1. Check logs in Railway
2. Verify `DATABASE_URL` is set
3. Check PostgreSQL service is running
4. Try: `railway run npx prisma migrate deploy`

### If frontend won't deploy:
1. Check logs in Railway
2. Verify `NUXT_PUBLIC_API_BASE` is set correctly
3. Check build command is running

### If magic links don't work:
1. Check `RESEND_API_KEY` is correct
2. Check backend logs for email errors
3. Check spam folder

### If getting CORS errors:
1. Verify `FRONTEND_URL` in backend matches frontend domain exactly
2. Must include `https://`
3. Redeploy backend after changing

---

## Support Resources

- **Railway Docs:** https://docs.railway.app
- **Cloudflare Workers:** https://developers.cloudflare.com/workers
- **Resend Docs:** https://resend.com/docs
- **Railway Discord:** https://discord.gg/railway

---

**Good luck with your deployment! 🚀**

Print this checklist and check off items as you go!
