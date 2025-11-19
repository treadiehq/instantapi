# Instant API

Turn code into APIs instantly. No servers, no deploy, no config.

## What is it?

**4 ways to create APIs:**

1. **Code Snippet** - Paste JS/Python → Get API
2. **Framework** - Expose your local server (like ngrok)
3. **Streaming** - Real-time SSE/WebSocket support
4. **Functions** - Serverless-style, zero boilerplate

## Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd instantapi
npm install && npm run install:all

# Start services
npm run docker:up
npm run prisma:generate
npm run prisma:migrate
./start.sh
```

Open **http://localhost:3000** 🚀

## Examples

### 1. Code Snippet (No signup needed)

```bash
# Create API
curl -X POST http://localhost:3001/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function handler(input) { return { sum: input.a + input.b }; }"
  }'

# Use it
curl -X POST http://localhost:3001/run/abc123 \
  -d '{"a": 5, "b": 3}'
# → { "result": { "sum": 8 } }
```

### 2. Framework Mode (No signup needed for 1hr)

```bash
# Your local server
npm start  # Running on :3000

# Expose it
cd cli && npm run build
node dist/index.js expose http://localhost:3000/api/users

# Use it
curl http://localhost:3001/t/xyz789
```

### 3. Streaming (SSE)

```javascript
// Your Express app
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  setInterval(() => {
    res.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`);
  }, 1000);
});
```

```bash
# Expose it
node cli/dist/index.js expose http://localhost:3000/events

# Stream it
curl -N http://localhost:3001/t/xyz789
```

### 4. Function Mode (Requires API key)

```bash
npm install @instantapi/sdk
```

```javascript
// functions.js
import { expose } from '@instantapi/sdk';

expose('greet', (input) => {
  return { message: `Hello, ${input.name}!` };
});
```

```bash
# Sign up at http://localhost:3000 → Generate API key
export INSTANT_API_KEY=ik_your_key

# Run and expose
node functions.js  # Terminal 1
npx instant-api expose greet  # Terminal 2
```

## Authentication

**Optional** (most features work without signup for 1hr)

**Required for:**
- File uploads
- 24hr+ TTL
- Function mode (SDK)
- Persistent tunnels

**How to:**
1. Visit http://localhost:3000
2. Sign up with email
3. Check console for magic link
4. Generate API key for CLI/SDK

## Features

| Mode | Auth | TTL | Use Case |
|------|------|-----|----------|
| **Snippet** | Optional | 1hr-7d | Quick APIs |
| **File Upload** | Required | 1hr-7d | Larger code |
| **Framework** | Optional | 1hr+ | ngrok-style |
| **Streaming** | Optional | 1hr+ | SSE/WebSocket |
| **Functions** | Required | 1hr+ | Serverless |

**Languages:** JavaScript, TypeScript, Python
**Limits:** 64KB code, 5min streaming timeout

## Configuration

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/instantapi"
CLOUDFLARE_SANDBOX_URL="http://localhost:8787"
BACKEND_URL="http://localhost:3001"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3000"
RESEND_API_KEY=""  # Optional: production email
EMAIL_FROM="noreply@instantapi.com"
```

**Frontend (.env):**
```env
VITE_API_BASE="http://localhost:3001"
```

## Troubleshooting

```bash
# Backend won't start
cd backend && npm run prisma:generate && npm run prisma:migrate

# Check services
curl http://localhost:3001/health  # Backend
curl http://localhost:8787/health  # Sandbox
docker ps  # Postgres

# Rebuild CLI
cd cli && npm run build
```


## Docs

- **[packages/sdk/README.md](./packages/sdk/README.md)** - Function SDK
- **[cli/README.md](./cli/README.md)** - CLI docs
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy guide

---

## License

FSL-1.1-MIT - See [LICENSE](LICENSE)

