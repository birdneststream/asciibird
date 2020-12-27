# ASCIIBIRD

ASCIIBIRD DEVELOPMENT - BORING VUEJS DEV STUFF FOR ASCII CREATION

# Doneish

* Initial data structure which will hold our ASCII informations.
* Added vue-tailwind.com

# Roadmap

 * Integrate front end library 
 * Tie the ascii Meta Data into tabs / interface
 * Take a quick look at ASCIIBLASTER, compare code
 * Render the individual blocks
 * To import ASCIIs we are going to have to write an ASCII/ANSI -> JSON
 * Then we can reverse it JSON -> ANSI to export
 * Technically we could have our own file format and share the ASCII data in JSON, but also extra information in the JSON.
  * .ASB, all this is gzipped JSON of the internal data structure.
  * While exporting the ascii wont obviously support 'extra fields', we can have a name and description for the ASCIIs.
  * To share the ASCII to another person you can export the JSON and they can load it, along with any extra info outside the original ASCII data.

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
