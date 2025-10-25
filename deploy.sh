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
pm2 restart eventExpander || pm2 start workers/recurrenceWorker.js --name eventExpander
pm2 restart eventNotifier || pm2 start workers/notificationsWorker.js --name eventNotifier
pm2 restart paymentAuditor || pm2 start workers/paymentWorker.js --name paymentAuditor
pm2 restart monthlyReminder || pm2 start workers/monthlyReminderWorker.js --name monthlyReminder
pm2 restart thirtyMinutesEventReminder || pm2 start workers/thirtyMinutesEventReminder.js --name thirtyMinutesEventReminder


echo "***** Saving PM2 process list..."
pm2 save

echo "***** Deployment complete!"
