import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DAYS    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SCORES  = [0.72, 0.65, 0.58, 0.45, 0.38, 0.30, 0.32];
const TODAY   = 6;

const STATS = [
  { label: 'Avg isolation',  value: '47%',  delta: '↓ 12% vs last week', positive: true },
  { label: 'Nudges taken',   value: '8',    delta: '↑ 3 vs last week',   positive: true },
  { label: 'Connections made', value: '5',  delta: '↑ 2 vs last week',   positive: true },
  { label: 'Lonely nights',  value: '2',    delta: '↓ 1 vs last week',   positive: true },
];

function scoreColor(s: number) {
  if (s < 0.4) return '#7EC8A0';
  if (s < 0.65) return '#C8A97E';
  return '#E87E7E';
}

export default function InsightsScreen() {
  const maxScore = Math.max(...SCORES);
  const chartH   = 120;

  return (
    <LinearGradient colors={['#080A10', '#0A0D16']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>Your insights</Text>
          <Text style={styles.sub}>Last 7 days</Text>
        </View>

        {/* Bar chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Isolation score · 7 days</Text>
          <View style={styles.chart}>
            {SCORES.map((score, i) => {
              const barH = (score / maxScore) * chartH;
              const color = scoreColor(score);
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barPct}>{Math.round(score * 100)}%</Text>
                  <View style={[styles.barBg, { height: chartH }]}>
                    <View style={[styles.barFill, { height: barH, backgroundColor: color,
                      opacity: i === TODAY ? 1 : 0.55 }]} />
                  </View>
                  <Text style={[styles.barDay, i === TODAY && styles.barDayActive]}>{DAYS[i]}</Text>
                  {i === TODAY && <View style={styles.todayDot} />}
                </View>
              );
            })}
          </View>
          <View style={styles.legend}>
            {[['#7EC8A0','Connected'],['#C8A97E','Drifting'],['#E87E7E','Isolated']].map(([c,l]) => (
              <View key={l} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: c }]} />
                <Text style={styles.legendText}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={[styles.statDelta, { color: stat.positive ? '#7EC8A0' : '#E87E7E' }]}>
                {stat.delta}
              </Text>
            </View>
          ))}
        </View>

        {/* Signal breakdown */}
        <View style={styles.signalsCard}>
          <Text style={styles.signalsTitle}>Signal breakdown</Text>
          {[
            { label: 'Message frequency',  score: 0.38, note: 'Healthy' },
            { label: 'Late-night scrolling', score: 0.62, note: 'Watch this' },
            { label: 'Social app usage',   score: 0.45, note: 'Passive' },
            { label: 'Days since last call', score: 0.25, note: 'Good' },
          ].map((sig, i) => (
            <View key={i} style={styles.sigRow}>
              <View style={styles.sigLeft}>
                <Text style={styles.sigLabel}>{sig.label}</Text>
                <Text style={[styles.sigNote, { color: scoreColor(sig.score) }]}>{sig.note}</Text>
              </View>
              <View style={styles.sigBarBg}>
                <View style={[styles.sigBarFill, { width: `${sig.score * 100}%`, backgroundColor: scoreColor(sig.score) }]} />
              </View>
            </View>
          ))}
          <Text style={styles.signalsFooter}>All signals processed on-device · Never leaves your phone</Text>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  scroll:         { padding: 24, paddingTop: 64, paddingBottom: 100, gap: 16 },
  header:         { marginBottom: 8 },
  title:          { fontSize: 28, color: '#E8E4DC', fontWeight: '300', letterSpacing: -0.5 },
  sub:            { fontSize: 13, color: '#6B7280', marginTop: 4 },
  chartCard:      { backgroundColor: '#10131C', borderRadius: 20, padding: 20,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  chartTitle:     { fontSize: 11, color: '#6B7280', letterSpacing: 1.5,
                    textTransform: 'uppercase', marginBottom: 20 },
  chart:          { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 16 },
  barCol:         { flex: 1, alignItems: 'center', gap: 6 },
  barPct:         { fontSize: 9, color: '#6B7280' },
  barBg:          { width: '100%', justifyContent: 'flex-end',
                    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 4 },
  barFill:        { width: '100%', borderRadius: 4 },
  barDay:         { fontSize: 10, color: '#6B7280' },
  barDayActive:   { color: '#C8A97E' },
  todayDot:       { width: 4, height: 4, borderRadius: 2, backgroundColor: '#C8A97E' },
  legend:         { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:      { width: 6, height: 6, borderRadius: 3 },
  legendText:     { fontSize: 11, color: '#6B7280' },
  statsGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard:       { width: (width - 58) / 2, backgroundColor: '#10131C', borderRadius: 16,
                    padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statLabel:      { fontSize: 11, color: '#6B7280', letterSpacing: 0.5, marginBottom: 8 },
  statValue:      { fontSize: 28, color: '#E8E4DC', fontWeight: '200', letterSpacing: -0.5, marginBottom: 4 },
  statDelta:      { fontSize: 11 },
  signalsCard:    { backgroundColor: '#10131C', borderRadius: 20, padding: 20,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 16 },
  signalsTitle:   { fontSize: 11, color: '#6B7280', letterSpacing: 1.5, textTransform: 'uppercase' },
  sigRow:         { gap: 8 },
  sigLeft:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sigLabel:       { fontSize: 14, color: '#9CA3AF' },
  sigNote:        { fontSize: 11, fontWeight: '500' },
  sigBarBg:       { height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  sigBarFill:     { height: '100%', borderRadius: 2 },
  signalsFooter:  { fontSize: 10, color: '#6B7280', textAlign: 'center', marginTop: 4 },
});
