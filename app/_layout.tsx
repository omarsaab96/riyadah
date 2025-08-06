import { useColorScheme } from '@/hooks/useColorScheme';
import { registerForPushNotificationsAsync } from '@/hooks/usePushToken';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
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
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        const decodedToken = jwtDecode(token);
        registerForPushNotificationsAsync(decodedToken.userId,token).then(pushToken => {
          if (pushToken) {
            console.log(pushToken)
          }
        });
        router.replace('/landing');
      }
    };



    checkToken();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received:", notification);
    });

    return () => subscription.remove();
  }, []);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'Bebas': require('../assets/fonts/BebasNeue-Regular.ttf'),
    'Manrope': require('../assets/fonts/Manrope.ttf'),
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
          <StatusBar style="light" translucent={false} backgroundColor="#FF4000" />
        </ThemeProvider>
      </RegistrationProvider>
    </SafeAreaProvider >

  );
}