import { useColorScheme } from '@/hooks/useColorScheme';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect } from "react";
import { Alert } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RegistrationProvider } from '../context/registration';

const linking = {
  prefixes: ['riyadah://', 'https://riyadah.app'],
  config: {
    screens: {
      Post: 'posts/:postId',
    },
  },
};

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Update Available',
            'A new version of Riyadah is ready. Restart to update?',
            [
              { text: 'Later' },
              { text: 'Restart', onPress: () => Updates.reloadAsync() }
            ]
          );
        }
      } catch (error) {
        console.log('Error checking for updates:', error);
      }
    };

    checkForUpdates();
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        router.replace('/landing');
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received:", notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log("Notification tapped:", data);

      // Example: data = { screen: "staff/timesheet", id: "68af3a1cdc2139d825ad504a" }
      if (data?.screen) {
        router.push({
          pathname: `/${data.screen}`,
          params: data,
        });
      } else {
        router.push('/landing'); // fallback if no target screen
      }
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'Bebas': require('../assets/fonts/BebasNeue-Regular.ttf'),
    'Manrope': require('../assets/fonts/Manrope.ttf'),
    'Acumin': require('../assets/fonts/Acumin.ttf'),
    'Qatar': require('../assets/fonts/Qatar.ttf'),
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <RegistrationProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "Home" }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </RegistrationProvider>
    </SafeAreaProvider >

  );
}