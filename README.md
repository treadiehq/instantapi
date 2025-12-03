# Instant API

**Run AI agents with an API.** Deploy any agent, function, or script as a secure, sandboxed, rate-limited API endpoint instantly.

## What is it?

The fastest way to turn your AI agents, functions, and scripts into APIs with sandboxing, rate limits, and usage tracking built-in. No servers, no infrastructure, no DevOps.

Paste your code → Get an API endpoint → Call it from anywhere.

**Built for:**
- **AI Agents** — Deploy LLM-powered agents with OpenAI, Anthropic, and more
- **Functions** — Turn any code into a callable API
- **Integrations** — Expose webhooks and automation workflows

**Three deployment modes:**

1. **Code Snippet** — Paste agent/function code → Get instant API endpoint
2. **Framework Mode (CLI)** — Expose your local server to the internet (like ngrok)
3. **Function Mode (SDK)** — Write functions, deploy as serverless APIs

## Live

Try it now at **https://instantapi.co**

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

**AI Agent Example (OpenAI):**
```javascript
async function handler(input) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: input.prompt }]
    })
  });
  return await response.json();
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

**Python AI Agent (with openai package):**
```python
from openai import OpenAI

def handler(input):
    client = OpenAI(api_key=input['apiKey'])
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": input['prompt']}]
    )
    return {"response": response.choices[0].message.content}
```

Click "Create API" → You get a unique endpoint like:
```
https://your-api.com/run/abc123xyz
```

### 2. Call Your API

**Basic example:**
```bash
curl -X POST https://api.instantapi.co/run/YOUR_ENDPOINT_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "World"}'
```

**Call an AI agent:**
```bash
curl -X POST https://api.instantapi.co/run/YOUR_ENDPOINT_ID \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "sk-your-openai-key", "prompt": "What is AI?"}'

# Response:
# {"result": {"response": "AI is..."}, "durationMs": 1234}
```

**Or use the SDK:**
```typescript
import InstantAPI from '@instantapihq/client';
const api = new InstantAPI();
const { result } = await api.run('YOUR_ENDPOINT_ID', { prompt: 'Hello!' });
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

> **Tip:** If your backend is running on a different port, configure the CLI:
> ```bash
> # Option 1: Use --backend flag
> npx @instantapihq/cli expose http://localhost:3000/api --backend http://localhost:PORT
> 
> # Option 2: Set environment variable
> export INSTANT_API_BACKEND_URL=http://localhost:PORT
> npx @instantapihq/cli expose http://localhost:3000/api
> ```

### 4. Function Mode (Server SDK)

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

### 5. Client SDK (Call Deployed Agents)

Call any deployed agent programmatically:

```bash
npm install @instantapihq/client
```

```typescript
import InstantAPI from '@instantapihq/client';

const api = new InstantAPI({ apiKey: 'ik_your_key' });

// Run any deployed agent with one line
const { result } = await api.run('agent-id', { 
  prompt: 'What is AI?' 
});

console.log(result.response);
```

## Authentication

**Optional** - Create APIs instantly without signing up.

**Sign up for:**
- Manage and edit your APIs
- **Usage dashboard** — View call counts, errors, latency per endpoint
- **Request logs** — Full audit trail of all API calls
- **Custom rate limits** — Configure limits per endpoint
- Longer API lifetimes (up to 30 days)
- Premium features (coming soon)

**How to sign up:**
1. Visit the app and click "Sign Up"
2. Enter your email
3. Check your inbox for a magic link (no password needed!)
4. Click the link and you're in

## Features

**Supported Languages:**
- JavaScript (Node.js) with async/await support
- Python 3.11

**Pre-installed AI Packages:**
- **Python:** `openai`, `anthropic`, `requests`, `httpx`, `aiohttp`, `pydantic`, `beautifulsoup4`
- **JavaScript:** `openai`, `@anthropic-ai/sdk`, `axios`, `node-fetch`

**What you can do:**
- Deploy AI agents that call OpenAI, Anthropic, and other LLM APIs
- Secure sandboxed execution (isolated containers)
- **Rate limiting** — Configurable per-endpoint (10/min to unlimited)
- **Usage tracking** — Call counts, error rates, latency metrics
- **Request logging** — Full audit trail of all API calls
- Make outbound HTTP requests to any API
- Handle async operations (async/await fully supported)
- Access request headers (webhook mode)
- Streaming support (SSE/Server-Sent Events)
- Expose local servers (ngrok-style tunnels)
- Quick testing with built-in playground

**Rate Limiting:**
Configure rate limits when creating an endpoint:
- 10 / min — For testing
- 60 / min — Low traffic
- 100 / min — Default
- 500 / min — Medium traffic
- 1000 / min — High traffic
- Unlimited — No restrictions

```bash
# Rate limit info returned with every response
{
  "result": { ... },
  "rateLimitInfo": {
    "limit": 100,
    "remaining": 95,
    "resetAt": "2025-12-03T08:00:00Z"
  }
}
```

**Usage Dashboard:**
View stats for any endpoint:
- Total calls, success rate, error rate
- Average and P95 latency
- Last 24h and 7-day trends
- Recent request logs with status codes

**Current Limits:**
- Free tier: APIs active for 24 hours
- Signed-in users: APIs active for up to 30 days
- Max code size: 3MB
- Execution timeout: 30 seconds (enough for most LLM calls)
- Default rate limit: 100 requests/minute (configurable)

## Local Development Setup

**Backend** - Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/instantapi"
CLOUDFLARE_SANDBOX_URL="https://xxx.YOUR-NAME.workers.dev"
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

---

## License

See [FSL-1.1-MIT](LICENSE) for full details.