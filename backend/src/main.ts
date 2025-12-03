import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security: Limit request body size to prevent DoS attacks
  app.use(json({ limit: '1mb' })); // Max 1MB for JSON bodies
  app.use(urlencoded({ extended: true, limit: '1mb' })); // Max 1MB for URL-encoded bodies
  
  // Security: Global request timeout (30 seconds)
  app.use((req: any, res: any, next: any) => {
    req.setTimeout(30000, () => {
      res.status(408).json({ error: 'Request timeout' });
    });
    res.setTimeout(30000, () => {
      res.status(504).json({ error: 'Response timeout' });
    });
    next();
  });
  
  // Enable CORS for frontend
  const allowedOrigins = [
    'https://instantapi.co',
    'https://www.instantapi.co',
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  
  // Add custom FRONTEND_URL if set
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }
    
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Instant API Backend running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🌍 CORS enabled for: ${allowedOrigins.join(', ')}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

