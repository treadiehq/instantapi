# Testing Guide - Framework & Function Modes

This guide walks you through testing the Framework and Function modes of InstantAPI.

## Prerequisites

1. **Backend running**: `npm run dev:backend` (http://localhost:3001)
2. **Frontend running** (optional): `npm run dev:frontend` (http://localhost:3000)
3. **CLI built**: `cd cli && npm run build`
4. **SDK built**: `cd packages/sdk && npm run build`

---

## Test 1: Framework Mode (Expose Local Server)

### Step 1: Create a simple local server

Create a file `test-server.js`:

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Test endpoint
app.post('/api/greet', (req, res) => {
  res.json({
    message: `Hello, ${req.body.name || 'World'}!`,
    timestamp: new Date().toISOString(),
    method: req.method
  });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(3000, () => {
  console.log('Test server running on http://localhost:3000');
});
```

Install express if needed:
```bash
npm install express
```

### Step 2: Start the test server

```bash
node test-server.js
```

You should see: `Test server running on http://localhost:3000`

### Step 3: Expose it with the CLI

In a new terminal:

```bash
# Option 1: Using npx (recommended)
npx @instantapi/cli expose http://localhost:3000/api/greet

# Option 2: Using local build
cd cli
node dist/index.js expose http://localhost:3000/api/greet
```

You should see:
```
🚀 Instant API - Framework Mode

✓ Tunnel registered successfully!

Public URL: http://localhost:3001/t/abc123
Target URL: http://localhost:3000/api/greet
Tunnel ID: abc123

Press Ctrl+C to stop the tunnel

Waiting for requests...
```

### Step 4: Test the public endpoint

In a third terminal:

```bash
# Test POST request
curl -X POST http://localhost:3001/t/abc123 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'

# Expected response:
# {"message":"Hello, Alice!","timestamp":"2024-11-19T...","method":"POST"}
```

You should see the CLI log the request:
```
[10:30:45 AM] POST  (#1)
  └─ 200 {"message":"Hello, Alice!",...}
```

### Step 5: Test in the UI

1. Go to http://localhost:3000
2. Check the "Framework" tab
3. You should see your active tunnel listed under "Active Tunnels"

### Step 6: Cleanup

Press `Ctrl+C` in the CLI terminal to stop the tunnel.

---

## Test 2: Function Mode (SDK)

### Step 1: Create a functions file

Create a file `functions.ts` (or `functions.js`):

```typescript
import { expose } from '@instantapi/sdk';

// Simple function
expose('hello', (input) => {
  return { 
    message: `Hello, ${input.name || 'World'}!` 
  };
});

// Async function with calculation
expose('calculate', async (input) => {
  const { a, b, operation } = input;
  
  let result;
  switch (operation) {
    case 'add': result = a + b; break;
    case 'subtract': result = a - b; break;
    case 'multiply': result = a * b; break;
    case 'divide': result = a / b; break;
    default: throw new Error('Invalid operation');
  }
  
  return { result, operation, inputs: { a, b } };
});

// Function that simulates API call
expose('fetchUser', async (input) => {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    id: input.userId,
    name: 'John Doe',
    email: 'john@example.com',
    timestamp: new Date().toISOString()
  };
});

console.log('Functions registered! Run:');
console.log('  npx instant-api expose hello');
console.log('  npx instant-api expose calculate');
console.log('  npx instant-api expose fetchUser');
```

### Step 2: Install dependencies

```bash
npm install @instantapi/sdk express get-port
npm install -D @types/node typescript tsx
```

### Step 3: Run the functions file

```bash
# If using TypeScript
npx tsx functions.ts

# If using JavaScript
node functions.js
```

You should see:
```
🚀 Instant API SDK running on http://localhost:7777
Functions: hello, calculate, fetchUser
✓ Function "hello" exposed at http://localhost:7777/fn/hello
✓ Function "calculate" exposed at http://localhost:7777/fn/calculate
✓ Function "fetchUser" exposed at http://localhost:7777/fn/fetchUser
```

### Step 4: Test locally (optional)

In a new terminal, test the functions locally:

```bash
# Test hello function
curl -X POST http://localhost:7777/fn/hello \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'

# Test calculate function
curl -X POST http://localhost:7777/fn/calculate \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 5, "operation": "multiply"}'
```

### Step 5: Expose via CLI

In another terminal:

```bash
# Expose by function name (CLI will auto-detect)
npx @instantapi/cli expose hello
```

You should see:
```
Detected SDK function: hello
Resolved to: http://localhost:7777/fn/hello

🚀 Instant API - Framework Mode

✓ Tunnel registered successfully!

Public URL: http://localhost:3001/t/xyz789
Target URL: http://localhost:7777/fn/hello
Tunnel ID: xyz789
```

### Step 6: Test the public endpoint

```bash
curl -X POST http://localhost:3001/t/xyz789 \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob"}'

# Expected: {"result":{"message":"Hello, Bob!"}}
```

### Step 7: Test other functions

Open new terminals and expose other functions:

```bash
# Terminal 3
npx @instantapi/cli expose calculate

# Terminal 4
npx @instantapi/cli expose fetchUser
```

Test them:

```bash
# Test calculate
curl -X POST http://localhost:3001/t/[tunnel-id] \
  -H "Content-Type: application/json" \
  -d '{"a": 15, "b": 3, "operation": "divide"}'

# Test fetchUser
curl -X POST http://localhost:3001/t/[tunnel-id] \
  -H "Content-Type: application/json" \
  -d '{"userId": 123}'
```

---

## Troubleshooting

### Framework Mode Issues

**"Connection refused"**
- Make sure your local server is running
- Check the port number in your target URL
- Test locally first: `curl http://localhost:3000/api/greet`

**"Tunnel not found"**
- The tunnel may have expired
- Restart the CLI expose command

**"Backend not reachable"**
- Make sure the InstantAPI backend is running on port 3001
- Check: `curl http://localhost:3001/health`

### Function Mode Issues

**"Function not found"**
- Make sure your functions file is still running
- Check that `.instant-api-sdk.json` exists in the current directory
- The SDK creates this file with function metadata

**"SDK not detected"**
- Make sure you're running the expose command in the same directory as your functions file
- Check if the metadata file exists: `cat .instant-api-sdk.json`

**"Port already in use"**
- The SDK tries ports 7777-7781
- Close any processes using these ports
- Or kill the old SDK process

### General Issues

**CLI not found**
```bash
# Build the CLI first
cd cli && npm run build

# Or use the local path
node cli/dist/index.js expose <url>
```

**TypeScript errors**
```bash
# Install tsx for running TypeScript directly
npm install -D tsx

# Or compile first
npx tsc functions.ts --lib es2015 --module commonjs
node functions.js
```

---

## Testing Checklist

### Framework Mode
- [ ] Local server starts successfully
- [ ] CLI registers tunnel with backend
- [ ] Public URL is accessible
- [ ] Requests are proxied correctly
- [ ] Responses are returned properly
- [ ] CLI logs requests in real-time
- [ ] Graceful shutdown with Ctrl+C
- [ ] Active tunnel shows in UI

### Function Mode
- [ ] SDK starts and exposes functions
- [ ] Functions are callable locally
- [ ] CLI detects SDK metadata
- [ ] CLI can expose by function name
- [ ] Public endpoint works
- [ ] Multiple functions can be exposed simultaneously
- [ ] Error handling works
- [ ] Async functions work correctly

---

## Next Steps

Once both modes are working:

1. **Test streaming**: Create a streaming endpoint and expose it
2. **Test webhooks**: Use webhook mode with real webhook providers
3. **Test error handling**: Kill the local server mid-request
4. **Test TTL**: Wait for tunnel expiration
5. **Load testing**: Send many concurrent requests
6. **Edge cases**: Invalid JSON, large payloads, timeouts

---

## Additional Test Scripts

### Quick Framework Mode Test

```bash
# Start everything in one script
#!/bin/bash

# Terminal 1: Backend (run first)
npm run dev:backend &

# Wait for backend to start
sleep 3

# Terminal 2: Test server
node test-server.js &

# Wait for test server
sleep 2

# Terminal 3: Expose
npx @instantapi/cli expose http://localhost:3000/api/greet &

# Wait for tunnel
sleep 2

# Test it
curl -X POST http://localhost:3001/t/$(cat .instant-api-sdk.json | grep -o '"id":"[^"]*' | cut -d'"' -f4) \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```

### Quick Function Mode Test

```bash
#!/bin/bash

# Start backend
npm run dev:backend &
sleep 3

# Start SDK functions
npx tsx functions.ts &
sleep 2

# Expose function
npx @instantapi/cli expose hello &
sleep 2

# Get tunnel ID from logs and test
# (Manual step - check CLI output for tunnel ID)
```

---

Happy Testing! 🚀

