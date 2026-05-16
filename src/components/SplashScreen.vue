<template>
  <div
    class="fixed inset-0"
    @contextmenu.prevent="onContextMenu"
    @click="onClick"
    @mousemove="onMouseMove"
  >
    <canvas
      ref="canvasEl"
      role="img"
      aria-label="ASCIIBIRD animated splash screen"
      class="w-full h-full block"
    />

    <div
      class="fixed inset-0 flex items-center justify-center pointer-events-none select-none"
    >
      <div class="text-center">
        <h1 class="text-headline-xl font-bold text-primary tracking-wide mb-1">
          ASCIIBIRD
        </h1>
        <span class="text-title-lg text-on-surface-variant font-semibold">
          v3 TESTING
        </span>
        <div class="mt-8 flex flex-col gap-3 items-center">
          <button
            class="ab-button px-6 py-2.5 text-sm pointer-events-auto min-w-[200px]"
            @click="onNewAscii"
          >
            New ASCII
          </button>
          <button
            class="ab-button px-6 py-2.5 text-sm pointer-events-auto min-w-[200px]"
            @click="onOpenFile"
          >
            Open ASCII
          </button>
          <button
            class="ab-button px-6 py-2.5 text-sm pointer-events-auto min-w-[200px]"
            @click="onPasteClipboard"
          >
            Paste from Clipboard
          </button>
        </div>
        <div class="mt-6 pointer-events-auto">
          <a
            href="https://classic.birdnest.live/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:text-primary-fixed underline cursor-pointer text-body-sm"
          >
            Classic ASCIIBIRD (v2)
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  createRipple,
  updateRipples,
  computeParallaxOffset,
  renderFrame,
} from '../utils/splashRenderer';
import type { Ripple, MouseState } from '../utils/splashRenderer';
import { useModalStore } from '../store/modal';

defineOptions({ name: 'SplashScreen' });

const emit = defineEmits<{
  contextmenu: [event: MouseEvent];
  'new-ascii': [];
  'open-file': [];
  'paste-clipboard': [];
}>();

const modalStore = useModalStore();

function onNewAscii() {
  emit('new-ascii');
  modalStore.openModal('new-ascii');
}

function onOpenFile() {
  emit('open-file');
  window.dispatchEvent(new Event('asciibird:import-file'));
}

function onPasteClipboard() {
  emit('paste-clipboard');
  modalStore.openModal('paste-ascii');
}

const canvasEl = ref<HTMLCanvasElement | null>(null);
const mouse = ref<MouseState>({ x: 0, y: 0 });
const ripples = ref<Ripple[]>([]);
let rafId = 0;
let reducedMotion = false;
let matchMediaRef: MediaQueryList | null = null;
let vpW = 0;
let vpH = 0;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

function onContextMenu(e: MouseEvent) {
  emit('contextmenu', e);
}

function onClick(e: MouseEvent) {
  const time = performance.now() / 1000;
  ripples.value.push(createRipple(e.clientX, e.clientY, time));
}

function onMouseMove(e: MouseEvent) {
  mouse.value = { x: e.clientX, y: e.clientY };
}

function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(setupCanvas, 150);
}

function onMotionChange(e: MediaQueryListEvent) {
  reducedMotion = e.matches;
  if (reducedMotion) {
    cancelFrame();
    renderOnce();
  } else {
    startLoop();
  }
}

function setupCanvas() {
  const canvas = canvasEl.value;
  if (!canvas) return;

  vpW = window.innerWidth;
  vpH = window.innerHeight;
  canvas.width = vpW;
  canvas.height = vpH;

  if (!reducedMotion) {
    startLoop();
  } else {
    renderOnce();
  }
}

function renderOnce() {
  const canvas = canvasEl.value;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  renderFrame(ctx, 0, { x: vpW / 2, y: vpH / 2 }, [], { x: 0, y: 0 }, vpW, vpH);
}

function tick() {
  const canvas = canvasEl.value;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) {
    rafId = requestAnimationFrame(tick);
    return;
  }

  const time = performance.now() / 1000;
  ripples.value = updateRipples(ripples.value, time);
  const parallax = computeParallaxOffset(mouse.value.x, mouse.value.y, vpW, vpH);

  renderFrame(ctx, time, mouse.value, ripples.value, parallax, vpW, vpH);
  rafId = requestAnimationFrame(tick);
}

function startLoop() {
  cancelFrame();
  rafId = requestAnimationFrame(tick);
}

function cancelFrame() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

onMounted(() => {
  matchMediaRef = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion = matchMediaRef.matches;
  matchMediaRef.addEventListener('change', onMotionChange);

  setupCanvas();
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  cancelFrame();
  window.removeEventListener('resize', onResize);
  if (matchMediaRef) {
    matchMediaRef.removeEventListener('change', onMotionChange);
  }
  if (resizeTimer) {
    clearTimeout(resizeTimer);
    resizeTimer = null;
  }
  ripples.value = [];
  canvasEl.value = null;
});
</script>
