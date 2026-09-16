// Half-block tool availability metadata tests
import { describe, it, expect } from 'vitest';
import {
  HALF_BLOCK_UNAVAILABLE_TOOLS,
  isToolUnavailableInHalfBlock,
  halfBlockToolLabel,
  toolbarIcons,
} from '../../../src/utils/uiConstants';

describe('HALF_BLOCK_UNAVAILABLE_TOOLS', () => {
  it('blocks text, replace-color and all three gradient tools', () => {
    expect([...HALF_BLOCK_UNAVAILABLE_TOOLS].sort()).toEqual([
      'gradient-corner',
      'gradient-horizontal',
      'gradient-vertical',
      'replace-color',
      'text',
    ]);
  });

  it('covers every registered tool that is unavailable', () => {
    // Every unavailable name must exist in the registry (no typos)
    for (const name of HALF_BLOCK_UNAVAILABLE_TOOLS) {
      expect(toolbarIcons.some(t => t.name === name)).toBe(true);
    }
  });

  it('leaves the half-resolution-capable tools available', () => {
    for (const name of [
      'default', 'select', 'fill', 'brush', 'dropper', 'eraser',
      'fill-eraser', 'shapes',
    ]) {
      expect(isToolUnavailableInHalfBlock(name)).toBe(false);
    }
  });
});

describe('isToolUnavailableInHalfBlock', () => {
  it('handles undefined and unknown names', () => {
    expect(isToolUnavailableInHalfBlock(undefined)).toBe(false);
    expect(isToolUnavailableInHalfBlock('nope')).toBe(false);
  });
});

describe('halfBlockToolLabel', () => {
  it('maps each unavailable tool to a friendly label', () => {
    expect(halfBlockToolLabel('text')).toBe('Text mode');
    expect(halfBlockToolLabel('replace-color')).toBe('Color replace');
    expect(halfBlockToolLabel('gradient-vertical')).toBe('Gradient fill');
    expect(halfBlockToolLabel('gradient-horizontal')).toBe('Gradient fill');
    expect(halfBlockToolLabel('gradient-corner')).toBe('Gradient fill');
  });

  it('falls back to the raw name for anything else', () => {
    expect(halfBlockToolLabel('brush')).toBe('brush');
  });
});
