// Store types for ASCIIBIRD (Pinia)

import type {
  AsciibirdMeta,
  AsciibirdMetaBuilder,
  Layer,
  Options,
} from './index';

/** Main editor store state (toolbar extracted to store/toolbar.ts) */
export interface RootState {
  ver: number;
  options: Options;
  tab: number;
  asciibirdMeta: AsciibirdMeta[];
  blockSizeMultiplier: number;
}

/**
 * Minimal interface for the main store methods that ascii.ts accesses
 * via lazy getStore() references. Breaks the circular dependency
 * (store imports ascii, ascii imports store) without using `any`.
 */
export interface AsciiStoreAccess {
  readonly currentAscii: AsciibirdMeta | undefined;
  readonly currentAsciiLayers: Layer[];
  readonly currentAsciiLayersWidthHeight: { width: number; height: number };
  newAsciibirdMeta(payload: AsciibirdMetaBuilder): void;
}

/**
 * Minimal interface for the modal store methods that ascii.ts accesses
 * via lazy getModalStore() references.
 */
export interface ModalStoreAccess {
  closeModal(type: string): void;
}
