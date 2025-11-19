#!/bin/bash

# Instant API - Stop All Services
# This script stops all running services

echo "🛑 Stopping Instant API services..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to stop a service by PID file
stop_service() {
    local service_name=$1
    local pid_file=".pids/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}Stopping $service_name (PID: $pid)...${NC}"
            kill $pid 2>/dev/null || true
            
            # Wait for process to die
            for i in {1..10}; do
                if ! ps -p $pid > /dev/null 2>&1; then
                    echo -e "${GREEN}✅ $service_name stopped${NC}"
                    rm "$pid_file"
                    return 0
                fi
                sleep 0.5
            done
            
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${YELLOW}Force stopping $service_name...${NC}"
                kill -9 $pid 2>/dev/null || true
                sleep 1
            fi
            
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name not running (stale PID file)${NC}"
        fi
        rm "$pid_file" 2>/dev/null || true
    else
        echo -e "${YELLOW}⚠️  $service_name not running (no PID file)${NC}"
    fi
}

# Function to stop services by port
stop_by_port() {
    local service_name=$1
    local port=$2
    
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Found $service_name on port $port (PID: $pid)${NC}"
        kill $pid 2>/dev/null || true
        sleep 1
        
        # Force kill if still running
        if ps -p $pid > /dev/null 2>&1; then
            kill -9 $pid 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ $service_name stopped${NC}"
    fi
}

# Stop services by PID files first
stop_service "frontend"
stop_service "backend"
stop_service "sandbox"

# Also check by ports (in case PID files are missing)
stop_by_port "Frontend" 3000
stop_by_port "Backend" 3001
stop_by_port "Sandbox" 8787

# Clean up PID directory
rm -rf .pids 2>/dev/null || true

# Stop Docker containers
if docker ps | grep -q instant-api-db; then
    echo ""
    echo -e "${YELLOW}🐳 Stopping Docker containers...${NC}"
    npm run docker:down > /dev/null 2>&1
    echo -e "${GREEN}✅ Docker containers stopped${NC}"
fi

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""

