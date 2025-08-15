import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, Alert, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import Svg, { Circle, Polygon, Line } from 'react-native-svg';
import { measureRoof, formatMeasurement, exportToCSV, exportToJSON } from './utils/measure';
import { trackUsage } from './analytics/UsageAnalytics';
import { saveMeasurement, syncToCloud } from './storage/cloudSync';
import theme from './assets/styles/theme';

const { width, height } = Dimensions.get('window');

export default function MeasureScreen({ navigation }) {
  const [hasPerm, setHasPerm] = useState(null);
  const [points, setPoints] = useState([]);
  const [scaleMetersPerPx, setScale] = useState(null);
  const [refRealMeters, setRefRealMeters] = useState('');
  const [measurement, setMeasurement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCalibration, setShowCalibration] = useState(true);
  const camRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPerm(status === 'granted');
    })();
    trackUsage('measure_screen_open');
  }, []);

  const onTouch = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    setPoints((p) => [...p, { x: locationX, y: locationY }]);
  };

  const reset = () => {
    setPoints([]);
    setScale(null);
    setMeasurement(null);
    setShowCalibration(true);
  };

  const calibrate = () => {
    if (!refRealMeters || points.length < 2) {
      Alert.alert('Calibration', 'Mark two points for reference and enter real length.');
      return;
    }
    const p1 = points[0];
    const p2 = points[1];
    const pixelDist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    if (pixelDist === 0) {
      Alert.alert('Calibration', 'Points must not be identical.');
      return;
    }
    setScale(parseFloat(refRealMeters) / pixelDist);
    setShowCalibration(false);
    trackUsage('calibration_done');
    Alert.alert('Calibration', 'Calibration set successfully!');
  };

  const computeMeasurement = () => {
    if (points.length < 3) {
      Alert.alert('Need ≥3 points', 'Tap at least 3 points around a roof section');
      return;
    }
    if (!scaleMetersPerPx) {
      Alert.alert('Calibrate first', 'Mark two points and enter reference length (meters)');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = measureRoof(points, scaleMetersPerPx, { pricePerSqm: 65 });
      setMeasurement(result);
      setLoading(false);
      if (!result.error) trackUsage('measurement_computed');
    }, 300);
  };

  const exportData = (type = "csv") => {
    if (!measurement || measurement.error) {
      Alert.alert('Export Error', 'No valid measurement to export.');
      return;
    }
    let data = type === 'csv' ? exportToCSV(measurement) : exportToJSON(measurement);
    saveMeasurement(data, type); // Save locally
    syncToCloud(data, type);     // Cloud sync
    Alert.alert('Exported', `Measurement exported as ${type.toUpperCase()}!`);
    trackUsage('measurement_exported');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <Text style={styles.title}>Roof Measurement Tool</Text>
        <Button title="Reset" color={theme.colors.danger} onPress={reset} />
      </View>
      <View style={styles.cameraContainer}>
        {hasPerm === null ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : hasPerm === false ? (
          <Text style={{ color: theme.colors.danger }}>No camera access.</Text>
        ) : (
          <Camera
            ref={camRef}
            style={styles.camera}
            type={Camera.Constants.Type.back}
            ratio={"16:9"}
          >
            <TouchableOpacity
              style={styles.touchLayer}
              activeOpacity={0.7}
              onPress={onTouch}
            >
              <Svg height={height * 0.5} width={width}>
                {points.map((p, idx) => (
                  <Circle key={idx} cx={p.x} cy={p.y} r="7" fill={theme.colors.primary} />
                ))}
                {points.length > 2 && (
                  <Polygon
                    points={points.map(p => `${p.x},${p.y}`).join(" ")}
                    fill={theme.colors.primary + '33'}
                    stroke={theme.colors.secondary}
                    strokeWidth="2"
                  />
                )}
                {points.length > 1 && points.map((p, idx) => (
                  idx < points.length - 1 ? (
                    <Line
                      key={idx}
                      x1={p.x} y1={p.y}
                      x2={points[idx + 1].x} y2={points[idx + 1].y}
                      stroke={theme.colors.secondary}
                      strokeWidth="2"
                    />
                  ) : null
                ))}
              </Svg>
            </TouchableOpacity>
          </Camera>
        )}
      </View>
      {showCalibration && (
        <View style={styles.calibrationBox}>
          <Text style={styles.label}>Step 1: Calibrate</Text>
          <Text>Mark two points and enter real-world distance (meters):</Text>
          <TextInput
            style={styles.input}
            value={refRealMeters}
            onChangeText={setRefRealMeters}
            keyboardType="decimal-pad"
            placeholder="Reference length (m)"
          />
          <Button title="Calibrate" color={theme.colors.primary} onPress={calibrate} />
        </View>
      )}
      <View style={styles.measurementBox}>
        <Button
          title="Compute Measurement"
          color={theme.colors.success}
          onPress={computeMeasurement}
        />
        {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
        {measurement && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{formatMeasurement(measurement)}</Text>
            <View style={styles.exportRow}>
              <Button title="Export CSV" onPress={() => exportData("csv")} color={theme.colors.secondary} />
              <Button title="Export JSON" onPress={() => exportData("json")} color={theme.colors.secondary} />
            </View>
            <Button
              title="Go to Quote"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('Quote', { measurement })}
            />
          </View>
        )}
        {measurement && measurement.error && (
          <Text style={{ color: theme.colors.danger }}>{measurement.error}</Text>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Tip: Tap points clockwise around the roof!</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.colors.primary },
  cameraContainer: { width: '100%', height: height * 0.5, backgroundColor: '#222', borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  camera: { flex: 1, width: '100%', height: '100%', justifyContent: 'flex-end' },
  touchLayer: { flex: 1 },
  calibrationBox: { padding: 14, margin: 12, backgroundColor: theme.colors.card, borderRadius: 8 },
  label: { fontWeight: 'bold', color: theme.colors.secondary, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 6, padding: 8, marginVertical: 8 },
  measurementBox: { margin: 16, padding: 14, backgroundColor: theme.colors.card, borderRadius: 10 },
  resultBox: { marginTop: 10 },
  resultText: { fontSize: 16, color: theme.colors.primary, marginBottom: 8 },
  exportRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
  footer: { alignItems: 'center', marginTop: 20, marginBottom: 16 },
  footerText: { color: theme.colors.textMuted }
});
