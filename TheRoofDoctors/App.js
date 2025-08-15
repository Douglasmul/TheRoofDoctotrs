import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, LogBox, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import MainNavigator from './navigation/MainNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import { ThemeProvider } from 'styled-components/native';
import theme from './assets/styles/theme';
import { ErrorBoundary } from 'react-error-boundary';
import { trackUsage, logError, initAnalytics } from './analytics/UsageAnalytics';
import { initCloudSync } from './storage/cloudSync';
import { getUserSession, subscribeToSession } from './crm/LeadIntegration';

LogBox.ignoreLogs(['Setting a timer']); // Ignore common RN warning

function ErrorFallback({ error, resetErrorBoundary }) {
  logError(error);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 18, color: 'red', marginBottom: 12 }}>Something went wrong:</Text>
      <Text style={{ marginBottom: 12 }}>{error.message}</Text>
      <Button title="Try Again" onPress={resetErrorBoundary} />
    </View>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        initAnalytics();
        await initCloudSync();
        const user = await getUserSession();
        setSession(user);
        trackUsage('app_open');
      } catch (err) {
        logError(err);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
    const unsub = subscribeToSession(setSession);
    return () => unsub && unsub();
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background}}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider theme={theme}>
        <NavigationContainer theme={DefaultTheme} linking={{
          prefixes: ['myapp://', 'https://mycompany.com/app'],
          config: {
            screens: {
              Home: 'home',
              Measure: 'measure',
              Quote: 'quote',
              Settings: 'settings',
              About: 'about'
            }
          }
        }}>
          {session && session.isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
