# @instantapihq/client

The official client SDK for [InstantAPI](https://instantapi.co) — Run AI agents with an API.

## Installation

```bash
npm install @instantapihq/client
# or
yarn add @instantapihq/client
# or
pnpm add @instantapihq/client
```

## Quick Start

```typescript
import InstantAPI from '@instantapihq/client';

const api = new InstantAPI({ apiKey: 'ik_your_key' });

// Run any deployed agent with one line
const { result } = await api.run('your-agent-id', { 
  prompt: 'What is the capital of France?' 
});

console.log(result);
// { response: 'The capital of France is Paris.' }
```

## Usage

### Initialize the Client

```typescript
import InstantAPI from '@instantapihq/client';

// With API key (recommended)
const api = new InstantAPI({ 
  apiKey: 'ik_your_key' 
});

// Or use environment variable INSTANT_API_KEY
const api = new InstantAPI();

// Custom configuration
const api = new InstantAPI({
  apiKey: 'ik_your_key',
  baseUrl: 'https://api.instantapi.co', // default
  timeout: 30000, // 30 seconds default
});
```

### Run an Agent

```typescript
// Simple usage - just get the result
const { result } = await api.run('agent-id', { 
  prompt: 'Hello!' 
});

// Full response with logs and timing
const response = await api.run('agent-id', { data: 'test' });
console.log(response.result);     // Your agent's return value
console.log(response.logs);       // Console output from your agent
console.log(response.durationMs); // Execution time in ms

// With TypeScript generics for typed results
interface ChatResponse {
  response: string;
  model: string;
}

const { result } = await api.run<ChatResponse>('chatbot', { 
  prompt: 'Hi!' 
});
console.log(result.response); // TypeScript knows this is a string
```

### Create an Agent

```typescript
const endpoint = await api.create({
  code: `
    async function handler(input) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${input.apiKey}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: input.prompt }]
        })
      });
      const data = await response.json();
      return { response: data.choices[0].message.content };
    }
  `,
  language: 'javascript',
  name: 'my-chatbot',
  description: 'A simple chatbot agent',
  ttlHours: 720, // 30 days
});

console.log(endpoint.url);
// https://api.instantapi.co/run/cmiplsu200013w2qx

// Now run it
const { result } = await api.run(endpoint.id, { 
  apiKey: 'sk-...', 
  prompt: 'Hello!' 
});
```

### List Your Agents

```typescript
const endpoints = await api.list();

for (const endpoint of endpoints) {
  console.log(`${endpoint.name}: ${endpoint.url}`);
}
```

### Delete an Agent

```typescript
await api.delete('agent-id');
```

## Error Handling

```typescript
import InstantAPI, { InstantAPIError } from '@instantapihq/client';

try {
  const { result } = await api.run('agent-id', { prompt: 'Hello' });
} catch (error) {
  if (error instanceof InstantAPIError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.statusCode);
    console.error('Response:', error.response);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Environment Variables

The SDK supports these environment variables:

| Variable | Description |
|----------|-------------|
| `INSTANT_API_KEY` | Your API key (alternative to passing in constructor) |
| `INSTANT_API_BASE_URL` | Custom API base URL |

## Examples

### OpenAI Chatbot

```typescript
const { result } = await api.run('openai-chatbot', {
  apiKey: process.env.OPENAI_API_KEY,
  prompt: 'Explain quantum computing',
  model: 'gpt-4o-mini'
});

console.log(result.response);
```

### Image Generation

```typescript
const { result } = await api.run('image-generator', {
  apiKey: process.env.OPENAI_API_KEY,
  prompt: 'A futuristic city at sunset',
  size: '1024x1024'
});

console.log(result.imageUrl);
```

### Web Scraper

```typescript
const { result } = await api.run('web-scraper', {
  url: 'https://example.com'
});

console.log(result.title);
console.log(result.links);
```

## License

MIT

