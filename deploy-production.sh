#!/bin/bash

# Quick Production Deployment Script
# Use this after initial setup to redeploy everything

echo "🚀 Deploying InstantAPI to Production"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root"
    exit 1
fi

# Function to ask yes/no
ask_deploy() {
    local service=$1
    echo ""
    read -p "Deploy $service? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# 1. Deploy Cloudflare Sandbox
if ask_deploy "Cloudflare Sandbox"; then
    echo ""
    echo -e "${BLUE}📦 Deploying Cloudflare Sandbox Worker...${NC}"
    cd sandbox-worker
    npm run deploy
    cd ..
    echo -e "${GREEN}✅ Sandbox deployed${NC}"
fi

# 2. Deploy Backend to Railway
if ask_deploy "Railway Backend"; then
    echo ""
    echo -e "${BLUE}🚂 Deploying Backend to Railway...${NC}"
    cd backend
    railway up
    cd ..
    echo -e "${GREEN}✅ Backend deployed${NC}"
fi

# 3. Run Database Migrations
if ask_deploy "Database Migrations"; then
    echo ""
    echo -e "${YELLOW}⚠️  Running database migrations...${NC}"
    cd backend
    railway run npx prisma migrate deploy
    cd ..
    echo -e "${GREEN}✅ Migrations complete${NC}"
fi

# 4. Deploy Frontend to Vercel
if ask_deploy "Vercel Frontend"; then
    echo ""
    echo -e "${BLUE}🎨 Deploying Frontend to Vercel...${NC}"
    cd frontend
    vercel --prod
    cd ..
    echo -e "${GREEN}✅ Frontend deployed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. Test your frontend URL"
echo "  2. Check Railway logs: railway logs --tail"
echo "  3. Verify email sending works"
echo ""

