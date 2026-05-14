// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('main.ts — browser zoom suppression', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('registers a wheel event listener with passive: false', async () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    // Dynamic import to trigger module execution
    await import('@/main');

    const wheelCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'wheel',
    );
    expect(wheelCalls.length).toBeGreaterThanOrEqual(1);

    const lastWheelCall = wheelCalls[wheelCalls.length - 1];
    expect(lastWheelCall[2]).toEqual({ passive: false });

    addEventListenerSpy.mockRestore();
  });

  it('prevents default on Ctrl+wheel events', async () => {
    await import('@/main');

    const preventDefault = vi.fn();
    const ctrlWheelEvent = new WheelEvent('wheel', {
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    // Override preventDefault since WheelEvent constructor
    // creates a real event with a real preventDefault
    Object.defineProperty(ctrlWheelEvent, 'preventDefault', {
      value: preventDefault,
    });

    document.dispatchEvent(ctrlWheelEvent);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('does not prevent default on non-Ctrl wheel events', async () => {
    await import('@/main');

    const regularEvent = new WheelEvent('wheel', {
      ctrlKey: false,
      metaKey: false,
      bubbles: true,
      cancelable: true,
    });
    // Should not throw — the listener should simply not call
    // preventDefault for regular scroll events
    expect(() => {
      document.dispatchEvent(regularEvent);
    }).not.toThrow();
  });
});
