# ASCIIBIRD - The Worlds Best IRC ASCII Art Editor

ASCIIBIRD is an IRC ascii art editor to create or edit mIRC art, it is most times worked on during live stream. It's 100% client side and created in vue2 and may be migrated to vue3 in the future.

A most latest production build to use is available at https://asciibird.jewbird.live/

To view in detailed help and documentation please see [Help and Documentation](HELP.md)

- [ASCIIBIRD - The Worlds Best IRC ASCII Art Editor](#asciibird---the-worlds-best-irc-ascii-art-editor)
- [Big Shout outs to Patrons](#big-shout-outs-to-patrons)
- [Feature Overview](#feature-overview)
- [Roadmap and Known Bugs](#roadmap-and-known-bugs)
  - [To Be Developed](#to-be-developed)
  - [Known Bugs](#known-bugs)
  - [Mobile / Touch Screen support](#mobile--touch-screen-support)
- [What Chatters are saying about ASCIIBIRD](#what-chatters-are-saying-about-asciibird)
- [References](#references)
- [ASCII Resources](#ascii-resources)
  - [Hello to friends on the IRC](#hello-to-friends-on-the-irc)
- [Project setup](#project-setup)
  - [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)
  - [Compiles and minifies for production](#compiles-and-minifies-for-production)
  - [Lints and fixes files](#lints-and-fixes-files)
  - [Customize configuration](#customize-configuration)


# Big Shout outs to Patrons

> xartet, OfMonsters&Crime, mouse, funkpower, Charles, PP4L, octopus, hotline, dingopride, skg, eraser, chzz, L0j1k, deakin

> special thanks to slime aka botmaster slime for the wonderful bot integration with asciibird

# Feature Overview

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
* Can import from clipboard, load from irc or the web, load from file
* Can export mirc ascii to clipboard, file or HTTP POST
* 99 Colour support
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
* Brush Library and History
  * Make circle, square, cross and other brushes by sizes
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
 * Supports brush only, experimental feature

# Roadmap and Known Bugs

In no particular order, future development goals and bug fixes.

## To Be Developed

* Half block editing mode
* SVG export
* Export options for colour codes. C,00 or C0,00
* SHADING mode, draw shading chars with brush (pressure.js maybe)
* Resize canvas undo
* Unit testing (hahaha)
* More tooltips on other parts, at the moment only Toolbar has tooltips, option to disable tooltips
* Warning on mirc export if ascii exceeds IRCs 512 per chat line limit
* Review encodings check on file import - UTF8 vs Latin something
* More fill tool options? (search / replace, new check boxes to replace what contents)
* Brush blocks larger than 1x1 can leave undoable blocks in mirror mode
* Dark / light modes, different themes
* Expand the brush manager, brush categories, download brushes, import/export brushes
* ASCIIBIRD API ?! - Web api to extend features of asciibird

## Known Bugs

* Bug with hotkey brush switching, if make a new ascii hotkeys are broke - something to do with the hotkey function
* If you drag a panel, then right click you can't drag it anymore
 * Sometimes panels can get stuck
* FLOOD FILL - For now the older recursive function is there, but will hit the recursion limit on larger ASCIIs.
* Editing ascii does not update title
* Fix brush tool for seamless lines when drawing fast
* Context menus inside the panels can be way off sometimes

## Mobile / Touch Screen support

Doesn't exist at the moment. While the underlying functions and code is compatible with mobile browsers from *babel*, the touch canvas events and text will need to be reviewed to work better with touch screens. For example while you can brush once, you cannot move the brush around.

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

## Hello to friends on the IRC

> darkmage, l0de, bex, blarf, sludg, shart, chode, corn, ralph, jrra, kuntz, moony, sniff, scd, aztec, astro, anji, b-rex, bengt, butth0le, canada420, clamkin, deakin, dumbguy, ElBurro, interdome, syn, darkness, vae, gowce, moneytree, Retarded, spoon, sylar, zen, bj0rn, stovepipe, morthrane, chrono, acidvegas, again, hgc, durendal, knio, mavericks, pyrex, sh, irie, seirdy, sq, stratum, WeEatnKid, dieforirc, tater, buttvomit, luldangs, MichealK, AnalMan, poccri, vap0r, kakama, fregyXin, kayos, stovepipe, higgs, Audasity, PsyMaster, perplexa, alyosha, Darn, efsenable, EchoShun, dumbguy, HorseCrusherKristian, phobos, COMPUTERS

# Project setup
```
yarn
```

## Compiles and hot-reloads for development
```
yarn serve
```

## Compiles and minifies for production
```
yarn build
```

## Lints and fixes files
```
yarn lint
```

## Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
