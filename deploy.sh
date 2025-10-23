#!/bin/bash
echo "***** Starting deployment for Riyadah..."

# Stop on first error
set -e

# Go to project folder
cd /var/www/riyadah

echo "***** Pulling latest changes from GitHub..."
git reset --hard
git pull origin master

echo "***** Entering server folder..."
cd server

echo "***** Installing dependencies..."
npm install

echo "***** Restarting PM2 process..."
pm2 restart riyadah || pm2 start index.js --name riyadah
pm2 restart recur-worker || pm2 start workers/recurrenceWorker.js --name recur-worker
pm2 restart notif-worker || pm2 start workers/notificationsWorker.js --name notif-worker

echo "***** Saving PM2 process list..."
pm2 save

echo "***** Deployment complete!"
