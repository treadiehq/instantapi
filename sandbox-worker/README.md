# Cloudflare Sandbox Worker

This worker executes user-provided JavaScript and Python code safely using the production [Cloudflare Sandbox SDK](https://developers.cloudflare.com/sandbox/).

## Features

✅ **JavaScript Execution** - Run Node.js code in isolated containers  
✅ **Python Execution** - Run Python code with full standard library support  
✅ **Isolated Environments** - Each execution runs in a secure container  
✅ **Console Logging** - Capture stdout/stderr from code execution  
✅ **Error Handling** - Safe error isolation and reporting  

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy to Cloudflare (requires account and Workers Paid plan)
npm run deploy
```

## Development

The worker runs on `http://localhost:8787` during development.

### Endpoints

- `GET /` - Health check
- `POST /execute` - Execute code

### Request Format

```json
{
  "code": "function handler(input) { return { message: 'Hello' }; }",
  "language": "javascript",
  "input": { "name": "World" }
}
```

### Response Format

```json
{
  "result": { "message": "Hello" },
  "logs": ["console.log output"],
  "error": null
}
```

## Production Deployment

To deploy to Cloudflare:

1. Create a Cloudflare account with Workers Paid plan
2. Install Wrangler CLI: `npm install -g wrangler`
3. Login: `wrangler login`
4. Deploy: `npm run deploy`

**Note**: Cloudflare Sandbox requires a Workers Paid plan ($5/month minimum).

## How It Works

This worker uses the `@cloudflare/sandbox` SDK which:

- Creates isolated containers for each execution
- Supports JavaScript (Node.js) and Python natively
- Provides automatic timeout and resource management
- Captures logs and results
- Ensures strong security boundaries

Learn more: https://developers.cloudflare.com/sandbox/

## Security

The Cloudflare Sandbox SDK provides:
- ✅ Complete isolation via containers
- ✅ Automatic timeout limits
- ✅ Memory and CPU limits
- ✅ Network isolation
- ✅ File system isolation
- ✅ Process isolation

This is production-grade security suitable for running untrusted user code.

