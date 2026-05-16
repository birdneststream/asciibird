// Match highlight composable for Find and Replace
// Draws semi-transparent overlays on the tool canvas for search matches

import { ref, onMounted, onUnmounted } from 'vue';
import type { MatchPosition } from '../types';

export interface MatchHighlightState {
  matchPositions: typeof matchPositions;
  currentIndex: typeof currentIndex;
  drawHighlights: (
    toolCtx: CanvasRenderingContext2D,
    scrollX: number,
    scrollY: number,
    viewWidth: number,
    viewHeight: number,
    bw: number,
    bh: number,
  ) => void;
}

const matchPositions = ref<MatchPosition[]>([]);
const currentIndex = ref(-1);

export function useMatchHighlight(): MatchHighlightState {
  function handleFindMatches(e: Event) {
    const detail = (e as CustomEvent<{ matches?: MatchPosition[]; currentIndex?: number }>).detail;
    matchPositions.value = detail.matches ?? [];
    currentIndex.value = detail.currentIndex ?? -1;
  }

  onMounted(() => {
    window.addEventListener(
      'asciibird:find-matches',
      handleFindMatches,
    );
  });

  onUnmounted(() => {
    window.removeEventListener(
      'asciibird:find-matches',
      handleFindMatches,
    );
  });

  /**
   * Draw match highlight overlays on the tool canvas.
   * Only draws matches visible in the current viewport.
   */
  function drawHighlights(
    toolCtx: CanvasRenderingContext2D,
    scrollX: number,
    scrollY: number,
    viewWidth: number,
    viewHeight: number,
    bw: number,
    bh: number,
  ): void {
    if (matchPositions.value.length === 0) return;

    const savedAlpha = toolCtx.globalAlpha;
    const savedFill = toolCtx.fillStyle;

    for (let i = 0; i < matchPositions.value.length; i++) {
      const match = matchPositions.value[i];
      const px = match.x * bw - scrollX;
      const py = match.y * bh - scrollY;

      // Skip if outside viewport
      if (px + bw < 0 || px > viewWidth || py + bh < 0
        || py > viewHeight) {
        continue;
      }

      const isCurrent = i === currentIndex.value;

      if (isCurrent) {
        // Current match: yellow border
        toolCtx.globalAlpha = 1;
        toolCtx.strokeStyle = '#FFD700';
        toolCtx.lineWidth = 2;
        toolCtx.strokeRect(px, py, bw, bh);
      } else {
        // Other matches: semi-transparent cyan fill
        toolCtx.globalAlpha = 0.25;
        toolCtx.fillStyle = '#00C8FF';
        toolCtx.fillRect(px, py, bw, bh);
      }
    }

    toolCtx.globalAlpha = savedAlpha;
    toolCtx.fillStyle = savedFill;
  }

  return {
    matchPositions,
    currentIndex,
    drawHighlights,
  };
}
