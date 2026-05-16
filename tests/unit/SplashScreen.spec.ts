import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import SplashScreen from '@/components/SplashScreen.vue';

// Mock the splashRenderer module
vi.mock('@/utils/splashRenderer', () => ({
  createRipple: vi.fn((x, y, t) => ({
    x, y, startTime: t, duration: 1.5, maxRadius: 250,
    frequency: 0.08, intensity: 3, ringWidth: 60,
  })),
  updateRipples: vi.fn((r) => r),
  computeParallaxOffset: vi.fn(() => ({ x: 0, y: 0 })),
  renderFrame: vi.fn(),
}));

describe('SplashScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders canvas element with ARIA attributes', () => {
    const wrapper = mount(SplashScreen, {
      global: { stubs: { teleport: true } },
    });
    const canvas = wrapper.find('canvas');
    expect(canvas.exists()).toBe(true);
    expect(canvas.attributes('role')).toBe('img');
    expect(canvas.attributes('aria-label')).toBe(
      'ASCIIBIRD animated splash screen',
    );
  });

  it('renders ASCIIBIRD title in overlay', () => {
    const wrapper = mount(SplashScreen, {
      global: { stubs: { teleport: true } },
    });
    expect(wrapper.text()).toContain('ASCIIBIRD');
  });

  it('renders version text in overlay', () => {
    const wrapper = mount(SplashScreen, {
      global: { stubs: { teleport: true } },
    });
    expect(wrapper.text()).toContain('v3 TESTING');
  });

  it('renders classic version link', () => {
    const wrapper = mount(SplashScreen, {
      global: { stubs: { teleport: true } },
    });
    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('https://classic.birdnest.live/');
    expect(link.text()).toContain('Classic ASCIIBIRD');
  });

  it('emits contextmenu event', async () => {
    const wrapper = mount(SplashScreen, {
      global: { stubs: { teleport: true } },
      attachTo: document.body,
    });

    const div = wrapper.find('.fixed.inset-0');
    await div.trigger('contextmenu');

    expect(wrapper.emitted('contextmenu')).toBeTruthy();
    wrapper.unmount();
  });

  it('calls renderFrame on mount', async () => {
    const { renderFrame } = await import('@/utils/splashRenderer');
    mount(SplashScreen, {
      global: { stubs: { teleport: true } },
    });
    // Wait for onMounted + RAF cycle
    await nextTick();
    await new Promise(r => setTimeout(r, 50));
    expect(renderFrame).toHaveBeenCalled();
  });

  it('cleans up on unmount', async () => {
    const wrapper = mount(SplashScreen, {
      global: { stubs: { teleport: true } },
    });
    await nextTick();
    expect(() => wrapper.unmount()).not.toThrow();
  });
});
