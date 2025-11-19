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

**Run & expose:**
```bash
# Terminal 1
node functions.js

# Terminal 2
npx instant-api expose greet  # Auto-detected!

# Terminal 3
curl -X POST http://localhost:3001/t/xyz789 \
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
```

**Frontend (.env):**
```env
VITE_API_BASE="http://localhost:3001"
```

### Modes & Options

| Mode | Description | Use Case |
|------|-------------|----------|
| **Snippet** | Run code in sandbox | Quick APIs, prototypes |
| **File Upload** | Upload .js/.ts/.py | Larger code files |
| **Webhook** | Access headers | Stripe, Twilio webhooks |
| **Framework** | Proxy local server | Share local dev server |
| **Streaming** | SSE/WebSocket | Real-time dashboards |
| **Functions** | SDK-based | Serverless-style dev |

### TTL (Time-to-Live)
- **1 hour** - Quick tests
- **24 hours** - Default (recommended)
- **7 days** - Longer projects

## Security & Limitations

### Security
⚠️ **For development and testing only**

- No authentication by default
- Endpoints are public
- Code runs in isolated sandbox (Cloudflare Workers)
- Auto-expires to prevent abuse
- 64KB code size limit

### Production Considerations
Add these before going live:
- Rate limiting
- API authentication
- Input validation
- Execution quotas
- Monitoring & logging

### Current Limitations
- Code snippets: 64KB max
- Streaming: 5-minute timeout
- Functions: JSON input/output only
- No bidirectional WebSocket (use SSE)

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
