let audioContext: AudioContext | null = null;
let isInitialized = false;

/**
 * Initializes the AudioContext. Must be called after a user interaction (e.g., a click).
 * This function is safe to call multiple times.
 */
export function initAudio() {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    isInitialized = true;
  } catch (e) {
    console.error("Web Audio API is not supported in this browser.", e);
  }
}

function play(nodes: (OscillatorNode | GainNode)[], startTime: number, duration: number) {
    if (!audioContext || audioContext.state === 'suspended') {
        audioContext?.resume();
    }
    if (!audioContext) return;
    nodes.forEach(node => {
        // FIX: Add type guard. The 'start' and 'stop' methods exist on OscillatorNode but not on GainNode.
        if (node instanceof OscillatorNode) {
            node.start(startTime);
            node.stop(startTime + duration);
        }
    });
}

function createTone(frequency: number, type: OscillatorType, volume: number): [OscillatorNode, GainNode] | [] {
    if (!audioContext) return [];
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return [oscillator, gainNode];
}

/** Sound for clicking a choice */
export function playClickSound() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const [osc, gain] = createTone(800, 'triangle', 0.15) || [];
    if(!osc || !gain) return;
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    play([osc, gain], now, 0.1);
}

/** Sound for a new story segment appearing */
export function playNewSegmentSound() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const times = [now, now + 0.1, now + 0.2];
    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5

    freqs.forEach((freq, i) => {
        const [osc, gain] = createTone(freq, 'sine', 0.1) || [];
        if(!osc || !gain) return;
        gain.gain.setValueAtTime(0.1, times[i]);
        gain.gain.exponentialRampToValueAtTime(0.001, times[i] + 0.2);
        play([osc, gain], times[i], 0.2);
    });
}

/** Sound for starting the story */
export function playStartSound() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const [osc, gain] = createTone(300, 'sawtooth', 0.001) || [];
    if(!osc || !gain) return;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
    
    play([osc, gain], now, 0.5);
}

/** Sound for ending/resetting the story */
export function playEndSound() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const [osc, gain] = createTone(800, 'sine', 0.15) || [];
    if(!osc || !gain) return;

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
    
    play([osc, gain], now, 0.4);
}

/** Sound for an error */
export function playErrorSound() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const [osc, gain] = createTone(150, 'square', 0.15) || [];
    if(!osc || !gain) return;

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    play([osc, gain], now, 0.3);
}