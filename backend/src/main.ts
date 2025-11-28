import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security: Limit request body size to prevent DoS attacks
  app.use(json({ limit: '1mb' })); // Max 1MB for JSON bodies
  app.use(urlencoded({ extended: true, limit: '1mb' })); // Max 1MB for URL-encoded bodies
  
  // Enable CORS for frontend
  const allowedOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL, 'http://localhost:3000']
    : ['http://localhost:3000'];
    
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Instant API Backend running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🌍 CORS enabled for: ${allowedOrigins.join(', ')}`);
}

bootstrap();

