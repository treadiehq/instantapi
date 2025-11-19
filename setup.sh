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
    cat > backend/.env << EOF
DATABASE_URL=postgresql://instant:instant@localhost:5432/instant?schema=public
CLOUDFLARE_SANDBOX_URL=http://localhost:8787
PORT=3001
EOF
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists, skipping"
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
echo "   When prompted, enter migration name: init"
npm run prisma:migrate
echo ""

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Start the Sandbox Worker (in a new terminal):"
echo "   cd sandbox-worker && npm run dev"
echo ""
echo "2. Start the Backend (in a new terminal):"
echo "   cd backend && npm run start:dev"
echo ""
echo "3. Start the Frontend (in a new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "Or run all services with:"
echo "   ./start.sh"
echo ""
echo "🎉 Happy coding!"

