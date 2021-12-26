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
  const mIrcColourRegex = new RegExp(/\u0003(\d{0,2})?[,]?(\d{0,2})?/, 'gu');

  // The current state of the Colours
  let curBlock = {
    ...emptyBlock,
  };

  contents = contents
    .split('\u0003\u0003')
    .join('\u0003')
    .split('\u000F').join('')
    .split('\u0003\n')
    .join('\n')
    .split('\u0002\u0003')
    .join('\u0003');

  let asciiLines = contents.split("\n");

  const finalAscii = {
    title: filename,
    layers: [{
      label: filename,
      visible: true,
      data: create2DArray(contents.split('\n').length),
      width: asciiLines[0].replace(mIrcColourRegex, '').length,
      height: contents.split('\n').length,
    }],
    history: [],
    historyIndex: 0,
    imageOverlay: {
      url: null,
      opacity: 95,
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

  // Determine if we have a plain text ascii
  const colourCodeRegex = new RegExp(/\u0003/, 'g');
  let isPlainText = !colourCodeRegex.test(contents);

  // https://modern.ircdocs.horse/formatting.html#color
  // In the following list, <CODE> represents the color formatting character (0x03), <COLOR> represents one or two ASCII digits (either 0-9 or 00-99).

  // The use of this code can take on the following forms:

  //     <CODE> - Reset foreground and background colors.
  //     <CODE>, - Reset foreground and background colors and display the , character as text.
  //     <CODE><COLOR> - Set the foreground color.
  //     <CODE><COLOR>, - Set the foreground color and display the , character as text.
  //     <CODE><COLOR>,<COLOR> - Set the foreground and background color.

  // The foreground color is the first <COLOR>, and the background color is the second <COLOR> (if sent).
  for (let y in asciiLines) {
    let line = asciiLines[y];
    let cleanLines = line.replace(mIrcColourRegex, '').split("");

    let parsedLine = [...line.matchAll(mIrcColourRegex)];
    let colourData = [];

    curBlock = {
      ...emptyBlock,
    };

    let newData = [];

    if (!isPlainText) {
      for (let x in parsedLine) {
        let codeData = parsedLine[x];
        let colourArray = codeData[0].split("\u0003").join("").split(",");

        if (colourArray.length === 2) {
          if (colourArray[0] > -1) {
            curBlock.fg = Number.parseInt(colourArray[0]);
          }

          if (colourArray[1] > -1) {
            curBlock.bg = Number.parseInt(colourArray[1]);
          }
        } else if (colourArray.length === 1) {
          if (colourArray[0] == "") {
            delete curBlock['bg'];
            delete curBlock['fg'];
            delete curBlock['char'];
          }

          if (colourArray[0] > 0) {
            curBlock.fg = Number.parseInt(colourArray[0]);
            delete curBlock['bg'];
          }
        } 
      
        colourData.push({
          code: codeData,
          b: {
            ...curBlock
          }
        });
      }

      // Readjust the indexes
      let indexAdjustment = 0;

      for (let index in colourData) {
        if (index === 0) {
          continue;
        }

        colourData[index].code.index = colourData[index].code.index - indexAdjustment;
        indexAdjustment = indexAdjustment + colourData[index].code[0].length;
        newData[colourData[index].code.index] = colourData[index].b;
      }

    }


    // Construct the ascii blocks
    for (let i in cleanLines) {
      let char = cleanLines[i];

      // If there is a colour change present at this index
      // we will keep track of it
      if (!isPlainText && newData[i]) {
        if (newData[i].bg !== undefined) {
          curBlock.bg = newData[i].bg;
        }

        if (newData[i].fg !== undefined) {
          curBlock.fg = newData[i].fg;
        }

        if (newData[i].fg === undefined && newData[i].bg === undefined) {
          curBlock = {
            ...emptyBlock
          };
        }

      }

      curBlock.char = char;

      finalAscii.layers[0].data[y][i] = {
        ...curBlock
      };
    }

  }
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
};

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
      width: forms.createAscii.width,
      height: forms.createAscii.height,
    }],
    imageOverlay: {
      url: null,
      opacity: 95,
      position: 'centered',
      size: 100,
      repeatx: true,
      repeaty: true,
      visible: false,
      stretched: false,
    },
    selectedLayer: 0,
  };

  // Push all the default ASCII blocks
  for (let x = 0; x < newAscii.layers[0].width; x++) {
    for (let y = 0; y < newAscii.layers[0].height; y++) {
      newAscii.layers[0].data[y].push({
        ...emptyBlock,
      });
    }
  }

  newAscii.layers = LZString.compressToUTF16(JSON.stringify(newAscii.layers));

  store.commit('newAsciibirdMeta', newAscii);
  store.commit('closeModal', 'new-ascii');

  return true;
};

// Converts ASCIIBIRD blocks to mIRC colours
export const exportMirc = (blocks = null) => {
  const {
    currentAscii
  } = store.getters;

  const {
    currentAsciiLayersWidthHeight
  } = store.getters;

  if (blocks === null) {
    blocks = mergeLayers();
  }

  const output = [];
  let curBlock = false;
  let pushString = '';

  let prevBlock = {
    bg: -1,
    fg: -1
  };

  for (let y = 0; y <= currentAsciiLayersWidthHeight.height - 1; y++) {

    for (let x = 0; x <= currentAsciiLayersWidthHeight.width - 1; x++) {
      curBlock = {
        ...blocks[y][x]
      };

      // If we have a difference between our previous block
      // we'll put a colour codes and continue as normal
      if (curBlock.bg !== prevBlock.bg || curBlock.fg !== prevBlock.fg) {
        curBlock = {
          ...blocks[y][x]
        };
        const zeroPad = (num, places) => String(num).padStart(places, '0');

        if (curBlock.fg === undefined && curBlock.bg === undefined) {
          output.push('\u0003');
        } else {

          if (curBlock.bg === undefined && curBlock.fg !== undefined) {
            pushString = `\u0003${zeroPad(curBlock.fg, 2)}`;
          }

          if (curBlock.bg !== undefined && curBlock.fg !== undefined) {
            // Asciiblaster export will check if the next char is a number and add 0 padding
            // to the ,bg value, if we get that we can save some bytes on the bg char.
            // if (blocks[y][x + 1].char && Number.parseInt(blocks[y][x + 1].char)) {
            pushString = `\u0003${curBlock.fg},${zeroPad(curBlock.bg, 2)}`;
            // } else {
            //   pushString = `\u0003${curBlock.fg},${curBlock.bg}`;
            // }
          }

          if (curBlock.bg !== undefined && curBlock.fg === undefined) {
            pushString = `\u0003,${zeroPad(curBlock.bg, 2)}`;
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
    if (blocks[y] && y < blocks[y].length - 1) {
      output.push('\n');
    }
  }

  // Download to a txt file
  // Check if txt already exists and append it
  const filename = currentAscii.title.slice(currentAscii.title.length - 3) === 'txt' ?
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

  return layers
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

          if (curBlock.char === undefined) {
            curBlock.char = store.getters.currentAsciiLayers[z].data[y][x].char;
          }

          if (curBlock.fg === undefined) {
            curBlock.fg = store.getters.currentAsciiLayers[z].data[y][x].fg;
          }

          if (curBlock.bg === undefined) {
            curBlock.bg = store.getters.currentAsciiLayers[z].data[y][x].bg;
          }

          continue;
        }

        break;
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
  "NrDeCIGMAsEMCdwC5wAJwBpwDMDmyBGAJiwCN8liBfDCGBZNTHC4s1omuuRFdLPIRLhyQrlB6N+LIezG0JDPs0GVhotePq8mAjnM0LtUlfpEctk5Xtnn53JbplqD1I1aeq2dww53SvdQt3RwCzDTc-ExsXH0jFf1NbCM4QxJjvFMtQpNistOjnTOCo6yKg+wTCwNdU0s9wkqqymri65obkpuMWxsqezrzujzCu-pHc4vGcjIrfDtGh6fTy2uyV1vz6xan5gZ25+P3Jw-bj2bWC3rG9iYu29eq+25nVh6vB3aO7t62Fk8u2wB7yB9z+51+w1emyhG2e32h8LOPxhyyeNwRcIxyMR2Me1yWLyxhMx6JJOOJXwpZKp+M+pzpB0B-zBsJpDI+TJBLMhaIJtM5wPBKKRjKFbP5HNBvKJ7OZENUAA4DIqxTFlT5VYL1Sq1c4NRotdKlbrtfrTcaKAarXqTZrbVaLTy7YaHchre6uFQALoYMDO0Vm1GylD4GIABnlHgA9rlI9yBrGI1HHAATOMp4nx4WObAZhMx-M5nSIZMF3FIbMS8AANyL1YAlvW+eAAC7NkPgJtl4uMAC2HdJKFgg+pKAAdqO3ZXM4wACJToMUKstvM96ul5wrztJrezlAD9ctxbbofgADOi-qAFcrx1J0fOyf9+AAKZ3gYADw-HgADj-HF3VRTzHC8AJ0W9HzPTdgJfd8oNArle0lF8kOrAhJgAVlcTDp23cM8IMAil2QfDCJ8YjLVIojpwFKjyVoqUOgwjJsLiXCSKQD0uOnbijQDd0nQVR17U4vjyI0SiBJnCiJOXOTSIUyslKk4S8U4ujpM0tSGI0pidO0kV1PowyK3EsShKMrjLLMmziXM+iHOkpydJcqy3Ns0TQB9P0TP0qzTMpfyK0CuVyyC1DxWPKKnxis80Oi1lEpleK4sQtLGMipLYuy1LcvS-LMvCsLkPpLKUoKiqitKhKcqqvTyuDPL6r8xrA1a4qUM6srutq5qmsqga6RYoo2IiDj6LIzipsmmjprm2bZPmpbFsklT1uWtbNvk7bFN25T9tUqyZukk6dLO46FtOq7zpuy6VucuyyQ8rM7pC4KIt6jKGq+wqfpq76OoBnUvMe0HXKegkXueyHBmhqHYcWeG4YtHz-QMj6SurPrBvarTMa64GWvxtrjJJ37iYx0mZK21adrpvaGYOpmjve6nQsJ7HAfJomhv+rm-qB6sAHdwMYIDlxfB89269MELpeCZdKmDJe6tclerSCNZbAAbMXOeSvn6hGrwxtYCbroe26rfu2nLbt62Hdt+n7Zdx23edxnXa992fc95nvYD32g-91nXptisLsjt77MR3JkaRuOQddQ6NpZtOeYFymAoJnrebxqmKaNzPDZElPHKT81wfcyuXRtCzq888uwfLtGhdLsnC-zzuPBN82cIz4Ow7JKPw6d6OI7Hj2J-Hqe-Zn6e55Dhf56X4eCVHkeY63yed9nvfF4P1esY73T27q4uu+rABVfXwAAaTvnHqqzy+c-Z3Pn4+PvCDN3-B9DgAley815ANAanCB6dIGB3XoMTeG9t4IN3kg-eKDD5oOPhgkBNI-6UAtkPWiuCCD4MARpIhJDgGwOfMguBiC86vzLvXCujdPrdzPiXC+Bd35Fy4WzHhgkWEw0EQjYRKNRGJ3EfHVGvp0bcLYRzehLYf54IHtAghajSFQK0TAsBR9sFYKoR2Qxj5jHa30bQmh1DUEWOsVY9BNj7F2MwQ45xX9z79V4ToUW8sPiK1gt1EcPj6jtiCR0aAd8-Gq2Vk-bmV9T4KOUcQ1R2j1EpM0TojRlDdEGOyS48xTj8lGNyQU0x-jbFFMyeAky5DilYWSRktJTcmEt2aRDSRydWnpLiZwnufD5Gf1iXIhhvTWHDPYW05uEzOlNM9A3VuMj3G4xGYwRJNTKl6NKVExxFTGlVIafs1JByAprN2Tg+phyDInKOVk9ZOTbl5M2dRSxgy+ljIUW4jhHjlkGx6eMoZ8SBmC2YnU9itSTFgrMY8mm2zWLnK6ccuFNzqmIr2Rc+FSLrmovRVijFlyUVCMmTXdpVdCUzJ4nM6ZOKqUbIhWUmFkKX4Ao-sy-hfzXlMtZe8l5oyOVsIcm3T5Sy2U6FWfiu5pzxWYppfckptKtmuJ2VK-kVy0UhRVdi6VEqHlyqeeU8FMrFXdK+cKk+vyuVAqNUK812d2WdlFaCg1+qtWysdQy11psxXarIZ6l1zrDUaslaq6lgaA1er9bCh14bRo+v9bi0NvqlVhsTQmqZszmGktjsSuuaaWk5stYys1gKbU8sLSyrYAr838yUSC8aw0a3mx1dChVTrk2xuDUmoNmqtLqrjWqmNLa8WRtbQO+Nbau2dpDb2ktxrrVv1tTOotc7p1WsXZ401Z57W1vdfKwpI6p3joRUOidnwe3tp2Keg9+7J1nrHdey9N692UgvXe5V-a3XIqPaOx996f0vrERmgllL10rrLW81d3zFGltZQnKRWa10-IXYCCt-yoP9NA9WiNW6o10ube+4deHj0pq-QRw9WH8Mes-VejtxGcO7pI1RojDHuXAYLYhzl4GTUIZA+x9DqGwMvk3Q27dur6W0ahfA6jfbKMPujdJ39kmZNicbRJxjimd3iboap+TWm-06YU9p29-6gMiIA7p5jXHWPcbQzxmzfLa6MLzShtj1mXMlGQ-Oqz-HbNedKoJ-+3963+eNoFvBdbMNCeC+FoL5H1ONqSXJszUXQvCZUQl-TiX6NqZE7hpTVa+O8p84VgrxX8ulec0VsrnmSsbpC8QsLsmyOEcM+et9uWP2NZo-3NLemevNb69+jLbWYvZbo0NprA30uQfK9VqrlXLPzby9Nubi3ZvGpgx0xzZL+KVsWQt3bK2vQLMFXt47B2zv7Yu6dy7O3gVJbqyllT-XMsGYmx8m772nOra+ydj7Hmfuff+3987V2Qe-eXYD8HwOwcsYC3dihWWm2jdiw9zTT2xudZGxp55r20fI+w3j4biOsd6uLTD67AOocU-J0D6nkPadk9zeS9NxmpvfcpzT0HVOrvubp5zjn0OLPs95wL1nEOGci7e1ziX5nRdC-F1LhX-PFfC+V-LpX6uVca7V5rnX2u9eC-pwbvnuujcDD88lyLDWIu3at9Fs3tX4crId-VijHXHDm-u5b131vxvPcGwT336OmM45D6T03qvw9a8jyb2XhvY-G-10ZzbmbTPx+lxaiPafM+S5pzzxPOeY8F8YN2MxZ5pa0bPJAO+EsRtnjDKXoVIEFZ33Lzus8AAravd8ACed9LyhODmePWA+PCBIb3Sbx4+Pit9r43l8pAu8j8cJPivoFh9T-qP3jfgczxj9X3SLf+-9q75iUvksES7716PzeO+6-r8dD3230CKtZ9KSHxfs-xe+93y1vfgYL-EczxIlX9j9QJH8QD6gq9P8UAQlt8BgS8-8PA6xoCuw75YDEDHBe8UCi9o988ZccCs8o9CDC98DSCM8iCCDKCyCw9iC8DyCSD6Cyc89cCWDaDWCqDGD2DqCl06CaCOC+DuD4M2DhD+CeCuDOCRDBCINRChCZDpCpDONJCJC5DFCVDZ1ZCFD1D5DlDNCOMtDVDdDeMltjC2c481C9CLCjDTCE9xCBCdD7C7DHCxClCnCNCHDnDzCrCxdbCPDDDvN7BmCXDfD3C3DXDtCwiDCQjwjgiIj9C4jLD-DlszC-DXMZtvCgjQiYisjMicjojcjIjYiEjUikibCMi8jyiCjsiKj4ivC5d-dCAAAWVwBo2iJouIFojSNoiIDokyLo1gHorSPoxo1o5okY9osY7oiY-oqY4Yzo0YuY8YhYyYpY6YlY2Y3o+YjYxYrY5YnY1YvY9YwYzYo47Yk43Ys4-Yi4w4gyIYygAYm444h404p484l4-YwIzwxIkw9Iz44o74uosoyo-Imor46w9PQo2o5IqIoE6oooirf4qEiE0En4lI+EsE7PVEtIgE34tElE6Ex7DIW4gge4gKIkkkkKMkmYu4qk4kmk8kykSktY6kpk2klk+kmkRkg45krk1knk9k-kTkq47koU3kkU-kz4QUt4640kx4mU54uU14hUy4qU4UlU0UtU8UnYSUpU6Uik2UvU7Yj4zEko8EqomE80kEv49Eig40hE0onErExEs0y03E7E2060hgpEq0vEr010p04EuEx0+090n050jjAkoobUg0xU6M5UnU1U+M9UxM8UgAcUHHFIADl0y6QABBbMj4PMqCTU-M+oAAGRLI6ELNL3FIAHUKyBgsyiy39xSAAhesjwAAeXbMcDrKbI+HLL7PqAAGVuyl4kzHAABhUcxgAAUWnJQEbOrLpAABV5zwAAAlNcucwcsUukvctkw7XyYM6El0oM00gMyE4830s8jEk8wMk02868h8m0u8y8882Et8x8sMz8l8p8u098i0+8-8r8i85Et00PLwKMhk-U6C+U2M3U2CmMxCuM+ChMxwAAMTXK7J3IGE3Jwv9nHJ0DwqXI+G3JIvqFXPwscAAEk1ziKK9xSyKGK6QFwqKxzxTKLyKOh6K29xTsKuKBgByBKPAhLmKPgRy2KOSYKpK4LkKEKZKkKFKUK5LuSjTXywL-SPyNKrzvztKALTznzPTdK7M4MBFU8JFzLYNLL1LvTwK-yPTeDjK-SdLQLbLNLAKfyjLXLnL9KgKHL6i7jpKBSgqJSQqtSwrJgoKlL5LgrZLoq0KVLCL4qkrYrFLUrlLkrizCSIrsq4r0qYrQq8rCq0riqMr8qErMr9y+SqrdyDy6rqr6rarvIjtfLPLHLvKbzfynLOqvKtK3KXKzKWcLKhqrKRqNsmdGdtsiVrKSUxrZrk9AMFqfCOrDL2q+qfKQL1qeq1qPK9LNrdr+rWq9quqA9kyaqjrDr9qDLgKTqtrVrlq7qbreqDqNrbqXrtqHr3r7rY81L7LQyVqnqdrrr-LATgb-qKj1t5qJrU1obpq5rs1YatteJ7NBqlqk9EaU94aHMMaga-LwavrAbPqwa7LurvqHSyaQySaAaQbetcqSrwqirybCbQa8aqbHqabKb3LiaubWaea2qibeaBqCbTDfrSbmamaOabLXrnruahbZadJcFHcTMsbUacbla0bFgAB2AwTW6cbWnwXWzifWjQQ25nDW0a828aqat6+Wq6wWi66W3G-mlm52iW-G22m2+2-aiMyCnKyMv2sWyWv6tm4W92r2z212zmuW8OmWmOp2462OyE0W6msOyOqWj6l2hO+Oy6t6xWvWnW-Og26cOYIVY2igU26SMu5ACunSKupAGuqyOuhuisEuwuk21OrOgWtO4OvmzuzOnOxOvut2kOj2wethH2-ogOyexmqOh2+JKK8qlK8AAAH1qyyv9pnrprKtKoKoZvpsiqnsaJCtXru3Xt9s3o3v3q3t3oPovvPpKpPttwqsXrPunqvsvu3r3s-tnrtqQxat-qHp-ojsAfToptAfFoULzqNoLugaLtgfbvgfLrbqQcQeruQbQdQfrvQawZHtzgAB5T84CPBO8UCa9AC19b8e9CGMCvEP8iHHBgDyG39QJD8n86RDx6GdAEC2GPg78eH6hGGm9cHu7A64sF6d7n7+7HaibxGv6CrH7vcb7r7JG5GVHb73777v7lGl7VGl6FGusNG36tGP6lGTG1HtHX6j6ir9Hf5D7Aq76jHTHNGnHHHzGe7o6-6jy56wH3HvGIHwGg7RHhHWUoH6Im7sHm7KRXAImYnMHImaRom4nYne6B7s7pGpGM7h6Un0msmPGQHfGAHUmAriS7GSmHH2aO7SoAB9NeukGp0+ukGx1LEq+pp+pe1pxRyRjpgx7e7p2xoqvp5p3p2pj4Jp+LFpkZ+oQZ8Z4Zhpj4aZohcUhZ4+yZjoZZgZ1ZgYdZiZuZ7JzJwGZO-pt3J9VrHpu3UjH3C585qTY5s5brZ3b1e5uHQhU5o5y5m595k5p5tppWk9V5pAUJyumBsJ4FrSRJkycFsFuIZJoFuBkFuF7tf5mZ65r52519b5zpz3RFjFs5i3bFtFv5nFt5lFu5gllrIloZkl9Fslh59rT50l+l6lxlwlml55x51ln5l5il5FvFwPVxnR9R4xzF358ljl4VrlsV-lyx+xwxqx2VmVoVqV86s6xqjU5V1CgVix9VxK6Vsp+VvVxVuVw1hVlxo101k1tx8V9l5l0Vm12lw5yl3lq5p1j5qlllu1tlult121712l-Fj1zl6131z1-14NwNr1l11FgNq1+iQF2u0F+NhF+3GIcJpJtN+FhBiNrFwdSV4lyNhlsNmN0N-Nplwt3F7N51it11kt91stvNqtqNutx1htgtmtn1ttv1nN6N8tkVztyt3tkNrtptnllt0tjtiCpV1V-tiV7t+tgd8Npqxdod8dhd5d0d2tldottd+drd6doNzdntmd4d59Dd9d9ts9vt6ti9rVqdq9ndw9-d698Nh1kd+9udo9g999x9t95tn919j9p93du9gDv9k9890DpFsDy9xtz9396cON3uXIVNr3cuhNxDlNtD4D79kDnD7DvDrNiD7lqDwdvdgj3Dsj-D4twDh9ij2jqjwj3NuDyj7d8j+j1jvls1y1ydujlj5j0jpdlVnj-j3joTrD0TmD6jr98T1tyTpj6Tsd2T-9vjsTgTjV3V4j1d4T0jl9jToDiThj2duTtj5T-T9jrTlTkT4z+T09gzpthDisW46Vxz6cZz9N6SVz+iDz9zgwJznzsziz8z0zkzmT2z2DpT6z8D-zoLiL6DkLqLuL4LhT0LxT3Tmjqz9LyzzLwLhLmLkjgL-L6LjL7LpL+LkrxLmz0rir8ryL6r2Lsr3LzTgrnLorpr+rqznTyDzrojrrxj8LlrwrrL1rqrhrvT5rwb4kez4kLznSabqyWbhzvzziebqbxbzz1b7znwXzzblz9bmb3bub-bobmrpmWT08H9s7t-c7-5i74-K7ilm7k7u7xjh7nfJ7wzl7wfN7ptj7gir72Dn74BU7674H+7kH57sH97nrwzvr8bsb4r4b-ruHo7urhH2HtrtH1H+H47xH9H7T-+isAAZgMAJ+nCJ58BJ84jJ40Ap-oip4oBp+kjp+QAZ50iZ6QBZ6sjZ458J+J9J958p-59p8F8Z+F9Z9F85-F55-J-g4MB-eW7JHl4JEV8GGV8WFV9yHV5iE1+cG19UF14oH1+QEN6QGV6ICQ8w+JC575+l4F5t6F7t5F4d7F6d4l5d6l+p+t499t69-t598d79+d4D9d6D-d-p897D+94j996j-95j8D7j+D4T9D+Z-D5T8j7T+j4z9j6z-j5z8T7z+T-Z9T6L-T5L8z7L+z4r9z6r-z5r8L+58t8l8b7d+b5D9b6T-b4L877r+74b7JCt9L774JAH-L6H8GBH8r7H8WAn+r5p4dZn9r6n9yAX-r7pF-x3TH5n0RzH5Xw37pHAO34Pw7DH-CUfDH8Eab8YDljMSX7P7pAAD5j-i-b-nBJuFfDuVvtuluP-3+v-6gAAdf-pMB-5K8QBKvMAWrwgEa8oBMQFfjoDN4Yck2HgBAc4GQ6wtM26AlBqP2f44CPgWAGIAAE5L+w-YgeP1IHT9yBy-SgbAOoHOA4B-fWgaoHoEkCW+DA1gSwLb5sDOBHAjvlwN4E8Cu+fAwQQIJ75CDRBIgl-kwMYH09pBzPWQez3kHMCyB7A5QdwNUH8D1BwgzQeIO0GSCZBKgigQYKoFGCaBJgugYoIsFmCpBVg-QWoMMF2DjBDg0wU4PME2C5BbghQR4JH7z9LBLg6wX4NsEaD7BQQxwRoPwHOAiBXg0gerFoxj8D+24MfsgRv64DsBg-FIdJDf6gC-+G3DQFt1yE7dshe3QoR4EAHADihC3coZ-3yHf9Khv-aoakIaGYCMGGbLAU0JwaNDZ+6QzoWkJ6EdDF+XQ-obDka4I4J67ggIWMI0EAA6XIJEPGGeC5hSg4IVoKWE6CVhegiYcsNCGbDnBIQnYVoI9x-dicomQIdsNcELDfBuws4VMJmEXDTh-gy4fcLuEnDVhWwnQQcOUyo49hLwr4esPmEPDnhvwxYa8MBGC8fBUQ8EecIhH-CNh3wq4U8JhFj8ACCQ5vHfw+DX9YhAw1fr0Mn4y8fAcvGATrwJF68iRBvEkUbzJEm8wBpQjIBSON50jaRFIoET8JhaJsMB3QvoViI5G99MR3I7EeyJtyjcAqowonI2iZFwjYRjwiUQCJ5FiCQRUI+EX8IVFKD3hKObHH7kmxrCZREgrUboJ1Gai+RgwlDlJ0JzCjTRnw8UXKMhFWjoRioqUQiMPKyJOROIg0U6P5FuiPArDEbCfyf4fBuGXoukEiNIHoE9+Lo3kVyNlG4iNA+I2oVkPqE5CDeBQuMUUKTEHcYx4AtMdSKKAMi0xkAnMdALzFa9sxKY10YaOdHhjtRoYiMZWIrHljdR1Y8ACqPxyY49RwIlscyPrH6jaxnYssT2PdElj3cKPWmuqO7F9iwxvY0saOKrFdjWxHYmcUaKM4ccRRs49sdOJXHjj+xYYsEdaKVGkDphhA24XaNtGWibRYoyUceJ3HyjDxp46UcuNf6y9ExCYmocWKqGPi1uBYwke+OJGfjSR348kRmKAE0jfxlIoCfSLTEoDVAaAgYOBNQ5ICNxU49cWOMnE1iOge4iIQePPFXj0JbYi0dhLPG4Sbxq4nCbeLwnESCJCE+CUhLrGESSJ1EsiZRJHETjGJcE5CfRLnHkSWJTExCZxIoncSOJzEqiWWK3EnisJpE+0aJKPH4SxJtEqSexIEmsS1xBkSFopOhYaQlJAUNSSFA0kjDzRXgLSQkxUkQsDJULCIJJIkludWRrQqCeb1gnwDrJbI3iXJIckMT+JzkriS5LYnySiJ0ksyd5OvEyTPJNE2Sa5J4nuSFJTkjyeFLCmhSvJQUiKdFMCkBS6JkUmKYlP8nJSEp6UpKfFKyluTcpU4oSReO3GYTLxGE0qaZL8k+TYpUUvKXxJqmDBW6wTIphkx8ZBM9mvyCqR1PkGQTG6FvMkN1IrD9S6pwU2qSFKGlxSxp1U0aVNJGkoBwhqgWYcJJKnlSRJvklaVVJSmZS0p2UraRNI2nbTKpqUg6ZtKOn7TOpS08SWdKKllSLpa09kQVOKlXTlp501ac9PWkZTTpt046Q1Lan+MCmwDJqbk0OmXTFpj08SYNL6m9T+QekqGUZOUkmTVJsM46cDK0EENURTMMfn6MP7T4fRkBHGR0DIbIiPgV+EMejLpD-g0Z+MvGfASpkeiaZjgTGYTPqBb9GZHQYmf6P2hj9gx7M+oATPkEsyBgXMrGfUHiGkCAA1nTJ0AX8PB-M0fBLMYDMy+Zn0j6a9KBlKzdp709WTlPyn49NZO06aY5OVlqDUJ80tWfrOGkGzdZJ0y2RVO+l5MAZ40s2Q7IJC2y-GgTLWTNItmOzJpHs82TsGhmfB-ZfsxGZpODlRNQ5+k+GS9NBm1iRZKghfBTIGCeihZlMhOR4D4bcyOg6-DOQLLlkoApZag9OcnIGBYFkhHMo-qnMcAcMMRHwWOWoKTkyzHAp-UufUAZmkCFZKgtmUXP9ib9c5b4Xud+Ark6BBZDc62abJQAAB6G4SrKRljzPZPsp2XPKon3TrpUckGWvMKnryHpm8leW9PdmLzfZuQF2YU3SbKJkZW8hUUfP+k5MF5B872fvJvkPy75QcyOcZNYC0RA5ZQl+XDLfkIyv5M86efxPjnNyU5wCgYLv2zlpze5BSTmb3N5nSzSB6IkmR0HzkaCYhSCgYCgq0G1yNBw8xWSoKbnVyW5vc+uXgrUHkzQFHgQMSoMwU6CkhhCjoK3JUFwK1BWcruY4BIUALR5nCr2XtK4XRzBJOsnhRrKEV7zb5vCkRXrPnlPzH54iqRbIvvkxBL5xIJRWk1Phnyd5OkFRc7IMBuyKi6ip6fwoGBzSKAC0jeWYsPEEAP5gEv+SHJsVhy7FEiq2Y4v0UfAgF9CjBcQt7m4L4FKgjhWoKgIULAIvcqhWoJoUaL-5hiiJdvIMXRKbp3CuRcIoSWiKZFiShRfIrEWpKMlyS6RSuOXkxLzF4Sw2bEtXkFL8l588pb8MyGDBwZBIGpdUshlpLMlKSigFUq1oNK2lNkiGZ0qSWSLGl2S9Jc0t6VZKhlgypxT0rGV9KRlOSgZdMqaWzL+lcymZUssWUrKFlayqZcsvWUTLhl2y0ZS4vqDGLkApiipWUsKV8Lilu8jZasquVbL9llynyXkriWRKilpSp5RctVnxLJluymIK0rsmWSep3S+pYCp2V3KFa948yQCvskDT2ley2eSCtnmZiTZny+FcithWor5lNyzFd8s2VYrQVUS15SUpOVvKCV9yvFS8qJWEqzlziuFWiueXnKSVHyuldSrt6PLKVpy9lcSopWkqaVGK7FaoF+WICoVxIOpR0qFVdKxV4yslRN3BUtDmhbQ+JrUphW8qpVzKplZKp5U4q+VtyjVdcq1W4qdV2q9FZqpVUezDlSAY5VSvVVGrdVJqr5bapRVqq7VBq-VdasNWOqHV7yw0ayu5WuqXV7q2lZ6vJWWqnVvqgFjKvlUsjIV-yoNaZIFWoClV8a4FX8rlWMrA19KrlamoZX4qM12a4NR6qzUxrOVeagNQWvTXFrlVzqvVVWvtUlqc1hatlUWo5UNrm1Pqn3t6szV1qy1dIY2SYsrU1qK1oa-tZqssXhyYZDilAIkn9mTrR1AcmdfmosVTrP5P8+cSOvHUNil1hAd+XOtrXlrjVfa-dYOt3FTz-VA6k9XusPUXqz1Nqg9VerdVprVV96q1ber9WPqQ1z66tTetfXzrd1NE9tbmqbWtqv1O6gDR2p-VbLV1y61+ZuqGG6SZ106tdfBsg3fzoNhktdebMQ0oaBRrARddYqQ3qTt1uGzDchsoAgb-1ja8jS2tA2kb61gG0tQ+ro1PqgNp6pjeevfVDrr1l6ljRxrY2fqGNb6rjXeoz5-qaNVGijbRs7X0aJNjGvjd+uo1dqxNomyjWRqU0iblN4msDS+pk3AaFNamxTeprk2SbfhI8xgAAGJe5AAKV7lMV0FHgXsoEp0BtlB5jAWik5pQA8UIFjgVivZsYB2b3FHgKsn5scASVvNbm3uS5pC3gA0yrm8AAAAle5nFQLbZOi3hhe50EjzToBS3RbUZEWgnr3J7Xcy24XoWgEVu8jFaytpWirSVqq3lbqtlWmrfVrq2NbatzWhrS1qa2taOt7WrrW1p62dbet3Wvrd6G9BAA"
));

export default createNewAscii;
