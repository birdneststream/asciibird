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
    icon: 'edit_off',
  },
  {
    name: 'select',
    icon: 'photo_size_select_small',
  },
  {
    name: 'text',
    icon: 'text_rotation_none',
  },
  {
    name: 'fill',
    icon: 'format_color_fill',
  },
  {
    name: 'brush',
    icon: 'brush',
  },
  {
    name: 'dropper',
    icon: 'colorize',
  },
  {
    name: 'eraser',
    icon: 'remove_circle_outline',
  },
  {
    name: 'fill-eraser',
    icon: 'auto_fix_off',
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
export const maxUndoHistory = 500;
export const tabLimit = 20;

export const parseMircAscii = async (contents, filename) => {
  // The current state of the Colours
  contents = contents
    .split('\u0003\u0003')
    .join('\u0003')
    .split('\u000F').join('')
    .split('\u0003\n').join('\n')
    .split('\u0002\u0003').join('\u0003')
    .split('\u0002').join('') // bold
    .split('\u001D').join(''); // bg highlight

  let asciiLines = contents.split("\n");

  const finalAscii = {
    title: filename,
    layers: [{
      label: filename,
      visible: true,
      data: create2DArray(contents.split('\n').length),
      width: 0, // calculated down bellow
      height: contents.split('\n').length,
    }],
    history: [],
    historyIndex: 0,
    imageOverlay: {
      url: null,
      opacity: 95,
      asciiOpacity: 100,
      left: 0,
      top: 0,
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

  // https://modern.ircdocs.horse/formatting.html#color
  // In the following list, <CODE> represents the color formatting character (0x03), <COLOR> represents one or two ASCII digits (either 0-9 or 00-99).

  // The use of this code can take on the following forms:

  //     <CODE> - Reset foreground and background colors.
  //     <CODE>, - Reset foreground and background colors and display the , character as text.
  //     <CODE><COLOR> - Set the foreground color.
  //     <CODE><COLOR>, - Set the foreground color and display the , character as text.
  //     <CODE><COLOR>,<COLOR> - Set the foreground and background color.
  const asciiblasterRegex = /(^[\d]{1,2})?(?:,([\d]{1,2}))?/;
  let cleanedWidth = 0;

  for (let y in asciiLines) {
    let line = asciiLines[y];
    let len = line.length - 1;
    let char;
    let block = {};
    let pos = -1;
    let actualPos = 0;

    while (pos < len) {
      pos++;
      char = line[pos];
      
      // This code and regex had come from asciiblaster and was changed to
      // work with asciibird.
      if (char === '\x03') {
        var matches = line.substr(pos + 1, 5).match(asciiblasterRegex);

        // \x03 without color code is a soft block reset 
        if (matches[1] === undefined && matches[2] === undefined) {
          block.fg = 1;
          block.bg = 0;
          continue;
        }

        if (matches[1] !== undefined)
          block.fg = Number(matches[1]);

        if (matches[2] !== undefined)
          block.bg = Number(matches[2]);

        pos += matches[0].length;
        continue;

      }

      block.char = char;

      finalAscii.layers[0].data[y][actualPos] = {
        ...block
      };

      actualPos++;

      if (actualPos > cleanedWidth) {
        cleanedWidth = actualPos;
      }
    }

    pos = -1;
    actualPos = 0;
    block = {};
  }

  finalAscii.layers[0].width = cleanedWidth;

  // First layer data generation
  finalAscii.layers = [...fillNullBlocks(finalAscii.layers[0].height, finalAscii.layers[0]
    .width, finalAscii.layers)];

  // Store the ASCII and ensure we have no null blocks
  finalAscii.layers = LZString.compressToUTF16(
    JSON.stringify(finalAscii.layers),
  );

  // Save ASCII to storage
  store.commit('newAsciibirdMeta', finalAscii);

  return true;
}

// Creates new blank ASCII
export const createNewAscii = (forms) => {
  const newAscii = {
    title: forms.createAscii.title,
    history: [],
    historyIndex: 0,
    x: 247, // the dragable ascii canvas x
    y: 24, // the dragable ascii canvas y
    layers: [{
      label: forms.createAscii.title,
      visible: true,
      data: create2DArray(forms.createAscii.height),
      width: Number.parseInt(forms.createAscii.width),
      height: Number.parseInt(forms.createAscii.height),
    }],
    imageOverlay: {
      url: null,
      opacity: 95,
      asciiOpacity: 100,
      left: 0,
      top: 0,
      position: 'centered',
      size: 100,
      repeatx: true,
      repeaty: true,
      visible: false,
      stretched: false,
    },
    selectedLayer: 0,
  };

  newAscii.layers = [...fillNullBlocks(newAscii.layers[0].height, newAscii.layers[0]
    .width, newAscii.layers)];

  newAscii.layers = LZString.compressToUTF16(JSON.stringify(newAscii.layers));

  store.commit('newAsciibirdMeta', newAscii);
  store.commit('closeModal', 'new-ascii');

  return true;
};

// Converts ASCIIBIRD blocks to mIRC colours
export const exportMirc = (blocks = null) => {
  if (blocks === null) {
    // Export the entire main ascii
    var {
      currentAscii
    } = store.getters;

    var {
      currentAsciiLayersWidthHeight
    } = store.getters;

    blocks = mergeLayers();
  } else {
    // We are exporting a brush
    var currentAscii = {};
    currentAscii.title = `brush-${cyrb53(JSON.stringify(blocks))}.txt`
    var currentAsciiLayersWidthHeight = {
      height: blocks.length,
      width: blocks[0].length
    }
  }

  const output = [];
  let curBlock = false;
  let pushString = '';

  let prevBlock = {
    bg: -1,
    fg: -1
  };

  const zeroPad = (num, places = 2) => String(num).padStart(places, '0');

  for (let y = 0; y <= currentAsciiLayersWidthHeight.height - 1; y++) {

    for (let x = 0; x <= currentAsciiLayersWidthHeight.width - 1; x++) {
      curBlock = {
        ...blocks[y][x]
      };

      if (curBlock.bg === null) {
        delete curBlock['bg']
      }

      if (curBlock.fg === null) {
        delete curBlock['fg']
      }

      if (curBlock.char === null) {
        delete curBlock['char']
      }

      let isPadded = ((blocks[y][x + 1] !== undefined) && (blocks[y][x + 1].bg === undefined ||
          blocks[
            y][x + 1].fg ===
          undefined) && blocks[y][x + 1]
        .char !== undefined && (Number.parseInt(
          blocks[y][x + 1]
          .char) >= 0 && Number.parseInt(blocks[y][x + 1].char) <= 9) ||
        (blocks[y][x].char !==
          undefined && (Number.parseInt(blocks[y][x]
            .char) >= 0 && Number.parseInt(blocks[y][x].char) <= 9)))

      // If we have a difference between our previous block
      // we'll put a colour codes and continue as normal
      if ((curBlock.bg !== prevBlock.bg || curBlock.fg !== prevBlock.fg)) {
        curBlock = {
          ...blocks[y][x]
        };

        if (curBlock.fg === undefined && curBlock.bg === undefined) {
          output.push('\u0003');
        } else {

          if (curBlock.bg === undefined && curBlock.fg !== undefined) {
            pushString =
              `\u0003${(isPadded) ? zeroPad(curBlock.fg) : curBlock.fg}`;
          }

          if (curBlock.bg !== undefined && curBlock.fg !== undefined) {
            // export will check if the next char is a number and add 0 padding to prevent clients eating characters
            pushString =
              `\u0003${curBlock.fg},${(isPadded) ? zeroPad(curBlock.bg) : curBlock.bg}`;
          }

          if (curBlock.bg !== undefined && curBlock.fg === undefined) {
            pushString =
              `\u0003,${(isPadded) ? zeroPad(curBlock.bg) : curBlock.bg}`;
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
    // if (blocks[y] && y < blocks[y].length - 1) {
    output.push('\n');
    // }
  }

  // Download to a txt file
  // Check if txt already exists and append it
  var filename = currentAscii.title.slice(currentAscii.title.length - 3) === 'txt' ?
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

export function canvasToPng(canvas, filename) {
  let downloadLink = document.createElement('a');
  downloadLink.setAttribute('download', filename);
  canvas.toBlob(function (blob) {
    let url = URL.createObjectURL(blob);
    downloadLink.setAttribute('href', url);
    downloadLink.click();
  });
}

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

  return [...layers]
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
          if (curBlock.bg === undefined) {
            curBlock.bg = store.getters.currentAsciiLayers[z].data[y][x].bg;
          }

          if (curBlock.fg === undefined) {
            curBlock.fg = store.getters.currentAsciiLayers[z].data[y][x].fg;
          }

          if (curBlock.char === undefined) {
            curBlock.char = store.getters.currentAsciiLayers[z].data[y][x].char;
          }

          continue;
        }

        // break;
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
  "NrDeCICMHNwLgAwBpwDNZwCzPAYwBYCGATvOAATgC+SEM8O682KBJZlNdGjGLeRUnArVaUDADZMKJlhxshIruPhSZfeYI6juq6Wg2stwzmPpw1B5pvYmdKxOutHbSszydyXi07ov7ZfgVtZXNLQJsfezCAwwFXXwdeZ3io0I8rL1SQ9z1PIOM3P3C44Lt0vMyChOiMiO8c4tiUsqKHEpbCxJj8yMb25qzW7slB6rTc-16G8smOoa7ayvrs2b9khZqKqaq+tYHp1bae3Znj0cPhpZ2Vq+358f6T28X7sb3z5dLXufezkYYlx+6yBW1+oImTQhTwupyOAMccLukw2j32z2+YKhSOBBxxWKS0PRdUxkMJ+LJ5lRHwR1P+1w2AEZ6dsmSyUZ5mfCGZz2SDMlzkfzZILcVTedzWRKhVQALpIMDkl4E8UUmGAtXEr6dFWSImfCz6hESI3XE2ag0PGlmv6Suamt4OjkW422oXtJ3Y5WU2He9U3Un+81+rUBnU+7WbCNhqNBz0el1m+MY8NBt1ivWJ+7JzMhy051QFmNo-NZ8Flr2B0PBquW9O6jV511Fmup6v16NWvl4ps2lstjv+ul24W12lF4fu1W9qUVpVjnlz6cL2cz50i7vL+CihuIjcjuUK0dtg2TjONlfltfFAe3pe5y+Vk-N++Rksv6-z5991+G39dkcE0-MI72A31HyAiCQP-UCoIfb9HX-Qdq1ghCrzgt9rUQsDMM3eDY3bVCCNLHDiyw9cMLIvDCyQoj32uLlSIAqd8Po7DKLPXdOOjbihwnfjf140MhNPATSJE8dBOlYFD0VLdiMk8S6PIm8YLUpjlOoqjAOgpjkINAB2AAOItGIwHdFAAWyTdTKNbBSfz0zSdNYlTILQ1SNNsjyezs-TjWcljcJc4Kgu0sLmPPP8vJiuzAqiyLd0S6MzJ88xUoc7YMrYyZsrclNMvtWjiqckq-PipL-Mc8qpNqpS6o4z1ZOPQqWpyp9WvczrdJq0q+so4yKs7Ib-QyiyyGsrLpNcSbcumqyGPmiabNitLwLW0KEpGwiyo26LeoOvb7ParqTp6o7+127rXK05K00u0i8q0p6QrgF6wveqLPt3b6UoeuKrrO9brvgABWCTqr28HtoNaHAfy4Ggc2rixMahqPOar8QfCrbvOxu6dtIwbf2JomTPh26YYRMazlmvwaaOOmHAZ1omfSpbhDZ8yOfALntx5vn9qOqr2OFqnIfxkXJlJgbyf6sWKdegm63F0XJdVubf1+0bTN1rW9cejWOqRnHKqN3yFfl9XFYiqXjYRi89oh1c0evTH5JN5WP0O62yaLGW9oD-GDJbEObYSu3mYFxaBVpmP91Z+PucZpP+ZTqbY-TyY5YwAAmcnE+2HP4HzuP7jDpiK7squjpr4PQ4b-86895uHbgIOTY7tuu60nuldb56Dco7XQxHg0x+poe9on1PsZn8vG8r82Cs9yOV7br2JdX5eSSd1G9-R1r3d37HnYog+-ZJ4vsb7sLb4Sgf+8X6up7esvNYTwpBZZr-Z-Gzm-7vz8NfUuWdgGeFAYXbOECC6-yLjAoBDgQGwJmtcZBiCwiPwilgh+z9a54Prk3AhLdiFt2viWQW5CPjf1fibeeH9h60LbvQ+mpDbo4KShw6M99dw8J4vvU+AiTZnzam3ERWNhFCLEU1eUckT6SMPgoy+yjZb+yoewthT8iH60zlA1hui4HQMyJAwx4DfzqNehYsK6CwFIIQbY8wNi9F2OMSgha8DXEYIwE40x7QuFBn8dWQJlpgnGlCWacJC9tFL3MfqShcS0EJI8XmeJFpUkpMSWk2edCmEaOiS-fJgcrFRT4XxRR0jylaXER7Cp9U6muwaRjWRoiqlSNaVfNRnSOmFMITEvplEfGoOSXnNxy1hl7WKbuSZ0Zpn+lmaGQZ7ijGyBMUM5ZIyvHwEWWM9ZJdRkAO2AATkiZMTA8yDRnKLJc381zSK3MosczR2CiznPSQMl5HzYlZPGcRN5J4aE6P6fgnpJDukqIvo0wRlTXrVPkbUyFSiEXwqaUeCRyKoX1KKV08FN9zlhKebgkFZD7HOMcSS3xZKvmkTxZk6lny6WeIcd48layzErP2bza49y9rcuxo838-K7k0qOScvwgrKK8pNpKtu0qtKvNpe8qliqGUZJ+RQhV-zsnMIJZwnVnZRUOFKaGI1oloVhVhY7DFSL2mYqtRC+1R9mloptdamF2LVFgo9UC3pBTvUm22Qc3ZcBVlLLZcq8NEz6URuDRyv5MbNlwADZyn5Iadl+Fla9cVe0s18oNeYHNUrhWTALW3EtWkM1hQrVFeVariVKsjd8oN6ra0JprU26hES9UBK7UE91WKzVRQtXuV15q2luoHSjCd-CKzH0tYih187cV9qXZ64FfqN55skJurZLLQ0uPZa23dab90bKZTuxlpLmX1uxkWsNezD0XopXwW9Dgy2Zu3VgF9+aP1vsrV+jAv6opVt3MB6MoG5lRobSq2scbm3tofaq+DZ7E1JLmB+iQ6HMM9sMv++AJrFIjsHWO0dU6ym2sXRR9F7VZ3DoXVR+jLq6O91w+3Fj+HO1Eryeurj0bU2BrvfG5DSbYN1ug1BiVLHAO7ik2Blj4HQzyYNDJ-0ynQyqYuXJzTkGb3af9ahgTcGDMdpbUJ-TJ7NVRO41oqzd82N2eI0R0jwkHOTvIwx8dbnGOOtRTUrzlG-PuZI55jzXrQv9pxZ3FjGHsP4uvXx5NQb4txqSxqnT17C1XK0zcrLpF1MIkU-lnLEnMu6dE9Gwz5nfmpYq5SxDRmE3Rc49Z31YWV0Re7vZpzprgtBcI65vr06euOaG1iGjbIQtMYm3a6b-mpuzds8uyLi2N0xY4zZwlYnBOXvPQe0z6WyviYs0h7bKHG31b23VyremztXeM8dp9O2YPVbu+dk7bbihYaa88r7G3WtLdXW1v7HXlsBdB3NwLw2Btkah85rrBGUVyMtf-brydetpzR2-KbyP4eY4x-NyHk28fA4B-99rPG10tYp4drbD3TuXdq09kz1jSsIcZ-d1lt3WdHde7T97nOLts55xzhn3P+cnca+t3VP2peS+4Z1snr12Mu0JwTmbEP+vo9V9jxcn8Ne461157Xyv9d66N+fE3kIxs8xx2blp4OwdE4dyU+XQPmMg8Vy78LrvmtU7S-Tq9m2asB8F1HQF5WDt+-D3Klnr0WGh8DxH67-vHui5F1VyzlOfW+9BQrhbJP1eDZhyjlXevF226xuX+SleT7V6R4b+vWOG8yidVXpvqv8el+J7n537u8-d94Z7wHXvh9Z9H0nkPafx-U5yWH6fL2xfVpj8z-bg9Z+R9T8HjfKf1876D9vvfFhPv97l73nvcOddF5xx3wvJeb8W+h5r03ben+N9fxj2vtH79rCtwYl-jv7cAF97e5AHZ4rbS76qrYZ6gHk5j5gGkSgy5xFgIFIGIG-jIEWiAAhpM9lzrvtqivpYkvovvgcvgntHmgagfARQZROgZQSgfqFgVAbATAaTsAe3gXg-mrk7p3lwXfh-uNu-s-rwYIRwXwdbhfo-pbi3jXjwRwSwSPjnpngodAT7kwSoUoaod9rLt2uAf6DQdQVQSeAwZMHoVDAYcREYULjMrkrHoQVMrYVYcQUQaQQQY4buCYdjO4SbJ4W3N4WcBYX4pAWhoEX4ErtLCxkOhES5nftfiIcIbDrrkIW-gbkkX-skc3j5tIYAWwW7vnswXAYofkXtLnGYSbMUVEf6GUb+JUVob2jobUTUQaHzpPoni0WQc4R9PYRBq4Q4e0U4VHi4b0XYeQXQZgdcL4UcP4ZgsEQEXUThqftwVkQsf-ssdkSkYkQIWsbEZsfEajmkXsaNlIXXosdEV3qwTLgUXkZca9NUZfuIZwdcSUW3DcUUY8VpM8djO8aUa8Q8UWJ8U8d8WFH8W8QCVFECTYWvjPoMT0f0SQTCX0XPm0RPpvunuznulMbMbFg0ZiWcSfrkR7uUTsbfrIeiqIb-usfseSakVSZSTSY0D-gkcSTIcaoPuoayYUR8SCbuGCSsUsasYCZydGNyaCQKRUSKaGEKVyWKQaBKYKVKQiDKaKb8XKdcAqQsmZs0YidPNYbCQiQMUifvvPhqQLlvnAKDAAMxIEWndFdFYlrYXFqGnHyGOn3E8knFMnF5f4emkkMmEmek25xFekBn+kHiHGf7em3HbChEhFRZH72maGUSqnSnKnbCJnynJmTCpl2nKHxnZm-Y8osbmmWlIFrwYCgwlmqBWlMSVl2TVlQzlmmn1lNHIkH5NkGkJpllFloG1nYwFZcosYFmNnTHom2mRksnOlyEul8lTnUlbEbFzkUmzkLm+nhkSF0mhn8HTlun4l4k5kaF5l7nnG5mHkHkQEYlZknk2nFbZYlZdmdnwH1kdloEPn1kSDdmexvkbwfm3RflKw-kRR-kJQAVuFAWyadFqnWngVQmXlHmnnH7+hRmGpjnulX7sHLlBl3Erl+kYXoXG6YV4V8j0m7G8nEW4lwX1Fxn7l0KgymTUVay0WPT0XDyMXTzMVzysVUVgWNGcUIj9k3lCp3nUEgW6HPnFmiVPliX3kSWCUCX5ncXYF6m6k6m4FXG7lsk5FkVzHn7G4xG+ll44Xm74XbGBlGXBnpGI6f46UekTnWXjm2XqVMVDnmTsWlpCWjzOXPTuWZquXjyeVKVT7KUKUBV-p8VXnwHeUIiFm3lRVVkyUeHhVjHxXbCRWSXXmpVQWQVwlDHpVcVnmMFqXbkaUIgIW+bHGMmlVoUmXYWVW4X6UtSGVmV26ullUgFD6tU2X2UsWOXbi+VRSHKJW5Q9U-SDXRh9U0VyVM7wlBVAZFayVpWhXSX-j9XFBLXtArVhBrWlkbVgwiXiVzWzXZU8XjWonQVTXHn5WqV2UFU4nNWbk3UkWLkzkVXzmPXGXPW0nf7rkElWWXUtXtVXVOkeXzEpTDUqZbVvQg1uVFijV0VjUw25WnIzU9mI0ZZ7VI2xXvno0+Fg3JXUE7UpX8Wo3+VE2tGBXE0qWUXsnnVn6FXXDFVwrIV3GWWmVLmvUs3M0vXs3vVFCEVEm6U-XU3XXMlA2jQQ2aUMVQ1g2Mii3UzS3XDQ3i3w0fZdWfohX7XzVq0a1o27X4241SV1l60eF43q1a0E2m3G0o1m2a1U1nWU380D7C180M3aWoWs0c1VVvUPVc2c2e1rkZFzou0oVO1hEO1i2C0+Uh0y0S2w0K25aS2y15W23k0gbI0yop3lpp2vSPk6363a2625053Z2G2q0m3m2p3F0W2l3p3K0S4UX207lAZXJfWB3lXfVB2NW3VPVs3u1d1cA82Tn3WO0t3N1NWD0j2h2dVw0x0OWT3T0jlBGK2vrHSlrx3FpL1aSHIr1ipr2Zqb2L1Q2735rb1hQb1Q1H29Vn3SYH0AYX0jU30qZX3MAZ3BW-hmkP1wCv1Fgf0L3Dm12wVh1FVyaN1aXm5M2M0B1gNt3OrVUGW1V92gPO2QMlVj3D0d2t3-VtV23A3R2-3aFz1K3f1bqn1EPhxmwCp31qbkNKaUPeyWwPLUNbwbz1mHL0NHIsPoR7Rf2kScOUTcMcNv28PYwCPW1-0wW4M4NC310D1oPINcpAMjZbmVpyMRkwPQOgBwPgMIND0QNaPbD1n1lDp014ZIXoN-W-UypKOiPkXZpsNb07zIydhMM2N70kPRhCNtxuNaQeOvReNhQ+NRR+O7gBOuP8MhOf2hMv3hN4MzFRM-2WMhIWM9lN3aOKM3JJOaMpN3JpMqMe0fV+0WUaMgMFPt1SP5YJPwPB2SOkX-203GMZMSrV0fpBP+hNOhgtMGhtMIgdPXBdPbA9OTB9N+ADMOBDPmAjMYBjPwATPv2RM8MzN8NhMLMROLNcNv011xPYnrPnlSplNFNQMyPpOoMoMlPJOHMnPHO92fXAPFMKOnMHPnOFOIMYCGOsYR01OvOjkNOfNLPfMrPLOzN-PzM-P-NAuAu-MguCNzMQsAtQvgsmxTPwuQvCNiObMJ1J1gY7OPP+2Yv5PYt6NZPXN3U3MHF5ORFXN7O3MPM6OUv7PUsC08oYsmOYP+h4sEOqCNOIvuMcueNcveM8u+N8v+Nv3PPPMIvQtwsCuBMSvBNiucsytovIsXkKYMt1O83SMN2pNkvmAsvyOEu6uj0ySXM+mu1Esmt6tqsgbKsUsEv6sWsas6s2vot2viPxOVPNNStutyu8uev8vvMVM00fOusSMxPjPuutOhvtPhudNCsxlfPBvMCWu2uZOat8AJumtKtOuqtHNpvmuSEktiE1WqPkv3PWsXKptmtZvltnPZsVsOsKtItWMYNaQ41QzY1g3Cu1N0uNuMsdVdtmM9vlPRm+uDuBvj29udumPjuJ0OnyvptJtzv1MZuJPJtYtUvpplu1sbs5uVsXN5tkk+2d3FtFvVtVvbu0uHtINWuIVDtXsjsAPXvmDNtxWY39tY3Pvdvvt9sfuTsvtNutv3ubVvuftAfftft13+t+vVO6PruluLvbOwfmPwe4vQelOIertHunslu+B92YUDvoebs1swfzuZsnv4ckejsTtgeQcQctuAcgfAfAX-tGOMcvPRULVhW0eUcA2Z1-u3sJUcdVNcf0cCdjuccieOtEdLvsesf0uocquScLsSdweKe7MXvFvYdIeyeXtavIeyPLs4tofae8cBvgfDsmc3tmcPs8cWdPMduideFtu2fCcUfRiPv2fMfPOuevtGfUdifwWOd+fueAOaeJtsehcyfKflo6dJVWcKexfhfKOYc6DqMacRcGcpvBficJd4eEdxe+dBtUemcFfmdFfmDtuBflfSd5fkdMv5eCd0dRSee-sVfWdMfeeFd1d2c1fVeReVdue9dedSepdyd9eDdhdPsZfMv4vZdYeGtZeqfHtQcTezu5e4eGdDfqt3Jx5atbd8A7fMB7dYAHeYAHdldtfFcddgZHdXfNclc2c3cXcBdnelf+e1dVf5bXc3Ifebf8e6ExcF152jc0f9dNfA-cc-ehiNevTasJfJdpfxtLc5fxdI-yfI9KcrcIffefdXJfcSo488p489kE9SpE8yoHeby6MncvfdegdOddd3tPd3cM-7fY8s9Y9s+Y8c9jcjdc8+FG1A+A-jdWzbyg9hSQ+i9g3Q-Ec7vmWkvrcheo8Y-o89dy8ud-co+C888g8C-c-8+a9g8i8Ndq-C9C+8+s+c-49m+4+W8W-s9W+282-m+E-W8a+6+u8u-u86++w+zG96-i-g8qwuO-f+8RUS9Rdnu5sy9TfzeTcI8ocq8x-a8De++G-B98cG8Mfp+q+p-RfZ-sNe+0MF-59O-2-F+O-E-O-l8l+V9l+k8V+19V+MN2OmlG+lpRYvlMOSad9Q1d+B+EzJ8Z+J-K9zf00hm7v2tbvLfZo9+5bT8PKz9u+e+L+t-d9N-k-Frz9F8++F9b+b-L8Cob87+H+N-7+r-t8r+99KZt+n-n8m+3Rn8n8X80N8pX+P8MN3-X+Z9B+f+T-90Le0Cw-DdFeCvdegfyT4L8wBHvCAUfxAE385+H-GfrAO37H9b+maUATANf5HI0BSse-ggIwHr9EBz-Jvochf4oDbYBAk2MQPgFwC8B9sdAbgNIERxyBe-egf3yz7f9Eev-DDjRkl7q80ewA1AUwLoHUDB++vBgdJhIHCDvezAyQVP0EHYCiBEgpAe-xoGvpFBu-IQbIIf5iCHGCguQWQJUH5osBx9Iwb1TUFeEcBMg9QfIIMGIxpBmgkQX71j66dx+M3PJjwL4GECtBrAr-g4NMG58-AYvPwTYPsYqYTB4gqgfYKkHKCWBSg6wdoNCF6DGBwQuAJQK8GRD0hVg-QfELUxmDkBlg6AXEPyF2DMhDXPniUPCFpDPBMQyARoJqGiCleUPfFtwLD5rsnBi3aoRQLCEjUCyLfWoQUKyFRCBBlQ-oUkI6HFCRhFQsYX0PGEzDohgwgYRkImE6DhhswwobEOMERCqh8w0YdsNIbZCA++wp-ksPujsCQ+-g1QecMs6XD0uLgpLqGXcFADeBjwpflr28EQ9eh9Q8AXMPWE7Cfhew3YcsMOFv81h5QwEQCJOFAi1Y5gg2scL75-CwR8IiEeCLhGgikRiIlEdCPzqoiMReQr4Z8OxEHC3hsMD4Y4N8GTCiRcfBoQ1QcAPDphdIoYVMIZFFD6RGw04Wn0ZELCCRCIVIRyKCG8j-h6Iy-okPJGLDVhrIyEcYTKGwjCRoolkXyOZFMjBRRwsUfKKVHAjORnQ4Ud0OuHwAeRyImUXUPFEUj2RCoo0bKMaFtD-+9wloTSJtFrdTRG3KkY6PNGkinRIorkeqNVEeioRKogUd6Lz7SjlRcov0YGM9EhjcR-ogIWDT1F4jXRsYr0S8MVGGiU+Kw14S6JTFki2BmYhIckJjFbD4xA-B0e6M1GpikxHg6jNaMtGtD4+P-EsTWI4HljfR2o0sWaOTGFj0xxYpsTmOzE4jvhkYi2PmLbFZjjROfNkaOJ7FCiWxCYrsTkJ1EpCehc4vMYmNbHLiMxI44wtGK6E+D1xUYucYEM7HBjmx9YykQjmrFujMu-AwAUPw7EXinhh4hPjuIuFjjTkWo7cQWKPGPirhz43cd+KfETizhv4r8f+JNHvjux54sCZeOdF3iyxzw2CfePeGviEJVY20chMMGLiFxgEgDphLBibi5x+jGRGP2H7w9jxzg8CbONQk3Cixt4xsfBIbFwSYJ146CSuPolXiLRJE9oVRIfGgSkJ7El8RROImcTaxLE6cYxJokMS2JZEycbxLFRBdpJKEuSWhP4lYBEJUkySSeKYlQSxJrEmlmo1m5S9w+GHabqRMgny8NJpkrSZpOEnmSrJ1EmyVxLMm2TRJdkoSU5NckSSTJjk9yQ5PskWSDxXk3yZ5OYluTtJIk8SSFOsnBTQpQUsKZZNonqSApPkmcXRMikRSYpqUnSUZOl4QAjWiQI1gACp7AOUwqURUUAABlYqauWEAAAJCqZ6QADytU5HAAFVGpZwAACqtTAIRrBqcoCNYtTepJUsgB1IGmVTwA5UkaVhQmnI4AAwp1NaAABBOaYUHGliAjWNUqaWcAAAyS01wAAEkdpigAAHIHT+gRrAAGInThAPU1aYNOEAAAlS6W0CNaLSNpRwFadlNungBZpr01oPtJ+mFA-pN00ablM+nXSPpo0i6f9IJBGthpQMz0utLhnI4AAoo9JBmjSAA6o9JRlQzFA2MxGWcAADSqMx6bnGJk4yyAL0-GUcAAAKj0h6eTP2BGtSZDM8AAgBJnsyWZaMz0gVN7r-8+ZajK0UeF5kCyRZwssWfzPFmiyJZ0sqWbLMlnyyZZCsuWYrJVnKy1ZSsjWVaNlBAA"
));

export default createNewAscii;
