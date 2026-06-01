// Tests for useDialog composable
import { describe, it, expect, beforeEach } from 'vitest';
import { useDialog } from '../../../src/composables/useDialog';

describe('useDialog', () => {
  let dialog: ReturnType<typeof useDialog>;

  beforeEach(() => {
    dialog = useDialog();
  });

  describe('prompt + ok', () => {
    it('returns user input when ok() is called without arguments', async () => {
      const promise = dialog.prompt({
        title: 'Enter URL',
        text: 'Please enter a URL',
        inputValue: 'https://example.com/post',
      });

      // Simulate the user clicking OK without passing the event
      dialog.ok();

      const result = await promise;
      expect(result.isOk).toBe(true);
      expect(result.input).toBe('https://example.com/post');
    });

    it('returns explicit input when ok() is called with a string', async () => {
      const promise = dialog.prompt({
        title: 'Enter URL',
        inputValue: 'https://example.com/post',
      });

      dialog.ok('https://other.com/api');

      const result = await promise;
      expect(result.isOk).toBe(true);
      expect(result.input).toBe('https://other.com/api');
    });

    it('returns inputValue when ok() called with no args (regression: PointerEvent bug)', async () => {
      // Regression test: Previously, the OK button template used
      // @click="dialogOk" which passed a PointerEvent as the first arg.
      // Since PointerEvent is truthy, `input ?? state.value.inputValue`
      // would return the event object instead of the actual user input.
      // The fix ensures @click="() => dialogOk()" passes no args.
      const userInput = 'https://httpbin.org/post';
      const promise = dialog.prompt({
        title: 'HTTP Post your Ascii',
        text: 'Please input the URL for the HTTP Post sir',
        inputValue: userInput,
      });

      // Call ok() with no args — simulates the fixed template
      dialog.ok();

      const result = await promise;
      expect(result.isOk).toBe(true);
      expect(result.input).toBe(userInput);
      // Ensure input is a string, not an Event object
      expect(typeof result.input).toBe('string');
    });

    it('does NOT use inputValue when ok() receives explicit input', async () => {
      const promise = dialog.prompt({
        inputValue: 'default-value',
      });

      dialog.ok('override-value');

      const result = await promise;
      expect(result.input).toBe('override-value');
    });
  });

  describe('cancel', () => {
    it('resolves with isOk=false and empty input', async () => {
      const promise = dialog.prompt({
        title: 'Enter URL',
        inputValue: 'https://example.com/post',
      });

      dialog.cancel();

      const result = await promise;
      expect(result.isOk).toBe(false);
      expect(result.input).toBe('');
    });
  });

  describe('confirm', () => {
    it('resolves with isOk=true when ok() is called', async () => {
      const promise = dialog.confirm({
        title: 'Confirm action',
        text: 'Are you sure?',
      });

      dialog.ok();

      const result = await promise;
      expect(result.isOk).toBe(true);
    });

    it('resolves with isOk=false when cancel() is called', async () => {
      const promise = dialog.confirm({
        title: 'Confirm action',
      });

      dialog.cancel();

      const result = await promise;
      expect(result.isOk).toBe(false);
    });
  });
});
