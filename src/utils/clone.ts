// Deep-clone utility for Layer data
//
// Wraps JSON.parse(JSON.stringify()) in a typed function.
// Preserves existing semantics: undefined properties are dropped
// (which is correct for Block data where absent keys = "not set").
//
// Centralising the clone logic in one place allows future optimisation
// (e.g. structuredClone with explicit undefined handling) without
// touching every call site.

import type { Layer } from '../types';

/**
 * Deep-clone a Layer array, dropping undefined properties.
 * This matches the historical JSON.parse(JSON.stringify()) semantics.
 */
export function cloneLayers(layers: Layer[]): Layer[] {
  return JSON.parse(JSON.stringify(layers));
}
