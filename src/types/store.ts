// Store types for ASCIIBIRD (Pinia)

import type {
  AsciibirdMeta,
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
