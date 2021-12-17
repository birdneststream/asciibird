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
// Although you can type in the input a bigger number than this anyway
export const maxBrushSize = 50;

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
  '¼', '½', '¾', '⅓', '⅔', '⅕', '⅖', '⅗', '⅘', '⅙', '⅚', '⅛', '⅜', '⅝', '⅞', '⅟', '⅒', '⅑', '⁄',
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
  // bg: null,
  // fg: null,
  // char: null,
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
    current: [],
    layers: [{
      label: filename,
      visible: true,
      data: create2DArray(asciiImport.split('\n').length),
      width: false, // defined in: switch (curChar) case "\n":
      height: asciiImport.split('\n').length,
    }],
    history: [],
    // redo: [],
    historyIndex: 0,
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
        if (!finalAscii.layers[0].width && widthOfColCodes > 0) {
          finalAscii.layers[0].width = maxWidthLoop - widthOfColCodes;
        }

        if (!finalAscii.layers[0].width && widthOfColCodes === 0) {
          // Plain text
          finalAscii.layers[0].width = maxWidthFound;
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

        finalAscii.layers[0].data[asciiY][asciiX - 1] = {
          ...curBlock,
        };
        break;
    } // End Switch
  } // End loop charPos

  // First layer data generation
  finalAscii.layers = [...fillNullBlocks(finalAscii.layers[0].height, finalAscii.layers[0]
    .width, finalAscii.layers)];
  // Store the ASCII and ensure we have no null blocks
  finalAscii.layers = LZString.compressToUTF16(
    JSON.stringify(finalAscii.layers),
  );

  // What we will see on the canvas
  finalAscii.current = LZString.compressToUTF16(JSON.stringify(finalAscii.layers[0].data));

  // We need to also store in the first undo history the original state
  // finalAscii.history.push(finalAscii.layers);

  // Save ASCII to storage
  store.commit('newAsciibirdMeta', finalAscii);

  return true;
};

// Creates new blank ASCII
export const createNewAscii = (forms) => {
  const newAscii = {
    title: forms.createAscii.title,
    history: [],
    // redo: [],
    historyIndex: 0,
    x: 247, // the dragable ascii canvas x
    y: 24, // the dragable ascii canvas y
    current: [],
    layers: [{
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
  for (let x = 0; x < newAscii.layers[0].width; x++) {
    for (let y = 0; y < newAscii.layers[0].height; y++) {
      newAscii.layers[0].data[y].push({
        ...emptyBlock,
      });
    }
  }

  newAscii.layers = LZString.compressToUTF16(JSON.stringify(newAscii.layers));
  newAscii.current = LZString.compressToUTF16(JSON.stringify(newAscii.layers[0].data));
  // newAscii.history.push(newAscii.layers);
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

        if (curBlock.fg === undefined && curBlock.bg === undefined) {
          output.push('\u0003');
        } else {

          if (curBlock.bg === undefined && curBlock.fg !== undefined) {
            pushString = `\u0003\u0003${zeroPad(curBlock.fg, 2)}`;
          }

          if (curBlock.bg !== undefined && curBlock.fg !== undefined) {
            // if (blocks[y][x + 1].char && Number.parseInt(blocks[y][x + 1].char)) {
              pushString = `\u0003${curBlock.fg},${zeroPad(curBlock.bg, 2)}`;
            // } else {
            //   pushString = `\u0003${curBlock.fg},${curBlock.bg}`;
            // }
          }

          if (curBlock.bg !== undefined && curBlock.fg === undefined) {
            pushString = `\u0003,${zeroPad(curBlock.bg, 2)}`;
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

          if (curBlock.char === undefined) {
            curBlock.char = store.getters.currentAsciiLayers[z].data[y][x].char;
          }

          if (curBlock.fg === undefined) {
            curBlock.fg = store.getters.currentAsciiLayers[z].data[y][x].fg;
          }

          if (curBlock.bg === undefined) {
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
  "NrDeCICMHNwLgBwBpwDNZwAwoMYAsBDAJ3nAAJwBfJCGeZNDbcfY0i62jB9eZ1knHJUaUbil5ZchQcM5j6EptLZCOouoiV8Vs9V0WMdLGexEGtRqSdVyN4q-1NrzCy5Ke39bnspt7XTV9jATN5IO1rUJdwhw9dMPtDeP9Ei2Co5zt0yM8A2OS-aOyfXISYpPcirO8Ix3KSupTi2rjqr0C2kJrOwu6Ogqr+-MqMvLTS+tSKnKmW3qHMgdGy6caupZHZ5p7BsYbWvs2JpvatyZ3l7bOTjfGZi5uH0+Hbo-v1+ABGSIBOBoAzgsflZ-ms8MC-g0AK6Q0ENAAucMkYPmgxBKJhyIwqKyAAdsfBcVc3BicQ0AJ6EuDE2QAe2ptNIsPRULWhzgZKJDQAJoyGgzWfC1gA7flrADk4uKSKFmPZ0qyAFNFbYAG6q2QquXk0Wat6ctnFHD6oQQnXctYEU3gWWVLk0g427X2o1ZDUWx1rF0WB1MoQkT3+8BUoNOsNrPkR4rW6NZUOu4Voyoi6EAGzTkVTGfK2bTgzzWfTmemecoAF0kGBHq9nndwys5rtG5dzi9jnX3g3rrXPosPhz9gq9qtkz2O32h2OaxPB6Pm+OBwspwuZ0uR02Se31y2npP51v68Pd7255u20fp9vu2ub9fj4u75fV-er8-D12H7ev6+X++L5+b6AX+wEfv2T6gQB4E-v+BormBfoNAAljaHKIWsJpxrY5qJvKMY2navpughxGyIRpKkaQOFEUmyqoTaAC2NqCrhurFECWFkfRnGkD6FG0eqzo2oGrGWsUCY0XhWQsZJbFZGKPFCHxmjoUBhoCbI1H8VJtjKRgqlZCJsliXRil9gZJEaaQADWNoKaJXrFDJ2lybYADuNocSmxZFjmpbFgWPlWIW-kZhWVaPjBkFwQeUHwXFsUxeeSWtile5nqlnbQWp8Vpaey6JVluVFYV+7JSV5VlZlVXpQVlUZbVG7VQ1+VNY1J6znVzVde1kU5aVLWdW1rUdTufUgdlE3FTVI3jWB02DWN379fVPWzctU0DWtQ2jRB6k6ZpzE2h5ZloZRQhMWZLIOcGmE3Q0Wkqed5nPShp02ndxmOVkj36c9sb3Ws5FPVZWUWfSdncYDMo2r93yvZ5UNfbdsM2gDyMNPZGN6mZenw6D4BpkjLkmbYzkgwdpBY24IWSCF0Rlt5fl00FDMBZW1a-vNW3DTtc0JatvNLVzAvdULe0LdtwuwRVYu7VFk3c4L8srXL-N5XzG1K2rWui71usa9L0Wy-rIuGxLPMq5tyvqyb61m3bmsOzNTsyy7RuK3r9tu4tFs2wbjse+DpDA39BNw-trlasTFNR6Qb3Q-JBFCWZRkk99tjU7HpPR2Zof45TYPPZ96fBhHwdCOjpeIjHYeF+AeORznpAeonunCTaEnVwrFfgFGbeyFX2cZ7IXfD8GZ0EwATDaAAsNoAPQ2gA7AstMYPTziMxY6-wJvqhlhztvu37OvO77CuS+Ll+W8fk9n3XpuP97BdP6-L9N6779f5-Qe3wHJ8b7+3PlLU+b9PbmyAQ-Y2gDVbgKvlbbW8D-4gOvnAj+CC76gKgcg4BPtsHoJ-pggBF9CF-wJtdbGale5D2fiPUgadx4NEbr3e+cchAlyYeCNGyc842gTlQpOZlYDvTMkTMyAju7FFsrjWu39gy0PkXtXu-dBG2AALQ2nEQPXiNpW5qNzjooQ2iDEGgdCCNSu84D70ENvGmQUWZ+TZmFI+JCCHW2gRAwOYCMEoPwWgiaDpyGeKCcovx39gngNCT3cJv8fFENicQ1BiCvYJLwTA0hHjcGeKSf4lJkCyHxI9rkjJ7ikG+PSV42BWSKk5MSfUypJSqmZMsvXThdDgwsOeiYqRpkjFQA7hI3h-Sx4dLCQTSRXDihZzGTEgmqAeFmXaUooGcjP7BkmbM6hz187rIevwyGZkZH9LYc3IQmyVnbIJssvZ3DArMw3qzLeAUmYlkcSWZx+ZXHJKwQE8paS6mNIaYCkJsTolXNBZU8FgSwWwqhcC7JiLalIoBSi4pCLkWYtRVi9FQK8UgrRUUolOCcXEsKSS7FlLcUEtJRS6lUT-rDNMUXAml1+nky2YZFOJyjpmRmZcmFBMunzMOf04V9ddmsKZb07Ciz+n8tuRC9h4AOUCszms3ukrnrlwRmZLyX0LETSsTYveLyd4OMeU455LiIpuL+ak+ltLyXOpqVS8ZkKPUMvhd6z1H9oWtMJXSslrrHVuqDeGl1-zQ3RuDVG2NDr40FJDYm7xEbk1prjRmhNWak2Zsjdm-NZjnoKt7uK5VWqCYnXZYM-pxzmUvQJpAG0lCZVcVESM3l-SW1TMFRKmt9bRlqqgpqzt9bTn0KEKo1tDDR3TqEFW+tJbIiGrAsap5B8zX2Ieaaq1G6bWczyb8-JqbC0nvTae6pAa-Vwt9T-f1w6b1etvTGnNZ683no-e+r9BbP0-u-bmv9gGAPAbfUB0DIHL1gcgxBlpUHYMwbKXBxDCGzKqsVVkbtnLbAVvruO4MbKB0auLqjMyij0PYcRu2+tFzyMPoJgAK2bZR-pOHlV4YaAuud4AyO9yXQTVjZyG19tQ0Rxta8LU7o+da-MrzfJSb3V821Py7XHug+B9TanNPwZZc+91T79PXp9QZu9GKw0Xu01p5DGmLM2as5Z+1KHVO2Yc9ZuzzmnNuc8y5+zHnvPuaPQFlTgXlMhcPVxgTE7wCMKw4Y+tPGdncvrVOntV7It8frmh3u0Wh2kAI1x+LBMekpdkEVmLpBB20aLQTAr9d0vKuS2VnTyrGNXWY-WiLE8bR1q443Ndu7bGbs0H1+TA393BbC6F0pfmvO+dm+Nqbc2gtLcm80mb83VvTc24tlbTTdumZfeZtby2JsnYW+tvb+LA2Ha2+d-bKafO3cu0639jn1ulptASKjXGaO8dE-XPLxX46iqS395Vn3+mlZy0pOV9b9U9dB4JuHgOhCZeegDxrDcEeRfB-WstgnUcExx1xyH1iJOk-65J+5bzLUjcp98jYnSjs7bu6+h7x2zvs429t07XPHs0rMy91zN3OcXf5wdwXbPmdPYF-+oX3OOdS7F-d-zIuWfXfl7z1X0vxey6E8qmryrsuVeh195H4AkcY7x2ltr33pVm5+89fR8PTcY46wKLHwY3d3LFTbs3VvOtLJI-0g3gmvfsXE9u8ntOo9U7k7mdmSmeei6uxLlXiuU+67T0ntXqemfZ+18rvPCv89K9Z1n4vFfNfp+e5novVeS8Z6Q8L6vMum8a+TzXtvfPjMKOB1xhrUO9f47txjnVQr+1cfYxhIPcWR+D7D30+tRve4W8H1P-CqdEuT995bvvZvV-G-ADR4b8ewqyeCuu0bimD1HF783hvnfXta9L+r7vj+5dv9b0-lvOuu-P8b9-g-l-h-v-u-pLkAb-oAZXh3sAeAdATnrXvfsYJICulBMwCgXpqHgcmZE7n7h7jXCJi7vPjPlxgTvXAfu9kQYfjcr3GPvXCHpFgvhRrIpvnqvgWsE2iwf0g7gTHVoJiIjymwbHhfhTjHufu8qftfp-pASAT-oXkgfXvAQXmXnXjATIXAYoZoWofIe3ggX-nISoQodoYYbocoa-qAbAeXloXoQaOgWHGpHYfjA4cuntI4epM4VYKgVVvXP7pjDvoPjwcJtwXolvmbuvlkIEWxsdLOmbnwZFlKHwlQb9qRoxKERjuEeqikWZOjoPr4WsBQc9BkbIJwf0jcifqFDJuapHiajHvTrfjodIQ0RYeoVYcYeYQYe0RAU0R0bnkYTYbIV0SYY0UMc0d0YMZ0UoS-r0Rrm4V4U1oJpEU4RNLMa4S4QrCsesWsR4RgXMvXAIfWmQeWuwcUIsdbkkQlqwdWq1mZCUfWiTpQYIf0pxvbnPofnQVEYQfKmkWvh9CQWbgwZ7q8Q8VUdTpJpIcIRIRUeFDfosMGEbm0dMcMRMdYWYYiaMSMT0YgaYVMViUiWiZifoeMfiUSbieiciQiaSZoBsdsfYcsVsXSZ4ZgZFsvvSWBNSQyTsTSUsWyayXRuQdgV8YHlwWOgKe1scVytccEXyt8YfgPofkUVRKKVxgUQTAqUIHERsr8cKdvmZHKb3KccGBqX4dqWbkbuUZ8hCTTuCXUSiTiYSZMQAQMQ6WAa0f0RoRSfabaY6e6W6a6aiZSSSZ6R6VAV6S6dEUMoMOyTyYyZsTGVye4b2kcWZO8YJmqeACmZFgaYCOKbYAslkf0jkYflmWsPcc9BVlKvmYujaHqYUeGf0hmYztKecfxn8bvkIT7s2W0q2YPgCQQSxjKVlv4VHnHlCeIVaVCTacGU6aGZYaob6XOf6UGfOX0YuSGVOT6audOeuX6XaWucuTMbybYYeVlFGXycqvsc7v2Z2cqoWTQtWTmW2vWQOWWQ+aQBeXgYkY8Uvs+dVloq+RdDDv3v+dxnvhjjWaqR9j+RlpBWIlBR8f0u+W2VeV+enHMUPgmaumTjUXYkNlhZfnTons6bOSubuVufuXiQGURS0QuaRRubRTud6WmYWaeUeXGRybSalnfv0uBZyYmYJs8X4LxdGUJWgceX2CxfMZFg2cwqBT8WZETh+Vcf0gpRjqWePtefwXBVgRpZFreYyrqcBb2TjNxcBQJbkYZX+bBTpcGHmR2XZXcRZdZQ0GpfXMWTDJ+Q5SaXQmhRyOadJpaWCROYRTOdRSRYxTReFWFWGVFcRdiZFXFdFQlbFfWjQdqlpZFkZe5fZUBU5VaLJbKcBbcVxphoPnpayulcGDxfBQcUxh5TqVKYKShWbkwYdF5XJaUTERjiybwRVQ0N1bhoBbEfeblcUNJXlTgb1bscquWc9IcYJiVfKd2YfnkRvv0v1fVtSD5RHqCcOaOSCSORaZOeRWScSVRWMWdRiYGXuZuXRfFRRUuTdVYXeTcZ1YPgtSOiNVkC1YqZWeFsBd9QGINRjm5UIk1RjmZUWUCWlZ9bYDxgAMzLoACsyiCNnhyNPcqNKB6NSq3JZ5gmRp41BZk1ONGVNoRVZuc1kW71FxYNg+5NGO1NLZdV++wFINnFHGSpLNyZwFZV9cM1EFQpY5gVFpQtu1h1wV25EViV91119FUtyVJ1lFIV51ytl1F15Jj6w+kpVZkZtZutbFwlHFolBtxtIlrFZtklgJlxhGMNrVwew1tNh+iFg+lNwYmWmN+k2NWQgAiaTAge3fBe22C+3oj+2ciB2yDB32ih1fDh1mLR2x1gzx1MmVXAUtZKX1rdaKWw7AUuXKps2yCZ1IUinM2j5A3EG21UyvWH4Q0Vnp1cYE1ZU1UV1CC7J+UKYBVi3+VHWPXy2hVJV90y1kU90xUD2K0PVy0j0q2S0KG0F+1I2rEm3m1G1L240r0YWm3L0nliVpkrV8Wk0GX60DWH2b3oXBi4FF2khJ1rCR2+hX3UJ30+1z1o0o3z0Y2v333v2BIP0ITf0b2r1b2L0AMW2n3GnIXF111m62XgMpVV0qLE173Bi52Ca72w0O244T5m700u1l2H7rWCZVWpmc3pHbUHX+Wi3YUJ4wnT391T3HUEmy13Vj0MPS1MND0T00Nq2q0a3D0HmAPiXb0LASX8N8NoS-1x2f0-0SN-3r1r1bXH3-3CPAOiNSPiPP2xlKOCMCPyMyNAMn3KNqMf0GNf0qO6MKMchCPmNaOVAWNQ3hxEOD4N1ZCF3tXUapHN19ywO6qNX1rO2LXCKeMEyu28jAUoOyDn3mVNkORyPkP4ViH7UiHR6HwS10NXVsOMP0NpMsMZO3VZOpM5MK3ZMMW5Pq2nVcOlPUO30mPmRiOJ1VOWMiOaMNPaPRMWA2Mh11NP1Y0L0aPNPdN6ONM9NR0dPtNGOG1mMDP9O9PqOTOqY30AJzPNVLW9xBNrCM17FLN60NXQNca+PLO2NH0QMY6OPtzuM13PR4ORYrPTI2i7ObP1pYO7WQki3xNPNd3JMC0cPcPsOD35Oj2FO920M8M-NFMFN5Mgt-NgsAucMVOsO-OAvfOwsLNuxIswIotVJovTQYulRYuVQ4vVR4t7gEtgFEsTgkuRLzX7PVX5Y2hQN-VtW4M53wOoPW3132OH7HOyC3MfPfna1cYPO9z80HNikd0UNn4vPjni1UMpNEVoUH4ZBoULXyugPjhoVylKuE0quUjbQtMzhoWFnqtOTat9VGvGWatrA0YGug1mvFC+OWv-JoU3J2t23WtZBkZOshwmvh6T3QvStlNK0wv-PetfPpOQtBvlO+sBuhufPhtAtcZjUnH5W9xcv8nuOZUSnZVhE3MBOuWJvPTJtUtm683KprPKqpV2PuP8vPShMesiuxM4XjmvPt3d0IuBvRv+sRsduxutvAtQvBvFN+vj0hslPttdtRs9thsjsttjuwvgvwtDsDvMOguV4fUZtdXAUcukBXNZBnPcvUuRMg7uP53eHKo7vQX7s5WruD4XMB5bNca0uZu1uiH1uBWNtX7QnjttuDv9uRvDtftLsLuZP-s-sAdws+uju-uLsQsQeAdQcgeztgdTvQegd9tAeduIeH4A3plMuyDXsyVmQJH9IqlCt7uO29yVsTKUv8Vssr7YfHuCbxuutam1r-UkMJPgkxNPuUPisKMADKrHwDAAEvxyfQAPLCcKMACq4nOj4AAAKtJzq7hZHmhWJx3WhVJ2pw0PJ5p2sHxzp5YmTmhdp6LSpwp3tFYmhQAMJmdrBCf6dZAABaNnxQTn9nmFynDQAAgs51kHpyZw0NZ257IAAJI+e2ChdBcGgWcNCqf+drAABiYXUE0Xawxn3HMndncXxQAAokl1F4Zw0AAOp5dCC5eRelclfgAADS0norlRW6O1dXj7iTg2DbErZD6XTXHHLXYrDXYl3n5X4Afn6XVnlXEXWXWQ43I3DQAAQmN5VwAEqVcAAilXvlBXawmig363HnawS3g3U3fXfDAA4pV5l9N6l2t5V4FxN7YAADLzeDc3cXfFA1fbeVczzveDfDdHfANpe-cn0De3eyD7fA+kD-dKc7VzHPuPOb0w8pfPMA--3w94Wce9eQ+kPt3dfWnlhAA"
));

export default createNewAscii;
