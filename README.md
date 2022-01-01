# ASCIIBIRD V1 - PRERELEASE BUILD

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

# Big Shout outs to Patrons

> beenz, xartet, OfMonsters&Crime, mouse, funkpower, Charles, PP4L, octopus, addct, hotline, dingopride, skg, eraser, aaa, chz, L0j1k

> special thanks to slime aka botmaster slime aka knivey for the wonderful bot integration with asciibird
## Greetz to Chat Pals

> darkmage, l0de, bex, blarf, sludg, shart, chode, corn, ralph, jrra, kuntz, moony, sniff, scd, aztec, astro, anji, b-rex, bengt, butth0le, canada420, clamkin, deakin, dumbguy, ElBurro, interdome, syn, darkness, vae, gowce, moneytree, Retarded, spoon, sylar, zen, bj0rn, stovepipe, morthrane, chrono, acidvegas, again, hgc, durendal, knio, mavericks, pyrex, sh, irie, seirdy, sq, stratum, WeEatnKid, dieforirc, tater, buttvomit, luldangs, MichealK, AnalMan, poccri, vap0r, kakama, fregyXin, kayos, stovepipe, higgs, Audasity, PsyMaster, perplexa, alyosha, Darn, efsenable, EchoShun, dumbguy, HorseCrusherKristian, phobos

# Current Features

* Tabbed ASCII editing
* Layers support
  * Show and hide layers
  * Change layer order
  * Double click to rename layer
  * Context menu for layers
* Copy and paste ASCII blocks between tabs with the select tool
* Remembers state on refresh and when the browser loads, can also export the state to a file and load elsewhere.
  * So you never lose your ascii art!
  * Saves layers, brushes data also to same file
* Can import from clipboard, load from irc.watch/ascii, load from file
* Can export mirc ascii to clipboard, file or HTTP POST
* 99 Colour support
* Swap fg and bg colours with button click or Alt + r
* Mirror X and Y
* Grid mode with Alt + g
* Undo and redo with Ctrl + z and Ctrl + y, undos are set to a limit of 200 at the moment.
* Fg, Bg and Char boxes to filter when using certain tools
  * For example filling with Char unchecked will ignore characters when filling
  * If you want to remove the background but keep the text, uncheck FG and Char and eraser the bg only.
* Image overlay to trace images
  * Accepts URLs only at the moment
  * Can adjust the size and properties
* Toolbar containing
  * Select, to copy, paste and save blocks as brushes
  * Text mode, with arrow key support
  * Fill background blocks
  * Brush mode, can be controlled with keyboard and mouse
  * Block picker (grab fg, bg and char of a block)
  * Eraser - remove blocks, can be controlled with keyboard and mouse
  * Fill Eraser - Fill remove blocks by bg, fg or char
* Brush Library and History
  * Make circle, square, cross and other brushes by sizes
  * Brush history, can save or re-use old brushes
  * Library - Save most used brushes to library
  * Brush history is set to a limit of 50
* Brush Preview
  * Editable brush preview
  * Can use the brush tool inside the brush preview
  * Can use the eraser tool inside the brush preview
  * Hovering outside brush area will save brush to history
* Context menu available on all brushes preview areas
  * Export any brush to PNG, mIRC clipboard or file by right clicking the brush preview

# Roadmap and Bug To Fixes

* Warning on mirc export if ascii exceeds IRCs 512 per chat line limit.
* Review encodings check on file import - UTF8 vs Latin something
* Colors / chars panels wont open where toolbar is, if you scroll down a lot then try open them they will be at the top
* One of the mirror brushes might be bugged sometimes and leave undoable blocks, if the mirror paths cross over it seems to do this
* The layers and undo sometimes may have bugs, but seems hard to replicate.
* The width and height of the ascii cannot be changed from edit modal, still to do
* Improve image overlay modal
* The current mIRC importer will fail on `C5,` type blocks by discarding the `,` character when it should preserve it. `art.txt` ascii is a good example of this. 98% of txt ascii imported should be fine.

## Mobile / Touch Screen support

Doesn't exist at the moment. While the underlying functions and code is compatible with mobile browsers from *babel*, the touch canvas events and text will need to be reviewed to work better with touch screens. For example while you can brush once, you cannot move the brush around.

# Keyboard Shortcuts

## ASCII Editing

* Ctrl + Z - Undo
* Ctrl + Y - Redo

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

### Layers Related

* Ctrl + Shift + t - Show / Hide Layer
* Ctrl + Shift + r - Rename Layer 
* Ctrl + Shift + a - Add Layer 
* Ctrl + Shift + d - Delete Layer 
* Ctrl + Shift + s - Move Layer Down 
* Ctrl + Shift + w - Move Layer Up 
* Ctrl + Shift + m - Merge All Layers 

# Context Menus (right click menus)

* Right clicking on any brush preview in the main area or library will allow you to export to PNG, txt or clipboard just the brush itself.
* The main ascii has a few export options if you right click on the ascii
* The dashboard area (outside the ascii) was actually the very first menu in asciibird! and has some basic shortcuts
* Layers can also be right clicked to preview their functions

# What Chatters are saying about ASCIIBIRD

```
<ralph> ascii bird is so easy a drunk LQ chatter like myself can use, and does use it
<ralph> asciibird is to chatters what the ak-47 is to kids in Sierra Leone
<ralph> POWERFUL STUF
```

# References

* http://anti.teamidiot.de/static/nei/*/extended_mirc_color_proposal.html - Good for 99 colours info
* https://modern.ircdocs.horse/formatting.html#color - Also really good
* https://www.mirc.com/colors.html
## ASCII Resources
* https://mircart.org/ - IRC ASCII art
* https://asdf.us/asciiblaster/ - Asciiblaster ASCII editor, ASCIIBIRD is loosely based on this
* https://acid.vegas/asciimaker - HTML/JS based ASCII Creator from acidvegas
* https://github.com/ircart/resources - More resources on ASCII and configuring terminals/clients to display ASCII art correctly
* http://wepump.in/ascii/ - Classic IRC ASCII art
* https://irc.watch/ascii/ - IRC ASCIIs you can load into ASCIIBIRD

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
