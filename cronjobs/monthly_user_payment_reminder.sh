#!/bin/bash
echo "RUN - Sending monthly user payment reminder cron task [$(date)]" >> /var/www/riyadah/cronjobs/logs/monthly_user_payment_reminder.log

# Example: call your Node.js script or API
cd /var/www/riyadah/cronjobs
/usr/bin/node monthlyUserPaymentReminder.js --monthly
