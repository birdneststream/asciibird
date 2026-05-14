<template>
  <ABModal
    :open="showHelpModal"
    @close="modalStore.closeModal('help')"
    title=""
  >
    <div class="rounded help-content">
      <h1
        class="text-headline-lg font-bold text-on-surface pt-3 pb-1"
        id="asciibird-help-and-documentation"
      >
        ASCIIBIRD Help and Documentation
      </h1>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <a href="#asciibird-help-and-documentation">ASCIIBIRD Help and Documentation</a>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <a href="#features-overview">Features Overview</a>
          <ul>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#1-toolbar">1. Toolbar</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#2-tabs">2. Tabs</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#3-toolbar-menu">3. Toolbar Menu</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#4-brush-preview-panel">4. Brush Preview Panel</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#5-ascii-canvas">5. ASCII Canvas</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#6-layers-and-image-overlay">6. Layers and Image overlay</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#7-brush-history-and-brush-library">7. Brush History and Brush Library</a>
            </li>
          </ul>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <a href="#main-toolbar">Main Toolbar</a>
          <ul>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#1-fg-foreground">1. FG (foreground)</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#2-bg-background">2. BG (background)</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#3-character-selection">3. Character Selection</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#4-colour-swapper">4. Colour Swapper</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#5-fg-bg-and-text-check-box-filters">5. FG, BG and Text Check box Filters</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#6-mirror-x-and-mirror-y">6. Mirror X and Mirror y</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#7-update-brush-when-fg-bg-or-char-changes">7. Update Brush when Fg, Bg or Char changes</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#8-grid-mode">8. Grid Mode</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#9-half-block-editing-mode">9. Half Block Editing Mode</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#10-default-mode">10. Default Mode</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#11-selection-tool">11. Selection Tool</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#12-text-mode">12. Text Mode</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#13-fill-tool">13. Fill Tool</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#14-brush-tool">14. Brush Tool</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#15-block-picker-tool">15. Block Picker Tool</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#16-eraser-tool">16. Eraser Tool</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#17-eraser-fill-tool">17. Eraser Fill Tool</a>
            </li>
          </ul>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <a href="#brush-preview">Brush Preview</a>
          <ul>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#1-brush-width">1. Brush Width</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#2-brush-height">2. Brush Height</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#3-brush-type">3. Brush type</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#4-brush-preview">4. Brush Preview</a>
            </li>
          </ul>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <a href="#layers-and-image-overlay">Layers and Image Overlay</a>
          <ul>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#1-add-layer">1. Add Layer</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#2-merge-layers">2. Merge Layers</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#3-toggle-image-overlay-visibility">3. Toggle Image Overlay Visibility</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#4-image-overlay-options">4. Image Overlay Options</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#5-layer-visibility">5. Layer Visibility</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#6-remove-layer">6. Remove Layer</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#7-layer-name">7. Layer name</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#8-layer-positioning">8. Layer Positioning</a>
            </li>
          </ul>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <a href="#brush-history-and-brush-library">Brush History and Brush Library</a>
          <ul>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#brush-history">Brush History</a>
              <ul>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#1-brush-history-tab">1. Brush History Tab</a>
                </li>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#2-brush-library">2. Brush Library</a>
                </li>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#3-brush-preview">3. Brush Preview</a>
                </li>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#4-save-to-library">4. Save to Library</a>
                </li>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#5-use-as-brush">5. Use as Brush</a>
                </li>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#6-remove-brush">6. Remove Brush</a>
                </li>
              </ul>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#brush-library">Brush Library</a>
              <ul>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#1-brush-history-tab-1">1. Brush History Tab</a>
                </li>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#2-brush-library-1">2. Brush Library</a>
                </li>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#3-brush-preview-1">3. Brush Preview</a>
                </li>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#4-delete-brush-from-library">4. Delete Brush from Library</a>
                </li>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#5-use-as-brush-1">5. Use as Brush</a>
                </li>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#6-change-brush-position">6. Change Brush Position</a>
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <a href="#importing-mirc-art-to-asciibird">Importing mIRC art to ASCIIBIRD</a>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <a href="#exporting-mirc-art-from-asciibird">Exporting mIRC art from ASCIIBIRD</a>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <a href="#asciibird-states---saving-and-loading">ASCIIBIRD States - Saving and Loading</a>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <a href="#keyboard-shortcuts">Keyboard Shortcuts</a>
          <ul>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#ascii-editing">ASCII Editing</a>
              <ul>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#importing">Importing</a>
                </li>
                <li class="text-body-sm text-on-surface-variant ml-[5%]">
                  <a href="#exporting">Exporting</a>
                </li>
              </ul>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#showing--hiding-menus-tabs-and-panels">Showing / Hiding menus, tabs and panels</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#select-mode">Select Mode</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#eraser-mode">Eraser Mode</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#brush-mode">Brush Mode</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#text-mode">Text mode</a>
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              <a href="#layers-related">Layers Related</a>
            </li>
          </ul>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <a href="#half-block-editing-mode">Half Block editing Mode</a>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <a href="#context-menus-right-click-menus">Context Menus (right click menus)</a>
        </li>
      </ul>
      <h1
        class="text-headline-lg font-bold text-on-surface pt-3 pb-1"
        id="features-overview"
      >
        Features Overview
      </h1>
      <p>
        ASCIIBIRD allows tabbed editing of mIRC ascii art, and contains powerful features such as layers, brush
        library and a brush editor.
      </p>
      <p>
        <em>View -&gt; Windows</em> from the toolbar menu can show or hide most of these panels. The keyboard
        shortcuts can be found at <a href="#showing--hiding-menus-tabs-and-panels">Show and Hide Panels Keyboard
          Shortcuts</a>
      </p>
      <p>
        <img
          src="https://asciibird.birdnest.live/docs/overview.png"
          alt="alt text"
        >
      </p>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="1-toolbar"
      >
        1. Toolbar
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Allows you to see the shortcuts and features of ASCIIBIRD.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="2-tabs"
      >
        2. Tabs
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Each new ascii you create or import will have its own tab.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          You can copy and paste blocks between each of the tabs.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="3-toolbar-menu"
      >
        3. Toolbar Menu
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          The main toolbar which allows for ascii editing, please review <a href="#main-toolbar">Main Toolbar</a>
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="4-brush-preview-panel"
      >
        4. Brush Preview Panel
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Allows you to change the width and height of the brush, and also the brush type.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          The brush preview is editable with the brush, eraser and fill tools from the toolbar. However limited to
          1x1 or per block only.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Read more at <a href="#brush-preview">Brush Preview</a>
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="5-ascii-canvas"
      >
        5. ASCII Canvas
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Shows the current state of your ASCII art. You use the tools on this part.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="6-layers-and-image-overlay"
      >
        6. Layers and Image overlay
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Provides layered editing capabilities.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Image Overlay will allow you to paste an image URL to trace over on the ASCII canvas.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Read more at <a href="#layers-and-image-overlay">Layers and Image Overlay</a>
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="7-brush-history-and-brush-library"
      >
        7. Brush History and Brush Library
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Save brushes for future use or see your previous brush history.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Read more at <a href="#brush-history-and-brush-library">Brush History and Library</a>
        </li>
      </ul>
      <h1
        class="text-headline-lg font-bold text-on-surface pt-3 pb-1"
        id="main-toolbar"
      >
        Main Toolbar
      </h1>
      <p>The toolbar contains the major functions required to create mIRC art.</p>
      <p>
        <img
          src="https://asciibird.birdnest.live/docs/toolbar.png"
          alt="Toolbar"
        >
      </p>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="1-fg-foreground"
      >
        1. FG (foreground)
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Changes the FG of the brush.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          If the panel is open you can select the first 1 to 9 colours with the numeric keys 1 to 0.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Escape will hide the panel.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Alt + F will show/hide the foreground colour selection.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Foreground applies colour to text.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="2-bg-background"
      >
        2. BG (background)
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Changes the BG of the brush.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          If the panel is open you can select the first 1 to 9 colours with the numeric keys 1 to 0.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Escape will hide the panel.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Alt + B will show/hide the background colour selection.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Background is the colour behind the text.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="3-character-selection"
      >
        3. Character Selection
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Changes the character of the brush.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          If the panel is open, you can also press any key on your keyboard to change the character.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Escape will hide the panel.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Alt + C will show/hide the character selection.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="4-colour-swapper"
      >
        4. Colour Swapper
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Quickly swap the BG and FG colours.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Alt + R will also trigger this.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="5-fg-bg-and-text-check-box-filters"
      >
        5. FG, BG and Text Check box Filters
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Handy if you want to just apply foreground to text, or ignore text and foreground and change the
          background only.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          One must be selected at all times.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          If you are wondering why your brush is not drawing text or a foreground colour, check these boxes!!!
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="6-mirror-x-and-mirror-y"
      >
        6. Mirror X and Mirror y
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Provides an X and Y mirror for brush, eraser and text modes.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Draw symmetrical ascii arts with ease.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="7-update-brush-when-fg-bg-or-char-changes"
      >
        7. Update Brush when Fg, Bg or Char changes
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          If this is highlighted, the brush will automatically change when any of the colours or text are also
          changed.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          If you want to preserve a custom brush, or edit the current brush, best to have this unselected.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="8-grid-mode"
      >
        8. Grid Mode
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Grid mode will show the ascii blocks. Also works with half block editing mode.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="9-half-block-editing-mode"
      >
        9. Half Block Editing Mode
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Experimental half block mode, at the moment works best with a 1x1 brush size.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Eraser and fill tool are coming soon for this mode.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          This will also reflect half block sizes if the grid mode is enabled.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="10-default-mode"
      >
        10. Default Mode
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          In this mode you cannot edit any ascii, however you can drag the panels around.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="11-selection-tool"
      >
        11. Selection Tool
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Select ascii blocks.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Once ascii blocks are selected you can,
          <ul>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Ctrl + C to copy blocks
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Ctrl + X to cut blocks (this will also remove the blocks)
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Delete - Just remove the blocks only
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Ctrl + B - Immediately save the selection to brush library
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Ctrl + V (if copied blocks from selection mode) will paste, and automatically change to brush tool.
            </li>
          </ul>
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="12-text-mode"
      >
        12. Text Mode
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Select a position of the ascii to type text.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          If text hits the end of the ascii it will wrap around to the start of the next line.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Enter will also wrap the text to the start of the next line.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Note: <em>cannot</em> paste text.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Backspace will remove text.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Delete will delete the character at the highlighted position.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Also can be used in Mirror X or Mirror Y modes.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="13-fill-tool"
      >
        13. Fill Tool
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Fill your ascii with blocks, usual fill tool.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Also considers the FG, BG and Char check boxes.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          The bounds of the fill tool at moment take into account bg (mostly).
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="14-brush-tool"
      >
        14. Brush Tool
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Main tool to brush ascii blocks.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Shift+E - flip brush vertically (reverse row order).
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Shift+Q - flip brush horizontally (reverse column order).
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          You can also edit the brush library preview with this tool.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Will consider fg, bg and char check boxes when drawing.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Also can be used in Mirror X or Mirror Y modes.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + V (if copied blocks from selection mode) will paste.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="15-block-picker-tool"
      >
        15. Block Picker Tool
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Pick up the bg, fg and char of any block.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Will consider fg, bg and char check boxes when selecting.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          If the block contain an empty fg and text, but has a bg - only the BG will update.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="16-eraser-tool"
      >
        16. Eraser Tool
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Takes the form of the brush and will remove blocks only.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Also considers the FG, BG and Char check boxes.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          If you just want to remove characters, ensure the char box is selected only and it will preserve the
          background.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="17-eraser-fill-tool"
      >
        17. Eraser Fill Tool
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Works similar to the fill tool, but will remove blocks only.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Also considers the FG, BG and Char check boxes.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Good if you want to make a transparent background ASCII.
        </li>
      </ul>
      <h1
        class="text-headline-lg font-bold text-on-surface pt-3 pb-1"
        id="brush-preview"
      >
        Brush Preview
      </h1>
      <p>
        The brush preview shows your current brush, and also allows you to create new basic brushes of different
        shapes and types with some basic editing capabilities.
      </p>
      <p>
        <img
          src="https://asciibird.birdnest.live/docs/brush-preview.png"
          alt="Brush Preview"
        >
      </p>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="1-brush-width"
      >
        1. Brush Width
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Changes the width of the brush. The max is 50, although you can type a larger number if you really want
          to.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="2-brush-height"
      >
        2. Brush Height
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Changes the height of the brush. The max is 50, although you can type a larger number if you really want
          to.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="3-brush-type"
      >
        3. Brush type
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Changes the brush type. At the moment the following are available.
          <ul>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Square
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Circle
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Cross
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Grid
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Inverted Grid
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              H lines
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              V lines
            </li>
          </ul>
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="4-brush-preview"
      >
        4. Brush Preview
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          If you use the brush tool or eraser tool, this is the brush type it will use.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          The brush preview can also be edited with the brush, eraser and fill tools from the <a
            href="#main-toolbar"
          >Main Toolbar</a>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          If you are making a custom brush ensure the <em>Update Brush when Fg, Bg or Char changes</em> from the <a
            href="#main-toolbar"
          >Main Toolbar</a> is unhighlighted.
        </li>
      </ul>
      <h1
        class="text-headline-lg font-bold text-on-surface pt-3 pb-1"
        id="layers-and-image-overlay"
      >
        Layers and Image Overlay
      </h1>
      <p>Allows layered editing and image overlays for tracing ASCII arts. You have to be careful using layers!</p>
      <p>
        <img
          src="https://asciibird.birdnest.live/docs/layers.png"
          alt="Layers Toolbar"
        >
      </p>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          The current selected layer has a blue highlight.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          If you have a transparent layer over the top of ascii blocks, and try to use the block picker - it will be
          somewhat deceptive and pick a transparent block, despite looking like it should pick the ascii block.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          You can still edit a hidden layer, although you will be shown a warning and cannot see the actual blocks.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="1-add-layer"
      >
        1. Add Layer
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Will add a new layer to the top of the list.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="2-merge-layers"
      >
        2. Merge Layers
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Will merge all the layers back into one layer.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Note: The name of the new layer will be the currently selected layer.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="3-toggle-image-overlay-visibility"
      >
        3. Toggle Image Overlay Visibility
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Will show or hide the image overlay.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="4-image-overlay-options"
      >
        4. Image Overlay Options
      </h2>
      <p>
        Click this area to see the image overlay options. Within here you can specify the image URL, and also change
        the position and other properties.
      </p>
      <p>
        <img
          src="https://asciibird.birdnest.live/docs/layer-options.png"
          alt="Image Overlay Options"
        >
      </p>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="5-layer-visibility"
      >
        5. Layer Visibility
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Show or hide the layer.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Note: you must always at least try to have have one layer visible.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="6-remove-layer"
      >
        6. Remove Layer
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Will completely remove the layer.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="7-layer-name"
      >
        7. Layer name
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Double click this area to rename the layer.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="8-layer-positioning"
      >
        8. Layer Positioning
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Change the order of the layers. The layer at the top of the list will show first and cover any layers
          bellow.
        </li>
      </ul>
      <h1
        class="text-headline-lg font-bold text-on-surface pt-3 pb-1"
        id="brush-history-and-brush-library"
      >
        Brush History and Brush Library
      </h1>
      <p>
        Asciibird will keep track of your brush changes and also allows you to save your commonly used brushes for
        future use. If a duplicate brush is detected it will be moved to the top.
      </p>
      <p>
        <img
          src="https://asciibird.birdnest.live/docs/brush-history.png"
          alt="Brush History"
        >
      </p>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="brush-history"
      >
        Brush History
      </h2>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="1-brush-history-tab"
      >
        1. Brush History Tab
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          View your brush history.
        </li>
      </ul>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="2-brush-library"
      >
        2. Brush Library
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          View your brush library.
        </li>
      </ul>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="3-brush-preview"
      >
        3. Brush Preview
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Shows the preview of your brush item.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Right clicking on the brush to save to PNG, copy mIRC to clipboard, export to mIRC file or save to
          library.
        </li>
      </ul>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="4-save-to-library"
      >
        4. Save to Library
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Saves your brush from the history to library.
        </li>
      </ul>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="5-use-as-brush"
      >
        5. Use as Brush
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Will restore the brush to the brush preview area for use.
        </li>
      </ul>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="6-remove-brush"
      >
        6. Remove Brush
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Removes the brush from history, no undo.
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="brush-library"
      >
        Brush Library
      </h2>
      <p>
        <img
          src="https://asciibird.birdnest.live/docs/brush-library.png"
          alt="Brush Library"
        >
      </p>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="1-brush-history-tab-1"
      >
        1. Brush History Tab
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          View your brush history.
        </li>
      </ul>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="2-brush-library-1"
      >
        2. Brush Library
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          View your brush library.
        </li>
      </ul>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="3-brush-preview-1"
      >
        3. Brush Preview
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Shows the preview of your brush item.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Right clicking on the brush to save to PNG, copy mIRC to clipboard, export to mIRC file or save to
          library.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          The first 10 brushes can be changed in brush mode with ctrl 1 to 0.
        </li>
      </ul>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="4-delete-brush-from-library"
      >
        4. Delete Brush from Library
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Removes the brush from the library. No undo.
        </li>
      </ul>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="5-use-as-brush-1"
      >
        5. Use as Brush
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Will restore the brush to the brush preview area for use.
        </li>
      </ul>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="6-change-brush-position"
      >
        6. Change Brush Position
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          As the first ten brushes are hotkeyable, you can change their position with these buttons.
        </li>
      </ul>
      <h1
        class="text-headline-lg font-bold text-on-surface pt-3 pb-1"
        id="importing-mirc-art-to-asciibird"
      >
        Importing mIRC art to ASCIIBIRD
      </h1>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          ASCIIBIRD will accept mIRC encoded ascii art only. ANSI is not supported.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Art can be imported from file, clipboard or from URL.
          <ul>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Arts can be viewed from <a href="https://irc.watch/">https://irc.watch/</a> and loaded into ASCIIBIRD.
            </li>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Note: The author of ASCIIBIRD condones hate speech and is not responsible for the contents on external
              websites or ASCII art created by other people.
            </li>
          </ul>
        </li>
      </ul>
      <h1
        class="text-headline-lg font-bold text-on-surface pt-3 pb-1"
        id="exporting-mirc-art-from-asciibird"
      >
        Exporting mIRC art from ASCIIBIRD
      </h1>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          ASCIIBIRD can export to PNG.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          SVG export coming soon!
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Export mIRC encoded art to clipboard to paste in your IRC client.
          <ul>
            <li class="text-body-sm text-on-surface-variant ml-[5%]">
              Note: weechat will strip the colour encodings.
            </li>
          </ul>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          HTTP Post - if you have IRC bots setup, or an API, you can export the mIRC encoded text to an end point
          with HTTP POST.
        </li>
      </ul>
      <h1
        class="text-headline-lg font-bold text-on-surface pt-3 pb-1"
        id="asciibird-states---saving-and-loading"
      >
        ASCIIBIRD States - Saving and Loading
      </h1>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          The asciibird state can be saved to file.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          You can then load it in another browser, or just keep it as a backup. You can load it from within
          ASCIIBIRD.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          The state includes all the data in asciibird, including tabs, asciis and brush history and library.
        </li>
      </ul>
      <h1
        class="text-headline-lg font-bold text-on-surface pt-3 pb-1"
        id="keyboard-shortcuts"
      >
        Keyboard Shortcuts
      </h1>
      <p>
        Most of these keyboard shortcuts can also be found in the toolbar menu. ASCIIBIRD also supports the command
        key on MacOS based systems, which you can use instead of ctrl.
      </p>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="ascii-editing"
      >
        ASCII Editing
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Ctrl + Z - Undo</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Ctrl + Y - Redo</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>F1 - Toggle Help</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Shift + F1 - About ASCIIBIRD and shout outs</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Escape - Return to default mode, stop using any tool and close fg, bg and char panels.</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Alt 1 to 8 - Will toggle the corresponding toolbar icon</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Ctrl 1 to 0 - Change ASCII tab if possible</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>
            Alt + c - Opens character Panel (You can then press on the keyboard your desired character or select from
            the list)
          </p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Alt + f - Opens foreground panel (can then press 0 to 9 for the colour)</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Alt + b - Opens background panel (can then press 0 to 9 for the colour)</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Alt + g - Toggle grid mode</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Alt + x - Toggle Mirror X</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Alt + y - Toggle Mirror Y</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Alt + u - Toggle Update Brush (change brush preview if fg, bg or char changes)</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Alt + r - Flip FG and BG colours</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Ctrl + e - Edit ASCII</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Ctrl + r - Close ASCII</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Ctrl + m - New ASCII (can't use ctrl + n)</p>
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          <p>Ctrl + o - Toggle Asciibird Options</p>
        </li>
      </ul>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="importing"
      >
        Importing
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + o - Open mIRC TXT File as new Ascii
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + v - Paste New Ascii
        </li>
      </ul>
      <h3
        class="text-body-md font-bold text-on-surface pt-1 pb-1"
        id="exporting"
      >
        Exporting
      </h3>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + C - Copy to clipboard
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + F - Save to TXT file
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + G - Save to PNG file
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + H - Save to HTTP Post
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="showing--hiding-menus-tabs-and-panels"
      >
        Showing / Hiding menus, tabs and panels
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Alt + t - Hide / Show Tabs
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Alt + m - Hide / Show Menu
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Alt + d - Hide / Show Debug Panel
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Alt + b - Hide / Show Brush Library
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Alt + l - Hide / Show Layers
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Alt + n - Hide / Show Toolbar
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Alt + e - Hide / Show Brush Preview
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="select-mode"
      >
        Select Mode
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + c - Copy blocks to clipboard
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + x - Cut blocks to clipboard
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + v - Paste blocks as brush
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + b - Save Selection to Library
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Delete - Delete selected blocks
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="eraser-mode"
      >
        Eraser Mode
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Four arrow keys control eraser cursor
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Space - apply eraser
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="brush-mode"
      >
        Brush Mode
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Four arrow keys control text cursor
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl 1 to 0 - change hotkeyable brush
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Space - apply brush
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + ] - Increase both brush sizes by 1
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + [ - Decrease both brush sizes by 1
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Shift+E - flip brush vertically
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Shift+Q - flip brush horizontally
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="text-mode"
      >
        Text mode
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Four arrow keys control text cursor
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Delete - Remove text from highlighted block
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Backspace - Remove current character and move to previous block
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Enter - Go to next line and reset X position to 0
        </li>
      </ul>
      <h2
        class="text-headline-md font-bold text-on-surface pt-2 pb-1"
        id="layers-related"
      >
        Layers Related
      </h2>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + t - Show / Hide Layer
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + r - Rename Layer
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + a - Add Layer
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + d - Delete Layer
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + s - Move Layer Down
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + w - Move Layer Up
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Ctrl + Shift + m - Merge All Layers
        </li>
      </ul>
      <h1
        class="text-headline-lg font-bold text-on-surface pt-3 pb-1"
        id="half-block-editing-mode"
      >
        Half Block editing Mode
      </h1>
      <p>This is still experimental and at the moment the brush tool will work with half block mode only.</p>
      <h1
        class="text-headline-lg font-bold text-on-surface pt-3 pb-1"
        id="context-menus-right-click-menus"
      >
        Context Menus (right click menus)
      </h1>
      <ul>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Right clicking on any brush preview in the main area or library will allow you to export to PNG, txt or
          clipboard just the brush itself.
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          The main ascii has a few export options if you right click on the ascii
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          The dashboard area (outside the ascii) was actually the very first menu in asciibird! and has some basic
          shortcuts
        </li>
        <li class="text-body-sm text-on-surface-variant ml-[5%]">
          Layers can also be right clicked to preview their functions
        </li>
      </ul>
    </div>

    <template #footer>
      <div
        class="flex justify-between"
        @click="modalStore.closeModal('help')"
      >
        <button
          type="button"
          class="ab-button p-2 w-full"
        >
          Ok
        </button>
      </div>
    </template>
  </ABModal>
</template>

<style scoped>
.help-content a {
  color: #adc6ff;
  text-decoration: underline;
}

.help-content a:hover {
  color: #d8e2ff;
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import { useModalStore } from '../../store/modal';
import ABModal from '../ABModal.vue';

const modalStore = useModalStore();

const showHelpModal = computed(() => modalStore.modalState.help);
</script>
