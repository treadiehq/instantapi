# Instant API CLI

> **⚠️ Coming Soon** - Framework/tunnel mode is currently in development.

Share your local server with the internet, like ngrok but integrated with Instant API.

## Planned Features

- Expose local servers to the internet
- Auto-detect SDK functions
- Support for all frameworks (Express, FastAPI, etc.)
- WebSocket and SSE streaming support

## Preview Usage

```bash
# Install
npm install -g instant-api

# Expose local server
instant-api expose http://localhost:3000/api

# With API key (no time limit)
export INSTANT_API_KEY=ik_your_key
instant-api expose http://localhost:3000/api
```

## Status

This CLI is being developed alongside the main Instant API platform. Currently, you can:
- Create APIs via the web UI at http://localhost:3000
- Execute JavaScript and Python code
- Call your APIs via HTTP

Framework mode (tunnel/expose) is coming soon!

## Development

```bash
# Build CLI
npm run build

# Test locally
node dist/index.js --help
```

Stay tuned for updates! 🚀
