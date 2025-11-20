# @instantapihq/sdk

Write functions, get APIs. No servers, no deploy, no boilerplate.

## Install

```bash
npm install @instantapihq/sdk
```

## Quick Start

```typescript
import { expose } from '@instantapihq/sdk';

// Define a function
expose('greet', (input) => {
  return { message: `Hello, ${input.name}!` };
});

console.log('Functions running. Press Ctrl+C to exit.');
```

Run it:

```bash
# Terminal 1: Start your functions
node app.js

# Terminal 2: Expose to internet
npx @instantapihq/cli expose greet
# CLI auto-detects and exposes http://localhost:7777/fn/greet

# Terminal 3: Call your API
curl -X POST http://localhost:3001/t/abc123 \
  -d '{"name": "World"}'
```

## How It Works

1. SDK starts a local Express server (default port: 7777)
2. Your functions → `http://localhost:7777/fn/<name>`
3. CLI creates a public tunnel
4. Internet → Tunnel → Your function ✅

## API

### `expose(name, handler)`

Register a function to be exposed.

```typescript
expose('functionName', (input) => {
  // Your logic
  return { result: 'whatever' };
});
```

**Handler signature:**
- **input**: `any` - The input data from API call
- **returns**: `any` or `Promise<any>` - The result to return

### `stop()`

Stop the SDK server.

```typescript
import { stop } from '@instantapi/sdk';

process.on('SIGINT', async () => {
  await stop();
  process.exit(0);
});
```

## Examples

### Basic Function

```typescript
import { expose } from '@instantapihq/sdk';

expose('add', (input) => {
  return { result: input.a + input.b };
});
```

### Async Function

```typescript
expose('fetchUser', async (input) => {
  const response = await fetch(`https://api.example.com/users/${input.id}`);
  const user = await response.json();
  return { user };
});
```

### Database Query

```typescript
import { expose } from '@instantapihq/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

expose('createUser', async (input) => {
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
    },
  });
  return { user };
});

expose('getUser', async (input) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
  });
  return { user };
});
```

### Multiple Functions

```typescript
import { expose } from '@instantapihq/sdk';

// Data processing
expose('sum', (input) => {
  return { result: input.numbers.reduce((a, b) => a + b, 0) };
});

// Text processing
expose('uppercase', (input) => {
  return { result: input.text.toUpperCase() };
});

// Validation
expose('validate', (input) => {
  const { email } = input;
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return { isValid, email };
});

console.log('3 functions running. Press Ctrl+C to exit.');
```

## TypeScript

Full TypeScript support:

```typescript
interface AddInput {
  a: number;
  b: number;
}

interface AddOutput {
  result: number;
}

expose('add', (input: AddInput): AddOutput => {
  return { result: input.a + input.b };
});
```

## Error Handling

Errors are automatically caught and returned as JSON:

```typescript
expose('divide', (input) => {
  if (input.b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return { result: input.a / input.b };
});

// Error response:
// { "error": "Cannot divide by zero", "stack": "..." }
```

## Authentication

Function mode requires an API key:

```bash
# 1. Sign up at your Instant API instance
# 2. Generate API key
# 3. Set it:
export INSTANT_API_KEY=ik_your_key_here

# 4. Expose functions
npx @instantapihq/cli expose myFunction
```

## Metadata File

The SDK creates `.instant-api-sdk.json` for CLI detection:

```json
{
  "port": 7777,
  "functions": ["greet", "calculate"],
  "pid": 12345
}
```

This file is automatically cleaned up when your app exits.

## Health Check

```bash
curl http://localhost:7777/health

# Response:
# {
#   "status": "ok",
#   "functions": ["greet", "calculate"],
#   "port": 7777
# }
```

## What Works

- ✅ Sync and async functions
- ✅ TypeScript support
- ✅ Error handling
- ✅ Multiple functions
- ✅ JSON input/output
- ✅ Auto port selection (7777-7781)

## Great For

- Quick prototypes
- Webhook handlers
- AI/ML inference APIs
- Microservice testing
- Database operations
- Data processing functions

## Requirements

- Node.js 18+
- @instantapihq/cli for exposing functions
- Instant API backend (local or production)

## License

See [FSL-1.1-MIT](LICENSE) for full details.
