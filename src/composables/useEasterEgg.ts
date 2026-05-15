// Easter egg — ASCIIBIRD logo click effect with Web Audio chimes
// Issue #81: Click ASCIIBIRD logo for CSS shimmer + varied sound effects
import { ref } from 'vue';

/** Tone definition for synthesized chime */
interface ToneConfig {
  frequency: number;
  type: OscillatorType;
  duration: number;
}

/** Predefined chime tones — cycled on each click */
const TONES: ToneConfig[] = [
  { frequency: 523, type: 'sine', duration: 0.15 },   // C5
  { frequency: 659, type: 'triangle', duration: 0.12 }, // E5
  { frequency: 784, type: 'sine', duration: 0.18 },     // G5
  { frequency: 880, type: 'triangle', duration: 0.10 }, // A5
  { frequency: 1047, type: 'sine', duration: 0.14 },    // C6
];

/** Animation duration in ms (must match CSS) */
const ANIMATION_DURATION = 1500;

/** Check if user prefers reduced motion */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useEasterEgg() {
  const toneIndex = ref(0);
  let audioContext: AudioContext | null = null;

  /**
   * Lazily create AudioContext on first use.
   * Wrapped in try-catch for environments without Web Audio.
   */
  function getAudioContext(): AudioContext | null {
    if (audioContext) return audioContext;
    try {
      const AC = window.AudioContext
        || (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      audioContext = new AC();
      return audioContext;
    } catch {
      return null;
    }
  }

  /**
   * Play a short synthesized chime tone.
   * Uses oscillator + gain envelope for a pleasant sound.
   */
  function playTone(config: ToneConfig): void {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(
      config.frequency,
      ctx.currentTime,
    );

    // Envelope: quick attack, smooth decay
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + config.duration,
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
  }

  /** Whether the easter egg animation is currently active */
  const isActive = ref(false);
  let removeTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Trigger the easter egg effect.
   * Plays a chime tone and applies the shimmer animation class.
   * Self-removes after ANIMATION_DURATION ms.
   */
  function trigger(): void {
    // Skip audio if user prefers reduced motion
    if (!prefersReducedMotion()) {
      const tone = TONES[toneIndex.value % TONES.length];
      playTone(tone);
      toneIndex.value++;
    }

    // Apply shimmer animation (CSS handles reduced-motion guard)
    isActive.value = true;

    // Clear any existing timer
    if (removeTimer) {
      clearTimeout(removeTimer);
    }

    // Self-remove animation class after duration
    removeTimer = setTimeout(() => {
      isActive.value = false;
      removeTimer = null;
    }, ANIMATION_DURATION);
  }

  return {
    isActive,
    trigger,
  };
}
