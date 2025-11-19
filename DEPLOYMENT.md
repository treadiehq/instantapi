# Production Deployment Guide

This guide covers deploying Instant API to production.

## Prerequisites

- Cloudflare account with **Workers Paid plan** ($5/month minimum)
- PostgreSQL database (hosted)
- Domain name (optional)

## Step 1: Deploy Sandbox Worker

The Cloudflare Sandbox SDK requires a Workers Paid plan.

### 1.1 Setup Wrangler

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 1.2 Deploy the Worker

```bash
cd sandbox-worker

# Deploy to production
npm run deploy
```

This will deploy your worker and give you a URL like:
`https://instant-api-sandbox.YOUR_SUBDOMAIN.workers.dev`

### 1.3 Note the Worker URL

Save this URL - you'll need it for the backend configuration.

## Step 2: Set Up Production Database

You need a PostgreSQL database. Options:

- **Neon** - https://neon.tech (free tier available)
- **Supabase** - https://supabase.com (free tier available)
- **Railway** - https://railway.app
- **AWS RDS** - https://aws.amazon.com/rds/
- **Digital Ocean** - https://www.digitalocean.com/products/managed-databases

Get your connection string in the format:
```
postgresql://user:password@host:5432/dbname?schema=public
```

## Step 3: Deploy Backend

### 3.1 Choose a Platform

Options for NestJS backend:
- **Railway** - https://railway.app (recommended, easy)
- **Heroku** - https://heroku.com
- **Render** - https://render.com
- **Fly.io** - https://fly.io
- **AWS/GCP/Azure** - Traditional cloud

### 3.2 Set Environment Variables

On your chosen platform, set:

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
CLOUDFLARE_SANDBOX_URL=https://instant-api-sandbox.YOUR_SUBDOMAIN.workers.dev
PORT=3001
NODE_ENV=production
```

### 3.3 Run Migrations

Before starting the backend, run:

```bash
cd backend
npx prisma migrate deploy
```

### 3.4 Deploy

Follow your platform's deployment instructions. For Railway:

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

Note your backend URL (e.g., `https://your-app.railway.app`)

## Step 4: Deploy Frontend

### 4.1 Update API Base URL

Edit `frontend/nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    apiBase: 'https://your-backend-url.railway.app',
  },
}
```

### 4.2 Choose a Platform

Options for Nuxt 3:
- **Vercel** - https://vercel.com (recommended)
- **Netlify** - https://netlify.com
- **Cloudflare Pages** - https://pages.cloudflare.com
- **Railway** - https://railway.app

### 4.3 Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel
```

Follow the prompts to deploy.

## Step 5: Configure CORS

Update `backend/src/main.ts` to allow your frontend domain:

```typescript
app.enableCors({
  origin: ['https://your-frontend-domain.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
});
```

Redeploy the backend after this change.

## Step 6: Test Production

1. Visit your frontend URL
2. Create a test endpoint
3. Verify it executes correctly
4. Test with both JavaScript and Python

## Cost Breakdown

### Minimum Monthly Cost: ~$5

- **Cloudflare Workers Paid**: $5/month
  - Includes Sandbox SDK access
  - 10 million requests included
  
- **Database**: $0-10/month
  - Neon/Supabase free tier works for MVP
  - Railway: $5/month
  
- **Backend Hosting**: $0-5/month
  - Railway: $5/month
  - Heroku free tier (limited)
  - Render: $0/month (free tier)
  
- **Frontend Hosting**: $0
  - Vercel free tier
  - Netlify free tier
  - Cloudflare Pages free tier

**Total**: $5-20/month depending on traffic and hosting choices

## Security Checklist

Before going live:

- [ ] Enable HTTPS on all services
- [ ] Add rate limiting (use Cloudflare or backend middleware)
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Add authentication if needed
- [ ] Review and update CORS settings
- [ ] Set appropriate resource limits
- [ ] Enable database backups
- [ ] Set up error tracking
- [ ] Add uptime monitoring
- [ ] Review Cloudflare Sandbox limits

## Monitoring

### Recommended Tools

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Cloudflare Analytics** - Worker metrics
- **UptimeRobot** - Uptime monitoring

### Key Metrics to Track

- Endpoint creation rate
- Execution success/failure rate
- Average execution time
- API error rates
- Database connection pool usage

## Scaling Considerations

### When to scale:

- **Database**: If you hit connection limits, consider:
  - Connection pooling (PgBouncer)
  - Read replicas
  - Upgrading to higher tier
  
- **Backend**: If response times increase:
  - Add more instances
  - Enable horizontal scaling
  - Add caching layer (Redis)
  
- **Sandbox Worker**: Cloudflare handles scaling automatically
  - Monitor usage vs. plan limits
  - Upgrade to higher Workers tier if needed

## Troubleshooting

### Sandbox Worker Issues

**Error: "Sandbox binding not found"**
- Ensure you're on Workers Paid plan
- Verify `wrangler.toml` has correct binding
- Redeploy with `npm run deploy`

**Error: "Rate limit exceeded"**
- Check Cloudflare dashboard for usage
- Consider upgrading plan
- Add request caching

### Database Connection Issues

**Error: "Too many connections"**
- Implement connection pooling
- Reduce `connection_limit` in Prisma
- Use PgBouncer

### CORS Errors

- Verify frontend domain in backend CORS config
- Check Cloudflare Worker CORS headers
- Ensure `https://` (not `http://`) in production

## Maintenance

### Regular Tasks

- **Weekly**: Check error logs
- **Monthly**: Review usage and costs
- **Quarterly**: Update dependencies
- **As needed**: Run cleanup for expired endpoints

### Cleanup Cron Job

Set up a cron job to clean expired endpoints:

```bash
# Hit cleanup endpoint every hour
0 * * * * curl -X POST https://your-backend/api/cleanup
```

Or use a service like:
- Cloudflare Workers Cron Triggers
- GitHub Actions scheduled workflows
- Railway Cron Jobs

## Support

- **Cloudflare Sandbox**: https://discord.cloudflare.com
- **Prisma**: https://www.prisma.io/docs/support
- **NestJS**: https://docs.nestjs.com
- **Nuxt**: https://nuxt.com/docs

---

**Ready for production?** Follow the steps above and you'll have a scalable, production-ready Instant API deployment! 🚀

