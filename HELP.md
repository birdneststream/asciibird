# ASCIIBIRD Help and Documentation

- [ASCIIBIRD Help and Documentation](#asciibird-help-and-documentation)
- [Features Overview](#features-overview)
  - [1. Toolbar](#1-toolbar)
  - [2. Tabs](#2-tabs)
  - [3. Toolbar Menu](#3-toolbar-menu)
  - [4. Brush Preview Panel](#4-brush-preview-panel)
  - [5. ASCII Canvas](#5-ascii-canvas)
  - [6. Layers and Image overlay](#6-layers-and-image-overlay)
  - [7. Brush History and Brush Library](#7-brush-history-and-brush-library)
- [Main Toolbar](#main-toolbar)
  - [1. FG (foreground)](#1-fg-foreground)
  - [2. BG (background)](#2-bg-background)
  - [3. Character Selection](#3-character-selection)
  - [4. Colour Swapper](#4-colour-swapper)
  - [5. FG, BG and Text Check box Filters](#5-fg-bg-and-text-check-box-filters)
  - [6. Mirror X and Mirror y](#6-mirror-x-and-mirror-y)
  - [7. Update Brush when Fg, Bg or Char changes](#7-update-brush-when-fg-bg-or-char-changes)
  - [8. Grid Mode](#8-grid-mode)
  - [9. Half Block Editing Mode](#9-half-block-editing-mode)
  - [10. Default Mode](#10-default-mode)
  - [11. Selection Tool](#11-selection-tool)
  - [12. Text Mode](#12-text-mode)
  - [13. Fill Tool](#13-fill-tool)
  - [14. Brush Tool](#14-brush-tool)
  - [15. Block Picker Tool](#15-block-picker-tool)
  - [16. Eraser Tool](#16-eraser-tool)
  - [17. Eraser Fill Tool](#17-eraser-fill-tool)
- [Brush Preview](#brush-preview)
  - [1. Brush Width](#1-brush-width)
  - [2. Brush Height](#2-brush-height)
  - [3. Brush type](#3-brush-type)
  - [4. Brush Preview](#4-brush-preview)
- [Layers and Image Overlay](#layers-and-image-overlay)
  - [1. Add Layer](#1-add-layer)
  - [2. Merge Layers](#2-merge-layers)
  - [3. Toggle Image Overlay Visibility](#3-toggle-image-overlay-visibility)
  - [4. Image Overlay Options](#4-image-overlay-options)
  - [5. Layer Visibility](#5-layer-visibility)
  - [6. Remove Layer](#6-remove-layer)
  - [7. Layer name](#7-layer-name)
  - [8. Layer Positioning](#8-layer-positioning)
- [Brush History and Brush Library](#brush-history-and-brush-library)
  - [Brush History](#brush-history)
    - [1. Brush History Tab](#1-brush-history-tab)
    - [2. Brush Library](#2-brush-library)
    - [3. Brush Preview](#3-brush-preview)
    - [4. Save to Library](#4-save-to-library)
    - [5. Use as Brush](#5-use-as-brush)
    - [6. Remove Brush](#6-remove-brush)
  - [Brush Library](#brush-library)
    - [1. Brush History Tab](#1-brush-history-tab-1)
    - [2. Brush Library](#2-brush-library-1)
    - [3. Brush Preview](#3-brush-preview-1)
    - [4. Delete Brush from Library](#4-delete-brush-from-library)
    - [5. Use as Brush](#5-use-as-brush-1)
    - [6. Change Brush Position](#6-change-brush-position)
- [Importing mIRC art to ASCIIBIRD](#importing-mirc-art-to-asciibird)
- [Exporting mIRC art from ASCIIBIRD](#exporting-mirc-art-from-asciibird)
- [ASCIIBIRD States - Saving and Loading](#asciibird-states---saving-and-loading)
- [Keyboard Shortcuts](#keyboard-shortcuts)
  - [ASCII Editing](#ascii-editing)
    - [Importing](#importing)
    - [Exporting](#exporting)
  - [Showing / Hiding menus, tabs and panels](#showing--hiding-menus-tabs-and-panels)
  - [Select Mode](#select-mode)
  - [Eraser Mode](#eraser-mode)
  - [Brush Mode](#brush-mode)
  - [Text mode](#text-mode)
  - [Layers Related](#layers-related)
- [Half Block editing Mode](#half-block-editing-mode)
- [Context Menus (right click menus)](#context-menus-right-click-menus)

# Features Overview

ASCIIBIRD allows tabbed editing of mIRC ascii art, and contains powerful features such as layers, brush library and a brush editor.

*View -> Windows* from the toolbar menu can show or hide most of these panels. The keyboard shortcuts can be found at [Show and Hide Panels Keyboard Shortcuts](#showing--hiding-menus-tabs-and-panels)

![ASCIIBIRD overview](https://asciibird.birdnest.live/docs/overview.png)

## 1. Toolbar

* Allows you to see the shortcuts and features of ASCIIBIRD.

## 2. Tabs

* Each new ascii you create or import will have its own tab.
* You can copy and paste blocks between each of the tabs.

## 3. Toolbar Menu

* The main toolbar which allows for ascii editing, please review [Main Toolbar](#main-toolbar)

## 4. Brush Preview Panel

* Allows you to change the width and height of the brush, and also the brush type.
* The brush preview is editable with the brush, eraser and fill tools from the toolbar. However limited to 1x1 or per block only.
* Read more at [Brush Preview](#brush-preview)

## 5. ASCII Canvas

* Shows the current state of your ASCII art. You use the tools on this part.

## 6. Layers and Image overlay

* Provides layered editing capabilities.
* Image Overlay will allow you to paste an image URL to trace over on the ASCII canvas.
* Read more at [Layers and Image Overlay](#layers-and-image-overlay)

## 7. Brush History and Brush Library

* Save brushes for future use or see your previous brush history.
* Read more at [Brush History and Library](#brush-history-and-brush-library)

# Main Toolbar

The toolbar contains the major functions required to create mIRC art.

![Toolbar](https://asciibird.birdnest.live/docs/toolbar.png)

## 1. FG (foreground)

* Changes the FG of the brush.
* If the panel is open you can select the first 1 to 9 colours with the numeric keys 1 to 0.
* Escape will hide the panel.
* Alt + F will show/hide the foreground colour selection.
* Foreground applies colour to text.

## 2. BG (background)

* Changes the BG of the brush.
* If the panel is open you can select the first 1 to 9 colours with the numeric keys 1 to 0.
* Escape will hide the panel.
* Alt + B will show/hide the background colour selection.
* Background is the colour behind the text.

## 3. Character Selection

* Changes the character of the brush.
* If the panel is open, you can also press any key on your keyboard to change the character.
* Escape will hide the panel.
* Alt + C will show/hide the character selection.

## 4. Colour Swapper

* Quickly swap the BG and FG colours.
* Alt + R will also trigger this.

## 5. FG, BG and Text Check box Filters

* Handy if you want to just apply foreground to text, or ignore text and foreground and change the background only.
* One must be selected at all times.
* If you are wondering why your brush is not drawing text or a foreground colour, check these boxes!!!

## 6. Mirror X and Mirror y

* Provides an X and Y mirror for brush, eraser and text modes.
* Draw symmetrical ascii arts with ease.

## 7. Update Brush when Fg, Bg or Char changes

* If this is highlighted, the brush will automatically change when any of the colours or text are also changed.
* If you want to preserve a custom brush, or edit the current brush, best to have this unselected.

## 8. Grid Mode

* Grid mode will show the ascii blocks. Also works with half block editing mode.

## 9. Half Block Editing Mode

* Experimental half block mode, at the moment works best with a 1x1 brush size.
* Eraser and fill tool are coming soon for this mode.
* This will also reflect half block sizes if the grid mode is enabled.

## 10. Default Mode

* In this mode you cannot edit any ascii, however you can drag the panels around.

## 11. Selection Tool

* Select ascii blocks.
* Once ascii blocks are selected you can,
  * Ctrl + C to copy blocks
  * Ctrl + X to cut blocks (this will also remove the blocks)
  * Delete - Just remove the blocks only
  * Ctrl + B - Immediately save the selection to brush library
  * Ctrl + V (if copied blocks from selection mode) will paste, and automatically change to brush tool.

## 12. Text Mode

* Select a position of the ascii to type text.
* If text hits the end of the ascii it will wrap around to the start of the next line.
* Enter will also wrap the text to the start of the next line.
* Note: *cannot* paste text.
* Backspace will remove text.
* Delete will delete the character at the highlighted position.
* Also can be used in Mirror X or Mirror Y modes.

## 13. Fill Tool

* Fill your ascii with blocks, usual fill tool.
* Also considers the FG, BG and Char check boxes.
* The bounds of the fill tool at moment take into account bg (mostly).

## 14. Brush Tool

* Main tool to brush ascii blocks.
* E - will horizontal flip the brush.
* Q - will vertical flip the brush.
* You can also edit the brush library preview with this tool.
* Will consider fg, bg and char check boxes when drawing.
* Also can be used in Mirror X or Mirror Y modes.
* Ctrl + V (if copied blocks from selection mode) will paste.

## 15. Block Picker Tool

* Pick up the bg, fg and char of any block.
* Will consider fg, bg and char check boxes when selecting.
* If the block contain an empty fg and text, but has a bg - only the BG will update.

## 16. Eraser Tool

* Takes the form of the brush and will remove blocks only.
* Also considers the FG, BG and Char check boxes.
 * If you just want to remove characters, ensure the char box is selected only and it will preserve the background.

## 17. Eraser Fill Tool

* Works similar to the fill tool, but will remove blocks only.
* Also considers the FG, BG and Char check boxes.
* Good if you want to make a transparent background ASCII.

# Brush Preview

The brush preview shows your current brush, and also allows you to create new basic brushes of different shapes and types with some basic editing capabilities.

![Brush Preview](https://asciibird.birdnest.live/docs/brush-preview.png)

## 1. Brush Width

* Changes the width of the brush. The max is 50, although you can type a larger number if you really want to.

## 2. Brush Height

* Changes the height of the brush. The max is 50, although you can type a larger number if you really want to.

## 3. Brush type

* Changes the brush type. At the moment the following are available.
  * Square
  * Circle
  * Cross
  * Grid
  * Inverted Grid
  * H lines
  * V lines

## 4. Brush Preview

* If you use the brush tool or eraser tool, this is the brush type it will use.
* The brush preview can also be edited with the brush, eraser and fill tools from the [Main Toolbar](#main-toolbar)
* If you are making a custom brush ensure the *Update Brush when Fg, Bg or Char changes* from the [Main Toolbar](#main-toolbar) is unhighlighted.

# Layers and Image Overlay

Allows layered editing and image overlays for tracing ASCII arts. You have to be careful using layers!

![Layers Toolbar](https://asciibird.birdnest.live/docs/layers.png)

* The current selected layer has a blue highlight.
* If you have a transparent layer over the top of ascii blocks, and try to use the block picker - it will be somewhat deceptive and pick a transparent block, despite looking like it should pick the ascii block.
* You can still edit a hidden layer, although you will be shown a warning and cannot see the actual blocks.

## 1. Add Layer

* Will add a new layer to the top of the list.

## 2. Merge Layers

* Will merge all the layers back into one layer.
* Note: The name of the new layer will be the currently selected layer.

## 3. Toggle Image Overlay Visibility

* Will show or hide the image overlay.

## 4. Image Overlay Options

Click this area to see the image overlay options. Within here you can specify the image URL, and also change the position and other properties.

![Image Overlay Options](https://asciibird.birdnest.live/docs/layer-options.png)

## 5. Layer Visibility

* Show or hide the layer.
* Note: you must always at least try to have have one layer visible.

## 6. Remove Layer

* Will completely remove the layer.

## 7. Layer name

* Double click this area to rename the layer.

## 8. Layer Positioning

* Change the order of the layers. The layer at the top of the list will show first and cover any layers bellow.

# Brush History and Brush Library

Asciibird will keep track of your brush changes and also allows you to save your commonly used brushes for future use. If a duplicate brush is detected it will be moved to the top.

![Brush History](https://asciibird.birdnest.live/docs/brush-history.png)

## Brush History

### 1. Brush History Tab 

* View your brush history.

### 2. Brush Library

* View your brush library.

### 3. Brush Preview

* Shows the preview of your brush item.
* Right clicking on the brush to save to PNG, copy mIRC to clipboard, export to mIRC file or save to library.

### 4. Save to Library

* Saves your brush from the history to library.

### 5. Use as Brush

* Will restore the brush to the brush preview area for use.

### 6. Remove Brush

* Removes the brush from history, no undo.

## Brush Library

![Brush Library](https://asciibird.birdnest.live/docs/brush-library.png)

### 1. Brush History Tab 

* View your brush history.

### 2. Brush Library

* View your brush library.

### 3. Brush Preview

* Shows the preview of your brush item.
* Right clicking on the brush to save to PNG, copy mIRC to clipboard, export to mIRC file or save to library.
* The first 10 brushes can be changed in brush mode with ctrl 1 to 0.

### 4. Delete Brush from Library

* Removes the brush from the library. No undo.

### 5. Use as Brush

* Will restore the brush to the brush preview area for use.

### 6. Change Brush Position

* As the first ten brushes are hotkeyable, you can change their position with these buttons.

# Importing mIRC art to ASCIIBIRD

* ASCIIBIRD will accept mIRC encoded ascii art only. ANSI is not supported.
* Art can be imported from file, clipboard or from URL.
  * Arts can be viewed from https://irc.watch/ and loaded into ASCIIBIRD.
  * Note: The author of ASCIIBIRD condones hate speech and is not responsible for the contents on external websites or ASCII art created by other people.

# Exporting mIRC art from ASCIIBIRD

* ASCIIBIRD can export to PNG.
* SVG export coming soon!
* Export mIRC encoded art to clipboard to paste in your IRC client.
  * Note: weechat will strip the colour encodings.
* HTTP Post - if you have IRC bots setup, or an API, you can export the mIRC encoded text to an end point with HTTP POST.

# ASCIIBIRD States - Saving and Loading

* The asciibird state can be saved to file.
* You can then load it in another browser, or just keep it as a backup. You can load it from within ASCIIBIRD.
* The state includes all the data in asciibird, including tabs, asciis and brush history and library.

# Keyboard Shortcuts

Most of these keyboard shortcuts can also be found in the toolbar menu. ASCIIBIRD also supports the command key on MacOS based systems, which you can use instead of ctrl.

## ASCII Editing

* Ctrl + Z - Undo
* Ctrl + Y - Redo

* F1 - Toggle Help
* Shift + F1 - About ASCIIBIRD and shout outs

* Escape - Return to default mode, stop using any tool and close fg, bg and char panels.

* Alt 1 to 8 - Will toggle the corresponding toolbar icon

* Ctrl 1 to 0 - Change ASCII tab if possible

* Alt + c - Opens character Panel (You can then press on the keyboard your desired character or select from the list)
* Alt + f - Opens foreground panel (can then press 0 to 9 for the colour)
* Alt + b - Opens background panel (can then press 0 to 9 for the colour)

* Alt + g - Toggle grid mode

* Alt + x - Toggle Mirror X
* Alt + y - Toggle Mirror Y
* Alt + u - Toggle Update Brush (change brush preview if fg, bg or char changes)
* Alt + r - Flip FG and BG colours

* Ctrl + e - Edit ASCII
* Ctrl + r - Close ASCII
* Ctrl + m - New ASCII (can't use ctrl + n)
* Ctrl + o - Toggle Asciibird Options

### Importing

* Ctrl + Shift + o - Open mIRC TXT File as new Ascii
* Ctrl + Shift + v - Paste New Ascii

### Exporting

* Ctrl + Shift + C - Copy to clipboard
* Ctrl + Shift + F - Save to TXT file
* Ctrl + Shift + G - Save to PNG file
* Ctrl + Shift + H - Save to HTTP Post

## Showing / Hiding menus, tabs and panels

* Ctrl + Alt + t - Hide / Show Tabs
* Ctrl + Alt + m - Hide / Show Menu
* Ctrl + Alt + d - Hide / Show Debug Panel
* Ctrl + Alt + b - Hide / Show Brush Library
* Ctrl + Alt + l - Hide / Show Layers
* Ctrl + Alt + n - Hide / Show Toolbar
* Ctrl + Alt + e - Hide / Show Brush Preview

## Select Mode

* Ctrl + c - Copy blocks to clipboard
* Ctrl + x - Cut blocks to clipboard
* Ctrl + v - Paste blocks as brush
* Ctrl + b - Save Selection to Library
* Delete - Delete selected blocks

## Eraser Mode

* Four arrow keys control eraser cursor
* Space - apply eraser

## Brush Mode

* Four arrow keys control text cursor
* Ctrl 1 to 0 - change hotkeyable brush
* Space - apply brush
* Ctrl + ] - Increase both brush sizes by 1
* Ctrl + [ - Decrease both brush sizes by 1
* e - rotate brush
* q - flip brush

## Text mode

* Four arrow keys control text cursor
* Delete - Remove text from highlighted block
* Backspace - Remove current character and move to previous block
* Enter - Go to next line and reset X position to 0

## Layers Related

* Ctrl + Shift + t - Show / Hide Layer
* Ctrl + Shift + r - Rename Layer 
* Ctrl + Shift + a - Add Layer 
* Ctrl + Shift + d - Delete Layer 
* Ctrl + Shift + s - Move Layer Down 
* Ctrl + Shift + w - Move Layer Up 
* Ctrl + Shift + m - Merge All Layers 

# Half Block editing Mode

This is still experimental and at the moment the brush tool will work with half block mode only.

# Context Menus (right click menus)

* Right clicking on any brush preview in the main area or library will allow you to export to PNG, txt or clipboard just the brush itself.
* The main ascii has a few export options if you right click on the ascii
* The dashboard area (outside the ascii) was actually the very first menu in asciibird! and has some basic shortcuts
* Layers can also be right clicked to preview their functions