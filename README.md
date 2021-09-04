# ASCIIBIRD

```
                           ┏   ┰╛    ╔═━┉┈┉╼━━╌┈╍┅┉╌┄┉┉━═╾─┈═──┄┈╼╍═┈┄╍═╍╼━┈─┈╼┉╍┅╌╮
                         ╘███╏████╒█ ┕█   http://jewbird.live/                     ╏
                            █┻█  █┦█  █╕  http://yt.jewbird.live/                  ┇
                          ╔╼█ ████ ████╚━ http://patreon.jewbird.live/             ┃
                         ╕  █ █ █┉╍█ ┌█═  http://streamlabs.jewbird.live/          ╽
                       ━█████ █ ██ █ ╯█   ASCIIBIRD TAKING FLIGHT                  ╎
                          ┸╮    ╛     ╘╼┈┅┅──━┈┉┅┈╍┄┈┄┈╍┉╾╾╼╍═━╾╾┄╼╾═─┈═┉═╼┅─┈━╌╾╾┅╯

                              [BTC] 1L2u8mQs5pe7k11ozn2BgX388e3fGMD7qo
[XMR] 832owKc3ZuGCnmjHXHeZeeJzGAxyKx5uWU9WxoaXg6BhQ7aWSnZ6EhxFK8Mzw137nSgGAfMM8FgHjM6rpq5s1EofD7UT2yp
           [STREAMLABS] http://streamlabs.jewbird.live [PATREON] http://patreon.jewbird.live
     [YT] http://yt.jewbird.live [TWITCH] http://twitch.jewbird.live [GITHUB] http://git.jewbird.live
```

ASCIIBIRD is an IRC ascii art editor to create or edit mIRC art, it is most times worked on during live stream. It's 100% client side and created in vue2 and may be migrated to vue3 in the future.

You can view and load ASCII art from https://irc.watch/ascii into asciibird.

A most latest production build to use is available at https://asciibird.jewbird.live/

# Current Features

* Tabbed ASCII editing
* Layers support
  * Show and hide layers
  * Change layer order
  * Double click to rename layer
* Copy and paste between tabs
* Remembers state on refresh and when the browser loads, can also export the state to a file and load elsewhere.
  * So you never lose your ascii art!
  * Saves layers, brushes data also to same file
* Can import from clipboard, load from irc.watch/ascii, load from file
* Can export mirc ascii to clipboard, file or HTTP POST
* 99 Colour support, swap colours with button click
* Mirror X and Y
* Grid mode with alt + g
* Undo and redo with ctrl + z and ctrl + y, undos are set to a limit of 50 at the moment.
* Fg, Bg and Char boxes to filter when using certain tools
  * For example filling with Char unchecked will ignore characters when filling
* Toolbar containing
  * Select
  * Text mode
  * Fill background blocks
  * Brush mode
  * Block picker (grab fg, bg and char of a block)
  * Eraser - remove blocks
  * Fill Eraser - Fill remove blocks by bg, fg or char
* Brush Library and History
  * Make circle, square and cross brushes by sizes
  * Brush history, can save or re-use old brushes
  * Library - Save most used brushes to library
  * Brush history is set to a limit of 50
* Brush Preview
  * Editable brush preview
  * Clicking updates block
  * Right clicking removes block
  * Hovering outside brush area will save brush to history

## Noted Bugs to Fix

ASCIIBIRD is mostly usable. There are some bugs however to note at the moment. Refreshing the page seems to fix most strange things.

* Keyboard shortcuts can be pressed at the same time which makes bugs for undo and redo if you aren't careful!
* Circle brush (works okay for odd width and height numbers)
* Importer could be re-written with regex
* Having more than a few layers depending on ascii size will slow things down, until the `fillNullBlocks` is refactored.
* Messing with deleting layers, if you somehow have a layer that isn't selected, it'll be buggy. This is hard to do.
## Focusing on Now / Roadmap

* Modals to add
  * Asciibird options / Options modal from skgs PR
* More Context Menus (right click menu)
  * Brushes Canvas right click
  * ASCII right click
* Image overlay for trace mode
* Review encodings check on file import - UTF8 vs Latin something
* Revise the blocks system to only store what's changed

## User Feedback Requests

* Move brush with keys and space to paint
* Improve the character panel, group chars

# Fixed / Finished

* Cannot manually input brush sizes because keyboard shortcuts is stealing focus
* If you open a modal and refresh the page it's stuck as opened inside the state, and you cannot open it again
* Toolbars and panels follow when scrolling down
* Experimental code to only render blocks visible on screen
* Rename Layers
* Some work around layers and transparent blocks, skip drawing transparent bg block on top layers. Or get bg from lowest layer if bg is null on higher layers.
* The code that hides blocks off screen wont work if you scroll down, however it will work if you drag the canvas upward
* Exporter will default transparent bg to black by default, which wont for some asciis
* Review escape and enter keys on dialogs and modals
* Select cannot select entire ASCII, is off by one at the end
* Fill tool use fg or char as bounds
* z indexing for toolbars and stuff is ANNOYING
# Keyboard Shortcuts

## ASCII Editing

* Ctrl + Z - Undo
* Ctrl + Y - Redo

* Ctrl + Shift + C - Save to clipboard
* Ctrl + Shift + F - Save to txt file

* Escape - Return to default mode / stop using any tool

* When the colour picker is open, the first 0 to 9 colours can be chosen with the keyboards number.
* When the character picker is open, you can also press any key on your keyboard to set the character.

## Toolbar Keyboard Shortcuts

The toolbar keyboard shorts are used with the ALT key.

* Alt 1 to 8 - Will toggle the corresponding toolbar icon

* Alt + c - Opens character Panel (You can then press on the keyboard your desired character or select from the list)
* Alt + f - Opens foreground panel (can then press 0 to 9 for the colour)
* Alt + b - Opens background panel (can then press 0 to 9 for the colour)

* Alt + g - Toggle grid mode

* Ctrl + ] - Increase both brush sizes by 1
* Ctrl + [ - Decrease both brush sizes by 1

### Default Mode Only

* l - Show / hide brushes library
* d - Show and Hide debug bar
* e - Edit ASCII
* p - Paste ASCII from Clipboard
* n - New ASCII

### Select Mode Only

* Ctrl + c - Copy blocks to clipboard
* Ctrl + x - Cut blocks to clipboard
* Ctrl + v - Paste blocks as brush
* Delete - Delete selected blocks

### Brush Mode Only

* e - rotate brush
* q - flip brush

### Text mode

* Four arrow keys control text cursor
* Delete - Remove text from highlighted block
* Backspace - Remove current character and move to previous block
* Enter - Go to next line and reset X position to 0

# References

* http://anti.teamidiot.de/static/nei/*/extended_mirc_color_proposal.html - Good for 99 colours info
* https://jp.itch.io/playscii / http://vectorpoem.com/playscii/
* https://mircart.org/
* https://asdf.us/asciiblaster/
* https://acid.vegas/asciimaker
* https://stackoverflow.com/questions/60263401/draw-on-canvas-with-vue
* https://www.digitalocean.com/community/tutorials/vuejs-vue-html5-canvas
* https://codereview.stackexchange.com/questions/114702/drawing-a-grid-on-canvas
* https://github.com/ircart/resources
* https://gist.github.com/xon52/fb895e33d64a8d322da165d158fa11b2 / https://xon5.medium.com/flexible-canvas-grid-without-blurred-lines-907fcadf5bfc - Grid canvas draw stuff
* http://wepump.in/ascii/
* https://irc.watch/ascii/
* https://modern.ircdocs.horse/formatting.html#color
* https://www.mirc.com/colors.html
* https://github.com/polygonplanet/encoding.js/



## Project setup
```
yarn
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
