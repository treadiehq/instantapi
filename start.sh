#!/bin/bash

# Instant API - Start All Services
# This script starts all services with proper process management

set -e

echo "🚀 Starting Instant API..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create logs and pids directories
mkdir -p logs
mkdir -p .pids

# Function to kill all background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    ./stop.sh
    exit
}

trap cleanup INT TERM

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if Postgres is running
if ! docker ps | grep -q instant-api-db; then
    echo -e "${YELLOW}🐳 Starting Docker containers (PostgreSQL)...${NC}"
    npm run docker:up
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
    echo -e "${GREEN}✅ Docker containers started${NC}"
else
    echo -e "${GREEN}✅ Docker containers already running${NC}"
fi

# Check for required env files
if [ ! -f .env ]; then
    echo -e "${RED}❌ Missing .env file in root directory${NC}"
    echo "Please create .env with DATABASE_URL and CLOUDFLARE_SANDBOX_URL"
    exit 1
fi

if [ ! -f backend/.env ]; then
    echo -e "${RED}❌ Missing backend/.env file${NC}"
    echo "Please create backend/.env with DATABASE_URL and CLOUDFLARE_SANDBOX_URL"
    exit 1
fi

# Check if ports are available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $1 is already in use${NC}"
        echo "Run './stop.sh' first or kill the process using port $1"
        exit 1
    fi
}

check_port 8787
check_port 3001
check_port 3000

echo ""

# Start Sandbox Worker
echo -e "${YELLOW}🔧 Starting Sandbox Worker (port 8787)...${NC}"
cd sandbox-worker
npm run dev > ../logs/sandbox.log 2>&1 &
SANDBOX_PID=$!
echo $SANDBOX_PID > ../.pids/sandbox.pid
cd ..

# Wait for sandbox to be ready
echo "⏳ Waiting for Sandbox Worker..."
for i in {1..30}; do
    if curl -s http://localhost:8787 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Sandbox Worker ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Sandbox Worker failed to start. Check logs/sandbox.log${NC}"
        exit 1
    fi
    sleep 1
done

# Start Backend
echo -e "${YELLOW}⚙️  Starting Backend (port 3001)...${NC}"
cd backend
npm run start:dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../.pids/backend.pid
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for Backend..."
for i in {1..60}; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend ready${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${RED}❌ Backend failed to start. Check logs/backend.log${NC}"
        exit 1
    fi
    sleep 1
done

# Start Frontend
echo -e "${YELLOW}🎨 Starting Frontend (port 3000)...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../.pids/frontend.pid
cd ..

# Wait for frontend to be ready
echo "⏳ Waiting for Frontend..."
for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend ready${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${RED}❌ Frontend failed to start. Check logs/frontend.log${NC}"
        exit 1
    fi
    sleep 1
done

echo ""
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo ""
echo "📍 Services:"
echo "   - Frontend:  http://localhost:3000"
echo "   - Backend:   http://localhost:3001/health"
echo "   - Sandbox:   http://localhost:8787"
echo "   - Database:  postgresql://localhost:5432/instant"
echo ""
echo "📝 Logs:"
echo "   - Sandbox:   tail -f logs/sandbox.log"
echo "   - Backend:   tail -f logs/backend.log"
echo "   - Frontend:  tail -f logs/frontend.log"
echo ""
echo "🎯 Quick Commands:"
echo "   - Check status:  ./status.sh"
echo "   - Stop services: ./stop.sh"
echo "   - Restart:       ./restart.sh"
echo ""
echo "🌐 Open http://localhost:3000 to start using Instant API!"
echo ""
echo "Press Ctrl+C to stop all services, or run './stop.sh' in another terminal"
echo ""

# Keep script running and wait for interrupt
wait
