import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loadUser } from '../services/storage';
import { sendMessage } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

const STARTERS = [
  "I've been feeling a bit off lately",
  "Haven't talked to anyone today",
  "Feeling disconnected",
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [userName, setUserName] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    loadUser().then(u => {
      setUserName(u?.name || 'Friend');
      setMessages([{
        id: '0', role: 'assistant', text:
          `Hey ${u?.name || 'there'} 👋 I'm Pulse. I'm here to listen — no judgment, no advice unless you want it. What's on your mind?`,
        time: now()
      }]);
    });
  }, []);

  function now() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.text }));
      const reply = await sendMessage(text, history, userName);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant', text: reply, time: now()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        text: "I'm having trouble connecting right now. But I'm here — try again in a moment.",
        time: now()
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && <View style={styles.avatar}><Text style={styles.avatarText}>●</Text></View>}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.text}</Text>
          <Text style={styles.bubbleTime}>{item.time}</Text>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#080A10', '#0A0D16']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.onlineDot} />
          <View>
            <Text style={styles.headerTitle}>Pulse</Text>
            <Text style={styles.headerSub}>Always here · Private</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={loading ? (
            <View style={styles.typingRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>●</Text></View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#C8A97E" />
              </View>
            </View>
          ) : null}
        />

        {/* Starter chips */}
        {messages.length <= 1 && (
          <View style={styles.starters}>
            {STARTERS.map(s => (
              <TouchableOpacity key={s} style={styles.chip} onPress={() => setInput(s)} activeOpacity={0.7}>
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Say something..."
            placeholderTextColor="#6B7280"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16,
                  borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  onlineDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: '#7EC8A0' },
  headerTitle:  { fontSize: 18, color: '#E8E4DC', fontWeight: '300', fontStyle: 'italic' },
  headerSub:    { fontSize: 11, color: '#6B7280', marginTop: 1 },
  kav:          { flex: 1 },
  messages:     { padding: 20, paddingBottom: 8, gap: 16 },
  msgRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 10, maxWidth: '88%' },
  msgRowUser:   { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  avatar:       { width: 28, height: 28, borderRadius: 14, backgroundColor: '#13161F',
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: 'rgba(200,169,126,0.3)' },
  avatarText:   { fontSize: 10, color: '#C8A97E' },
  bubble:       { borderRadius: 18, padding: 14, maxWidth: '100%' },
  bubbleAI:     { backgroundColor: '#13161F', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                  borderBottomLeftRadius: 4 },
  bubbleUser:   { backgroundColor: '#C8A97E', borderBottomRightRadius: 4 },
  bubbleText:   { fontSize: 15, color: '#E8E4DC', lineHeight: 22 },
  bubbleTextUser: { color: '#080A10' },
  bubbleTime:   { fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 6, alignSelf: 'flex-end' },
  typingRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 4 },
  typingBubble: { backgroundColor: '#13161F', borderRadius: 16, padding: 14,
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  starters:     { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  chip:         { backgroundColor: 'rgba(200,169,126,0.08)', borderRadius: 100,
                  paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start',
                  borderWidth: 1, borderColor: 'rgba(200,169,126,0.2)' },
  chipText:     { fontSize: 13, color: '#C8A97E' },
  inputRow:     { flexDirection: 'row', alignItems: 'flex-end', gap: 10,
                  padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  input:        { flex: 1, backgroundColor: '#10131C', borderRadius: 22,
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                  paddingHorizontal: 18, paddingVertical: 12, fontSize: 15,
                  color: '#E8E4DC', maxHeight: 120 },
  sendBtn:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#C8A97E',
                  alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.35 },
  sendIcon:     { fontSize: 18, color: '#080A10', fontWeight: '600' },
});
