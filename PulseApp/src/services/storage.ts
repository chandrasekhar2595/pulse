import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  name: string;
  onboarded: boolean;
}

const KEYS = {
  USER:    'pulse_user',
  SIGNALS: 'pulse_signals',
};

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export async function loadUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER);
}
