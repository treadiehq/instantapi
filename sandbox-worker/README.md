# Cloudflare Sandbox Worker

Executes user JavaScript and Python code safely using [Cloudflare Sandbox SDK](https://developers.cloudflare.com/sandbox/).

## What It Does

- ✅ Runs JavaScript (Node.js) and Python 3
- ✅ Isolated containers for each execution
- ✅ Captures console output and errors
- ✅ Production-grade security

## Quick Start

```bash
# Install dependencies
npm install

# Deploy to Cloudflare
npx wrangler deploy
```

**Note:** Requires Cloudflare Workers Paid plan ($5/month).

## Development

```bash
# Start local server
npm run dev

# Test locally
curl http://localhost:8787/run
```

## API Endpoints

### Health Check
```bash
GET /

Response:
{
  "status": "ok",
  "service": "instant-api-sandbox-worker",
  "timestamp": "2025-11-20T...",
  "sdk": "@cloudflare/sandbox"
}
```

### Execute Code
```bash
POST /execute

Request:
{
  "code": "function handler(input) { return { result: input.a + input.b }; }",
  "language": "javascript",
  "input": { "a": 5, "b": 3 }
}

Response:
{
  "result": { "result": 8 },
  "logs": [],
  "durationMs": 150,
  "error": null
}
```

## Deployment

1. Install Wrangler: `npm install -g wrangler`
2. Login: `wrangler login`
3. Upgrade to Workers Paid plan at https://dash.cloudflare.com
4. Deploy: `npx wrangler deploy`

**After first deployment**, wait 2-3 minutes for containers to provision.

## Configuration

See `wrangler.toml` for:
- Container configuration
- Durable Objects setup
- Compatibility settings

## Security

The Cloudflare Sandbox provides:
- Complete process isolation
- Automatic resource limits (CPU, memory, network)
- Execution timeouts
- File system isolation

Safe for running untrusted user code.

## Learn More

- [Cloudflare Sandbox Docs](https://developers.cloudflare.com/sandbox/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
