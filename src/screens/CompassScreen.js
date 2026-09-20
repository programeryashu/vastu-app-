/**
 * CompassScreen — High-Accuracy Vastu Compass (Mobile-Optimized)
 *
 * Uses expo-location heading (sensor-fused) for best accuracy.
 * Content stays above the bottom tab bar.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDirectionByRange } from '../data/vastuDirections';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(SCREEN_WIDTH * 0.58, 260);
const BUFFER_SIZE = 10;

const DIRECTIONS = [
  { label: 'N', name: 'North', hindi: 'उत्तर', icon: '🌊', degree: 0, color: '#3498db' },
  { label: 'NE', name: 'North-East', hindi: 'ईशान', icon: '⛰️', degree: 45, color: '#9b59b6' },
  { label: 'E', name: 'East', hindi: 'पूर्व', icon: '☀️', degree: 90, color: '#f39c12' },
  { label: 'SE', name: 'South-East', hindi: 'आग्नेय', icon: '🔥', degree: 135, color: '#e74c3c' },
  { label: 'S', name: 'South', hindi: 'दक्षिण', icon: '🔻', degree: 180, color: '#2c3e50' },
  { label: 'SW', name: 'South-West', hindi: 'नैऋत्य', icon: '⛰️', degree: 225, color: '#7f8c8d' },
  { label: 'W', name: 'West', hindi: 'पश्चिम', icon: '🌊', degree: 270, color: '#1abc9c' },
  { label: 'NW', name: 'North-West', hindi: 'वायव्य', icon: '💨', degree: 315, color: '#16a085' },
];

const getDir = (deg) => {
  const d = ((deg % 360) + 360) % 360;
  if (d >= 337.5 || d < 22.5) return DIRECTIONS[0];
  if (d < 67.5) return DIRECTIONS[1];
  if (d < 112.5) return DIRECTIONS[2];
  if (d < 157.5) return DIRECTIONS[3];
  if (d < 202.5) return DIRECTIONS[4];
  if (d < 247.5) return DIRECTIONS[5];
  if (d < 292.5) return DIRECTIONS[6];
  return DIRECTIONS[7];
};

class CircBuf {
  constructor(s) { this.b = []; this.s = s; }
  push(v) { this.b.push(v); if (this.b.length > this.s) this.b.shift(); }
  mean() {
    if (!this.b.length) return 0;
    let sin = 0, cos = 0;
    for (const v of this.b) { sin += Math.sin(v * Math.PI / 180); cos += Math.cos(v * Math.PI / 180); }
    return ((Math.atan2(sin, cos) * 180 / Math.PI) % 360 + 360) % 360;
  }
  variance() {
    if (this.b.length < 3) return 0;
    const avg = this.mean();
    return this.b.reduce((s, v) => { let d = v - avg; if (d > 180) d -= 360; if (d < -180) d += 360; return s + d * d; }, 0) / this.b.length;
  }
  get len() { return this.b.length; }
}

const CompassScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [heading, setHeading] = useState(0);
  // real | permission_denied | services_off | dev_simulation | unsupported
  const [sensorMode, setSensorMode] = useState('unsupported');
  // unknown | granted | denied | blocked (denied but can never ask again)
  const [permission, setPermission] = useState('unknown');
  // location | magnetometer | deviceorientation
  const [source, setSource] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [needsCalibration, setNeedsCalibration] = useState(false);
  const [locked, setLocked] = useState(null);
  const [lockedDir, setLockedDir] = useState(null);
  const [lockedTime, setLockedTime] = useState(null);

  const filterRef = useRef(new CircBuf(BUFFER_SIZE));
  const smoothRef = useRef(0);
  const locationSubRef = useRef(null);
  const magSubRef = useRef(null);
  const devRef = useRef(null);
  const initRef = useRef(false);
  const gotEventRef = useRef(false);
  const sourceRef = useRef(null);

  const setSourceSafe = (src) => { sourceRef.current = src; setSource(src); };

  const h = locked ?? heading;
  const dir = getDir(h);
  const vastuDir = getDirectionByRange(h);

  const smooth = useCallback((raw) => {
    filterRef.current.push(raw);
    const avg = filterRef.current.mean();
    const v = filterRef.current.variance();
    const a = v < 4 ? 0.4 : v < 15 ? 0.25 : 0.12;
    const prev = smoothRef.current;
    let d = avg - prev; if (d > 180) d -= 360; if (d < -180) d += 360;
    smoothRef.current = ((prev + d * a) % 360 + 360) % 360;
    return Math.round(smoothRef.current);
  }, []);

  const mapLocAcc = useCallback((acc) => {
    if (acc < 10) { setAccuracy('high'); setNeedsCalibration(false); }
    else if (acc < 25) { setAccuracy('medium'); setNeedsCalibration(false); }
    else { setAccuracy('low'); setNeedsCalibration(true); }
  }, []);

  const checkMagAcc = useCallback(() => {
    if (filterRef.current.len < 5) { setAccuracy(null); return; }
    const v = filterRef.current.variance();
    if (v < 3) { setAccuracy('high'); setNeedsCalibration(false); }
    else if (v < 15) { setAccuracy('medium'); setNeedsCalibration(false); }
    else { setAccuracy('low'); setNeedsCalibration(true); }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    init();
    return () => cleanup();
  }, []);

  // Best path: OS sensor-fused heading (magnetometer + gyro + accel via location services)
  const startLocationHeading = async () => {
    try {
      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) { setSensorMode('services_off'); return true; }
      locationSubRef.current = await Location.watchHeadingAsync((hd) => {
        const deg = hd.magneticHeading;
        if (hd.accuracy != null) mapLocAcc(hd.accuracy); else checkMagAcc();
        setHeading(smooth(deg));
      });
      setSensorMode('real');
      setSourceSafe('location');
      return true;
    } catch (e) {
      return false; // watchHeadingAsync unsupported on this device → try magnetometer
    }
  };

  // Fallback: raw magnetometer heading
  const startMagnetometer = async () => {
    try {
      const available = await Magnetometer.isAvailableAsync();
      if (!available) return false;
      setSensorMode('real');
      setSourceSafe('magnetometer');
      Magnetometer.setUpdateInterval(40);
      magSubRef.current = Magnetometer.addListener((data) => {
        let deg = Math.atan2(data.y, data.x) * 180 / Math.PI;
        deg = (deg + 360) % 360;
        setHeading(smooth(deg));
        checkMagAcc();
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  const init = async () => {
    if (Platform.OS !== 'web') {
      try {
        const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermission(canAskAgain ? 'denied' : 'blocked');
          setSensorMode('permission_denied');
          return;
        }
        setPermission('granted');
        if (await startLocationHeading()) return;
        if (await startMagnetometer()) return;
        setSensorMode('dev_simulation');
        startDev();
        return;
      } catch (e) {
        setSensorMode('dev_simulation');
        startDev();
        return;
      }
    }
    // Web: browser DeviceOrientation (iOS Safari needs an HTTPS page + permission request)
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r !== 'granted') { setSensorMode('dev_simulation'); startDev(); return; }
      }
      if (typeof DeviceOrientationEvent !== 'undefined') {
        const handler = (e) => {
          const deg = e.webkitCompassHeading ?? ((e.alpha != null) ? (-e.alpha + 360) % 360 : null);
          if (deg == null) return; // empty event (desktop Chrome fires one with no sensor data)
          gotEventRef.current = true;
          if (sourceRef.current !== 'deviceorientation') { setSensorMode('real'); setSourceSafe('deviceorientation'); }
          setHeading(smooth(deg));
          checkMagAcc();
        };
        window.addEventListener('deviceorientation', handler);
        locationSubRef.current = { remove: () => window.removeEventListener('deviceorientation', handler) };
        setTimeout(() => {
          if (!gotEventRef.current) { setSensorMode('dev_simulation'); startDev(); }
        }, 2500);
        return;
      }
    } catch (e) {}
    setSensorMode('dev_simulation');
    startDev();
  };

  // Re-request permission from the Allow Access button (or re-check GPS when enabled)
  const grantAccess = async () => {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermission('granted');
        if (!(await startLocationHeading())) {
          if (!(await startMagnetometer())) { setSensorMode('dev_simulation'); startDev(); }
        }
      } else {
        setPermission(canAskAgain ? 'denied' : 'blocked');
        setSensorMode('permission_denied');
      }
    } catch (e) {}
  };

  const openAppSettings = () => { Linking.openSettings(); };

  const startDev = () => {
    let h = 45;
    devRef.current = setInterval(() => {
      h = (h + (Math.random() - 0.3) * 3 + 360) % 360;
      filterRef.current.push(h);
      setHeading(Math.round(h));
    }, 40);
  };

  const cleanup = () => {
    locationSubRef.current?.remove();
    magSubRef.current?.remove();
    devRef.current && clearInterval(devRef.current);
  };

  const lock = () => { setLocked(heading); setLockedDir(dir); setLockedTime(new Date().toLocaleTimeString()); };
  const unlock = () => { setLocked(null); setLockedDir(null); setLockedTime(null); };

  const PILL = {
    real: { bg: '#E8F5EC', fg: '#4A7C59', label: 'Active' },
    permission_denied: { bg: '#FDECEC', fg: '#B54A4A', label: 'No Access' },
    services_off: { bg: '#FFF3E0', fg: '#C9893E', label: 'GPS Off' },
    dev_simulation: { bg: '#FFF0E6', fg: '#FF6B35', label: '🛠️ Sim' },
    unsupported: { bg: '#FDECEC', fg: '#B54A4A', label: 'No Sensor' },
  };
  const pill = PILL[sensorMode] ?? PILL.unsupported;
  const showPermCard = sensorMode === 'permission_denied' || sensorMode === 'services_off';

  return (
    <View style={[s.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* ═══ STATUS ═══ */}
      <View style={s.topBar}>
        <View style={[s.pill, { backgroundColor: pill.bg }]}>
          <View style={[s.dot, { backgroundColor: pill.fg }]} />
          <Text style={[s.pillText, { color: pill.fg }]}>{pill.label}</Text>
        </View>
        {sensorMode === 'real' && accuracy && (
          <View style={[s.pill, { backgroundColor: accuracy === 'high' ? '#E8F5EC' : accuracy === 'medium' ? '#FFF3E0' : '#FDECEC' }]}>
            <View style={[s.dot, { backgroundColor: accuracy === 'high' ? '#4A7C59' : accuracy === 'medium' ? '#C9893E' : '#B54A4A' }]} />
            <Text style={[s.pillText, { color: accuracy === 'high' ? '#4A7C59' : accuracy === 'medium' ? '#C9893E' : '#B54A4A' }]}>
              {accuracy === 'high' ? 'High' : accuracy === 'medium' ? 'Med' : 'Low'}
            </Text>
          </View>
        )}
      </View>
      {sensorMode === 'real' && (
        <Text style={s.statusSub}>
          {source === 'location' ? 'Sensor-fused heading (GPS + magnetometer)' : source === 'deviceorientation' ? 'Device orientation sensor' : 'Raw magnetometer'}
        </Text>
      )}

      {needsCalibration && sensorMode === 'real' && (
        <View style={s.calib}>
          <Ionicons name="pulse" size={12} color="#C9893E" />
          <Text style={s.calibText}>Move in figure-eight to calibrate</Text>
        </View>
      )}

      {/* ═══ PERMISSION / GPS CARD ═══ */}
      {showPermCard && (
        <View style={s.permCard}>
          <Ionicons name="location" size={18} color="#C9893E" />
          <Text style={s.permTitle}>
            {sensorMode === 'services_off' ? 'Location services are off' : 'Location access needed'}
          </Text>
          <Text style={s.permText}>
            {sensorMode === 'services_off'
              ? 'The compass fuses GPS heading with the magnetometer for accuracy. Turn on location in your phone settings, then tap Retry.'
              : 'The compass needs location access to read your device heading sensor. Your position is never stored or shared.'}
          </Text>
          <TouchableOpacity
            style={s.permBtn}
            onPress={permission === 'blocked' ? openAppSettings : grantAccess}
            activeOpacity={0.7}
          >
            <Ionicons name={permission === 'blocked' ? 'settings-outline' : 'location'} size={14} color="#FFF" />
            <Text style={s.permBtnText}>{permission === 'blocked' ? 'Open Settings' : 'Allow Location Access'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ═══ COMPASS ═══ */}
      <View style={s.compassWrap}>
        <View style={s.outerRing}>
          <View style={s.face}>
            {[...Array(72)].map((_, i) => {
              const deg = i * 5;
              const major = deg % 30 === 0;
              return (
                <View key={i} style={[s.tickWrap, { transform: [{ rotate: `${deg}deg` }] }]}>
                  <View style={[s.tick, { backgroundColor: major ? '#C9A96E' : '#D4C9B8' }, major && s.tickMajor]} />
                </View>
              );
            })}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <View key={deg} style={[s.degWrap, { transform: [{ rotate: `${deg}deg` }] }]}>
                <Text style={[s.degLabel, { transform: [{ rotate: `${-deg}deg` }] }]}>{deg}°</Text>
              </View>
            ))}
            {DIRECTIONS.map((d) => {
              const active = d.label === dir.label;
              const isN = d.label === 'N';
              return (
                <View key={d.label} style={[s.dirWrap, { transform: [{ rotate: `${d.degree}deg` }] }]}>
                  <View style={[s.dirInner, { transform: [{ rotate: `${-d.degree}deg` }] }]}>
                    <Text style={s.dirIcon}>{d.icon}</Text>
                    <Text style={[s.dirLabel, { color: isN ? '#B54A4A' : active ? '#C9A96E' : '#5D4E37' }, active && s.dirActive]}>{d.label}</Text>
                    <Text style={[s.dirHindi, { color: active ? '#5D4E37' : '#A69B90' }]}>{d.hindi}</Text>
                  </View>
                </View>
              );
            })}
            <View style={[s.needle, { transform: [{ rotate: `${-h}deg` }] }]}>
              <View style={s.needleN} />
              <View style={s.needleS} />
            </View>
            <View style={s.center} />
            <View style={s.centerInner} />
          </View>
        </View>
      </View>

      {/* ═══ BOTTOM: Heading + Lock (above tab bar) ═══ */}
      <View style={[s.bottomBlock, { paddingBottom: 8 }]}>
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <View style={s.infoLeft}>
              <Text style={s.infoLabel}>{lockedDir ? 'Locked' : 'Facing'}</Text>
              <Text style={[s.infoDir, { color: dir.color }]}>{lockedDir?.name ?? dir.name}</Text>
            </View>
            <View style={s.infoRight}>
              <Text style={s.infoDeg}>{h}°</Text>
              <Text style={s.infoTrad}>{vastuDir.traditionalName}</Text>
            </View>
          </View>
          {!locked ? (
            <TouchableOpacity style={s.lockBtn} onPress={lock} activeOpacity={0.7}>
              <Ionicons name="lock-closed" size={16} color="#FFF" />
              <Text style={s.lockText}>Lock</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.lockedRow}>
              <Text style={s.lockedInfo}>{lockedDir?.name} • {locked}° • {lockedTime}</Text>
              <TouchableOpacity style={s.unlockBtn} onPress={unlock}>
                <Ionicons name="lock-open" size={14} color="#5D4E37" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={s.tip}>Keep away from metal for best accuracy</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 16, backgroundColor: '#FAF8F5' },
  topBar: { flexDirection: 'row', gap: 6, marginBottom: 2 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 10, fontWeight: '700' },
  statusSub: { fontSize: 9, color: '#A69B90', fontWeight: '500', marginBottom: 2 },
  calib: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, gap: 4, marginBottom: 4 },
  calibText: { fontSize: 10, color: '#C9893E', fontWeight: '600' },
  permCard: { width: '100%', backgroundColor: '#FFF7EE', borderColor: '#F0D9B8', borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 6, marginBottom: 8 },
  permTitle: { fontSize: 13, fontWeight: '700', color: '#5D4E37' },
  permText: { fontSize: 11, color: '#7A6A55', textAlign: 'center', lineHeight: 16 },
  permBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#5D4E37', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 9, gap: 6, marginTop: 2 },
  permBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  compassWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  outerRing: { width: COMPASS_SIZE, height: COMPASS_SIZE, borderRadius: COMPASS_SIZE / 2, borderWidth: 2.5, borderColor: '#C9A96E', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5EFE6', shadowColor: '#C9A96E', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 },
  face: { width: COMPASS_SIZE - 12, height: COMPASS_SIZE - 12, borderRadius: (COMPASS_SIZE - 12) / 2, backgroundColor: '#FAF8F5', borderWidth: 1, borderColor: '#E8D5A8', justifyContent: 'center', alignItems: 'center' },
  tickWrap: { position: 'absolute', width: 2, height: (COMPASS_SIZE - 12) / 2, alignItems: 'center' },
  tick: { width: 1.5, height: 5, borderRadius: 1 },
  tickMajor: { height: 10, width: 2 },
  degWrap: { position: 'absolute', width: 24, height: COMPASS_SIZE - 12, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 },
  degLabel: { fontSize: 7, fontWeight: '600', color: '#A69B90' },
  dirWrap: { position: 'absolute', width: 60, height: COMPASS_SIZE - 12, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 22 },
  dirInner: { alignItems: 'center', gap: 0 },
  dirIcon: { fontSize: 10 },
  dirLabel: { fontSize: 13, fontWeight: '800' },
  dirActive: { fontSize: 16 },
  dirHindi: { fontSize: 7, fontWeight: '500' },
  needle: { position: 'absolute', width: 3, height: COMPASS_SIZE - 36, alignItems: 'center' },
  needleN: { width: 3, height: (COMPASS_SIZE - 36) / 2, backgroundColor: '#B54A4A', borderTopLeftRadius: 1.5, borderTopRightRadius: 1.5 },
  needleS: { width: 3, height: (COMPASS_SIZE - 36) / 2, backgroundColor: '#C0C0C0', borderBottomLeftRadius: 1.5, borderBottomRightRadius: 1.5 },
  center: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: '#C9A96E', borderWidth: 1.5, borderColor: '#E8D5A8' },
  centerInner: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#5D4E37' },
  // ── Bottom block (stays above tab bar) ──
  bottomBlock: { width: '100%' },
  infoCard: { width: '100%', backgroundColor: '#2D3A2E', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  infoLeft: {},
  infoLabel: { fontSize: 9, color: '#8B9B8E', fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' },
  infoDir: { fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
  infoRight: { alignItems: 'flex-end' },
  infoDeg: { fontSize: 24, fontWeight: '300', color: '#C9A96E', letterSpacing: -0.5 },
  infoTrad: { fontSize: 10, color: '#8B9B8E', fontWeight: '500', fontStyle: 'italic' },
  lockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#5D4E37', paddingVertical: 10, borderRadius: 10, gap: 6 },
  lockText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  lockedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lockedInfo: { fontSize: 10, color: '#8B9B8E', fontWeight: '500', flex: 1 },
  unlockBtn: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 8 },
  tip: { fontSize: 9, color: '#B0A89E', textAlign: 'center', marginTop: 6 },
});

export default CompassScreen;