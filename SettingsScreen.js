import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Button, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from './assets/styles/theme';
import { getSettings, saveSettings, resetSettings } from './storage/localStorage';
import { syncSettingsToCloud } from './storage/cloudSync';
import { trackUsage } from './analytics/UsageAnalytics';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    basePrice: 65,
    currency: 'USD',
    autoSync: true,
    crmApiKey: '',
    measurementUnit: 'metric', // 'imperial' or 'metric'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackUsage('settings_screen_open');
    async function fetchSettings() {
      try {
        const s = await getSettings();
        if (s) setSettings(s);
      } catch (err) {
        Alert.alert('Error', 'Could not load settings.');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveSettings(settings);
      if (settings.autoSync) await syncSettingsToCloud(settings);
      Alert.alert('Settings', 'Settings saved and synced!');
      trackUsage('settings_saved');
    } catch (err) {
      Alert.alert('Error', 'Could not save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    Alert.alert('Confirm', 'Reset all settings to default?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => {
        setLoading(true);
        await resetSettings();
        setSettings({
          notifications: true,
          darkMode: false,
          basePrice: 65,
          currency: 'USD',
          autoSync: true,
          crmApiKey: '',
          measurementUnit: 'metric',
        });
        setLoading(false);
        Alert.alert('Settings', 'Settings reset to default.');
        trackUsage('settings_reset');
      } }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>App Settings</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Enable Notifications</Text>
          <Switch
            value={settings.notifications}
            onValueChange={v => setSettings(s => ({ ...s, notifications: v }))}
            thumbColor={settings.notifications ? theme.colors.primary : '#eee'}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch
            value={settings.darkMode}
            onValueChange={v => setSettings(s => ({ ...s, darkMode: v }))}
            thumbColor={settings.darkMode ? theme.colors.secondary : '#eee'}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Auto Sync to Cloud</Text>
          <Switch
            value={settings.autoSync}
            onValueChange={v => setSettings(s => ({ ...s, autoSync: v }))}
            thumbColor={settings.autoSync ? theme.colors.success : '#eee'}
          />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Base Price (per m²)</Text>
        <TextInput
          style={styles.input}
          value={settings.basePrice.toString()}
          onChangeText={v => setSettings(s => ({ ...s, basePrice: Number(v) }))}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Currency</Text>
        <TextInput
          style={styles.input}
          value={settings.currency}
          onChangeText={v => setSettings(s => ({ ...s, currency: v }))}
        />
        <Text style={styles.label}>Measurement Unit</Text>
        <View style={styles.row}>
          <Button title="Metric" color={settings.measurementUnit === 'metric' ? theme.colors.primary : theme.colors.card}
            onPress={() => setSettings(s => ({ ...s, measurementUnit: 'metric' }))}
          />
          <Button title="Imperial" color={settings.measurementUnit === 'imperial' ? theme.colors.primary : theme.colors.card}
            onPress={() => setSettings(s => ({ ...s, measurementUnit: 'imperial' }))}
          />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>CRM API Key</Text>
        <TextInput
          style={styles.input}
          value={settings.crmApiKey}
          onChangeText={v => setSettings(s => ({ ...s, crmApiKey: v }))}
          placeholder="Enter CRM integration key"
        />
      </View>
      <View style={styles.section}>
        <Button title="Save Settings" onPress={handleSave} color={theme.colors.success} disabled={loading} />
        <Button title="Reset to Default" onPress={handleReset} color={theme.colors.danger} disabled={loading} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>All settings are stored locally and can sync to cloud/CRM.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 14 },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.colors.primary, marginTop: 24, marginBottom: 16, textAlign: 'center' },
  section: { marginBottom: 20, backgroundColor: theme.colors.card, padding: 14, borderRadius: 8 },
  label: { fontWeight: 'bold', color: theme.colors.secondary, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 6, padding: 8, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  footer: { alignItems: 'center', marginTop: 18, marginBottom: 12 },
  footerText: { fontSize: 12, color: theme.colors.textMuted }
});
