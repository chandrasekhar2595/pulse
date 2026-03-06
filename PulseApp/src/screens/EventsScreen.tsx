import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const VIBES = ['All', 'Quiet', 'Social', 'Active', 'Creative'];

const EVENTS = [
  { id: '1', title: 'Silent Reading Hour', location: 'Bloom Café · 0.4mi',
    time: 'Today 2:00 PM', vibe: 'Quiet', attendees: 6, desc: 'Bring a book. No agenda. Just people being quietly together.' },
  { id: '2', title: 'Sunset Walk Group', location: 'Riverside Park · 0.8mi',
    time: 'Today 6:30 PM', vibe: 'Active', attendees: 12, desc: 'Easy 30-min walk. All paces welcome. Great for clearing your head.' },
  { id: '3', title: 'Board Games Night', location: 'The Common Room · 1.2mi',
    time: 'Tomorrow 7:00 PM', vibe: 'Social', attendees: 8, desc: 'Friendly games, no experience needed. Show up solo, leave with friends.' },
  { id: '4', title: 'Sketch & Coffee', location: 'Studio 14 · 1.5mi',
    time: 'Saturday 10:00 AM', vibe: 'Creative', attendees: 5, desc: 'Casual drawing session. All skill levels. Just bring a pen.' },
  { id: '5', title: 'Morning Meditation', location: 'Zen Space · 0.6mi',
    time: 'Tomorrow 7:30 AM', vibe: 'Quiet', attendees: 9, desc: '20 minutes of guided meditation, open to all.' },
];

const VIBE_COLOR: Record<string, string> = {
  Quiet: '#7EB8C8', Social: '#C8A97E', Active: '#7EC8A0', Creative: '#B87EB8'
};

export default function EventsScreen() {
  const [activeVibe, setActiveVibe] = useState('All');

  const filtered = activeVibe === 'All' ? EVENTS : EVENTS.filter(e => e.vibe === activeVibe);

  return (
    <LinearGradient colors={['#080A10', '#0A0D16']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby events</Text>
        <Text style={styles.sub}>Low-pressure. No agenda. Just people.</Text>
      </View>

      {/* Vibe filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vibeBar} contentContainerStyle={styles.vibeBarInner}>
        {VIBES.map(v => (
          <TouchableOpacity
            key={v}
            style={[styles.vibeChip, activeVibe === v && styles.vibeChipActive]}
            onPress={() => setActiveVibe(v)}
            activeOpacity={0.8}
          >
            <Text style={[styles.vibeText, activeVibe === v && styles.vibeTextActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map(event => (
          <TouchableOpacity key={event.id} style={styles.card} activeOpacity={0.85}>
            <View style={styles.cardTop}>
              <View style={[styles.vibeBadge, { backgroundColor: `${VIBE_COLOR[event.vibe]}18` }]}>
                <Text style={[styles.vibeBadgeText, { color: VIBE_COLOR[event.vibe] }]}>{event.vibe}</Text>
              </View>
              <Text style={styles.attendees}>👥 {event.attendees} going</Text>
            </View>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDesc}>{event.desc}</Text>
            <View style={styles.eventMeta}>
              <Text style={styles.metaText}>📍 {event.location}</Text>
              <Text style={styles.metaText}>🕐 {event.time}</Text>
            </View>
            <TouchableOpacity style={styles.rsvpBtn} activeOpacity={0.8}>
              <Text style={styles.rsvpText}>I'm interested</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <Text style={styles.footerText}>Events matched to your current vibe · Updated daily</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { paddingTop: 64, paddingHorizontal: 24, paddingBottom: 16 },
  title:          { fontSize: 28, color: '#E8E4DC', fontWeight: '300', letterSpacing: -0.5 },
  sub:            { fontSize: 13, color: '#6B7280', marginTop: 4 },
  vibeBar:        { maxHeight: 52 },
  vibeBarInner:   { paddingHorizontal: 24, gap: 8, alignItems: 'center' },
  vibeChip:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100,
                    backgroundColor: '#10131C', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  vibeChipActive: { backgroundColor: 'rgba(200,169,126,0.12)', borderColor: 'rgba(200,169,126,0.4)' },
  vibeText:       { fontSize: 13, color: '#6B7280' },
  vibeTextActive: { color: '#C8A97E' },
  scroll:         { padding: 24, paddingTop: 16, paddingBottom: 100, gap: 14 },
  card:           { backgroundColor: '#10131C', borderRadius: 18, padding: 20,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  vibeBadge:      { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  vibeBadgeText:  { fontSize: 11, fontWeight: '500', letterSpacing: 0.5 },
  attendees:      { fontSize: 12, color: '#6B7280' },
  eventTitle:     { fontSize: 18, color: '#E8E4DC', fontWeight: '400', marginBottom: 8, letterSpacing: -0.3 },
  eventDesc:      { fontSize: 14, color: '#9CA3AF', lineHeight: 21, marginBottom: 14 },
  eventMeta:      { gap: 6, marginBottom: 16 },
  metaText:       { fontSize: 12, color: '#6B7280' },
  rsvpBtn:        { backgroundColor: 'rgba(200,169,126,0.1)', borderRadius: 100,
                    paddingVertical: 11, alignItems: 'center',
                    borderWidth: 1, borderColor: 'rgba(200,169,126,0.25)' },
  rsvpText:       { fontSize: 14, color: '#C8A97E', fontWeight: '500' },
  footerText:     { fontSize: 11, color: '#6B7280', textAlign: 'center', marginTop: 8 },
});
