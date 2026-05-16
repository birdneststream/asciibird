<template>
  <div
    class="inline-block"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
  >
    <slot />
    <Teleport to="body">
      <div
        v-if="visible"
        ref="tooltipEl"
        class="fixed z-[9999] pointer-events-none text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap border bg-surface-container-highest text-on-surface border-outline-variant"
        :style="tooltipStyle"
      >
        {{ content }}
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from 'vue';

interface TooltipProps {
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  showDelay?: number;
  hideDelay?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<TooltipProps>(), {
  position: 'right',
  showDelay: 400,
  hideDelay: 100,
  disabled: false,
});

const visible = ref(false);
const tooltipEl = ref<HTMLElement | null>(null);
const tooltipPos = ref({ top: 0, left: 0 });

let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

const tooltipStyle = computed(() => ({
  top: `${tooltipPos.value.top}px`,
  left: `${tooltipPos.value.left}px`,
}));

function clearTimers() {
  if (showTimer !== null) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (hideTimer !== null) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function calculatePosition(triggerEl: HTMLElement) {
  const rect = triggerEl.getBoundingClientRect();
  const gap = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let pos = props.position;
  let top = 0;
  let left = 0;

  // Estimate tooltip size (rough approximation)
  const estimatedWidth = props.content.length * 7 + 16;
  const estimatedHeight = 28;

  // Calculate preferred position
  switch (pos) {
    case 'right':
      top = rect.top + rect.height / 2 - estimatedHeight / 2;
      left = rect.right + gap;
      if (left + estimatedWidth > vw) pos = 'left';
      break;
    case 'left':
      top = rect.top + rect.height / 2 - estimatedHeight / 2;
      left = rect.left - estimatedWidth - gap;
      if (left < 0) pos = 'right';
      break;
    case 'top':
      top = rect.top - estimatedHeight - gap;
      left = rect.left + rect.width / 2 - estimatedWidth / 2;
      if (top < 0) pos = 'bottom';
      break;
    case 'bottom':
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - estimatedWidth / 2;
      if (top + estimatedHeight > vh) pos = 'top';
      break;
  }

  // Recalculate if flipped
  switch (pos) {
    case 'right':
      top = rect.top + rect.height / 2 - estimatedHeight / 2;
      left = rect.right + gap;
      break;
    case 'left':
      top = rect.top + rect.height / 2 - estimatedHeight / 2;
      left = rect.left - estimatedWidth - gap;
      break;
    case 'top':
      top = rect.top - estimatedHeight - gap;
      left = rect.left + rect.width / 2 - estimatedWidth / 2;
      break;
    case 'bottom':
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - estimatedWidth / 2;
      break;
  }

  // Use actual tooltip dimensions after render for fine-tuning
  nextTick(() => {
    const el = tooltipEl.value;
    if (!el) return;
    const actualRect = el.getBoundingClientRect();

    // Clamp to viewport
    let adjustedTop = tooltipPos.value.top;
    let adjustedLeft = tooltipPos.value.left;

    if (adjustedLeft < 0) adjustedLeft = gap;
    if (adjustedLeft + actualRect.width > vw) {
      adjustedLeft = vw - actualRect.width - gap;
    }
    if (adjustedTop < 0) adjustedTop = gap;
    if (adjustedTop + actualRect.height > vh) {
      adjustedTop = vh - actualRect.height - gap;
    }

    tooltipPos.value = { top: adjustedTop, left: adjustedLeft };
  });

  return { top, left };
}

function show(triggerEl: HTMLElement) {
  clearTimers();
  const pos = calculatePosition(triggerEl);
  tooltipPos.value = pos;
  visible.value = true;
}

function hide() {
  visible.value = false;
}

function handleMouseEnter(e: MouseEvent) {
  if (props.disabled) return;
  const trigger = e.currentTarget;
  if (!(trigger instanceof HTMLElement)) return;
  clearTimers();
  hideTimer = null;
  showTimer = setTimeout(() => {
    show(trigger);
  }, props.showDelay);
}

function handleMouseLeave() {
  clearTimers();
  showTimer = null;
  hideTimer = setTimeout(() => {
    hide();
  }, props.hideDelay);
}

function handleFocusIn(e: FocusEvent) {
  if (props.disabled) return;
  const trigger = e.currentTarget;
  if (!(trigger instanceof HTMLElement)) return;
  clearTimers();
  showTimer = setTimeout(() => {
    show(trigger);
  }, props.showDelay);
}

function handleFocusOut() {
  clearTimers();
  hideTimer = setTimeout(() => {
    hide();
  }, props.hideDelay);
}

onUnmounted(() => {
  clearTimers();
});
</script>
