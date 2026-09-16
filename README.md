# ASCIIBIRD - The Worlds Best IRC ASCII Art Editor

ASCIIBIRD is an IRC ascii art editor to create or edit mIRC art, it is most times worked on during live stream. It's 100% client side, built with Vue 3, TypeScript and Vite, and runs entirely in your browser — no server, no accounts.

Desktop only for now — there is no touch or mobile support yet, it's on the list for later.

A most latest production build to use is available at https://asciibird.birdnest.live/ - create cool and fun IRC ascii arts for your ircd MOTD or to share with your chat friends and have a good time!

Support ASCIIBIRD and birdnest streaming by [jumping on our patreon](https://www.patreon.com/birdnestlive)!

To view in detailed help and documentation please see [Help and Documentation](HELP.md)

- [ASCIIBIRD - The Worlds Best IRC ASCII Art Editor](#asciibird---the-worlds-best-irc-ascii-art-editor)
- [Feature Overview](#feature-overview)
- [What Chatters are saying about ASCIIBIRD](#what-chatters-are-saying-about-asciibird)
- [ASCII art created with ASCIIBIRD](#ascii-art-created-with-asciibird)
- [References](#references)
- [ASCII Resources](#ascii-resources)
- [Project setup](#project-setup)
  - [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)
  - [Compiles and minifies for production](#compiles-and-minifies-for-production)
  - [Runs the unit tests](#runs-the-unit-tests)
  - [Lints and fixes files](#lints-and-fixes-files)

# Feature Overview

* Tabbed ASCII editing
  * Double click a tab title to rename it
* Layers support
  * Show and hide layers
  * Change layer order
  * Double click to rename layer
  * Merge down and duplicate layers
  * Context menu for layers
* Copy and paste ASCII blocks between tabs with the select tool
  * Paste mode with a semi-transparent ghost preview of the blocks
  * Rotate and flip selections, nudge with Shift + arrows
* Remembers state on refresh and when the browser loads, can also export the state to a file and load elsewhere.
  * So you never lose your ascii art!
  * Saves layers, brushes data also to same file
* Can import from clipboard or file - mIRC text and ANSI art files
* Can export mirc ascii to clipboard, file or HTTP POST, plus ANSI, HTML and plain text exports
* 99 Colour support with a recent colours strip (last 12, persisted)
* Swap fg and bg colours with button click or Alt + r
* Mirror X and Y
* Grid mode with Alt + g
* Undo and redo with Ctrl + z and Ctrl + y, can specify undo limit in options.
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
  * ReColour - replace a colour picked from a block across the canvas or selection
  * Gradient tools - vertical, horizontal and corner gradients, each tool locks its
    direction, colours run from FG where you click to BG where you release
  * Shapes - line, rectangle outline/filled and ellipse outline/filled, with Shift
    (1:1) and Alt (from centre) constraints while drawing
* Live block previews when drawing shapes and gradients
  * The preview shows the exact blocks that will be drawn, ghosted over the canvas
* Brush Library and History
  * 18 brush shapes - circle, square, cross, grid, diamond, ring, star, frame,
    triangles, diagonals, checkerboard and more, by sizes
  * Brush history, can save or re-use old brushes
  * Library - Save most used brushes to library
  * Brush history is set to a limit of 50, can be changed in options.
* Brush Preview
  * Editable brush preview
  * Can use the brush tool inside the brush preview
  * Can use the eraser tool inside the brush preview
  * Hovering outside brush area will save brush to history
* Context menu available on all brushes preview areas
  * Export any brush to PNG, mIRC clipboard or file by right clicking the brush preview
* Half block editing mode
  * Brush, eraser, fill, picker, select and shapes all work at half resolution
  * Tools that cannot work in half block mode are disabled in the toolbar
* Find and Replace across the canvas or selection
* Border and frame generator - single, double, rounded, thick, block, hash and
  star styles, or fully custom characters
* Crop to content - trim the canvas to the actual art
* IRC line length warning in the status bar (yellow over 400 bytes, red over 500)
* In-app help and shortcuts reference (F1)
* Single key tool shortcuts (B brush, S select, T text, F fill, E eraser, R recolour, L shapes) and Alt + 1-8
* 1800+ unit tests, because even ascii editors deserve them

# What Chatters are saying about ASCIIBIRD

```
<ralph> ascii bird is so easy a drunk LQ chatter like myself can use, and does use it
<ralph> asciibird is to chatters what the ak-47 is to kids in Sierra Leone
<ralph> POWERFUL STUF
```

```
<kayos> man asciibird is legit revolutionary shit
<kayos> shouts birds 
```

```
<chunky> asciibird is the best get high all the time
```

```
<totally_real_nick> asciibird made me quit my job leave my wife an kids and realize my true calling as a groupie furry lot lizard at vocaloid hologram anime concerts. now i go on tour and my life has never been more full of yiffing. thanks asciibird!
```

```
<mr-spambot> fuck slime lion
<mr-spambot> i had no owldea howl good dat editor was
<mr-spambot> like u can drowl on two fuckin sides at once
<mr-spambot> it is the vim of head art
<sansGato> its cool dat asciibird u can just do like half the picture because u have that mirror thing
<sansGato> its fuckin owlsome
<sansGato> It was like I was using nanowl the whole time, i find asciibird then I am deep in the head of neowlvim
<sansGato> its like i was using boring i3, and THEN i find asciibird and I am deep in the dwm with st and dmenu !!
<sansGato> dw1 make jbird lion head admin
<sansGato> there i said it
<sansGato> !op slime lion as head admin
```

```
<chzz> asciibird is the therac-25 of ascii editors
```

```
<rebird> <g> im a changed man since ive been using asciibird
<rebird> <g> i hope you are too!
```

```
<higgs> asciibird changed my life.
```

```
<acidvegas> ngl ive seen asciibird on github
<acidvegas> hella
<acidvegas> first time using it
<acidvegas> rn
<acidvegas> this is v impressive jewbird 
<acidvegas> props
* acidvegas throws jewbird an ice cold   BUD c =)
<jewbird> cool
<jewbird> thx
<acidvegas> beautiful design
<acidvegas> looks very
<acidvegas> iOS circa 2015
<acidvegas> classic
```

# ASCII art created with ASCIIBIRD

Already there have been hundreds of new mIRC ascii arts created with asciibird! Here are just a few from our pal *chzz*.

![fraidnobully.png](https://classic.birdnest.live/docs/fraidnobully.png)
![hoodie.png](https://classic.birdnest.live/docs/hoodie.png)
![mediation.png](https://classic.birdnest.live/docs/mediation.png)
![bullyfreechat.png](https://classic.birdnest.live/docs/bullyfreechat.png)
![midiweekend.png](https://classic.birdnest.live/docs/midiweekend.png)
![chzz-dimension-noose.png](https://classic.birdnest.live/docs/chzz-dimension-noose.png)

# References

* http://anti.teamidiot.de/static/nei/*/extended_mirc_color_proposal.html - Good for 99 colours info
* https://modern.ircdocs.horse/formatting.html#color - Also really good
* https://www.mirc.com/colors.html - defacto standard for mIRC colours and art
* https://www.oocities.org/spunk1111/history.htm - The history of ASCII art by Joan Stark (jgs) aka spunk

# ASCII Resources

* https://mircart.org/ - IRC ASCII art
* https://asdf.us/asciiblaster/ - Asciiblaster ASCII editor, ASCIIBIRD is loosely based on this
* https://acid.vegas/asciimaker - HTML/JS based ASCII Creator from acidvegas
* https://github.com/ircart/resources - More resources on ASCII and configuring terminals/clients to display ASCII art correctly
* http://wepump.in/ascii/ - Classic IRC ASCII art
* https://irc.watch/ascii/ - IRC ASCIIs you can load into ASCIIBIRD

# Project setup
```
yarn install
```

## Compiles and hot-reloads for development
```
yarn dev
```

## Compiles and minifies for production
```
yarn build
```

## Runs the unit tests
```
yarn test
```

## Lints and fixes files
```
yarn lint
```
