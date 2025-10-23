#!/bin/bash
echo "RUN - Cron#2 [$(date)] - checking schedule and notifying users" >> /var/www/riyadah/cronjobs/logs/scheduleNotifier.log

# Example: call your Node.js script or API
cd /var/www/riyadah/server/cronjobs
/usr/bin/node scheduleNotifier.js

echo "DONE - Cron#2 [$(date)]" >> /var/www/riyadah/cronjobs/logs/scheduleNotifier.log


# run it with crontab
# * * * * * /usr/bin/node /var/www/riyadah/server/cronjobs/eventReminderWorker.js >> /var/www/riyadah/cronjobs/logs/eventReminder.log 2>&1