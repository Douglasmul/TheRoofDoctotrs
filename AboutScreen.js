import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, Linking, StyleSheet, ScrollView, Platform } from 'react-native';
import theme from './assets/styles/theme';
import logo from './assets/logo.png';
import { getCompanyDocs } from './assets/companyDocs/';
import { trackUsage } from './analytics/UsageAnalytics';

export default function AboutScreen() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackUsage('about_screen_open');
    async function fetchDocs() {
      try {
        const docList = await getCompanyDocs();
        setDocs(docList);
      } catch (err) {
        // Handle error silently for now
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  const openDoc = (url) => {
    Linking.openURL(url);
    trackUsage('about_doc_opened');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>About My Roofing Company</Text>
        <Text style={styles.subtitle}>Enterprise Roof Measurement Suite</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.text}>
          My Roofing Company offers advanced measurement, quoting, and lead management tools for contractors, surveyors, and enterprise teams.
        </Text>
        <Text style={styles.text}>
          Version: 2.1.0{Platform.OS === 'ios' ? ' (iOS)' : Platform.OS === 'android' ? ' (Android)' : ''}
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company Documents</Text>
        {loading ? (
          <Text>Loading documents...</Text>
        ) : docs.length === 0 ? (
          <Text>No docs available.</Text>
        ) : (
          docs.map((doc, idx) => (
            <Button
              key={idx}
              title={doc.title}
              onPress={() => openDoc(doc.url)}
              color={theme.colors.primary}
            />
          ))
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact & Support</Text>
        <Text style={styles.text}>Email: support@myroofcompany.com</Text>
        <Text style={styles.text}>Phone: +1-800-555-ROOF</Text>
        <Button
          title="Visit Website"
          onPress={() => Linking.openURL('https://myroofcompany.com')}
          color={theme.colors.secondary}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <Text style={styles.text}>All data is stored securely and complies with GDPR, CCPA, and enterprise data standards.</Text>
        <Text style={styles.text}>© 2025 My Roofing Company. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 16 },
  header: { alignItems: 'center', marginTop: 30, marginBottom: 16 },
  logo: { width: 78, height: 78, borderRadius: 39, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
  subtitle: { fontSize: 16, color: theme.colors.secondary, marginBottom: 6 },
  section: { backgroundColor: theme.colors.card, padding: 14, borderRadius: 8, marginBottom: 18 },
  sectionTitle: { fontWeight: 'bold', color: theme.colors.secondary, marginBottom: 8, fontSize: 16 },
  text: { color: theme.colors.text, marginBottom: 6 }
});
