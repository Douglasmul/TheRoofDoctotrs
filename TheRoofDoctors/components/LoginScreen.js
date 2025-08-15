import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import theme from '../assets/styles/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    Alert.alert('Login', 'Logged in successfully!');
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} color={theme.colors.primary} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} color={theme.colors.secondary} />
      <Button title="Forgot Password?" onPress={() => navigation.navigate('ForgotPassword')} color={theme.colors.card} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 6, padding: 8, marginBottom: 12, backgroundColor: theme.colors.card }
});
