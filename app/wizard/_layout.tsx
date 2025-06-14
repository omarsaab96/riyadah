import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function WizardLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="step1" options={{ title: "step1", headerShown: false }} />
        <Stack.Screen name="step2" options={{ title: "step2", headerShown: false }} />
        <Stack.Screen name="step3" options={{ title: "step3", headerShown: false }} />
        <Stack.Screen name="step4" options={{ title: "step4", headerShown: false }} />
        <Stack.Screen name="step5" options={{ title: "step5", headerShown: false }} />

        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}