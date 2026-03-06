import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Nudge {
  id: string;
  type: 'reach_out' | 'micro_event' | 'tiny_action';
  title: string;
  body: string;
  cta: string;
  done: boolean;
}

const NUDGES: Nudge[] = [
  { id: '1', type: 'reach_out',   title: 'Reach out',    done: false,
    body: "You haven't messaged Maya in 3 weeks. She posted a story yesterday.",
    cta: 'React to her story' },
  { id: '2', type: 'tiny_action', title: 'Tiny action',  done: false,
    body: "Send one voice note today instead of a text. It's warmer.",
    cta: 'Open voice memo' },
  { id: '3', type: 'reach_out',   title: 'Old friend',   done: false,
    body: "James hasn't heard from you in 6 weeks. A meme or a 'thinking of you' goes a long way.",
    cta: 'Send a message' },
  { id: '4', type: 'micro_event', title: 'Get outside',  done: false,
    body: "A quiet reading hour at the local café — 2pm today. No pressure, no agenda.",
    cta: 'See details' },
  { id: '5', type: 'tiny_action', title: 'Self-anchor',  done: true,
    body: "You went for a walk yesterday. That counts. ✓",
    cta: 'Done' },
];

const TYPE_COLOR: Record<string, string> = {
  reach_out:   '#C8A97E',
  micro_event: '#7EB8C8',
  tiny_action: '#7EC8A0',
};

const TYPE_ICON: Record<string, string> = {
  reach_out:   '👋',
  micro_event: '📍',
  tiny_action: '✦',
};

export default function NudgesScreen() {
  const [nudges, setNudges] = useState(NUDGES);

  function markDone(id: string) {
    setNudges(prev => prev.map(n => n.id === id ? { ...n, done: true } : n));
    Alert.alert('✓ Done!', 'Nice. Small actions add up. 🌱', [{ text: 'OK' }]);
  }

  const pending = nudges.filter(n => !n.done);
  const done    = nudges.filter(n => n.done);

  return (
    <LinearGradient colors={['#080A10', '#0A0D16']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's nudges</Text>
        <Text style={styles.sub}>{pending.length} remaining · {done.length} done</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {pending.map(nudge => (
          <View key={nudge.id} style={styles.card}>
            <View style={[styles.cardAccent, { backgroundColor: TYPE_COLOR[nudge.type] }]} />
            <View style={styles.cardInner}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{TYPE_ICON[nudge.type]}</Text>
                <Text style={[styles.cardType, { color: TYPE_COLOR[nudge.type] }]}>{nudge.title}</Text>
              </View>
              <Text style={styles.cardBody}>{nudge.body}</Text>
              <TouchableOpacity
                style={[styles.ctaBtn, { borderColor: TYPE_COLOR[nudge.type] }]}
                onPress={() => markDone(nudge.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.ctaText, { color: TYPE_COLOR[nudge.type] }]}>{nudge.cta}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {done.length > 0 && (
          <>
            <Text style={styles.doneLabel}>Completed</Text>
            {done.map(nudge => (
              <View key={nudge.id} style={[styles.card, styles.cardDone]}>
                <View style={[styles.cardAccent, { backgroundColor: '#2A2E3D' }]} />
                <View style={styles.cardInner}>
                  <Text style={styles.cardBodyDone}>{nudge.body}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Nudges refresh daily · Based on your signal patterns</Text>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { paddingTop: 64, paddingHorizontal: 24, paddingBottom: 20 },
  title:        { fontSize: 28, color: '#E8E4DC', fontWeight: '300', letterSpacing: -0.5 },
  sub:          { fontSize: 13, color: '#6B7280', marginTop: 4 },
  scroll:       { padding: 24, paddingTop: 8, paddingBottom: 100, gap: 12 },
  card:         { backgroundColor: '#10131C', borderRadius: 18, flexDirection: 'row',
                  overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardDone:     { opacity: 0.45 },
  cardAccent:   { width: 4 },
  cardInner:    { flex: 1, padding: 18 },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardIcon:     { fontSize: 16 },
  cardType:     { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '500' },
  cardBody:     { fontSize: 15, color: '#9CA3AF', lineHeight: 22, marginBottom: 16 },
  cardBodyDone: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  ctaBtn:       { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 100,
                  paddingHorizontal: 18, paddingVertical: 9 },
  ctaText:      { fontSize: 13, fontWeight: '500' },
  doneLabel:    { fontSize: 11, color: '#6B7280', letterSpacing: 1.5,
                  textTransform: 'uppercase', marginTop: 16, marginBottom: 4 },
  footer:       { marginTop: 20, alignItems: 'center' },
  footerText:   { fontSize: 11, color: '#6B7280', textAlign: 'center' },
});
