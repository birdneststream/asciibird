<template>
  <t-modal
    name="help-modal"
    :click-to-close="false"
    :esc-to-close="true"
    @closed="$store.commit('closeModal', 'help')"
  >
    <template v-slot:default>
      <div class="mt-6 lg:mt-0 rounded shadow bg-white text-center ">
          <h1>Help</h1>

            # Current Features<br>
            <br>
            * Tabbed ASCII editing<br>
            * Layers support<br>
            * Show and hide layers<br>
            * Change layer order<br>
            * Double click to rename layer<br>
            * Context menu for layers<br>
            * Copy and paste ASCII blocks between tabs with the select tool<br>
            * Remembers state on refresh and when the browser loads, can also export the state to a file and load elsewhere.<br>
            * So you never lose your ascii art!<br>
            * Saves layers, brushes data also to same file<br>
            * Can import from clipboard, load from irc.watch/ascii, load from file<br>
            * Can export mirc ascii to clipboard, file or HTTP POST<br>
            * 99 Colour support<br>
            * Swap fg and bg colours with button click or Alt + r<br>
            * Mirror X and Y<br>
            * Grid mode with Alt + g<br>
            * Undo and redo with Ctrl + z and Ctrl + y, undos are set to a limit of 200 at the moment.<br>
            * Fg, Bg and Char boxes to filter when using certain tools<br>
            * For example filling with Char unchecked will ignore characters when filling<br>
            * If you want to remove the background but keep the text, uncheck FG and Char and eraser the bg only.<br>
            * Image overlay to trace images<br>
            * Accepts URLs only at the moment<br>
            * Can adjust the size and properties<br>
            * Toolbar containing<br>
            * Select, to copy, paste and save blocks as brushes<br>
            * Text mode, with arrow key support<br>
            * Fill background blocks<br>
            * Brush mode, can be controlled with keyboard and mouse<br>
            * Block picker (grab fg, bg and char of a block)<br>
            * Eraser - remove blocks, can be controlled with keyboard and mouse<br>
            * Fill Eraser - Fill remove blocks by bg, fg or char<br>
            * Brush Library and History<br>
            * Make circle, square, cross and other brushes by sizes<br>
            * Brush history, can save or re-use old brushes<br>
            * Library - Save most used brushes to library<br>
            * Brush history is set to a limit of 50<br>
            * Brush Preview<br>
            * Editable brush preview<br>
            * Can use the brush tool inside the brush preview<br>
            * Can use the eraser tool inside the brush preview<br>
            * Hovering outside brush area will save brush to history<br>
            * Context menu available on all brushes preview areas<br>
            * Export any brush to PNG, mIRC clipboard or file by right clicking the brush preview<br>
            <br>
            <br>
            ## ASCII Editing<br>
            <br>
            * Ctrl + Z - Undo<br>
            * Ctrl + Y - Redo<br>
            <br>
            * F1 - Toggle Help<br>
            * Shift + F1 - About ASCIIBIRD and shout outs<br>
            <br>
            * Escape - Return to default mode, stop using any tool and close fg, bg and char panels.<br>
            <br>
            * Alt 1 to 8 - Will toggle the corresponding toolbar icon<br>
            <br>
            * Ctrl 1 to 0 - Change ASCII tab if possible<br>
            <br>
            * Alt + c - Opens character Panel (You can then press on the keyboard your desired character or select from <br>
            the list)<br>
            * Alt + f - Opens foreground panel (can then press 0 to 9 for the colour)<br>
            * Alt + b - Opens background panel (can then press 0 to 9 for the colour)<br>
            <br>
            * Alt + g - Toggle grid mode<br>
            <br>
            * Alt + x - Toggle Mirror X<br>
            * Alt + y - Toggle Mirror Y<br>
            * Alt + u - Toggle Update Brush (change brush preview if fg, bg or char changes)<br>
            * Alt + r - Flip FG and BG colours<br>
            <br>
            * Ctrl + e - Edit ASCII<br>
            * Ctrl + r - Close ASCII<br>
            * Ctrl + m - New ASCII (can't use ctrl + n)<br>
            * Ctrl + o - Toggle Asciibird Options<br>
            <br>
            ### Importing<br>
            <br>
            * Ctrl + Shift + o - Open mIRC TXT File as new Ascii<br>
            * Ctrl + Shift + v - Paste New Ascii<br>
            <br>
            ### Exporting<br>
            <br>
            * Ctrl + Shift + C - Copy to clipboard<br>
            * Ctrl + Shift + F - Save to TXT file<br>
            * Ctrl + Shift + G - Save to PNG file<br>
            * Ctrl + Shift + H - Save to HTTP Post<br>
            <br>
            ## Showing / Hiding menus, tabs and panels<br>
            <br>
            * Ctrl + Alt + t - Hide / Show Tabs<br>
            * Ctrl + Alt + m - Hide / Show Menu<br>
            * Ctrl + Alt + d - Hide / Show Debug Panel<br>
            * Ctrl + Alt + b - Hide / Show Brush Library<br>
            * Ctrl + Alt + l - Hide / Show Layers<br>
            * Ctrl + Alt + n - Hide / Show Toolbar<br>
            * Ctrl + Alt + e - Hide / Show Brush Preview<br>
            ## Select Mode<br>
            <br>
            * Ctrl + c - Copy blocks to clipboard<br>
            * Ctrl + x - Cut blocks to clipboard<br>
            * Ctrl + v - Paste blocks as brush<br>
            * Ctrl + b - Save Selection to Library<br>
            * Delete - Delete selected blocks<br>
            <br>
            ## Eraser Mode<br>
            <br>
            * Four arrow keys control eraser cursor<br>
            * Space - apply eraser<br>
            <br>
            ## Brush Mode<br>
            <br>
            * Four arrow keys control text cursor<br>
            * Space - apply brush<br>
            * Ctrl + ] - Increase both brush sizes by 1<br>
            * Ctrl + [ - Decrease both brush sizes by 1<br>
            * e - rotate brush<br>
            * q - flip brush<br>
            <br>
            ## Text mode<br>
            <br>
            * Four arrow keys control text cursor<br>
            * Delete - Remove text from highlighted block<br>
            * Backspace - Remove current character and move to previous block<br>
            * Enter - Go to next line and reset X position to 0<br>
            <br>
            ### Layers Related<br>
            <br>
            * Ctrl + Shift + t - Show / Hide Layer<br>
            * Ctrl + Shift + r - Rename Layer <br>
            * Ctrl + Shift + a - Add Layer <br>
            * Ctrl + Shift + d - Delete Layer <br>
            * Ctrl + Shift + s - Move Layer Down <br>
            * Ctrl + Shift + w - Move Layer Up <br>
            * Ctrl + Shift + m - Merge All Layers <br>
            <br>
            # Context Menus (right click menus)<br>
            <br>
            * Right clicking on any brush preview in the main area or library will allow you to export to PNG, txt or <br>
            clipboard just the brush itself.<br>
            * The main ascii has a few export options if you right click on the ascii<br>
            * The dashboard area (outside the ascii) was actually the very first menu in asciibird! and has some basic<br>
            shortcuts<br>
            * Layers can also be right clicked to preview their functions<br>

      </div>
    </template>

    <template v-slot:footer>
      <div
        class="flex justify-between"
        @click="$store.commit('closeModal', 'help')"
      >
        <t-button type="button" class="p-2 w-full"> Ok </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
import LZString from 'lz-string';
// import BrushCanvas from "./../../components/parts/BrushCanvas.vue";
export default {
  name: "Help",
//   components: {
//     BrushCanvas,
//   },
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
      return JSON.parse(LZString.decompressFromEncodedURIComponent("NrDeF8BpQIgMwOYwFwAZIwMYAsCGAnFGAQRilkRXSz0ORgGUzp4k0McCiBhZit6pzowAkn1ZUOtImPIT2NLvQBC4ygqEy1AqUpgAlbZMXCAIn3KXolgLqQwViC3WDp9AG5GNbmAEYL1oFOwY6hdg5BjvKuegAKXjHChnIuusIAoglpRABqWSZaKToF9JlFxpr0AOoBIdbhwTAARmy+GKklMAAE4i0obdHZ9D1yfcgDHZXdva3txVMjkUHNs4Odi7BjE-M+Gyv9cxW7MwdrCyfjh956G7b2m6uTx6OPOze1L6dP75+XZ88sLZXRJEPZA-4-QGvI6QuqNcHfYRg6HXJEWBr7P6I0EfJYPL5vNG-bYwol40LkhoUuHU2mU+7lVFEAB6+XOjJB9AALmyfNheXoAJYC4QAZxFOI5QxgwqlnXFcvZzkJRFwCTCDPJytJRCaEvosu1TPohEVPgAJriaZEqVrrfa6RAbDYgA"));
    }
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
