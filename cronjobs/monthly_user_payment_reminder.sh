#!/bin/bash
echo "RUN - Cron#1 [$(date)] - Sending monthly user payment reminder" >> /var/www/riyadah/cronjobs/logs/monthly_user_payment_reminder.log

# Example: call your Node.js script or API
cd /var/www/riyadah/cronjobs
/usr/bin/node monthlyUserPaymentReminder.js --monthly

echo "DONE - Cron#1 [$(date)]" >> /var/www/riyadah/cronjobs/logs/monthly_user_payment_reminder.log
