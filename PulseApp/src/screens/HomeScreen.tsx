import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loadUser } from '../services/storage';
import { getIsolationScore } from '../services/signals';

const GREETINGS = ['Hey', 'Hi', 'Hello', 'Good to see you'];

export default function HomeScreen({ navigation }: any) {
  const [userName,  setUserName]  = useState('');
  const [score,     setScore]     = useState(0.32);
  const [nudge,     setNudge]     = useState('You\'ve been pretty connected this week. Keep it up 🌱');
  const scoreAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadUser().then(u => setUserName(u?.name || 'Friend'));
    getIsolationScore().then(s => {
      setScore(s);
      Animated.timing(scoreAnim, {
        toValue: s, duration: 1400, useNativeDriver: false
      }).start();
      if (s > 0.65) setNudge('Pulse noticed you\'ve been a bit quiet. Want to reach out to someone?');
      else if (s > 0.4) setNudge('You\'ve been a little more isolated lately. A small nudge might help.');
    });
  }, []);

  const greeting = GREETINGS[new Date().getHours() % GREETINGS.length];
  const scoreColor = score < 0.4 ? '#7EC8A0' : score < 0.65 ? '#C8A97E' : '#E87E7E';
  const scoreLabel = score < 0.4 ? 'Connected' : score < 0.65 ? 'Drifting' : 'Isolated';

  const barWidth = scoreAnim.interpolate({
    inputRange: [0, 1], outputRange: ['0%', '100%']
  });

  return (
    <LinearGradient colors={['#080A10', '#0A0D16']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, {userName}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.pulseDot} />
        </View>

        {/* Isolation Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Connection Signal</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>{scoreLabel}</Text>
            <Text style={[styles.scorePct, { color: scoreColor }]}>{Math.round(score * 100)}%</Text>
          </View>
          <View style={styles.scoreBarBg}>
            <Animated.View style={[styles.scoreBarFill, { width: barWidth, backgroundColor: scoreColor }]} />
          </View>
          <Text style={styles.scoreDesc}>Based on your patterns today · All processing on-device</Text>
        </View>

        {/* Nudge Card */}
        <TouchableOpacity
          style={styles.nudgeCard}
          onPress={() => navigation.navigate('Nudges')}
          activeOpacity={0.85}
        >
          <Text style={styles.nudgeIcon}>✦</Text>
          <View style={styles.nudgeContent}>
            <Text style={styles.nudgeTitle}>Today's nudge</Text>
            <Text style={styles.nudgeText}>{nudge}</Text>
          </View>
          <Text style={styles.nudgeArrow}>›</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.quickActions}>
          {[
            { icon: '💬', label: 'Talk to Pulse',  screen: 'Chat' },
            { icon: '📍', label: 'Find an event',  screen: 'Events' },
            { icon: '📈', label: 'My trends',       screen: 'Insights' },
          ].map(a => (
            <TouchableOpacity
              key={a.screen}
              style={styles.quickBtn}
              onPress={() => navigation.navigate(a.screen)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickIcon}>{a.icon}</Text>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent</Text>
        {[
          { text: 'You messaged a friend', time: '2h ago', positive: true },
          { text: 'Late-night scrolling detected', time: 'Last night', positive: false },
          { text: 'Attended a local event', time: '3 days ago', positive: true },
        ].map((item, i) => (
          <View key={i} style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: item.positive ? '#7EC8A0' : '#E87E7E' }]} />
            <Text style={styles.activityText}>{item.text}</Text>
            <Text style={styles.activityTime}>{item.time}</Text>
          </View>
        ))}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  scroll:       { padding: 24, paddingTop: 64, paddingBottom: 100 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  greeting:     { fontSize: 26, color: '#E8E4DC', fontWeight: '300', letterSpacing: -0.5 },
  date:         { fontSize: 13, color: '#6B7280', marginTop: 4 },
  pulseDot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: '#C8A97E',
                  shadowColor: '#C8A97E', shadowRadius: 8, shadowOpacity: 0.8, marginTop: 8 },

  scoreCard:    { backgroundColor: '#10131C', borderRadius: 20, padding: 24,
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 16 },
  scoreLabel:   { fontSize: 11, color: '#6B7280', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  scoreRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 },
  scoreValue:   { fontSize: 28, fontWeight: '300', letterSpacing: -0.5 },
  scorePct:     { fontSize: 40, fontWeight: '200', letterSpacing: -1 },
  scoreBarBg:   { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 2 },
  scoreDesc:    { fontSize: 11, color: '#6B7280', marginTop: 10 },

  nudgeCard:    { backgroundColor: '#13161F', borderRadius: 16, padding: 20,
                  borderWidth: 1, borderColor: 'rgba(200,169,126,0.2)',
                  flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 },
  nudgeIcon:    { fontSize: 18, color: '#C8A97E' },
  nudgeContent: { flex: 1 },
  nudgeTitle:   { fontSize: 11, color: '#C8A97E', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  nudgeText:    { fontSize: 14, color: '#9CA3AF', lineHeight: 20 },
  nudgeArrow:   { fontSize: 24, color: '#6B7280' },

  sectionTitle: { fontSize: 13, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  quickBtn:     { flex: 1, backgroundColor: '#10131C', borderRadius: 16, padding: 16,
                  alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  quickIcon:    { fontSize: 22, marginBottom: 8 },
  quickLabel:   { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },

  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  activityDot:  { width: 7, height: 7, borderRadius: 3.5 },
  activityText: { flex: 1, fontSize: 14, color: '#9CA3AF' },
  activityTime: { fontSize: 12, color: '#6B7280' },
});
