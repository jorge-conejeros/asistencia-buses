// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { MD3DarkTheme, Provider as PaperProvider } from 'react-native-paper';

import AsistenciaScreen from './screens/AsistenciaScreen';
import HistorialScreen from './screens/HistorialScreen';
import LoginScreen from './screens/LoginScreen';
import { supabase } from './supabase';

const Stack = createNativeStackNavigator();

// Tema oscuro personalizado para React Native Paper
const tema = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#6366f1',
    secondary: '#a78bfa',
    background: '#12121e',
    surface: '#1e1e2e',
    onSurface: '#f0f0f5',
  },
};

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificar sesión activa al iniciar
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });

    // Escuchar cambios de autenticación
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#12121e' }}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <PaperProvider theme={tema}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {sesion ? (
            <>
              <Stack.Screen name="Asistencia" component={AsistenciaScreen} />
              <Stack.Screen name="Historial" component={HistorialScreen} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}