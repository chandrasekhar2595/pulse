import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Dimensions, ScrollView, Animated, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { saveUser } from '../services/storage';

const { width, height } = Dimensions.get('window');

const STEPS = [
  {
    id: 'welcome',
    title: 'You're not\nalone.',
    subtitle: 'Pulse quietly watches for signs of isolation — and nudges you back toward the people who matter.',
    cta: 'Get started',
  },
  {
    id: 'how',
    title: 'Zero effort.\nReal results.',
    subtitle: 'No mood logging. No journaling. Pulse works in the background and taps you on the shoulder when you need it.',
    cta: 'How it works →',
  },
  {
    id: 'privacy',
    title: 'Your privacy\nis sacred.',
    subtitle: 'All signal processing happens on your device. Your isolation score is never stored on our servers. Ever.',
    cta: 'I trust that →',
  },
  {
    id: 'name',
    title: 'One last thing.',
    subtitle: 'What should Pulse call you?',
    cta: 'Let's go →',
    input: true,
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep]     = useState(0);
  const [name, setName]     = useState('');
  const fadeAnim            = useRef(new Animated.Value(1)).current;
  const slideAnim           = useRef(new Animated.Value(0)).current;

  const current = STEPS[step];

  function animateNext(fn: () => void) {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      fn();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  }

  async function handleNext() {
    if (step < STEPS.length - 1) {
      animateNext(() => setStep(s => s + 1));
    } else {
      await saveUser({ name: name || 'Friend', onboarded: true });
      onComplete();
    }
  }

  return (
    <LinearGradient colors={['#080A10', '#0D1020', '#080A10']} style={styles.container}>
      {/* Ambient glow */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>

        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.logo}>pulse</Text>
        </View>

        {/* Step indicators */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>

          {current.input && (
            <TextInput
              style={styles.nameInput}
              placeholder="Your first name"
              placeholderTextColor="#6B7280"
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
          )}
        </Animated.View>

        {/* CTA button */}
        <TouchableOpacity
          style={[styles.btn, (!name && current.input) && styles.btnDisabled]}
          onPress={handleNext}
          activeOpacity={0.8}
          disabled={current.input && !name.trim()}
        >
          <Text style={styles.btnText}>{current.cta}</Text>
        </TouchableOpacity>

        {/* Skip */}
        {step < STEPS.length - 1 && (
          <TouchableOpacity onPress={onComplete} style={styles.skip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  glow1:      { position: 'absolute', top: -100, left: -80, width: 300, height: 300,
                borderRadius: 150, backgroundColor: 'rgba(200,169,126,0.06)' },
  glow2:      { position: 'absolute', bottom: -80, right: -60, width: 280, height: 280,
                borderRadius: 140, backgroundColor: 'rgba(126,184,200,0.05)' },
  inner:      { flex: 1, paddingHorizontal: 32, paddingTop: 72, paddingBottom: 40, justifyContent: 'space-between' },
  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulseDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C8A97E' },
  logo:       { fontSize: 20, color: '#C8A97E', fontStyle: 'italic', fontWeight: '300' },
  dots:       { flexDirection: 'row', gap: 6, marginTop: 48 },
  dot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' },
  dotActive:  { backgroundColor: '#C8A97E', width: 20 },
  content:    { flex: 1, justifyContent: 'center', paddingBottom: 40 },
  title:      { fontSize: 44, color: '#E8E4DC', fontWeight: '200', lineHeight: 52,
                letterSpacing: -1, marginBottom: 20 },
  subtitle:   { fontSize: 16, color: '#9CA3AF', lineHeight: 26, fontWeight: '300' },
  nameInput:  { marginTop: 32, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
                borderWidth: 1, borderColor: 'rgba(200,169,126,0.25)',
                paddingHorizontal: 20, paddingVertical: 16, fontSize: 18,
                color: '#E8E4DC', fontWeight: '300' },
  btn:        { backgroundColor: '#C8A97E', borderRadius: 100, paddingVertical: 18,
                alignItems: 'center' },
  btnDisabled:{ opacity: 0.4 },
  btnText:    { color: '#080A10', fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  skip:       { alignItems: 'center', marginTop: 16 },
  skipText:   { color: '#6B7280', fontSize: 13 },
});
