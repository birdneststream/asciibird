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
export const maxBrushHistory = 50;
export const maxUndoHistory = 50;

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
  "NrDeCICMHNwLgAwBpwDNaJQYwBYEMAnecAAnAF8kIZ5k0M7dDizLqGV1bt8i5SKVKB3rdwTPgLbCxXTON4tB7WSIlLpNeXMaL+rIVro6ezfcpna1eqYZEmFZ2yqtj15zfetODL498lfS383GyCjTgCNO1VQnwsI0Xl3Z2DIuMCErwzov3TksKzYgvjPYt1SmNcSzLLqitqqkJrctKSG1sSHFPDslo8m-I6BvPbTRtHuwrrm4dSuqJG2qcrJxfm+ud7y8c7N3aWFnMP9xwnl9e36g42ds727nqLr+5PH6cGx19uXp5mhm5XWaA57A75AgHg0GQv6fFbnI79H5g2FrY7ImEfNFIiFfVEXdG4+EPX5Ygk46F4smIraU4lvUmrcm0-5Upk0kGs+kYtkI074jlQrmXOki4WE0US8UU6UsuFi+VSxUy5Vy7Fq5mc1Va9U6zVC7UG3VG-UC-nU83sy1895W202xkOlEW+0k512x1uzEe91O71+3lewMM31B7lEhXGs2ukP+sOR00uz2x4M88PPAB2AFcADY5-LZvMHQs58gAXSQYETPrjKfTsr1gujybTCabSdDdbb1vjSqjHdrrb71YD9cNzc7Q5V-ZrqYjw-bs7HM9H3ZjU41i9XC57XZ36-n05HvaPW5Pm93G8bl8PF4PktPN4fd5bt+v94bJrPe8fH-HA7nZ931fICvyfT8J0HN8wL-Fdz2AydoMgwCIIA5djx-F9ENA5D0O-K8YJA1ClzXIj-xI-cyLgzCEKgnC0NI7DiO3X8qIwgjcMYujmPgwimPIlisO4gTeM4yj+OojiGPE4TJKQ6TWIk9j5Io1iSwLXN81eEty0rOT6NUoSUJEmi+Nk5SDME2jjP0njTObABOcz8JUqyzJsiy7KkwzrLw8CTO8h0nNTQBE0meYLuTCuoIq4jyXMs0SFKMvzYM8gLXMSnz3JStj4q8jL7KS3zYpypS8vShLCqysTFOc-zbIq-LKsCzK3Jq5KSs6mS4vqtKGv6vrBvKgbhqG3rRom8aptSyaZum3L5rKxa6rm1aFrWpaNpW9ads23btr2w6DuOnqttO-bzqO871KSG73B0isq1mi7SpO17Lrerrao+n6cpiyj-qRKKqkBuZgZcUGbnBsazveuGvo67q-u2yHCNRlJoa0dGbExjBsacXH4HxyRCbgYnWopqq2qK7KEeKpG6dphmAcHUmrvh5nvo5rnGfa4Dyf4NnPs5xGeZF+mxcl0WXwF8BSdlgqWqpymldVxX1eajWmu1xrdZG5bft5mm+aZqWJel83LdNi3ratk37eNx3qqd6nnbd12PZVrW9Zhl6jfdr3NaDuobrkO69AevTffZ-3PeV+O1eDn2sdZ8LU+i9OQcziHs8sWX5dzlPDfF23S4dj0FbT8786ryLa-WAvQvrkvy7jxOdf12HY8DjPq5Rwu8YHomh79luXZ75P5pr3u65nhuk870ezbL8eE6uaes6buf0Ub5Gt8nrux4DteF+j4Xl9bifF5jo+2+96-8gARhuQAQ0gfZ-vkAANJ35ub-pQ-lIf9lQAJsEA7EICnBgPJBAyQUDEQwOIHAvoAAOYKKQ37SlQRLLBpscE1TwQpAhqkiEsRISeMhP4KFTioYeGhD46GYLQYQphxCWGkLYeQjhlCuHUJ4bQvh9CBEd0sKHDA4czCRyegbbmNtL4n2EUXWem8lE533qolRecR4b3UfPbeQNm76L0WDAxMtz6yNXu3ZRpFtGaLUbYjRiju7yIPkvcxx9LEP2LqxSuRj+ZaP8XYxxO8TF2wsffM+fdIkOMHoEmJ0TD4XzCafZ6N9EkVwCfEsmGTdFWOCQo6RTiPERJkaE9x4T4Gvx-l-KpgDBGVP-vUqoH85AIIZM0jArSfjtPgJ0q43S4C9OeP0wZdRhnATGYRCZzYplJhmR6OZDoFkkn6VQpBPSn6NPARLEZwDtl7NNjsrZBz9k1UOdAk5CkzkVOOTc05FyynJLEZpDSRZtKaV0lIhJbi76POHrEv5mSbFBMMbkkFOi8mguMfkr5fj-lZLhT4yFsKSkrweb4tG2SIXgrBcUwp5SCm3yvriwlDJEXYtMQizFOLgVQqRain50LXGlIZXSxyVLaWeJRXIopKSzHMqJTSqGITvi7xyeSoV6KMa-KZfSgVBLJadIwU0jZkyVXTLVbMjV8ytWLJ1csvVbSDVdKNX0k1QyzWjItcqpIVyOlWpcEsw1Nrxn2ssI641SRVnmudaqn16q-WaoDdqz1PC1lwBwXIBhVQI0YCoUqlwMb4BerqIm8Noa6m4KEcqKN2Ic3kjzYiAtKCs25pLfmsthaK3FuwVWtaoj4DiL4JIzleLpVAriWK+xnbBUiuFVKyVOM+1JMZakilgL2UStZcOlxo7+Wkonb2gdBMh3pKia2kdfLZXOMXmSrtLNKUHsybOrdPL5XfLlTCk968F39qncujdXjz3buJWkllO7+6Hu7R2-dR7N3csPIqmpoDvUtJdUG3V4H9WQadaB31sH-XwcDYh4NyGIOoag+hmDdq4PYYQ7hpD+GUOEbQ8RjDpGsPrJw5RvD1GCO0aI-RkjjGyPMYowMsDmGPWcdNdBrj5G+OsYE+xqjwmaNpt-iB-j8a3X5DjRm-BtbqhFuKMppTinmiqb2vWuAjaG3vMei2klp6AVfpM1ivd1Lv2WbM94v907xUYrXT+0z8Lx2fqM-iy9-6203sHUukmK6gq+dXb+pzr6L07V3T2tl7nrOuZc8e7zD6uX2ZfU+4z8XzPRb83egLyX10zrs2iwrj650-Ci1ZsdLn202Y5b7d1PHuOScE41-jrWWvNdE3RrrDGetMb6yxgbbHbWUaa5a3j7WhtCZG8Jsb1q5sOtdVoBrnWZsrfGwtmTE3VscbaztkTa2luxsBp0sNqbTvPHOxJlNJ3rvRtu9Um7RqzsPdqU93jL3nuXde8B97nHPsfe+7JxTqa5OMJrRDq9mZnm3Rh-dfTUdeWlcc251H1WP17zR1lyryL0exbq9l+9uXiCiux7VydDmkslZS8Vwztn8cU4swTnHi7ieC0CyTjn7P-Mkgq15pMfPMv06x3FmrMqqd0-S558XqXnpi-l8Ft9aWyvS8S7Ls9KuuflcV5znn3PQWdNJut+be2Num5Nx1s3luLdTcm4d7bVvbf7bE-bzby2jujfN4th3NvXde62277DgfPfW+98H2b-v3c+7D5HoPseQ9O8d370PAfjt3Zj0m9NSfNmp8E2GlZPDpOVshwpkvzCy+sIr+wqvnCa-Pq0Np3TOmEefJl7TpnjPCd5bZ9rsLzPyes8pzlofROR-d7H7rnvpPRc6-1xPufyuof5Y89KtXIWEsY7xyL-vQud8K+RxL32gv9-b87yzw-SOadK8vwVyXuOye77PwP298+Mtr+vxrpf1Pb9H834JovVmhuBiQBeiIBvuu2KeUe4exuGeie4BB2EBcBsByeSBueqBUB8eEekBce2BCeKB+BiBBBCBxBLuhBZBJB3WM2V2j292X2f2-GAO-2zulB5BpBFBvWgG2eNBRydytyly9yLEM2zQQhHuO0jecOEcLed+KOW+shD+gu7+vOs+csPmDOg+He6hXek+76ahL+GhehN+K+y+4W9en+F+U8f+M+uhw++hAuRWH+a0x+yh0+e+I8ihph-O7ehhJhGWJ+chcW7hb+9hEWgRquwRw29+6BgBkRYB2KsRFm8RGBuBWBUReBrBLB7B-WRBbBORGRuRHB6RHooOIOgMqmxRwE5RmRg22ReRtRBRfBqkIh0e5yDRghAhJ4TRkaWeuy3BLRb2PR-RPB-BrRHR7RP4nRmBoR0OryYcEhEiUhi+5hz+NhWh86B+6unhDhbeWxe0Th1ho+thBx3hUuq+4RQR6xXhFh+x4+hxNxqxKheuveV+IRlhVW8hzhWuLhT+j+Mh7x1x2htxAJxxmuxhbxVhp+mh5+KxZhGx2xLxFxWRhRQWzRwKM2P2Rx0RkJNmiROBqRKRNR9R+RiJVRERJJ02SJ1RFJpJzYlRYmyaNu9JyBVJ5JZJduzJAGYxU4ExyRwhnJHJIx4xfJQGjRQpDSApXJopAxwxvBMpsJ4hry8OeYHy0hSxkWZxYRCJ8JzxHhcJOpfhfxEJqpUxoJIJ3+zmBp-hrh-xC+9x16mpOpxpLiexhpdh1pDxU+nxnpjxXxWJPxBhMJlxjhrx3x+p4JG+9p5x2pkZUmzBhJdRyJ4e6JdxmJ-p2J3xMBaBBJxJRJlJrJsZ2Z8ZuZOZ1JhZJZcZ5ZBZFZRZpZ4AYavJ4p-JspIpDZwpbRLZYpTZbZnZox7ZUpzZ3ZgpvZQx-Z0pcpMOsxCpkhSpBmixsJjpKpc56ppxEZGpUZ0uoZVpoWa5y5253pqhLpGJyxh5fp0JR5yZZ5ShK5O5P+wJX+C56+5pYZj5m5lpIZyhq5N5AZCZ1iHxJpd5s5I5TgABCejJmZ7J+Z1ZVZZZ35gmRuohGZSReJCFuJWZkFlZ6FaFmF0FWFLJxZuFNZbJZJ+edBfZXZo5gFZFFFPZA5EpQ5fR5FlFjF1FDFzFVFg5NFjZLF7FXFtFqp8pWkippYM5t5RpS5f5olV54li5klZpwur5vpYu85AFMFT5qlL5FpGlalb5Ml95OxYlslJxUlgZupvhwZvxPhH5RhBlppulWpX0nBDJ3RTJeZXBeFhFblEF2FXl+FUFPlGF3l7lBFnlflOFgVvlYV-lIVAVwVEVOFdZoh9ZHFrZrFTF3FbFvFPFnF6VWVqVGV2VyVaVuVOVKVJVhVpVeVRVBVGW-FxYCxIl0lu51l-59VxlSlLVelfe2lB555JlllFlXpTpbh+ltlDpw1yldlVlI10Zk141o1Ols101-VRl1e3wwF1QDlzlHlrlQV214VMVwB6Z8FR1KJKF4Fu1kVsV0V51oV+111V18BW1D1O1T1e1oBXV-GcFJ1xQ3JeJiVmVVVxVZVQNFV5VgNINwNYNkNAN0NHZ-1sN+V8NlViNoNMNpFKNjKNVby05iOX5E1S1TVEljVU1fVhlBNrp3VQJUJx5bVuNc1RNC1JNNlDN15M17VeNpNxNLN+NnNy17NTN3hG1aBoFiFwtuJotaRLlL1F1B1vpyFaZClRq0+OJ8tqZQuyt+JZ1Buh1X1Gtktm1z1+tr1UtN1d1UVZtl1TxH1MtqtSZlNKtp561kpw5Kl6tttNpKZDtbt7pcR71sFqNzt6NaNEN-t9FCNQd4NEdUNyNwd0dkdId1ySVGN45Tyk58x2NreNNmxfNzVtNi1HNzNvNdNP5cKmdvV+5xd9NbNRdrNudjNOdWd1d3NBdg1bpddhNn5KmhenW4tutj1ht0tptFtdpnGStvtU2o9CtvGE9Ntit1tnts9b1k9I9c9x5Xt09Dtctat2t0Bx1O9Otm9B9u9mB1BgxYFetCRY9rtwOY9VCQsIakRt9Bij9eiz9oKr92K79Fmn9wK39Vmv9Nm-9QugDpRPCd9XRdeltme3xGm6m19maED-CCD8m5e8DqDpeaDY5MxKdAlU5QlONDded-NtdXN+dVdhD9dZdhd5DMWmOFddDz5kRpDxDVDbdDVHdlDZNrVY19xPpM9bpYD7DMDOeItTlZ9fdQtojIj6eYjBtMjD549K9PVa9ijdtW9stR9yRyji9fDy92jG9ohWjWtS9Vtejq9C9RjOjJjxt91-dJt1j5tQO9959iFqFaxujFj89U9Kj7t9tZjXjpjSj5jPtxjftATqjhjwTljoTHjfj7jkTnjcTF9ITCjYTPjjtdFCdcN4dUd2T8dfQP1L4mNglypzdPNnDHVldzD5T2d7dNdBDw99DclDD5lYJrTRDF5bjjTbTFDpdvT3DVTZTOhFNaTG5l929aevRP9imBe0jLjmttjNjcjA99jQ93j3tSTUTKTMTPVtJsjczzjp1BzEt4jqJYzvpJ9v22z4TQTGzCTVj8Tx5uzRRXtxF+9GjSF7zrjPwFzkCaz69sT9ztzAL0TAdMduTsdOTDzgT-jVzIzNzpzyTV9MLUL1zyLQL0LiTCLmzSLmLHt1NCVBLOtf1xlRTuDJTZDrDXD81FLJD7THDgzpTjLtpWuDTzTqpChZlNDXTjDPLLTvLXLbLbDdT9LTLAzX9oDfzkrqT6zWL5NmBXtqzg9t1tBgOSrarKzjjTB9BeemrDBT9ErL9Brb9RrCaLzurUDhEPzsC5r4mlrIDFR9rdrcDNJjrLrzrSYTzDoqaDkcwYarrdzFrmzwD7rwLtrqtMzkzhzJzUbezMbRtoLcd0r-zGLgLsr+LRLhL4exLSN4LubCbkLodLtZz2LxbAbWzKLcLaLabKbIL6LqLuL31TthbEWpLadeDGd-T9TtLPTnbIrNLLD3btTTdcunLcrgrVLlTHTkDTTM73TArs7-LY7w7Yr-bslgt+z0bvjNb5bdblbDbajJb5laJ7zPdEbp9G7sbFr4DTrTjbrt7Hr-r8jwb97obOLEz4bJ7kjf9Jr4rN9P7Uzf7gHyTwDzQPrkRDkb7RM6lYbZbz7+7h9bziHe9yHmB7q8VGbOtETu7MreL276t2bgd+beTjbGT+TTbmTYdRHELxHB7DtBHYLFbOHW79bqbuHLHtb1bqj9HibLirbTadVK7gnXbA7In1TjdTDwnYn1DQrC7fLcnQ7EnfbQnJ58jc7S7infTL7kga13Ha1CHKHyR+n8r8LbHe7rHzHZnHHpn07x7SHx9Zrjup7Ib1rjnX7xzl7vdS7kHO7nHlnPn1nyb7HMHobcH77sH-737Y9YHyT0XmzsX4XQHh7QbEXIFbnnn8bSzdjCztZNH3HBbvnTHtHr7pbxXvpeXuXmbkxlXPJ1Xv1tXP1DX5HZHpHJHidsLhXWHBXgXfn+HtXhTydemqd-H6dDLq7o3ynmnk7Snkn43M3orQZnV8nsJzp3LS3qni763a3KlanE7MZrnszcbyz2XirGr6rx3yr53SbUr7X3XHXJnFnQmTndnhnnz8zmXizXX13jHt30+oXgbZb8XobgP27f3wXIPKXQuwP4ToHYJUPfnoPCPEPZ7lzl3p3aPqP2X6HWb9XTXD3P3X32H+P1HxPebzbDHZPPHVHpPFHObVPdPFP+XzXbX9Pn3V3bPN3FX10A3zeQ3g37bs303gvk3gjvbwvwrYvy7c3Y3gJnT4727O323G3ivW3l5tDj5YO4denr3N7Wr6P73DjZ3+vJ3GPRvF3pv7P33BPrPHPhvF7GXdvR35vevWgnrJIrvsvYPQXiP3x7v3zj7Kl3vwHEP-vQXcPhXvvVwEf3daXyPvztvh3WXTvJvLvDn1PTPWTLP6flHhPVvAXufePnP2PGHRfJfVXxfZfpfNX5fVflfdX1fdftfjXLXRXeHJXPVWm3PTeza83Qvovff1LE3-fU3EvGnQ-7DK3ml0HU-SvQX0-KvfnDkAATMI3jP0mH36-kGH794pqn6ayRcnwnx94fwb878f8b0nxfw74n1fx7953f236o0Zy989x8y-ygU99e+e2f-n0A0j854gtHwO6pcgBLfILvf0RYP8eu4zZ-gZ1f6wCvmFtLHhX2QE18UBDfNAU33nbgCkuZbXrvX0wEZ8GehfDAbj3SbM8iBJPTPq10IE09COFAtPtQPkZ4Da+-XLBnz1qojce+I-OltwJ7YD8peg-fgb3yEGl0J+WlZJnP02aSDcBUXaDoHxwGlcFBrfI9m9xv4n8D+7ne3t-3j6aDHeUjSNroOv7aCbeJgy3joPS56DjBGgiwUYMMG39IBd3KtlYMv7OC1BrLfzgXwt458vBbgs3r4PMGx8XO2aWBlp1rwYNK84Qlaug2iEoN528ghLmV3-7cIkG4OSIWEJiERCMhUQ2ITkMyG5DsheQwoQUOKHpCl28QkLhDw75sCeeODNtuS0EHD8x+4vJoZL2EGNCRBLQ0fkINGYSCx6O+XYvd1AFQCVBEAkYUoLAEOCiepg7wafzsHqCXBcw8-v4NmE2Cj+iwvwa4Lz4+Cth0wgrksM2HrCAh2vLAZMJ-5P84BqHY4R50647CzBuwg4ba115UCyBNArPrT3oHPDyulAj4T8NoH2DRh4wtJl8IYEvDs+fwynr8LeF0DwRjPRge8JhHEDUBSI9AZo0GE3DPBIIqoVpAnK1Dhu-PLgZ0J4GEi+B7Q0kSLw6EUiyRwrHoVIL6HQCLhMAy4W-1UEPD0RQwmzolwSGAjHB8HK4VoMOErDzhCAjYQKOsFCiYipw7YQ93cHCijhzIo5uyKmF3CxRfIywaKIWGrCORAImQdqMUF0ccezfYEZ8INHkCER3ws0SCLZFWi0Rgwo0ZCLhHQioR5PC0caPwGkC7RLo+0aCPhFOiIR1vZUTMIDHPQ+OfPeoQIPDFtDyRVI1obwIU5EjKRUY8flSmwE6juR+w9UcsJVHyjN2moybD3QVY-9rRTgjMQ8PFEKiyxOYisR5ytYAC5RiZG0cWMVFrN0xuYkUa2PMFFj92bIqsfyPbGCjVRtgpsVKKHH3CMRroxvu6JNGvCHRzo30bCO9Gq9zOI4oMXOMREoj1xBAsEauPNHbjMRU4rcTOL9G7jnhnYpcaeKs51pO+cxPEWGMjHNCEx946MV0KfHxiXxJIxMf-iqqvN6xjY88XiV36WAo++3AwX2KzHwCWRJYyCaBMDEwT-RsE0sQOLWHQSU++-QCSHyQmb0gJKrJ4RqM3oFjhx+E9ri2J7Fqjlx8EscbhMQnzDMxlE7MTWSQGojfxDYrscxKXEejjxXo9iYePnFcSFxs47iWuNs4sSmJjY3iWJP3E+iBJO4qSXuLdGGiJJjomSSeNYkXiyJcE4MVeN541DbxsYmTs+I-ExjiRcY98Y+IMnrsEJdE3sYRMY4yiJR5YqicRNEI1j+AjBPVnWOM6YcDGKkjwchIsnh5nJOXdyckSwl79QhGEhyW2JImDi-xQkpkeBPsmeSRJwk3kZZNIlRTwpL-HukIzSHJDzK5Q8HpyIqHQMkhvCFIcELKmloKp5aKqcXhynTt8pXvSoSVMQZ1SWpWQ0oUUI6klDcp7UnqfkK6kDSPeDU+HsHxKnb9ipYU6qppNxGhjhKDQgyfpNMlLTDJD4ladzA14JsteqUwcelOonWdbJuonZgBJol7DCxEU7VlNg35JSzx3klMXqPunKDKxJU78WFzj79idaIUiRiAN2mOTtpSEmKZKKIk2sLsF0kGdhLcngydWoMkAWyICkvTGRCMhkUjNlGQzLpgkycXJNNG3DyJak7GZ6PUl4zCZSkziQpP4l8StR3IpUSTMxnTjyZPE0mUeOJn4yiZuMiiQTLZksy2R4kmmSS2mkcD8R0vQWfNOWmLS1pBkjaRTy2nxS6SMfc6e9OlnXDvJw0nka9MeledAZK46UWdOumqSAZh0iYfrOGEfs-pfvVCShNVYrC4ZwMkAVbOhkgSfpkUpycdM5kMz6ZPMySXTPRk69VZO0uWWBJ9kuTkGnUvqcHNKmtSg53U+qaNMmnjSg+hUgqXHMTmq1spvUsOanLallDo5n-LkTnKKlJz9Rk09wcrNjnJd45jUsuSNIrkqz-uec0ufnPTbZzQ5Gc3bpRBDHaS5pEY3SS3LFkizXxe3Ryt9L9m0T-Jzsq9hDNCk4TzZjcr1qPMeHjzh5AcwKcayrmfVp5tYlYdZJxmbzTp0rA6ZTO1nJSbpOsz3pXPrnt9mpEcwaWnP6khzI5zc3KvDORkQTPZ0kl+bJInHyT3ZiktTIPI+mzzMJs87mR-KxlMyOJzM0BRArfnKTj5d0tWQ9INn7zhxQCkgZ-J-GHzdZt0jWVvMwWGzq5PkvWYgtHGsziFBCgucAtpldyHQbc7vkLM7lGSb54AHTs9MAH2yh5J0h4bbNRlgyJ5i8yPuhNNmFybWZRfhXmNlmTTH5KM-2YjMkULzpFz8-+cwtSFxCQha82+YuJrkJy65WishbwsvlqL9F18puXosMV3zjF98t3gosyld0lFDC8xQYrsUmKr5Di5xWYuMWuSoONskRUIpUW6KbFRivxaYoCVOLXFQS+xSEvKl5Ss5i8kubnPPmCLDWE01RY4rCWhLklaSouVEo0Xlyz52S7RbXNiW5KClp8vJZoqKWFcU5ti8JZVPDmpKXFonReNQoE50LVpEsqeb4tRmqZAh686wZwp4VQyuFnii+RdOEVDKOlJRUZX0pPkCKklfCiZWhLmVtL+lky7hV9NYUmzfpCs3sWhxYVf9O6NU6tDUoiXpyql1Uw5dUuOW1KTltUi5UcsqWXL7lty-xY8sCXh0JFzJJhV-LJnILkRm4j2d8o3EQM3lImVpQcpuXnK7lzy4JQ8vBVPKYVLyuFVCuXmJD4lkKlJaivSVXLQVEKhFWio-qZKplAjLJUNPxWAMKlsK05WCopXYqqV5K65dSrpW0qsVjKvZSZNaGNLOBtCnaJ9MWVTLZlKK5ZYMv5WrLdlKRD-ovPcW8rvFDrBZRMxmVSrvZRK6Ze0smUjKhVPK1VXKuAkirelsip+URR2Uo8aV8Ko1YipxUYroVJq3FZavNXoq6ltqzFSyspUMrjVzq01dartVmqPV7qh1T-LWUjyZVjq+lUypdXBq3Vrqq1eGptWeqfVOqnleZMgX-Lfl38xNRjPIUHioF1MtNX8tdleyQFGa8BfmrAVFqE1Oa1+SmtQUoK815aqtaWvfloDRZrA7Edg35k6T6FvWMVYqqBUyzf5SSrtQ+wDVzzFVfKzVQPJAmxrZVyq4VYavVXjK1VE6odQarek9KvFwy2dSOoFVjr+FDEyVRasjVeq91PqslSGsDXMrfVTq0NRGovVRrvVu6q9furvWHqB1R6sNQ+tvUnrj1Z6oNe+u6XzK51Y8hdaupX7frL1wG69QerfWfrT1z6kDZBofmLqghsBEFaBvvXIbH1f62DS+tQ0QboNYG19fauw1PrCN6GnDShow0waSNaG9dTevw00bo1BG4jURqo3gbaN1GujSxuY1sbONrGgkVz2qFd8mld4nuVMu3VZSzZfkuKRJsRkdq9VT09ZY7JNmPzpNomhjSpqY14auNHG7jZpu03qatNumnTVhvY36bjNhmjTSZrI24bTNemqzQZos2kaKN9GtTTZqvUfLe1lGxeWtWi6Ty8YOGv1r5vCg4bPN-m6KMFpBihaIY4WvOKB3jVkxotMMmHkBuqBh9DwyWh8Klq1XTr51O6sLYopy1JAw+rmnzRLHS3KgSt2IMreSAq2IgqtfQGrcUDq1JbRYDWhLabGa2b8mtHW4rZ1ta3daaobW-Lb1oUj9a5Aw2orT1q60TbxtU2vrYNtUijaPF02obbNpYjzbYtfc3uYRHZUCzhZQmhtetoVSCrvN-6tGXbO1Wzzx1x2lZTOpAEOajNzm+7XZvc0Aa7tj2xzZOts23azND2z7dZte0vaftH2xje9vM0A6QdQO57V9r+2Q7Qd328Hdluh25aE2fa3sdyqy3r8bW6OwDZusR2-q3NF0zHajIJ2TKiduO8VRjt9bk6bt7WybTNpp02A1qqOhbXjsJ0U78drOsZfzEi1YwWt6CALdTpAleaxtIqwXQtuF087Mt9W5bSeFW0y6pdP4WXXTrm1y6pwCuxbUrsV0rbldKWrXWlp13ShVdtOtXZro13S69dpWs3QLyxEvIZp7c-BoJr22sqHdxk53XpP21O7Xdjut3V7s90+6Xd3c93f7u91+6KmC0oPR7uD01Nw9UewPb7uj0h6NtEenUozsHVraBda-NEmv3Z0QxM9MMrpYHOih56l52esTUTEL1+sy94UCvQXv53C6c9IE8XerqN2m6Td8ui3ZVrb3VaO9tWrvZLpb0q6e9jWvvdrqH266R9+ugfQ3uN1N7W9Y+83bPvK2Kcttra1aQHvj27aw9MexPdJ031x7I9O+-fWvtX177D9G+k-bHoP3H7L94nU-Vfu31n6t9lLe-bvuv3n6n9F+l-Q-sHbP679t+x-b-q-3v6f9H+7-X-uAOAHQDQByAxAegMAG39VCvmVjW23NK3xn++pTxpQMgHYD-+tA5ysoXYGpOMBnAztqP1gG4D+By3W2rIOkHyD6B0Pa-poO4HKDDB4gzfuoNsGoDWB9g4QYIOcGODRB5A3QdQM8H+D9u1g3weEO8cEDxTDuaIfoNcHeD3BigyvrEOKHaDCezAyIbwPyHNDTB7QxIaUMYHwDCh4wzoeUNyHxDBhwQxof0NqH195h1Q4wbMNCHLD6how6YcMNUGLDthkg14ccMeHmDl4vjdeNmllggAA"
));

export default createNewAscii;
