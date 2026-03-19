import { useState } from 'react'
import { Alert, View } from 'react-native'
import { Button, Card, Text, TextInput } from 'react-native-paper'
import { supabase } from '../supabase'

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    if (data.user) {
      navigation.replace('Asistencia') // 🔥 IMPORTANTE
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Card>
        <Card.Content>
          <Text variant="titleLarge">Ingreso Docente</Text>

          <TextInput label="Email" onChangeText={setEmail} />
          <TextInput label="Contraseña" secureTextEntry onChangeText={setPassword} />

          <Button mode="contained" onPress={login}>
            Ingresar
          </Button>
        </Card.Content>
      </Card>
    </View>
  )
}