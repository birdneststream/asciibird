/**
 * CP437 (Code Page 437 / DOS Latin US) Decode Utility
 *
 * Maps CP437 byte values to Unicode code points for decoding legacy
 * ANSI art files (.ans) that use the DOS character set.
 *
 * Source: Unicode Consortium IBMPC mapping
 * https://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/PC/CP437.TXT
 *
 * IMPORTANT: Bytes 0-127 are kept as standard ASCII. The CP437 "graphical"
 * representations of control characters (0x01=☺, 0x1B=←, etc.) are display-
 * only and NOT used here — ANSI escape sequences require byte 0x1B to remain
 * as the ESC character (\x1b). Only bytes 128-255 use CP437 mappings.
 */

/**
 * CP437-to-Unicode mapping for bytes 128-255.
 * Index 0 corresponds to byte 0x80, index 127 to byte 0xFF.
 */
// prettier-ignore
const CP437_HIGH: string[] = [
  // 0x80-0x8F
  '\u00C7', '\u00FC', '\u00E9', '\u00E2', // Çüéâ
  '\u00E4', '\u00E0', '\u00E5', '\u00E7', // äàåç
  '\u00EA', '\u00EB', '\u00E8', '\u00EF', // êëèï
  '\u00EE', '\u00EC', '\u00C4', '\u00C5', // îìÄÅ
  // 0x90-0x9F
  '\u00C9', '\u00E6', '\u00C6', '\u00F4', // ÉæÆô
  '\u00F6', '\u00F2', '\u00FB', '\u00F9', // öòûù
  '\u00FF', '\u00D6', '\u00DC', '\u00A2', // ÿÖÜ¢
  '\u00A3', '\u00A5', '\u20A7', '\u0192', // £¥₧ƒ
  // 0xA0-0xAF
  '\u00E1', '\u00ED', '\u00F3', '\u00FA', // áíóú
  '\u00F1', '\u00D1', '\u00AA', '\u00BA', // ñÑªº
  '\u00BF', '\u2310', '\u00AC', '\u00BD', // ¿⌐¬½
  '\u00BC', '\u00A1', '\u00AB', '\u00BB', // ¼¡«»
  // 0xB0-0xBF: Box drawing and shading
  '\u2591', '\u2592', '\u2593', '\u2502', // ░▒▓│
  '\u2524', '\u2561', '\u2562', '\u2556', // ┤╡╢╖
  '\u2555', '\u2563', '\u2551', '\u2557', // ╕╣║╗
  '\u255D', '\u255C', '\u255B', '\u2510', // ╝╜╛┐
  // 0xC0-0xCF: Box drawing
  '\u2514', '\u2534', '\u252C', '\u251C', // └┴┬├
  '\u2500', '\u253C', '\u2564', '\u2565', // ─┼╤╥
  '\u2559', '\u2558', '\u2552', '\u2553', // ╙╘╒╓
  '\u256B', '\u256A', '\u2518', '\u250C', // ╫╪┘┌
  // 0xD0-0xDF: Block elements + math
  '\u2588', '\u2584', '\u258C', '\u2590', // █▄▌▐
  '\u2580', '\u03B1', '\u00DF', '\u0393', // ▀αßΓ
  '\u03C0', '\u03A3', '\u03C3', '\u00B5', // πΣσµ
  '\u03C4', '\u03A6', '\u0398', '\u03A9', // τΦΘΩ
  // 0xE0-0xEF: Greek + math
  '\u03B4', '\u221E', '\u03C6', '\u03B5', // δ∞φε
  '\u2229', '\u2261', '\u00B1', '\u2265', // ∩≡±≥
  '\u2264', '\u2320', '\u2321', '\u00F7', // ≤⌠⌡÷
  '\u2248', '\u00B0', '\u2219', '\u00B7', // ∞°··
  // 0xF0-0xFF: Misc
  '\u221A', '\u207F', '\u00B2', '\u25A0', // √ⁿ²■
  '\u00A0', '\u00A0', '\u00A0', '\u00A0', // NBSP (0xF4-0xF7 undefined)
  '\u00A0', '\u00A0', '\u00A0', '\u00A0', // 0xF8-0xFB undefined
  '\u00A0', '\u00A0', '\u00A0', '\u00A0', // 0xFC-0xFF undefined
];

/**
 * Decode a CP437-encoded ArrayBuffer to a Unicode string.
 *
 * Bytes 0-127: kept as standard ASCII (preserves ESC, LF, CR for
 * ANSI escape sequence parsing).
 * Bytes 128-255: mapped via CP437 high table (box-drawing, block elements).
 */
export function decodeCp437(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chars: string[] = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b < 128) {
      // Standard ASCII — preserves control chars (ESC, LF, CR, etc.)
      chars[i] = String.fromCharCode(b);
    } else {
      // CP437 high range (128-255)
      chars[i] = CP437_HIGH[b - 128] ?? '\uFFFD';
    }
  }
  return chars.join('');
}

/**
 * Check if a decoded string contains UTF-8 replacement characters (U+FFFD),
 * which indicate that the original bytes were not valid UTF-8.
 */
export function hasUtf8ReplacementChars(text: string): boolean {
  return text.includes('\uFFFD');
}

/**
 * Decode an ANSI file buffer, trying UTF-8 first and falling back to CP437.
 *
 * Strategy:
 * 1. Try UTF-8 decode with `fatal: false` (replaces invalid sequences with
 *    U+FFFD rather than throwing)
 * 2. If the result contains no replacement characters, it's valid UTF-8
 * 3. If replacement characters are found, decode as CP437 instead
 *
 * This handles both modern UTF-8 .ans files and legacy CP437 .ans files.
 */
export function decodeAnsiBuffer(buffer: ArrayBuffer): string {
  // Try UTF-8 first (handles modern ANSI art tools)
  const utf8Text = new TextDecoder('utf-8', { fatal: false })
    .decode(buffer);
  if (!hasUtf8ReplacementChars(utf8Text)) {
    return utf8Text;
  }
  // Fall back to CP437 for legacy DOS files
  return decodeCp437(buffer);
}

/**
 * Strip SAUCE metadata from a raw ArrayBuffer (operates on bytes, before
 * encoding decode). SAUCE records are exactly 128 bytes at the end of the
 * file, starting with the ASCII string "SAUCE00".
 */
export function stripSauceBytes(buffer: ArrayBuffer): ArrayBuffer {
  if (buffer.byteLength < 128) return buffer;
  const bytes = new Uint8Array(buffer);
  const sauceStart = buffer.byteLength - 128;
  // Check for "SAUCE00" signature (7 ASCII bytes)
  if (
    bytes[sauceStart] === 0x53 &&     // S
    bytes[sauceStart + 1] === 0x41 && // A
    bytes[sauceStart + 2] === 0x55 && // U
    bytes[sauceStart + 3] === 0x43 && // C
    bytes[sauceStart + 4] === 0x45 && // E
    bytes[sauceStart + 5] === 0x30 && // 0
    bytes[sauceStart + 6] === 0x30    // 0
  ) {
    return buffer.slice(0, sauceStart);
  }
  return buffer;
}
