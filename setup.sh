#!/bin/bash

# Instant API - Setup Script
# Run this script to set up the project automatically

set -e

echo "🚀 Instant API - Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
echo ""

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."
npm run install:all
echo ""

# Create .env files
echo "📝 Creating environment files..."

# Root .env
if [ ! -f .env ]; then
    cat > .env << EOF
DATABASE_URL=postgresql://instant:instant@localhost:5432/instant?schema=public
CLOUDFLARE_SANDBOX_URL=http://localhost:8787
EOF
    echo "✅ Created root .env"
else
    echo "⚠️  Root .env already exists, skipping"
fi

# Backend .env
if [ ! -f backend/.env ]; then
    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "CHANGE_ME_$(date +%s)_$(openssl rand -hex 16 2>/dev/null || echo 'random')")
    
    cat > backend/.env << EOF
DATABASE_URL=postgresql://instant:instant@localhost:5432/instant?schema=public
CLOUDFLARE_SANDBOX_URL=http://localhost:8787
PORT=3001
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=$JWT_SECRET
RESEND_API_KEY=
EMAIL_FROM=noreply@instantapi.com
EOF
    echo "✅ Created backend/.env with generated JWT_SECRET"
else
    echo "⚠️  backend/.env already exists, skipping"
fi

# Frontend .env
if [ ! -f frontend/.env ]; then
    cat > frontend/.env << EOF
VITE_API_BASE=http://localhost:3001
EOF
    echo "✅ Created frontend/.env"
else
    echo "⚠️  frontend/.env already exists, skipping"
fi

echo ""

# Start Docker Compose
echo "🐳 Starting PostgreSQL..."
npm run docker:up
echo ""

# Wait for Postgres to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run prisma:generate
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
cd backend
npx prisma migrate deploy
cd ..
echo ""

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "Option 1: Run all services at once (recommended):"
echo "   ./start.sh"
echo ""
echo "Option 2: Run services manually in separate terminals:"
echo "   Terminal 1: cd sandbox-worker && npm run dev"
echo "   Terminal 2: cd backend && npm run start:dev"
echo "   Terminal 3: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "📝 Notes:"
echo "   - Magic links are printed to backend console in development"
echo "   - For production, set RESEND_API_KEY in backend/.env"
echo "   - JWT_SECRET has been auto-generated for you"
echo ""
echo "🎉 Happy coding!"

