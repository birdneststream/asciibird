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
  "NrDeCICMHNwLgIwBpwDNZwAwoMYAsBDAJ3nAAJwBfJCGeZNDbcfY0i62jB9eZ1knHJUaUbil5ZchQcM5j6EptLZCOouoiV8Vs9V0WMdLGexEGtRqSdVyN4q-1NrzCy5Ke39bnspt7XTV9jATN5IO1rUJdwhw9dMPtDeP9Ei2Co5zt0yM8A2OS-aOyfXISYpPcirO8Ix3KSupTi2rjqr0C2kJrOwu6Ogqr+-MqMvLTS+tSKnKmW3qHMgdGy6caupZHZ5p7BsYbWvs2JpvatyZ3l7bOTjfGZi5uH0+Hbo-v194OF-bXDxY+-1+8z2qxBKzmuwhl3OL2Ozzu31BkKuj1eCK+fx+YKh13RnwBSOhTwJwNxaPhpJxqLhgOxKNhiKxyJhb0JzOJ+KB1MZmPBeMp3IZbLJNKZ-IpdJZJKFrIx7IltKJAqlnMF9LlcgAukgwJLlfqOSqDUqjYbFeLyaaLXyrZaxbaHQq7Y7ec6naK3Z6RTyfcL5d6A76g-6qaHZTKNZHpVyo7GY+qE6rjWbrS73V7g2HNRH42rk+b04Hs9H8yb7Znw3HE2XUxW-TnqwW0x6s7maynigBhJsNADyvbWADlB8UAOKjrIAJUntgAgrPZAAVRekADKq5Dmo3SYaABlN+AAJKHgCyh4Aoof2x8AGKHge7tYzp82jOkBevrI72vdw8nr9bAA38iyzR8QNse9AMrTUV2g0gAAlL2vTcADsAFcABtMMoHU9RbQQMOw+C4CInCIJg0tO1AqsSJLPNqNbWiKIbKjCyYxs6JvctXVYhj2Mo-iCL4jsBJE5t6y3NjhKkoTJPo0SZIUiTeNkxT5O4utVOUnj3zUlS9J0rTDM0t9i1MmjOJY-TdPMlCuPs6yjLMttHMYwT1O0iyOOkjS3LEmzjLshyQqc7zZAAdWQuirzogBpfylPC8TbNc0L3LCPCMsClzmOy5zLN8rzEr89KAoKny5OKsqkpK6qwrqkzGuChqatK1qOvy5KcsKqqmra+quuatLOvK7qKo8gyWqGgb+tG2rZumsbhry5bFpGmb5vazadrWrbBr23aFv2uaju2w6LuOs6Dquy7zoWrK7pu+6Xuet7Tqej7bu+16vt+pafvegH-o2z7gaB0HAb+iHVqh8HoYR+GkchkHYdRqzrsRlGYYxsHsaxtGcaKgncbh-HkcJkniYp0n0ep8mGcpmn6aZxnaaJvrmc5tmWfZqnudZ2jHrJwW+a5zz+Yl8Wpp5gWxdlqWFZl0XedVuW1cVlX1e1zX5cpgAWSIAFZUq13WNeVvWrYt03rZ1y2baCpXbcd3K7fN+2Xc9p2zYd723dd3qPeDv2Q69sOffd0Po-DmPI8DyqI4D-2g7j5Ok92YW6ZTxO09T2OC-jnPJsL9O89z0v86LjOK+r8uS7ryva7Lpu3UNqwTcbruW+7que-7vvB+boeG4H4fx9HkeUt7ifp7HyfZ56xeJrnqel4XjfV+X8ad5WqPW63zf18Pk-j7Plfz939ahd1THpYPy+94To+L9fq+TvvmeX-fu-na-0+35P2LgA-4AB2Y2D9AHX33v-R+0Dn4gKATXb+SD66IPgcAuBH8-7z3Qdg32kCf54wIbAqB+CYG4Kwb-EhlCyHUIoWvbUt9iEMO3qgwh7DSFEJFqwlBGDkF4PoQgqhLDhF0M+uAjuulJGSE7rQ7h2cBEiKhu3WRHD+FoOUYozR4ieFiIURzJRujtHqPIfozh8iLGMIMZLHRNjP6WI0aYoRmCmH4RMVwqxbCnGeJ8Y4sxrj7E4OsY1VRGA5HphkeE5xojAleLdAADggb4gJRigk0PTGE+AETvGpLsfEwRsSJZZLgDktuyT-EuLSQUrRhj8l+JCQ03JVT6l5JiXouJTS+FtJSS0pEWc6ntI8ZUoprS+nVzKWyEpkz5RROyUMwZvTRkLLgHM0pKyHGNJ6W+JJUjjK7LUUsjp1TZprJmcYxZIzjljIkRUzJdynTTI2cE5pyyjnDK2eMq5HzXnXOeRk35PzulfM+W875lzGkDNsf83hhS-nvIhYC96ZzpEPOBWC0F8LwVwAOdE-ZaK4VArZLi+Z+K9k7IJbU6FCKcWUoJCS9ZNLNlIoRgy85-w2W6U5Uyl56KsWYqJVS5lfLBUXOpdi4VhLEUiulVK8VArZVCt5egqFkqlUAplfKllaqxU6rAXSjlBqFjcopeShVWrNUmvTFap0NrNVIwyOyn4jrbIup5Rq4lRrBh2s9Wa7VyqqU+vlEG3VAbQ0evVbCyN5iulyr1TU8NUbE0xu2ea+Nsbo2dNTf6m+7jFXJqzSCnNSb0kloTTYkNhq-WJK9ZUSt5bGr1r2G6syLaixto9B2r0XaRQ9szVLPtpJB1AmHQ22aTa621osBOot9qw2lpTbOuN86x3ZrnRGgtJy13Lo3QuwtGLi2LoPeuziqqV0Zs3TclRU7j07rLRevdEsZ1uGfZoV93BR0PudTeoIn7Rh-vSABnwQHf0-o-WB+gIHwPVt7RBxAUGgYIfg3BhASHUMofPdu-tV7RWPpw-mvDKzmB82I8TUj+7+WHoo7h1dS7sMwqPZRk90Yz27to7e+jNKUXGW42+XjkS4P8ao1uujuq0PiZQ2hzDonCPuvvR-CTMGAyKcOa2jDbGv2aaw5ehj1GCPsc0ORiWRmDImd0mZuTjGaNaZkwZ6z2nZMSuk2tVj8nbM2Y4zpyzenWVwfffAfzyGlNDsk+psWKm8VOY3QAF0PHgQ8ABTOz70LNvlS+mdLTpMtumy2yXL8p8teai25zzNjCv-HKwsSrgxqsOeSwjWrFhGtuGa4Z-GrW-Akfa91ymHXjBdY03VjzTG71Wf05p1zY2LWjZ8+mob833MLbBhF0languObTc5kbBWesDb22R3bB3euHb6n16w+3Ztbc60di7xmTt3eO4927+GGv3dM298zH3jJnZ+19tLf2MsA+Ey9ubi2welbHZNy7g3wfbaK5tymgWkd+ZR+t79aPm2hYx0tuHZWgc5au+NnH9nMa-ae1N+GZPnufZhxDmr+O8sM6pVTm7rPocldx-Vlnp2mfw+B7pkTdPifjahWRSIYuaVPOMlLvjgm5fY4sEJt0Su2Qq+Daj1T1qNeRa1wrl92vVvtqx5rztYWKeE-O2zh71PvOC858N363Prfm-Jzz13zv2dTad+92nUNvc045yToXsPHe84qxb0Hweo-2+F9NuBUOJYS8D0TkPKfo9B5j6nxGK3GXFZdzb-77ufcF8B0XgPVvi8V-L27kv-Pvth6qw3h3afM-p-61X+vZfO+14J13wvPfGd99LwPzjefPfj7txnqfIvmGaCTxgCXY-J8t+n3HvnzGfPI712+43OvTfb+gyb7tZuJ+V5rx3-vF-h9X6y03yo-vbcvYf5f8-p+Bcg4j5-oft-v+95HwSZ-a-V-D3EAj-X3VfSPVvKAiAr-e9BPMA5PNfDbOvbFNXAkNA-VA-d6QLSAw-PfY-LAoLI-WDQg9DUg2A-PSgt-R-d-Wgmg+gpfBAqg5fJA+rXAlfDg1g5vLg2PdgngrPPgwQigzpUXLCTCcXMQ3SefeARfBHRAoQg2ODGXATQgjAhYNQ7ghQvmLfYg9XUgqTJmHPJ1THfQ3fQ3ffXQkLUw6wywkdMw3PI3Gw-Akg2w9HVwzQ4QlgrQ5gpg6gxgug-whguQnwgI4IvwsIrwzw3wyI3NTGaQmI+QqI0IlAiI6IgyHQ5wvQ9w3g8mIwjZPIoKAw8Lew4w-9E-AdEo11A3Bw21cotI5IjfBIkIoIlI1oxo+olo9ohombJo8ItonojowIoYzOWfBfSQqwWQ-o0fVI7o6YqYsVDQyoRYzGHApImlDI8wmtcgxHao0o6dXYlZDYmorY7IgQi3QLZYtwS4zQa4mA8Azg7wvorozogY2Y9fV4l4uY544Y+Y5A74mY5keAt4v4j4n4-4p0W4+ASE1ZOo4Etg-GaE6Ex4p9A4slU4-XbYxAo4vYtvfg3E6E5Qx5WEz494r40EgEsE8k34+E+4vE6Ah4tYyksk5k0kqBIEkkkElkzksVQk8pVQ4kpk1kmxREgUik81aEi40U6k05JQqU8E+Uqkvk9EzQXkqZOUxUjUrkmkxI2k5EwYsU6UnI3Uxkg0hUrUibUYmQ8YyQSYt0eI20tke08Yt8J07COEjw40xQzE5owU7kmxVU80o0xAkU-k70p4uVAMoU7Un000zUqMj0nUxMmMw0s4z0pM8MwM1M9M3onM-UgYdk7FeIvMs0+MoM5Mksv0hYSMyshMqbasqs9UzM3EvU90ssjM0srMkkT8JyH8fKHsOiYCfKQc8qAAIX-EPBfCcgABEE0ABaBNScocw8CcOiJCOiOCbTfspyA8Acw8Lc-KBKC9Dc-KcCUTXs8qY88qbs-KRci86M+MLULUIAA"
));

export default createNewAscii;
