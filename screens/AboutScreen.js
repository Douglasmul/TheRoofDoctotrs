import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About The Roof Doctors</Text>
      <Text style={styles.body}>
        The Roof Doctors is dedicated to providing accurate roof measurements and fast, reliable quotes.
        This app helps homeowners and professionals measure roof areas and request estimates with ease.
        Thank you for using our service!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  body: { fontSize: 16, textAlign: 'center' }
});
