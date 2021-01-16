# ASCIIBIRD

ASCIIBIRD DEVELOPMENT - BORING VUEJS DEV STUFF FOR ASCII CREATION

# FOCUS

* Import / Export code
 * ASCII -> JSON
 * JSON -> ASCII

* Have multiple canvas elements, they can different z-index for the layers.

* Fix up the store, put in code and more shit in there
  * Store colours, tools and any other shit in here

* I added some grid but it is FUCKED

## HOW TO DRAW BLOCKS

* **Plain vanilla Canvas**
* Webgl rendering direct to canvas, three.js webgl
* Render as SVG

# Things To Do Later

 * Sort out the vuex store shit, make it lighter, integrate the methods from Dashboard to there.
 * Keyboard shortcuts

 * Integrate front end library - DONE
 * Tie the ascii Meta Data into tabs / interface - DONE

 * Take a quick look at ASCIIBLASTER, compare code
 * Render the individual blocks
 
 * To import ASCIIs we are going to have to write an ASCII/ANSI -> JSON
 * Then we can reverse it JSON -> ANSI to export
 * Technically we could have our own file format and share the ASCII data in JSON, but also extra information in the JSON.
  * .ASB, all this is gzipped JSON of the internal data structure.
  * While exporting the ascii wont obviously support 'extra fields', we can have a name and description for the ASCIIs.
  * To share the ASCII to another person you can export the JSON and they can load it, along with any extra info outside the original ASCII data.

* Properly get CSS into the JS stuff ya lazy bird

# Ideas and stuff

In 2018 I had started some ASCII creation program in vuejs but really darkmage'd it and never finished it after a few hours of development time.

* Tabbed editing for asciis
* Layers
* Update text colours without deleting the block
* Floating pattlets (or option to fix or non fix them)
* Undo feature
* Undo for brush settings and shit changes
* Insert ASCII as layer
* Overlay image for nance tracing mode
* Insert image to convert to ASCII into a layer
* Support for tdfiglet, toilet, figlet importing

* Animated ASCII (key frames like in flash with sound) (Possible with JSON but it will be FKN memory hog maybe)
 * We could do this, but these custom ASCIIs could only be played in our player

## How to do it

* Two dimensional array of objects,
 * Each object holds the block info

If we can import an ASCII -> two dimensional array -> Export

* TailwindCSS
 * Allows us to use different themes/skins or maybe layouts

## Development Approach

* Start basic project with README.md
* Put in the tailwindCSS shit
* Data structures for the ASCII, two dimensional array shit

# References

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
