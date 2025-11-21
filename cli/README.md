# Instant API CLI

Share your local server with the internet, like ngrok but integrated with Instant API.

## Install

```bash
npm install -g @instantapihq/cli
```

Or use directly with npx:

```bash
npx @instantapihq/cli expose http://localhost:3000/api
```

## Usage

### Expose Local Server

```bash
instant-api expose http://localhost:3000/api/users
```

You get:
- Public URL instantly
- Requests forwarded to your local server
- Works with any framework (Express, NestJS, Flask, FastAPI, etc.)
- Supports SSE/streaming
- Press Ctrl+C to stop

### Quick Test (No Auth)

```bash
# 1 hour temporary tunnel, perfect for quick tests
instant-api expose http://localhost:3000/api
```

### Persistent Tunnel (With Auth)

```bash
# 1. Sign up and get API key
export INSTANT_API_KEY=ik_your_key_here

# 2. Expose with no time limit
instant-api expose http://localhost:3000/api
```

### Options

```bash
instant-api expose <targetUrl> [options]

Options:
  --backend, -b  Backend URL [default: "https://api.instantapi.co"]
  --help, -h     Show help
  --version, -v  Show version
```

### Configuration

#### Backend URL

By default, the CLI connects to the hosted Instant API backend at `https://api.instantapi.co`.

You can configure the backend URL in three ways (in order of precedence):

1. **Command-line flag** (highest priority):
```bash
instant-api expose http://localhost:3000/api --backend http://localhost:3001
```

2. **Environment variable**:
```bash
export INSTANT_API_BACKEND_URL=http://localhost:3001
instant-api expose http://localhost:3000/api
```

3. **Default**: `https://api.instantapi.co` (hosted production backend)

#### API Key

You can set your API key in two ways:

1. **Config file** (recommended):
```bash
instant-api config --api-key ik_your_key_here
```

2. **Environment variable**:
```bash
export INSTANT_API_KEY=ik_your_key_here
```

## Examples

### Expose Express Server

```bash
# Terminal 1: Start your server
npm run dev  # Running on http://localhost:3000

# Terminal 2: Expose an endpoint
instant-api expose http://localhost:3000/api/users/create

# Output:
# 🚀 Instant API - Framework Mode
# ✓ Tunnel registered successfully!
# 
# Public URL: http://localhost:3001/t/clx123...
# Target URL: http://localhost:3000/api/users/create
# 
# Waiting for requests...

# Terminal 3: Test it
curl -X POST http://localhost:3001/t/clx123... \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
```

### Expose Streaming Endpoint

```bash
# Your SSE endpoint
instant-api expose http://localhost:3000/events

# Test streaming
curl -N http://localhost:3001/t/clx123...
```

### Configure API Key

```bash
# Save API key to config file
instant-api config --api-key ik_your_key_here

# View current config
instant-api config
```

## How It Works

1. **Register**: CLI registers your target URL with the backend
2. **Poll**: CLI continuously polls for incoming requests
3. **Forward**: Requests are forwarded to your local server
4. **Respond**: Your server's response is sent back through the tunnel

## Features

- **No signup for quick tests** - 1 hour temporary tunnels
- **Streaming support** - SSE and WebSocket
- **All HTTP methods** - GET, POST, PUT, DELETE, etc.
- **Header forwarding** - Preserves important headers
- **Error handling** - Clear error messages
- **Auto-reconnect** - Handles network issues

## Requirements

- Node.js 18+
- Instant API backend running (or production URL)
- Your local server running

## Development

Build from source:

```bash
# Clone repo
git clone https://github.com/treadiehq/instantapi.git
cd instantapi/cli

# Build
npm install
npm run build

# Test locally
node dist/index.js expose http://localhost:3000
```

## Troubleshooting

**Connection refused:**
- Make sure your local server is running
- Check the target URL is correct

**Backend not responding:**
- Default backend is `https://api.instantapi.co` (hosted)
- For self-hosted backend, use `--backend` flag: `instant-api expose <url> --backend http://localhost:3001`
- Or set environment variable: `export INSTANT_API_BACKEND_URL=http://localhost:3001`
- Check backend is accessible: `curl https://api.instantapi.co/health`

**Tunnel expired:**
- Without auth, tunnels last 1 hour
- Sign up and set API key for longer tunnels

## License

See [FSL-1.1-MIT](LICENSE) for full details.