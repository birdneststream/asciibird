<template>
  <t-modal
    name="help-modal"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'help')"
  >
    <template v-slot:default>
      <div class="mt-6 rounded shadow bg-white">
        <h1 class="help-h1">
          Current Features
        </h1>

        <ul class="help-list">
          <li class="help-li">
            Tabbed ASCII editing
          </li>
          <li class="help-li">
            Layers support
          </li>
          <li class="help-li-space">
            - Show and hide layers
          </li>
          <li class="help-li-space">
            - Change layer order
          </li>
          <li class="help-li-space">
            - Double click to rename layer
          </li>
          <li class="help-li-space">
            - Context menu for layers
          </li>
          <li class="help-li">
            Copy and paste ASCII blocks between tabs with the select tool
          </li>
          <li class="help-li">
            Remembers state on refresh and when the browser loads, can also
            export the state to a file and load elsewhere.
          </li>
          <li class="help-li-space">
            - So you never lose your ascii art!
          </li>
          <li class="help-li-space">
            - Saves layers, brushes data also to same file
          </li>
          <li class="help-li">
            Can import from clipboard, load from irc.watch/ascii, load from file
          </li>
          <li class="help-li">
            Can export mirc ascii to clipboard, file or HTTP POST
          </li>
          <li class="help-li">
            99 Colour support
          </li>
          <li class="help-li">
            Swap fg and bg colours with button click or Alt + r
          </li>
          <li class="help-li">
            Mirror X and Y
          </li>
          <li class="help-li">
            Grid mode with Alt + g
          </li>
          <li class="help-li">
            Undo and redo with Ctrl + z and Ctrl + y, undos are set to a limit
            of 200 at the moment.
          </li>
          <li class="help-li">
            Fg, Bg and Char boxes to filter when using certain tools
          </li>
          <li class="help-li">
            - For example filling with Char unchecked will ignore characters
            when filling
          </li>
          <li class="help-li">
            - If you want to remove the background but keep the text, uncheck FG
            and Char and eraser the bg only.
          </li>
          <li class="help-li">
            Image overlay to trace images
          </li>
          <li class="help-li-space">
            - Accepts URLs only at the moment
          </li>
          <li class="help-li-space">
            - Can adjust the size and properties
          </li>
          <li class="help-li">
            Toolbar containing
          </li>
          <li class="help-li-space">
            - Select, to copy, paste and save blocks as brushes
          </li>
          <li class="help-li-space">
            - Text mode, with arrow key support
          </li>
          <li class="help-li-space">
            - Fill background blocks
          </li>
          <li class="help-li-space">
            - Brush mode, can be controlled with keyboard and mouse
          </li>
          <li class="help-li-space">
            - Block picker (grab fg, bg and char of a block)
          </li>
          <li class="help-li">
            - Eraser - remove blocks, can be controlled with keyboard and mouse
          </li>
          <li class="help-li-space">
            - Fill Eraser - Fill remove blocks by bg, fg or char
          </li>
          <li class="help-li">
            Brush Library and History
          </li>
          <li class="help-li-space">
            - Make circle, square, cross and other brushes by sizes
          </li>
          <li class="help-li-space">
            - Brush history, can save or re-use old brushes
          </li>
          <li class="help-li-space">
            - Library - Save most used brushes to library
          </li>
          <li class="help-li-space">
            - Brush history is set to a limit of 50
          </li>
          <li class="help-li">
            Brush Preview
          </li>
          <li class="help-li-space">
            - Editable brush preview
          </li>
          <li class="help-li-space">
            - Can use the brush tool inside the brush preview
          </li>
          <li class="help-li-space">
            - Can use the eraser tool inside the brush preview
          </li>
          <li class="help-li-space">
            - Hovering outside brush area will save brush to history
          </li>
          <li class="help-li">
            Context menu available on all brushes preview areas
          </li>
          <li class="help-li">
            - Export any brush to PNG, mIRC clipboard or file by right clicking
            the brush preview
          </li>
        </ul>

        <h1 class="help-h1">
          Roadmap and Bug To Fixes
        </h1>

        <h3 class="help-h3">
          v1 is released, thanks pals!
        </h3>

        <ul class="help-list">
          <li class="help-li">
            Fix up help modal
          </li>
        </ul>

        <h3 class="help-h3">
          v 1.2
        </h3>

        <ul class="help-list">
          <li class="help-li">
            Unit testing
          </li>
          <li class="help-li">
            More tooltips on other parts, at the moment only Toolbar has
            tooltips, option to disable tooltips
          </li>
          <li class="help-li">
            Fix brush tool for seamless lines when drawing fast
          </li>
          <li class="help-li">
            Warning on mirc export if ascii exceeds IRCs 512 per chat line
            limit.
          </li>
          <li class="help-li">
            Review encodings check on file import - UTF8 vs Latin something
          </li>
          <li class="help-li">
            Fill tool is limited by the recursion limit on the browser. Each
            browser has a different limit. Filling an empty 80x196 ascii will
            throw a recursion error on firefox, but not on Safari for
          </li>
          this reason. We can review the fill feature in a future version of
          ASCII bird.
          <li class="help-li">
            More fill tool options?
          </li>
          <li class="help-li">
            Brush blocks larger than 1x1 can leave undoable blocks
          </li>
          <li class="help-li">
            Half block editing mode
          </li>
          <li class="help-li">
            This one time this ascii exported with a 1 more width and height
          </li>
          <li class="help-li">
            Dark / light modes, different themes
          </li>
          <li class="help-li">
            Context menus inside the panels can be way off sometimes
          </li>
          <li class="help-li">
            Main toolbar can sometimes get stuck and unmovable
          </li>
          <li class="help-li">
            Expand the brush manager, brush categories, download brushes,
            import/export brushes
          </li>
          <li class="help-li">
            ASCIIBIRD API ?!
          </li>

          <h2 class="help-h2">
            Mobile / Touch Screen support
          </h2>

          <p>
            Doesn't exist at the moment. While the underlying functions and code
            is compatible with mobile browsers from *babel*, the touch canvas
            events and text will need to be reviewed to work better with touch
            screens. For example while you can brush once, you cannot move the
            brush around.
          </p>

          <h1 class="help-h1">
            Keyboard Shortcuts
          </h1>

          <h2 class="help-h2">
            ASCII Editing
          </h2>

          <li class="help-li">
            Ctrl + Z - Undo
          </li>
          <li class="help-li">
            Ctrl + Y - Redo
          </li>

          <li class="help-li">
            F1 - Toggle Help
          </li>
          <li class="help-li">
            Shift + F1 - About ASCIIBIRD and shout outs
          </li>

          <li class="help-li">
            Escape - Return to default mode, stop using any tool and close fg,
            bg and char panels.
          </li>

          <li class="help-li">
            Alt 1 to 8 - Will toggle the corresponding toolbar icon
          </li>

          <li class="help-li">
            Ctrl 1 to 0 - Change ASCII tab if possible
          </li>

          <li class="help-li">
            Alt + c - Opens character Panel (You can then press on the keyboard
            your desired character or select from the list)
          </li>
          <li class="help-li">
            Alt + f - Opens foreground panel (can then press 0 to 9 for the
            colour)
          </li>
          <li class="help-li">
            Alt + b - Opens background panel (can then press 0 to 9 for the
            colour)
          </li>

          <li class="help-li">
            Alt + g - Toggle grid mode
          </li>

          <li class="help-li">
            Alt + x - Toggle Mirror X
          </li>
          <li class="help-li">
            Alt + y - Toggle Mirror Y
          </li>
          <li class="help-li">
            Alt + u - Toggle Update Brush (change brush preview if fg, bg or
            char changes)
          </li>
          <li class="help-li">
            Alt + r - Flip FG and BG colours
          </li>

          <li class="help-li">
            Ctrl + e - Edit ASCII
          </li>
          <li class="help-li">
            Ctrl + r - Close ASCII
          </li>
          <li class="help-li">
            Ctrl + m - New ASCII (can't use ctrl + n)
          </li>
          <li class="help-li">
            Ctrl + o - Toggle Asciibird Options
          </li>
        </ul>

        <h3 class="help-h3">
          Importing
        </h3>
        <ul class="help-list">
          <li class="help-li">
            Ctrl + Shift + o - Open mIRC TXT File as new Ascii
          </li>
          <li class="help-li">
            Ctrl + Shift + v - Paste New Ascii
          </li>
        </ul>
        <h3 class="help-h3">
          Exporting
        </h3>
        <ul class="help-list">
          <li class="help-li">
            Ctrl + Shift + C - Copy to clipboard
          </li>
          <li class="help-li">
            Ctrl + Shift + F - Save to TXT file
          </li>
          <li class="help-li">
            Ctrl + Shift + G - Save to PNG file
          </li>
          <li class="help-li">
            Ctrl + Shift + H - Save to HTTP Post
          </li>
        </ul>
        <h2 class="help-h2">
          Showing / Hiding menus, tabs and panels
        </h2>
        <ul class="help-list">
          <li class="help-li">
            Ctrl + Alt + t - Hide / Show Tabs
          </li>
          <li class="help-li">
            Ctrl + Alt + m - Hide / Show Menu
          </li>
          <li class="help-li">
            Ctrl + Alt + d - Hide / Show Debug Panel
          </li>
          <li class="help-li">
            Ctrl + Alt + b - Hide / Show Brush Library
          </li>
          <li class="help-li">
            Ctrl + Alt + l - Hide / Show Layers
          </li>
          <li class="help-li">
            Ctrl + Alt + n - Hide / Show Toolbar
          </li>
          <li class="help-li">
            Ctrl + Alt + e - Hide / Show Brush Preview
          </li>
        </ul>
        <h2 class="help-h2">
          Select Mode
        </h2>
        <ul class="help-list">
          <li class="help-li">
            Ctrl + c - Copy blocks to clipboard
          </li>
          <li class="help-li">
            Ctrl + x - Cut blocks to clipboard
          </li>
          <li class="help-li">
            Ctrl + v - Paste blocks as brush
          </li>
          <li class="help-li">
            Ctrl + b - Save Selection to Library
          </li>
          <li class="help-li">
            Delete - Delete selected blocks
          </li>
        </ul>
        <h2 class="help-h2">
          Eraser Mode
        </h2>
        <ul class="help-list">
          <li class="help-li">
            Four arrow keys control eraser cursor
          </li>
          <li class="help-li">
            Space - apply eraser
          </li>
        </ul>
        <h2 class="help-h2">
          Brush Mode
        </h2>
        <ul class="help-list">
          <li class="help-li">
            Four arrow keys control text cursor
          </li>
          <li class="help-li">
            Space - apply brush
          </li>
          <li class="help-li">
            Ctrl + ] - Increase both brush sizes by 1
          </li>
          <li class="help-li">
            Ctrl + [ - Decrease both brush sizes by 1
          </li>
          <li class="help-li">
            e - rotate brush
          </li>
          <li class="help-li">
            q - flip brush
          </li>
        </ul>
        <h2 class="help-h2">
          Text mode
        </h2>
        <ul class="help-list">
          <li class="help-li">
            Four arrow keys control text cursor
          </li>
          <li class="help-li">
            Delete - Remove text from highlighted block
          </li>
          <li class="help-li">
            Backspace - Remove current character and move to previous block
          </li>
          <li class="help-li">
            Enter - Go to next line and reset X position to 0
          </li>
        </ul>
        <h3 class="help-h3">
          Layers Related
        </h3>
        <ul class="help-list">
          <li class="help-li">
            Ctrl + Shift + t - Show / Hide Layer
          </li>
          <li class="help-li">
            Ctrl + Shift + r - Rename Layer
          </li>
          <li class="help-li">
            Ctrl + Shift + a - Add Layer
          </li>
          <li class="help-li">
            Ctrl + Shift + d - Delete Layer
          </li>
          <li class="help-li">
            Ctrl + Shift + s - Move Layer Down
          </li>
          <li class="help-li">
            Ctrl + Shift + w - Move Layer Up
          </li>
          <li class="help-li">
            Ctrl + Shift + m - Merge All Layers
          </li>
        </ul>
        <h1 class="help-h1">
          Context Menus (right click menus)
        </h1>
        <ul class="help-list">
          <li class="help-li">
            Right clicking on any brush preview in the main area or library will
            allow you to export to PNG, txt or clipboard just the brush itself.
          </li>
          <li class="help-li">
            The main ascii has a few export options if you right click on the
            ascii
          </li>
          <li class="help-li">
            The dashboard area (outside the ascii) was actually the very first
            menu in asciibird! and has some basic shortcuts
          </li>
          <li class="help-li">
            Layers can also be right clicked to preview their functions
          </li>
        </ul>
      </div>
    </template>

    <template v-slot:footer>
      <div
        class="flex justify-between"
        @click="$store.commit('closeModal', 'help')"
      >
        <t-button
          type="button"
          class="p-2 w-full"
        >
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
