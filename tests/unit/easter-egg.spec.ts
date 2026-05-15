import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Set up AudioContext mock before importing the composable
// Use hoisted setup so it's available when module loads
const mockCreateOscillator = vi.fn();
const mockCreateGain = vi.fn();
const mockOscStart = vi.fn();
const mockFreqSetValue = vi.fn();

vi.hoisted(() => {
  const MockAudioContext = class {
    state = 'running';
    currentTime = 0.5;
    resume = vi.fn();
    createOscillator() {
      mockCreateOscillator();
      return {
        type: 'sine' as OscillatorType,
        frequency: { setValueAtTime: mockFreqSetValue },
        connect: vi.fn(),
        start: mockOscStart,
        stop: vi.fn(),
      };
    }
    createGain() {
      mockCreateGain();
      return {
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      };
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).AudioContext = MockAudioContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).webkitAudioContext = MockAudioContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).matchMedia = () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

import { useEasterEgg } from '../../src/composables/useEasterEgg';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useEasterEgg', () => {
  it('returns isActive ref and trigger function', () => {
    const { isActive, trigger } = useEasterEgg();
    expect(isActive.value).toBe(false);
    expect(typeof trigger).toBe('function');
  });

  it('sets isActive to true on trigger', () => {
    vi.useFakeTimers();
    const { isActive, trigger } = useEasterEgg();
    trigger();
    expect(isActive.value).toBe(true);
  });

  it('resets isActive after animation duration', () => {
    vi.useFakeTimers();
    const { isActive, trigger } = useEasterEgg();
    trigger();
    expect(isActive.value).toBe(true);
    vi.advanceTimersByTime(1500);
    expect(isActive.value).toBe(false);
  });

  it('plays a tone using Web Audio API', () => {
    const { trigger } = useEasterEgg();
    trigger();
    expect(mockCreateOscillator).toHaveBeenCalled();
    expect(mockCreateGain).toHaveBeenCalled();
    expect(mockOscStart).toHaveBeenCalled();
    expect(mockFreqSetValue).toHaveBeenCalled();
  });

  it('cycles through different frequencies on repeated triggers', () => {
    const { trigger } = useEasterEgg();
    trigger();
    const firstCallCount = mockFreqSetValue.mock.calls.length;
    trigger();
    expect(mockFreqSetValue.mock.calls.length).toBeGreaterThan(firstCallCount);
  });

  it('clears previous timer when triggered rapidly', () => {
    vi.useFakeTimers();
    const { isActive, trigger } = useEasterEgg();
    trigger();
    trigger();
    vi.advanceTimersByTime(1500);
    expect(isActive.value).toBe(false);
  });
});
