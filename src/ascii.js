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
  "NrDeCICMHNwLgIwBpwDNaJQYwBYEMAnecAAnAF8kIZ5k0M7dDizLqGV1bt8i5SKVKB3rdwTPgLbCxXTON4tB7WSIlLpNeXMaL+rIVro6ezfcpna1eqYZEmFZ2yqtj15zfetODL498lfS383GyCjTgCNO1VQnwsI0Xl3Z2DIuMCErwzov3TksKzYgvjPYt1SmNcSzLLqitqqkJrctKSG1sSHFPDslo8m-I6BvPbTRtHuwrrm4dSuqJG2qcrJxfm+ud7y8c7N3aWFnMP9xwnl9e36g42ds727nqLr+5PH6cGx19uXp5mhm5XWaA57A75AgHg0GQv6fFbnI79H5g2FrY7ImEfNFIiFfVEXdG4+EPX5Ygk46F4smIraU4lvUmrcm0-5Upk0kGs+kYtkI074jlQrmXOki4WE0US8UUtjkAC6SDAzM5cLFqql6plmpZ2pV2J1+r1yqFupNhrNxoF-Op1vZtr57ztjodjJdKJtzpJ7qdcAALJiff7eSSg9yrqG1S4IxqowGXdGtbHgwyEwbLKmjVoMxas3GQ3mUwWftmrfASx7XV6i0TI5aK963dXJYm6z6G1Xkzyw8204LS5WGe3B03pb37R3u6PM+Ph52azHW425z3p57Z5PTf2h13a336yPN-vl1OczOdwu922D+at9fF7l5Yqb0eN8+r8fD+-X-f17uz-OW0vJdvyAic-zXc9AP-FdTwggCxzgmDbw-N9gPAv071zFD00wjBy0DXCy0IjDsKwkC8OI7d4NXAdIIQ2jqNghikJfdCqJYr82Mo7jSOgk9kPIxD+NYi8+M-NDRKE8SwMk5jhM42T2PkiSoKk1CZNUuTpN-RSeMErT1J0zSlO05xHyVUCjPokzDLomibJ-OymIcyynIErjeLUxzGPc3TPIM7yOJU6y9I8-T8PjYiIvzfzosLWKosS-yXLE2yfJE4zQr8-SUq81z0oUzLkqyoqcpKkLisqsqqrC2rsrq0qGoq6qWqa+zyvamr6u6xqeuatrnI6s1zLSoKNP6vrOtaybBq63r5omhapoG3yltm6a1tWxbtuW2SAA5iIOuaAAYaKO-TzvQy6etOpjrs0+6dvWlaMqerbds216Prer7npm96-s+wqfuB76wcBkHgvBgGYd+2HQYh6G4eRhH4ahxGMbR8akdRlH0dREbAuU7HMbxkmsasnH8bJynSdx+nqYZ8mabclmCsZjnmZ9R6zsOvn-J574AD5nkF-sxYrCXuaGra5hwHs5gAUwVm4AE8VYhuZYFHOYAFcNZSdWdZuABnA2bBQY3NZuAB3c2nHlq2Ujwe3JAAF1d8a5hdp2bCIX2nGVgPgrmI3tTmAB7T3+H14PiH90z2a5znaYp1mmdTtmxszjP05TvPk8LnP86T4uHwVCzNkhouC7Luva4b0vG+z5vifrpuO5bzu29b8Pvu2gf+959p6Me0ehnHkfh50SeZ+nhhZ4X+faEH74AHpo7o1fZaH63vkgTeg7774zbj-gPbPrebgAJU3gBRTeAHJN4AS03gA7TftePnfvgvn+bBv0vgAB03qfABTgAD8m9oGX27onLuiCe7wNGsgpBCC0GYIwdg1BOCiZ4Pyug3BoBCaEKwcQ-BFCyEENSpQuh1CqG0IYfQphrC8psICswrhFEEpJFuikQASaTPATPwmwQi6j3VEdLPhNxAC5pM8W63JAA8pAoosKi6iKPWOoqomj0TaJcLopE+jLCSJuIADNJRb5CkZFGR3xxFVBETcexSYNrV3bkQlh7CvGcI4blHx3i-GBJllnchnj-HhKCXNNxvdGEBOCbnFBYTImuKpjXRJ3C4lRL1KQ3x8SS4eIyREvJaSCm5KyXTfJoTCnJJegRXh4UrFOOEY0uxzSBYtPFvzC6XSro9PgNYmKcgBn8GcThWxgi2kNPqbUypNDMkpIqSUqpZSFlp3SSsmZSy5lFPKWs0p8zNnuOWQc-6ITtk1NOQk-ZOzVlYhyScoGszYk3MOTEpJxSjnnI+W86p3zwxJSmYC9CjjWl1BBRMsFAKGrDMgjCgCcLJnAqhf0ppkLpmyTisWZFjytnPIuTiz5eK-nXPxdE9ZDyyUkuJccl5lynnvN2WcoljKrk0tJakwlDLXz3NpQSn5Gy6W4q5a88lvLKVsupV8ll9LfnSqFbK25rKpWKplQKvlor2WLM5QqkVVK5XarVeK5VuqJX6v5RSjl5qxWWo1ZK5lKr5WGptXqh1hKeWar2aa11VqPVMuFYKg1FqtU+rtf69VLqTXGoDSGs1trY0RujXG71SbI32tTWGo1abE0JvDV69NOrs15sLVG3NJbM0ZudUW0tWbq3utDYUwxMLAARpKo8ZNgW0aI6e21tQybgdp0V2pw-aXEYAAKw0QTOOpik6J35Cnf2Gd0652zqSPOisja+09owM2nNi0YUAFpmwIulDC1AR6bhAM1DCz+J6bgABNz2Axhf-bEMLHZXpuAnV9Nwj7fu+D7D93wH23pPo+1aMKD4gcNmBjKMLQFQZsABv9KQX3khhVgGDDtMOSEvchmwN7AMpG-nhwqMKkNoY+jCgAVth4gsdCM2AALa0f4PBhjpHbYsfABvBDHH-1cfhabLj76SOSCjrxyQX6KN-wE1xmjEm6NceYwp1jsmVPgAABRcYfupgAQmp9jkgABi2muMAEpd2VpwXWttfHwM0Q3d8YdlhHMpGc1oVz3a0W9qXbZmxPmF2Dv89uldAWKzgvC0FwZIXfNhZ9J5odBnRMaWPYZlLlGMtPpuKhxEMLxNpaMuhrjUncs-q4+R0rMn1O-uk-Z-j6mCPJcK2VhrXHgMFfAAAGy4zVyrKRwFNfAAN2rsGbjdfU-lwbk2RtODY4NlNxaa3loLdWitwaFurZW8tp163LO7ardtoNnqqA2eTdchLkh3Mxbi5dxF8A111LkA94L6JAABpHduAz3ov3dC2O37P3Yt-cB29j7X34pPf+59qzNbUtLeh2t47cP9tlvh1t1HO3EcI79Wj5HSPMc4-xxj7HROlV4+J0d8n1rcdY9JzT1VFPacE8p760np380cIu8QK7RFV2Q7B1i3nwOodC-5-8wXgXxeRcl49oHEuIci754r6nfXRvfEPepwT3xxsdemyrpwuu+gwoANZJZm5IM9E3ium715IAAOuALjABhLjAB5a3hubgAEEuN7S4-b93xRn1cYN4HzLKQLcddw2b4gjXo-8Ha-Nrj2uptcYw+pirHutcB+qDCgAklxgACtn5oZG2tl-UyVzPdWUhzbj+ASvofvi9arzYCPg2o82+IAAD2L1F-gWn1MIC4wATi4wAJi4wAOi40P9TAA2H35ne9+cdWpNni2wmc-4Nzki8u5ey6l3vw-B+ZcA-3+iAAPKDpX5-he39F9fhXT-CcM-p1Tl-7-mf1pJ2-lnv-v+v6r6f6M4-5AF-5gEAHAH-7xoHbo6AGBpQEQEwEo7K6gEIHgHoGQEYFmQVyJ4a7Z5b7gA76EE74Ran5wCw5jI3bfYUGQ6UFkQxa370E8LUHg6MHH4opC7MGcGsFEHL68Ga4pDq4daCE2DJ514h4543CSEl43Am7qYd4t5OCx6d78DEZ16iFOBt4SFW74Hqa+j8HsFOCQYdZhyDY5ZKGSDN6N7V42D0aDYqGWHECKE2E2A956EdYWGuFOAuFSHfDKYdbWF+H9ZcZeHBGIZKZca16qFDaGGcEpC+GyHfCOHeEqRvo9ZcbuEiFcaJF97gApHhF2at45FJ4ZEeEp4V5xG0HfDRFOH8DyGeF7aI7r6bYc55HEHtFbrxFeYOLLpC5zDvadqdiAAhpF0UiKMUMdyBMQOiMR9gMY-vfg5p0ZMUYbdrAagfATGmdusR-tgRtodogZgcgWTiAZsfsXAYcVsezmcU0V-scXTkgdsSgbsVga8fcUzqcZcecbji0QcX4iQWMTuisd0YlsCdUW5gsRwXflCQ-t5ifi9tCeQbCTMbwR0SvtvoCZumCUCc8XcU8ScdAfiQ8UcUSR8YSdcV8bcZ8XsVSeSRvmSY8RSTSTsXiUyW8aSWgVcfSZyd8S8e8TyUQr8RccybidSeyWyfyTcSyWKZKZSdKXSa0VKaKQqX8eKdyUqQSYyeqXKcqVqYqTqZqSSRKRyRqcSVyfqSKYaeaaqbKZaZQkKRsQaWabyaydqXaQyUaW6WqRad6TaSaU6R6dacKb6cGbaSGY6e6QKfKXqX6caXGV6WGYmf6ZGaaYGS6TKcmeGQTLgc6edssSiasVzpiU5sWRCdiViQWSCWsZWeCT0QYvmX4M0MiY2X0VuE2fZO2UxACeWSWT2WWTWTiVaemSqaGZmUmfGT6eOQmWOTORObGdOXOaOYuRGVma6ZObOQuZueucuXyRuduYtg6buehN2QORWfWeiXwX2XWS5g2cEJ2W2a2fWPeU+Y+W2M+W+a+W6O+V+Z+SSCeeeaiaWdeWmbSTGUuVufOfuVBZBTBeBdBXBbBSuVOfBUhXuYhUeRBQhVhahTuWuehXhdhc0TmSBTSv+TeReWiYBVeaCU0N+V6HRYONuIADCkoI24gACKSsW-mMVcXIgMW8VFgsUzDsWcXS4uhkUea3krYHpVEwre7lF17DYxG5EXkBGDa1GpHEDiExFBFJG2FOBhG6V+wlHqZp4dYNF4GNGW7yUxHaFKVcYFGGVOAJ4aGp66GmGhHB5cbqExEN6FGSAZ4aWqbqYiZ15mEuWVFWUdb2F14GV5HKW8EOV5E6V5GKV1HEDRmekoUYVZUEU4UxgtHcF+XpZdl5FXCEFlWlUiUCFVWFncUXlAiOU-n1U1VVn0WVVCXtW0WdUtnNUdW9VdX9UAW1Wwph6q56WSBaVpUyF5HTUXnmXhUda2VTVuUWWDYAAaruXGt81laV8Vw1iVF5qVgV4AsVF5vljVimJlHlChnlrW6mR1RV-A0+O1x1G16mbu6m212RN191MlNwAVj1I13w51eRANF158wmZRHWINg1uZGVQZeVOVGZuFrOxFaVmhaRSxsNEl2N12w1DV3Vd5hNMRGNxV41ZNY1L5uNK8xNS81NiA4NPw5Vf1WWrNKQ0VMRB1vBplFRHWqlde-NMRs1CVLNKQwtw16lgNyVZ15W11ket1HWXN+NctvNq1ClUNg20t1VkVg2HNaVp1vBD1jNe1rV8eGtC1g2PNdeMNvBYVMRktjNBtw14tmFiN+FyNrt2V7tI5PxaNqZbRFFQFNFPVR+H5olbV4dVk28r00dwM1kjNBNkd-FSdidodYlkleNptl5upmV3tYFbthFuVXthdHtSNPtxdBdldFd1dRdtdpdedudJd5dddzd9dTd+dNdqNT4cN2y4lGApizkfFqd8JEdadXsWNUxYxcw0xQ16IM9zI8dPFw9Z+VNY9DIfdPBw1lFW9oFjdVdLdHdB9e9ndrdp9h9bd+9F9J959Z9x9R9CN19d9V999w5N9b9T9t9D9TKh5L9Qd1ZLgA9nS9NCAQ9LViJTVa9ydkDy94Do9I9dV0DYDzZRNKdli9NgDkstNm9WdO+KZAZUZOdX9z9xDn9r9H979RDpDu9lDFDZDND5DDD9DTDdDLD1DrD8N7DhDnDxCP9JDf5Gd8AGD0i2tVQQjLoYjJIEjDIUjPwMjVwcjaDIjADWDcACjEiKjajojGjKjeDujq5fDjD3DPdQ5bDpjHDZjXDFjJj5jNjljtj1jdjjjDjzjxjrjJFTjbjBDJCft+D-tfjvjATejyFDdzDVjnj-jQTaF7dhjYT7jLjcT4TgT+jVD9jiTkTKNKTHjCT2TXjaTyTtDsTqUvDmTzyG91RVFp5vZlT-Zs9tZwd5FFTtTg5DTO91F-9LTODf9RZbT3TWTuTOTET+TMTqTAzSTwT0ToTIz-T0zgz4zl9JTeTczj9kzfTszUT8zBTUza+Pj6T2pZT+zAj5TrTWjqD6jpzJziDZzlz1TwFmddT7TONjTHT9zvT8TMzYz6zyzRjozuzZdmzqzHzGT-zbzazQLwzALvzIT3z7zkLEz0LoLnt39OzQzVqBzgdPTGJVz8DsjS9ij2L8juLWLK9wj+LXTmLNz9TjzxzILvKRW6mDtOjeRPGHWJh7e9lXGzLg2RteRIVJNHLXGrLdeJtLz-AStWdnLdeYrIr4ALt0rk1x1srMK3lu17LWzgLiLBjKzNLsLGz4L2rKL8L6rfzeriz+JxTwLm+hzZT90yDWgNry8sD0jhLFzpLRLjrkER0QD1zTTZ5zzzTPzBrhTCLxrWrprYLobAbSzv9arOrXzQbRrUL8bsb0bELgbMbabqbUbqw5rJrDaVrhz9rgMnrmD5zyjpbJizrZb3rFb5bdrlbNb1bVLnT6bWbCzkbnzKb+rrbFr7b4bhrybmr-bGbXbHbg7Sbw7YbGrbbMLE7cTObEbAdTzTb0rO+hbXrrrLrxL4jfS7rBLtb-d9bdb+7gjh7dz-rM73bubF7o707wbibLbN7Pb17fb47l7C7d7cLr7j7V7H7ur77Cbn79j87Q7-kaLS7B7x7qjO7i8c9eL+0p7J7kHa7JbjbZ7vrvbU7T7v7cbD7L7uHmHP7AHf7IH37-7A7t7RHOHmbpHJHeH1HdHI7kYwHX7x5+b6Lm7u7cHnHbrtrfQxb8WRY89y709U9NwQnaHVTPrknfr6Hz7BHZHs7cnIbtH8nKnynLHqnGn6n+H2n9HmnOn97enunjH+nRnmazHBnE91LMn0ny757iHqHDnG7VbznDbrnR7jnUHkHYH1ndnsn2Hnbk7xnQXhnJnwXGH4XSnoXIXgHZnsXYX0XEXiXUX8XMXxHWn5nyLb7oqPnzbFLDzEnNTNnRXfntnhXtz2DK7ZL2dUnJX5XlL9XBXAXY7ln6XrXVHCXqXSXXXKXbXcXfXnXA3aXHXw3gX3XQ343I3k3SL3d03LX-XU3vXi3zXFH5HWHlHY3S3m3K363a3hHe3Cn2XGXPX-jU6cgc+NEZ3GAF3TEV38AN3-Yd3cAD3FYT3L3Pob3l3RYoyWgn3t3+Q73Lof3-YAA7Co2D-TcD69wD190kIDySFDx99988E93MD914xZwt9txt-N4N8tzj6t4pzt-t0TwT7t6Twd2p8l8T4dzR8d46Yj26GPjo8z8A6z0o8EOz8rTMFz1nUCLz9K-zyz8L2zyLxz1oBD+LwwAL4VQgDL-ZPL-952OjwDud-F5j3j9j5T-T-j9r+11rxT4b0kEGCkAAJrNgm82ByWaiW9OAAAyFvNwDv0otvKkrvxAOmNvNwAAao798J79iO7-wF9YHx9EH+AAABJ+8pAB-kjh-W+h-fAh9x83AAAi0fGU4fH1Xv3wJmLvYfNwAA6hn04Pnvn0nyX5ILH4iOHwAMqV-EBR-l8pAJ8p8V-N82AADSDf-AsCOfKQffathSjPCPMPSvav4-13sPE-W4ivs-Yv3PTQc-9Yy-bYq-TPC-fPzwkvi-LgI-DI+-PwqPqKVQh-3DGvo3uPl-hPR3+vV-c3N-dPd-j-DH1-5Pt--fmfBfgM4fAEv-PfkEf-h33v5bcQBp3Mfo9wgHQ84e0-KfpP3u4K9N+gvUEOvy9CoDBw6A5EJgKF6i96aO-LfnUDP4o9kehAkgafygG48L+D-d-k-yx5gCyeJPD-pr3oF686BL-UzswPYGRcaeVPE7gwNp7oRj+oKcgTAPgHPdYBCAsQfD3Xr5AgBNZOQbUwUHPMlBy7FQXczUGVcNBRzHnKDxUZEDSByvYgaIMgHGDO2VA0AVwOp78DeBE3CwTQNf7UDGBtAzgfYI4Fv8nBDguwR4LcGOCj+ZAvfv4MsBCCIUIg7kCr2Fwz910RYSQoYi0GxCrO6IGIbIISEkR+w8QkqsbwkHiCxBaPIwWELyHrBwh+gpxuYJ4E68DeTA9wQIJ8FeDqh3A6weUJYFG9nBVQmwbr2aGeCyhNKfAe63CE9D+cfQnikUMCG-cRh6glIXEOSEZC5AkwzIdMJ4RpCphiwuYcsJmFZDpBfg0wUj0MEGD8hQHLLi0N8FtCKhhw2occKaGVCjhjQywXwNYEuDvB9Qu4a0OuGuD9S-Qk-i4HeHCDPhQw7fr8LqBfCQhigiYSCPmE6CohKwiEWsLBGpCoRCwuEeCO2GRCkRcAkwXsNCGFCrGpQhoc-1eFWCnhVw3EQ8PxEdCahXQtgXiNuGkjHh1IkkZcPeaAixEfwpOoMJZHMjIGrIjkaJ2+CAAHUm5EpBAAAKT8ibAQosEnMEAD2pGMVmHQjVh8IgTpCJRHohhhOwjEUqIKFqjdhmI-YbNzOEvDiRVI+keSPuF1C6Rpwo0c8KJEmiDRZonERSP1G2DzRhSRkU4E5HYtXRW7YgO6N6Hsi3RPoj0SMilGgjZRiI9OgqNDEyiERsItsE9y0HOjJAXogYX6O9GaiNRqopEOEMtLYiCRuoy0ecJuEOjbRxovMZSILHZjHRSncPs9U-5OAqxifFIM5Rr7-UABgtPoOHylZaDmg4fYVh2KWE2AGWYY4gHbGAGSB2xNwWsW3xSDjjCRdon4HGM9FJjExAI-4VUDnEBilxbI9cVyM3G+iZgMY+yHuOcgHitwR4+sCeOjG9jCoPYgcQyFXHgAExHwywLeIzF2osxtI60Z0MLEWiZxxY+0e0MNGfjpxRYvUVaNLFvjQJ-4sseEifELiHxEvZcXWK-4-8Po-HSQIABjSAAX-2-6rQrxEYy8chJuCABY0gwnETtx-ou8TBO+HGNXxEEsCX+JtGQSGJtEk4R+MYk0S2J9EpiRcI4nsSWJnEt-NBNInJjqxbvLCYhPXbogiJw4jSDhLlEiSkJd0IsIACzSEicJOkmiSfQAkkoQcN4k8SyRAEnMd+OAk-iQJdEnSdxPMlmTLJek1iRZOsl8SSQmkhCUUWcmY02aYkjKChOIDKSXqgNTCQpM7DeTVJRkGSSGLUnyTdBG4rSTqPLExT9JsUmyVZJpG6SkptklKYlNNHpT3xdk5KRlOyk2jHJE49yXhLcnFTyazWfydyEABhpFxzmDVS3WtU0WkVLknYT1JLoAqXO1wKygTs3UkhD1K6m9SBp-UoaX1JGmDTRpw0saZNImnTTxps0qaXNJmnzSlpi0laQtLWnLSTscoOUEAA"
));

export default createNewAscii;
