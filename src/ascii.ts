import LZString from 'lz-string';
import type { Block, Layer, ImageOverlay, AsciibirdMetaBuilder, MircExportResult, CreateAsciiForm } from './types';
import type { AsciiStoreAccess, ModalStoreAccess } from './types/store';
import { CANVAS_DEFAULT_X, CANVAS_DEFAULT_Y } from './store/panels';
import { mergeLayerStack } from './utils/layerMerge';
import { exportMircBlocks, exportPlainTextBlocks, brushExportMeta } from './utils/mircExport';
import { parseMircToLayers } from './utils/mircImport';
import { cyrb53 as cyrb53Impl } from './utils/cyrb53';

// ─── Re-exports from extracted modules ──────────────────────────
// Named re-exports maintain backward compatibility for the 43 files
// that import from ascii.ts. Consumers can be gradually migrated to
// import directly from the focused modules.

export { mircColours99, charGroups } from './utils/mircColors';
export { toolbarIcons } from './utils/uiConstants';
export { iterativeFill, iterativeFillHalfBlock } from './utils/floodFill';
export type { FillChange } from './utils/floodFill';
export { checkIrcByteLimits, calculateMircLineBytes, IRC_WARN_THRESHOLD, IRC_ERROR_THRESHOLD } from './utils/ircLimits';
export type { IrcLineCheck } from './utils/ircLimits';
export { mergeTwoLayers } from './utils/layerMerge';
export { cyrb53 } from './utils/cyrb53';

// ─── Lazy store references ──────────────────────────────────────
// Store imports from ascii, ascii imports store.
// Using a getter ensures store is only accessed after initialization.

let _store: AsciiStoreAccess | null = null;
let _modalStore: ModalStoreAccess | null = null;

export const setStore = (s: AsciiStoreAccess): void => {
  _store = s;
};

export const setModalStore = (s: ModalStoreAccess): void => {
  _modalStore = s;
};

/** @internal Test-only — resets lazy store references to prevent
 *  cross-test contamination when running the full suite. */
export const resetStoreRefs = (): void => {
  _store = null;
  _modalStore = null;
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

// ─── Constants ──────────────────────────────────────────────────

// How big the brush size can get
// Although you can type in the input a bigger number than this anyway
export const maxBrushSize: number = 50;

// Width and height of the ASCII blocks
// they seem to be 8x15 in asciiblaster
export const blockWidth = 8;
export const blockHeight = 15;

// Limits for undo and brush histories
export const maxBrushHistory = 200;
export const maxUndoHistory = 500;
export const tabLimit = 20;

export const defaultImageOverlay = (): ImageOverlay => ({
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

// ─── Block helpers ──────────────────────────────────────────────

export const emptyBlock: Block = {};

/**
 * Check if a block has no properties set.
 * Semantically equivalent to `JSON.stringify(block) === '{}'`
 * because the codebase uses `delete` (not `= undefined`) to reset blocks.
 */
export function isEmptyBlock(block: Block): boolean {
  return Object.keys(block).length === 0;
}

/**
 * Conditionally erase block properties based on target flags.
 * Deletes `fg`, `bg`, `char` from the block when the corresponding
 * flag is `true` and the property exists on the block.
 * Mutates the block in-place (callers should snapshot first for undo).
 */
export function eraseBlockProperties(
  block: Block,
  opts: { fg: boolean; bg: boolean; char: boolean },
): void {
  if (opts.fg && block.fg !== undefined) {
    delete block['fg'];
  }
  if (opts.bg && block.bg !== undefined) {
    delete block['bg'];
  }
  if (opts.char && block.char !== undefined) {
    delete block['char'];
  }
}

export const create2DArray = (rows: number): Block[][] => {
  const arr: Block[][] = [];

  for (let i = 0; i < rows; i++) {
    arr[i] = [];
  }

  return arr;
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

// ─── File download utilities ────────────────────────────────────

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

// ─── Store-coupled wrappers ─────────────────────────────────────
// These functions use getStore()/getModalStore() for backward
// compatibility. The core logic lives in pure utility modules.

export const parseMircAscii = async (
  contents: string,
  filename: string,
): Promise<boolean> => {
  const parsed = parseMircToLayers(contents, filename, create2DArray);

  const finalAscii: AsciibirdMetaBuilder = {
    title: filename,
    layers: parsed.layers,
    history: [],
    historyIndex: 0,
    imageOverlay: defaultImageOverlay(),
    x: CANVAS_DEFAULT_X,
    y: CANVAS_DEFAULT_Y,
    selectedLayer: 0,
  };

  // First layer data generation
  const filledLayers = [...fillNullBlocks(
    parsed.height,
    parsed.width,
    parsed.layers,
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

/**
 * Merge all visible layers — convenience wrapper using store data.
 * Delegates to the pure mergeLayerStack() from utils/layerMerge.
 */
export const mergeLayers = (): Block[][] => {
  return mergeLayerStack(getStore().currentAsciiLayers);
};

/**
 * Converts ASCIIBIRD blocks to mIRC colours.
 * When blocks is null, exports the entire current ASCII using store data.
 * When blocks are provided, exports as a brush.
 */
export const exportMirc = (blocks: Block[][] | null = null): MircExportResult => {
  if (blocks === null) {
    // Export the entire main ascii
    const ascii = getStore().currentAscii;
    if (!ascii) {
      return { filename: 'empty.txt', output: [''] };
    }
    const dimensions = getStore().currentAsciiLayersWidthHeight;
    blocks = mergeLayers();
    return exportMircBlocks(blocks, ascii, dimensions);
  } else {
    // We are exporting a brush
    const meta = brushExportMeta(blocks, cyrb53Impl);
    const dimensions = {
      height: blocks.length,
      width: blocks[0].length,
    };
    return exportMircBlocks(blocks, meta, dimensions);
  }
};

/**
 * Export ASCII blocks as plain text (no color codes).
 * Strips all fg/bg, outputs just the character for each cell.
 * Trailing spaces and empty trailing lines are trimmed.
 */
export const exportPlainText = (blocks: Block[][] | null = null): string[] => {
  if (blocks === null) {
    blocks = mergeLayers();
  }
  return exportPlainTextBlocks(blocks);
};

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
