# Instant API

Turn code into APIs instantly. Write JavaScript or Python, get a working API endpoint.

## What is it?

Create APIs in seconds without setting up servers, deploying code, or writing configuration files.

**Three ways to create APIs:**

1. **Code Snippet** - Paste JS/Python code → Get instant API endpoint
2. **Framework Mode (CLI)** - Expose your local dev server (like ngrok)
3. **Function Mode (SDK)** - Write functions, get serverless APIs

## Live

Try the product live at **https://instantapi.co**

## Community & Support

Join our Discord community for discussions, support, and updates:

[![Discord](https://img.shields.io/badge/Discord-Join%20our%20community-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/KqdBcqRk5E)

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

Open **http://localhost:3000**

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

# Expose it via CLI
npx @instantapihq/cli expose http://localhost:3000/api

# You get a public URL instantly
# Public URL: http://localhost:3001/t/abc123
```

**Streaming Example (SSE):**
```javascript
// Your Express app with SSE endpoint
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  setInterval(() => {
    res.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`);
  }, 1000);
});

// Expose it
npx @instantapihq/cli expose http://localhost:3000/events

// Stream from public URL
curl -N http://localhost:3001/t/abc123
```

> **💡 Tip:** If your backend is running on a different port, configure the CLI:
> ```bash
> # Option 1: Use --backend flag
> npx @instantapihq/cli expose http://localhost:3000/api --backend http://localhost:PORT
> 
> # Option 2: Set environment variable
> export INSTANT_API_BACKEND_URL=http://localhost:PORT
> npx @instantapihq/cli expose http://localhost:3000/api
> ```

### 4. Function Mode (SDK)

Write functions and expose them as APIs:

```typescript
// app.ts
import { expose } from '@instantapihq/sdk';

expose('greet', (input) => {
  return { message: `Hello ${input.name}!` };
});

// Terminal 1: Run functions
node app.ts

// Terminal 2: Expose to internet
npx @instantapihq/cli expose greet
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
- ✅ Streaming support (SSE/Server-Sent Events)
- ✅ Expose local servers (ngrok-style tunnels)
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
CLOUDFLARE_SANDBOX_URL="https://instant-api-sandbox.YOUR-NAME.workers.dev"
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="your-secret-key-change-in-production"
NODE_ENV="development"
PORT="3001"

# Optional: For production email (uses console in dev)
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourcompany.com"
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

---

## License

See [FSL-1.1-MIT](LICENSE) for full details.