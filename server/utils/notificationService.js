const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendNotification(user, title, body, data = {}) {
  console.log("received user=", user)
  if (!user.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) {
    throw new Error('Invalid or missing Expo push token');
  }

  const messages = [{
    to: user.expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  }];

  return await expo.sendPushNotificationsAsync(messages);
}

module.exports = { sendNotification };