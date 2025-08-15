import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatMeasurement } from './utils/measure';
import { calculatePriceDetails, getDiscounts, getTaxRates } from './utils/price';
import { trackUsage } from './analytics/UsageAnalytics';
import theme from './assets/styles/theme';
import { saveQuote, syncQuoteToCloud } from './storage/cloudSync';

export default function QuoteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const measurement = route.params?.measurement || null;

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [basePrice, setBasePrice] = useState(65);
  const [discounts, setDiscounts] = useState([]);
  const [taxRates, setTaxRates] = useState([]);
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    trackUsage('quote_screen_open');
    async function fetchPricingMeta() {
      setDiscounts(await getDiscounts());
      setTaxRates(await getTaxRates());
    }
    fetchPricingMeta();
    if (measurement && measurement.area) {
      computeQuote();
    }
  }, [measurement, basePrice, discounts, taxRates]);

  const computeQuote = () => {
    setLoading(true);
    setTimeout(() => {
      const details = calculatePriceDetails({
        area: measurement.area,
        basePrice,
        discounts,
        taxRates,
      });
      setQuoteDetails(details);
      setLoading(false);
      trackUsage('quote_computed');
    }, 300);
  };

  const saveAndSendQuote = () => {
    if (!customerName || !email || !quoteDetails) {
      Alert.alert('Missing info', 'Please enter customer and quote details.');
      return;
    }
    const quoteObj = {
      customerName,
      email,
      measurement,
      quoteDetails,
      date: new Date().toISOString(),
    };
    saveQuote(quoteObj);
    syncQuoteToCloud(quoteObj);
    Alert.alert('Quote Saved', 'Quote sent to CRM & cloud.');
    trackUsage('quote_saved');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Roof Quote</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Customer Name</Text>
        <TextInput
          style={styles.input}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Enter name"
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="Enter email"
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Base Price (per m²)</Text>
        <TextInput
          style={styles.input}
          value={basePrice.toString()}
          onChangeText={txt => setBasePrice(Number(txt))}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Measurement Details</Text>
        <Text style={styles.measureBox}>
          {measurement ? formatMeasurement(measurement) : "No measurement provided."}
        </Text>
      </View>
      <View style={styles.section}>
        <Button title="Compute Quote" color={theme.colors.success} onPress={computeQuote} />
        {loading && <Text style={styles.loading}>Calculating...</Text>}
        {quoteDetails && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>Total: ${quoteDetails.total.toFixed(2)}</Text>
            <Text>Base: ${quoteDetails.base.toFixed(2)}</Text>
            <Text>Discounts: -${quoteDetails.discountTotal.toFixed(2)}</Text>
            <Text>Tax: +${quoteDetails.taxTotal.toFixed(2)}</Text>
          </View>
        )}
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={styles.saveBtn} onPress={saveAndSendQuote}>
          <Text style={styles.saveText}>Save & Send Quote</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>All quotes are saved and synced to CRM & cloud storage.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary, marginTop: 24, marginBottom: 12, textAlign: 'center' },
  section: { marginBottom: 18, backgroundColor: theme.colors.card, padding: 14, borderRadius: 8 },
  label: { fontWeight: 'bold', color: theme.colors.secondary, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 6, padding: 8, marginBottom: 8 },
  measureBox: { fontSize: 14, marginBottom: 8, color: theme.colors.text },
  loading: { color: theme.colors.primary, fontSize: 14, marginTop: 8 },
  resultBox: { backgroundColor: theme.colors.secondary + '11', padding: 8, borderRadius: 6, marginTop: 10 },
  resultText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
  saveBtn: { backgroundColor: theme.colors.success, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { alignItems: 'center', marginTop: 20, marginBottom: 14 },
  footerText: { fontSize: 12, color: theme.colors.textMuted }
});
