import LZString from 'lz-string';
import store from './store';

// 0  => 'white',
// 1  => 'black',
// 2  => 'navy',
// 3  => 'green',
// 4  => 'red',
// 5  => 'brown',
// 6  => 'purple',
// 7  => 'olive',
// 8  => 'yellow',                  # dark yellow
// 9  => 'lime',                  # ltgreen
// 10 => 'teal',
// 11 => 'cyan',
// 12 => 'blue',                  # ltblue,
// 13 => 'fuchsia',                  # pink
// 14 => 'grey',
// 15 => 'lightgrey',
export const mircColours99 = [
  'rgb(255,255,255)',
  'rgb(0,0,0)',
  'rgb(0,0,127)',
  'rgb(0,147,0)',
  'rgb(255,0,0)',
  'rgb(127,0,0)',
  'rgb(156,0,156)',
  'rgb(252,127,0)',
  'rgb(255,255,0)',
  'rgb(0,252,0)',
  'rgb(0,147,147)',
  'rgb(0,255,255)',
  'rgb(0,0,252)',
  'rgb(255,0,255)',
  'rgb(127,127,127)',
  'rgb(210,210,210)',

  "#470000",
  "#472100",
  "#474700",
  "#324700",
  "#004700",
  "#00472c",
  "#004747",
  "#002747",
  "#000047",
  "#2e0047",
  "#470047",
  "#47002a",
  "#740000",
  "#743a00",
  "#747400",
  "#517400",
  "#007400",
  "#007449",
  "#007474",
  "#004074",
  "#000074",
  "#4b0074",
  "#740074",
  "#740045",
  "#b50000",
  "#b56300",
  "#b5b500",
  "#7db500",
  "#00b500",
  "#00b571",
  "#00b5b5",
  "#0063b5",
  "#0000b5",
  "#7500b5",
  "#b500b5",
  "#b5006b",
  "#ff0000",
  "#ff8c00",
  "#ffff00",
  "#b2ff00",
  "#00ff00",
  "#00ffa0",
  "#00ffff",
  "#008cff",
  "#0000ff",
  "#a500ff",
  "#ff00ff",
  "#ff0098",
  "#ff5959",
  "#ffb459",
  "#ffff71",
  "#cfff60",
  "#6fff6f",
  "#65ffc9",
  "#6dffff",
  "#59b4ff",
  "#5959ff",
  "#c459ff",
  "#ff66ff",
  "#ff59bc",
  "#ff9c9c",
  "#ffd39c",
  "#ffff9c",
  "#e2ff9c",
  "#9cff9c",
  "#9cffdb",
  "#9cffff",
  "#9cd3ff",
  "#9c9cff",
  "#dc9cff",
  "#ff9cff",
  "#ff94d3",
  "#000000",
  "#131313",
  "#282828",
  "#363636",
  "#4d4d4d",
  "#656565",
  "#818181",
  "#9f9f9f",
  "#bcbcbc",
  "#e2e2e2",
  "#ffffff",
];

// How big the brush size can get
export const maxBrushSize = 15;

// Chars that end up in the toolbar
export const charCodes = [' ', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-',
  '.', '/',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?', '@', 'A',
  'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
  'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_', '`', 'a', 'b', 'c', 'd', 'e',
  'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w',
  'x', 'y', 'z', '{', '|', '}', '~', 'Ç', 'ü', 'é', 'â', 'ä', 'à', 'å', 'ç', 'ê', 'ë', 'è',
  'ï', 'î', 'ì', 'Ä', 'Å', 'É', 'æ', 'Æ', 'ô', 'ö', 'ò', 'û', 'ù', 'ÿ', 'Ö', 'Ü', 'ø', '£',
  'Ø', '×', 'ƒ', 'á', 'í', 'ó', 'ú', 'ñ', 'Ñ', 'ª', 'º', '¿', '®', '¬', '½', '¼', '¡', '«',
  '»', 'Á', 'Â', 'À', '©', '¢', '¥', 'ã', 'Ã', '¤', 'ð', 'Ð', 'Ê', 'Ë', 'È', 'ı', 'Í', 'Î',
  'Ï', '¦', 'Ì', 'Ó', 'ß', 'Ô', 'Ò', 'õ', 'Õ', 'µ', 'þ', 'Þ', 'Ú', 'Û', 'Ù', 'ý', 'Ý', '¸',
  '°', '¨', '·', '¯', '´', '≡', '±', '‗', '¶', '§', '÷',
  '⁰', '¹', '³', '²', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁺', '⁻', '⁼', '⁽', '⁾',
  '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉', '₊', '₋', '₌', '₍', '₎',
  '¼', '½', '¾', '⅓', '⅔', '⅕', '⅖', '⅗', '⅘', '⅙', '⅚', '⅛', '⅜', '⅝', '⅞',
  '└', '┐', '┘', '┌', '│', '┤', '├', '┴', '┬', '─', '┼',
  '╚', '╗', '╝', '╔', '║', '╣', '╠', '╩', '╦', '═', '╬',
  '╰', '╮', '╯', '╭', '╱', '╲', '╳',
  '▘', '▖', '▝', '▗', '▚',
  '▏', '▎', '▍', '▌', '▋', '▊', '▉',
  '▁', '▂', '▃', '▄', '▅', '▆', '▇', '▀', '▔', '░', '▒', '▓', '█',
];

// Toolbar icons
export const toolbarIcons = [{
    name: 'default',
    icon: 'mouse-pointer',
    fa: 'fas',
  },
  {
    name: 'select',
    icon: 'square',
    fa: 'far',
  },
  {
    name: 'text',
    icon: 'font',
    fa: 'fas',
  },
  {
    name: 'fill',
    icon: 'fill-drip',
    fa: 'fas',
  },
  {
    name: 'brush',
    icon: 'paint-brush',
    fa: 'fas',
  },
  {
    name: 'dropper',
    icon: 'eye-dropper',
    fa: 'fas',
  },
  {
    name: 'eraser',
    icon: 'eraser',
    fa: 'fas',
  },
  {
    name: 'fill-eraser',
    icon: 'fill',
    fa: 'fas',
  },
];

export const emptyBlock = {
  bg: null,
  fg: null,
  char: null,
};

export const create2DArray = (rows) => {
  const arr = [];

  for (let i = 0; i < rows; i++) {
    arr[i] = [];
  }

  return arr;
};

// Width and height of the ASCII blocks
// they seem to be 8x15 in asciiblaster
export const blockWidth = 8;
export const blockHeight = 15;

// Limits for undo and brush histories
export const maxBrushHistory = 200;
export const maxUndoHistory = 200;
export const tabLimit = 20;

export const parseMircAscii = async (content, title) => {
  const MIRC_MAX_COLOURS = mircColours99.length;

  // The current state of the Colours
  let curBlock = {
    ...emptyBlock,
  };

  const contents = content;
  const filename = title;

  // set asciiImport as the entire file contents as a string
  const asciiImport = contents
    .split('\u0003\u0003')
    .join('\u0003')
    .split('\u000F').join('')
    .split('\u0003\n')
    .join('\n')
    .split('\u0002\u0003')
    .join('\u0003');

  // This will end up in the asciibirdMeta
  const finalAscii = {
    title: filename,
    // key: store.getters.nextTabValue,
    // blockWidth: blockWidth * store.getters.blockSizeMultiplier,
    // blockHeight: blockHeight * store.getters.blockSizeMultiplier,
    blocks: [{
      label: filename,
      visible: true,
      data: create2DArray(asciiImport.split('\n').length),
      width: false, // defined in: switch (curChar) case "\n":
      height: asciiImport.split('\n').length,
    }],
    history: [],
    redo: [],
    imageOverlay: {
      url: null,
      opacity: 95,
      position: 'centered',
      size: 100,
      repeatx: true,
      repeaty: true,
      visible: false,
      stretched: false,
    },
    x: blockWidth * 35, // the dragable ascii canvas x
    y: blockHeight * 2, // the dragable ascii canvas y
    selectedLayer: 0,
  };

  // Turn the entire ascii string into an array
  let asciiStringArray = asciiImport.split('');
  const linesArray = asciiImport.split('\n');

  // The proper X and Y value of the block inside the ASCII
  let asciiX = 0;
  let asciiY = 0;

  // used to determine colours
  let colourChar1 = null;
  let colourChar2 = null;
  let parsedColour = null;

  // This variable just counts the amount of colour and char codes to minus
  // to get the real width
  let widthOfColCodes = 0;

  // Better for colourful asciis
  let maxWidthLoop = 0;

  // Used before the loop, better for plain text
  let maxWidthFound = 0;

  for (let i = 0; i < linesArray.length; i++) {
    if (linesArray[i].length > maxWidthFound) {
      maxWidthFound = linesArray[i].length;
    }
  }

  while (asciiStringArray.length) {
    const curChar = asciiStringArray[0];

    // Defining a small finite state machine
    // to detect the colour code
    switch (curChar) {
      case '\n':
        // Reset the colours here on a new line
        curBlock = {
          ...emptyBlock,
        };

        if (linesArray[asciiY] && linesArray[asciiY].length > maxWidthLoop) {
          maxWidthLoop = linesArray[asciiY].length;
        }

        // the Y value of the ascii
        asciiY++;

        // Calculate widths mirc asciis vs plain text
        if (!finalAscii.blocks[0].width && widthOfColCodes > 0) {
          finalAscii.blocks[0].width = maxWidthLoop - widthOfColCodes;
        }

        if (!finalAscii.blocks[0].width && widthOfColCodes === 0) {
          // Plain text
          finalAscii.blocks[0].width = maxWidthFound;
        }

        // Resets the X value
        asciiX = 0;

        asciiStringArray.shift();
        widthOfColCodes = 0;
        break;

      case '\u0003':
        // Remove the colour char
        asciiStringArray.shift();
        widthOfColCodes++;

        // Attempt to work out bg
        colourChar1 = `${asciiStringArray[0]}`;
        colourChar2 = `${asciiStringArray[1]}`;
        parsedColour = parseInt(`${colourChar1}${colourChar2}`);

        // Work out the 01, 02 double digit codes
        if (parseInt(colourChar1) === 0 && parseInt(colourChar2) >= 0) {
          asciiStringArray.shift();
        }

        if (Number.isNaN(parsedColour)) {
          curBlock.bg = parseInt(colourChar1);
          widthOfColCodes += 1;
          asciiStringArray.shift();
        } else if (parsedColour <= MIRC_MAX_COLOURS && parsedColour >= 0) {
          curBlock.fg = parseInt(parsedColour);
          widthOfColCodes += parsedColour.toString().length;

          asciiStringArray = asciiStringArray.slice(
            parsedColour.toString().length,
            asciiStringArray.length,
          );
        }

        // No background colour
        if (asciiStringArray[0] !== ',') {
          break;
        } else {
          // Remove , from array
          widthOfColCodes += 1;
          asciiStringArray.shift();
        }

        // Attempt to work out bg
        colourChar1 = `${asciiStringArray[0]}`;
        colourChar2 = `${asciiStringArray[1]}`;
        parsedColour = parseInt(`${colourChar1}${colourChar2}`);

        if (
          !Number.isNaN(colourChar1) &&
          !Number.isNaN(colourChar2) &&
          parseInt(colourChar2) > parseInt(colourChar1) &&
          !Number.isNaN(parsedColour) &&
          parseInt(parsedColour) < 10
        ) {
          parsedColour = parseInt(colourChar2);
          widthOfColCodes += 1;
          asciiStringArray.shift();
        }

        if (
          parseInt(colourChar2) === parseInt(colourChar1) &&
          parseInt(parsedColour) < 10
        ) {
          parsedColour = parseInt(colourChar1);
          asciiStringArray.shift();
          asciiStringArray.shift();
          widthOfColCodes += 2;

          curBlock.bg = parseInt(colourChar1);

          break;
        }

        if (Number.isNaN(parsedColour)) {
          curBlock.bg = parseInt(colourChar1);
          widthOfColCodes += 1;
          asciiStringArray.shift();
        } else if (parsedColour <= MIRC_MAX_COLOURS && parsedColour >= 0) {
          curBlock.bg = parseInt(parsedColour);
          widthOfColCodes += parsedColour.toString().length;

          asciiStringArray = asciiStringArray.slice(
            parsedColour.toString().length,
            asciiStringArray.length,
          );

          break;
        }

        break;

      default:
        curBlock.char = curChar;
        asciiStringArray.shift();
        asciiX++;

        finalAscii.blocks[0].data[asciiY][asciiX - 1] = {
          ...curBlock,
        };
        break;
    } // End Switch
  } // End loop charPos

  finalAscii.blocks = [...fillNullBlocks(finalAscii.blocks[0].height, finalAscii.blocks[0]
    .width, finalAscii.blocks)];
  // Store the ASCII and ensure we have no null blocks
  finalAscii.blocks = LZString.compressToUTF16(
    JSON.stringify(finalAscii.blocks),
  );

  // We need to also store in the first undo history the original state
  finalAscii.history.push(finalAscii.blocks);

  // Save ASCII to storage
  store.commit('newAsciibirdMeta', finalAscii);

  return true;
};

// Creates new blank ASCII
export const createNewAscii = (forms) => {
  const newAscii = {
    title: forms.createAscii.title,
    history: [],
    redo: [],
    x: 247, // the dragable ascii canvas x
    y: 24, // the dragable ascii canvas y
    blocks: [{
      label: forms.createAscii.title,
      visible: true,
      data: create2DArray(forms.createAscii.height),
      width: forms.createAscii.width,
      height: forms.createAscii.height,
    }],
    imageOverlay: {
      url: null,
      opacity: 95,
      position: 'centered',
      size: 100,
      repeatx: true,
      repeaty: true,
      visible: false,
      stretched: false,
    },
    selectedLayer: 0,
  };

  // Push all the default ASCII blocks
  for (let x = 0; x < newAscii.blocks[0].width; x++) {
    for (let y = 0; y < newAscii.blocks[0].height; y++) {
      newAscii.blocks[0].data[y].push({
        ...emptyBlock,
      });
    }
  }

  newAscii.blocks = LZString.compressToUTF16(JSON.stringify(newAscii.blocks));
  newAscii.history.push(newAscii.blocks);
  store.commit('newAsciibirdMeta', newAscii);
  store.commit('closeModal', 'new-ascii');

  return true;
};

// Converts ASCIIBIRD blocks to mIRC colours
export const exportMirc = () => {
  const {
    currentAscii
  } = store.getters;

  const {
    currentAsciiLayersWidthHeight
  } = store.getters;

  const blocks = mergeLayers();
  const output = [];
  let curBlock = false;
  let pushString = '';

  let prevBlock = {
    bg: -1,
    fg: -1
  };

  for (let y = 0; y <= currentAsciiLayersWidthHeight.height - 1; y++) {

    for (let x = 0; x <= currentAsciiLayersWidthHeight.width - 1; x++) {
      curBlock = {
        ...blocks[y][x]
      };

      // If we have a difference between our previous block
      // we'll put a colour codes and continue as normal
      if (curBlock.bg !== prevBlock.bg || curBlock.fg !== prevBlock.fg) {
        curBlock = {
          ...blocks[y][x]
        };
        const zeroPad = (num, places) => String(num).padStart(places, '0');

        if (curBlock.fg === null && curBlock.bg === null) {
          output.push('\u0003');
        } else {

          if (curBlock.bg === null && curBlock.fg !== null) {
            pushString = `\u0003\u0003${zeroPad(curBlock.fg, 2)}`;
          }

          if (curBlock.bg !== null && curBlock.fg !== null) {
            pushString = `\u0003${zeroPad(curBlock.fg, 2)},${zeroPad(curBlock.bg, 2)}`;
          }

          if (curBlock.bg !== null && curBlock.fg === null) {
            pushString = `\u000300,${zeroPad(curBlock.bg, 2)}`;
          }

          output.push(pushString);
        }

      }

      // null .chars will end up as space
      output.push(curBlock.char ?? ' ');
      prevBlock = {
        ...blocks[y][x]
      };
    }

    // We can never have a -1 colour code so we'll always
    // write one at the start of each line
    prevBlock = {
      bg: -1,
      fg: -1
    };

    // New line except for the very last line
    if (blocks[y] && y < blocks[y].length - 1) {
      output.push('\n');
    }
  }

  // Download to a txt file
  // Check if txt already exists and append it
  const filename = currentAscii.title.slice(currentAscii.title.length - 3) === 'txt' ?
    currentAscii.title :
    `${currentAscii.title}.txt`;

  return {
    filename,
    output
  }
}

// Download a string to a file with a filename
export const downloadFile = (content, filename, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], {
    type: contentType
  });

  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
};

export const checkForGetRequest = async () => {
  const asciiUrlCdn = new URL(location.href).searchParams.get('ascii');
  if (asciiUrlCdn) {
    const res = await fetch(`https://ascii.jewbird.live/${asciiUrlCdn}`, {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
      },
    });

    const asciiData = await res.text();
    parseMircAscii(asciiData, asciiUrlCdn);
    return;
  }

  const asciiUrl = new URL(location.href).searchParams.get('ircwatch');
  if (asciiUrl) {
    const res = await fetch(`https://irc.watch/ascii/txt/${asciiUrl}`, {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
      },
    });

    const asciiData = await res.text();
    parseMircAscii(asciiData, asciiUrl);
    return;
  }

  const haxAscii = new URL(location.href).searchParams.get('haxAscii');
  if (haxAscii) {
    const res = await fetch(`https://art.h4x.life/${haxAscii}`, {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
      },
    });

    // Considers paths
    const asciiName = haxAscii.split('/').pop();
    const asciiData = await res.text();
    parseMircAscii(asciiData, asciiName);
  }
}

// Hashing algo to detect duplicate brushes
// from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
export const cyrb53 = function (str, seed = 1337) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

// Mostly plain text asciis wont have all their blocks
// so this will fix that
export const fillNullBlocks = function (height, width, layerData = null) {
  // Probably used on irc import to make the blocks proper,
  // especially with plain text ascii

  if (layerData === null) {
    var layers = [...store.getters.currentAsciiLayers]
  } else {
    var layers = [...layerData]
  }

  for (let i = 0; i <= layers.length - 1; i++) {
    let blocks = layers[i].data;

    for (let y = 0; y < height; y++) {
      // New row
      if (!blocks[y]) {
        blocks[y] = [];
        for (let x = 0; x < width; x++) {
          blocks[y][x] = {
            ...emptyBlock
          };
        }
      } else {
        // no new rows but new cols
        for (let x = 0; x < width; x++) {
          if (blocks[y] && !blocks[y][x]) {
            blocks[y][x] = {
              ...emptyBlock
            };
          }
        }
      }
    }

    // Update layer with new blocks
    layers[i].data = [...blocks]
    layers[i].width = width
    layers[i].height = height
  }

  return layers
}

// Sometimes if we copy blocks the initial Y values will be null
// and cause an error when trying to calculate width
// So we get the longest x length
export const getBlocksWidth = function (blocks) {
  let maxWidth = 0;

  for (let y = 0; y < blocks.length; y++) {
    if (!blocks[y]) {
      continue
    }

    if (blocks[y] && blocks[y].length > maxWidth) {
      maxWidth = blocks[y].length
    }
  }

  return maxWidth
}

// This removes the null blocks from our copy and paste
// to make sure it's centered better
export const filterNullBlocks = function (blocks) {
  let newBlocks = [];
  let y;

  blocks = blocks.filter(function (item) {
    return item !== null
  });

  for (y = 0; y < blocks.length; y++) {
    newBlocks[y] = (blocks[y].filter(function (item) {
      return item !== null
    }))
  }

  return newBlocks
}

// Function to check if the left and top values are visible on the screen
export const checkVisible = function (bottom, top) {
  var viewHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight
  );
  return !(bottom < 0 || top - viewHeight >= 0);
}


export const mergeLayers = function (blocks = null) {
  let mergedLayers = [];

  // Position of the meta array
  let x = 0;
  let y = 0;
  let z = 0;

  // Draws the actual rectangle
  let canvasX = 0;
  let canvasY = 0;
  let curBlock = null;

  for (y = 0; y < store.getters.currentAsciiLayers[0].height + 1; y++) {
    canvasY = blockHeight * y;

    if (!mergedLayers[y]) {
      mergedLayers[y] = [];
    }

    for (x = 0; x < store.getters.currentAsciiLayers[0].width + 1; x++) {
      canvasX = blockWidth * x;

      curBlock = {
        ...emptyBlock
      };

      // Loop layers
      for (z = store.getters.currentAsciiLayers.length - 1; z >= 0; z--) {

        if (store.getters.currentAsciiLayers[z].visible === false) {
          continue;
        }

        if (
          store.getters.currentAsciiLayers[z] &&
          store.getters.currentAsciiLayers[z].data &&
          store.getters.currentAsciiLayers[z].data[y] &&
          store.getters.currentAsciiLayers[z].data[y][x]
        ) {

          if (curBlock.char === null) {
            curBlock.char = store.getters.currentAsciiLayers[z].data[y][x].char;
          }

          if (curBlock.fg === null) {
            curBlock.fg = store.getters.currentAsciiLayers[z].data[y][x].fg;
          }

          if (curBlock.bg === null) {
            curBlock.bg = store.getters.currentAsciiLayers[z].data[y][x].bg;
          }

          continue;
        }

        break;
      }

      mergedLayers[y][x] = {
        ...curBlock
      }

    }
  }

  return mergedLayers;
}


// Splash screen ascii encoded
export const splashAscii = JSON.parse(LZString.decompressFromEncodedURIComponent(
  "NrDeCICMHNwLgIwBpwDNZwAwoMYAsBDAJ3nAAJwBfJCGeZNDbcfY0i62jB9eZ1knHJUaUbil5ZchQcM5j6EptLZCOouoiV8Vs9V0WMdLGexEGtRqSdVyN4q-1NrzCy5Ke39bnspt7XTV9jATN5IO1rUJdwhw9dMPtDeP9Ei2Co5zt0yM8A2OS-aOyfXISYpPcirO8Ix3KSupTi2rjqr0C2kJrOwu6Ogqr+-MqMvLTS+tSKnKmW3qHMgdGy6caupZHZ5p7BsYbWvs2JpvatyZ3l7bOTjfGZi5uH0+Hbo-v194OF-bXDxY+-1+8z2qxBKzmuwhl3OL2Ozzu31BkKuj1eCK+fx+YKh13RnwBSOhTwJwNxaPhpJxqLhgOxKNhiKxyJhb0JzOJ+KB1MZmPBeMp3IZbLJNKZ-IpdJZJKFrIx7IltKJAqlnMFVAAukgwJLlbqOSq9UqDfrFeLycazXyLeaxda7QqbfbeY6HaKXe6RTyvcL5Z6-d6A76qcHZTL6XKQ5Gw1yI+HpbGE+qk6rDSbLU7XR7A1H42rU6bM-7c4n80bbdnQ3HS2mrVmfdHq8my+mKw287WizmY83O27u02Cxn+1WU+Xne2a4WR42x62J0HZy268We0O24uO9PK0u+zut8P91PD5Pe9vT1KtTqT5vjxuS2ebw+EABWcf1oSAENJBw1AAGkP7Wf8kwAFj-JtQMA8CwKTAB2BpvyTV93wyJD50WVCVxzBDlyyIC1Qg4o8IFAjcKgyCQOg-D4KbDCuysWiZ24N80OLbC91IIjzyETi4QY2QeI2EjbAEo4hP4sjijYik+NPGTb0pQAI0gAwiFjg4NAGTSZS6MjJS5xUwY1MjTS9O0kldJw4StMsijyKo2ziMohz7IpMTSCk3jmMw+jPNM-FzPY7jVJzYyLKPRSrPEkzrLs-SYtImzYqcxKXOoxCfMY+h0rCj5-K48ARI-fKJPiuLoqSkryrKlK1ncjY5IfdcFwa5CB0oK8AualjWtCi932YoyaKy2TXK-JshsCpNxqKybHIpKbaqOer-kMjARvAELKo9fqSQ26Spp7BA1oW9C1oKjIprOyI1OSuFrqyY6UP2oKrDW3a4TW-5tvxN66qexCjrG2a4QuwHnOB1K1SW57JDWwAk0mKh0vspH7Fr+yoVvxQBE0gitkkY+FH0LRiwMcpbGoq24LBpaqwpvhmawY2EH6ZuxmIYFKGDMiV6EZdPGGgJx73xJj4yZ6v0+bWAXIg5tUptF9nTtBlmjiZ2W2b2oWuf5nmRQl4ope86nJFppWKrmoHWYZlX1Y8zWXu18neq60cxbkdq8rXI2D3vT2WL1rI6chonzbWQP2eD23nckGWLCRtb5Y1tCSbhnXxZzMPE68yQ7qq26bd+r3MsLuAc8itVS441PptKingwzyOs4wE20uLmPM8zOOGgT8Gauh1au6roF-dseuC7QpGK6EUejkn0lh9kafCb6q6GkXjJZ6H9OqajpuHbV3vmfu03bGOzu1m7se62TgeEqLefSDX6WI93qxZ8f1-kPvqft8b+Bm6D1uz9UbL3tufH+mZr5gNvm6L+4B37RyAYsKaBsEGALQePLWUCAFJ0wcUeB3smq+1-smd2T4iG+UfD7HG8pYH4KLhgw2WDiZP1Xn3ehxQL7wBJvVThJcWFMPbg6SBHDB7gIyogVW4d87AJ3vARW0Cy6bUrrBaRS9ZESJAZGOhGj1HILEWFNuDcKGGMvsYxBgsGFaP0bjfhIiW6WJJNokxf9bFZF4RYlcsD3GuMRj42QvDuH-2YYwux+99bWPkrPB6K8raLA3gsWhESCRIx4UkzewZvEhIoXozmWSR5sJ0aE4JqCBG8XkeXVR68LYz0-jmTJJS6wTxvtg4hzi1FXzqWkgp8dqGdWIY1QqHBSFUMdvJAZq5ek9jWrlIx4ipozMtsrJB1TlmxOEW4rpgwmmSybPE0Z4Bol5NkIc7OlSYlLKqbEy5FzzlH3sY025tgUEYD2TXUgCyZEPI-js+5Zj0EdI0kkgq2zwkqPUdMzZYSsgfNWcQiFvy5kNBhedYu8KWnZKRZCqRuiVnXLuei3x3zQUVPBZihFYV5nHxdOsp5WK3Ago2YfXOiyzY9yWSk8p2KvmnJ+SSuFZKCW80eQvOlsyDGIOFnvLlHdhUP0mfK-Z5CBjDMIQq12SrsqooFdKxFaxkV+NkuYg18oaUivJTYolAddlar1aKllzKakHzeaNc1LrBXKPdTQ2VQh6kvJtcUfVRzTyz0upak+1qnVKLdTqxRgihVhv8RG-ltrXUPkpUysKaKY2nnTVC8RWa405qlRSKJSb8VRoOVXUNDSZUJtIL6rh-roV2utimvN1LcFWtTZ9b160W3tL+Q4uRzTs1errT6st+btWFrHTy4lApS0KLckkk5TFcXGuSb2htlDVWKoVSqwZaqOoaqdsmgNVdV0uLbaO58Rqg0ms7bSjNy6tlbsneK4uIb30vr5eWktZyaYAeNkBl+Nz723v+RQzl1VJIXrg2C2DCG-1stZaY8RbSMgFrzlcjdB070w2ndhsDNb0P4f7temDyHBIgeHZG-9dGiNUcdYh9tHqb14abbYQNc7UOfMHQCgjpSNiLt-Vx-tHj+O1sE-O+jLGBS5vk5x2Q3HyNyco+Gpd0b1PHO-VpxjGnWMTU9X0ih4zurHs1NqCze6bPqqPR7ezZDHMjLs7Z6zrmPPua8w5tzPnPN+e8053zQX-MhcCy58Lu7QsRYC7FsLcWYvxaS4llLUXIuHuC6ljL0W0sJdy8l-LWWJmZcK6V7L6Xis5fK3l6rBXatFfMzVyrFXGt1ea011rIyD3tba51srPWGsuxa0NjrI3etjcG7uUbU3xszcmwQ+r-W+uLZWwNpbE2moACVekAEtemwH2XgXpAAXZzTUcC9IADa7d6Rd-ZABrM7hVTv7IAPZPeLAAZxO70ggvSSD7Je67AAhB95ba3Vvg6hxtyHMOIfw+h3N9bSPYco4R3DxHC30do8x3eZHWPcc7oy91wnZmMfk5xxTgnVO8eo+p5Thn9Ome0+x8zonrOWek+LmTxnnOafs65+onnbPhd895wL-nouJfi6l7L7n8uhcK-6Ur0zKvxFy8V5r5XWvVc6-V2rzVevDfa5N7r03+ujenrN9bi35vjc2-t7bh3YQSeS4N1bp3nvHfe49z7sZ7v-eW8D3b33ofg-O-D17sPJmo+R79zH+PJ64-R6TwnlPYO3dB7T8nnP2e8+p4LxnmXAf89F5FyXwvJW6di-L1nyvVWOfS9ryH3P9fhvF7r2Xmv3em+Jldx3lvpeq8oQ+A9ZgkgACcxa4RT-URh3D4mF-dsX+Bjjc+yPsMk6RyD2-1874-Z34fgvB9t+m83iPQ+G-H4v6f2bbP5+r5XyRg-rSN+FK3y-j-hr9-f733-1-P+8kD+z+v+AB-+X+QBb+wBa64B6Go+Pw4+GAs+MmM+rc8BewiB8AyBWQzyPeGuJ++6VmZ+eBFeXecA2BDq6EHw1a3AUuCAAATIRnVIwRRrxCwcRrQeuuBjQfQAwBcpgYgHwbxuhEIQZuzKIQYuwUxuhFIWJoMCwdHLIbGrxNQUCgsAodwBIWxj4AIQgFoUZuITRr3sYfgTfmQaYbHpfu3ufpYbfvNiQXPkoT+uzE4UICpvQK4dXOzKoamjwYIbiikvoV4dJEEZev4Y4aohoR4dPswVwdHD4cZn4XoXEZoSkZvrvq0p4WEQwUwfAFEYgJ4UkQkTegVPkckVcroUEUkaETREET2BQcoXVMUdJFLg0doSoWkSYaQUfqOP3jYYnuYchLoZIiEbkSIe+GUZ4YvJMTEYtIUTRPMYhM0WKu0TAdHFUbUUYeUXWDMaHOodLJ4bge-hkRARBrAZ-rYYMYflfpngQT0QPmYfcf0enk8bTrsXgvsfRIcQsZ0TkThl8b8csZwQCQxnVEEe4eEWAZkb8YsZDECXxpQQgJUQEdLBsYhDUeiRMQcawvIdibyuxk-jAVCacWvsSW6MMb8eCZsSxBSf8esWMY3hYQMTZn0Q4XcTceLn8eehgRukkYgu8YypUAKfksvqKcZqSUWLoVkQgbyf2sKYmriSCR8f9FsVAW-tKYhJ4cirSRwWyY8Ryc8a3lceydYXqZca8V0dcRYPKfWp8YoTieKYSekRcZIQyTqcIRJg6DaROoqfaXsWKQSQGTOqSFKZUu6YiUvkKXiUUm4N6XAjRADEGSsfJBqZDFqTKdwU6QUW6bKUmbEawcCSAQYcQZaSaT5qyaWfqaacYbCS4TCcXLWRSI2cmWcWSS6bJM2fmbqdmecaeJ2YtNBmwfWXSdwP2TIb8W-kyS8QaWacyTOZWeafOVOUaRacuQ+GORkBuZGYGY6XmXMcOd2VyRQluUqR6dGWeaeRGZeY0fuSOdEXecce2ZAQ2b8YOV2ReX6YeSeZ+R+USSSU2N+aOQececBVeQ8YudWZeEQXfrOdOZBd0UuQhfBVaSWWuXYfjrBSuYhShTBQuXOTuQRcGRKScSRU+a2f+XuQOqRaARRbuXRYRS2cRWRUxTRdRc+ThfYXhXBahUhTxRxRhVxVhchWWbhWhcaVWXxSJV1tBZxWJaubxaJQpbJUpQJXJdhVJapSpdXoJVYZJRJUOaCbedyWmYCROZSSifRGiZDBidZa3OmZqQyeeWBcCYeSMbxFZekMiQ+dsdIShHUQBaBTeeOQWUZc2r4dSd2WpcJVkAACq9Lbb7IACa4ltgAAcr0gAPK9IADqKVsgAAYplfFXlaQIVfsgla7AAKK9LVX7Kg7yX8XaVRV6XKoyWaWNWMlaWdUdXX4QUtX4X9XcWKU9W3H6XKUjUo5xnTFOWyBHFHnOX3lfmmUVEzXOGjEhXjFoRTV2lAX4nSSAWLW-n0DwlUVBWoT0neU2WGG9nsU7GrXfy+m7UoFobMUlVCWDXvXDUaVNVdW9UDVfVjXtXfXdXA1-VDXSXXjjXFAABUOVRV5VvSAAMr0gACK9IADKb14AAAQjVRjb0nFfsrDQ1aDaNX1QDeTVDYDT9VtfdeALwttZRZ6a9UzXTdqbmfRbGXTQzXTU4mqYAeReSXTWPhzQxS9axS6HGTzdeXKqzY-vsn9vst9vsndq7Htvsura7JADdvsgDq7AACa9IAB0vSAAVr0gAKa9IADuvS2tGt-2vSht+yJt+y12Dt+yAAbpbdQgAHYACul2l2oyAdQdIdgdwdYsodkdAU0dLJbVNNpN4FsgxNrsAAksVfsgAMJY0ACCmdrshNrsqd0VlNQN1NINFdYNn1VNZdiwB1cADd0BzpEtrdQBTdHdL5D5Td-NN1gtrp3lndfdLFKZr5Zlw9WN6FidVdZN-1tdc95dddldS91dulFNC909K9vRCdy9G9u94NTUJdeUtVrsaN+yGd+yRdHUWVCNRNk999JNM9ydB9m9e9q9U9+9Ndi9b9s9L9n9a989f979D96lT9hpAD39QDv9X9r9UDz9MD-9H9wDj9W98DEDsDMQFZzV69cD4DSD0D6DiDIDpdP9nJvdbZbd-dlDI9VDt1tFYtCJLNnNjFWZzdj5sk6BowAhbRQgRxPDtDAjNDQjrD5D9DRFIjAtwjctRZgjEjE90jf5bFsjCjmFhDyDoDqDeDxDH1aj29kNkDCD6jJDuDqj+DaDZjWjKDpDT1vlbNO1h1C1iAJ1zNqxeRqJuKXlh5V1610JG1KE9lJl3lzjotXNllHj7jl1Wx-lSY-DRRy1xCQ9S1fjdj4VmJkTERhlwVxl1pdNcT3lblGAZRHlOhETXjUTdljlMtbhPxQT49ZTK1YT6TamODhjBDFjpj2jLTuj5jhB+jGD3TljGj1jHTVjJjOl7T4zT2jNUZVTfaSxdTR17DdDSjUjzDhTvN9jPZz1jD1DcjK44ZZ1pTYVtlNJIT7llTF1FDyzktGzj1Djs1ezYjmg0zOTszc1ojKz4mBzrjm12TPjmYLzoTP5T6gTSTh5wTmZewgR5lmTRDozrTPT8LAzIzQzYzUFfTcLqLCLgzxj2LKLuLyLkzSL-wUtmz81ZqkMiZazOzo9sLKTXDZz4t8opLdzWzXa1Lp1uzKjbLchDLkLHL-jOZ-LDDnL1zbILLMzwLFLIrLjYrzL3NZLUxCZqpkjAVdLsz7Nwr4jrL5LtpOrSr3LbDRr5ioZsL3zxZXTEz2DgDeLRLWLhL1ru6WDv1bTnTNrDrLriL9rVrnr9+6pY9g9gVPzgrgb+TqrSYDdTdb5oVjjurFr75sbPd4baoiTizcbyjArkQUbCznzhr-r3l0bWTabqbibObTDAokbZbXLmb8toLxbnRjr-TPrE1OLOjzbSdljzrLb+LbbbrBjHr3bdrBL7bYDPblrfbTbE7mLw7U7RjvbxLs7rrC7y73ri7XrM7K7G7q7m78727e7W7B7u7G7GoGoQAA"
));

export default createNewAscii;
