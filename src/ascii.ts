import LZString from 'lz-string';
import type { Block, Layer, ImageOverlay, AsciibirdMetaBuilder, MircExportResult, ToolbarIcon, CreateAsciiForm } from './types';
import type { AsciiStoreAccess, ModalStoreAccess } from './types/store';
import { HalfBlockGrid } from './utils/halfBlockGrid';
import { CANVAS_DEFAULT_X, CANVAS_DEFAULT_Y } from './store/panels';

// Lazy store references to break circular dependency
// Store imports from ascii, ascii imports store
// Using a getter ensures store is only accessed after initialization

let _store: AsciiStoreAccess | null = null;
let _modalStore: ModalStoreAccess | null = null;

export const setStore = (s: AsciiStoreAccess): void => {
  _store = s;
};

export const setModalStore = (s: ModalStoreAccess): void => {
  _modalStore = s;
};

const getStore = (): AsciiStoreAccess => {
  if (!_store) {
    throw new Error(
      'Store not initialized. Import store before using ascii.ts functions.',
    );
  }
  return _store;
};

const getModalStore = (): ModalStoreAccess => {
  if (!_modalStore) {
    throw new Error(
      'Modal store not initialized.',
    );
  }
  return _modalStore;
};

// 0  => 'white',
// 1  => 'black',
// 2  => 'navy',
// 3  => 'green',
// 4  => 'red',
// 5  => 'brown',
// 6  => 'purple',
// 7  => 'olive',
// 8  => 'yellow',                  # dark yellow
// 9  => 'lime',                  # ltgreen
// 10 => 'teal',
// 11 => 'cyan',
// 12 => 'blue',                  # ltblue,
// 13 => 'fuchsia',                  # pink
// 14 => 'grey',
// 15 => 'lightgrey',
export const mircColours99: string[] = [
  'rgb(255,255,255)',
  'rgb(0,0,0)',
  'rgb(0,0,127)',
  'rgb(0,147,0)',
  'rgb(255,0,0)',
  'rgb(127,0,0)',
  'rgb(156,0,156)',
  'rgb(252,127,0)',
  'rgb(255,255,0)',
  'rgb(0,252,0)',
  'rgb(0,147,147)',
  'rgb(0,255,255)',
  'rgb(0,0,252)',
  'rgb(255,0,255)',
  'rgb(127,127,127)',
  'rgb(210,210,210)',

  '#470000',
  '#472100',
  '#474700',
  '#324700',
  '#004700',
  '#00472c',
  '#004747',
  '#002747',
  '#000047',
  '#2e0047',
  '#470047',
  '#47002a',
  '#740000',
  '#743a00',
  '#747400',
  '#517400',
  '#007400',
  '#007449',
  '#007474',
  '#004074',
  '#000074',
  '#4b0074',
  '#740074',
  '#740045',
  '#b50000',
  '#b56300',
  '#b5b500',
  '#7db500',
  '#00b500',
  '#00b571',
  '#00b5b5',
  '#0063b5',
  '#0000b5',
  '#7500b5',
  '#b500b5',
  '#b5006b',
  '#ff0000',
  '#ff8c00',
  '#ffff00',
  '#b2ff00',
  '#00ff00',
  '#00ffa0',
  '#00ffff',
  '#008cff',
  '#0000ff',
  '#a500ff',
  '#ff00ff',
  '#ff0098',
  '#ff5959',
  '#ffb459',
  '#ffff71',
  '#cfff60',
  '#6fff6f',
  '#65ffc9',
  '#6dffff',
  '#59b4ff',
  '#5959ff',
  '#c459ff',
  '#ff66ff',
  '#ff59bc',
  '#ff9c9c',
  '#ffd39c',
  '#ffff9c',
  '#e2ff9c',
  '#9cff9c',
  '#9cffdb',
  '#9cffff',
  '#9cd3ff',
  '#9c9cff',
  '#dc9cff',
  '#ff9cff',
  '#ff94d3',
  '#000000',
  '#131313',
  '#282828',
  '#363636',
  '#4d4d4d',
  '#656565',
  '#818181',
  '#9f9f9f',
  '#bcbcbc',
  '#e2e2e2',
  '#ffffff',
];

// How big the brush size can get
// Although you can type in the input a bigger number than this anyway
export const maxBrushSize: number = 50;

// Character groups for the char picker — organized by IRC art relevance
export const charGroups: { label: string; chars: string[] }[] = [
  {
    label: 'Basic',
    chars: [
      ' ', '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-',
      '.', '/',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=',
      '>', '?', '@',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
      'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      '[', '\\', ']', '^', '_', '`',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
      'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      '{', '|', '}', '~',
    ],
  },
  {
    label: 'Block Elements',
    chars: [
      '█', '▓', '▒', '░', '▄', '▀', '▌', '▐',
      '▇', '▆', '▅', '▃', '▂', '▁', '■', '▬',
      '▉', '▊', '▋', '▍', '▎', '▏',
      '▗', '▖', '▝', '▘', '▚', '▙', '▜', '▛', '▞', '▟',
    ],
  },
  {
    label: 'Box Drawing',
    chars: [
      '─', '│', '┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼',
      '═', '║', '╔', '╗', '╚', '╝', '╠', '╣', '╦', '╩', '╬',
      '╭', '╮', '╰', '╯',
    ],
  },
  {
    label: 'Arrows & Symbols',
    chars: [
      '←', '↑', '→', '↓', '↔', '↕',
      '◆', '◇', '○', '●', '▲', '▼', '◀', '▶',
      '★', '☆', '♠', '♣', '♥', '♦',
      '☺', '☻', '☼', '►', '◄', '¶', '§',
    ],
  },
  {
    label: 'Math & Special',
    chars: [
      '°', '±', '×', '÷', '≡', '∞', '≤', '≥',
      '⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹',
      '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉',
      '½', '¼', '¾', '⅓', '⅔', '⅛', '⅜', '⅝', '⅞',
      '¢', '£', '¥', '€', '¤', '¿', '¡', '¬', '¯', 'µ',
      '¦', '¨', '·', '´', '¸',
    ],
  },
];

// Flat char array for backward compatibility
export const charCodes: string[] = charGroups.flatMap(g => g.chars);

// Toolbar icons
export const toolbarIcons: ToolbarIcon[] = [
  { name: 'default', icon: 'edit_off' },
  { name: 'select', icon: 'photo_size_select_small' },
  { name: 'text', icon: 'text_rotation_none' },
  { name: 'fill', icon: 'format_color_fill' },
  { name: 'brush', icon: 'brush' },
  { name: 'dropper', icon: 'colorize' },
  { name: 'eraser', icon: 'remove_circle_outline' },
  { name: 'fill-eraser', icon: 'auto_fix_off' },
];

export const emptyBlock: Block = {};

/**
 * Check if a block has no properties set.
 * Semantically equivalent to `JSON.stringify(block) === '{}'`
 * because the codebase uses `delete` (not `= undefined`) to reset blocks.
 */
export function isEmptyBlock(block: Block): boolean {
  return Object.keys(block).length === 0;
}

export const create2DArray = (rows: number): Block[][] => {
  const arr: Block[][] = [];

  for (let i = 0; i < rows; i++) {
    arr[i] = [];
  }

  return arr;
};

// Width and height of the ASCII blocks
// they seem to be 8x15 in asciiblaster
export const blockWidth = 8;
export const blockHeight = 15;

// Limits for undo and brush histories
export const maxBrushHistory = 200;
export const maxUndoHistory = 500;
export const tabLimit = 20;

const defaultImageOverlay = (): ImageOverlay => ({
  url: null,
  opacity: 95,
  asciiOpacity: 100,
  left: 0,
  top: 0,
  position: 'centered',
  size: 100,
  repeatx: true,
  repeaty: true,
  visible: false,
  stretched: false,
});

export const parseMircAscii = async (
  contents: string,
  filename: string,
): Promise<boolean> => {
  // The current state of the Colours
  // Note: Do NOT collapse \x03\x03 — the first \x03 is a valid soft reset
  // that clears fg/bg. Collapsing destroys the reset and causes bg to
  // incorrectly persist across half-block boundaries (Bug #23).
  contents = contents
    .split('\u000F').join('')
    .split('\u0003\n').join('\n')
    .split('\u0002\u0003').join('\u0003')
    .split('\u0002').join('') // bold
    .split('\u001D').join(''); // bg highlight

  const asciiLines = contents.split('\n');

  const initialLayers: Layer[] = [{
    label: filename,
    visible: true,
    data: create2DArray(contents.split('\n').length),
    width: 0, // calculated below
    height: contents.split('\n').length,
  }];

  const finalAscii: AsciibirdMetaBuilder = {
    title: filename,
    layers: initialLayers,
    history: [],
    historyIndex: 0,
    imageOverlay: defaultImageOverlay(),
    x: blockWidth * 35,
    y: blockHeight * 2,
    selectedLayer: 0,
  };

  // https://modern.ircdocs.horse/formatting.html#color
  const asciiblasterRegex = /(^[\d]{1,2})?(?:,([\d]{1,2}))?/;
  let cleanedWidth = 0;

  for (const y in asciiLines) {
    const line = asciiLines[y];
    const len = line.length - 1;
    let char: string;
    let block: Block = {};
    let pos = -1;
    let actualPos = 0;

    while (pos < len) {
      pos++;
      char = line[pos];

      // This code and regex came from asciiblaster and was changed to
      // work with asciibird.
      if (char === '\x03') {
        const matches = line.substring(pos + 1, pos + 6)
          .match(asciiblasterRegex);

        if (!matches) continue;

        // \x03 without color code is a soft block reset
        if (matches[1] === undefined && matches[2] === undefined) {
          block.fg = null;
          block.bg = null;
          continue;
        }

        if (matches[1] !== undefined) {
          block.fg = Number(matches[1]);
        }

        if (matches[2] !== undefined) {
          block.bg = Number(matches[2]);
        }

        pos += matches[0].length;
        continue;
      }

      block.char = char;

      initialLayers[0].data[y][actualPos] = {
        ...block,
      };

      actualPos++;

      if (actualPos > cleanedWidth) {
        cleanedWidth = actualPos;
      }
    }

    block = {};
  }

  initialLayers[0].width = cleanedWidth;

  // First layer data generation
  const filledLayers = [...fillNullBlocks(
    initialLayers[0].height,
    initialLayers[0].width,
    initialLayers,
  )];

  // Store the ASCII and ensure we have no null blocks
  finalAscii.layers = LZString.compressToUTF16(
    JSON.stringify(filledLayers),
  );

  // Save ASCII to storage
  getStore().newAsciibirdMeta(finalAscii);

  return true;
};

// Creates new blank ASCII
export const createNewAscii = (forms: CreateAsciiForm): boolean => {
  const initialLayers: Layer[] = [{
    label: forms.createAscii.title,
    visible: true,
    data: create2DArray(Number(forms.createAscii.height)),
    width: Number.parseInt(String(forms.createAscii.width)),
    height: Number.parseInt(String(forms.createAscii.height)),
  }];

  const newAscii: AsciibirdMetaBuilder = {
    title: forms.createAscii.title,
    history: [],
    historyIndex: 0,
    x: CANVAS_DEFAULT_X,
    y: CANVAS_DEFAULT_Y,
    layers: initialLayers,
    imageOverlay: defaultImageOverlay(),
    selectedLayer: 0,
  };

  const filledLayers = [...fillNullBlocks(
    initialLayers[0].height,
    initialLayers[0].width,
    initialLayers,
  )];

  newAscii.layers = LZString.compressToUTF16(
    JSON.stringify(filledLayers),
  );

  getStore().newAsciibirdMeta(newAscii);
  getModalStore().closeModal('new-ascii');

  return true;
};

// Converts ASCIIBIRD blocks to mIRC colours
export const exportMirc = (blocks: Block[][] | null = null): MircExportResult => {
  let currentAscii: { title: string };
  let currentAsciiLayersWidthHeight: { height: number; width: number };

  if (blocks === null) {
    // Export the entire main ascii
    const ascii = getStore().currentAscii;
    if (!ascii) {
      return { filename: 'empty.txt', output: [''] };
    }
    currentAscii = ascii;
    currentAsciiLayersWidthHeight = getStore().currentAsciiLayersWidthHeight;
    blocks = mergeLayers();
  } else {
    // We are exporting a brush
    currentAscii = {
      title: `brush-${cyrb53(JSON.stringify(blocks))}.txt`,
    };
    currentAsciiLayersWidthHeight = {
      height: blocks.length,
      width: blocks[0].length,
    };
  }

  const output: string[] = [];
  let curBlock: Block;
  let pushString = '';

  let prevBlock: Block = { bg: -1, fg: -1 };

  const optimiseArray = ['\u2580', '\u2584', '\u2588'];

  const zeroPad = (num: number, places = 2): string =>
    String(num).padStart(places, '0');

  for (let y = 0; y <= currentAsciiLayersWidthHeight.height - 1; y++) {
    for (let x = 0; x <= currentAsciiLayersWidthHeight.width - 1; x++) {
      // Determine if we need an extra 0 to pad a colour
      const nextBlock = blocks[y][x + 1];
      const isPadded = !!(
        (nextBlock !== undefined &&
          (nextBlock.bg === undefined || nextBlock.fg === undefined) &&
          nextBlock.char !== undefined &&
          Number.parseInt(nextBlock.char) >= 0 &&
          Number.parseInt(nextBlock.char) <= 9) ||
        (blocks[y][x].char !== undefined &&
          Number.parseInt(blocks[y][x].char ?? '') >= 0 &&
          Number.parseInt(blocks[y][x].char ?? '') <= 9)
      );

      // If we have a difference between our previous block
      // we'll put colour codes and continue as normal
      curBlock = { ...blocks[y][x] };

      // Optimise out half or full blocks with same bg and fg
      if (curBlock.fg === curBlock.bg &&
          optimiseArray.includes(curBlock.char ?? '')) {
        curBlock.fg = 0;
        curBlock.char = ' ';
      }

      if (curBlock.bg !== prevBlock.bg || curBlock.fg !== prevBlock.fg) {
        if (curBlock.fg === undefined && curBlock.bg === undefined) {
          output.push('\u0003');
        } else {
          if (curBlock.bg === undefined && curBlock.fg !== undefined) {
            output.push('\u0003');
            pushString = `\u0003${isPadded ? zeroPad(curBlock.fg) : curBlock.fg}`;
          }

          if (curBlock.bg !== undefined && curBlock.fg !== undefined) {
            pushString =
              `\u0003${curBlock.fg},${isPadded ? zeroPad(curBlock.bg) : curBlock.bg}`;
          }

          if (curBlock.bg !== undefined && curBlock.fg === undefined) {
            pushString =
              `\u00030,${isPadded ? zeroPad(curBlock.bg) : curBlock.bg}`;
          }

          output.push(pushString);
        }
      }

      // null .chars will end up as space
      output.push(curBlock.char ?? ' ');

      prevBlock = { ...curBlock };
    }

    // We can never have a -1 colour code so we'll always
    // write one at the start of each line
    prevBlock = { bg: -1, fg: -1 };

    output.push('\n');
  }

  // Check if filename already ends with .txt
  const filename = currentAscii.title.slice(currentAscii.title.length - 3) === 'txt'
    ? currentAscii.title
    : `${currentAscii.title}.txt`;

  return { filename, output };
};

// Download a string to a file with a filename
export const downloadFile = (
  content: string,
  filename: string,
  contentType: string,
): void => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });

  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
};

export function canvasToPng(
  canvas: HTMLCanvasElement,
  filename: string,
): void {
  const downloadLink = document.createElement('a');
  downloadLink.setAttribute('download', filename);
  canvas.toBlob(function (blob: Blob | null) {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    try {
      downloadLink.setAttribute('href', url);
      downloadLink.click();
    } finally {
      // Revoke after a delay to allow the download to start
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  });
}

export const checkForGetRequest = async (): Promise<void> => {
  const url = new URL(location.href);
  const haxAscii = url.searchParams.get('haxAscii');
  const birdhole = url.searchParams.get('birdhole');

  if (!haxAscii && !birdhole) return;

  try {
    if (haxAscii) {
      const res = await fetch(`https://art.shrews.xyz/${haxAscii}`, {
        method: 'GET',
        headers: { Accept: 'text/plain' },
      });

      if (!res.ok) {
        console.warn(
          `[asciibird] Failed to fetch haxAscii: ${res.status}`,
        );
      } else {
        const asciiName = haxAscii.split('/').pop();
        const asciiData = await res.text();
        parseMircAscii(asciiData, asciiName || 'imported');
      }
    }

    if (birdhole) {
      const res = await fetch(
        `https://hole.birdnest.live/derived/${birdhole}.png/${birdhole}.txt`,
        {
          method: 'GET',
          headers: { Accept: 'text/plain' },
        },
      );

      if (!res.ok) {
        console.warn(
          `[asciibird] Failed to fetch birdhole: ${res.status}`,
        );
      } else {
        const asciiData = await res.text();
        parseMircAscii(asciiData, `${birdhole}.txt`);
      }
    }
  } finally {
    url.search = '';
    history.replaceState({}, '', url.toString());
  }
};

// Hashing algo to detect duplicate brushes
// from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
export const cyrb53 = (str: string, seed = 1337): number => {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

// Mostly plain text asciis wont have all their blocks
// so this will fix that
export const fillNullBlocks = (
  height: number,
  width: number,
  layerData: Layer[] | null = null,
): Layer[] => {
  let layers: Layer[];

  if (layerData === null) {
    layers = [...getStore().currentAsciiLayers];
  } else {
    layers = [...layerData];
  }

  for (let i = 0; i <= layers.length - 1; i++) {
    const blocks = layers[i].data;

    for (let y = 0; y < height; y++) {
      // New row
      if (!blocks[y]) {
        blocks[y] = [];
        for (let x = 0; x < width; x++) {
          blocks[y][x] = { ...emptyBlock };
        }
      } else {
        // Existing rows but new cols
        for (let x = 0; x < width; x++) {
          if (blocks[y] && !blocks[y][x]) {
            blocks[y][x] = { ...emptyBlock };
          }
        }
      }
    }

    // Update layer with new blocks
    layers[i].data = [...blocks];
    layers[i].width = width;
    layers[i].height = height;
  }

  return [...layers];
};

// Sometimes if we copy blocks the initial Y values will be null
// and cause an error when trying to calculate width
// So we get the longest x length
export const getBlocksWidth = (blocks: (Block[] | null)[]): number => {
  let maxWidth = 0;

  for (let y = 0; y < blocks.length; y++) {
    if (!blocks[y]) {
      continue;
    }

    if (blocks[y] && blocks[y]!.length > maxWidth) {
      maxWidth = blocks[y]!.length;
    }
  }

  return maxWidth;
};

// This removes the null blocks from our copy and paste
// to make sure it's centered better
export const filterNullBlocks = (blocks: (Block[] | null)[]): Block[][] => {
  const newBlocks: Block[][] = [];

  const filtered = blocks.filter(
    (item): item is Block[] => item !== null,
  );

  for (let y = 0; y < filtered.length; y++) {
    newBlocks[y] = filtered[y].filter(
      (item): item is Block => item !== null,
    );
  }

  return newBlocks;
};

// Function to check if the left and top values are visible on the screen
export const checkVisible = (bottom: number, top: number): boolean => {
  const viewHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight,
  );
  return !(bottom < 0 || top - viewHeight >= 0);
};

/**
 * A single cell change recorded during flood fill.
 * Two FillChanges (old+new per cell) map to one undo HistoryDiff entry
 * via storeDiffBlocks in Editor.vue.
 */
export interface FillChange {
  x: number;
  y: number;
  old: Block;
  new: Block;
}

/**
 * Iterative flood fill using DFS with visited set.
 * Replaces recursive approach to avoid stack overflow on large grids.
 * Selectively targets only the properties enabled by canBg/canFg/canText.
 * Returns an array of changes for efficient undo diff construction.
 *
 * Boundary checks: Only bg and char are used as boundary conditions.
 * Fg matching is intentionally excluded to match the original recursive
 * fillTool behavior — fg-only fills traverse all blocks matching the
 * bg/char pattern and change only the foreground colour.
 *
 * When ALL targeting flags (canBg, canFg, canText) are false, the fill
 * has no boundary and no effect — it returns early to prevent filling
 * the entire grid.
 */
export const iterativeFill = (
  blocks: Block[][],
  startY: number,
  startX: number,
  current: Block,
  fillColor: Block,
  canBg: boolean,
  canFg: boolean,
  canText: boolean,
  eraser: boolean,
): FillChange[] => {
  const changes: FillChange[] = [];

  // If no targeting flags are active, nothing to fill — bail early
  // to prevent filling the entire grid without boundary checks
  if (!canBg && !canFg && !canText) return changes;

  const height = blocks.length;
  if (height === 0) return changes;
  const width = blocks[0]?.length ?? 0;
  if (width === 0) return changes;

  // Bounds check starting position
  if (startY < 0 || startY >= height || startX < 0 || startX >= width) {
    return changes;
  }

  // Check if starting block matches current
  const startBlock = blocks[startY]?.[startX];
  if (!startBlock) return changes; // ragged array guard
  if (canBg && startBlock.bg !== current.bg) return changes;
  if (canText && startBlock.char !== current.char) return changes;

  const visited = new Set<number>();
  const stack: Array<{ x: number; y: number }> = [
    { x: startX, y: startY },
  ];

  while (stack.length > 0) {
    const pos = stack.pop()!;
    const key = pos.y * width + pos.x;

    if (visited.has(key)) continue;
    if (pos.y < 0 || pos.y >= height || pos.x < 0 || pos.x >= width) {
      continue;
    }

    const block = blocks[pos.y]?.[pos.x];
    if (!block) continue; // ragged array — skip missing cells

    // Check if this block matches the current color pattern
    if (canBg && block.bg !== current.bg) continue;
    if (canText && block.char !== current.char) continue;

    visited.add(key);

    // Save old state before mutation (shallow clone — Block has only
    // primitives)
    const oldBlock: Block = { ...block };

    // Apply fill (selectively target properties)
    if (!eraser) {
      if (canBg) block.bg = fillColor.bg;
      if (canFg) block.fg = fillColor.fg;
      if (canText) block.char = fillColor.char;
    } else {
      if (canBg) delete block.bg;
      if (canFg) delete block.fg;
      if (canText) delete block.char;
    }

    // Record the change
    changes.push({
      x: pos.x,
      y: pos.y,
      old: oldBlock,
      new: { ...block },
    });

    // Push neighbors (4-directional)
    stack.push({ x: pos.x - 1, y: pos.y });
    stack.push({ x: pos.x + 1, y: pos.y });
    stack.push({ x: pos.x, y: pos.y - 1 });
    stack.push({ x: pos.x, y: pos.y + 1 });
  }

  return changes;
};

/**
 * Half-block-aware iterative flood fill.
 *
 * Operates at double Y resolution using HalfBlockGrid.
 * Each half-block has a single colour property. The fill connects
 * half-blocks through the 4-connected neighbor graph provided by
 * HalfBlockGrid.getNeighbors().
 *
 * Returns FillChange[] at full-block granularity for undo compatibility.
 * Multiple changes for the same block cell are deduplicated — only the
 * first old/new pair for each cell is kept.
 */
export const iterativeFillHalfBlock = (
  blocks: Block[][],
  startHalfY: number,
  startX: number,
  fillColour: number,
): FillChange[] => {
  const grid = new HalfBlockGrid(blocks);
  const changes: FillChange[] = [];
  const cellChanges = new Map<string, { old: Block; new: Block }>();
  const visited = new Set<string>();
  const stack: Array<{ x: number; y: number }> = [
    { x: startX, y: startHalfY },
  ];

  const targetColour = grid.getColour(startX, startHalfY);

  // Don't fill if target is same as fill colour
  if (targetColour === fillColour) return changes;

  while (stack.length > 0) {
    const pos = stack.pop()!;
    const key = `${pos.x},${pos.y}`;

    if (visited.has(key)) continue;
    if (pos.x < 0 || pos.x >= grid.width || pos.y < 0 || pos.y >= grid.height) {
      continue;
    }

    const currentColour = grid.getColour(pos.x, pos.y);
    if (currentColour !== targetColour) continue;
    visited.add(key);

    // Record change at full-block level
    const blockY = Math.floor(pos.y / 2);
    const cellKey = `${pos.x},${blockY}`;

    // Only snapshot old block once per cell (before first mutation)
    const sourceBlock = blocks[blockY]?.[pos.x];
    if (!sourceBlock) continue; // ragged array — skip missing cells
    if (!cellChanges.has(cellKey)) {
      cellChanges.set(cellKey, {
        old: { ...sourceBlock },
        new: {} as Block, // will be filled after all mutations
      });
    }

    // Apply fill — mutate in-place
    grid.setColour(pos.x, pos.y, fillColour);

    // Push neighbors using HalfBlockGrid connectivity
    for (const n of grid.getNeighbors(pos.x, pos.y)) {
      if (!visited.has(`${n.x},${n.y}`)) {
        stack.push(n);
      }
    }
  }

  // Build final changes with updated blocks
  for (const [cellKey, data] of cellChanges) {
    const [xStr, yStr] = cellKey.split(',');
    const cx = Number(xStr);
    const cy = Number(yStr);
    const finalBlock = blocks[cy]?.[cx];
    if (!finalBlock) continue; // ragged array — skip missing cells
    changes.push({
      x: cx,
      y: cy,
      old: data.old,
      new: { ...finalBlock },
    });
  }

  return changes;
};

/**
 * Check IRC line byte lengths and return indices exceeding 500-byte limit.
 * IRC protocol has a 512-byte line limit including nick/ident/host.
 * We use 500 as a practical threshold.
 */
export const checkIrcByteLimits = (output: string): number[] => {
  const lines = output.split('\n');
  const overLimit: number[] = [];

  lines.forEach((line, i) => {
    const byteLength = new TextEncoder().encode(line).length;
    if (byteLength > 500) {
      overLimit.push(i);
    }
  });

  return overLimit;
};

/**
 * Result of IRC line byte-length analysis for the status bar warning.
 */
export interface IrcLineCheck {
  /** Byte length of each line in the mIRC output */
  lineByteLengths: number[];
  /** Indices of lines exceeding the warning threshold */
  overLimitLines: number[];
  /** Maximum byte length across all lines */
  maxBytes: number;
}

/** IRC warning thresholds (bytes per line) */
export const IRC_WARN_THRESHOLD = 400;
export const IRC_ERROR_THRESHOLD = 500;

/**
 * Calculate mIRC byte lengths per line directly from block data.
 * Avoids running the full exportMirc pipeline — estimates byte length
 * by counting color code overhead per block transition.
 */
export const calculateMircLineBytes = (blocks: Block[][]): IrcLineCheck => {
  const lineByteLengths: number[] = [];
  let maxBytes = 0;
  const overLimitLines: number[] = [];

  for (let y = 0; y < blocks.length; y++) {
    let lineBytes = 0;
    let prevFg: number | undefined = -1;
    let prevBg: number | undefined = -1;

    for (let x = 0; x < blocks[y].length; x++) {
      const block = blocks[y][x];
      const fg = block?.fg ?? undefined;
      const bg = block?.bg ?? undefined;
      const char = block?.char ?? ' ';

      // Color code needed if fg or bg changed from previous block
      if (fg !== prevFg || bg !== prevBg) {
        // \x03 + fg digits + , + bg digits
        if (fg !== undefined && bg !== undefined) {
          lineBytes += 1 + String(fg).length + 1 + String(bg).length;
        } else if (fg !== undefined) {
          lineBytes += 1 + String(fg).length;
        } else if (bg !== undefined) {
          lineBytes += 1 + 1 + 1 + String(bg).length; // \x030,bg
        } else {
          lineBytes += 1; // \x03 reset
        }
      }

      // Character byte(s)
      lineBytes += new TextEncoder().encode(char).length;

      prevFg = fg;
      prevBg = bg;
    }

    lineByteLengths.push(lineBytes);
    if (lineBytes > maxBytes) maxBytes = lineBytes;
    if (lineBytes > IRC_ERROR_THRESHOLD) overLimitLines.push(y);
  }

  return { lineByteLengths, overLimitLines, maxBytes };
};

export const mergeLayers = (): Block[][] => {
  const mergedLayers: Block[][] = [];

  const currentLayers: Layer[] = getStore().currentAsciiLayers;

  for (let y = 0; y < currentLayers[0].height + 1; y++) {
    if (!mergedLayers[y]) {
      mergedLayers[y] = [];
    }

    for (let x = 0; x < currentLayers[0].width + 1; x++) {
      const curBlock: Block = { ...emptyBlock };

      // Loop layers (back to front)
      for (let z = currentLayers.length - 1; z >= 0; z--) {
        if (currentLayers[z].visible === false) {
          continue;
        }

        if (
          currentLayers[z] &&
          currentLayers[z].data &&
          currentLayers[z].data[y] &&
          currentLayers[z].data[y][x]
        ) {
          const srcBlock = currentLayers[z].data[y][x];

          if (curBlock.bg === undefined) {
            curBlock.bg = srcBlock.bg !== null ? srcBlock.bg : undefined;
          }

          if (curBlock.fg === undefined) {
            curBlock.fg = srcBlock.fg !== null ? srcBlock.fg : undefined;
          }

          if (curBlock.char === undefined) {
            curBlock.char = srcBlock.char !== null
              ? srcBlock.char
              : undefined;
          }

          continue;
        }
      }

      mergedLayers[y][x] = { ...curBlock };
    }
  }

  return mergedLayers;
};

// Splash screen ascii encoded
export const splashAscii: Block[][] = JSON.parse(
  LZString.decompressFromEncodedURIComponent(
    'NrDeCIGMAsEMCdwC5wAJwF8A0EYOWpjlHIiutrqQRcXmYZSfuUVS43da0wEYDmyAIxZwAM0FIRzBrQgDhoiYpk02qnlw5yNndrPUKpSydPpq+kgOwnkN3TqP3lSe+c3zrt16Pd7wRtIuZtz+Tt5uoY5e4jF+0XYRvlGGMS6R2qmJsdnxWT45BXmW2enJmSUFZQ75znEplXW5DcThhRkGjUk1Xe3lna1p9RWDpcMDnmPNI5NV4xajc9MTAUPLC7NNRS2b3cWLWx0bq1PbMydLZytt1fu7fT0HezsXh-3HN-Mer8-nn+vff5XD6mbwhP6gwrg66Q4LvQFrYEI05HZGXVFhREYhLo+GYlRwx6zIKQu4XEkqMlA7G1X4wlF4nFvInksGM-IU4wsqmw0kvMkCl5GAAc3lF3P5kohBL55zulAVAF0sGAJXKpStBerpVzCTyGSzAmzDbzKULTVz9brZfTcSaDVbmVaACzeV32pDulzux10kEO83IcUucW+h5h26B61mnVOqNx2N+tEJ20p-1IYOSUNRznQ9Np5NJ-F2q259mVTNB8uLSsZ6uzWvZnVlj0F4ttplFnEABm8vdbXdp4fjg96kcTw4n49To6ek5n8-TLat-Zc-dLxo3UPrrO3A8XhYP7dn92nS83OYvzavC7Ph7vx6PnafQ4fz7fHJv573W71GuOWqapeP7-h4Co4BgyqqoB35-tqQHwQBwFwbeXzFsuI4vmOaHvjhn4gdeBG2hhOpepIPpRmRyAUaRbo7kYVGevR5F0R6jE0ba7HMVWhRNsRX5oo23F1rxwkkahAKPh+FZimJAnFkJ+7SXOymnnhlTiemilWtpyE2lpslKepKnGWpkm4eZr6mT8WEmZZ2H2XZSJSdZ1JyURsH6WimloqukjrnpMb8R53nyRZzk4j5LmOWZEX4Sh+YnruCWhSF0VxQ5GVOTSmU5dlwkdvFXn+DB3ylehYXqPKEFQfoSGIWVoEVWlkWVblBVJW5RkxTZqnJcV4V5bFQ39UF6ZcWxrEulNgWWrNeapSlzVLTiuk6mtwUrfkG0GaJHpRT2fbCX5yABTqJ1IGdto7YJhk6XdUY3QpD1Tq5WLCU9q0vRJWXDR1tl-d1v29W9PEhu5W0aW1iwHdt327eD+3Q8SyOjXNhGQ4sF1XZ5Y2LQNRV48tBNQy1Vk9V1Eag9G6ObSTMOo5TmF9Uzr0U+9SNk0w1WgOBvMQTVKp1Y1DUlfNEP04DVPszKROtVzDMKyjSuc5jytqxcE3TYUHG47TesLcTctw3t92m498P48bpMayKltG-rvlHarkto4b8u2xa7v5NjEvWzW9se67dvm+tgcm4jZuRxbod0-76vBxzv6JwGbPAyH0dpyNGdZsdztR7nHqfYTjsO97NspyJmfXeHMmxwjhcFzxTciS3fEG37pdB-HIMyyWzPU7DFc90aKusz92dJ+LaoTHzc+1TP9UIXHXfk+nU8Y5XQ+K571EzbROud+Xixa5R++cefHcuyPhfVw3RMAHoR43Md31bq912-z31+-x8NrXWN87TxXEAzeN9ZYfx3pXX219IGzBgW3D6AD-4-2-l-bucCLgIKjNgsBmDR67yri-PBf8LjF3akDSeEDSEEMruQgOqCvqMOfs3V+xCa7MM-uw++rdgFsNYWHThDD0EsN4SQo+EjKH-RZhvFeNCvbSOpoVChydwE01ITzJUQtF6-0kdLdeqc5F6Kahg+R1DhKnwPt6Cxl80SWKMbAsxRCBEcJEVwlxPD263SEQnNR9CUFuOEdw7xgSAnBLLsY86oDbS4IcSAwoOMQnhKYaEshyC0k+IyaknOHikm5LQckkuTjYnphKboou6ScliLiQPPuZSCn5JSYU9x1TPFIMyVUrxDTWl5J6d0rpTTGmiIGcM9p2Tb7NKCUMlpIyZljMmb4-BsjEoA17gY-u4jHGROXhsOegtoImKKdsq+qjMHlR0Kcpx9jxq2OLNcuxtzTHHN6bMqZfTBmlyfnMipHSJmP1GT88ZYMFlYOiScvhUSEnzOmW815YSYXwveQCxBgKQWdOhUi75lyMVwqyWi-yYKnZQq2R6epHzcXotRQivF1LKUovpfwzFsKcUspJQywRQLnFMsRRSv53K3asuxVS-ldLGW8uBbShRUjpX6KoRsieii+7b0WRonYWiDmbKFVqiFNTNU6puYfSahrtbWKNaak1LE2X6vKey1x+KJUir5eKrlzr-E0sdQ611lSnWCrFb6jl9qXX+rtZKz1wbwUBtDeo8NLyY39LjeShNyK-XCq9b8sNqak1YpTbatpmb825tjQWnNJbI0eqDcWstabOVutFXq+tuqFUytqes5R+Vm0NqXrshetC1HKoFR2xtEaL7GrPqOqxlqLV7zNZOsd5q52zs7Ta0tIby21l1igAA6qIjd4AAASO68QAHlk1Vqzcyytq7q2BtrXyw2AAeU9V7z08pfe651-a63PsvXmwt8af1Fr-YmgD-6gNPt-Su4dEGz0geA2B7NS7QOQcA8hpDMH4MXow6+2D4Hl1Z0Va2zqyz7xKKI4YrtYEe1Su1fhq1iGcT3LuY8-IjGGPMcqKxlj7GT7cdmJx4eSyM1YffRi3dAA5Q9ugACikm-AyZabugAIrJ0IABlFTZalMaYYAAWW0wQAAKrhtD37hNfug6Z1DTycMIcs+hqzxm4MOdsxZ1zKGy2Gy+Zh5z3n7N+bswFtzJmgtOf8yFo5NnfOBfc9F4LMXwstMNgAPkc6lgTTi21SxbXKzLayctJXlFR8xg6oMPPHSO+dE7p1TqYjO6rC76tVdqzV3dbHyulYicK3d26FN4gPb16T+mUASYGy3XdABNIb4AT2jdCAAVSmx83d-W3m7oAIJTYAGpTfk1FhLe34uHbi8d0LQ68Nnc6zRi71mrsdZu9ak7aWDuPZc0d07+3sNmeow997b2nsqrfeZv7r2XvPfu2F4HYP-sDtuyRvuuXx4rJkeRkWs8ivRroxVxdWPGs4+aw1-HTXWtcfa2VyrePiccd45ranvbBMY7G8eqbAAFHbU2RurbxAAISm+p2bHBlMg9+6Dz7PnRcQ5FyJ4VD7odA8l3L4XivZc+si+L2LSuhfK6E2LqXX3tcS41285LWuK169Nz9iLZvb36-Vyb635uDd2+9Tbj7uudcK8t9lgj+XVmI-OxRvQkFtF06ubTy15ODUR7J9jyPMfo+49jwn+PhOKc2NJ0x9P4PrtTYANRTYAGJTYAJZTcQPzhgABTAvU2AD2U2AAenv6NN+z5rtvUP29q9dx7zvbvHe957x3ofXfIcj-lyrq3zuHe24HxP93c-+-D77zPpfIfAcL5X2Pw3W+nfpun93jfB+Xej5hxblRXuSv+6v2LGYQfVQMTD9OqPGfn9tdfyT9-VPM8f7jy-3-b--8f8k8-9gCADQCW87td8a0p9P1vtm90t19itYdLsz8oE+1GY4DW80D6dYCkDUCAdMdICEDCDr8s8iDsCnFcCGd8DT94CKDnkUC6CCDkCyDSCqoaC18SDx9j9uD98T9B8d9Z8eDt9l8j8+DGDbQAAmbwaQrg1giQgPOQeeYPTAxPFPNQynHjb-L-T-LQ3QvjR-WrfQmnbQvQwAnQ8wsw8Aiw6w+g6XPER9IQ8Q+QlwiAtg4glgtwhQ9wuwzwjwnBQlYsMlH2QIw6YleJNcPOcIgI6Ipg0FWImJUIkIhI0pJIyoYI9ItIwBFIolSI0lLI+BAo+IvIiIglfInI7wyo1w-wuIvw1fQ-HwwQ+o4QqA4qFLJw+3ToqfLovfe3Kg2QlwWQq0AYyQIYjg1Q1HXZAWfmXmBeOo5ggnTQgw0w5Y4wh-FYkwtY8PSw1YnYzYvY9YrYp-A4iY3gnozlKgy4jAvAuIzg+Y2grAhY24046o7IkomI94yFT4xIiosI741I34rwv4so0o06KI-43IkEj4qEr4mEn4iEoIooowDIt4uEgEhE14p4x4h48grE3EnExo0Q-ghoqo1oqNc4m9boqk3o6k6AvfK4seF4oE5kmonZMCaY9VPEwku48Ym41POrdQ5PJY-Y2w3Y0UkUwUkAyUsA6Ulk3w+fB1GXJwhkwhFUrea46g54vk-EnkrUzU7E5EpEsojE5Ik0zIwE1knU40tEyEsE8os01Eu00Ey6cEm0xEi0x0l0uQuUrk0ky07kpk-0v0+UvUik8k2kykmkqMukmMyM2M8M+kjUkY5AMYnUZMpAVMqQmQhgzEgk4M4WG-bEzROYw5bmXk-Uq0448Uw4k4qs2Umw+sqwxssU5siU4Ums6swM5o5wsk8tNU9Axk7UgMoc-MvM3M3Ug0rs308cqcscn0ucoMmckcpcis4c1c0cicys9clc-snAjU3cyg-cjUsMtdCMhM+M0udo7sk869c8uM+8u8qNA8nM9g2otVDkj82Y7Rc5V8tkwsrc5870jSdMoQTMpcECsC7yCCsSaC-aWC0seC8swCyfRMwcnsxc+czctc5CpCo8tCnCvUgiyc5czC2crCjcsiyikijCmikM4i7c0i6iuigCvCwhG8xA9C68s8086Mh8nii8j9Vi9UtCvo1GH83vcSrQIstVEs0WC5HXSS6cxihisswixC5sdS4iTS8CsESC9CbS7CoSgctimAoy+nUS-Csyw8yymy1Uqyl82ipSxytstPI4lS5ioU1y2s9ypyjyiipi3ywKhcvync+y1XIks47i28-ivi6KuKjioili2yuhUylWTRT8vZGYu-As3MxSnRf8wytK0skK5S0C3SmC8quCyqhC6qnMAy-S2qwisK+48ilciyuy5K4ylK3ip85qxYryzsus9s7Ywany4KoKjs1sya4aoagaqaka+agK8a5a1q0qvqxfJozaiKkQgQ7ak3RKtc9q4Sjqky1Ck612PK4Te4vK1a1StHb84qnK38-Em6qisa26qSpK86rqn6vc-C+qyKAGjkIG4CxqrSsGnSqEPStq1K76v606i49a+iqg-jJsmaow7y1Gls9GrGlyoCtGuanGww3G6awmsm-Giat6g6-y96kkna0Y7Mj0dM6G-ajUhHYjdKH3ZHWmlo5yj6p6u6xQ+c9KrKjK-ZAWz6yYwky6x6-K+SuS56qWgq5W0K-6iGqC9WhqqGiq7Wqq3Wmq-WuqzWwG424G02vmqm482G46m2366yuG+222+Gp2x2u2hykqi2pa-mvaz2nmzira3awOy2tC5m4SUOpmxmlq4OwhdmlHGm-tGWhWwWpW+Wv81OoW5y+YzkzKnOsW0W-O3OguvOwuku4usuouiu0uyu8uqu2umu+u2YxUIAA',
  ),
);

export default createNewAscii;