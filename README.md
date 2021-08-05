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
# BUGS

* If you resize an ascii, and then undo and try fill in blocks it will error cuz the blocks don't exist
* Redo (ctrl y) is a buggy
* Circle brush (works okay for odd width and height numbers)
* Select only works from dragging top left to bottom right, not the other way around
* Brush cannot brush row 0 in mirror mode
# FOCUSING ON NOW

* Cut / copy then paste with ctrl v
* drawBrush preview flip / rotate
* Type letter when choosing char, leave char panel open after
* color choosing panel, close or cancel
* close tabs

* Brush library
* edit brush

* SELECT TOOL DEV, JUST FINISH IT
* OPTIONS MODAL (SORRY SKG LOL)

* Modals
 * Edit current ascii
 * Asciibird options
 * Tool options

* Encodings - UTF8 vs NOT that

* Context Menus (right click menu) - we started this
* Keyboard shortcuts

* LAYERS

# Keyboard Shortcuts

## ASCII Editing

* Ctrl + D - shows/hides debug panel
* Ctrl + Z - Undo
* Ctrl + Y - Redo
* Ctrl + M - New ASCII (lol @ cannot override ctrl n ?!)
* Ctrl + E - Edit ASCII
* Ctrl + P - Paste ASCII from Clipboard

* Ctrl + Shift + C - Save to clipboard
* Ctrl + Shift + F - Save to txt file
## Brush and Toolbar

* Ctrl + ] - Increase brush size
* Ctrl + [ - Decrease brush size

# FEATURES DONE

* Tabbed editing for asciis
* Remembers ASCII states, can export and import ASCIIBIRD state files
* Import ASCII from https://irc.watch/
* Update text colours without deleting the block
* Floating pattlets, resizeable and remembers positions
* .ASB file, compressed asciibird state
* Export mIRC to clipboard
* EXPORT ascii, trim to canvas size

* Modals
 * New ascii modal

# FEATURES TO DO

* Layers / Insert ASCII as layer
* Overlay image for nance tracing mode

# ASCIIBIRD API?

* Insert image to convert to ASCII into a layer
* Support for tdfiglet, toilet, figlet importing
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
