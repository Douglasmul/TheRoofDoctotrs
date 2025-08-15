import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { trackUsage } from './analytics/UsageAnalytics';
import { getCompanyNews, getQuickStats } from './crm/LeadIntegration';
import theme from './assets/styles/theme';
import logo from './assets/logo.png';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackUsage('home_open');
    async function fetchData() {
      try {
        const newsData = await getCompanyNews();
        const statsData = await getQuickStats();
        setNews(newsData);
        setStats(statsData);
      } catch (err) {
        Alert.alert('Error', 'Failed to load dashboard info.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.companyName}>My Roofing Company</Text>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Today's Quick Stats</Text>
        {stats ? (
          <>
            <Text>Leads: {stats.leads}</Text>
            <Text>Quotes: {stats.quotes}</Text>
            <Text>Revenue: ${stats.revenue.toLocaleString()}</Text>
          </>
        ) : (
          <Text>Loading stats...</Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Measure')}>
          <Text style={styles.actionText}>New Measurement</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Quote')}>
          <Text style={styles.actionText}>Get Quick Quote</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('LeadCapture')}>
          <Text style={styles.actionText}>Capture Lead</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.newsSection}>
        <Text style={styles.cardTitle}>Company News</Text>
        {loading ? (
          <Text>Loading news...</Text>
        ) : news && news.length > 0 ? (
          news.map((item, idx) => (
            <View key={idx} style={styles.newsItem}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsBody}>{item.body}</Text>
            </View>
          ))
        ) : (
          <Text>No news available.</Text>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 My Roofing Company. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { alignItems: 'center', marginTop: 24, marginBottom: 16 },
  logo: { width: 80, height: 80, marginBottom: 8, borderRadius: 40 },
  companyName: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
  statsCard: {
    backgroundColor: theme.colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 3
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: theme.colors.secondary },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  actionBtn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 8,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: "#222", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2
  },
  actionText: { color: '#fff', fontWeight: 'bold' },
  newsSection: { marginHorizontal: 16, marginVertical: 18 },
  newsItem: { marginBottom: 12, backgroundColor: theme.colors.card, borderRadius: 8, padding: 10 },
  newsTitle: { fontWeight: 'bold', color: theme.colors.primary },
  newsBody: { color: theme.colors.text },
  footer: { alignItems: 'center', marginTop: 32, marginBottom: 20 },
  footerText: { fontSize: 12, color: theme.colors.textMuted }
});
