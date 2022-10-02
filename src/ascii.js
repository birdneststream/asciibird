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
        curBlock.fg = 0;
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
              `\u00030,${(isPadded) ? zeroPad(curBlock.bg) : curBlock.bg}`;
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
  "NrDeCICMHNwLgAwBpwDNZwOwoMYAsBDAJ3nECTScAXyQhnmTQ23H2NIutowfXgEZchEnHCAI0io0o3FLyyC2IjpLqIZTecPISu9Nfw2lxnKbsb6WQw9pOqzciwq3GVPDAIeajy6XeatNSjq2sn6WitYuevb+7BE+IQbhzvFuiWJxprLuMSJeQa7mOenJmeoesSXBqeW5GVWFYcXepfChjoE2BdGNHZG+ab0prQN1XW0Bo1HjFc313e2T-TVOs2MjlWvLgy3zExtT66sHW4sJJ-tLRdtz00lHlz2nZVdPw+f3Zy8Xn4-fz78ff4LP5vL6A0EA-LHMFQuzZRp5TrQyFIh7A8G7GawrJpRF9H7o7HVIp4oaYu5EiGE1E45aknbwxz0m6HSnklZsxmeV5wLlWEHs66bGE04kInm3Dmiql7DGSoVRPm1AVKpps+US1nS3m4zXvTm6gUao1a-FA2Xq01k1XM4Uos0yrGUAC6SDA2ptPM9KsNcqtO2Nfv12sDluDDp1dL1IojoZD-pZ4etvrDMbJcYj3oxWdT9vTCbt1NjBeRRfzSYDJbRFvjFcTacrdcLNeLTdLLfLDfrecbXebWNrffbA9bQ+rI87Pe7Zd7U-7FMHc8VKY9K9HS-HC-XM+nHdnO-nUu3e93E4Za+TUZ9V6DY4JJ66OcXB+HW8nL83R-fD9fX-3P7hC9zxvA0QNXMDMyAuYn2PM9oKgw8FU-JDaRJL0UxdN1QLQ68cOzBDfxQsUmXQiDvzgxDSLw7DxVw2j8LI-8KMI6MN3vZjAMY083yYnjuL-fiiMdPjKJNNtkKotjzQ49iROXcTZIEx8q0UoTIzvaS5IkuiP1U1jdOIgC9LEjThKUliTKksy1IzS9qOfIzNPM7TbyswV9Mc6yPJkwz+QY+zIK45Sgos1yDIaEjLPC9T6NzaLbN45zUNi8CArslLArS4CsvgkLOJy0Sws89zOFKmhStdd1YK05LIqKnyIu5HSmvqmrfOVfyMvSuqaJ6hyGpK1qkqcmyVPatV+raryouKhLBMk+KxumzrotVUaFJGhbZqWmLFo2xqBrmwreu2-bBpOw6dqO+TTPOybhuWuLipg8ipru6qHve17PuulyLo6p7LrOl7sq60G+o+9bbpB+bmr8wG3ph47UrB3KCpu1Hkchrb4bK0A8YJyqEc+pHQv+ibMsxjGIe+tTSfyqm-vuqG3N+4yhpZvbbrZ8bOdO6GrsF4Ghe5naABY0gAAh5CXlmlgVZaKeWMUVxplbZVXHHV7VNc0bWI110h9bJQ2RGNnZTfAc25kt62ult7y3p5x6Ua51mdrWx2SY9gimexmagdFs7na+xK+cD93hby2qWuJ8PEd99nydtMnma9unE-GlO-dpnGAbTuH8-9jn07ztVMKq3PC4p7rY4Lla6+L5Oy+zpP67j0uA6dkXI4F4Off7s6HYVqWZdHke5bHyeJ6VqeigAPzntWl61le9bXo2N5EReZ8aHeVfHg-ln3jXD9P6ej9n3fV+v9fb83++za3q3O4biPVp7t2v-53vf+-9+f7-27lHdGDMaZhxbq-ZuXdvbR02jAjOcCDpF1rvDV2jcq4lwQVA9uuCm7oNxkTPBqCUHgwwWQtB+CqGYOgVguhHdsGMPocQiB1d46fWHpfZej8X48LtlETh58F7PxPjrNIoiDZnzERfIRjRAAOpM-QA9qRKJUTw5Rajn78LsII6RRR1FcJvgYu+RiH4mKfnwzRliLFMIYcwymQCfqf0Ac4gBrjgFBw8W5embd7HkLRozHxNCWGwzsSQmuFDSH+PASE2hsSCGRKxkE3xlCwmtyztoCuti4nJISdTPxwVQGBNYW-XJOdilZOCYk8plS8luI4VIyRMjdHcLMbw1pWjZCWwkSbNI+jZGOAUdY9pVjWndItg0npTTGlX2GUM-pxj5mmMWeY1pgzVkiOfms5ZbTtkdIwDo6Z8iRm7JwTkxxg8+6eIcewm5pykn3IieEqJ+TamlKKc8lJ1TqFfIeR8t58DQmPLScgp5VSYk1LAS8spfzQVk0yRC95BSAnpJsQilFgLwXfMxb8sFuLXmwKucVA5ky9HHOaYY7ZWzyULOpUs2lKyTmVD4O4WQABOBMzKojsrrJyuw3Kuy8rZRyllGB+VTkFaK4VXKpV8plUKnlIr4Bip3BKpVcrJVDwmeMqZJLGh9PpeAfVhzHBjJtuIslxrNBUstaQa1uqKVopdlipF1yy63NRc61OnrIWfJhcC3aUKY6+pdYG9FFTvWIvxf6kOIdvFhvibC6FIbg1RruT88p8KI0AuyTir1qS03YvTYW4tyb3F-2euLLVZqdXatJRouZBq9nwGJbWlpjLZiqrgMqk8nbu1wV7TtPtb0h2fRHXTT2KoJ0dsVV29VaqzpjrqAOhdc7Z0Kuleu2Vmqa3VrrbM0ZGyG02pEHa1tDrj07MbQWvFSb8XupKecwldTEGFOzQm-1canW5p9f8r9RbS2JqDb+0OJbU3Vw-ZnP9frIHgagZm-NsHEMYpvUBwDb6s1QYA-e8m2Gr1HvtTSi9Ta4Att3W2g1p6yPnoI3SojS6Z2LqZQx1djGMSsbZOxmwy6BXMc3fKnjG6uwAFZBNThE1u4TomVW8YExJ8VMn5NSZ7Qp6TSmBqkftlWzTO7tPCJ4aa3T5G6P4bPYRmjDK8PIbzf+u917rOgdvT+tDmH7MAejQPV9LnHOofcxc8tA1P0gbczBqz3n41N3g0CkL4aEMPog0goLrmktOdw8Z-d7aMuWe2Ua8zl6L0GYEVpwrOniszKCNxxTcnVNVeU2p4dLGGt8Y1ZJmr-aZ0w07R19rUFOs9e61xcT-HKtDeqyN2rrW+IVdG81tyGnStGdy8Ry2OXTO0dy5Rwz1HVsWbS5l3bWWDsYcS2FrzkanO+afWW11SGYs2fO3Zk7AaU33Y9d+nz0XHVPeA6GSLDn3s3ffQ9s7wP9mVu3bdOb2iitQ+Ppsi1i3VHrJM1RzQBWYdlcO24FT42xttbqwJKbxVOMqEJ3jibAlBszemyC5kvWuJ05ygz1GTPoks78Wz31lP52ydx5N7HA1idY-x9cUnb1IedOhxLkr6O97w+24aw9B7kebdR3LlHa35dqUtqlt76HYu3eg69qLRu-t67uyDmnQOzem9O+F3XtvLc3d+yh63wWTcu4dyRsHEPvezcl6D6XUu9NI-S5j+XK31cnrVyrjXke8sI6Y8L+jSfE-k5F-zvnKfp1Z-KxninOeuP9cZ0X5nJfWdl-ZxX31HPIk16eVztdPOqc4+b2T3nBO8-p4LyTzv0f5tbbj0t-3za0gbf72Z+XQ-A8B4x-tuf9vjsW8X67sDoWl+xsg195zW-4ueeX57jfCXAuH734F4-HnkWO-KkQo7Z-N934SzG330VtfPy18Pr30+R9f8-7P3LaOg9Zd61Q8L0x8ZcB8Y8dsE8QChc09k84DU9281JBcdgUDeRe9EDW8+IG80C69acq9a8CCnk8D4D-tZgcDGsm9udhssDR1B1KCaDqCX8P9xcZ8Ftw84dldx9Y9ID49J8rcD8nFn0BD99RDz8QFL8d8RCT9JCZDokPcpD3dV8c1jc187dzcw1ndlDAclDHtxDLtH1-MrsK0-NmCf9WDv8-9+CuDwDVd9M+9bCeDuCo8bDACB9RcO9u9YCkDSDaCu8EDs8Ajc8vD+AMDyCQi4AKC6woiqDG9GC4jqcEiW8mDkikiBcGDEi0DeCp8rDB9ODWkI9siHC3CJ88jdD18L9rs1DBDTCXFjCAtN85DQ0r8VCbdRCmjnsKjaiGjH8hD6j+iOQtCXs4tpDKjmj2i+jDCqiDcFCn9uixcWDFjzDzV7DXC2CIDnC+CyiYDQiIiPD-CfDMCUi28-CeQsi9iwjgigjC8LjbjrjMwp1ORHiPRnie87jDidjti9t1t8jstij1jSiijyiV9Hs5iDCdcNCajLlJD9CjCCVZDJiITDdqjFCRiAdb979GixjOjs0hiyDWjZjsTvtETRj5ipi6jyThC2FSTwT-jLD2Cviw848ACATbU6Tf8GSgTPj9jfDjjM97iyRziBTUCMjUjcDLibjhT0D3jTi1j6SNjHCoDrDPjeDCjNi1TFStiuTvjISJiySkTCT9SaS4SX0ESjTgSWidC0SUSwSvEsSJD5Dkt8TPtbTpi8T1DkSCSnSPTDTaSLS9S-SbSST-TXSKSDTNicjOSIz2TLYwCSinDNS4zWSlTGT59lSdTUzoCMztSmScy0zMz5cWT5TAT1TEc-i5SOSFT4yUy8yF9QyejAyZjvSoSTTjSP5ejzSgyHTxjYTpjPteyTC98OjiTOymy-p3TLSMSOzGyXTgyuyZyjt6yBjwzQS5ycM2ywyYyljcjaz5ckziy2TgDszNiizKySzNTTyLCzzSANTqytSTzFdjzNTbzkz7zNTIyBktzlif8lzKTlyNyqT5zWyQy1z+zMTpzgKgL2yhzQLFyiTt9fzTTHThivTVz9QJyAzIKxyuiFy6zYK8LRzZzCK4LiKCLoS+yjsryqLtyoz3yvzg9tlLyaKqzXyPy7CVToyKzYz6LaK7y2KEy+KAL-yQLSLdTEKhK-zJKVycK7SIKKKF8BzALUKZLoKYT7TyLxjhyEL4KLtIQMKH8YLRK2jxKRLcKxL8LzKjLfSsKiKzLjKLL7LwdeLWKeKWKDzt5XLzy7ymLvydzOKOKLz2STKoLNz-TXiyKbKSK7LrL5LLLormzUTlKQSl8DK1Kj9wLDL4qULbLIr9cwK5KLQMKtLd8zSsqVLQqQqlKcrYrHKyrkr6qWyaqYqKrsKGqt9pK2rwq4rcrHkOrGqWqE0+qxCHLmqqqoqeraqJrRrhLKqZrWrPdFK5qrT5rEr8rT91KpqErUrkLyqGy0r1qQIiqRrtDxqmqErgqVqLrqqBrTqbqIqzq0K6r+qxr7q7ruqHrdqlrbqXr3q3rJqPq2qrrvqvrXqfr-q-rpqpKRDFr4SdqfStqMr9qka4aFrEaUbhqCqwaFDtrY4jqrKTrQaQbfqsbzrjrHrNryaAbnqibwaSbKaIbSb8b6a6bPqobTKKbWahqgbCa2bZrebLqybOaJKubBbAadKPszldKqbVrJboa0aez5acTqb+blrVbZaKosJrq9r0biqJaeaRamahb2bpbubiaabIaDanrMKTbRblbLaOaxbDbHarbTbabzbGaXbbbraGbmb3a9CNrpacalbvbtaFbMaE50rw7YbNKvbdawrFaAY8araYakKw6DrMqHa7bhbs7jafaja+b7abanas7c6WbnbM6Q6-b86Bbi7K6Vbgb679ac6C7m6a7k6A687y6i6NLg647rS26K7Xa3cUSg7E6b8m70SJ6W7S6q6u7O6S7p7F6B7u7B7Y617a6h6PbV6N717Pad79697D7t6j6V7T75666hqU65ao7U7g7R7t8r6Z7G7VCkrUbI7qIk6K7H6l61ap7l7z7N7fbn63bgGLbW6tbZ6F7-6y6oGIHQGt6z6YGL7wGG7C6AHd7j7MHVKdavb76pbz68G9azbo7e7xb4737kaY7a6cxP7A6O6kHAHnTUGUG-64G0GGGMHEHIHkGn72HuHGG56OGD6sH0HhGuH4GgG+GJHq62GWHdTCHeG5HPTZHJ7iHb7gNv7X6eH6FMkCZyp9H8YDG9HDGTHjGzGjGLHTHLHzGrHbGbH7HrHHG7GnGHHnG3HXGPHrHnRnQgA"
));

export default createNewAscii;
