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
  "NrDeCIGMAsEMCdwC5wAJwF8A0EYOWpjlHIiutrqQRcXmYZSfuUVS43da0wEYDmyAIxZwAM0FIRzBrQgDhoiYpk02qnlw5yNndrPUKpSydPpq+kgOwnkN3TqP3lSe+c3zrt16Pd7wRtIuZtz+Tt5uoY5e4jF+0XYRvlGGMS6R2qmJsdnxWT45BXmW2enJmSUFZQ75znEplXW5DcThhRkGjUk1Xe3lna1p9RWDpcMDnmPNI5NV4xajc9MTAUPLC7NNRS2b3cWLWx0bq1PbMydLZytt1fu7fT0HezsXh-3HN-Mer8-nn+vff5XD6mbwhP6gwrg66Q4LvQFrYEI05HZGXVFhREYhLo+GYlRwx6zIKQu4XEkqMlA7G1X4wlF4nFvInksGM-IU4wsqmw0kvMkCl5GAAc3lF3P5kohBL55zulAVAF0sGAJXKpStBerpVzCTyGSzAmzDbzKULTVz9brZfTcSaDVbmVaACzeV32pDulzux10kEO83IcUucW+h5h26B61mnVOqNx2N+tEJ20p-1IYOSUNRznQ9Np5NJ-F2q259mVTNB8uLSsZ6uzWvZnVlj0F4ttplFnEABm8vdbXdp4fjg96kcTw4n49To6ek5n8-TLat-Zc-dLxo3UPrrO3A8XhYP7dn92nS83OYvzavC7Ph7vx6PnafQ4fz7fHJv573W71GuOWqapeP7-h4Co4BgyqqoB35-tqQHwQBwFwbeXzFsuI4vmOaHvjhn4gdeBG2hhOpepIPpRmRyAUaRbo7kYVGevR5F0R6jE0ba7HMVWhRNsRX5oo23F1rxwkkahAKPh+FZimJAnFkJ+7SXOymnnhlTiemilWtpyE2lpslKepKnGWpkm4eZr6mT8WEmZZ2H2XZSJSdZ1JyURsH6WimloqukjrnpMb8R53nyRZzk4j5LmOWZEX4Sh+YnruCWhSF0VxQ5GVOTSmU5dlwkdvFXn+DB3ylehYXqPKEFQfoSGIWVoEVWlkWVblBVJW5RkxTZqnJcV4V5bFQ39UF6ZcWxrEulNgWWrNeapSlzVLTiuk6mtwUrfkG0GaJHpRT2fbCX5yABTqJ1IGdto7YJhk6XdUY3QpD1Tq5WLCU9q0vRJWXDR1tl-d1v29W9PEhu5W0aW1iwHdt327eD+3Q8SyOjXNhGQ4sF1XZ5Y2LQNRV48tBNQy1Vk9V1Eag9G6ObSTMOo5TmF9Uzr0U+9SNk0w1WgOBvMQTVKp1Y1DUlfNEP04DVPszKROtVzDMKyjSuc5jytqxcE3TYUHG47TesLcTctw3t92m498P48bpMayKltG-rvlHarkto4b8u2xa7v5NjEvWzW9se67dvm+tgcm4jZuRxbod0-76vBxzv6JwGbPAyH0dpyNGdZsdztR7nHqfYTjsO97NspyJmfXeHMmxwjhcFzxTciS3fEG37pdB-HIMyyWzPU7DFc90aKusz92dJ+LaoTHzc+1TP9UIXHXfk+nU8Y5XQ+K571EzbROud+Xixa5R++cefHcuyPhfVw3RMAHoR43Md31bq912-z31+-x8NrXWN87TxXEAzeN9ZYfx3pXX219IGzBgW3D6AD-4-2-l-bucCLgIKjNgsBmDR67yri-PBf8LjF3akDSeEDSEEMruQgOqCvqMOfs3V+xCa7MM-uw++rdgFsNYWHThDD0EsN4SQo+EjKH-RZhvFeNCvbSOpoVChydwE01ITzJUQtF6-0kdLdeqc5F6Kahg+R1DhKnwPt6Cxl80SWKMbAsxRCBEcJEVwlxPD263SEQnNR9CUFuOEdw7xgSAnBLLsY86oDbS4IcSAwoOMQnhKYaEshyC0k+IyaknOHikm5LQckkuTjYnphKboou6ScliLiQPPuZSCn5JSYU9x1TPFIMyVUrxDTWl5J6d0rpTTGmiIGcM9p2Tb7NKCUMlpIyZljMmb4-BsjEoA17gY-u4jHGROXhsOegtoImKKdsq+qjMHlR0Kcpx9jxq2OLNcuxtzTHHN6bMqZfTBmlyfnMipHSJmP1GT88ZYMFlYOiScvhUSEnzOmW815YSYXwveQCxBgKQWdOhUi75lyMVwqyWi-yYKnZQq2R6epHzcXotRQivF1LKUovpfwzFsKcUspJQywRQLnFMsRRSv53K3asuxVS-ldLGW8uBbShRUjpX6KoRsieii+7b0WRonYWiDmbKFVqiFNTNU6puYfSahrtbWKNaak1LE2X6vKey1x+KJUir5eKrlzr-E0sdQ611lSnWCrFb6jl9qXX+rtZKz1wbwUBtDeo8NLyY39LjeShNyK-XCq9b8sNqak1YpTbatpmb825tjQWnNJbI0eqDcWstabOVutFXq+tuqFUytqes5R+Vm0NqXrshetC1HKoFR2xtEaL7GrPqOqxlqLV7zNZOsd5q52zs7Ta0tIby21l1igAA6qIjd4AAASO68QAHlk1Vqzcyytq7q2BtrXyw2AAeU9V7z08pfe651-a63PsvXmwt8af1Fr-YmgD-6gNPt-Su4dEGz0geA2B7NS7QOQcA8hpDMH4MXow6+2D4Hl1Z0Va2zqyz7xKKI4YrtYEe1Su1fhq1iGcT3LuY8-IjGGPMcqKxlj7GT7cdmJx4eSyM1YffRi3dAA5Q9ugACikm-AyZabugAIrJ0IABlFTZalMaYYAAWW0wQAAKrhtD37hNfug6Z1DTycMIcs+hqzxm4MOdsxZ1zKGy2Gy+Zh5z3n7N+bswFtzJmgtOf8yFo5NnfOBfc9F4LMXwstMNgAPkc6lgTTi21SxbXKzLayctJXlFR8xg6oMPPHSO+dE7p1TqYjO6rC76tVdqzV3dbHyulYicK3d26FN4gPb16T+mUASYGy3XdABNIb4AT2jdCAAVSmx83d-W3m7oAIJTYAGpTfk1FhLe34uHbi8d0LQ68Nnc6zRi71mrsdZu9ak7aWDuPZc0d07+3sNmeow997b2nsqrfeZv7r2XvPfu2F4HYP-sDtuyRvuuXx4rJkeRkWs8ivRroxVxdWPGs4+aw1-HTXWtcfa2VyrePiccd45ranvbBMY7G8eqbAAFHbU2RurbxAAISm+p2bHBlMg9+6Dz7PnRcQ5FyJ4VD7odA8l3L4XivZc+si+L2LSuhfK6E2LqXX3tcS41285LWuK169Nz9iLZvb36-Vyb635uDd2+9Tbj7uudcK8t9lgj+XVmI-OxRvQkFtF06ubTy15ODUR7J9jyPMfo+49jwn+PhOKc2NJ0x9P4PrtTYANRTYAGJTYAJZTcQPzhgABTAvU2AD2U2AAenv6NN+z5rtvUP29q9dx7zvbvHe957x3ofXfIcj-lyrq3zuHe24HxP93c-+-D77zPpfIfAcL5X2Pw3W+nfpun93jfB+Xej5hxblRXuSv+6v2LGYQfVQMTD9OqPGfn9tdfyT9-VPM8f7jy-3-b--8f8k8-9gCADQCW87td8a0p9P1vtm90t19itYdLsz8oE+1GY4DW80D6dYCkDUCAdMdICEDCDr8s8iDsCnFcCGd8DT94CKDnkUC6CCDkCyDSCqoaC18SDx9j9uD98T9B8d9Z8eDt9l8j8+DGDbQAAmbwaQrg1giQgPOQeeYPTAxPFPNQynHjb-L-T-LQ3QvjR-WrfQmnbQvQwAnQ8wsw8Aiw6w+g6XPER9IQ8Q+QlwiAtg4glgtwhQ9wuwzwjwnBQlYsMlH2QIw6YleJNcPOcIgI6Ipg0FWImJUIkIhI0pJIyoYI9ItIwBFIolSI0lLI+BAo+IvIiIglfInI7wyo1w-wuIvw1fQ-HwwQ+o4QqA4qFLJw+3ToqfLovfe3Kg2QlwWQq0AYyQIYjg1Q1HXZAWfmXmBeOo5ggnTQgw0w5Y4wh-FYkwtY8PSw1YnYzYvY9YrYp-A4iY3gnozlKgy4jAvAuIzg+Y2grAhY24046o7IkomI94yFT4xIiosI741I34rwv4so0o06KI-43IkEj4qEr4mEn4iEoIooowDIt4uEgEhE14p4x4h48grE3EnExo0Q-ghoqo1oqNc4m9boqk3o6k6AvfK4seF4oE5kmonZMCaY9VPEwku48Ym41POrdQ5PJY-Y2w3Y0UkUwUkAyUsA6Ulk3w+fB1GXJwhkwhFUrea46g54vk-EnkrUzU7E5EpEsojE5Ik0zIwE1knU40tEyEsE8os01Eu00Ey6cEm0xEi0x0l0uQuUrk0ky07kpk-0v0+UvUik8k2kykmkqMukmMyM2M8M+kjUkY5AMYnUZMpAVMqQmQhgzEgk4M4WG-bEzROYw5bmXk-Uq0448Uw4k4qs2Umw+sqwxssU5siU4Ums6swM5o5wsk8tNU9Axk7UgMoc-MvM3M3Ug0rs308cqcscn0ucoMmckcpcis4c1c0cicys9clc-snAjU3cyg-cjUsMtdCMhM+M0udo7sk869c8uM+8u8qNA8nM9g2otVDkj82Y7Rc5V8tkwsrc5870jSdMoQTMpcECsC7yCCsSaC-aWC0seC8swCyfRMwcnsxc+czctc5CpCo8tCnCvUgiyc5czC2crCjcsiyikijCmikM4i7c0i6iuigCvCwhG8xA9C68s8086Mh8nii8j9Vi9UtCvo1GH83vcSrQIstVEs0WC5HXSS6cxihisswixC5sdS4iTS8CsESC9CbS7CoSgctimAoy+nUS-Csyw8yymy1Uqyl82ipSxytstPI4lS5ioU1y2s9ypyjyiipi3ywKhcvync+y1XIks47i28-ivi6KuKjioili2yuhUylWTRT8vZGYu-As3MxSnRf8wytK0skK5S0C3SmC8quCyqhC6qnMAy-S2qwisK+48ilciyuy5K4ylK3ip85qxYryzsus9s7Ywany4KoKjs1sya4aoagaqaka+agK8a5a1q0qvqxfJozaiKkQgQ7ak3RKtc9q4Sjqky1Ck612PK4Te4vK1a1StHb84qnK38-Em6qisa26qSpK86rqn6vc-C+qyKAGjkIG4CxqrSsGnSqEPStq1K76v606i49a+iqg-jJsmaow7y1Gls9GrGlyoCtGuanGww3G6awmsm-Giat6g6-y96kkna0Y7Mj0dM6G-ajUhHYjdKH3ZHWmlo5yj6p6u6xQ+c9KrKjK-ZAWz6yYwky6x6-K+SuS56qWgq5W0K-6iGqC9WhqqGiq7Wqq3Wmq-WuqzWwG424G02vmqm482G46m2366yuG+222+Gp2x2u2hykqi2pa-mvaz2nmzira3awOy2tC5m4SUOpmxmlq4OwhdmlHGm-tGWhWwWpW+Wv81OoW5y+YzkzKnOsW0W-O3OguvOwuku4usuouiu0uyu8uqu2umu+u2YxUIAA"
));

export default createNewAscii;
