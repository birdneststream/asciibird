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
  "NrDeCICMHNwLgIwBpwDNZwBwGYUGMALAQwCd5xAI0nAF8kIZ5k0Md9iy5Ka6oMn14rcIVLkqtenxQCsuYezHdJjaSzkiOXCbxXNB6hZ3E8GiVfraijSnWb2zLm48rsyhGxdtP81jzyal7d0MtAN03AytQlx8LeSjnW1iHeKcbb3MUj2svQIi-HLC4AAZMgBYC6NtS+wrU-xcamTrsqtMmjBaQxPbyyp6MDvguhPS833rCmMzg0dzwidaBhbilsZWs7vXXRa35ndW9ouTZtP2TyM0AAm2Lypv9gHYAJhnL8geil7f77e+g96cT4uf75SbgYG2UEYf6tSGmaHwWEheEw172ZFRVFI9EyTHXP64tG-J5EnEkr5kuD4j6EzI0oF0jHouFMvEslFswKtQAhpLdMkxWedygBOSp84W1MXg7EHOBlaW87YK0UUlwqqVq2wa5qKzmS3Va0wiuSGmXbE2q837S2a61FW1moUO02dPVYi2u+C250uR0YH36l2ZQMem1euChgnhkOAiGe2NGgMRqO0mP2VOMg3JpPelNx2X+vO5yMRwUhCXB+zlsNVmQ16N17lBv1lktF0vi-kZgvdmSZ+PZ4vgwABpAme+385PE-bWzPfbYOwPZckB5XQNQALpIMBJH7g5Zy04NPcA-p93ZzY77tZDzZX6Zng8Xw4P6p9Z-7Iby89fj+3opvxGM5AP-I5GjAt9elqX9QJgz84OaWCIPggDHyQ2dTwwhcMlQlt3zwqDBkgkCUOw8CCPIoiNmPKYsMvUj6NfRjcLBNCmPvRt0IYtNKRvfCESpBlBz45kS0RakOVrEEhKkrjFwjYTZQkgcx1Jek5N4mSNPE2TdJ0zDBIMnDiTEwzTPrLs7wbLSOI1JV9h1N0Syc4Z3Xk1jnPMtyrRMny7T8+VpSdASvJC6S7Pc2zjQjezQuHcKPJzAL4s7FKIpi3zUqXXt037XKm2HQLVwKucJ28tL8uncrApyksSvq+dsqnCrkhsrNr2rarLIqjt2pEsqqt6lriqaiLRuGsakoS5LapG5qpui5KhrmxaOo3bdd085iT22zjdvGHa6L22i2kO-bjuIwiWKuqibvgIDkMozonugnr2Le5tqJKAVXtur77p+rqELIgGDoe36Qee3QPv+mGKM++Hvu-frDxRv6IeB2HMfehG4bsbGgbu8GiZeqGTrjQ87nJ87Tqp-iMtp0qoSpU7lNZ5mjKfQKJLZi0qX69cFMh1azIc0T2X0sXUokpSuXJCrZc09aOLlu84qiIXTFcoKXOCryJsS8g1KKHX+pN9V9aRzQLe1K2CdSs2rM6o3OFt7X7cFl8HcZmbraWv2femyqwZVzKsYWiPfZD-2w+W0OBuFqPg7axqapCd346KyOVpz2bUoa1q1sT8Pc+jwvDYTzONn6ws23BLWs6D8hG8D2vvfb7QJtF3HNfHXvg767qE7rkW89jgatx3bijrOmjKe9untkemmcbJwmV43sfvuSGpWgAE29veQiII-KjIO9j6iABrM-wQAWzv1pT8vypYFf8EAFMn4LzIr80AAlj-cuf9KgvxdldVoj9rJpxkP-cgAA7YBmgAD2yDyAABd0FxzXsMDGpM8GryPAvO8S9SGcyZlLSWis9I0OMr-aWURq5yjVhLUyPNaEcPodHJWVD2EywFs7GezccG62Tsbb2GsbbKntlIgOYjXYl3OnI0ROsVFKP8oo2UaioqiOSOo5SjwsrRwAGwAFZ6RGIbt7R4Vie4wjsePakjiQHiL0dvQe9d7ET1Hm4jRMcRHgFbnKTuECfH9xHhE8JeVIkwKLn43xA8W5RMCcw1OmFu4MNFpk8a+EcmeOqtkyO3i0q+inltShRDN541wT+KpJESbo3qX4+m9h4GcAAM7YPAAAV26RfMJQNWjfw-pXTGrQADu3SCDdPAcI9p4AsGjIYXAyoABPbpaDllRD6dslOoDwQDPmZUEZgyFlzI4gsw+ez5G7xLNUneDNAbU0Ji8lZPFRG8woQrahJThJpI8fI3hdDGHB2BVw0FQLOECO4fshJHc9aAvcfC9WujwAAvSsHHRiLMXyOxRVJ21ibSCNHH8KxSTPnktiYM0Jg1qV0uiYVQJK4kX+KHpNFFTLaUcW5aYcxrKWWcuEbypuIq26wPpfEkpXs4kLnybc4uwS6rxLLvJOV+EKXooRRyzViT87R2VSU5cShynCLIYhdeNS5TAXkU015BzWhbLOZUJBNzOAABtulALdeAV1zqv7dMFas8EkBum7P9a0JZNKJXjJCBsn1TrjngnDUmsZQyQgzJ9RcvaCyABu3TTmpvebGqIUai1RETdDOp9ruZWreY82tri2IwsbWC6FTaPlz0kk8qFPbREinbdImJCsIW-JbZq4J6S01ioUZKj2AqZELscp7HFmqMW6u2PyvxzCt1ru9lu8WLhd0YAPalY98BT08KpReixRKvjXrgJeuFMgn3yI7K+5FL7b1po-WyiMv69XZwNfNDtQHg7ntKcWyDoHoPPv1QUvxk6l08HVa4+VKtp0xuZdqzDGS8n4bQ8UojwHi6Adg1pU1VabWXVqdRrtdqrUMYbcG1oXSfVlsuZUStObKgAAdA3dOuRGkI3HzoLO9cJqIfry2aHftGlVkCQgcZ4+CTNknAHdLY+p8gKAfUSZk5ggTenNPLwaTRgh1a619q7fW551nWnNp4RzPhs92bF2YSpb53b04kZ8220j8tyOfvg-IiDxr9gQfNvu79FZouroTsEwlab1HroNme29WjN0ZbS6Y7L-lAoQYMVlzIAHiv2FKxFvLj6YswYq1yoRPKsMzvZdK4ejLhUlki51qrM6uuktlVB7lqG1UEbhcN2ye6u5ZOm7k2bI3CO+aNV5w1Tjwt0Eo4jSzyNWVox2906TnHwSiY2As5TYmsMLM9T6wth3WhyYM5wbN53wRXe08FktGmfUHZU2mhZAArWZ3T+NZv26ZlpYPNW7euo0sz9HYcOc7Qj2eSOLo2es0GztbnIWfMHb27H-jkj-Jscrfx4Lx38Kc7ChV+PZQQdYUeqr9PbB05J7TxnrOyuTaKH11oO6evdeQwzwXzP+d3qF4hznCXJcT2CTz9Lwu+Wi9w8r+XQqResuYS12Lw7sMDdywrk9SvVcbsqwbmuWoFwTpsFbvXg8H1RZtPbyomunf9YdK73nFoPcZxw9lb3TDfcwZlfJz3tu31eKcc1iP0kNv4zo1DyHEOE4o-E0Zt74AnsncqNA9PGOPuGYTZstPD3wDxvT8duUCyU23ZCN957d3i816iKgIvPqjlN+Dg8wGXeSa2d7-ZxeJDBnmrNUP0fWG+bqVbXjsdlOafE7a0F0nVI1vaT89T1VG+QuiLC153fAv1876q6v9XEvTdn5D37jXXvr+O9v+7s3kZ-d2-vx1iqcu+7n5N9zo3+vt2B-A1-zg3ayTht0vz-2-3F0gNP2gMV2F3QzZWfwkTvzV2NCQP7QfRFBcUHhX2wOQIdFwOd35hDDwLdmIIzFIK1WJRIKIJQP7EoMLEwIYJv3-zD3e113qx1W3z-QCwkFj1o3wSY27z2z-HB1EMTx9TLxLwrzuWTUbx+xCGB3T1exLxuwUKiEz0r0qC01UPkPrygwWR0I7wL3LyByTwngT0tWY0R0H3wT73M3sLR2nwcIH3IQny8y+Rc28z+RJ1S2R0C0nzYVcwCK80cLZ3R2l1R3COcP8Q-00CQ1QIDHQKoIf0SO9GSMLEILdz9BXw52oIzDyIIJDEKJyOKPbCyND1SPoPbGSL51ZVlyANC0aKP0fziKaMfynWNyrkiN62aNiL6OiNgPOma1qJYKGPSMfwHRoOyMXAqOyjmINSpDKEoKVSWJWPIOaGYPyM2JqPKC2KqM6H2L9AfWWN2NYPAIQ3GICSj0F34Is3j3MK2zs2h1ESEJhzEItQsL0KzwU3z1eJEM+MCUsK+PEOT0eNRnBMEIBNBhBMBIhNBNhJhKBMhOaQkMBIeIRKeP7xiJRxHw4jxIpjsNcOHw8OcxBUc38xiLI2EmCU81oKCKXyx03xx3qJ6PpKgLnUNw6MmNGLoKSLOOqN6iYPKOmNqgWJwNFPmL2Ia2NDWJlIDDlN6kVNqhOKOMXFVIFO6LYP6NZK-05JvVaKqzq2EWNJgK5PfyNJq0AJKytPaPK1tPYNNL2idP5PtM1INKVMlM-yKIoJFN9M9P9LFOlJmNlODMqNKNqDVNDMjPdPlCjNdJ2KFLDKg1OK4Ink12j0uO4LI1XzuMcOBKxJcJeIJ1hzz3TSiAAAlukABRbpAAGW6QAAVukABCVs9sn1Nsn1MshZWUHvczfsuHYsgsjEwZOjMs8cyRLDSc9We5eHR40c8fIhfM2w5c4kpc0dTHEIrwwItfCkmfLcqfMAvcqXbUwY-U6rV-RrX4jgt-FUnkh8tIyMElIMp8qYt85Un3bYw49k2Y5MxYr0+IsY10+8wMq-C-O8rokAuAp8iDF0j0r9A-RCi0m0pC80grS0tCj0jC1ClC84443Ug4mXYC6ChMi898q4ii8il8qUj8wC5JPkiYpMsCg1YU5iwUtNLAxfLitMp-bi+MwOXMzaDcxjeczExcuyacqSm8mcsc6S5LeSlMxSmDWSpEiSwktcnEhcqE4c7SzS4mdg1SySmS5SzvMS9EokrStw-Sw8hk3clmKnFkiC68nmXk+9R-Wxbk2Cvohow0vyp8zo1iwigi5ytAx8yi8Uhin0ji7XaKkC2KiMmK70xK+K5K9U+ijAjKxA4Ks09MtkvCq4tolo7y-ywqzCgq9CqCy8iqpEdYvU2q+UhChxRq6qvEASx9OoLnSCoK0Ksi0ipipKl-Fioa489K3qga08oiwJXy-C3K1JAA8PSYkDLMsDRaw-SeYS-EsfLanSgyocvalHIyvaI65RUyrfQhBSkyq6wKQckc3aqw54-cosp6pwl63E7azbdSuPe6i6qzYsics6wyuc3S6ymtN61czc4Io8ya7qsFDIslDyty2GoFZIhIq4zyp8jG9G+G+q5xFqundqoqlI5GzK8avismni0asKim1Gki6aha4qrquah3H-R-Z4cq8MuajGw9KEB9bmmWPm9qrG5qxWQW8SMW0WyxcWqWyWjEIWiW1ymWgrTqkW5WpWs9FWhqsXZnTWvG7WvafmtKg2uqwZQ2oC3Gs2qKjkrWnmmCtq-GxnE2kEBWgW9WmDS2-tRSdqjsD2nguWxfX24EPM9cnamy-w8Sn6ws-ah694g6vSsGmOoGiqW6+O0SkGiysO1Hd6yy8G0Gv63OkknOmwiO1ExO6O367bdO4RE6gQzOgkypBOqGhk4PEm0nHG9yzG9u52nKhELuly122a3unukW7GxG0q1WhKrmp2qeh2t2821m+wZ4ExWexe5e-W80mQJelezeh0oJSIre9epq+Adm7ejAA+22s+tenelqk+-2w+uAA++2++4Wm2gep+xWu+nCz+qqwOyI3+i26eoe7+q9Oe0LXW32jzB9ExOjWXXW6Blyb8eBkMzob8CBhG4BuG0BylLBtunBwxPB9B9+t+iekBjBlGghp4F29272r2gOmh3gplIS6eUOxurOiG-O4uwuuuj6hutOuOkureKuqjIu8Orh1h+u+eERthvO6w0RkS2R6RsRjhuRlh5RxRtSyOr6jYGu+4qRiR4hLwlm1u-Bzusesml++ayhsx0egK6xi8ixmdBx6W0xlxmx6+5BrW9xzmoBrxr8ju3xgPKx1e38nxy+kJkesJjxvWzete7xiJ4+2J4hhJ5xmJlJyJj+1J2WzJjJkhzBsh7B-J3Bwpkxoh0h0pvJl9OjSBkrHRixsoBZWB8oXswhlBhBpp8SK+1pxWTp4YBZap2oZpoJ5oQZ-xrpnJ3ptJiZrJsZpJ+mnXIx0A7MlJE-UuJZnXJhipSR7hvRnhrZ8R3Zgx7Zo5-ZnZ0545tR-RlcmRx6zh+Rm5lRjSk585hRy5kOx5i5g5lO2c5O8yu57El6ss+yrmAF9hspmG-usF4ioZ+x2ms8lp-qlhSg-p8p8h4p+FvW8ZjF2Z-+0Z1+yFrF-FnF7utF6FvFip3J1FlFgpqlopmlkpil6lhl2lpl+lslylll9Fol3mih3Fgl8ltlxlgV5loV1lvl9lkVzlwm8B9q+pnB2knpsVzgRLVBwB+JxV4V9V0Vrl0JiV0lzVyVyZ-Vu8bVpuE1wOM1gJFZpuK1wS0qYOqypRl5g5q5x1+59R1Rp1s5wRtEpE+EuEyOv131gN4N0uxEqtQN8NkNp56Nj5r12N554QoRz6uNz1hNg8puk8jNhywetVlu7lnN83aZqFi48V28-NpmnVuZ3lxxvuyti1ix+tqh-lo13lxtnl4lulg1otltjtjlvVttkl6tlqpx5+2Fod7tmt4ezx8FytvN2dw1yd8xsd3t4tldst+didhdrdzdndzFxdtxmFryyizMta5kv2s9nM5bZaijTa951NmN+9+Nh9t115h1v5gc6EyN0N5EzEiNzbP9-GAD2pIDizEDt4j9j4oNtN5625j1l951t53hx95DxN-h11-52yzNqI7c8kzD7Nit4Y7dvd8J6dhFkduJ0j9dwj3d2Z-dw91x+jg9sj2t3Noj2jtjo26jwKPondOBnRo0mB-dHR5IJBwKTAJG2wcTq80wKTp82TgjwQCTmTpTlgFjxTo9xjmd1jmj-Fuj3V1t+W9t8tvtgzw1gdzt41+hwdhlRk5Zq9hhmzjZ99162Du9+DlN9z6Dlzh5pDzz71sE39qNvhgL-179sDz9-9oLlDjDnzvZp9+L6LmD2Lw559mL91tztLoFiyPD4FinSk2ffLvL9N7w8nPKvVud7T4jnT4AqjjYNB-twz6z4z-Ttd8zkz1rxriz0z7ti1wnJFmxKVzIXexpsmwK4OeTrUooCbhF6brAdq2b2TsTh9Rb1KBb+b5b9bmYTboIbbtwXb1TksNbw7lT9TgtkJDj5tvT2r6J9r5rntu7trlr1WKzhT64xfG4t8k9z224293zzLhDt9uD-7jz4Hrz7OsHlE-zsNyLsLqL1DkLqDqHn99DpL9Lv71H19gu5z8H1LjHgHrHoHvHkHpykF6GrN3LkdUrkrufAr4rpnCn6nwrsr5ukj7zV7iSBZvaK77ni70tnnnrzr27utwXp742prLDYb7YWbzng7uTtTubx-aX47xX+Xo7iqNXpbrb5Xnb7Xvb3X2XzXnX9Xjb-X07tNFb-Fi35tx7+74XszkX23tV3roz1Z0X01l7oX61+z9ay9tUe1gnjLoniH650H3H7ztHuLxL8P-R8D8u5HxH4L6HwDuH0PhLvztP1PqPnHjPoPsP7PrP0F9PmnnL7L8n0v7DsnivplLLn5Ev2vsv+vqvrDmvtnuv1vhv9vyxktwVqttd-nqrgf9j6rvn8X43lXoblq2b3e2UKf03uAafqXh9Bf-YWfsf+wZfqbpfufjflwJX++vfi+07qm2X4-o-rTs-mb1X+Xsbkf4fnv-vofwfzjwtlXXzY9paj-z7z-yA-31z9H6P-Hn-0j5F8QBmfUAbnxz5x9wukHL9kj2gE+tYBkA-PuAIAHE9UBwfFHugLz6F8wBuAiAcXw76eFcOhA3HOwXp7-9DwRAyGk33w5t8qBVPFvmTgIGM9iuMvRvmwJu6rs7uFXSjg-106892CM6A-pPWU7j85eWvNfnr0kHn8FeZNYQc-3O539ia3AgQRqz4GXdWe5HPxn300EndOBXfHQUoNFY8D9BJgm-iT0m5YcZ05g89uRWvbfcfednbit7wvYmpfuwAvAVgKQE4D8BKA5AZ4P8G+CAhkPRPvH0QGV0EBgfLwQXxD5BC4h0QvwT4ISHBDYhyQ+IYEOXwRFK+5AxvjkM755DCcJRRZlwIZ55CmBTPFgRYMp7MCyhpAzIfPmyFFDShTQ8vrUMcr1D2ey7FQaOzsbMdpOlXbQd0Io6mDdB-Q3gaMIY59DJh13LQYSwd428Fh8wpYfb1UG0kuhXPQxpoJoo1CWhuQ3YfkP2GFCA6+wn2icMUhnD2h1JC4Q0PWzuCUu3g1IRkKeFJDnhjwl4e8LeGfDQucAlPhB0iEUCPhmA14UCMBHY9QRhPNIZCOBFgivhznQFqSSnad9HG2wioW0LO42CyyRORoV4TRG08qhlQjoUV3xG4iiRhI6oaiP2HlC6elIuoUyUsG0Dmehgw-iMJ6FLtehMw+XrMI0FGD0W6g2-k-2t7LCBeqwhmv4jKA2DmE4ojTmR1pGBYSR5I6kTiMOGXCUkeQ04ccI1G8U1R5wv3ncJdYwiQRsIiEdCONHgiohJo80WaOT6w8bR2Ao0ZaPtEAjHRHg9IVaJdFQi3R9wmIYaJ9FwikhmI3wnKJpEqjsRxAgkQGK8JrggxSomMWGPlHhjoxcY4MTcKw7xi0xyYvEWSITGV8OBUosmnmNe4Fj6RGwpQWsMRFcj+Rj-KsXMJFGOQ+urPIsYyO1ASjlQGI1seUBnSNj5QnY-RNYI7Gxk8xoFZoCMXaEu5RxC+XihwK1xv87B3-WcV-yFS-9ku+o00c6K9GJC1xK4h0b6NXE7iYePw20Q8L3FOjjx7oi0SeINGXjdxV47cTeIvHXiHxt4x8eXw4FticxsY6gemMjFxgPMK+H8YFijE64sRTKYCamIzGki6RCo4keBKglZivxSYrDGqL0FvjTYKE9UGhObGP4uxPYrCS2LrFjDuxBE7CQ2LwmoTcJ5Ep8sRIJS9iXINE6if2Pom1AcJ6I8KuRXl6U0LyGE13td2nErUeJX3WwatQcGuD1mdrPUYhzPGeitx94p8bJJknyTJJm4iSeuNjoI9whG408SpNdFKTAeckxSZpOkn6S7xRk58SZL0laSPRa4jnqzy4kvjNhYY5ER5RRGsD7J1A1SKqJJy0k-xWwkMQyXgmfiYJvfCFiNWLF9UeJegqicyMimOxbJwwOiYFC7GDiYpDEhKfFOSlMTaJKU9KcOMykZTGJOU-KZ0GYkFTUpWU6OIlOKlFTcpJU7KVVJkoji8pQ4uqU1LinTkPuNUmca1N4pJTOphE7qe1OalOIepXEJcRHwsnnizJCk8aVJOUmGTppOkgPlNLmnLTZpq03SUtLWmLTJp20+aQZM2lADdpxkw6aZOOnmSVp6090RGKiZUjoJH4qnv5PumBSHpOwu6S9IcktVYp5NV7hxIRY-Twp0o67p9OinlS0pIMsqVilBkQzwZeKSGTDOhmqJYZCM+GWKMRkozkZ2iVGRjPRntjGptUrqaVNxlgzCZUM4medX+k00AZA036fYMEm2dRJzghmbxRtaWsxJzDM6ftOXEcyxp50raadI2kXS+ZO02PgWXgFqT9xR4o6TzIOlSzOZAsmWdzK5mY9pZiswAbLN5nyylZas5WVSUTEBTXpFI-WYqIQnGzqBZg1iU2OprfT2J1srKowVtl00eKLU8mpxRlarhXZ9s-CcNThleykZPstGX7KxkBycZg1b2SHN9lhz-ZEcwOVHODmDSiZHUkmQnNDlxzE5Kc5OfjLxl9TksDU0-ooNayTj3uhcpmS4LWaMMS5QkjamzP5nqyVZaAiaYLIbkazVZCsgWcLJCERCxZ1ou0XtLlm1yMBksvud3IHm9yR5Nc0edrLHmTyJ508kgb5LAmGzbpJsx6a5JEFcdwKVs82c7PXmpUQpTFJ2Y7O3l7zD5W8nqjHMYpBSSxBMpOeHLTk3yM58c2+ZHMfnRzn5sc++anPfnpys5mc4aV-N-l3zv5D8z+QAv-lPzgFYCwBR-MgV-y+xpMsgurFgXXzaZoCsjCgpSRoKdcGCplFgps44LihdMsuYzLKTCU+C62MhRuHIWkKKF1CqhbQsoX0KaFDCuhYwpYXMK2FTCjhaws4XsKuFvCnhfwu4WCK+FQi2hZuE3BAA"
));

export default createNewAscii;
