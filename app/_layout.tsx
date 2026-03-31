import { useColorScheme } from '@/hooks/useColorScheme';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import 'react-native-get-random-values';
import 'react-native-reanimated';
import { I18nManager, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider, useLanguage } from '../context/language';
import { RegistrationProvider } from '../context/registration';

const linking = {
  prefixes: ['riyadah://', 'https://riyadah.app'],
  config: {
    screens: {
      Post: 'posts/:postId',
    },
  },
};

function RootLayoutContent() {
  const router = useRouter();
  const { isReady } = useLanguage();

  useEffect(() => {
    const normalizeNativeDirection = () => {
      if (!I18nManager.isRTL) return;

      try {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
        I18nManager.swapLeftAndRightInRTL(false);
      } catch (error) {
        console.log('Error normalizing native direction:', error);
      }
    };

    normalizeNativeDirection();
  }, []);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        if (!Updates.isEnabled) return;
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
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
        const decodedToken = jwtDecode(token);
        const response = await fetch(`https://server.riyadah.app/api/users/${decodedToken.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const user = await response.json();
          if (user.type === "Manager" || user.type === "superadmin") {
            router.replace('/manager/dashboard');
          }else{
            router.replace('/landing');
          }
        } else {
          console.error('API error')
        }

        
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

  if (!loaded || !isReady) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <RegistrationProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DefaultTheme}>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ title: "Home" }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="light" />
          </View>
        </ThemeProvider>
      </RegistrationProvider>
    </SafeAreaProvider >

  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <RootLayoutContent />
    </LanguageProvider>
  );
}
