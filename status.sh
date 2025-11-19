#!/bin/bash

# Instant API - Status Check
# This script checks the status of all services

echo "📊 Instant API Status Check"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if a process is running by PID
check_pid() {
    local service_name=$1
    local pid_file=".pids/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name${NC} is running (PID: $pid)"
            return 0
        else
            echo -e "${RED}❌ $service_name${NC} has stale PID file"
            return 1
        fi
    else
        echo -e "${RED}❌ $service_name${NC} is not running"
        return 1
    fi
}

# Function to check if port is in use
check_port() {
    local service_name=$1
    local port=$2
    local url=$3
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -ti:$port 2>/dev/null | head -n1)
        
        # Try to hit the endpoint
        if [ ! -z "$url" ]; then
            if curl -s -f "$url" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ $service_name${NC} responding on port $port (PID: $pid)"
                echo -e "   ${BLUE}→${NC} $url"
                return 0
            else
                echo -e "${YELLOW}⚠️  $service_name${NC} is on port $port but not responding (PID: $pid)"
                return 1
            fi
        else
            echo -e "${GREEN}✅ $service_name${NC} is on port $port (PID: $pid)"
            return 0
        fi
    else
        echo -e "${RED}❌ $service_name${NC} is not running on port $port"
        return 1
    fi
}

# Function to check Docker container
check_docker() {
    local container_name=$1
    
    if docker ps --filter "name=$container_name" --format "{{.Names}}" 2>/dev/null | grep -q "$container_name"; then
        local status=$(docker ps --filter "name=$container_name" --format "{{.Status}}")
        echo -e "${GREEN}✅ Docker: $container_name${NC} is running"
        echo -e "   ${BLUE}→${NC} $status"
        return 0
    else
        echo -e "${RED}❌ Docker: $container_name${NC} is not running"
        return 1
    fi
}

# Check Docker
echo "🐳 Docker Containers:"
if command -v docker &> /dev/null; then
    check_docker "instant-api-db"
else
    echo -e "${RED}❌ Docker${NC} is not installed or not in PATH"
fi

echo ""
echo "🔧 Services:"

# Check each service
check_port "Sandbox Worker" 8787 "http://localhost:8787"
check_port "Backend API" 3001 "http://localhost:3001/health"
check_port "Frontend" 3000 "http://localhost:3000"

echo ""
echo "📝 Log Files:"
if [ -d "logs" ]; then
    for log in logs/*.log; do
        if [ -f "$log" ]; then
            local size=$(du -h "$log" | cut -f1)
            local modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$log" 2>/dev/null || stat -c "%y" "$log" 2>/dev/null | cut -d. -f1)
            echo -e "   ${BLUE}→${NC} $(basename $log) ($size, modified: $modified)"
        fi
    done
else
    echo -e "   ${YELLOW}⚠️  No logs directory found${NC}"
fi

echo ""
echo "💾 Database Connection:"
if command -v psql &> /dev/null && [ -f .env ]; then
    source .env
    if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
        local count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"Endpoint\"" 2>/dev/null | xargs)
        echo -e "${GREEN}✅ PostgreSQL${NC} connection successful"
        echo -e "   ${BLUE}→${NC} $count endpoint(s) in database"
    else
        echo -e "${RED}❌ PostgreSQL${NC} connection failed"
    fi
else
    if docker ps | grep -q instant-api-db; then
        echo -e "${GREEN}✅ PostgreSQL${NC} container running (connection not tested)"
    else
        echo -e "${RED}❌ PostgreSQL${NC} container not running"
    fi
fi

echo ""
echo "🌐 Quick Links:"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "   ${GREEN}→${NC} Frontend:  http://localhost:3000"
else
    echo -e "   ${RED}→${NC} Frontend:  http://localhost:3000 (not available)"
fi

if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}→${NC} Backend:   http://localhost:3001/health"
else
    echo -e "   ${RED}→${NC} Backend:   http://localhost:3001/health (not available)"
fi

if curl -s http://localhost:8787 > /dev/null 2>&1; then
    echo -e "   ${GREEN}→${NC} Sandbox:   http://localhost:8787"
else
    echo -e "   ${RED}→${NC} Sandbox:   http://localhost:8787 (not available)"
fi

echo ""
echo "🎯 Management Commands:"
echo "   ./start.sh     - Start all services"
echo "   ./stop.sh      - Stop all services"
echo "   ./restart.sh   - Restart all services"
echo "   ./status.sh    - Check status (this command)"
echo ""

# Exit with appropriate code
if check_port "Frontend" 3000 "" >/dev/null 2>&1 && \
   check_port "Backend" 3001 "" >/dev/null 2>&1 && \
   check_port "Sandbox" 8787 "" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ All services are running!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some services are not running${NC}"
    exit 1
fi

