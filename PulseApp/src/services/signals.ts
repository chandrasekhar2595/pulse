import AsyncStorage from '@react-native-async-storage/async-storage';

interface SignalData {
  screenTimeDelta: number;    // 0-1: how much screen time increased
  outgoingMsgDrop: number;    // 0-1: drop in outgoing messages
  passiveSocial: number;      // 0-1: passive social browsing ratio
  lateNightActivity: number;  // 0-1: activity after midnight
  daysSinceCall: number;      // raw days
}

// Weights for each signal (must sum to 1.0)
const WEIGHTS = {
  outgoingMsgDrop:    0.30,
  passiveSocial:      0.25,
  screenTimeDelta:    0.20,
  lateNightActivity:  0.15,
  daysSinceCall:      0.10,
};

// Sigmoid smoothing so score stays between 0-1
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-10 * (x - 0.5)));
}

export async function getIsolationScore(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem('pulse_signals');
    if (raw) {
      const signals: SignalData = JSON.parse(raw);
      return computeScore(signals);
    }
    // Return a demo score if no real signals yet
    return 0.32;
  } catch {
    return 0.32;
  }
}

export function computeScore(signals: SignalData): number {
  const callNormalized = Math.min(signals.daysSinceCall / 14, 1);

  const raw =
    signals.outgoingMsgDrop   * WEIGHTS.outgoingMsgDrop   +
    signals.passiveSocial      * WEIGHTS.passiveSocial      +
    signals.screenTimeDelta    * WEIGHTS.screenTimeDelta    +
    signals.lateNightActivity  * WEIGHTS.lateNightActivity  +
    callNormalized             * WEIGHTS.daysSinceCall;

  return Math.round(sigmoid(raw) * 100) / 100;
}

export async function saveSignals(signals: SignalData): Promise<void> {
  await AsyncStorage.setItem('pulse_signals', JSON.stringify(signals));
}
