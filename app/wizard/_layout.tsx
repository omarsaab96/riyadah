import { useLanguage } from '@/context/language';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function WizardLayout() {
  const colorScheme = useColorScheme();
  const { t } = useLanguage();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="step1" options={{ title: t('wizard.accountType'), headerShown: false }} />
        <Stack.Screen name="step2" options={{ title: t('wizard.dobTitle'), headerShown: false }} />
        <Stack.Screen name="step3" options={{ title: t('wizard.sportType'), headerShown: false }} />
        <Stack.Screen name="step4" options={{ title: t('wizard.addClubs'), headerShown: false }} />
        <Stack.Screen name="step5" options={{ title: t('wizard.aboutYou'), headerShown: false }} />

        <Stack.Screen name="+not-found" options={{ title: t('notFound.title') }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
