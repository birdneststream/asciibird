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
  "NrDeCICMHNwLgIwBYA04Bms6vAYwBYCGATvOIImk4AvihDPMmpvDgSWZTXVoxlq0VJwK1WlB45m2NGyEiu4hpP4zBHUdyVMVeNcM5j6iZS1Xt9Gxce2nd5+YYk3pduQc3W+t2eoVHeUgL27lYBOj4Wfk5eLhEOHmHeevGhJrHJIf5pQW6WWc45vo5aMYWRxZ6BZrlRJVWuRQnZ1Y2pBS3lTe0NnW2lHSn5-T2D0fVxmWPhGXlTScGzddMLtZXLNRWJ6SubzSOTS-MbXcMTi2tHrUPjM6tbZaOH28d9Nzsnby-X61dzz79PB4HC7-XrfS5gv5A873AbA2H7GF7M53ZG3WhUAC6KDArx+kIYAFZnMTEXdSVJSSjNhSsFT0QlafB6e9Qky4Cyvjx2ZyAYgeXCYQKyTSSYLyd04gBJIWS5IAJVlp2SAGElZ8yAACdX48BqiXK+wACR1EPAAEFTaDwAAVK0PbUGjXCfWiw1yADy9oGAFVvSNFU7dXag2bHW7nRb-XFAxHdbHGXL7ABRaPJADKafsIbjYazcgA6vmyJbQ9aE2yk3IK-52Q9S7nrQA5YvCHOJmK8gn8sUijuU8WNruPHudwf9unjytjvvTgez2u96kT5lT8HW9xYnEfXXw4XLueThfc5wAZgGACorQgBuGV4gBkWyzeRg37y+4i3nwN24eGANU2-EYABFr1vK1zxGK8gLiO8-wfEYn0bD9kjfeCUPsL9kJ-MCRkA7CQNw2CIMvIjkjgxcYgwwsyPsNDKKkaiyCw98cJg5J8NYwiy0g4ieNI9j7Aok8qMfWi5HokTGIGFj0LYgi4k4uTuMbXjyJIqDxK1LThCQri4kkolnCY4RZIYnh5P0jidPAUCy2HPclwZPEzU3bFcXXaF7LXKSjwPcz4AABnAstgpGYSjJiMK+MbaL1NCkLYsS+84qEq1UrkCLRykDLtIS8L0uS+DcuELKEHZErwDKiqioCuBKuq5wGsKgr8pilLat8oLOsinKeuyrBmra+Kkta0b2uK-ryqaqaarGjr5smxa6qG8aRoWiaVtmmblq6+rtqig6+t23rBqOs6ToG7rLumw6brmza9tW+8HKtV7USrRotw8qEfNO1dj3+jk-qu-b7p2x6geepbIdB6GtvBu7Ydu47kYe9aYYxhG0eMgYTUEiSbIANRspS6pMqqbIATRsr0CbIP16dKmzMyZ8Ayb2imOaBimzM587-xGX9ybxmyZTZ1m1rS4bpalzKWpxpGsaegWwcV1Hlah1X4ZVxGNdljbNbh7XVfeocQYRZdvp3Vy3ot-dnOxo2UYu9XXed9GDcxr2nZ93W3eugO1Y9iGQ6Vv2tb192I+NqPA7D-X5bZ10rONGzDNBinhf5oXSZsmsc7iAB+BWE+jpO5byyvmZlivDZjl344bz26+91vffb-2y6bzvI6DnW++74Pm9Dkfw972P+9N+2nNZTzx2tlyNztwHQbN+uJ8b4fN5bquN73tuD47o+u7HxOT8Hs-y4vyeh4H2+r57m+t-vreHgAclbcAABMv8IL-SBlgeAAay-gAWz-l-WAQCBgAFMv6f1rs-XeNdq6UyQag-emDD7YOPrg0+O9R6EPHsgohpCSH4MvsQ8+lCH7UOvrQl+Js47b3IfOfye115Ly8hidyNtl7eVXlvLheD0FoMahQsRWCpE4JkaIiRNC5EELYQwpRVCVFP0YSgtRdCNGsK0WQgxkiFGqJMZonRTCWGv20WY-RFibGl0fnY2x1jDH2LcS45hU8rFeLvr4pxrjjGOPoeYzxPjwneMiUPERnCLZoneIveeQiHZz1ickjxwS9GBMUWEqJAT-EhOcZkoxOTzhhSkAAdn6uUrAVTLo1PgHU2GDS4BNKNi0tpMcOnVOcJ0ie3T6m9J6TEPpN8BnNKGYMkZwzKkzNqXMxpCzWlLNGbQ8ZfiIkbLyYU7JpjinuKCRgg5pSjm5K2ecpxMSgZXJBDw0AiTfrpJnBw65M9DniP2Wc-JmzvnbKyQU-5UzZmXXZAANn6mCiFzhwUguhVCmIMLYaQthaJEYgAk0nOMipFcKUVSERUbOpJyKiEr2asLFRtyUx0pRPalN92QUwxasdZvyLk7IBSU0lHzTmfJ5dyvlXKBXSNsTc4RcTPqdAeYCN57DHZpJebojloTeWCtkV8tlPz1V-MVUUplkzsUIqmgAJgyXcY17yEhmqJRak1mxLWcutea0IdqlWmptQ6q1Tq3WesdUYElLrbVev8M6nVAafVHmkuisperWWAq1cc+1qrlVCqTYm-lya02ppVXVEVKSuRSr7JK250q-KyteU8j18iU2VozdWrNyjtW7P9emiozKaU4v1Xi+FnbcVYHxVS9tztg2vyHUawNPAR03QncjKdg6x0MBnTHP1IaPC0toaunR9KBiMpbdGlle7NUxobey+NTbM3NvPWey9taL3ZuLQDeVlsGSFsfakstD7c18ksXGtVsbD0nuXVe+t-7G0AevVYVtdKB39oNT2+Afa20wY7b20dYb51zsQAuzemHn7YcYbhix+GyqEfOEu++66sqbsjWS3GVGd3TI1b+-djGD1MaPQxtj36q1AZ-Rx6Jd7gZCPiccZ9QnP0fu7KK8tCawMye41x9RvHWPAePTxnREG100biNuldUGEPdqQ3BrtyGgW6iyi0h0Ub3RjPFWpmzZm7OWcjPZqztDSNGcM7BhCWnMW6es-RzjNa5OBYU8p9joWAt1pC6p6L8m178ZFaJiVfDuHxdS1J09smouxa-X+mLwWFXhdy45+ZnmGU+dRd56jFXkjaasJRyrFRyPFcFnEAA9s160zmnMdYpu13VLnbMDa66ZjrFmqv6YpZpmr5WI0NZ09V+wtWjDqcK0pvLkWCvrZvUFjbOW1vZYcflyT77Z55qLQW5LSSTvPNLXF9LoGdvbay0dw7u3XtPc27FlbWUl3DiWyVmVi2SOnbIP9gGs3pvjYsrRjw5mlljbo91-rSPEcjeR2j1HeZ0dY8x51mbxmDNwHg5Bhbcgwdg2BRFj7e2WO0+Y-TxTdPGcM9W0z1neic0g4k4l+IImbOORu6+u712K2PcA89t76Gacs62+Lz72PlmXV+1u4Hguyeq8B+r1YyuYdWB13N8DDmFcI9h0b3HJvDdDdG-Dm3JmcfzYm9Bx3enocG+W7utnsvMvy8l6hn31P3ty+l8zkP7PtWc7V5+nnbltwpfuxHzXYmpeB+98HsP6evdi9TynrPF1KcEq5+Acn+vIfEsL8X8vGuS1A4VxTQADqQ9YGIAAFJG8jBb7XgYgB7Umt3bvHxvbeE7K1DlrpeHeu9H3VqbNfcerIzwd5PC+-dp8zxLgPi-Rer6Dznt9t3ju7+jxoPnA2BeJ4k+Jkcy-59L+3-7rf6-pO5839777Vf70T99ZX7Xn+y+R+EBX3-Rer+AmbueeGOpuVu-eveFu7uEB5uqs0BAO1eWuP+p+gBX+AB5O9W7+oBiyYWK+t+2e9+GWj+BBJBl+L2RBD2T+cqu+5+8IB+XAR+kYJ+SBSeABLBxB1BXBpB3B5BvuG+PBghfB4B+ei63+HgJe0+Eh4heuMhH+GBQBf2ihKuMCLCCBQM6hoMmhb88BU0ZuCQ+hshCh6BqB5OL+FB1+lBIG1hKmV+Ahwhd+lhTh9hdBK8D6DBvCseV2tBheHBwBPhzhD+vBN+DhhBgRnBQhIRN+5hKBrBf+yhuu8hphMIhh-gqR0OKOBhMQAAHAMIADGkKRsBWRmRoQ6RgsJRaRRRpRVRlRUguRIwgAsaSFEVEZFgFGHJEK6z74GhFkFRFWG2EWEuH9F4F2FBHC4BGoH0H86H6XaPIi5xEX6uGDFjE9HBHDFU6OFDHhFUEU4lYTL+btIe5+aiH9JHFrJnGDYnHHF7GHEHFdIXHDa4H7FXHnF3GnFvHXFPG3EvGXE3H3EfGvE-HdF9HbE2EjHLERGrGRHrFFYQn+FC574IkeH3KzH5rzFv4IlLH8ErEglbGRh6TwT1hfx8waGWSEkARfx2QKRDwUwABitM+cNktiFM4s1J9gBcPMAwKcykQcFM3JIsAYYsNkAAsnnBLEyUKWzCSZnKrFnDZPjGyXINzDKSwnSZKYqWQBySqXEJLKnHINnGsaCQMdiZCViS9GKsfjMV4XMRMQsX4QnjiTCftnCWCRsWERDk4hTMybKcaWvtsRTFSXqWQMqVvBTAAOKMlswhlYEpijGmlOme5xk7FQkpm4mOlGngkmnJlpnxkZlum9G+FuH77TGMGonnbonwlnaIlVk5nZkJky5JmumwlZlNnOkanCC4A2SALtngAACWNkECbM8CbMAAzhKWzP2WzAAHY2SdlswAA2NkAArjZL-EOY2b6ZsemXidububmTufuXuXWXmc2X6ZMUWUiSWZ4T9GibaRiTWYWS6Zue6UeSBhTNBD2d6SMOgDZJOT2d2UGcIGOWzAAC7jk9lrk9nDk9nQL-k2TQWAXgAIU8k0kDDAU9kzkTk2RgVsxzk9n4C-k2SYUwXgWIUfmIVflxA-lsz-xsygLrlsyUWoWZlnmvnTzx4WnMFWk3nll3mVlsHnlPksVbmHmiXHkHniVsXCUvliWtmFIUwEU0Wzk2T0U9l-mIXEWIWwWsWyXPkFknltk6WSW6XSX6USVyUNlCX5k76YmPm7BXkonWm3m2XsEXkPmk5kCsmIX0mMUszqmIURlswKmIUGnanWRsyBkoWelkkCnShimfl+VsyhWhkDBakpUjBeVRVyDSnpVxCBUJVswZy5UKgMlsyMw9k5UxlyCRWxXMVxD8mFzJAAAy6cNkBJtV0VIwPlPZdMPZaVVVeiFMupWVJYNk3ViF0ZU++p1MblAldpSIDlTBu4s1Z+dl5pHFG1FZDp95c1O1q1rlgiW1aWR1m1fF21-F+1gl5sp1LlV161J1D1Z1x1T1N17ld18E51n1z1t181h1L1j1P1e1ixa1H131b1v111AN4NQN9pYNu1F1wNB19llppZTlvFl5KNyNXFH0mN-Cdyce7hDlBNxZuNxNGN2NWNy1ONFNeNnFVNlNts1N9NtNgmRN3h5NzNZNVZyJXNUebNNpHNjNDNAiwt+N7N3N-NzlEtpN4tfNMtAt0tNNvN3Okt6NitnNstKt8tUtctStmtF+PN+tUx2tatX0fCjBGIlt9yVtFt1tdtttDtNtTt9tztjtLt7tbtntrt3tHtPtpZmIQAA"
));

export default createNewAscii;
