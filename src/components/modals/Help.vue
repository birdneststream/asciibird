<template>

  <t-modal name="help-modal" :click-to-close="false" :esc-to-close="true" @closed="$store.commit('closeModal', 'help')" >

    <template v-slot:default>

      
      <div class="mt-6 rounded shadow bg-white">
        <h1 class="help-h1" id="asciibird-help-and-documentation">ASCIIBIRD Help and Documentation</h1>
        <ul>
          <li class="help-li-space"><a href="#asciibird-help-and-documentation">ASCIIBIRD Help and Documentation</a></li>
          <li class="help-li-space"><a href="#features-overview">Features Overview</a>
            <ul>
              <li class="help-li-space"><a href="#1-toolbar">1. Toolbar</a></li>
              <li class="help-li-space"><a href="#2-tabs">2. Tabs</a></li>
              <li class="help-li-space"><a href="#3-toolbar-menu">3. Toolbar Menu</a></li>
              <li class="help-li-space"><a href="#4-brush-preview-panel">4. Brush Preview Panel</a></li>
              <li class="help-li-space"><a href="#5-ascii-canvas">5. ASCII Canvas</a></li>
              <li class="help-li-space"><a href="#6-layers-and-image-overlay">6. Layers and Image overlay</a></li>
              <li class="help-li-space"><a href="#7-brush-history-and-brush-library">7. Brush History and Brush Library</a></li>
            </ul>
          </li>
          <li class="help-li-space"><a href="#main-toolbar">Main Toolbar</a>
            <ul>
              <li class="help-li-space"><a href="#1-fg-foreground">1. FG (foreground)</a></li>
              <li class="help-li-space"><a href="#2-bg-background">2. BG (background)</a></li>
              <li class="help-li-space"><a href="#3-character-selection">3. Character Selection</a></li>
              <li class="help-li-space"><a href="#4-colour-swapper">4. Colour Swapper</a></li>
              <li class="help-li-space"><a href="#5-fg-bg-and-text-check-box-filters">5. FG, BG and Text Check box Filters</a></li>
              <li class="help-li-space"><a href="#6-mirror-x-and-mirror-y">6. Mirror X and Mirror y</a></li>
              <li class="help-li-space"><a href="#7-update-brush-when-fg-bg-or-char-changes">7. Update Brush when Fg, Bg or Char changes</a>
              </li>
              <li class="help-li-space"><a href="#8-grid-mode">8. Grid Mode</a></li>
              <li class="help-li-space"><a href="#9-half-block-editing-mode">9. Half Block Editing Mode</a></li>
              <li class="help-li-space"><a href="#10-default-mode">10. Default Mode</a></li>
              <li class="help-li-space"><a href="#11-selection-tool">11. Selection Tool</a></li>
              <li class="help-li-space"><a href="#12-text-mode">12. Text Mode</a></li>
              <li class="help-li-space"><a href="#13-fill-tool">13. Fill Tool</a></li>
              <li class="help-li-space"><a href="#14-brush-tool">14. Brush Tool</a></li>
              <li class="help-li-space"><a href="#15-block-picker-tool">15. Block Picker Tool</a></li>
              <li class="help-li-space"><a href="#16-eraser-tool">16. Eraser Tool</a></li>
              <li class="help-li-space"><a href="#17-eraser-fill-tool">17. Eraser Fill Tool</a></li>
            </ul>
          </li>
          <li class="help-li-space"><a href="#brush-preview">Brush Preview</a>
            <ul>
              <li class="help-li-space"><a href="#1-brush-width">1. Brush Width</a></li>
              <li class="help-li-space"><a href="#2-brush-height">2. Brush Height</a></li>
              <li class="help-li-space"><a href="#3-brush-type">3. Brush type</a></li>
              <li class="help-li-space"><a href="#4-brush-preview">4. Brush Preview</a></li>
            </ul>
          </li>
          <li class="help-li-space"><a href="#layers-and-image-overlay">Layers and Image Overlay</a>
            <ul>
              <li class="help-li-space"><a href="#1-add-layer">1. Add Layer</a></li>
              <li class="help-li-space"><a href="#2-merge-layers">2. Merge Layers</a></li>
              <li class="help-li-space"><a href="#3-toggle-image-overlay-visibility">3. Toggle Image Overlay Visibility</a></li>
              <li class="help-li-space"><a href="#4-image-overlay-options">4. Image Overlay Options</a></li>
              <li class="help-li-space"><a href="#5-layer-visibility">5. Layer Visibility</a></li>
              <li class="help-li-space"><a href="#6-remove-layer">6. Remove Layer</a></li>
              <li class="help-li-space"><a href="#7-layer-name">7. Layer name</a></li>
              <li class="help-li-space"><a href="#8-layer-positioning">8. Layer Positioning</a></li>
            </ul>
          </li>
          <li class="help-li-space"><a href="#brush-history-and-brush-library">Brush History and Brush Library</a>
            <ul>
              <li class="help-li-space"><a href="#brush-history">Brush History</a>
                <ul>
                  <li class="help-li-space"><a href="#1-brush-history-tab">1. Brush History Tab</a></li>
                  <li class="help-li-space"><a href="#2-brush-library">2. Brush Library</a></li>
                  <li class="help-li-space"><a href="#3-brush-preview">3. Brush Preview</a></li>
                  <li class="help-li-space"><a href="#4-save-to-library">4. Save to Library</a></li>
                  <li class="help-li-space"><a href="#5-use-as-brush">5. Use as Brush</a></li>
                  <li class="help-li-space"><a href="#6-remove-brush">6. Remove Brush</a></li>
                </ul>
              </li>
              <li class="help-li-space"><a href="#brush-library">Brush Library</a>
                <ul>
                  <li class="help-li-space"><a href="#1-brush-history-tab-1">1. Brush History Tab</a></li>
                  <li class="help-li-space"><a href="#2-brush-library-1">2. Brush Library</a></li>
                  <li class="help-li-space"><a href="#3-brush-preview-1">3. Brush Preview</a></li>
                  <li class="help-li-space"><a href="#4-delete-brush-from-library">4. Delete Brush from Library</a></li>
                  <li class="help-li-space"><a href="#5-use-as-brush-1">5. Use as Brush</a></li>
                  <li class="help-li-space"><a href="#6-change-brush-position">6. Change Brush Position</a></li>
                </ul>
              </li>
            </ul>
          </li>
          <li class="help-li-space"><a href="#importing-mirc-art-to-asciibird">Importing mIRC art to ASCIIBIRD</a></li>
          <li class="help-li-space"><a href="#exporting-mirc-art-from-asciibird">Exporting mIRC art from ASCIIBIRD</a></li>
          <li class="help-li-space"><a href="#asciibird-states---saving-and-loading">ASCIIBIRD States - Saving and Loading</a></li>
          <li class="help-li-space"><a href="#keyboard-shortcuts">Keyboard Shortcuts</a>
            <ul>
              <li class="help-li-space"><a href="#ascii-editing">ASCII Editing</a>
                <ul>
                  <li class="help-li-space"><a href="#importing">Importing</a></li>
                  <li class="help-li-space"><a href="#exporting">Exporting</a></li>
                </ul>
              </li>
              <li class="help-li-space"><a href="#showing--hiding-menus-tabs-and-panels">Showing / Hiding menus, tabs and panels</a></li>
              <li class="help-li-space"><a href="#select-mode">Select Mode</a></li>
              <li class="help-li-space"><a href="#eraser-mode">Eraser Mode</a></li>
              <li class="help-li-space"><a href="#brush-mode">Brush Mode</a></li>
              <li class="help-li-space"><a href="#text-mode">Text mode</a></li>
              <li class="help-li-space"><a href="#layers-related">Layers Related</a></li>
            </ul>
          </li>
          <li class="help-li-space"><a href="#half-block-editing-mode">Half Block editing Mode</a></li>
          <li class="help-li-space"><a href="#context-menus-right-click-menus">Context Menus (right click menus)</a></li>
        </ul>
        <h1 class="help-h1" id="features-overview">Features Overview</h1>
        <p>ASCIIBIRD allows tabbed editing of mIRC ascii art, and contains powerful features such as layers, brush
          library and a brush editor.</p>
        <p><em>View -&gt; Windows</em> from the toolbar menu can show or hide most of these panels. The keyboard
          shortcuts can be found at <a href="#showing--hiding-menus-tabs-and-panels">Show and Hide Panels Keyboard
            Shortcuts</a></p>
        <p><img src="https://asciibird.birdnest.live/docs/overview.png" alt="alt text"></p>
        <h2 class="help-h2" id="1-toolbar">1. Toolbar</h2>
        <ul>
          <li class="help-li-space">Allows you to see the shortcuts and features of ASCIIBIRD.</li>
        </ul>
        <h2 class="help-h2" id="2-tabs">2. Tabs</h2>
        <ul>
          <li class="help-li-space">Each new ascii you create or import will have its own tab.</li>
          <li class="help-li-space">You can copy and paste blocks between each of the tabs.</li>
        </ul>
        <h2 class="help-h2" id="3-toolbar-menu">3. Toolbar Menu</h2>
        <ul>
          <li class="help-li-space">The main toolbar which allows for ascii editing, please review <a href="#main-toolbar">Main Toolbar</a>
          </li>
        </ul>
        <h2 class="help-h2" id="4-brush-preview-panel">4. Brush Preview Panel</h2>
        <ul>
          <li class="help-li-space">Allows you to change the width and height of the brush, and also the brush type.</li>
          <li class="help-li-space">The brush preview is editable with the brush, eraser and fill tools from the toolbar. However limited to
            1x1 or per block only.</li>
          <li class="help-li-space">Read more at <a href="#brush-preview">Brush Preview</a></li>
        </ul>
        <h2 class="help-h2" id="5-ascii-canvas">5. ASCII Canvas</h2>
        <ul>
          <li class="help-li-space">Shows the current state of your ASCII art. You use the tools on this part.</li>
        </ul>
        <h2 class="help-h2" id="6-layers-and-image-overlay">6. Layers and Image overlay</h2>
        <ul>
          <li class="help-li-space">Provides layered editing capabilities.</li>
          <li class="help-li-space">Image Overlay will allow you to paste an image URL to trace over on the ASCII canvas.</li>
          <li class="help-li-space">Read more at <a href="#layers-and-image-overlay">Layers and Image Overlay</a></li>
        </ul>
        <h2 class="help-h2" id="7-brush-history-and-brush-library">7. Brush History and Brush Library</h2>
        <ul>
          <li class="help-li-space">Save brushes for future use or see your previous brush history.</li>
          <li class="help-li-space">Read more at <a href="#brush-history-and-brush-library">Brush History and Library</a></li>
        </ul>
        <h1 class="help-h1" id="main-toolbar">Main Toolbar</h1>
        <p>The toolbar contains the major functions required to create mIRC art.</p>
        <p><img src="https://asciibird.birdnest.live/docs/toolbar.png" alt="Toolbar"></p>
        <h2 class="help-h2" id="1-fg-foreground">1. FG (foreground)</h2>
        <ul>
          <li class="help-li-space">Changes the FG of the brush.</li>
          <li class="help-li-space">If the panel is open you can select the first 1 to 9 colours with the numeric keys 1 to 0.</li>
          <li class="help-li-space">Escape will hide the panel.</li>
          <li class="help-li-space">Alt + F will show/hide the foreground colour selection.</li>
          <li class="help-li-space">Foreground applies colour to text.</li>
        </ul>
        <h2 class="help-h2" id="2-bg-background">2. BG (background)</h2>
        <ul>
          <li class="help-li-space">Changes the BG of the brush.</li>
          <li class="help-li-space">If the panel is open you can select the first 1 to 9 colours with the numeric keys 1 to 0.</li>
          <li class="help-li-space">Escape will hide the panel.</li>
          <li class="help-li-space">Alt + B will show/hide the background colour selection.</li>
          <li class="help-li-space">Background is the colour behind the text.</li>
        </ul>
        <h2 class="help-h2" id="3-character-selection">3. Character Selection</h2>
        <ul>
          <li class="help-li-space">Changes the character of the brush.</li>
          <li class="help-li-space">If the panel is open, you can also press any key on your keyboard to change the character.</li>
          <li class="help-li-space">Escape will hide the panel.</li>
          <li class="help-li-space">Alt + C will show/hide the character selection.</li>
        </ul>
        <h2 class="help-h2" id="4-colour-swapper">4. Colour Swapper</h2>
        <ul>
          <li class="help-li-space">Quickly swap the BG and FG colours.</li>
          <li class="help-li-space">Alt + R will also trigger this.</li>
        </ul>
        <h2 class="help-h2" id="5-fg-bg-and-text-check-box-filters">5. FG, BG and Text Check box Filters</h2>
        <ul>
          <li class="help-li-space">Handy if you want to just apply foreground to text, or ignore text and foreground and change the
            background only.</li>
          <li class="help-li-space">One must be selected at all times.</li>
          <li class="help-li-space">If you are wondering why your brush is not drawing text or a foreground colour, check these boxes!!!</li>
        </ul>
        <h2 class="help-h2" id="6-mirror-x-and-mirror-y">6. Mirror X and Mirror y</h2>
        <ul>
          <li class="help-li-space">Provides an X and Y mirror for brush, eraser and text modes.</li>
          <li class="help-li-space">Draw symmetrical ascii arts with ease.</li>
        </ul>
        <h2 class="help-h2" id="7-update-brush-when-fg-bg-or-char-changes">7. Update Brush when Fg, Bg or Char changes</h2>
        <ul>
          <li class="help-li-space">If this is highlighted, the brush will automatically change when any of the colours or text are also
            changed.</li>
          <li class="help-li-space">If you want to preserve a custom brush, or edit the current brush, best to have this unselected.</li>
        </ul>
        <h2 class="help-h2" id="8-grid-mode">8. Grid Mode</h2>
        <ul>
          <li class="help-li-space">Grid mode will show the ascii blocks. Also works with half block editing mode.</li>
        </ul>
        <h2 class="help-h2" id="9-half-block-editing-mode">9. Half Block Editing Mode</h2>
        <ul>
          <li class="help-li-space">Experimental half block mode, at the moment works best with a 1x1 brush size.</li>
          <li class="help-li-space">Eraser and fill tool are coming soon for this mode.</li>
          <li class="help-li-space">This will also reflect half block sizes if the grid mode is enabled.</li>
        </ul>
        <h2 class="help-h2" id="10-default-mode">10. Default Mode</h2>
        <ul>
          <li class="help-li-space">In this mode you cannot edit any ascii, however you can drag the panels around.</li>
        </ul>
        <h2 class="help-h2" id="11-selection-tool">11. Selection Tool</h2>
        <ul>
          <li class="help-li-space">Select ascii blocks.</li>
          <li class="help-li-space">Once ascii blocks are selected you can,
            <ul>
              <li class="help-li-space">Ctrl + C to copy blocks</li>
              <li class="help-li-space">Ctrl + X to cut blocks (this will also remove the blocks)</li>
              <li class="help-li-space">Delete - Just remove the blocks only</li>
              <li class="help-li-space">Ctrl + B - Immediately save the selection to brush library</li>
              <li class="help-li-space">Ctrl + V (if copied blocks from selection mode) will paste, and automatically change to brush tool.
              </li>
            </ul>
          </li>
        </ul>
        <h2 class="help-h2" id="12-text-mode">12. Text Mode</h2>
        <ul>
          <li class="help-li-space">Select a position of the ascii to type text.</li>
          <li class="help-li-space">If text hits the end of the ascii it will wrap around to the start of the next line.</li>
          <li class="help-li-space">Enter will also wrap the text to the start of the next line.</li>
          <li class="help-li-space">Note: <em>cannot</em> paste text.</li>
          <li class="help-li-space">Backspace will remove text.</li>
          <li class="help-li-space">Delete will delete the character at the highlighted position.</li>
          <li class="help-li-space">Also can be used in Mirror X or Mirror Y modes.</li>
        </ul>
        <h2 class="help-h2" id="13-fill-tool">13. Fill Tool</h2>
        <ul>
          <li class="help-li-space">Fill your ascii with blocks, usual fill tool.</li>
          <li class="help-li-space">Also considers the FG, BG and Char check boxes.</li>
          <li class="help-li-space">The bounds of the fill tool at moment take into account bg (mostly).</li>
        </ul>
        <h2 class="help-h2" id="14-brush-tool">14. Brush Tool</h2>
        <ul>
          <li class="help-li-space">Main tool to brush ascii blocks.</li>
          <li class="help-li-space">E - will horizontal flip the brush.</li>
          <li class="help-li-space">Q - will vertical flip the brush.</li>
          <li class="help-li-space">You can also edit the brush library preview with this tool.</li>
          <li class="help-li-space">Will consider fg, bg and char check boxes when drawing.</li>
          <li class="help-li-space">Also can be used in Mirror X or Mirror Y modes.</li>
          <li class="help-li-space">Ctrl + V (if copied blocks from selection mode) will paste.</li>
        </ul>
        <h2 class="help-h2" id="15-block-picker-tool">15. Block Picker Tool</h2>
        <ul>
          <li class="help-li-space">Pick up the bg, fg and char of any block.</li>
          <li class="help-li-space">Will consider fg, bg and char check boxes when selecting.</li>
          <li class="help-li-space">If the block contain an empty fg and text, but has a bg - only the BG will update.</li>
        </ul>
        <h2 class="help-h2" id="16-eraser-tool">16. Eraser Tool</h2>
        <ul>
          <li class="help-li-space">Takes the form of the brush and will remove blocks only.</li>
          <li class="help-li-space">Also considers the FG, BG and Char check boxes.</li>
          <li class="help-li-space">If you just want to remove characters, ensure the char box is selected only and it will preserve the
            background.</li>
        </ul>
        <h2 class="help-h2" id="17-eraser-fill-tool">17. Eraser Fill Tool</h2>
        <ul>
          <li class="help-li-space">Works similar to the fill tool, but will remove blocks only.</li>
          <li class="help-li-space">Also considers the FG, BG and Char check boxes.</li>
          <li class="help-li-space">Good if you want to make a transparent background ASCII.</li>
        </ul>
        <h1 class="help-h1" id="brush-preview">Brush Preview</h1>
        <p>The brush preview shows your current brush, and also allows you to create new basic brushes of different
          shapes and types with some basic editing capabilities.</p>
        <p><img src="https://asciibird.birdnest.live/docs/brush-preview.png" alt="Brush Preview"></p>
        <h2 class="help-h2" id="1-brush-width">1. Brush Width</h2>
        <ul>
          <li class="help-li-space">Changes the width of the brush. The max is 50, although you can type a larger number if you really want
            to.</li>
        </ul>
        <h2 class="help-h2" id="2-brush-height">2. Brush Height</h2>
        <ul>
          <li class="help-li-space">Changes the height of the brush. The max is 50, although you can type a larger number if you really want
            to.</li>
        </ul>
        <h2 class="help-h2" id="3-brush-type">3. Brush type</h2>
        <ul>
          <li class="help-li-space">Changes the brush type. At the moment the following are available.
            <ul>
              <li class="help-li-space">Square</li>
              <li class="help-li-space">Circle</li>
              <li class="help-li-space">Cross</li>
              <li class="help-li-space">Grid</li>
              <li class="help-li-space">Inverted Grid</li>
              <li class="help-li-space">H lines</li>
              <li class="help-li-space">V lines</li>
            </ul>
          </li>
        </ul>
        <h2 class="help-h2" id="4-brush-preview">4. Brush Preview</h2>
        <ul>
          <li class="help-li-space">If you use the brush tool or eraser tool, this is the brush type it will use.</li>
          <li class="help-li-space">The brush preview can also be edited with the brush, eraser and fill tools from the <a
              href="#main-toolbar">Main Toolbar</a></li>
          <li class="help-li-space">If you are making a custom brush ensure the <em>Update Brush when Fg, Bg or Char changes</em> from the <a
              href="#main-toolbar">Main Toolbar</a> is unhighlighted.</li>
        </ul>
        <h1 class="help-h1" id="layers-and-image-overlay">Layers and Image Overlay</h1>
        <p>Allows layered editing and image overlays for tracing ASCII arts. You have to be careful using layers!</p>
        <p><img src="https://asciibird.birdnest.live/docs/layers.png" alt="Layers Toolbar"></p>
        <ul>
          <li class="help-li-space">The current selected layer has a blue highlight.</li>
          <li class="help-li-space">If you have a transparent layer over the top of ascii blocks, and try to use the block picker - it will be
            somewhat deceptive and pick a transparent block, despite looking like it should pick the ascii block.</li>
          <li class="help-li-space">You can still edit a hidden layer, although you will be shown a warning and cannot see the actual blocks.
          </li>
        </ul>
        <h2 class="help-h2" id="1-add-layer">1. Add Layer</h2>
        <ul>
          <li class="help-li-space">Will add a new layer to the top of the list.</li>
        </ul>
        <h2 class="help-h2" id="2-merge-layers">2. Merge Layers</h2>
        <ul>
          <li class="help-li-space">Will merge all the layers back into one layer.</li>
          <li class="help-li-space">Note: The name of the new layer will be the currently selected layer.</li>
        </ul>
        <h2 class="help-h2" id="3-toggle-image-overlay-visibility">3. Toggle Image Overlay Visibility</h2>
        <ul>
          <li class="help-li-space">Will show or hide the image overlay.</li>
        </ul>
        <h2 class="help-h2" id="4-image-overlay-options">4. Image Overlay Options</h2>
        <p>Click this area to see the image overlay options. Within here you can specify the image URL, and also change
          the position and other properties.</p>
        <p><img src="https://asciibird.birdnest.live/docs/layer-options.png" alt="Image Overlay Options"></p>
        <h2 class="help-h2" id="5-layer-visibility">5. Layer Visibility</h2>
        <ul>
          <li class="help-li-space">Show or hide the layer.</li>
          <li class="help-li-space">Note: you must always at least try to have have one layer visible.</li>
        </ul>
        <h2 class="help-h2" id="6-remove-layer">6. Remove Layer</h2>
        <ul>
          <li class="help-li-space">Will completely remove the layer.</li>
        </ul>
        <h2 class="help-h2" id="7-layer-name">7. Layer name</h2>
        <ul>
          <li class="help-li-space">Double click this area to rename the layer.</li>
        </ul>
        <h2 class="help-h2" id="8-layer-positioning">8. Layer Positioning</h2>
        <ul>
          <li class="help-li-space">Change the order of the layers. The layer at the top of the list will show first and cover any layers
            bellow.</li>
        </ul>
        <h1 class="help-h1" id="brush-history-and-brush-library">Brush History and Brush Library</h1>
        <p>Asciibird will keep track of your brush changes and also allows you to save your commonly used brushes for
          future use. If a duplicate brush is detected it will be moved to the top.</p>
        <p><img src="https://asciibird.birdnest.live/docs/brush-history.png" alt="Brush History"></p>
        <h2 class="help-h2" id="brush-history">Brush History</h2>
        <h3 class="help-h3" id="1-brush-history-tab">1. Brush History Tab</h3>
        <ul>
          <li class="help-li-space">View your brush history.</li>
        </ul>
        <h3 class="help-h3" id="2-brush-library">2. Brush Library</h3>
        <ul>
          <li class="help-li-space">View your brush library.</li>
        </ul>
        <h3 class="help-h3" id="3-brush-preview">3. Brush Preview</h3>
        <ul>
          <li class="help-li-space">Shows the preview of your brush item.</li>
          <li class="help-li-space">Right clicking on the brush to save to PNG, copy mIRC to clipboard, export to mIRC file or save to
            library.</li>
        </ul>
        <h3 class="help-h3" id="4-save-to-library">4. Save to Library</h3>
        <ul>
          <li class="help-li-space">Saves your brush from the history to library.</li>
        </ul>
        <h3 class="help-h3" id="5-use-as-brush">5. Use as Brush</h3>
        <ul>
          <li class="help-li-space">Will restore the brush to the brush preview area for use.</li>
        </ul>
        <h3 class="help-h3" id="6-remove-brush">6. Remove Brush</h3>
        <ul>
          <li class="help-li-space">Removes the brush from history, no undo.</li>
        </ul>
        <h2 class="help-h2" id="brush-library">Brush Library</h2>
        <p><img src="https://asciibird.birdnest.live/docs/brush-library.png" alt="Brush Library"></p>
        <h3 class="help-h3" id="1-brush-history-tab-1">1. Brush History Tab</h3>
        <ul>
          <li class="help-li-space">View your brush history.</li>
        </ul>
        <h3 class="help-h3" id="2-brush-library-1">2. Brush Library</h3>
        <ul>
          <li class="help-li-space">View your brush library.</li>
        </ul>
        <h3 class="help-h3" id="3-brush-preview-1">3. Brush Preview</h3>
        <ul>
          <li class="help-li-space">Shows the preview of your brush item.</li>
          <li class="help-li-space">Right clicking on the brush to save to PNG, copy mIRC to clipboard, export to mIRC file or save to
            library.</li>
          <li class="help-li-space">The first 10 brushes can be changed in brush mode with ctrl 1 to 0.</li>
        </ul>
        <h3 class="help-h3" id="4-delete-brush-from-library">4. Delete Brush from Library</h3>
        <ul>
          <li class="help-li-space">Removes the brush from the library. No undo.</li>
        </ul>
        <h3 class="help-h3" id="5-use-as-brush-1">5. Use as Brush</h3>
        <ul>
          <li class="help-li-space">Will restore the brush to the brush preview area for use.</li>
        </ul>
        <h3 class="help-h3" id="6-change-brush-position">6. Change Brush Position</h3>
        <ul>
          <li class="help-li-space">As the first ten brushes are hotkeyable, you can change their position with these buttons.</li>
        </ul>
        <h1 class="help-h1" id="importing-mirc-art-to-asciibird">Importing mIRC art to ASCIIBIRD</h1>
        <ul>
          <li class="help-li-space">ASCIIBIRD will accept mIRC encoded ascii art only. ANSI is not supported.</li>
          <li class="help-li-space">Art can be imported from file, clipboard or from URL.
            <ul>
              <li class="help-li-space">Arts can be viewed from <a href="https://irc.watch/">https://irc.watch/</a> and loaded into ASCIIBIRD.
              </li>
              <li class="help-li-space">Note: The author of ASCIIBIRD condones hate speech and is not responsible for the contents on external
                websites or ASCII art created by other people.</li>
            </ul>
          </li>
        </ul>
        <h1 class="help-h1" id="exporting-mirc-art-from-asciibird">Exporting mIRC art from ASCIIBIRD</h1>
        <ul>
          <li class="help-li-space">ASCIIBIRD can export to PNG.</li>
          <li class="help-li-space">SVG export coming soon!</li>
          <li class="help-li-space">Export mIRC encoded art to clipboard to paste in your IRC client.
            <ul>
              <li class="help-li-space">Note: weechat will strip the colour encodings.</li>
            </ul>
          </li>
          <li class="help-li-space">HTTP Post - if you have IRC bots setup, or an API, you can export the mIRC encoded text to an end point
            with HTTP POST.</li>
        </ul>
        <h1 class="help-h1" id="asciibird-states---saving-and-loading">ASCIIBIRD States - Saving and Loading</h1>
        <ul>
          <li class="help-li-space">The asciibird state can be saved to file.</li>
          <li class="help-li-space">You can then load it in another browser, or just keep it as a backup. You can load it from within
            ASCIIBIRD.</li>
          <li class="help-li-space">The state includes all the data in asciibird, including tabs, asciis and brush history and library.</li>
        </ul>
        <h1 class="help-h1" id="keyboard-shortcuts">Keyboard Shortcuts</h1>
        <p>Most of these keyboard shortcuts can also be found in the toolbar menu. ASCIIBIRD also supports the command
          key on MacOS based systems, which you can use instead of ctrl.</p>
        <h2 class="help-h2" id="ascii-editing">ASCII Editing</h2>
        <ul>
          <li class="help-li-space">
            <p>Ctrl + Z - Undo</p>
          </li>
          <li class="help-li-space">
            <p>Ctrl + Y - Redo</p>
          </li>
          <li class="help-li-space">
            <p>F1 - Toggle Help</p>
          </li>
          <li class="help-li-space">
            <p>Shift + F1 - About ASCIIBIRD and shout outs</p>
          </li>
          <li class="help-li-space">
            <p>Escape - Return to default mode, stop using any tool and close fg, bg and char panels.</p>
          </li>
          <li class="help-li-space">
            <p>Alt 1 to 8 - Will toggle the corresponding toolbar icon</p>
          </li>
          <li class="help-li-space">
            <p>Ctrl 1 to 0 - Change ASCII tab if possible</p>
          </li>
          <li class="help-li-space">
            <p>Alt + c - Opens character Panel (You can then press on the keyboard your desired character or select from
              the list)</p>
          </li>
          <li class="help-li-space">
            <p>Alt + f - Opens foreground panel (can then press 0 to 9 for the colour)</p>
          </li>
          <li class="help-li-space">
            <p>Alt + b - Opens background panel (can then press 0 to 9 for the colour)</p>
          </li>
          <li class="help-li-space">
            <p>Alt + g - Toggle grid mode</p>
          </li>
          <li class="help-li-space">
            <p>Alt + x - Toggle Mirror X</p>
          </li>
          <li class="help-li-space">
            <p>Alt + y - Toggle Mirror Y</p>
          </li>
          <li class="help-li-space">
            <p>Alt + u - Toggle Update Brush (change brush preview if fg, bg or char changes)</p>
          </li>
          <li class="help-li-space">
            <p>Alt + r - Flip FG and BG colours</p>
          </li>
          <li class="help-li-space">
            <p>Ctrl + e - Edit ASCII</p>
          </li>
          <li class="help-li-space">
            <p>Ctrl + r - Close ASCII</p>
          </li>
          <li class="help-li-space">
            <p>Ctrl + m - New ASCII (can't use ctrl + n)</p>
          </li>
          <li class="help-li-space">
            <p>Ctrl + o - Toggle Asciibird Options</p>
          </li>
        </ul>
        <h3 class="help-h3" id="importing">Importing</h3>
        <ul>
          <li class="help-li-space">Ctrl + Shift + o - Open mIRC TXT File as new Ascii</li>
          <li class="help-li-space">Ctrl + Shift + v - Paste New Ascii</li>
        </ul>
        <h3 class="help-h3" id="exporting">Exporting</h3>
        <ul>
          <li class="help-li-space">Ctrl + Shift + C - Copy to clipboard</li>
          <li class="help-li-space">Ctrl + Shift + F - Save to TXT file</li>
          <li class="help-li-space">Ctrl + Shift + G - Save to PNG file</li>
          <li class="help-li-space">Ctrl + Shift + H - Save to HTTP Post</li>
        </ul>
        <h2 class="help-h2" id="showing--hiding-menus-tabs-and-panels">Showing / Hiding menus, tabs and panels</h2>
        <ul>
          <li class="help-li-space">Ctrl + Alt + t - Hide / Show Tabs</li>
          <li class="help-li-space">Ctrl + Alt + m - Hide / Show Menu</li>
          <li class="help-li-space">Ctrl + Alt + d - Hide / Show Debug Panel</li>
          <li class="help-li-space">Ctrl + Alt + b - Hide / Show Brush Library</li>
          <li class="help-li-space">Ctrl + Alt + l - Hide / Show Layers</li>
          <li class="help-li-space">Ctrl + Alt + n - Hide / Show Toolbar</li>
          <li class="help-li-space">Ctrl + Alt + e - Hide / Show Brush Preview</li>
        </ul>
        <h2 class="help-h2" id="select-mode">Select Mode</h2>
        <ul>
          <li class="help-li-space">Ctrl + c - Copy blocks to clipboard</li>
          <li class="help-li-space">Ctrl + x - Cut blocks to clipboard</li>
          <li class="help-li-space">Ctrl + v - Paste blocks as brush</li>
          <li class="help-li-space">Ctrl + b - Save Selection to Library</li>
          <li class="help-li-space">Delete - Delete selected blocks</li>
        </ul>
        <h2 class="help-h2" id="eraser-mode">Eraser Mode</h2>
        <ul>
          <li class="help-li-space">Four arrow keys control eraser cursor</li>
          <li class="help-li-space">Space - apply eraser</li>
        </ul>
        <h2 class="help-h2" id="brush-mode">Brush Mode</h2>
        <ul>
          <li class="help-li-space">Four arrow keys control text cursor</li>
          <li class="help-li-space">Ctrl 1 to 0 - change hotkeyable brush</li>
          <li class="help-li-space">Space - apply brush</li>
          <li class="help-li-space">Ctrl + ] - Increase both brush sizes by 1</li>
          <li class="help-li-space">Ctrl + [ - Decrease both brush sizes by 1</li>
          <li class="help-li-space">e - rotate brush</li>
          <li class="help-li-space">q - flip brush</li>
        </ul>
        <h2 class="help-h2" id="text-mode">Text mode</h2>
        <ul>
          <li class="help-li-space">Four arrow keys control text cursor</li>
          <li class="help-li-space">Delete - Remove text from highlighted block</li>
          <li class="help-li-space">Backspace - Remove current character and move to previous block</li>
          <li class="help-li-space">Enter - Go to next line and reset X position to 0</li>
        </ul>
        <h2 class="help-h2" id="layers-related">Layers Related</h2>
        <ul>
          <li class="help-li-space">Ctrl + Shift + t - Show / Hide Layer</li>
          <li class="help-li-space">Ctrl + Shift + r - Rename Layer</li>
          <li class="help-li-space">Ctrl + Shift + a - Add Layer</li>
          <li class="help-li-space">Ctrl + Shift + d - Delete Layer</li>
          <li class="help-li-space">Ctrl + Shift + s - Move Layer Down</li>
          <li class="help-li-space">Ctrl + Shift + w - Move Layer Up</li>
          <li class="help-li-space">Ctrl + Shift + m - Merge All Layers</li>
        </ul>
        <h1 class="help-h1" id="half-block-editing-mode">Half Block editing Mode</h1>
        <p>This is still experimental and at the moment the brush tool will work with half block mode only.</p>
        <h1 class="help-h1" id="context-menus-right-click-menus">Context Menus (right click menus)</h1>
        <ul>
          <li class="help-li-space">Right clicking on any brush preview in the main area or library will allow you to export to PNG, txt or
            clipboard just the brush itself.</li>
          <li class="help-li-space">The main ascii has a few export options if you right click on the ascii</li>
          <li class="help-li-space">The dashboard area (outside the ascii) was actually the very first menu in asciibird! and has some basic
            shortcuts</li>
          <li class="help-li-space">Layers can also be right clicked to preview their functions</li>
        </ul>


      </div>
    </template>

    <template v-slot:footer>
      <div class="flex justify-between" @click="$store.commit('closeModal', 'help')">
        <t-button type="button" class="p-2 w-full">
          Ok
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<style>
.help-h1 {
  font-size: 22px;
  font-weight: bold;
  padding-top: 1%;
  padding-bottom: 1%;
}

.help-h2 {
  font-size: 17px;
  font-weight: bold;
  padding-top: 1%;
  padding-bottom: 1%;
}

.help-h3 {
  font-size: 14px;
  font-weight: bold;
  padding-top: 1%;
  padding-bottom: 1%;
}

.help-li {
  font-size: 12px;
}

.help-list {
  font-size: 12px;
}

.help-li-space {
  font-size: 12px;
  margin-left: 5%;
}
</style>

<script>
import LZString from "lz-string";

export default {
  name: "Help",
  created() {},
  mounted() {
    if (this.showOptionsModal) {
      this.open();
    } else {
      this.close();
    }
  },
  data: () => ({}),
  computed: {
    showOptionsModal() {
      return this.$store.getters.modalState.help;
    },
    helpAscii() {
      return JSON.parse(
        LZString.decompressFromEncodedURIComponent(
          "NrDeF8BpQIgMwOYwFwAZIwMYAsCGAnFGAQRilkRXSz0ORgGUzp4k0McCiBhZit6pzowAkn1ZUOtImPIT2NLvQBC4ygqEy1AqUpgAlbZMXCAIn3KXolgLqQwViC3WDp9AG5GNbmAEYL1oFOwY6hdg5BjvKuegAKXjHChnIuusIAoglpRABqWSZaKToF9JlFxpr0AOoBIdbhwTAARmy+GKklMAAE4i0obdHZ9D1yfcgDHZXdva3txVMjkUHNs4Odi7BjE-M+Gyv9cxW7MwdrCyfjh956G7b2m6uTx6OPOze1L6dP75+XZ88sLZXRJEPZA-4-QGvI6QuqNcHfYRg6HXJEWBr7P6I0EfJYPL5vNG-bYwol40LkhoUuHU2mU+7lVFEAB6+XOjJB9AALmyfNheXoAJYC4QAZxFOI5QxgwqlnXFcvZzkJRFwCTCDPJytJRCaEvosu1TPohEVPgAJriaZEqVrrfa6RAbDYgA"
        )
      );
    },
  },
  watch: {
    showOptionsModal(val) {
      if (val === true) {
        this.open();
      }

      if (val === false) {
        this.close();
      }
    },
  },
  methods: {
    open() {
      this.$modal.show("help-modal");
    },
    close() {
      this.$modal.hide("help-modal");
    },
  },
};
</script>
