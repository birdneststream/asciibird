// Tests for src/utils/ircExport.ts
// startExport — shared IRC export logic for clipboard and file

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startExport } from '@/utils/ircExport';
import type { MircExportResult } from '@/types';

// ─── Mock checkIrcByteLimits ─────────────────────────────────────

vi.mock('@/ascii', () => ({
  checkIrcByteLimits: vi.fn((text: string) => {
    // Simulate: return line indices that exceed 500 bytes
    const lines = text.split('\n');
    const overLimit: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (Buffer.byteLength(lines[i], 'utf8') > 500) {
        overLimit.push(i + 1); // 1-indexed
      }
    }
    return overLimit;
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────

const makeAscii = (output: string[]): MircExportResult => ({
  filename: 'test.txt',
  output,
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── startExport — clipboard ──────────────────────────────────────

describe('startExport — clipboard type', () => {
  it('calls copyText with joined output', () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    const ascii = makeAscii(['line1\n', 'line2\n']);

    startExport('clipboard', ascii, copyText, showToast);

    expect(copyText).toHaveBeenCalledWith('line1\nline2\n');
  });

  it('shows success toast on successful copy', async () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    const ascii = makeAscii(['hello']);

    startExport('clipboard', ascii, copyText, showToast);

    // Wait for the promise chain
    await vi.waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        'Copied mIRC to clipboard!',
        { type: 'success' },
      );
    });
  });

  it('shows error toast on failed copy', async () => {
    const copyText = vi.fn(() => Promise.reject(new Error('fail')));
    const showToast = vi.fn();
    const ascii = makeAscii(['hello']);

    startExport('clipboard', ascii, copyText, showToast);

    await vi.waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        'Error when copying mIRC to clipboard!',
        { type: 'error' },
      );
    });
  });

  it('shows warning when lines exceed IRC byte limits', () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    // Create a line >500 bytes
    const longLine = 'A'.repeat(600);
    const ascii = makeAscii([longLine]);

    startExport('clipboard', ascii, copyText, showToast);

    // Should show the IRC warning
    expect(showToast).toHaveBeenCalledWith(
      expect.stringContaining('may be too large for IRC'),
      expect.objectContaining({ type: 'error' }),
    );
  });

  it('shows singular "Line" for single over-limit line', () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    const longLine = 'A'.repeat(600);
    const ascii = makeAscii([longLine]);

    startExport('clipboard', ascii, copyText, showToast);

    const warningCall = showToast.mock.calls.find(
      (call: any[]) => call[0].includes('may be too large'),
    );
    expect(warningCall).toBeDefined();
    expect(warningCall![0]).toContain('Line 1');
    expect(warningCall![0]).not.toContain('Lines');
  });

  it('shows plural "Lines" for multiple over-limit lines', () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    const longLine = 'A'.repeat(600);
    // Use newlines to create separate lines
    const ascii = makeAscii([longLine + '\n' + longLine]);

    startExport('clipboard', ascii, copyText, showToast);

    const warningCall = showToast.mock.calls.find(
      (call: any[]) => call[0].includes('may be too large'),
    );
    expect(warningCall).toBeDefined();
    expect(warningCall![0]).toContain('Lines');
  });

  it('does not show warning when all lines are within limits', () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    const ascii = makeAscii(['short line\n', 'another short one\n']);

    startExport('clipboard', ascii, copyText, showToast);

    // Only the copy success/error toast — no IRC warning
    const warningCalls = showToast.mock.calls.filter(
      (call: any[]) => call[0].includes('too large'),
    );
    expect(warningCalls).toHaveLength(0);
  });

  it('handles empty output', () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    const ascii = makeAscii([]);

    startExport('clipboard', ascii, copyText, showToast);

    expect(copyText).toHaveBeenCalledWith('');
  });
});

// ─── startExport — file type ──────────────────────────────────────

describe('startExport — file type', () => {
  it('does not call copyText for file export', () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    const ascii = makeAscii(['data']);

    startExport('file', ascii, copyText, showToast);

    expect(copyText).not.toHaveBeenCalled();
  });

  it('still shows IRC warnings for file export', () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    const longLine = 'A'.repeat(600);
    const ascii = makeAscii([longLine]);

    startExport('file', ascii, copyText, showToast);

    expect(showToast).toHaveBeenCalledWith(
      expect.stringContaining('too large'),
      expect.objectContaining({ type: 'error' }),
    );
  });

  it('does not show any toast for file export with short lines', () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    const ascii = makeAscii(['short']);

    startExport('file', ascii, copyText, showToast);

    expect(showToast).not.toHaveBeenCalled();
    expect(copyText).not.toHaveBeenCalled();
  });
});

// ─── startExport — edge cases ─────────────────────────────────────

describe('startExport — edge cases', () => {
  it('handles special characters in output', () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    const ascii = makeAscii(['\x031,2hello\x0f world']);

    startExport('clipboard', ascii, copyText, showToast);

    expect(copyText).toHaveBeenCalledWith('\x031,2hello\x0f world');
  });

  it('handles single line output', () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    const ascii = makeAscii(['single line']);

    startExport('clipboard', ascii, copyText, showToast);

    expect(copyText).toHaveBeenCalledWith('single line');
  });

  it('warning toast has correct error type and position', () => {
    const copyText = vi.fn(() => Promise.resolve());
    const showToast = vi.fn();
    const longLine = 'A'.repeat(600);
    const ascii = makeAscii([longLine]);

    startExport('clipboard', ascii, copyText, showToast);

    expect(showToast).toHaveBeenCalledWith(
      expect.any(String),
      {
        type: 'error',
        position: 'bottom-center',
        duration: 1200,
      },
    );
  });
});
