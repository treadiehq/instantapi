#!/bin/sh
cd /app
ls -la .output/
ls -la .output/public/ || echo "No public directory found"
ls -la .output/server/ || echo "No server directory found"
echo "Starting Nitro server..."
node .output/server/index.mjs

