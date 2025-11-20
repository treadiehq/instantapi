#!/bin/sh
cd /app
# Create symlink or copy public directory to where Nitro expects it
mkdir -p .output/server/chunks/public
cp -r .output/public/* .output/server/chunks/public/ 2>/dev/null || ln -s /app/.output/public/* /app/.output/server/chunks/public/ 2>/dev/null || true
echo "Starting Nitro server..."
node .output/server/index.mjs

