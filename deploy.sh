#!/bin/bash
echo "🚀 Starting deployment for Riyadah..."

# Stop on first error
set -e

# Go to project folder
cd /var/www/riyadah

echo "📦 Pulling latest changes from GitHub..."
git reset --hard
git pull origin master

echo "📂 Entering server folder..."
cd server

echo "📦 Installing dependencies..."
npm install --omit=dev

echo "♻️ Restarting PM2 process..."
pm2 restart riyadah || pm2 start index.js --name riyadah

echo "💾 Saving PM2 process list..."
pm2 save

echo "✅ Deployment complete!"
