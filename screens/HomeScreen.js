import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to The Roof Doctors</Text>
      <Text style={styles.subtitle}>
        Use this app to measure roof area and get a quote!
      </Text>
      <Button
        title="Start Measurement"
        onPress={() => navigation.navigate('Measure')}
      />
      <Button
        title="See Quote"
        onPress={() => navigation.navigate('Quote')}
      />
      <Button
        title="Settings"
        onPress={() => navigation.navigate('Settings')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 16, marginBottom: 30, textAlign: 'center' },
})
