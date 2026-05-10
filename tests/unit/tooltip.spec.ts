// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import Tooltip from '../../src/components/parts/Tooltip.vue';

let wrapper: VueWrapper | null = null;

function mountTooltip(props = {}, slotContent = '<button>Hover me</button>') {
  wrapper = mount(Tooltip, {
    props: {
      content: 'Test tooltip',
      ...props,
    },
    slots: {
      default: slotContent,
    },
    global: {
      plugins: [createPinia()],
    },
    attachTo: document.body,
  });
  return wrapper;
}

function cleanupBody() {
  // Remove any teleported tooltips from body
  document.querySelectorAll('[class*="z-\\[9999\\]"]')
    .forEach((el) => el.remove());
  if (wrapper) {
    wrapper.unmount();
    wrapper = null;
  }
}

function getTooltip() {
  return document.querySelector('[class*="z-\\[9999\\]"]');
}

describe('Tooltip', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    cleanupBody();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanupBody();
  });

  it('renders slot content', () => {
    const w = mountTooltip();
    expect(w.text()).toContain('Hover me');
  });

  it('does not show tooltip initially', () => {
    mountTooltip();
    expect(getTooltip()).toBeNull();
  });

  it('shows tooltip after show delay on mouseenter', async () => {
    mountTooltip({ showDelay: 100 });
    const trigger = wrapper!.find('div');

    await trigger.trigger('mouseenter');
    expect(getTooltip()).toBeNull();

    vi.advanceTimersByTime(100);
    await wrapper!.vm.$nextTick();

    expect(getTooltip()).not.toBeNull();
    expect(getTooltip()!.textContent).toContain('Test tooltip');
  });

  it('hides tooltip after hide delay on mouseleave', async () => {
    mountTooltip({ showDelay: 0, hideDelay: 50 });
    const trigger = wrapper!.find('div');

    await trigger.trigger('mouseenter');
    vi.advanceTimersByTime(0);
    await wrapper!.vm.$nextTick();
    expect(getTooltip()).not.toBeNull();

    await trigger.trigger('mouseleave');
    vi.advanceTimersByTime(25);
    // Still visible during hide delay
    expect(getTooltip()).not.toBeNull();

    vi.advanceTimersByTime(30);
    await wrapper!.vm.$nextTick();
    expect(getTooltip()).toBeNull();
  });

  it('cancels show if mouse leaves before delay', async () => {
    mountTooltip({ showDelay: 200 });
    const trigger = wrapper!.find('div');

    await trigger.trigger('mouseenter');
    vi.advanceTimersByTime(100);

    await trigger.trigger('mouseleave');
    vi.advanceTimersByTime(200);
    await wrapper!.vm.$nextTick();

    expect(getTooltip()).toBeNull();
  });

  it('does not show when disabled prop is true', async () => {
    mountTooltip({ disabled: true, showDelay: 0 });
    const trigger = wrapper!.find('div');

    await trigger.trigger('mouseenter');
    vi.advanceTimersByTime(100);
    await wrapper!.vm.$nextTick();

    expect(getTooltip()).toBeNull();
  });

  it('renders content as text interpolation (not v-html)', async () => {
    mountTooltip({
      content: '<b>bold</b>',
      showDelay: 0,
    });
    const trigger = wrapper!.find('div');

    await trigger.trigger('mouseenter');
    vi.advanceTimersByTime(0);
    await wrapper!.vm.$nextTick();

    const tip = getTooltip();
    expect(tip).not.toBeNull();
    // Content should be text-escaped, not rendered as HTML
    expect(tip!.innerHTML).toContain('&lt;b&gt;bold&lt;/b&gt;');
    expect(tip!.textContent).toContain('<b>bold</b>');
  });

  it('shows tooltip on focus', async () => {
    mountTooltip({ showDelay: 0 });
    const trigger = wrapper!.find('div');

    await trigger.trigger('focusin');
    vi.advanceTimersByTime(0);
    await wrapper!.vm.$nextTick();

    expect(getTooltip()).not.toBeNull();
  });

  it('hides tooltip on focusout after hide delay', async () => {
    mountTooltip({ showDelay: 0, hideDelay: 50 });
    const trigger = wrapper!.find('div');

    await trigger.trigger('focusin');
    vi.advanceTimersByTime(0);
    await wrapper!.vm.$nextTick();
    expect(getTooltip()).not.toBeNull();

    await trigger.trigger('focusout');
    vi.advanceTimersByTime(60);
    await wrapper!.vm.$nextTick();
    expect(getTooltip()).toBeNull();
  });

  it('cleans up timers on unmount', async () => {
    mountTooltip({ showDelay: 200 });
    const trigger = wrapper!.find('div');

    await trigger.trigger('mouseenter');
    vi.advanceTimersByTime(50);

    wrapper!.unmount();
    wrapper = null;

    // Advance past the show delay — should not render
    vi.advanceTimersByTime(300);
    expect(getTooltip()).toBeNull();
  });

  it('applies pointer-events-none to tooltip element', async () => {
    mountTooltip({ showDelay: 0 });
    const trigger = wrapper!.find('div');

    await trigger.trigger('mouseenter');
    vi.advanceTimersByTime(0);
    await wrapper!.vm.$nextTick();

    const tip = getTooltip();
    expect(tip?.className).toContain('pointer-events-none');
  });
});
