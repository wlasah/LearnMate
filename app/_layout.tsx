// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quiz-select" />
        <Stack.Screen name="quiz-start" />
        <Stack.Screen name="notes" />
        <Stack.Screen name="upload-pdf" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="study" />
      </Stack>
    </AuthProvider>
  );
}
