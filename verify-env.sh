#!/bin/bash

# Environment Variables Verification Script
# Run this to check if all required variables are set in Railway

echo "🔍 Verifying Railway Environment Variables..."
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed"
    echo "   Install with: npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Get all variables
echo "📋 Checking required environment variables..."
echo ""

REQUIRED_VARS=(
    "DATABASE_URL"
    "CLOUDFLARE_SANDBOX_URL"
    "RESEND_API_KEY"
    "EMAIL_FROM"
    "JWT_SECRET"
    "NODE_ENV"
    "PORT"
    "BACKEND_URL"
    "FRONTEND_URL"
)

cd backend

MISSING=0
for var in "${REQUIRED_VARS[@]}"; do
    if railway variables | grep -q "^$var"; then
        echo "✅ $var is set"
    else
        echo "❌ $var is MISSING"
        MISSING=$((MISSING + 1))
    fi
done

echo ""
if [ $MISSING -eq 0 ]; then
    echo "🎉 All environment variables are set!"
    echo ""
    echo "📋 Current values:"
    railway variables
else
    echo "⚠️  $MISSING variable(s) missing!"
    echo ""
    echo "To set a variable, run:"
    echo '  railway variables set VARIABLE_NAME="value"'
fi

