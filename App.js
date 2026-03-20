// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';

import AlumnosScreen from './screens/AlumnosScreen';
import AsistenciaScreen from './screens/AsistenciaScreen';
import HistorialScreen from './screens/HistorialScreen';
import LoginScreen from './screens/LoginScreen';
import PerfilScreen from './screens/PerfilScreen';
import { supabase } from './supabase';
import { colors, paperTheme } from './theme';

const Stack = createNativeStackNavigator();

const tema = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, ...paperTheme.colors } };

export default function App() {
  const [sesion, setSesion]     = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSesion(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgBase }}>
        <ActivityIndicator color={colors.primary} size="large" />
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
              <Stack.Screen name="Historial"  component={HistorialScreen} />
              <Stack.Screen name="Alumnos"    component={AlumnosScreen} />
              <Stack.Screen name="Perfil"     component={PerfilScreen} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}