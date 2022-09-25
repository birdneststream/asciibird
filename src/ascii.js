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
  "NrDeCICMHNwLgKwBpwDNZwCwoMYAsBDAJ3nAAJwBfJCGeZNDbcfY0i62jB9eZ1knHJUaUbil5ZchQcM5j6EptLZCOouoiV8Vs9V0WMdLGexEGtRqSdVyN4q-1NrzCy5Ke39bnspt7XTV9jATN5IO1rUJdwjAAGSIT-MPtDD10Ui2Co5zssyM8A2LS-aLyfAoyY1PdS3O8IxyryxvTk6vym9paHNrKG3rqvQMGQ+pGSseHi2qmimuzCzIqu-onZnOmFyu6Byc35zr7xmcXmvbgkySS1053b7dWTx+Oto6HDldfP1o-l37m-1GByB+yWHS+fwhAJB0OB4J6YPO6zOuxR92eFiu8WRdyeb0hgLhSLReO+oI2CIuqIe7yJiMpuJeUIZNMxhNhrIxBJhVPW2PgN3ZvKZdM51O5P3hosoAF0kGAOXyySyJfipSTaUrRdrScz6WrycTGXqxcr9eL0eqKWyeTirEK7ZrhdLTbqtSK3Z6Pa6fc6nSa-YGXf6NcGA7aw5GbZKY9bjdGE7Gk-GuanDaqrUaGQLLjrvSHw1Hk2nsxmDVnMyqK9XLbXzWb877C4nS1WLQ33YXc47i+nKzWO03Q3GywO60Ovc2IyXyxPG1ORymxzMe8Oi6P2wug639HKFduW7Px52CzP+-X17uT1fj5fFxvl1uuwG1w-r-ed3fJ1+Lz+j3+h7niu-7Ac+Z59iBQGQeB04wYO0GbghL7wfObhvr+UEoUhaEQThp5wfht6AdhT7IXhZG4YRlEEUuOaJMRWEUW25HUSxVF0XOtGPux3EfqBqF8d+WIMe+wmkbxjFbvuirMVxUmsZxN5iSRcnKZhsFKZ+AFMWxc69qQgABpPyokaYKzSACGk44GUIVm1jZ4B2RaDlOWKLnWZZHndK5HLufZnn+d5XllD5MJ+c5AURUFgUhcFuShcC4VuZFyXRVFsWrqZOn2hl6XxXFtgJfsSW+SlpVpaluWVflMU1XlhUFbIRUbCVYVlW1FXlVV6FZWB5mdR13WDXV1UNbVY31U16nZYpPHySpulaQJFIYTNHFzdNfXzjJo2yMZ417Y1RlHUI+01KtW0OWdu3HQdt2TfdN2nSd4DXV1uRvcNtifYlzQ-cVf2bYJCnrfxiE0SDQmqXpQMrb1wMLZpG3aVtUOLcjy0Q4js1gxJ81maD4lqSjCME9xF2k2taNI7jxOY5J2OE9DS3g-RDog1dL3-S1gN3c9fOvVzQsC9z2ScyLwsPfzNA7XjsNY2T64U0RjPUzjRMwyTKuK6rkN67rBs60bVP68bqOm928Paybhtra1v0DQ7Q1OyN70TU9jkvc1YvtS77tu1NAve1btle-LDNm2GysKzbkfW+btsJ3HMdJ7Hlvs4nlOp9nWe5-HecpwXEdp28st06z+Ml1HIfsfbLNy1rhf583Tet8XOct+3ReVx3bc9934cXNHbPXOuACMABsNfc5P0-rLPVhj+PU+L8vkRLw+C+SBvQZbxgO+Fnv8AHwGR9wCfYZnxfFJX2vq+byv2930-D-r8-OUffPj8f99JkZ0Gw99K+wBo7EBzswGuy+oHem-dO6wL7oPSWIl-5VzgYgxuXc0EYPgZghB2DzBl01jA9BxD8GZRQb3XBVCcE0JIRXOhDdSFMPoUHMOrD2FS09hwiwZ9xY1Fvq-e+u9v7H3fqIwRL9hFvwkfvMR585HX2NAIqRQjD4iPkTI8RKjJFqOkdo2RmiNH6K0bo1Rp91GKIZMo0xOjzF6JsQY4xRiHEmLsRQw6MxeG804cHdxpBfHo1pkQ5Bo9M5YOYYwlhETy6RNiTE8uhCIH+ygf4thPi0khJ-qhOuPNQG5PAfkyBftoEewCVk1JZD0ncLcF47oM91F8J4Q07xTT7FuNsZfCxCjumGMsRcaxAYAAcGtj5dN6T0pxfSv5tM6TMm+YzJkTJcc49pjjllTM8Qs9ZSzVmuNmWY-ZHT5lzKUVs3ZKzDlrPORs-hZzLl7OOQcx5RzTlz02W886Nch5fKQQHR6fzpYe1Fh8oFvyUmAoBYLCW0LOHXUSRjKJiK4nBORfXeJKL0VouKRUz5fjXl4qhbck5Vi7nPKufci5ZKHn4peSS4l-TSU0vJVSylTLqV0qecaYZzM4DcvRgMilNzWmco5bShl9LpkivFVKyVYrZXMrZay0VCrlXsulXK95MrNUaqJVq3VOrhUGpqYy1VSr1UqvNWq+VVrtUWutWa+1QrjUSttTa-VdrXV5jqX-UJBMck+zyUErFwaEWotDZi8NwT4VBsjSGmN8aRmxqTQmglzVAH2sac6vVhqPXurdTm-NWajWaAFSyp1JaTWWodZ68t+9K2Op2YKxtFI+VI1bbNdt61O3cW7c2xVtbRkurzdW4dA7z71prX201Y7S39qnVWmdE7R3zobeMtdiz13bM3dcldk7t1NsMZmitIKeoEqAYGxNKbAmXpvYBaNt7r08qvTTB9L6eXps9UeutQ6C0jt-Yun9Rbc3-t3cu-dZbQMgfA3O6D07INAcLZoXtD5kNBlQ4WdDQzE2zrg7Bhd8Hj3ZoQ3+4jAGiOEeLd+8jVHKODuo3R2j47AMUeA6RgjGBMMHo3dxrdPGd14dXXxrjvHllfv6r61BeDokYqjfKWSMm42vv6gUgNKmlNeoKR+4dYmmP0d04xnD+GBN7qExB4zYHTMwcs7h6zRnbOCZE1h1MgBbUnWJx0ggAAUjcyWLzMx3NCEAHakDCkPYaXVB+zJnHPCf4xFizUWzOxfC-FqzyWGT+bS6F5jNHWMscQ9lvLDGcv5ZI7lkrxWyMGbC2x8zSXzk6a06UjJkLXL3tTU1zQDXiM6dqWUepJ7Svdaq6VirRXCsFf06Nib43DMOZi6luz83ZvReWwlxbkW5sbZW1yksgAgUm8zy9LFx0t7cqRYQ7S3Vubcu1tmza24tXZSw927T2Fsvf2+jc7fnMt6c+-dm7r3-sXce4D9bIO-vXYh8DuGZ72uyYPGG37Z3E2I+Iz2ksrmvupl8zUdL2OkepiC5j-lQ3yvsbG2V8nY6UchYO99yrWXKdk6mxT5nI3psk8ZzVtwx33ssgAPa8-pAAfUF5yAXp3ud08mzN0HkPntg9qwr6raHkdS-Zwz1nTPqccfR6LhEePJdY7180QnOO1cs5l+DqH1v5ctvN2zi3HPNdc+G0rH5p3Wvo066VtHtO-fZnF2b1MIuif8+N90E7Qfica8t4ruXR3VdPsTx9+3TPY-K7u3Hm3AP4-h7KJH-HKeXN59yIAe1IS9OaL9HvT6fXcu9J-XzniXDdV7banxvzuVf+7D6H4XFfZCB8LyyAvLeka14b83uvXfW8duT2Pp34+m+Z4z6+d3zDPdI298V7iZ8d-qN99mQADqT99IKbofs-Uwj5p9X+nNeF9O+1-AdLGOo8sgN9ft-J-AtA4y93i-N-JtH9eU59-8kYAB2XbdYCAv-TkK-HXGAhEF-c-Tkd-eA7MVA+AaA7MM-FfJXKfZffAt7WXbbYvXvFAr-cADA4AgnH-HPbPcOY-MghEHAj-UA+kOAp-dvSfCfDDXXJg5oKg3HCglgtAtvHlRfTvAgng1fGHbhDfWaLfcnPfc3ZQhA5oDg6gmfWAigug23eg4g3-LQhEDQ9LQfUfNgsXWgqw-glDEArtOwg-MQow9QqAhwlwmw6fYfVw1MMwzQLA8AksXw6QvA4I3PAw3QiIigkwwIigkPV-ekIIpfIgq3PQwwrwjw3gy-HQ6wlIyIjI2waInw2IigxIzQpw8o2aCQqo+-DXBreQjTT+GFTJZTZZVQgAiw4w7I-I2QQo9ox3GPGon7NwiPLo+IzkAAWiiJyKzzSI6PXGf28PQMWM-26NP1GOQM6JmH8Nmm2O0NWJIOzA0N2O4mOOaEmK2MgIuPEMGNv1uOlwf2GPz3WPMM5CQJeIRHL3COmNwLtzUJGP2NmL2LGLaPuIGI1x5wBIuFOO6DeNYM5E+OBPmL4MRO6EEJ82EOeMIOrlkJljkyRQjUUOZxBMqP3yRKyKuOcP+JRO4KSJCNpN+MpKeIpICNIOpLLwoNhNEPpDRKNwBJEM4KKOZL7yFMsJFM2LZMr3SP4QACZE1oSmSah5TMjDj55ZS-iyhOTMCSwESLAlTJSSSwS79DTGMgCISJSwwzSZi8jzSGSKj7DySbSDipSNiyS+iqdHjcgji5TLjHTATHCEjiiATSjLT3imc6i8Sw0Y1CTd85FiT7SVSxT1w9SejlidiuCpD6T9DfSvSeVkzSAcz0Y8yhBeie9fS4iXTuhgySxGDFSSx+S4AiyGRGySy5iqSeE1T+UOznS3BGz+kuz2DVTvSHSKzPDWzRz1oJDTSPSAxmzUz1pZyvjFzcjMSuT4zuy-ChyEzazczNyWTCyfTdTdyBzEyHxeyKCayRzch6ypzhyfiszmiGjS4IyI0oy19f04z-T5yDyeyjygTLz9SJybjQSjS9MFztz9zbyNzxD+y-yakYLPzEC5yPikKkzvyS14Lx4MK2zQzbDIL94sLd4CLPSULN4iKCjBydy8KtTKKILGTlS7SELUKaL1yMAzyTyFSrTvi4TGLcLaKWLqK+LjzwKx8yKLTfyTi0L8LxL3CZTpLTy5KOKfz1TiLISuL7QJMnz4dwVCVQVyENLsT9LbTuSKCqDGydS4KFLcgLylKlj2LcgeTbLhLjK7LbBTL0SXLZBzL0LLLbBrKoLHLDzUwvKpLoLqySKyg3LeSnL4TwrD5RLSA-LWL3LorkKPKb54qhBErj4MrKCKLsxgqQ1GysqGzkrAqAqbKViUqBDYrXKarZBIryr-LKr2ztS8qGLmhiqhCASGrmqKrnKqrUS6rSACrz4cq+ywrPEcqqCx4pq2r+qWqoqyqWQRq2KBqyhirGyer5q+ryDJrWq9rlLfKVzMyR5ykOh6i1Z1pCTpSABObDMauaich6tK40VapatM0Kz6zs+6n6r6kSxNW6nysMN6na7iQGnlcG9GSGpGaG2aWG9aeGsGu6iG5GqG1GmG9GuGzGhG7GpGgG3G9cRGwmgmh8Im0mkmoMMmymimwsKm2mmmgMOmxmhmsMJm1mlmikNmzmjm40Lm3mnmhkPmwWgWi4IW0WkW9YMWyWiWmYKW2WmWmoOWxWhWiwJW1WlWtwNWzWjWzQLW3WnW9Ss66hAhZ8hTQpZJQ2lo5m-Gm2lG22tG+2jGx2rG52nG12vGu2z2h2r2p2n2l2v2t2gOj272kO320O-28OwOyO4OsO2OiOuOqOhOmO+OlOxO1O5OtOzOjO7O4m923OoO-O6OwupO4u9O0urO8ujOnJeGnJQk1TEaeonTeu3+JoyFYFAlbma67G6u7u4BOAGuvugevJIegpEeopeAMei2ie3u4emetTDusFbFCFbS9uwy5epenStuxepJDxWFbe823e3Sve1ule-e5uw+rek+jASekpbWmuZqG+nFdW++6Wl++Wt+5Wj+5+trd+n+z+v+7+terhf+oBh+ue8eg+-5U+q+neqBje1eo2hBq2i+6B4+tBo+jBy+9BrBzB1B3B+BucyxQAZNJCHmgSGRTiGTatKkqRVyHorKGKGyHSHug6H3qlVWGdqGH6GmHGGWHmGygOGmr2VBGaHaURGBKVVxGSraH+HcgpHdiuG2HFHOGeHuG+HeGBHZHbB5HiUdGZGNG5GtHZA9GxGjHSATHJGzGhALHhGrHwAbH2G7GHHlGhHHGDHtGnHPH3HjGvG1HNHvHzHfGlHVHgn1G-HDGAnrGgmVGwnQn-HwmPHIn7HonXGXHRHLGknnGQmYn4m4mImEmfHMmUn0nbGimymCnAnym8nEmKmomqmcn8nQB4UFHsnUnWmSm3Hankn6m2nYmGmanqnCmumsm+nencn+mhnBnKnhnimJHSmZmemOm0m5nOmpm6mFmNm1nunNmJnpmtmRnxmxnGndn1n9nZnpHTHFmVnlmLmMmdmjmBmTntmzmrnbn5mXn7mln2nrnvm3nVmnmDnjmHnJmAXzmWnRmvmIWfmoW-mbnwXDnIWEXoWkXYXfn4WgXEWMXkWsXUWYX0XHngW9nQXXn8WQXCXTnmndGwWqWSWaXPnsWCXMXGWGWyWmXWWWWiXyXnniX6XcWUXSXOW2XBWOXTnNandpSLFLEAA5SWyV5oAAU1lfXksUVdlrle6AABMlXF4x0JXlXmgABnbV7eSxUovVnV5oAAW2Nf3hVZtePl1fVbKDwHtfPjtbVf1e6AIFdbHksQABcfXHXPWygA2PWLXugXWw2TXmgABLQNw1+N0mp13IAAd0TbKDjajdteaAADt03chQ3Fbk3bBVWi3g3cgSAs2HXmgAB+H1wm8VxtjXAV0VrlwF5lvlnFlt7ltt6l-R3l7t9t9lztjtwdvty5gdulj56dnlpp02kVntoV1tpdxdhdod4Vkd4dsd2l-tmd3tndidvdld9d5dtd8581xjC9ybK98bG9lnO9oNvTB9htjXZ9pN19ptp9z9y979693929-9+9wDx9n9j9sDr98D0DiD6DqDxjbdyd3d2dpD-dhDw95D498du5o9s9g9rD9DnD1DrDylxDlD7Dzdjd+Dsjyj-D8j092j1d+jk9hj6j0jmjljjD15t9ym4Dl9mD7N7oAAFXzdsErbLfDbKAAE9hPWbi3ZBIBpPSAABXBToQUT1W2T0gPNqtt12NlT8ALTsT6N7oWAbT313jozsoI10z01vT616zhVvT0WjToQAABz0+9fs+6AABs9OrPDO-3IOAu+OAPAvxt2OCOqOp22OovWPYuOPCP3nouSP4vIvkuIuku0PSPiPMuUuMu8O4v0uCvGPMPEuivwvivcPSvcuyuYvqu6vCv6uKuEv-mau0umvUucuGuuv2u8uqvuvyuBvav+uhuevWvOvRvGvBu2upvxuZv8vJuRu5u+uJvhvpvFv1u1vNvZuNvtutv5vVvD3sv9uVuTuluWuFu9vluzu4Wdvjvru0XburvHvzuDu7vnubvLuXvTv3uHvPuPvduAe3u-vfvAenvge8WfuIfwf+XIeYfoeu3YeEf4fR3EeUfket3UeMf0eKPMecfse6P7uofQevvCe4fifFGdpOAqeZYaemnafqe6fGeGfmf6fWeme2eWf2eufOeeeOe+fuf+feeBfhehfRf6fZRZQgA"
));

export default createNewAscii;
