import type { ToolbarIcon } from '../types';

/**
 * Get the human-readable tooltip name for a toolbar icon.
 */
export function tooltipName(value: ToolbarIcon): string {
  switch (value.name) {
    case 'default':
      return 'Default Mode';
    case 'select':
      return 'Select Blocks';
    case 'text':
      return 'Text Editing';
    case 'fill':
      return 'Fill Blocks';
    case 'brush':
      return 'Brush Blocks';
    case 'dropper':
      return 'Block Picker';
    case 'eraser':
      return 'Eraser Blocks';
    case 'fill-eraser':
      return 'Fill Eraser Blocks';
    default:
      return value.name;
  }
}

/**
 * Get a short label for inline display in toolbar buttons.
 */
export function toolLabel(value: ToolbarIcon): string {
  switch (value.name) {
    case 'default':
      return 'Default';
    case 'select':
      return 'Select';
    case 'text':
      return 'Text';
    case 'fill':
      return 'Fill';
    case 'brush':
      return 'Brush';
    case 'dropper':
      return 'Picker';
    case 'eraser':
      return 'Eraser';
    case 'fill-eraser':
      return 'Erase Fill';
    default:
      return value.name;
  }
}
