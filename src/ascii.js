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
  "NrDeCICMHNwLgOwBYA04Bms5IIxoMYAWAhgE7zgAE4AvihDPMmpvLgSeXFbfVFswxZ24ImQrU6DAaiFs8ozhN7Sms1tgViuPKfzUthWpd0l9GidUY7jTK-ZcPybOs6sdzNL5XouCNIto+5jJOXoq2uiEGnoEmUe7+1hGu9n5WzinBiRnhQXa+obHGkW4OSZn5CQ4ArLlxpWlYdWENqYXwOAoBJe3RcF2tvdkOg8XeBf1jPRPVFtPJVWXz3Yvxy1gLletNnavbjR1wLeNZkzlDsxsxM2dzRbdLux6PO0cVeW-9H20j6Zd3a4vNaHb71Ybncrgq7PH4Q+43EF9dwnV6gi6nJ7vaGA2E4rFggEEjFo5FQolfElIv4PamQ-6Yynkxno5mkmmIg5kiyoukIgb7T6slYU4WbQW-eni0Xc6Us2V7GUcgVKqWK+XK3lczX4pkM9lq4Haw1wmHY1X802480ak26sWcoUKo1O5VW4lsvlA9162nGy3250+h0uyUJGgAXRQYE9-u9gbdCbtFvjKbxaZtBoDGcJtuzedTBfTRczXuLWcLFfLZdLcerdaOWtdhqbYaBW2b-I7bee3fh7Yl-d7g7NUxH1rHOZRSf5raHtc7lZruarC57a-nK+XVIbW93O8X9cPG9H06nsePe8vB-XV9vN83D9PF-vL8fb+f+u3H4nZ5L-TnT85VXSd-3cPsgPVEDwPHD0RTA0ZYN9eBAN-WoZyXfcfzgv1r2w5DQ3fL8sOIvDSNfciiNwijqKox0aPoujCMg5i0Moljg2RSNoz-aD8JDTjlQABjCJiRM8eEAAlnnEjR4QAURk0TZgATSUiSWNkzZZgAcXUuTZgAVX07S7jUo4tM6WYAGUTKstisEsgZZgAOTs5y7gAeXc+EABUfM05S7n8iygqqaTQo0u4AEEAuCuKcPgJz4QASQS+IQv6ZKbPSkNspi3LnXyqoACFCooNLIoMu49Kq0zErgYr4gAEXK7hFLq+yqlizqPKqAAZNr+SavKwoIkbnVQhrBOTBD2IcxiOIwo8GNY6blpPBa1oIqado20C+Pgw7gO-I7TpOkiLrI5p9t486UNu-ig0e+b1vPV6CJm-NjsWravsw67freubaKW97Qb+l6IeB6DuJjUimKbRHcjEsbRqiqpvN6+EACUhqBCaKB6rK0Z0NzsdUobMvcQnuAikmMfiSqGeqqpyZZ+r4lqjmuvG0mKDKim7mMoWqmphxaeG-nuHFixJaxnm+paobiZp6XwHMxXUcZyJmbVnWdFs0W+YNihWuNyIOq12YADEhr1iX1fZ-XWaZqmhqtl3OciQaLZ0TWvd5kNdoEqGgc+sPttD8Hw+jkHY+emPjkjkPnQgrb04azOCOzkNc7TpDg5TyP-pWpjS82mH7qjxP45rxMk4ru9y5L1vG7buvU51JOu5bW64YPFv1YB7XXfRsedAABRVoaA8d03uHN62Cr9ig57l9WADp8Zn1fDUl2XHPVhXA6VyJD6S9XVfnieKF95eBtnne9-AZ2b+9nQT-foOdDxl+AFld4P3iPfU+o8P5EyGm-DeC9wBLzAYFWBBNh7P2AePCB+8UGVz2u3XBdcm5Pkhngn69dZokN7rOSO+dlTUMNLQrshcC492Lsw4h1cCFPQbvgjuJCOEfTjrwnh7ChGXQeqwzuLCJFJ3oQOaRjDsgDwvEPJBR5wE-2EurI2aCdAX0alfKBQ14HfzPjoa+MDb7cD-tos2qCEFeSGgAYUcUNEW1jLFALsWzZxL9PbGLUSYigujJb008fEMxR9YFBKwW48ADtzEYKlrAgA6vbIaoC-GzHSfE9RmCVEv2QXk5uYM65OXEg1UpiCNBlJNlUypETylhGqQI4R4jyFUPkXQjpDC5E9KkX0wRbDRGkO+i07hgzAbDIBqtPh0MI6tOrhQoEiznjLKODI4cvSSHrLWV02Rddtn0EUQjYpFiRk5MSacgppynEv3CZfWBWjQmRFcU80xaT3kv3XhEy5Q1AE+IMS-KJsC4nfISV-bJATuDQNBec7e+Sn7-Jfo8jJdw0DwpfiC+5PyX7c1eRQXxEK-K2JRVUaetzUkvyMYSk51cnKyAabEOpbAmXYBZfSmpwg2Vcq2qsgC7TNnVwOTBAVQzeWEKrkMmZCcuEDLGXK2VCqFmSLafM0V-L9m7I2RqkVEyhWIR1atPVZ19xHNwso7FV5-FWtmH8mJ4KYWQvAFYvF7ViXUvii-EJJKwkApiVcsFvqXXgBuTEglDrrUepiV691VRnXesiParFCSXnxp0Li1NFBo3htmImvRsCU0xoym67Nkag1ZqTecsNFbHX+vObWmtxbpVkNperAA9u5dl6DmVbUlu23qnaiqtG5QygILExX6u1ZOrZmrGzKtGYqyVIiJlSsmWXGlarVUTPHTydV06DVMSNVdQ1M6DqCpPcKqdZ790sUPVBbcprHTmoSSPFlEaqi2qDbmyW0Lq1Es9UNAAhI2vNpzMUgYST+8D5yqUlqqFWqDjr4OSxg7+2YQH0V+pWXOxd4zplLrw7h5Gm7VrbqPQe89E6VX9PnTRnDJSh09oYyOzljHGWsdHexljzHu3cdZZxnjOcKPGq3dhkThH13Lvw0+ujVHZNKuI+R69GchNkZvSpu9Qzb0qkvZp9T2m906d1XprTJnz0PuTgpsdomSPWek5J8TRD5W0fs05mTzmCOuZcwurz8nqMbr8z5tzQXAshZs5Znlu6r0BbC55jzJC6XDo5QJrtfHeMDo0WxtLiWUvpb7uFhqpGm1nNC3ZuLvm5P+Yq0ZpTWdjN1Zq4Jhred6uGePU1phrWiPRa61VmLsMozw1U8p9rNCWu9Z6+VyblX3OldmxJsrwWFslfm3Nxz3mlsbYm9N7bYnYurYlctiL+WcF7as8d5pQzJaAAdSIagAAUju0NQA9qQduy4OzLSXUsnfGytn7a2Ztne6wD77w3OtqZG508H3TQcg4M7DqLcPdPncmrZoHU3DsHc2794k5nTOQ72Qj6r0Pat46w0j7ugOjsU4KyjynwPqcOYx-tuZp2-uLa27tunX20eY9Zxz7nTOi5k+bZdpjH3csXK42L17GWONZxqKLi76Ouc7b6-z1HiOieNc181knOyheUP10smn9OqfK75yr9nPPGdY+Z+tgXtc7enhx2N+HruNcE7a9rjrHvFNe9G7r097u3eE59+r834fVcW7D5HpXiure2-+7TtXSeo8p4j5bjP0fM8Z3l+9vOufZc5wL5L-PCu07F+S+XsvNDq90Nrwbv3EPG9Q9D2nmP7fs8m854Lln1vefx7j-bmVie++j4T2zm3g-J8O5H+P68zuA8Xtb8T5v+Pg+e+X1rzfOvV9au3979fvv9-+933r0-gf09Z6v23zvZuO-X7Hz37vyPpH1-bG-3sH+1lhAAByzEADGkn+eeacX+UwoB4E4BowkB8w0BpkGgf+dwgAsaRAGF55ywFiKm5P7J5d7YFz4D4z4T795D7C6x4EGkHD6EGP5kH4EUHkEkE0H0HEHFYMHMGPgL7n5L6H5g4cGUZcEw58Er7H5N5CEt4CFb5iE74iFr5B4yEh4SEH6yEb7yEn5SF764FYGaboEeSoEgHAE156F14GFdhaEIGnLIHf5GHv6WEoEl66E6H6H2GGimEJKABZpDYZXg4bYZ4R4YYY4awdPrQSwVMkwcEQEYwWEf4UQREaEVEbEVQYESEWunEXgYkdglPskekfEeEb+OZoVhZpgS-gUeTs-sUeoYUSUXlkUZURUQ3jUUbobqTlUbUWUaUanjgW0XfrfhoZfjfg-p0TeloRKAMZ4E0nYfUjnI0sMbUhnIMb-rMG4RYdMVnJMTMdYUcM4ecgsWAWsdsX4VYXse4Z9mgTsXdB0d0ffr0Zce0T0dcRcbcV0eUS0dUU8c0WcY8W8a0Tcf0Vcd8fcX0ecQ8QogNuKikdEUkVkZERCTEVCeCaCRkdQakUUvCQkWCWkQiaiUiTCWiSicidkViZiXCfiSCQCf8e8bqrMScVAZSTASMVMV4b4eMccUsQRBsY6oAGGkzwrJ8IHJ6x6sPJuxjJYx9yyx1JcB9Jxhop9kBxZ+qhMpyhwh8pohihR+ip0hchyp3BspF+ShGp-Bupghqpah+p4hxpkhhpcpJqwJnCeJhJtpmRdp6JuJkJDpOJRJ1pzp9pnpjpbp-C3pLpNpXprp-prxXxJJPxYZfx4ZZJQRjRWyKxIpzJTJgpnxhq8ZExtJqxiZQpeaCZyZDJwp6ZWZ3hOZwZ+xeZEpRZzxHxVZoZ0ZgJCpppCh6pzZOpLZKpjZKh5p2p7ZbZmpXZnBHZDZvZepw5Bpg54YVpvpQZgZAZfpM5Hpc5i505S5s5y5a5q5G5C565W5NZdxvx+5EZB5dZfZ45aprZ559ZIZe5h5OW0uuS0pfKr+GZuZBZSZr52ZoxxZn5954pgASaQvZ3D-n9qzBAWPn0aSkIbi7QmlmwnznQU3nHlRkpmXn1FNFnk9kXknmjkmnYVmmnlGm4VNmYUjnEVjmEWdmWk8TunwUrk7l0U0XbkMWbmoV1GxkvEsXsVsXVlXkoVcXkVDmkU4WCV4X8U8WknIXiW7mInEmIVZb8ZHGyWFnlllnvlfl0mqX5kllvlaUfnqU6Uy5-kAVVCgWnxQVGVHkSVIVSUYkyWMWwW0VMX0V8XXmKUIWWWRkeUWXWVWViUkUYX+VYXCVEUBV+VO6TmzJwX2V2XYneWeVuWxVeVKmiXoWBUhVkVBUUXJUEUZUCVpVCW8WzoNGFW94wUxVOXFXkIADMRVisZlwFPlKl+lml35FZylhxLVjVHV7Vd54AJlxi4ufVEKA15lkQg1N0i+vB+FFptZ7liVHFlBpVBJkVZVjlq1UVzF615VS1Dlm181M1CV8Vvl6VeVIlOVE5VFO6NVpx+1R1c12VJ1wVqVT1oVL1x1z1b1r1+V71X1n1h1e1Lls1y1210VwNG1FVnF4Noq1Vnc0N8WWhNQsNs+KWAATLMIAMmk3VmZbVix2NApGlrV+NnVelXVONhN7kqNdwGNkNN1-1D1mVZ1KVv1rlzNgNLNYNoNW1tl7NXNnN1Fu1-NK1AtHNa1gt1NANB1bNt16I7BWpA5WV01DN9131p1dNuVytj1TN9NqtSVitYtBVYFrFotwtQtPNItxtetklUtGtH1BWiNQydtW6DtMZRtp8FNVQVNisbt8QHtrt6N5NftvUXtkQPtxiQdOgIdEKYdFAEdDqUd3AMd1acd4ACdCGSdKdK6K6eRWdkWU13Z6tWt+dEtrNxdRd3NfNLt5d5tVdptJtldNdFdU5ZdjdvNzdZtoAMt-Zk18tedmtatvdOt2tjNNtP1w9KtlttN49zl0lddM9rdtdc9DdEVktE9-dQ9I9O0TtTEm9LE29W0u9ttDOH2ad-tlNJ97tZ93tStq9F9wdN94dd90dD98d89S9IN9dBtENPdo91t69Y919Ctg9U9k9FtDVL9RWbds9r9TdUDLdMDEDC91dkD4DKgHdudctutX9v9P9f939Bd-9H93FK9cVy9YDq6i9yD5DZDiDCD79tD6EE1wmGD6DiM+9G9ScrDwcHDk0XDmoPD0DidAdntgjvtp9gdwjXdTDod4jkd0jsdsjGBht1DcDpDGdxuWDeDuDfdmjA9hdOj+DzDwDBDNNQDoDlDqjh9QNdDNDSDVDtDqD3dBj+jEjgDADujRDd1IDxDb9Nj5jJVljPjUmNlATV19DPBjDLjmDnDPcfDs4MTQIcTzwCTRwSTAEKTVjcj8lSd9aWTV92ja9KNLKOTYjTjl1aFKjgTTp8D41ZTrjJTQ2eTuT6jWjTTejDTtTbTRj4tVtJdsDFDSjfT6TAzdd9jkj4TbjJjXjpd3TUzVTQz1j8zyjZjFTPpiz-TtjNj2dITYzdTGmDjzjY6aTtQhzPIxzzQpzKE5zcAlzCNFjO1xTvGRTkT2DzzGjR9hT4z7THjnT09Czczqzgz+Rij11oz9TLT+TLzzTODYLjTULsLELrTXzwL+tSLhjALvj-WF1oLf1EziLoTjulT5Ttz3jvz6zJL6LSNdzaz5LhDOLcLrzdLkL8L4LPT7jUTMN7DHLdc1zlz1LEyTkjzIjHTjjQr+zmT7zOz+mndpTQLwTfjlLaLaj2LnzDLCLKrzLjL9LTLMLWryrOrTzmrBrGrMztLJDnjlIuRyzi1CrRL-DpL-zsr+LKzfzzrdrLrvLXTrLpr+rRrqrerwr0LZrSrazNz7LobJC3L0TT5lZBNTVMbJNeNsb6rvralWNZNpNibmNIr2zWbWLXrKLBLSzNrvTrrgLn9+bObuzILlbET-rar2rhrybPrSbzb9bTbrbjbHbbg5m7rPz9rZLlr-j-bRbszJbPbQTQ7NT3zHz3rnb7bLburDbnrLLhLcrxLfb67brA78rGzOdez2bAbM787h7c7J7C7bbgbebDrFLa7m7w7Jry7Z7s7j7R7tbfrorFbkraD77B7r7i7p7x7z7KDwJUgIHhyYH7d4HoHEH0HUHsHkH8HMHCHcHiHKHyHaHSHGHqHmH6HWHuHOH+H2HhHeHEYEYQAA"
));

export default createNewAscii;
