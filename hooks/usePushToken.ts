import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync(userId, authToken) {
  let token;

  // Check if the device is real (not web or simulator)
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Ask for permission if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }

    // Get the token
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);

    try {
      const response = await fetch(`https://riyadah.onrender.com/api/users/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ userId, expoPushToken: token }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to register push token:', response.status, errorText);
      } else {
        console.log('Push token registered successfully');
      }
    } catch (error) {
      console.error('Error while registering push token:', error);
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  // Android only: set notification behavior
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
