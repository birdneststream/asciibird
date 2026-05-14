// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, ref, createApp } from 'vue';
import { createPinia } from 'pinia';
import { useFpsThrottle } from '@/composables/useFpsThrottle';

describe('useFpsThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function mountWithThrottle(drawFn: () => void, fpsValue = 50) {
    const fps = ref(fpsValue);
    const pinia = createPinia();
    const app = createApp({});
    app.use(pinia);

    const TestComponent = defineComponent({
      setup() {
        const controls = useFpsThrottle(drawFn, () => fps.value);
        return controls;
      },
      template: '<div />',
    });

    const wrapper = mount(TestComponent, {
      global: { plugins: [pinia] },
    });

    return { wrapper, fps };
  }

  it('calls the provided draw function when scheduleRedraw is invoked', async () => {
    const drawFn = vi.fn();
    const { wrapper } = mountWithThrottle(drawFn);

    wrapper.vm.scheduleRedraw();
    vi.advanceTimersByTime(21);
    await vi.runAllTimersAsync();

    expect(drawFn).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('does not call noop when using direct function reference', async () => {
    // Verifies fix for issue #34: the deferred `let fn = () => {}`
    // pattern caused drawFn to never be called.
    const actualDrawCalls: string[] = [];

    const pinia = createPinia();

    const TestComponent = defineComponent({
      setup() {
        // Direct function reference (the fix) — NOT deferred pattern
        const { scheduleRedraw } = useFpsThrottle(
          drawPreview,
          () => 50,
        );

        function drawPreview() {
          actualDrawCalls.push('drawPreview');
        }

        return { scheduleRedraw };
      },
      template: '<div />',
    });

    const wrapper = mount(TestComponent, {
      global: { plugins: [pinia] },
    });

    wrapper.vm.scheduleRedraw();
    vi.advanceTimersByTime(21);
    await vi.runAllTimersAsync();

    expect(actualDrawCalls).toEqual(['drawPreview']);
    wrapper.unmount();
  });

  it('coalesces multiple scheduleRedraw calls within one FPS frame', async () => {
    const drawFn = vi.fn();
    const { wrapper } = mountWithThrottle(drawFn);

    wrapper.vm.scheduleRedraw();
    wrapper.vm.scheduleRedraw();
    wrapper.vm.scheduleRedraw();

    vi.advanceTimersByTime(21);
    await vi.runAllTimersAsync();

    expect(drawFn).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('allows a second redraw after the first completes', async () => {
    const drawFn = vi.fn();
    const { wrapper } = mountWithThrottle(drawFn);

    wrapper.vm.scheduleRedraw();
    vi.advanceTimersByTime(21);
    await vi.runAllTimersAsync();
    expect(drawFn).toHaveBeenCalledTimes(1);

    wrapper.vm.scheduleRedraw();
    vi.advanceTimersByTime(21);
    await vi.runAllTimersAsync();
    expect(drawFn).toHaveBeenCalledTimes(2);

    wrapper.unmount();
  });
});
