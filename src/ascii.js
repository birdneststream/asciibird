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

  const zeroPad = (num, places = 2) => String(num).padStart(places, '0');

  for (let y = 0; y <= currentAsciiLayersWidthHeight.height - 1; y++) {

    for (let x = 0; x <= currentAsciiLayersWidthHeight.width - 1; x++) {
      curBlock = {
        ...blocks[y][x]
      };

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
  "NrDeCIGMAsEMCdwC5wAJwF8A0EBGBzZAFi3ADNCkSo5EV1sIYFk1MdwDkBGain6szptGnSr1L8kEmi3rs84vktJDWDDmvmitIzbXULZwjUwPb9cvWaunjhneetjikyoKd2uVN6-sWbEyNdOxDgzyNvZT8wx1tw+LigpIdLZLTUwMzyd1UnAB18hPSsgP9nKN8fctCIlLLYjLLKnJi6pudG0s727trEjhapDwG+hUYJnEnQadmp+ZmFucWV5bWljdWlgF0sMBrI3NbqroPRbxkpGVOL6OkRkpdq4bzRs8Gjl-fFZAB2Kv+3yegKkgJulBBENejyGR3ByAAHFUkUDvJC-tDsmiAZjmlDjmDek8UVIUfDnnCiadyZcVKi6VcHtlqVSidiCbiem8WW9vCTKGTWdyhY8eaKRcy2Z9KcLZTD8aDOf1xXKsQLkUrDn4vuT+YjNfUuSrjZLVXjtTKTeakOibQaPha2rzpU6rUbTfLHScJQ0pfrjoKzRUFfixZl1ltI2tdvtyXcmb7nQIqtc-fcUwng8njqmkxTXWqvZmvC7vUGSxiOfT-aT7T8kHqG3XiRrq02A82+a3ybbCXn482w4m3crC+mc8XimPe52Q5WezigXGqpPzqXVx1R9aB22d8vjhuxoat+7h9PFwuq-udT6s3ar2mZ22n7ru7eTxX74rnxe03vH7+-YrrONbqkuf7AbukGvh2P4PuWWr5mWnpfqG75TtajaBih-5AQeg7oWuRYEaMEazDGR6bohtLZjSdy5ihNHjtelpjkxDFsfRh5PLhOHQRB+FQYJQ53lhJEoWJbaSTBtZSW+eYvgJN54cpfHCYRVFEah85Kax1qKQpgGMVxIHjoypnsdxsIFtu-EqXpd68ee8Ejhhp7uZ+Tn6UZznfiJnl2a5WleXeBkoWFY4hZ+0lpjFhkuWxACsKbJUJqlJSlplRdRqVXKlNK5eI+UAQlmHyUFDpIVZ65ZYFHr1bZ6n2TZjl1WeARkZsEwUeBCFaZZFkmW2A1pQ5n4jXRGamXFanpdaE1pgtfWVdlWkRe1rVNeFPneaVd7cIVPDFXmM1jqdZWwSxLXReVZ23btfm6ddiGrStbX7Smg1TcNn3DUNk0Tl9gNyZdi3-WD30yWBUP+jSv1wzmFnw4tyN5twqOMYd0jHZjmXDVjB0WQTONsRjpOIyDskw+2BV49T2F3aDJ33ftxNE3Ti1s5T0OxSzN1M7jOYk-NXO00L7Pi9zsO8wLjNUxpUZdTsez1ktxmQwrTxq5xGvNchkXvQFW068DV36w9aHLfWr2Uar4No-b217R+bn8-LzOyxd7uMWT82+x9FMI1cSOByVj169V2bmT9ocO7rPuxwnwd-fHJvRwD6cQ6bWeZ3H2ce97cs82j-vjaX1Hl-1leVejifk8nQfiCHDco3XfttwHLclx3Zc9xXfdVwPb3G17xcSXziHnaJE-9aLMuF6P0sF2PRdL+PnvTxvbsr4vNPzzvHnjEriszD17Lh+r+dOxfBsj4fwWGy9j8P3fn7rZtc0f2NT+vz-n9G--V2QCX6AJAd-MBz0tJT23mvW+oDKrQMQu-GBe88wAAYqgYLbFgqQWDyQ4MoHgsOltr4kN8mQ60BDkBELzrnS+dCxxUKQDQlCTCWGMMwUDBh81Har1QevBem9BEAPAcPeB9Y2GmUkdgzhMjjjsMobI-BSi0zSOUfI2qv8IHmzvGo1RKj0EGNmqIiRRi+EM13hYoRB8UFWNsdNGeCDHH1kQVA5xLYt6T3cV2TxbjfGaWPmRHql4b4Wx0hHcS5DwnGMgQE+syC-4mJ4s-MRSTrI6JdtoyOVVTIJOPEgnaX9YkuO8TVUaxSPHCIKc7RCejDEaLkbgqRZjGriKeHU1hLTdFdM-B0+uTcY5dyTgM9RTS4KhNCoU+xUt+EZUliEih3SGmjMIc05Zrchn9J4M3EZGzdn1LGSs6hOztnlIyV4-x1sUmmPWcvWBliHGXMqTYi5VS-FvKcU8nxHz4lTOqRMt+fy1pAs+T8559z76BMCcE4h0SGpFPOVkzRbT0nZJtuC2ZDyZl2MSRU75LykXYuRWkspZtuJkuJXisCYL8UQpEVSysALak9OZbcmJiLKp5NSQy5hLKtJ9MUWyjhQr26bNFfs4Zpyjm8vGYs8avCsX0wlnlZVRVckgpuYc-RIqEXZNrmKzuEqtnSDWVqg5qzGkWulQopZZrOk6t6Xy0FBLnV0teUalAGB3VuveS635NTgUBs5Rq4EIbUWqqOo8ml1K-UYpxfkzqJ8MAwqtqGoN-qmWEoWXCsJ94M50nzbRJ6HK7apx4WW3VlKS1xsiRtQF6aiUpyvnAkloEfXBobeG2VOb9r6vELXGkfaeADu1Xa4VY7BUTt7SmEdaMh3SFnYxed3BF1sWXau+a66LJbu7Xm2Fe6IlnOya4muc94qZprjuwdM7t03uGlexaD6513uvTmDd0632mqtaO79h6KVHqjbG2lmLrHtpKV8mNYHklaNdSB6ZSqAO7r7PQgt+8oPAfjbBzDttE3kRVr1CqVyYOluba01tOTEP-qo8W8lOdUN-s1hhwD6G5wHsI1rBV+1OPwZoyck1TbuGVso7x4T565X9wNfWi9qtq4ZvE1mkT1GGPKZQ0W2h9GBFAbVfMzmHNu6SdxdWrt2a2NRNM7m5DLaeXouM-uyzZHrPXLTdJmtjbqbvoAJTerg957DrmENKfZdkrlJHBM8buT531LG22RbiQR+FdhP4ADpgFdRTex-yqWiMotY-ZyF2XyM2dJYxhkGm05lfLaRyZnbIOxYKxUsWKqBMVa4xW+VbXqLcc6x1qLdX-N0bU6p5iA3hvqcG+V8blWwvdaq+12bM3pv9S60tnrNdltrdW+B6NUcWtzcW1h5jfWmNubQ0d2rfnjsBdOxd87h2bsxfu+2bbT2tMPbu+9k7EXHsnq269l70X-tnbe59zTAOfv9a+7W6wuHlaxk1plhN3KjPFZU+Y9VNXiKiaC1WtFTnbibY4wT2zY3RtDY4lN3bC3KcrfmzT-boXqc11k1rZnFxWcDIM4PTnTOh4yd5yz-nbPBcc49YaqVezxf6dF73bnfPZcC-l0LxXIvJeSv443VXxr30y+lxJ3XXP9c8+V6c43-HTfLr49rvXmvxU27F+riXDupd251y763Tu1dW4N2773HuteW4D4Mw3v2welOB1dq2MPVjpas9WhHcX4-1eR+HxT130cueJ9jkHsfcfEegzlyNOm0ZntB0DwH32w-l8D4FnPVarEAElDOPbuFYgAgk3zkABZDvZyrEADke+6AAPKD6cAAFVH3rKxABRSfwgABqc-WCz+0f3pfDmQPd9X5ydv2-ygABF18Irb0fife+zZWIAJpH5H+fpwABVI-9KQMAHEj+P7v1Ya-n-hAAGUn9H4ABiR+AASkfgAIQAEKao4b654F4UY1625+6Kpp7Z4oGR5QpRgx51qGZwGFZOaJ757kbg6XaoGEHnzyZI54E8okG3ZY6170Eix6aCxNaFqk5o5B4+5UE448GMFCaIH8Gp4wGCHCHP7UHJ4IFCFZ4CFiG8EyG4FyFSEMHyHQHSFKGwGKGiEKF8GyE6HaEqHcF6GqHKHqH25e4HZoGgZl7g5dBR7dT4aEGOHw4laY4R7saZ4mFaHGEaFGGGEGFyY9q6GNbabBGF5uH+6+FJ7iEN5QFI5WIAASR+u+cRnIi+P+y+sRSeVi-+6RKAZ+KR5QyRWRnIYBuR4A+RxR5QK+BRugh+ZRz+Vit+NRTgA+9RQBR+jeZRpRzRVg1RlRF+O+R+rRPRwgdRIxseMRbRZRwx-RTgfRRBEK8x6SViYxsxU+nIiRZRSxpYViAAMkfgAAoQH6GO7mEh7WGV60Ep4YFJppYOGmFBHOGppsHk75YLESE2EuFV6WGZJ+EPEnGQ4-FU6Tata04WEa7IEiFqFeF-EwlRGaHQmImeFIk+H+HvHiEYkInInYmon-HeFQk4kEm4lwnolYnEkolEmUmPEkkeHkmEnUkUkMn0nu5nEYqsnAaebeacm9Z+ZOHPGayfykCI6nz3Gpq0lUkAmMlZbxY4HCmkmREQ6l7N544o5Sl06M7wlIZcIamE5gnnGPYW4KnikNGchHFlH7FbFJFH45HjEoDbFejKkbw2lrHCBNEumsBb62ngD2lISOmCJunvFr6WlTFelFGBmcgzHhnlDf5encCZFRm6DOkJlzFDFH6rHJnrHlCbFek+kt6cgWlelmlekmnlCQFlFllekVmalonGmSnMn4mu6QnhZKkfbhGymYHRiikZZPHdn8kk6vFSaUHVl4kJ4jnDk0mqn1kbZ6lawl5Tn6nV5jnyk1mTl0lrkSkNl1nrlMnblbkbmwlqkHnznLlLm1mbnnlHm7kXnjmHk3nHlnmXn7l3lXmPk7lPknkTmuGnkq5Nm+atlkEAU3F2HYFvF8m9ngUJbAnsHtm2wfnuGrnvkPnPnVYZ7aasEjYDlQWYXqkgl7Y6lIVwX3k7ERk35H4ADq8ZyxnInRXpSZVFvenIFRGZwg2Z7pdplFxF5QTF9FugNFbF4Anp-FuZleeZXFpFIZ-F6ZPFTgAZ0lVgAAGkfopWUcpV6apfxepcxRMZyFWVpSgLpXJcIAZZxboMZQ6XXhsUfsJRvAWfxUWfxWZZIZ+WbsHoqRwW2VYbyb0HYVMCBb8bBWBZBXKeQaVrhVhbRmKQhW+dFXuYOYEbFQlThdBaCfTm5egZ7ouc7r+b7uyT+blSbq5UroVXlZlRlZwdlUbsVQVVwXLlVS5TVQrnVYaRCflfVRVbVQ1UVZ1SVeVa1c1acaVRES1YNUgX1eztVe1Y1d1RNWNcLjNSNWYQtY2bNebuNW1a1Vcd8R5c2UFR2XcXDn2RBTBTKaBT2btbBQRZdVFeFWSYhdddebqalfjjOc9U9XQS8XqutgzmFUldhdOW9dcS2UCTyf+YCdtX+cDeCYBUDe5pyAAD4Q3g0g2Q0Lko1pWeWg0w3Q3uXY3pU41g240Y1o2kEE2k1Y1k343k1U2U3nU+UikHVHWnWHXnUnX+Ws3SmBXHWvX4W5a3V4U-WvmI0YWfVE6hXJX83i03XNYC3fWS3I1I1Q0U143K1E0K2o1q3o07Uq1a2q2E06361C1K261G0G3y162G3U3a0W001W1m0m3W222K2W3G3O2m1O3hh7VYEqx00+2e2+23EB3+1B1+0h2B2h1BLbBAA"
));

export default createNewAscii;
