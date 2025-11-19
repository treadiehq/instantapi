# Instant API CLI

Expose your local HTTP endpoints to the internet instantly - no deployment, no configuration.

## Installation

```bash
# From the CLI directory
npm install
npm run build

# Or use directly with npx (once published)
npx @instantapi/cli expose http://localhost:3000/api/users
```

## Usage

### Expose a local endpoint

```bash
instant-api expose http://localhost:3000/api/users
```

This will:
1. Register a tunnel with the Instant API backend
2. Print a public URL (e.g., `http://localhost:3001/t/abc123`)
3. Forward all requests to your local endpoint
4. Keep running until you press Ctrl+C

### Options

```bash
instant-api expose <targetUrl> [options]

Options:
  --backend, -b  Instant API backend URL  [default: "http://localhost:3001"]
  --help, -h     Show help
  --version, -v  Show version number
```

## Example

```bash
# Terminal 1: Start your local server
npm run dev  # Your NestJS/Express/FastAPI app on http://localhost:3000

# Terminal 2: Expose an endpoint
instant-api expose http://localhost:3000/api/users/create --backend http://localhost:3001

# Output:
# 🚀 Instant API - Framework Mode
# ✓ Tunnel registered successfully!
# 
# Public URL: http://localhost:3001/t/clx1234567890
# Target URL: http://localhost:3000/api/users/create
# Tunnel ID: clx1234567890
# 
# Press Ctrl+C to stop the tunnel
# 
# Waiting for requests...

# Terminal 3: Test the public endpoint
curl -X POST http://localhost:3001/t/clx1234567890 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

## How it works

1. **Register**: CLI registers your target URL with the backend
2. **Poll**: CLI continuously polls the backend for new incoming requests
3. **Forward**: When a request arrives, CLI forwards it to your local server
4. **Respond**: CLI sends your server's response back to the backend
5. **Reply**: Backend returns the response to the original HTTP caller

## Requirements

- Node.js 18+ (for CLI)
- Instant API backend running (default: http://localhost:3001)
- Your local HTTP server running

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Test locally
node dist/index.js expose http://localhost:3000/test
```

