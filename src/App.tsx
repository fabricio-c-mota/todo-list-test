import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TaskCreateScreen from './view/TaskCreateScreen';
import TaskDetailScreen from './view/TaskDetailScreen';
import TaskListScreen from './view/TaskListScreen';
import { ThemeProvider, useAppTheme } from './view/theme/ThemeContext';
import { RootStackParamList } from './view/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigation() {
  const { theme } = useAppTheme();

  const baseNavigationTheme = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = useMemo(
    () => ({
      ...baseNavigationTheme,
      colors: {
        ...baseNavigationTheme.colors,
        background: theme.colors.background,
        border: 'transparent',
        card: theme.colors.card,
        primary: theme.colors.primary,
        text: theme.colors.textPrimary,
        notification: theme.colors.warning,
      },
    }),
    [baseNavigationTheme, theme]
  );

  const statusBarStyle = theme.mode === 'dark' ? 'light' : 'dark';

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={statusBarStyle} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.card },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="TaskList"
          component={TaskListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TaskCreate"
          component={TaskCreateScreen}
          options={{ title: 'Nova Tarefa' }}
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetailScreen}
          options={{ title: 'Detalhes da Tarefa' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppNavigation />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
