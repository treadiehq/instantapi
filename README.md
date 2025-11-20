# Instant API

Turn code into APIs instantly. Write JavaScript or Python, get a working API endpoint.

## What is it?

Create APIs in seconds without setting up servers, deploying code, or writing configuration files.

**Two ways to create APIs:**

1. **Code Snippet** - Paste JS/Python code → Get instant API endpoint
2. **Framework** - Expose your local dev server (like ngrok)

## Quick Start

```bash
# Clone and install
git clone https://github.com/treadiehq/instantapi.git
cd instantapi
npm install

# Setup backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev

# Setup frontend
cd ../frontend
npm install

# Start everything (from root)
npm run dev
```

Open **http://localhost:3000** 🚀

## How to Use

### 1. Create an API (No signup needed)

Visit **http://localhost:3000** and paste your code:

**JavaScript Example:**
```javascript
function handler(input) {
  return { 
    message: `Hello ${input.name}!`,
    sum: input.a + input.b 
  };
}
```

**Python Example:**
```python
def handler(input):
    return {
        'message': f"Hello {input['name']}!",
        'sum': input['a'] + input['b']
    }
```

Click "Create API" → You get a unique endpoint like:
```
https://your-api.com/run/abc123xyz
```

### 2. Call Your API

```bash
curl -X POST https://your-api.com/run/abc123xyz \
  -H "Content-Type: application/json" \
  -d '{"name": "World", "a": 5, "b": 3}'

# Response:
# {"message": "Hello World!", "sum": 8}
```

### 3. Framework Mode (Expose Local Server)

Expose your local development server to the internet:

```bash
# Your local server running on localhost:3000
npm start

# Expose it (coming soon)
npx instant-api expose http://localhost:3000
```

## Authentication

**Optional** - Create APIs instantly without signing up.

**Sign up for:**
- Manage and edit your APIs
- View API analytics
- Longer API lifetimes (up to 30 days)
- Premium features (coming soon)

**How to sign up:**
1. Visit the app and click "Sign Up"
2. Enter your email
3. Check your inbox for a magic link (no password needed!)
4. Click the link and you're in

## Features

**Supported Languages:**
- JavaScript (Node.js)
- Python 3

**What you can do:**
- ✅ Create APIs without signup
- ✅ Secure code execution (isolated containers)
- ✅ Handle JSON input/output
- ✅ Return any data structure
- ✅ Access request headers (webhook mode)
- ✅ Quick testing with built-in playground

**Current Limits:**
- Free tier: APIs active for 24 hours
- Signed-in users: APIs active for up to 30 days
- Max code size: 64KB
- Execution timeout: 30 seconds

## Local Development Setup

**Backend** - Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/instantapi"
CLOUDFLARE_SANDBOX_URL="https://instant-api-sandbox.onboardbase.workers.dev"
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="your-secret-key-change-in-production"
NODE_ENV="development"
PORT="3001"

# Optional: For production email (uses console in dev)
RESEND_API_KEY=""
EMAIL_FROM="noreply@instantapi.com"
```

**Frontend** - Create `frontend/.env`:
```env
NUXT_PUBLIC_API_BASE="http://localhost:3001"
```

**Database Setup:**
```bash
# Install PostgreSQL if you don't have it
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Start PostgreSQL and create database
createdb instantapi

# Run migrations
cd backend
npx prisma migrate dev
```

## Production Deployment

The app is production-ready and can be deployed to:
- **Frontend & Backend**: Railway, Vercel, or any Node.js host
- **Code Execution**: Cloudflare Workers with Sandbox SDK
- **Database**: PostgreSQL (Railway, Supabase, etc.)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed deployment instructions.

## Troubleshooting

**Backend won't start:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Database connection issues:**
- Make sure PostgreSQL is running: `psql -U postgres`
- Check your `DATABASE_URL` in `backend/.env`
- Create the database: `createdb instantapi`

**Frontend won't load:**
- Check `NUXT_PUBLIC_API_BASE` in `frontend/.env`
- Make sure backend is running on the correct port
- Clear Nuxt cache: `rm -rf frontend/.nuxt`

**Check if services are running:**
```bash
curl http://localhost:3001/health  # Backend
curl http://localhost:3000  # Frontend
```

## Tech Stack

- **Frontend**: Nuxt 3, Vue 3, TailwindCSS
- **Backend**: NestJS, Prisma, PostgreSQL
- **Code Execution**: Cloudflare Workers with Sandbox SDK
- **Auth**: Magic link (passwordless)

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide

---

## License

FSL-1.1-MIT - See [LICENSE](LICENSE)

