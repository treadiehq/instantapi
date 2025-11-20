# @instantapi/sdk

> **⚠️ Coming Soon** - The SDK is currently in development.

Write functions, get APIs. No servers, no deploy, no boilerplate.

## Planned Features

- Define functions in your code
- Auto-expose via CLI
- TypeScript support
- Async/await support
- Built-in error handling

## Preview Usage

```typescript
import { expose } from '@instantapi/sdk';

// Define a function
expose('greet', (input) => {
  return { message: `Hello, ${input.name}!` };
});

// Expose it
// npx instant-api expose greet

// Call it
// curl -X POST https://your-api.com/fn/greet -d '{"name": "World"}'
```

## Current Status

The SDK is being built alongside the Instant API platform. For now, you can:
- Create APIs via web UI at http://localhost:3000
- Write JavaScript or Python functions
- Get instant API endpoints

The SDK will provide a code-first alternative to the web UI.

## Stay Updated

Watch this space for updates! The SDK will enable:
- Function-as-a-Service style development
- Local development with instant cloud deployment
- Auto-generated API documentation
- Built-in testing and monitoring

Coming soon! 🚀
