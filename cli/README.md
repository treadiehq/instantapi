# Instant API CLI

Share your local server with the world. Like ngrok, but simpler.

## Installation

```bash
npx instant-api expose http://localhost:3000/api/users
```

That's it! No sign up needed for quick tests (1hr limit).

## Usage

```bash
instant-api expose http://localhost:3000/api/users
```

You get:
- ✅ Public URL instantly
- ✅ Requests forwarded to your local server
- ✅ Works with any framework (Express, NestJS, FastAPI, etc.)
- ✅ Press Ctrl+C to stop

### Authentication

**Quick test (no auth):**
```bash
instant-api expose http://localhost:3000/api
# → 1 hour limit, perfect for testing
```

**For longer tunnels:**
1. Sign up at http://localhost:3000
2. Generate API key
3. Set it:
```bash
export INSTANT_API_KEY=ik_your_key_here
instant-api expose http://localhost:3000/api
# → No time limit
```

**Function mode always needs API key:**
```bash
export INSTANT_API_KEY=ik_your_key_here
instant-api expose myFunction
```

### Options

```bash
instant-api expose <targetUrl> [options]

Options:
  --backend, -b  Instant API backend URL  [default: "http://localhost:3001"]
  --help, -h     Show help
  --version, -v  Show version number
```

## Example

### Without API Key (1 hour limit)

```bash
# Terminal 1: Start your local server
npm run dev  # Your NestJS/Express/FastAPI app on http://localhost:3000

# Terminal 2: Expose an endpoint (no API key = 1hr temporary tunnel)
instant-api expose http://localhost:3000/api/users/create --backend http://localhost:3001

# Output:
# 🚀 Instant API - Framework Mode
# ⚠️  No API key found. Tunnel will be temporary (1 hour limit).
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

### With API Key (persistent tunnel)

```bash
# Set your API key first
export INSTANT_API_KEY=ik_your_key_here

# Now expose with no time limit
instant-api expose http://localhost:3000/api/users/create

# Output:
# 🚀 Instant API - Framework Mode
# ✓ Tunnel registered successfully!
# 
# Public URL: http://localhost:3001/t/clx1234567890
# Target URL: http://localhost:3000/api/users/create
# Tunnel ID: clx1234567890
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

