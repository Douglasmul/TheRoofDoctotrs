



import React, {useState, useEffect, useRef} from 'react';
import { View, Text, Button, StyleSheet, Dimensions, Alert, TextInput } from 'react-native';
import { Camera } from 'expo-camera';
import Svg, { Circle, Line, Polygon, Rect } from 'react-native-svg';
import { polygonAreaPxToSqm } from '../utils/measure';

const { width, height } = Dimensions.get('window');

export default function MeasureScreen({navigation}){
  const [hasPerm, setHasPerm] = useState(null);
  const [points, setPoints] = useState([]); // [{x,y}]
  const [scaleMetersPerPx, setScale] = useState(null);
  const [refRealMeters, setRefRealMeters] = useState('1'); // reference object length in meters
  const camRef = useRef(null);

  useEffect(()=>{
    (async ()=>{
      const {status} = await Camera.requestCameraPermissionsAsync();
      setHasPerm(status === 'granted');
    })();
  }, []);

  const onTouch = (e)=>{
    const { locationX, locationY } = e.nativeEvent;
    setPoints(p => [...p, {x: locationX, y: locationY}]);
  };

  const reset = ()=>{ setPoints([]); setScale(null); };

  const computeArea = ()=>{
    if(points.length < 3){ Alert.alert('Need ≥3 points','Tap at least 3 points around an area'); return; }
    if(!scaleMetersPerPx){ Alert.alert('Calibrate first','Enter a reference object real length and tap two points'); return; }
    const sqm = polygonAreaPxToSqm(points, parseFloat(scaleMetersPerPx));
    const sqft = sqm * 10.76391041671;
    navigation.navigate('Quote', { areaSqm: sqm, areaSqft: sqft, points });
  };

  // calibration helper: user taps two points that correspond to the known real-world length
  const calibrateWithTwoPoints = ()=>{
    if(points.length < 2){ Alert.alert('Calibration', 'Tap two points that correspond to the reference object'); return; }
    const a = points[points.length-2];
    const b = points[points.length-1];
    const dx = b.x - a.x, dy = b.y - a.y;
    const pxDist = Math.sqrt(dx*dx + dy*dy);
    const meters = parseFloat(refRealMeters) || 1;
    setScale(meters / pxDist); // meters per pixel
  };

  return (
    <View style={styles.container}>
      <Camera ref={camRef} style={styles.camera} />
      <Svg
        style={StyleSheet.absoluteFill}
        onPress={onTouch}
      >
        {points.map((pt, i) => (
          <Circle key={i} cx={pt.x} cy={pt.y} r={5} fill="blue" />
        ))}
        {points.length > 1 && points.map((pt, i) => (
          i > 0
            ? <Line
                key={i+'line'}
                x1={points[i-1].x}
                y1={points[i-1].y}
                x2={pt.x}
                y2={pt.y}
                stroke="blue"
                strokeWidth={2}
              />
            : null
        ))}
        {points.length > 2 && (
          <Polygon
            points={points.map(p=>`${p.x},${p.y}`).join(' ')}
            fill="rgba(0,0,255,0.2)"
            stroke="blue"
            strokeWidth={2}
          />
        )}
      </Svg>
      <View style={styles.overlay}>
        <Text>Reference Object Length (meters):</Text>
        <TextInput
          style={styles.input}
          value={refRealMeters}
          onChangeText={setRefRealMeters}
          keyboardType="numeric"
        />
        <Button title="Calibrate" onPress={calibrateWithTwoPoints} />
        <Button title="Compute Area" onPress={computeArea} />
        <Button title="Reset" onPress={reset} />
        <Text>Points: {points.length}</Text>
        <Text>Scale: {scaleMetersPerPx ? scaleMetersPerPx.toFixed(4) : 'Not calibrated'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    padding: 8,
    marginVertical: 5,
    width: 120
  }
});
