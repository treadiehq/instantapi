# @instantapi/sdk

Write functions. Get APIs. That's it.

No Express. No servers. No boilerplate.

## Install

```bash
npm install @instantapi/sdk
```

## Quick Start

```typescript
import { expose } from '@instantapi/sdk';

expose('greet', (input) => {
  return { message: `Hello, ${input.name}!` };
});

// That's your API! ✨
```

## Make It Public

**⚠️ You need an API key** (for security - prevents unauthorized code execution)

```bash
# 1. Get API key: http://localhost:3000 → Sign up → Generate key
export INSTANT_API_KEY=ik_your_key_here

# 2. Run your code
node app.js

# 3. Expose function
npx instant-api expose greet  # Auto-detected!

# Done! Use your function:
curl -X POST https://your-url/t/xyz -d '{"name": "World"}'
```

## How It Works

1. SDK starts a tiny local server (port 7777)
2. Your functions → `http://localhost:7777/fn/<name>`
3. CLI creates a public tunnel
4. Internet → Tunnel → Your function ✨

## API

### `expose(name, handler)`

Expose a function via Instant API.

**Parameters:**
- `name` (string) - Function name (used in URL path)
- `handler` (function) - Function that takes input and returns result

**Returns:** `Promise<void>`

**Example:**
```typescript
expose('calculateTax', (input) => {
  const tax = input.amount * 0.15;
  return { tax, total: input.amount + tax };
});
```

### `stop()`

Stop the SDK server and clean up resources.

**Returns:** `Promise<void>`

**Example:**
```typescript
import { stop } from '@instantapi/sdk';

// Graceful shutdown
process.on('SIGINT', async () => {
  await stop();
  process.exit(0);
});
```

## Complete Example

```typescript
// functions.ts
import { expose } from '@instantapi/sdk';

// Data processing function
expose('processData', async (input) => {
  const { data, operation } = input;
  
  switch (operation) {
    case 'sum':
      return { result: data.reduce((a, b) => a + b, 0) };
    case 'average':
      return { result: data.reduce((a, b) => a + b, 0) / data.length };
    default:
      throw new Error('Unknown operation');
  }
});

// Webhook handler
expose('handleWebhook', async (input) => {
  console.log('Webhook received:', input);
  
  // Process webhook
  const result = await processWebhook(input);
  
  return { success: true, result };
});

// Keep process alive
console.log('Functions exposed. Press Ctrl+C to exit.');
```

```bash
# Terminal 1: Run your functions
node functions.ts

# Terminal 2: Set API key (REQUIRED for function mode)
export INSTANT_API_KEY=ik_your_key_here

# Then expose to internet
npx instant-api expose http://localhost:7777/fn/processData

# Terminal 3: Test it
curl -X POST http://localhost:3001/t/abc123 \
  -H "Content-Type: application/json" \
  -d '{"data": [1, 2, 3, 4, 5], "operation": "sum"}'
```

> ⚠️ **Important**: Function mode always requires an API key for security. Get yours at http://localhost:3000 after signing up.

## Metadata File

The SDK creates a `.instant-api-sdk.json` file in your project directory:

```json
{
  "port": 7777,
  "functions": ["hello", "processData", "handleWebhook"],
  "pid": 12345
}
```

This file is automatically cleaned up when your app exits.

## Integration with Instant API CLI

The CLI can auto-detect SDK functions:

```bash
# Expose by function name (CLI reads metadata)
npx instant-api expose myFunction

# CLI automatically constructs: http://localhost:7777/fn/myFunction
```

## TypeScript Support

Full TypeScript support with type definitions included.

```typescript
import { expose } from '@instantapi/sdk';

interface CalculateInput {
  a: number;
  b: number;
}

interface CalculateOutput {
  result: number;
}

expose('calculate', (input: CalculateInput): CalculateOutput => {
  return { result: input.a + input.b };
});
```

## Error Handling

Errors are automatically caught and returned with 500 status:

```typescript
expose('riskyOperation', async (input) => {
  if (!input.required) {
    throw new Error('Missing required field');
  }
  
  // Process...
  return { success: true };
});

// Error response:
// {
//   "error": "Missing required field",
//   "stack": "Error: Missing required field\n    at ..."
// }
```

## Health Check

The SDK provides a health check endpoint:

```bash
curl http://localhost:7777/health

# Response:
# {
#   "status": "ok",
#   "functions": ["hello", "calculate"],
#   "port": 7777
# }
```

## Limitations

- Functions must accept JSON input
- Functions must return JSON-serializable output
- Synchronous and async functions both supported
- No WebSocket support (use SSE instead)

## Use Cases

- **Quick API prototyping** - Expose functions without Express/NestJS setup
- **Serverless-style development** - Write functions, not servers
- **Webhook handlers** - Process webhooks locally during development
- **Microservices testing** - Test individual functions in isolation
- **AI/ML inference** - Expose model prediction functions

## Examples

### AI Model Inference

```typescript
import { expose } from '@instantapi/sdk';
import * as tf from '@tensorflow/tfjs-node';

let model: tf.LayersModel;

expose('predict', async (input) => {
  if (!model) {
    model = await tf.loadLayersModel('file://./model/model.json');
  }
  
  const tensor = tf.tensor2d([input.features]);
  const prediction = model.predict(tensor) as tf.Tensor;
  const result = await prediction.array();
  
  return { prediction: result[0] };
});
```

### Database Query

```typescript
import { expose } from '@instantapi/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

expose('getUser', async (input) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
  });
  return { user };
});

expose('createUser', async (input) => {
  const user = await prisma.user.create({
    data: input,
  });
  return { user };
});
```

## License

MIT

