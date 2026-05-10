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
