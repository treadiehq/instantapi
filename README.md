# Instant API

Turn code into APIs in seconds. No deployment, no servers, no hassle.

## What can you do?

### 1. Run Code as an API
Paste JavaScript or Python code, get a live API endpoint instantly.

```javascript
function handler(input) {
  return { message: `Hello ${input.name}!` };
}
```
→ `POST http://localhost:3001/run/abc123`

### 2. Expose Local APIs to the Internet
Already have a backend running? Share it instantly (like ngrok).

```bash
npx instant-api expose http://localhost:3000/api/users
# → Public URL: http://localhost:3001/t/xyz789
```

### 3. Stream Real-Time Events
Your local server streams? We'll proxy it live.

```javascript
// Your Express server with SSE
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  // Stream events...
});
```

### 4. Expose Single Functions
No server setup needed. Just write functions.

```javascript
import { expose } from '@instantapi/sdk';

expose('calculate', (input) => {
  return { result: input.a + input.b };
});
```

## Features

### Code Snippets
- ✅ JavaScript, TypeScript, Python
- ✅ Paste code or upload files
- ✅ 1 hour to 7 days lifespan
- ✅ Console logs & errors
- ✅ Call external APIs (`fetch`, `http_get`)
- ✅ Webhook mode (access headers)

### Framework Mode (ngrok-style)
- ✅ Expose any local HTTP endpoint
- ✅ Works with Express, NestJS, FastAPI, etc.
- ✅ No code changes needed
- ✅ Stable public URLs
- ✅ Real-time request forwarding

### Real-Time Streaming
- ✅ Server-Sent Events (SSE) support
- ✅ WebSocket fallback
- ✅ Live data streaming
- ✅ Perfect for AI responses, dashboards, chat

### Function Mode
- ✅ Serverless-style development
- ✅ Zero boilerplate
- ✅ Auto-detected by CLI
- ✅ TypeScript support

### Authentication & Dashboard
- ✅ Organization-based multi-tenancy
- ✅ Passwordless magic link authentication
- ✅ API key management for CLI/SDK
- ✅ Dashboard to view all your APIs
- ✅ Optional authentication (1hr limit without login)

## Quick Start

### Prerequisites
- Node.js 18+
- Docker (for Postgres)

### Installation

```bash
# Clone and install
git clone <repo-url>
cd instantapi
npm install && npm run install:all

# Start Postgres
npm run docker:up

# Setup database
npm run prisma:generate
npm run prisma:migrate

# Start everything
./start.sh
```

Open **http://localhost:3000**

## Usage Examples

### Example 1: Code Snippet

💡 **No authentication required** (1 hour limit - sign in for 24hr/7day options)

**In the UI:**
1. Paste your code
2. Click "Create an API"
3. Test it in the browser

**Via API:**
```bash
curl -X POST http://localhost:3001/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function handler(input) { return { sum: input.a + input.b }; }"
  }'

# Returns: { "id": "abc123", "url": "http://localhost:3001/run/abc123" }

# Test it
curl -X POST http://localhost:3001/run/abc123 \
  -H "Content-Type: application/json" \
  -d '{"a": 5, "b": 3}'

# Returns: { "result": { "sum": 8 } }
```

### Example 2: Expose Local API

💡 **No authentication required** (1 hour temporary tunnel - add API key for persistent tunnels)

**Start your backend:**
```bash
# Your Express/NestJS/FastAPI app running on :3000
npm start
```

**Expose it:**
```bash
cd cli
npm run build
node dist/index.js expose http://localhost:3000/api/users

# Output:
# ⚠️  No API key found. Tunnel will be temporary (1 hour limit).
# ✓ Tunnel registered!
# Public URL: http://localhost:3001/t/xyz789
# Target URL: http://localhost:3000/api/users
```

**Use it:**
```bash
curl -X POST http://localhost:3001/t/xyz789 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'

# Request forwarded to your local server!
```

### Example 3: Real-Time Streaming

💡 **No authentication required** (1 hour temporary tunnel)

**Your SSE endpoint:**
```javascript
app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  
  setInterval(() => {
    res.write(`data: ${JSON.stringify({ time: new Date() })}\n\n`);
  }, 1000);
});
```

**Expose it:**
```bash
node cli/dist/index.js expose http://localhost:3000/stream
```

**Connect:**
```bash
curl -N http://localhost:3001/t/xyz789
# Live stream of events! 🎉
```

### Example 4: Function Mode

⚠️ **Requires API Key** - Sign up and generate one in the dashboard

**Install SDK:**
```bash
npm install @instantapi/sdk
```

**Create functions.js:**
```javascript
import { expose } from '@instantapi/sdk';

expose('greet', (input) => {
  return { message: `Hello, ${input.name}!` };
});

expose('calculate', async (input) => {
  // Your logic here
  return { result: input.a + input.b };
});
```

**Set up authentication:**
```bash
# 1. Sign up at http://localhost:3000 and generate an API key
# 2. Set your API key
export INSTANT_API_KEY=ik_your_key_here
```

**Run & expose:**
```bash
# Terminal 1: Run your functions
node functions.js

# Terminal 2: Expose with CLI (API key required)
npx instant-api expose greet  # Auto-detected!

# Terminal 3: Test it
curl -X POST http://localhost:3001/t/xyz789 \
  -H "Content-Type: application/json" \
  -d '{"name": "World"}'
```

## Documentation

- **[packages/sdk/README.md](./packages/sdk/README.md)** - Function Mode SDK docs
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment

## Configuration

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/instantapi"
CLOUDFLARE_SANDBOX_URL="http://localhost:8787"
BACKEND_URL="http://localhost:3001"
JWT_SECRET="your-secret-key-here"
FRONTEND_URL="http://localhost:3000"
RESEND_API_KEY=""  # Optional: for production email (leave empty for local dev)
EMAIL_FROM="noreply@instantapi.com"
```

**Frontend (.env):**
```env
VITE_API_BASE="http://localhost:3001"
```

> **Note:** For local development, magic links are printed to the console. For production, set `RESEND_API_KEY` to send emails via [Resend](https://resend.com).

### Modes & Options

| Mode | Description | Authentication | Use Case |
|------|-------------|----------------|----------|
| **Snippet** | Run code in sandbox | Optional (1hr limit) | Quick APIs, prototypes |
| **File Upload** | Upload .js/.ts/.py | Required | Larger code files |
| **Webhook** | Access headers | Optional (1hr limit) | Stripe, Twilio webhooks |
| **Framework** | Proxy local server | Optional (1hr limit) | Share local dev server |
| **Streaming** | SSE/WebSocket | Optional (1hr limit) | Real-time dashboards |
| **Functions** | SDK-based | Required (API key) | Serverless-style dev |

### TTL (Time-to-Live)
- **1 hour** - Quick tests (no auth required)
- **24 hours** - Default (requires auth)
- **7 days** - Longer projects (requires auth)

## Security & Limitations

### Security
⚠️ **For development and testing only**

- **Authentication:** Optional for most features (1hr limit without auth)
- **Organizations:** Multi-tenant with data isolation
- **Magic Links:** Passwordless authentication via email
- **API Keys:** For CLI and SDK access
- **Endpoints:** Public URLs (consider adding custom auth in your code)
- **Sandbox:** Code runs in isolated Cloudflare Workers
- **Auto-expires:** All APIs have TTL to prevent abuse
- **Size limit:** 64KB code max

### Production Considerations
Recommended additions for production:
- Rate limiting per organization
- Endpoint access controls
- Input validation and sanitization
- Execution quotas and monitoring
- Custom domain with SSL
- Database backups
- Logging and alerting

### Current Limitations
- Code snippets: 64KB max
- Streaming: 5-minute timeout
- Functions: JSON input/output only
- No bidirectional WebSocket (use SSE)

## Authentication

### Sign Up / Login

**Web UI:**
1. Visit `http://localhost:3000`
2. Click "Sign Up" or "Sign In"
3. Enter email and organization name (for signup)
4. Check console for magic link (local dev)
5. Click link to authenticate

**Magic Link Flow:**
- **Local dev:** Link printed to backend console
- **Production:** Email sent via Resend

### API Keys

**Generate an API key:**
1. Log in to the web UI
2. Click your avatar → "Generate API Key"
3. Name your key and save it securely
4. Use for CLI and SDK

**Using API keys:**
```bash
# Set environment variable
export INSTANT_API_KEY=ik_your_key_here

# Or configure CLI
npx instant-api config --api-key ik_your_key_here

# Now you can use CLI with full access
npx instant-api expose http://localhost:3000/api
```

### Dashboard

View all your APIs in one place:
- **Endpoints:** Snippets, file uploads, webhooks
- **Tunnels:** Framework and function mode tunnels
- **Actions:** Copy URLs, view status, check activity
- **Auto-refresh:** Updates every 30 seconds

## Troubleshooting

**Backend won't start?**
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run build
```

**Postgres connection error?**
```bash
npm run docker:up
docker ps  # Check postgres is running
```

**CLI can't connect?**
```bash
# Check backend is running
curl http://localhost:3001/health

# Rebuild CLI
cd cli && npm run build
```

**Frontend can't reach backend?**
- Verify backend is on port 3001: `curl http://localhost:3001/health`
- Check `VITE_API_BASE` in `frontend/.env`
- Look for CORS errors in browser console

**Sandbox execution fails?**
```bash
# Start sandbox worker
cd sandbox-worker
npm run dev

# Should be on port 8787
curl http://localhost:8787/health
```

## Use Cases

### Development & Testing
- 🧪 Test webhooks locally (Stripe, Twilio, GitHub)
- 🔬 Quick API prototypes
- 🎯 Share work-in-progress with teammates
- 📊 Build real-time dashboards

### Learning & Education
- 📚 Learn API development
- 🎓 Teach backend concepts
- 💡 Experiment with code

### Integration & Demos
- 🎬 Product demos
- 🔗 Quick integrations
- ⚡ Hackathon projects


## License

FSL-1.1-MIT - See [LICENSE](LICENSE)

---

**Made with ❤️ for developers who want to move fast**
