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
          block.fg = null;
          block.bg = null;
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
  let hasReset = false;

  let prevBlock = {
    bg: -1,
    fg: -1
  };

  let optimiseArray = ["▀", "▄", "█"];

  const zeroPad = (num, places = 2) => String(num).padStart(places, '0');

  for (let y = 0; y <= currentAsciiLayersWidthHeight.height - 1; y++) {

    for (let x = 0; x <= currentAsciiLayersWidthHeight.width - 1; x++) {
      // Determine if we need an extra 0 to pad a colour
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
      curBlock = {
        ...blocks[y][x]
      };

      // optimise out half or full blocks with same bg and fg, to save width space on export
      if (curBlock.fg === curBlock.bg && optimiseArray.includes(curBlock.char)) {
        curBlock.fg = undefined;
        curBlock.char = " ";
      }


      if ((curBlock.bg !== prevBlock.bg || curBlock.fg !== prevBlock.fg)) {
        if (curBlock.fg === undefined && curBlock.bg === undefined) {
          output.push('\u0003');
        } else {
          if (curBlock.bg === undefined && curBlock.fg !== undefined) {
            output.push('\u0003');
            pushString = `\u0003${(isPadded) ? zeroPad(curBlock.fg) : curBlock.fg}`;
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
        ...curBlock
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
            curBlock.bg = store.getters.currentAsciiLayers[z].data[y][x].bg !== null ? store
              .getters.currentAsciiLayers[z].data[y][x].bg : undefined;
          }

          if (curBlock.fg === undefined) {
            curBlock.fg = store.getters.currentAsciiLayers[z].data[y][x].fg !== null ? store
              .getters.currentAsciiLayers[z].data[y][x].fg : undefined;
          }

          if (curBlock.char === undefined) {
            curBlock.char = store.getters.currentAsciiLayers[z].data[y][x].char !== null ? store
              .getters.currentAsciiLayers[z].data[y][x].char : undefined;
          }

          continue;
        }

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
  "NrDeCICMHNwLgIwCYA04Bms4BY0GMALAQwCd5wACcAXxQhnmTU3l3ENPKtvqyYyxsOZOJRp0ofVANb5iIsT0mNpLHHM6juEholWCNC7bxXMD7eV3Em9Z2Rc2KdUu+odHry2zLfCrS3X41IUstT0D9ez8wgJcfEMdjLyDzaKcbFKjQ9OTI32ykiNcEj1jTeMN-Z3Lgypjq71r3Koy8kpbc4rqcoorm+tau-p64prTC0dSC8MmsxJmaqfmyxqXShsz85Y227onFufXBvvGF1cOO3rHplc32gc6Tm52h09vd4f3zraPH6+3jv9flc1pdZj8wQcIQ8QRcYeD7iMoYivnc9mc0Z8MR83i8ngC-qD4cj0e9Xs9AUSkd8UdjyQTYdDqZjcZS4cycRTCezUZyGQjSXigZCaYK2UzefTgQKsWT8dKSbKhVTJfKRSyuYzaXLhcTRUrxdrlTzrNQALooMDciV0tV6jX8xWs61Gw1il3urWemXOr0Gj3+v2+n2akOO-XBqEABm6AE1bWoY8MAPIJrBJtIAVTT8Azoej3QAKjm4HnHAAJEtlhQAUSr3QASvXhnWdenugBCZuR77V8gAIW72QAgkPHAA5McKSdt3PdVvG0vdAAiU-VeT7ogAwmvRJXZ0vhqOD5vwMWT0Xd+AF+LT02L8Muw+e5tT+fF6eAJJX+8f+dX1dn3zXtulTIDHAAMSvVVE26ABZK9jz-YZAOQl8N26ABpK9v3A6crwAcSvABlK8AH4S1dAN0KlddaPtPkFQjYCHSY1i6LtDl6K4ziYJVSjvSdFjGI43UeLEviTQPV1zUtN1AzDNiRIY7jJJtaTBOY8N2JU3iBIUoTtOU8T+I0gytKU1xTx3PDyCQ29ulI2zRHfBzzNfUCryg5zwG8tDhKsuMrzA-zHGzHzfzcmifGsq991ChR7OtL8rxnBLyCc9LRDQHy1NPAB1K8b2SzSPOGQqfOKxlTwAGSvGysvAEKouyBDKugq94x85qSuGcLGsi3rotg4YGpaitEKvVyhuyTLxssmLuiS6rLzM4bTMXKigwCvTco6tadok-T1qkzbSuMtStsU0SNvkk71LOg1ZKtRkEHO1TjsO27qK+067uAgBWbjACTSM4gc40GVnBsTIYaaGqVhmw2BGntkfbcy0bndy8je7HXFx+6Cd+h75vIaaVuGeLSdEKrwVPPLugABSK4Kr2Zny6vany5pmxwAHJ9savzqfAQaKbSWmCxbQWRbFun-x89nGv6kXBw5nD6pl3mFB68XsmF7WbqxiWrwANQ19WfNQkXdfl4YAClWb252Gkxw9UcCjHPY9xavd9n2UcBkGweDqHQ7h8ObHh9lEZ+oyPoO+Pdse+6rsMhajsTjPvu2gFnvFImk8zlPibTiyjZJrxo6ZWPdGrxFa6wevukb+xA-DN36bON3+ADuI++N4DO-enxC+zxgR7UMeK+n3Sp8nvgF4nvHR6XxA19nkzl8Jjfd5X4v-qLnPrrn4-04rsudK3yvc-Hm+T+vy+Ls+o+-rju+n4TkvX-vqFN8uten9k6Hw-oAsB+8z6HjEoAZNIzhJhgXA7isCVjDz9u3JiqCB7uyHt7HB-s8HoJFM3YYrc4DELSKQ8h2RSFXwARAt+t8L7gNTswik+drT-xfqA+hv8yGRyrvwuugim7CLbujLBvcCH9ykeULBXcVjwKpMghoij2TKJAUwnhQCD7vyIaItwhDT4MIfnQlh5kADMrhwY7x4ZwlYlifDWOAg4tQTjwwuJERYqxe8zG+NLqwxwgBg0i4eQYJWdQkhKMbw2hkTH6aQ8fANxTEEl8K8Y4nx-i0muPid4rRASMG4I7oUgp+CimlJKYYuJeTzKqKZOorwtTET1N0JgmR3g5GaVaWUypXwukVPEW0+REcIYhxGWHMZ39uF+J-toyBMSeDsNevkzR0ymJUMcJQ-RPdpASJ2W0yR3TpGHNkcBRp3RmnowQQopBsTTGZNWSs+5QcJlI2KSKFJSSRR9MeTMnJ6TzLVwcT2QFmkQW2IyT-Oxi4oUaKibM4xYiTlBO7vjPZxz2n7LRVMp5vzbGIkAOmktySwwo4aC1wQLnlqApe43JPYPnLL1N8xlby9T0rQQM9FQyo76PmZMn5TEznDAuVjK5rsWXUiZRK1FnTxW9NlSi8pXz5UoOVWKxVzL1XUnWQoTZLzdFwoZVU1kizwQksYQagF+jtXkFIdsmVo8sVKodfaqejqNWus0oKtIwqoFKKJeEi1DzA04uxbi4FWzVU2DZXS2lgzDVfDBeGnw1Lkmxppf8mNGbnFprvma018b-V8tEISlVzr2VIv6RWp1Hry0YrDcTBABKMR2rxRC3NfzslZM8UmqlZLk0uo5ZW7B6bO2ZtHXGy1erzVGpDfyudeovXZB9YuxwPrJVyrLbsgdg9OXbuHUOrlXh10Kp6Sewdeip2eJhoW2FM684Whevm6pPaEajOvaWmtW7a0HKHT+6tRzf1uupCuhQPreW3rufWqDoaYPvJzfOrVEbNUbtPfY+DepE2UqwCmhDak81-zbTPQjUT8PfFI+B-Vd6FCAFzSM4AB2dD1IGNZvDMx8drHGMoYA7hm9yQW1pEADGkvHdDRuzSx1N4meMHlI5h8MsmJPsYU92idL6Y7Cew5x9T59g3Qakyom51zOJrsjUekzLTpXfqA1xndB692HvM8hs9Nn-3OYw1anlz8A3pBNQRyd77hn+deY5j93H3WhalZuzFe6-1hdc8BgzRaqN6Yg1p8uOmlOJI7cp3dtb7PmFQwFjTuWsuZa7aVsd2WMupJsTVhtxHr7kc84lyDTE2OL2GAAe3o5plYbXt7ZC671nrDQ+vVdnel9U-HshCa83h+rc3n11bK2NuT5KSsraq582L+6XM7dZcNqNB3KMteS8d1LFHdAgfIMuhLNgruiGM8FtVn6ovFbex0yzdmvt+dfbNm9PmyN9sC6Zp7QWCtg-C9ZvbEWXvopizD89228sir9X9tHzXztNZS+jw7kn9t4+pKJuHVm31FY++TlTlOR2VbgwTr4RP23gqZ7V3TE22dMaO7oUbm9AAApN1un-PFMilG1tpL7PURTccDNjH0n1ui-p5zorQv8fK8J4r0rvafvwBw0j77FXytidVwrgXOOzum+nSd8XmOv53duw0u3Dnwcg9h7Z97VPAPRZJyFuLCb3OXu095h9Bcge-ee4jhHPunN1o9592PFPwz3fADdoz1vgFm5lxn7Hmf0+46N2cBnF7Nf6427TvPaGTdh8j976HC2WeM7r0R5nS2g1i9bwzYYYSRvq7gCLzS3O17I7S235tFnBOp-nk3yFBbZdu5y6puAOu1cV+5f25b8v8-d4uyY1LBerfm+3-vgPlv4sp+r4P49Z+9fu92+f0f1-dda5rv9oPpLH8Nyj7f0HzvIdR-h1Dv-v+XuleNeiCp+2eFu4+cyWOOeMBEBh+qSwOQiq+xe6+5eZeDQu+S+6BueNOKuuBWB+BtezexBU+k+9e42w+twbszGFCoBE+PYtSm8nMGwkqpC-e5k7BPYnBwE3OQBGQkuCg0uWeweZBjeLeRBc+huhBG+y+XgmBvuyBWG2uV+q2-uQ+xu2Bchm+0BcB4BB+ehR+dBqO+mYBEOVewBn+Tuju4eUOlhNhH+Ieam4yiB+hoAAOmwMmSGVh+W9h1eABfhfB3+5hZhIBARnqDurhsBkRuhwhWhshIm2hNuAiahAhheZOr2X6KBcunu0+0K82xK+RM+DeJGuR-BrgNB1CI+PgFRGyRhBuCe+M3QuELB4qbBjRHB7RXBnRPB3R2k1B3QQhr+xRDWhRBhC+3e8hMhmhCR8RSu0hzh6RqhRe9+EeoRGBExGxsxhh8BW+2xYxux6hdRdSDhs+ru8eMemRKxChLhexwh7hOMjhT+l+pxN+ORceVxgB4RphURtxPxhx8BkxaB8x6xWxBivhwB-hhWyhLxD+5xrxMJlBeRohJRyJIxqJEhsG9o-RJCRxqBLRmqpCjB3Qas+JlSbRq8HRFJ4hgu7WL42JY+RRJB5BpB1JjJrOqxdhwRQRaxIRg+gJUJ4xa+2RQpb+LckBCK-x+xOh0RMpKOaiJxcJsJHxzxipHJjx7+OxWO9xvRayXh4JvJKhFxGRypFhXxoqtu3xl2ERvxMRfx-JOB9Rm2wpWRj+i+GhwJBpCJthpRcR0xcxjpYhTJgZLJQZKJrJpJWANROqVRZJMZ4ehJOp5AksvqAZWJrRNJ-W7JXw3BfR5RAxGZ0ewZzJxZp2Syi2kh1OqZBBVZ7pNZUxHpvpDZSByxFZZxJpK+NxCBoeHZ3ZfxBxBxieye5p3JnJPJI5hp8Jqp3popOJmpNu2pVJShTxApGpppXpCpxprZk57Z45NS1pkpPZThK5YpKpUhdZQJ55IJfp0J15XZ0JLpD5Z5JeeBl5Dpz51Z75tZn5BR6JP5wxGJRZpZfA9JlRVB6Zhmt5RJwwcscp35YFBJuJPptpgQIFUuBZkJIh-5f5FBAFe+V5TZ-pcF+Fr5jZJFMxt5F+ApbppO95O51hVaSpW5jFupah1qoguqnZg5G5TFqxGFu5U53FbZSxvZzZIlspB5C59BOFNFy5h5sl-FdFPhDFap65p5PF05DB+5bF4AtqZmSlhZ22fF5FBFN5Jlgpt58mpeZl9ppFRFb5eJ9lSFT6WFbJJZYZoZaJ4ZsRVpoJtSDlfGiZLkiFe5vliRaeyFkZd+HGkWIZsVbliJmF0lc54V4llFIRRl+lGViKY5oltFwleVQlhVVlZFhF-l9FOV+lg+XFEFxhnpAlalRVzFaRR5clq5rVJ5UpSRMRkltJSVYx2lHFYl2Vo5WVYJXJ5Vo5k1E5C6+51VxFdltlZVlV01Kl8+1FDVQFNp4l-Z0pW1plJV+1C1ZZLlSJJ1iVWZqWflZpZljagV4AXUJhkF3eV1IVt5-ZqRoggxEVvmZ1QxfV51mJH5S1e1B5fZu1Y1Blq1S561a5j5lZR1pVzpilw1118pG1TVGNUN6lMlbVyRnZO1XV214N4GPVmZgNx+FNONHV7Vs5sNyNENU1qldN2N6NQNSN8NwNDNK11xixd8MN4o-N1ogt31oNItNlxlB15lN1Dxv5rlgF7lF1Q2MVrWz1m+aV9uoVmtT1oJ71UVgh4p68stp1-1f1it81nN4tiNIpcNTp1t0N7NttNtxVCNKNTNdV9N6tE13NVNtNNNtBCxLVYNhNINBNKVtxpNhtXlQdYdotV6Q1d58lXtbtClLNzNjVWNjtT5Ftmxt5ltGuvNzVgpTtL5LtUtktedZdpdFdFdodUlcV8tnlHllNStt5ve5ZAqetIoL1mlWtZl3dJtKFndn1BtjWd1uFCVpt5NBtZc1dOd1lc9ktllJd2doJNdxN4Nnty1ydSd9Vx5vteN8dtdUBwdsdId69J9JNL+x1A9RNF959MdA1Pt-tad25+VidW9u93l4ls9q9C9Vd3eS9bNdtHNDtztK9b199OiYtYVUDt9MdBxbdXROtkDkCjBgRPl2tEDelIdH14AX1cDdd8V49zdxtIDwDU9yVLZfNa8wtcdBVhdtDZ9d9zD8DKDEpuD-+6DmVXD2Vo1j9Ad79TDrDLDsDQjojp9ElV9zlN9Yjx9wj8j4jBx-De9z97tqdajFDnVi59dCtRD2FOjiGihP8jDEjR9EpZjvCP9udMDcj4jiDPRoJ9j0VWDCjtjkVlJrdQ9E9Itt1yt5A+DsjZNDdxDI9oDy9YTQD90Jjmw0TeQJjgDJDX9INVj0tIjbj7D2DXN29dDgjCduNPjbD0ShT8KRTaTf0EdJTlTTlgTpTrj5j4NyjGjr96diTi1ETX54DqTdTtTijDTa2rp7T9Z5df9nTwzyDZTcAAAHN0AAPQljTPDAAC28z3Qg2i4CzaQAAJis8MAAKY7P3QbPZAADUBz2QkABZnNTjKtfjeFSTiAuDATpjMtv119ZDrz39IzgzF5-9oJCTMlJjKTYz1jv94z3TZcm9rtn9KdLF+NxT1TzzEzVT7dyWFTCLFjyLUdBTSL6p1NMLzTBLmNrTEtvzILZL89oL5LwLZl-zAjgLXz5DYD6L8LKLdz0dvTOLrL3jBD6TPTvLmLTd+jejPzozpdGL3z5tErcl8T-TxdkTWdUrbTXLxLqVmTkLWT8++TPL9TnLWL2rfLOr4LYoaLyr09zLurMjEjjTB9gdO9HtarmT4rjL4Tzr8r7zlrSjsr9tprlD-L5r2jd8p4js3UFsjUaUIs7eaQAAxCzD5ObD5M0SLMwSLNbIbKILbFLGkMG41Bm4DkbQDUy66x04q9iw-V62-bEyfUC2Kyy3qzUxCw61-na2-Vq-nba-qwK2bfc063W4i8Aia72z2x67W8Oxay23i7lbk+q9O4294VC6O0az61oxy4u2tY8ZW6u8TKeOG2m01FrHrI4ERCG1bCRFeE+I1JG9kDuwezrPu3bGkDzDe0malKe1zI1Im7u4+-e9kOe45UW0M6SzS+W7CwXW5kY5o92yO+69BxB-i0S4JYS4Y52da6Wyu2h360u5B2O7B91VI-W-6+h4a4RwayR52zhzk623kxOxR9R-O+o3B265nfR82+R8kwy3K8WwM1x4OxhMMADFeFGFeAAKR3uZvZC5tlRpAGxPuiDSffs-ynjxvKxXjJu7vkzycKAwUgQ8KKdsyvuNS-u7squHWc20tUXrsltW0ccAeiu2eWcmfe2s0aX00oc0f72ocYc8fYebV9vEdkeot4e+eecLt+cEfBddvsvhcgftttu5Oud0ctM2f2eV12f-sivJdr3edgdUMMMWfcfetecx3VupfWfpeYeRdEeQLFfJdmfSt5drv5cRckslcKtpeSttd-ulcv3wdOdP2gUqP9d+2DcVekdheVfjejflcecTf+cDADshdRc+dDtNcdtjeTeFfiPxdUfucf303VcddKtdedcLczdrcz3scFeXcweFtHeHete3fNdncZcXfXcusPdWcne8IcOfEHePe-cfevcZ2IfOfMdueqM2u5PLesdBendTerdw-4cI8w8kz5wLJ0Bo9uHo9Y+Y848Y94-Y-4+48E-E9E+k+E-k8k8U9k+U80-U909U8M+0+M-09M9mhmhAA"
));

export default createNewAscii;
