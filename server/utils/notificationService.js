const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendNotification(user, title, body, data = {}) {
  if (!user.expoPushToken) {
    console.log('Missing Expo push token')
    throw new Error('Missing Expo push token');
  }

  if (!Expo.isExpoPushToken(user.expoPushToken)) {
    console.log('Invalid Expo push token')
    throw new Error('Invalid Expo push token');
  }

  console.log('Sending notification to', user._id)

  const messages = [{
    to: user.expoPushToken,
    sound: 'default',
    title: title || 'Riyadah',
    body: body || 'Notification',
    data: data || {},
  }];

  const tickets = await expo.sendPushNotificationsAsync(messages);
  console.log('Push notification tickets:', tickets);
  return tickets;
}

module.exports = { sendNotification };