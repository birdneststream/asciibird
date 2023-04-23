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
  "NrDeCICMHNwLgIwBpwDNZwJwA4UGMALAQwCd5wACcAXyQhngHZc0Md9iy5Ka6oNGAZhTp4ycIVLkqtehnGisAVg5TuMvgzjMRbFpK49Z-eO1ZjVhjXNMtF4g9N43tu25afGtCvR-XOTRDcsfU5PTXlgzBUJMP8vSPNlPyMIiyTolOtAn1MYx3i0oIz8uNSXISjStXLAypKsgK16xUzYmuzvKsaE9NbqqybE-p6i3OT2wd7ikcnwl3G2gtquhrnChe71leG2AfmcreXAZNIhvr2U0+nF-Y3DteXO3bzRzYeyp-g7C+3PuG+Xr8zv8jh9gQCJo9waCOtD3rDphClmDrjCpmM0QdVrMoYjMXctEjbjsvviSTMfidgTdXkDUfD0W8cSiMRlQgjWcyOUzKSyeYDcUVMIt2Yz7lyxdjedzxdLJc9IXzZQKylcii1EoKKsIkg4lc0dfZaQbgnqZVL3HTOXLyGr+YqanblSFjQqzFrne79W7RViBIbNd7zirHdSyU6LS6rdrTa6mAH0h7I17zT7XtQALpIMCe30E-2x6Oe4l-GlF5MlsMMv3Bh3y2vI1MNyv0iU1ikh+vaBN19sazt9nuNrtlpNulvWgf55txju96dz4ft0dBxcT+1Lhcrptr2fbkdk0uHqtt7gR8ezomX4946sLq-ljAPseku-k5+r-fLm+T+fkr9bj+G7rsWe5AYEH47gB4DnjOj5wS+u7wUhiHQUeb7oae-7gRWYEYSeNqAW+sEoaqBFTth+GtoRlFYZhNF-P2xSIUxZoHsR5F-gAopxm7gAAcrxxIACJCXhrR5rRvjIdBJGybxkmMT2bGDoWLHKemWY5iauqzqx4kMWJMk4dJRrIfp5kacZbJ6UOIG4chwpRIpRmoSZCGfu5pFQV5aGuZ5VG-nx9EUX8kFduF7aRfevmxYFwGXHCdFJYZt7JWlqVFNFUmhSluUZflWVxelQX2Re1klQlyHZWFxWZVVbnxaBFX1c1jWVW1AUdQ57WtT1XU0XJdWFQ1A0jZ1PlNf1k0SbZamrhZvUUUNHHUct-mhmtf4rVhO2DRthh7etW18SRi18pm2ajTujDOQZlqIWYZlLX+IWvQd35TeVL2nR9Z5-TBANHe9J1lR5M19d9Y0g6V90w9d7HdU+w3wxNiOQ+D6PjdNh15ajhJeTVePBcTYMgl9r5I5TGPk1T3lY-jUMQ9jTMRSjv2g3DJOcy1LOY59dN+TzP1k05Nm89tQPAmLs0S9zsNy2TQsKyLXNK+zxLAxzQUudM503VZ6nzQbxsM9rCO2lLwtkdbm0qzbdCXdprMC9Jj0QipC5PYGJu6YrasB-7Qeq8H0Pyxb-227jUeWzHRGCxrgch4hRNxzljP8-HNPKxH6fh2jsdFRTtM06nRd02XLiVxBhO18X1cE-XdcV4nofMxn9Ou3zndZ93IqzjLbth+rq32+3+fJrrQr923Zsjwnxc5wXvcd-Jad-AATAAbHd5m7+7pvtt7iYLYbw+JevwL6121+qX7ycO6ATsVEiU+529E+mT7c9J+fs9d6vVuD9x7z2zkAx+y9AZpy1qAvu4CdwNxdivT+mc86wMAYveB0dy6l2brgpuBCW6EPwUQ0hYDMEUN2gDD+6CUE9zQb-EBjCf7-0jmPbB79qFcMvjw9hAC6FLxxvwzW3C+HINoRIvS+8w5v0gTQi+YioHqjPr7Z6f8qR6xUYyZ+uY5r33UQYphrCGHGPkaY0RnDeGWMUWY4BLC7GF1zjAhR1iq5YOEcwjx5irFyKtjg7uiDqYBLwcE4hoSyHhJIeQheVCfFCPEZ4hJ3ibEWN8dAvxri0kpLiUgvOsj4kmIcWwpxCkub5LTHLcpqDbGGI4VkjcVT6HOO2M0jRijWkQIKXaHROk1E7mPsxWpXiimFKGUkkZNSjETNSQUyZ9ixmjKmQsuZjjIEkUCYuRpGztkhI7jssJez3ExQOXQ-ZETDknLJhswRuSOlLPHo0m51SZm5JWeMhZdz5n3K+T84ZyyXmmBniMz5qzZnAm3tI75fyHllMSUokpOTUEguKWsjJqL0kYsdlpGM+jVHfzvn0357yoXEqJYsslbzyXQopQC+hlL6W0qeXS2lZyomRLgZQtlFzzkCPDKTa8lyBU8qubs05RyqUorBYi5l0qmVyvFZS5FErlUMtlQqxl6rMWZKlTrWFyEIXi2mVq9F2TTXatuWirplqLXGqtbIHpryNWco5TE6JbqXXuowa6j1PqvWet5c6v1vqA3eu5VykN+0CphvZdG2NYrA3mxroK6qoqRXJpTpq9pTrQ0RuDZI5J5qkXZv9fmo1Zr6kVrtVm21jq1UJtLR861zyTqNINbLFOMR23-JrUWntTTpYezhUq7p2K6haIJfi0l1Lp1TtnSq4tea4WqvLTqwtMqV21o3c2rd663H1qFeGhtCDU1Lv5Sm9Nq5WUxvjTmo9dTV1JtvaeutT7jHDoXUGz9uav13pnfCk1CKd3yv3W+pt-aW2zg3p2tgO8C2Vs3Wu4DXaSXzr7WvatGGn6jofThhD8Ht2IczYRkDZbiOvtI-h3dlGkMluff4uNv651Ktqhe49rGaVRpvYeg91603kcvSeuDjdhU8YY3RsjtGhN4arYB2T1GiPydHhJ46QGFO4YI4p5DZtHlqek3pjTMmANGZkw63tmHjM2vM4Z6zlm5M2bM3Z2zmnJMUfU1RtzNHF3npE95lzAn2NRUExmgLxz+NsbC-e5GIX3xBe7fRrjvHRMJZ-eJ5zXm2mOYc2lr9OmSOdLYECuLymUtSYM-p9zGA21DxQ8uzLmzUv2fA1Z8r6HZOmYq2VzrHXuueZK65pzHm+VoaG81rLjXWsWbGwN8rV6xO+cS-Nvr+Wglzf61N9bTW90+eC9t-zEXQVRd2+FvzNWP3fsTeNkbdWJuXaU5Nzb2XzuMdQ6pvLp3ht3du7E0bD3J5DtKaBj733rtXfa4IAALJCjjr39tztq49578PBtveh8Vp7DXptdZu4d7jgP4t8dx2tkuC2iezeS+TgnJO9uE+p+lorCOXH3exxt5nv3Mds6x7pznKO-1I5a+K99QPI0-dZ6LrncAqsPXp8j2HyqSIDM9nLjJ7XCvvZhyd1HDPSs9fF719H2u9eI7O0bzjlPVuNtNxjjbZPnvrNi8dqnKG7fRZY7LpVABLAGAA7AGABrMDYvPv8553D43Vudch--V94XIOg8s6u1ronevcuy4-injXf7Bci4T39xyg68+Hw2Cr3XJfI98+56nsPBvS+V5fRn0PlvFsU6Syb-H4fA-A8ffXqPM37ea+EzTh35uh-64y5Az3acADOAec-s47zHpns-49x456v+fdO1do9b1v9v7N09S8349xpt1DUW+zyvhX-2IMF9xaj4vZeq9J5r938vEfa-q43-34P7+1025b--pvbfSja5JfVfEAlfdfSWRvHbQfNmF3M9YFb3AGAAewBgAHcZ8IDQDICLtv8F9GtB4D8yVmNH9pc8DP9edSCYVKk9Un8E1j8odM8qDItl9O9c8D5b9KD7VsNyCltD8ZcX9mCuCP8+Cv8K9BC68KCG8d0-9ACACYCpCe8VtR9adh8xCwC+8mDoDVDm88dY8sJp805UC05IAAYABTAGMgIXRQ1-Q3XfLAhwtg3g3A1g-AufbAjwxwtw1wlTHfFpTApwnwqA8-N3MDS-fVWDLTeYe-KI6QlwCHRguIxPMg8QmwoQpIgQtIyQ0QrQkI7w4nNQwLB-aVWQ0ncXUonQs3XQhQwo0LWAooo7OAxoho+ouox3Jo1ol7Pwugn-ZI-g5woAzInI5BffYYvJewwIt-GmW+BcGYroxfU-fpfPLUGI6Y8dDIgYiYiQkQlQ-o1IsY2wzwyYnAwY3veA7QkfU45Qqoq4go3Yjo9olox4to2omLc4tvOQz4mo+4g7a4+Qyo-4y4rYrInY24uw6vYo0EgeVXdQ8ExCKDKIWDHo7Y7o5bbrOYpSQveY6PXwgDVYkE1EvYqYgkvo2E5-XEnE4IwkskyErbTo13ekhAgE7XCooEr45k74m4wEh414hk54t45ol46ojkkUp3Jktkso94uk-kvk3k9I7E5wxpQgqMR6GEo+NUr2DU8kZUlMGk3otzSXFUlItfRI8kDEq+dYhUy0QlXItrHg-Yn4kY4Eg4+Uv4HU0Yx0pQ4kl07Iz0w42krvGU8U9Q1knk4UiU40uE400Mp4n0qElkzQjYv49kokplGMoU249MgUxki4sMrkiEnND0osy8V+Z0v0llaDIgvsU0xVMDc0zRLEt05Y40+s3VPeRY7Re0+rGggslE0k4Q-Q-Ik4ss2490kc8chMgMgfEk6cuU3M2M8MvM7khc-Mzk5cjM9c7MoM+cjclMpcvclczc2Uxcw8g83cxAncq0708s30sE8kuM6kgco-CcsfXpSdM0y0psxsgdb8304-T8i038rFK6MdIChpPSUsyyMC-spM68u8qczY3smcxC5E7c+Mtcs8rcucj4jC3C0U4g4M08vC1M8o0iqUwM7C6Uyiiik8886M+8lwk0hCh0+C-UlCyMhij023AI-I8Ijgm0r2Zsok1snFASj86C9gi6LsrUzEzg2CqMki5iuCl8jipShSvUvstzcAtirrLM481c-CoiwyuiiM0y-c4i8y4yrC2i6ygysyoy+ykyyyxy2yo8wipyhy5yjSikipH6Ysns1CjuMcpCjuE-WIpXawqk3RbXPi0+CS8rES0CuS8S5KtPPRMS6wdrRKt8k+PFXK7y0KgC6YWKpY+K6098xiGsq+Kq28lSxSnS5SychqtMxM1ypqnMnCqy-Styy87qzC1-PS9ytqiyzy0ajy8a4arqoa-08Kvqkaiama7vLWfywKuhYKvyqRDs6srapjHi5Cli9Kiq10wC1Kk6jKgHI2U6hsq64C52eMMq7sB6mS2lbKgsG68CgK1cEqrsb6p8oYm89C1S5qhiuyrysayalyuaqa3q46mGuGzqyG6apG+Gx8ha5GhGsGtGlGmizM1qqG6g1UmqwGgms-NddamRTa2a6qna98Sso0m6Imwcnyg6m-c666tm5RJ68XV6+6966Ky6jmj6ja6MfE+mm+IqnYlauKvmnKwZPKuW8Wh636+SkGuqgqgGqijWnGnqjG8G-GzGiGg2-WvW9G3-PG027W-qi22cmyxa-axq1a0c564q524m9W0WIS9Whgmm2s9mo6v2-KidQOlWrw5mh26WwWpKyO5oRm58qCmWt66O3yiO-2zmhO3mpOjO1OrDECrQTASI6rdQnmx69OkuzOsu7OmCq89Sv69i4SiW0Syu2WxXN012lwcm-pNuy2+aw2k27GrS82-unHNCzW0G2ulmx2nW1G6u1WxyLu-61izS9wlfMKwu20hY44o4ocresO4c-wyKrW5uw64O8YkKuhYui+huqOpuxOm+rOk+tKz67kHRD0V+pUN+mUD+sUL+g4H+u4P+2oAB7IIBgIEB4wMB3WrGyB3uqB0eqe7u6G6B422BhBxGoe5Mnu5BmBwB9+3Bz+vB7+gh3+oh-+khnB-Bihwhyh4h6h0h2h8hqhxhmhphuhlhhh5hjh1hzh9hrh3hnh-h4BshwR5+0dCBiAMRosCRqRoR0BmR8BuRvgaR+h4RthlRvupB624e6im2sevhrB-RzRjBxB8R4x1B1R2R5Rix8x+Ryxmx6xxRhRkx2xhx5xpx+xtx7htRvRqxzxnx7xux3xgJ-xlx9xyRxxsJ1xiJ0JsRl+8JpR6JuJxJyJ+JwJkJ1Jjx4JjJgRvx7Bgx7GzBi2gp9Bu43R3JnJrx7JoJyptJzJqJ9Jup2plJxppJhJ5Jlp+ppp6prJipnp8pvpqp3pgZ-pmprphprp2JtpyZ1p6Zjp9p5pqZ2ZhZ+Z0JnR+B1Zq24pwaoZ-JuZ0ZzpwZkZg57p4Z457Zw5k5sZo5y5i5-Zm53Zq525s50585p56515x5l5z55575iZmZ5ZxZv5vZ+5u5pZoF0Fh54FzZwejRnZtBmFr5t5hFj575xFlF5F1FjF9FrFyFpFnFtFvFzFgl7F8Fk535gF8l-5ylsFwFiFkl95olhlyJ9ZiR5l0xop3FuljlmlkF7l+lzl-F-lwlwV4l3lrlil6l8V2l0VgV6VkW0Rxl2VkVyVnl5VvlxVhV1VhF1luFuBjZsVqlqVzVmVo1oV9V4VjVg1lVy1tVk1pV61-ViV+141zJslp10121i1x1r1w1t1u171q1spqFpqP1n1-1m131z10NqNgN6N8NsNh12NhNmN5NuNxN51+N9No511jN91iN81-Ns1wtj1gt+p7Vo2wpyNlNpN1NqtzN2t3NnNkN+tptmt1t6t9tutttztjt1F7NtNht-tltntod7t0dgd5t0xst9Rsdkd8drtud4dyt+d2dldpdxdktvNotzd6I+Vjdxttdmdg9hdw9vdwdtl8909idy95do91d699drd-d+9k9x9s959uVkCu919q979m999r94t8t2F39h9wDsD7diDp9kDl98DqD2Dt96D49pDlY3dxDgDyDhD+Dn9rDv92VqdjD7Dgj3DnD0Doj0juDsjmDyj5D292j-lvtwjijpjzD6j9D5jxj-t-DwN8jlj9j4j1jujtDwTkjqjvjnjjjiT-j8oBjqT3juTyT8T2ThT0T+T15rj1TxTzTlT5Tmj-94TgTvTwzoTozkTmTrT3T4zyzkTiz6z9F9TnTtjjT7TpTlz8zxzhz-TsT5ztzzzzK1D2z3zjzkzgzqzkLgL4LrzmzsL6LyL9z1z7zhLqL2Lg9szxLuLnziLpzpLrLllrR-OdLtLwL+L7LoL0L5LzL0r8LsrtN1Lkr4rgrurjL6ryrlBhrtrorprqrrrmLnLjrwrir+L2r9rgbzrnrlr8r5r+rvrxr-ryb0bib7rhbsbqbkbn5-z5b+b3r1bmbnbuzvLkCYbub2bxbrbo73b6bw7k78bmr9bpbu707q7lbs7y7jb4717877bl7+767n7p7x7jtobi7oHz74H570H-7t777v797r7h7mH8H+H59wHkHlHsH1HiHjF+z6HqHzb373H7HuHnHyHwnknvHhL5HtHynjH2Hsnj7qnxH+nonun6nhHpnmngn0l270njnnn-Hvn4n+trH-n5nhnln9H0XiXtn1n7n-ninsXxnmXgX3npX4X9n1X6X2ntXlX7XkXqX1buXyXxX3Xo3rXvVnX03i3jX5X43zXq39X8X8Zrn23h3k3u3838JoX93l353hXn3+X-3w3v3wPrtg3vX3363y3734DgPsPmP13qP+38PxPuPoP6Tp3iPt3m3jPhPsdz3sxlP7PpPr3ovrP5P4Psv2PovdPiv+PkvyPkvvPvP+vgvmv1P2vlv4vjv0v8n6vzv8vvvyvwfq5xv-b2kZv-v7vyf8foftv2fwvo10P9vif6fpfnNpvzPlfuf1v+f5fjfvfnP3t3vqf-fuvk-rvzfnfmfy-1fm-rfgf2-wbo-i-7fl-+-i5kfoxg-5-t-6-u-4-r-s-rvyR5P9ABV-V-v-1P4ACoBkAmAef1AEP9wBI7Rfn-2-4QDrO6-aAXAMwFADYBOArAbgLAGjtkBv-EgYgMz4YCCBCAn-mQOwGEC0BeAhgUT2IE0DKBKA+AWwNoFUD6BdA1AbwPYGkCc6OYPgZwI4ErNR+3ArgcINYECCJBog-AfIP77MDqByg2QcVwoEKCeB-AlgRoMkFaCVBUghfiAJEEyCDBrXPQaoO0GMDdBxgywZoJsE99P25g0wXYOkG2DrBrg-QU4K8H2CLBDgoQd4I8G+Cghzg9wToLkFWDwhLgsIcryUHBCAhGPdQREJMHxCkhbgyIaENSGeDgBjgnwSEPSH5DkhuQlIVEMyFxCih5QzsjkMCF5DCh1Q4oRkJKGNCGhzQgoWkMf5VDohbQrobqxqHdCyhdQioZ0KyEDCRhO7DoaUN6E69EhTQ1ocMKGH9D5hkwhYRMKkrjCZhtQxYfUNmHLD1hfQpYfsK2ExCjBowlYYMNOEnDdhcw84ZsLOGXCZusQg4bcOH7iDHhFwloRsOuGfC7hrwiHg8MOF7D-hVw74YCJ2HvCARTw7Yciz+EQiPhwImEeCLeGQiQRPwr4WCMEFAi0RoIpEfCIxHYjERsIzESiMuHQj8RCI0ti8ORGUicRWIgkXiJuGkjteJI+kcyNqbTDCRVIhkTSLJGoi6RPI9of4OpFEjnhn-TkUKN5FwjRRHIlkRKPSZMi+R3ImUfKNxG0iVRCo9kYKKlEutjh0o9UZKI1H6i9RhonUeKN1GmdtRSorkcqLVEmibRqoq0faMtGOiCucoxUa6NNEWixRdop0ZqLdG2jZe5o30V6Ny4ijjRQYn0e6MDHWiwxBo34QGIjHxj3+FImMR6PDF+iHRnoqMZmKIFxi0x3onVnmKNEpjkxkY9MamOjHuMXRCY8saGKzEFiaxpY4sVWNrHOicx1YosYWJLF1j2x9YrsZ2IzFrc1hTYhsR2KHG9jRx-YscbmInExNWxzYkEWyKnFli5xjYxcSuLbHEjZxw4nsdOKXFbjux+4vsbuMtGVjVxgQhceuPHFHidxa45cSOLJ4niLxp47cVeJfE3i9xh4t8d3wfG3iex54n8QeMvGfjrxd4x8fyPfGATEOf48CU+IAkwSPxIE-8YQO-HQTQJWrJMUB0QkQTnxQE18QhJQladkJk41CSiyglETMJcErCbBOIlkTGRm4mifRPZY9DcJ2EvCQxOYlUTyJ3BQcRRJ4nUTgJLEgSRxPwnCSaJhE-iUJLYk4SpJrE8SfBKGFiT2JckswdJMElKS1JlE9SbxNuoiTZJRvUibpK0k6TFJGkkybMIUkqSJJjEySTJOMmGTrJqkqgeZJskWTNJfE2yW5JcmmSPJlQgUc5L8kOS7JBk7yQFOCmWS8WTkkKZxKilGTPJgU9ydFPslV9uJoU1ybWP0nxSYp-ksKbFJSlZs6JQUhKQ13Sk5TCpGUxKalMyljDfJkUyqdlKykVTypXk0qSVOzHJTmp9UpqbVIakFSupnUxqbWwil1Sapk-YqR1LiktT+puUtMYNO6llSepk09qcNPmnLTHGM0vqStImkbSxpU0naYtMo5rTxp20voaNKWlzSzpm086T5N6mHTTp77E6UNIemzSLpz0isflMum3Sjp103aV9L2lPSGRB076QtJ+nAykO90v6R9IhmPS8pbUkGVtMhngyoZN0xGYDO-4Azfp6096cpM+lAycZcMoSWjNhmYyEZozMGRjJenwyyZ-0t6eTORnoykZxMymRTPpmK8CZuMomYzPe6kzmZ3MlGezOU6sy8ZDMnmXTN5k0yhZos16TDLZliyOZ4stCSGNpmEyZZws1qdVMVnSzsZgs2WdrJVkayzRUsrWbrMNkSymZJs9WcbK+YCy+ZZsuWUrM1nWyRZjs9EXrPNkOy7Zpsp2S7Ntn3DqZ9s5WTbJ1kByjZbsr2X5wNkhyLZ7s12f7M9mRzRJvsj2VHO9lxyU5EctOTnytkxyk5gc2OenL9n5z5JCc6OQXOLnTtQ5wcrOeXLtGZyS5ycvOYnKrm5zK5LY8Oc3PrmlyO5dctud3KO41yG5qcnuf3Pbldza5N3VuaPIrkTyg508puVPNnlVTs5k8huVzJnmLzV5jcteQRKLkjyh5g8zuTnM3mHygZfc-eUvNPnryB5c8o+S3LVk7zz55nD-iUzH7DyD5G8t+ZfNlHbzX5H8t1qRJXnzz7518l+YZJPl3ywF384BRfMgUAKvOoCiBXvLoH-ygFCC+BVfK-Ffyz54CzBXkxgWoLd5aCrXnAuwXEKoFKCkhbgvIW0Tx5+CmhYApGnoTaFWC0hQQtWkYLmFjCvBRPyQXvzoFyCqmdQroU-ymFFC9hYIt4U+yBFwivhRwsoU8KyFoijcZIs4VSK5FLC+RSIo0XKCiFCi5RbotkVCK9FOi-mWws0WqKZFRiixaYoMX3iTF0isReorsUqLrFlivwY4sMVWLyBDC3+V4u45MSHFZi+xUX20UeKJpf8nxTgrcX6LxFzirMcEsiUuKzeASpxdEpSU4i4lSS9xSoMfnVxUBigSHNsAACSAQPJSkEEjGASl2wAANLFKMA+Sj0BUuWBFLyltSlIAAGUal8AOpUqAaVlAylfAHpTUAADyHSuAF0pqAAB1EZWMsMAAAZKZbSAGWGB2lzSzpSkGGUrLRlKQAAELzLtgAAJV2XLAeIGy6ZQcEWXkAAAhIcrKBXKTlKQW5SErwnpKYl8ShKdwuyXgQXlGSqJfYOeWpK1FAK8xY8qBWHy-l-ir5RCu6UtLtgAAF2uU1AAAnvCsMAAA6ZFWcuhXLAAAVOiruDnLuAFhO5dsB9xErlgAAE1xW1B8V4AHFQkshX69bF3yulf8pBVMrgVgShefakdjcqn4PKrlbyoFX8qhVfKkVYKtFXCqxVkqiVdKvFWyqpVcqmVfKqVWKqVVCqtVcqqxQZggAA"
));

export default createNewAscii;
