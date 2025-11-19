#!/bin/bash

# Instant API - Restart All Services
# This script stops and starts all services

set -e

echo "🔄 Restarting Instant API..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop all services
echo -e "${YELLOW}Step 1/2: Stopping services...${NC}"
./stop.sh

# Wait a moment
echo ""
echo "⏳ Waiting 2 seconds..."
sleep 2

# Start all services
echo ""
echo -e "${YELLOW}Step 2/2: Starting services...${NC}"
echo ""
./start.sh

