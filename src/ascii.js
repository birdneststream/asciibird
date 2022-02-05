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
  let curBlock = {
    ...emptyBlock,
  };

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


  const mIrcSingleColourRegex = new RegExp(/(\u0003\d{0,2}[,])/, 'gu');
  const mIrcColourRegex = new RegExp(/\u0003(\d{0,2})?[,]?(\d{0,2})?/, 'gu');

  // Get the max line width, as some lines can be trimmed by spaces
  // we cannot always rely on the first line for the width
  for (let i = 0; i < asciiLines.length; i++) {
    let cleanedWidth = asciiLines[i].replace(mIrcColourRegex, '').length;
    if (cleanedWidth > finalAscii.layers[0].width) {
      finalAscii.layers[0].width = cleanedWidth;
    }

    // Save some time on large asciis?
    // if (i > 50) break;
  }

  // The foreground color is the first <COLOR>, and the background color is the second <COLOR> (if sent).
  for (let y in asciiLines) {
    let line = asciiLines[y];

    // Check C5, or C, first then
    let cleanLinesSingle = line.replace(mIrcSingleColourRegex, '');

    // Do this
    // let cleanLinesSingle = line.replace(mIrcSingleColourRegex, '');
    let cleanLines = line.replace(mIrcColourRegex, '');
    // cleanLines = cleanLines.replace(mIrcColourRegex, '');

    // Somehow merge the arrays
    // let parsedLineSingle = [...line.matchAll(mIrcSingleColourRegex)];
    let parsedLine = [...line.matchAll(mIrcColourRegex)];
    
    let colourData = [];

    // parsedLine = [...parsedLine, ...parsedLineSingle];

    curBlock = {
      ...emptyBlock,
    };

    let newData = [];

    if (!isPlainText) {
      for (let x in parsedLine) {
        let codeData = parsedLine[x];
        let colourArray = codeData[0].split("\u0003").join("").split(",");

        // If we have C3,
        let endsWithComma = /,$/;
        if (endsWithComma.test(colourArray[0])) {
          cleanLines[codeData.index] = ',';
        }
        
        if (colourArray.length === 2) {
          if (colourArray[0] > -1) {
            curBlock.fg = Number.parseInt(colourArray[0]);
          }

          if (colourArray[1] !== "" && colourArray[1] > -1) {
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

      if (curBlock.bg === null) {
        delete curBlock['bg']
      }

      if (curBlock.fg === null) {
        delete curBlock['fg']
      }

      if (curBlock.char === null) {
        delete curBlock['char']
      }

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

      let isPadded = ((blocks[y][x + 1] !== undefined) && (blocks[y][x + 1].bg === undefined || blocks[
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
  "NrDeCICMHNwLgMwEYA04BmtGvAYwBYCGATvOAATgC+KEM8yamDOBJZlNdWjGPrRUnArVaUfkwl5BHUdxaSF09sM5j62RZuVCRXcUuba2utfO1HeJ2fo29LAlXvVSHaa6rkGLUj8-P2vjKetq5BTmbegUp+kXY4bjo2Lobhpl7xWlbB-lEJackB+TE5cWElERnlxqVVqRXpofU1lU0+DYV5WY6NKe0tvUXd7rVt0QOdmXwdIX3j2a1zxROzQ9MruVOJsXX9C4Nd6-uT1cerh9ujS8NJ51sFd6c9J81nm08ji2uXXxcP769no9AZ8DvcZgC9kDIfNoWUQbcYcs3vCoaCXmjEajYejgZidmNkXDdjisSSibikTcCdcjsTCdSrt9-tiKWSGXTKazGb9wRtuZz2bSfmCPkLmRCBSKMaSaRL+eSeaKEXK-pLFYLVXyURrpXjZUy1QqOXqqZrDdr6cKWbqbfoCQBdFBgI06k1263q91ez3G31u-1W+UB4NB11hy1c20+0NR71+2Pi8NxwMpxNasUZlUWzM57O83MF-PK-F50tF8slg0V6tVtlZysy+tl2tNpVt8015td9v67t13tm01Sj3plv9jvD6MJ5NJyNzwslgBMAE4tEgAGyUwCJpLtV+ut4jd219+tNzu92uz4e-Me+qejOej5eDxeT1fHzecnfzA+sE-b2nENZwbVs+0HEcYxA8cIKAiNF0nUdoJ7TsB1QxCoPnUCJ3A9DcKneNgKwmC8KHJDiJQgjUwXYsMJnCi0KosdfkdZ1mMY8iEPwzjaO4zCuLI-jeME+iBMg0ThPEoixLgtNkI4oTGz4iSlJE6TJNkmjVKk+CNMI3TtM07DYP0uSGLo9TDNMrSwLUgzbJ0syZOs4zSMcmycLspz4D-eAAO-F9rzfe8P3-L8nB-bxfLgfyIsCz9gt-UK-PC3RIo0aLYrS+KwsSqLkpi1KyHSrBMqK4QSp8gqsuKoySKY+SLPszz3NchrzOUyyHLqyieKs6i2r67qXPqoaWp6hSVOGgbRsU6b2Ka7z+oW85WJdDqvI8kyZt6ubxpG3apv2nbJq646Vs2wa9u2i7Wtmo6bsazrmseja7sOs7Xuck7Fq2tyJt+q6Hv+g7TpekGfuepb5qey77s+iHbt2DcAFYvvgVH0bgTHEe8HGjAAdkpQAFUmRtHcY0fG+qp+AicRUm2hplSmcslmDLKvKMuq8rwEquAOefUHAfh8H2u+pGhahv6xb0yG4Y+0WxqxmG3oBqWgYRmXlth96weh86da8NaJbl1EAA4Cssi2setimsFtrWHb6p3FJdlS3aty2DI972vaWn3-b9rSA+DoOGxD8Ow7LCPo6jisY-juOSwTvXpaVu3ZZNrPDcl+XU41xXroz7XVdz3XhYV-XlYN0u+jZpb660xuG2bstW4rduS07jFu7xJm6b8QB7UjJrHe8hMfURRhBR-JrWVfFnPTbVvOK-zkWq+L+fM8X7Pa93he953o-D5Pg+z+3w-jeP8+4BTjE77xB-ITdgnoQAW12J-zaT++f8fv-n4AO-jbIBn9QFtC-mAkB0Di6QIgeAvocDEEIPMEg1BKDr4XxvlvEu2Ca54OroQze+CsGkNwWQnBlCSHkJoTgieI91gDxyIAW1IGFa3oYzWe1MuGKQAAzrkpIAdNJdj8OLhwuuPDmaSNZtIgy4jzBTxnkQue1CqHKPTio9RRdNHEK0cDHRBiNFGO0cY-RpjNbmMLmYqCV9T5kLQd4BxGg3YoyXJSAAllA9YrjKSkHgVoDcPNcBeKMIEykwh-HrDCaHLQoi-AAGcQlYDiTkAArkk+AKSnAAAcMlwCyboXJkSjAFLIAAezyaU4QfjkGxMpAAF0qYHOpiJYDFOSb4ppiIKntMyZSdJvT8mUiKbU2BGC7G0NUVMvRFiTFzOsQs2ZiyrFLNWSs9ZG9DHzLWZs7hWNRGPiESIpRYjJHQgADxsL2ack5j5oQAC6rmKXkXjWRDc3lNw+S3L56807bI2X85Zuz-nAqBYCnZ4KAUF1BRC6FkKYVQt+XC5FhpbEELGTAx24z7bYvgE4nFmLna4tvsS-FeLSUUsJa7SlGLaVYqpe7GlWywUosrvC9lrK15ss5avXl6skUCu5YKrlIq+Ur35UKjuPypXrgeU8qRtz-yUgAPryuhKqzhirnnSq7jqnueq+4GvHka1ELzKYmt2AAFjpkYS1ZtOZYGtVoO1Dr4BOvWC6wWS8y7L3LhK0V-qxV+vFSG4NYbfURp9VG71Mb97bzRRQ6hZKSUMqqYAlpfgADuXS-AAFMc05AADYFqcMEwZaaemjJKZSD+5bKT5rrTE9Yab0Alt0JW9BGacg1M7c2+tbayAADcB3CAbVWjpiIe2OKZUShlsLhVBsjbGzBkyZmIslQG0NS642rt0Xu5l86N2LujeYM1WAz0YzOZSQAIgTypkVqmKlIAA6T671yItZqm5X72EfokVjd1tr7VevMABx1QHAJtFA268DAVIM2rA66uAUGkNMIrMh91PLA1Ya3Seldaj92WIRURjlC7sPhtwxMmGCbd30rpbOuj1K52+yY80hjjKWNNto1x+j3HGNsc9hxyOa7iOYZw8uyj0yCMgpI0esj268OSYPeukslrlhIFQ9lSDamNO1S0+uHTFUrXacQ6p-TJnjPAdeQ++937rk-us++hz7z-3wegyZ1zSGYNxTg86rzmm+joYM5CQLS0QtaTCw2CLZYotoY8xh6LcWgvkfE+ipTInSNiZ3fhtLMnN3JeztR7LPHit8d4+x-jzGKusbKwJqrnGSvlZq5Vpr1WGu1Za7l49KXE3Cc63JijqXCN9cywp3r3yBGIkAACkarKTTc-YcqbM3FvzaVctv9Z5ZtLb8HNgLFmIO7bM5Z81TnPknfG7Z7VZ2EvOqS1axLoWPMrh5nzZDT33NaDe0dx1j3nt3Y+79nz6xPv7ZAz997QOAcBbB19t10OQfeBiyp+7w38ujakyyjLqOJNjcx-Jy+ownTrUG9J0TWPicY9kyN7H6PD15bx+T2nXWsuKaG6T+nPWafKaZ2jnLbOBsc957jlbl2NtrdPVesXVnRfba2zkHb4uJsy+F4+yXx3pdy9l04eXCO9uwYO2eILL3dfef14+Q3RnDvw40KZg3iGcGI4xA7vETvgvI8i2767HrbuA9td7qHN2Hu+fB4B4PCGYcoaD+H9DfndP+49THwzPuw9W++wH8LHvKdk4F6zoX3WaM58z+z7WhWWck9z8znHhf+f57L1XvPRXa90+rw3inTf6+l9b9z6ngu68V85+l3vCOPOWWQzZ+zF2VdK-WwtqfCv1da817obXauZ8a+V9CZf56Jez+8ATYfBk99Y0P8XY-WtT99XP4pF3qJXuQ9B-90P8Bgd6-v17wP8fH+ec-56lPsPI+-4jw-yjziwT15j+yAIAOj2-1AJexAOgPgOAP-xfyHyQJN1f19wHzbz7x7ywJ5wL1wO7yQhL0rwIIZy5363bxIK7zIMwOoOz0bzoJr07woOwPwMYJb0ZxYLwIYK4ImVHwMn4Pf3H2ELs1Wx3xXzELX2n0kIX3X02zkNVy30VykPMEvxUjUMskURP33yWg0IPx0PTzT3dyMM9wwMMLf3MLMOMIgOQOtzgMQJsLQJQMcP83QOT1sNTxcNjzcLcwcJDz8PcKcLsNQNcOcP8MgPsIiJCO8LCMCNCOCK8MTzj3CI8L-wsL50oP7xRyLw4PIKpwXmIKyIyNYJ4PyPoOYLKKYM4MqNyNoN4JoOyObw72qKzyqLyNaNqMaLz0EMsL6h6OsK1n6LLD0N0IMIbBGK0gmPGLGOGJmIrCmNmKPzmJLAWPmOWIxDUKQGhEAAcCcAqw0wzwgYw4g4p-O-WItIo43wqIxIsApPK41IwAlIoIzwp4+Il4uImIhI14z494+454tI74pInwr-AIv4t4gEj4oE84kE64wE245IyE+E4En-B4qA0EwAy4jE8vbgiojo5o9onIg2QonA9g-Euomoskroko3Ewkqg+o8olo2koo7Ewg0ovEukikjk1ooY2LFzG2aebxK8AAs2AUowFGIUh4kUrQcUxDKUwUxDVYlY9YvERUjY5UyEVUlU9U1ETUjU7U3YXUm-DPJHEw3k9Ik4uAZ-f4x4rAK08Em0047-P3ZEmAvYxE2A6IqEr490t0sEn4iEv0r034mE1EyI0Mz0pE6ElE60tE2En0u4kMmMsMpMiMj0m4tM-Ys0zMk080wfVkmkporkpkkk1aAnNiHExkws5kvMho4oisgkqskszk6s0ghkhszIps9kls0kos6vOUx2UU52Qc12Yc92Ucq2UcmUxEQAJ1JP5JyJTrT+ysApzhT5yFT9S2hDSDSNy+gtzNydzVCDzd8jzvSLiLT4sszjjLyzzrysTbyLyczszHdjTnzUzfTEz7TYzwz0z3zozPzkz-y3yEy-z-SHSPzQKvyUyfzgLXSYKEC4zAzIzTzwKgyAzLSzjkK7SIK4dvyjAsLUK2jySuzOziy2DSzWhCdqTKyOyyLmySLGzaLiLGLSK2SWKCyaLWKGLOKOL2LUFxzvZ+L-Y1yZy5z+StA5Tw5RyJLo4pKBTJLxK5KZKFKhLpSFzdBZyIFhLVzVLZStKHi9zdyTysADLDyli+TczHzbSMLgz8KkKbLrK0LbKMyrLP8nL3y3KEyPKETELnKfLfzYLvKUK7K0KQKCLILALoLArQrgqwLorfKgr4q4r-L4LcL4yoqAqXSnShCrzLKbzcq7zWzCKqT6yiK2LgJiTmKuLeKSrir8zqKqL2yGrSqqr6qaq6y6rGq2qlLYFBLg5er5L1hpL45ZKVL5SRLNLlK+rJqBqjAhrk4RqprBrFLhrpruqxS1KyANLEE9LFydr7Slz4AVzJS9rQKTLjzzKnzncXyrrTT8qHzXyLKHrLrXdbqnqcq3q8qPqErkr0Skq4LfqMqozAbkK-r0qUqoK4TErgbgzQbMqAbwaIrIafqEKCqvr7qbrHqMbnqjTXr6Sir2rayWSCiyyic2zmqeLWqOryamrarCaayybaaGaCamaiaWb6bb5+q1qhzVqVqlrRrZrlr5qeaha+bFr1rKQtq+Lhb74FqZr7ZBaZbpbH5Zaua8UFbladLxrtrNbtKxrdbxbw97drqXrMaTa8KHKwKvLgSrboSbbMKLbb9XKHbjacbIq4aUbYagaEbsKgKwb4b-aPboaQqg7YqQ7wqfa3avaA7UrHT0S7b7KnbE7frnSur2bOjmb8bUUSaaaM707WbM607KTc6i78687C7eyKbOqqaxbuaeqlbn4VbeaBb+b5aW61a26OaO65rFbRa5bDqNrhBJbHFG6Rbm6a727x64AjrdqdbjrZ6Z69acgh7nFOby7i5r9fyU6Qat6Yad6Qq97YqD6N7gKj6XbkaY7vr-rA7vawqAKI6kar6L7PaQaw677b7fb3an7X6P6o6PbT7cazb3qsagHAHPrgGwG6LKrK7qbU7cCKruKc7S6S6176LoHGaC7Cqy7MHkHsGK6pa66CGx6+7O7J7p7dBAAbUlEt7tVpIeIe7o1uoabtbsnvoYbvnv2pOoIoOqnoHpiu4bIdAv4d4b5iEd0vYcEc4b4dXtHr6LPpPuyogddvNqTpRvjscudof2ToUcvr9uvujohrSs-oMb8sfuMZ0aMcRsMd-q-pvpivDvfsju3u0fRtAdRvAbcdcZcaUZAe8cUbKqrrptwe7K4PgequruLrwdgZ7OCcgYQaibxqweidQfwYHLEsYZkYnrofVrYfSZ7qIZodYfNhHryeYeIYEa4ckZEcqaoYNv1uXOEZqfqbEcXoXtqbnpaY4fEYqfrqKYup8c3ucf-tNt8Y8ZGa8YGd6JMd0Zsf0csamYsfvqsZftsahpWfPrMefphu-sca2bWfkcmfQpUYvrUcto0YhyObMZOcSYSZwaSagYK2zvidibCcCbubifCaQciY+ZQfuaed6cIdrvyaYcyYKeyf+aBYydodBa7rBcaZBeBZ4eabadaaafD1EbReqYmo6Yka6akdxaqfxbhcRYxcJaxYhZKavzkaiqGexomcxPGdMbmfMesY2e2YfumdZb2Y5aZc2eDq5YWYcfZYFbsbfpFZ-uWa0YOYZepcGdlalZpf6f2fpYPuueecpteZucelCfVbZqCeSb+f8Zge+b1d+eNbeZeYntSdyYYfJZtdKehZYdhbJftYRcKaJbdedfhchfKbxexe6b9d9eRc6YDYJZDaJZ9dDaDZxbDc9eJbqf7qRZdchZHypeRIVb8aVfPLZaWd2dmcWfmZZZ5ezYLYlb0bLZmfLc5bzcFZzb5clcxJOcdrjrOeUebYuaZcbZwsuZbcVbQYiZiaYveeJoovLLNc1YHcNfQdVcHYtYwfNZ1bnfHateXaTYpahddade1utZydtZ3dXbta9bXY9a3d3fBdRfjbjfaajf9evcDfPavfvZRYTZJZjZPcfeDdvcjffejdPaJZTYAbGfTdGfWaLf5cLfzeZdLYreg6rcrdA+rbFZ2brb-rleVdQ-PKA+lbTfQ-vMw7w5w7uvw-laNY1bVYCd1e52Nn0GrURAACovAaO-B6PqOJ0mOGPWPDRGOcgABhdjvpREAAeT46GURAADlhO00ABxCTykAAJRk8RAAEEFO-AAAVFTnIAAVQ06cAABkdPdBlOWP+O1ODOyAABJMz4QIT4zkTvwcT2ztNAAZSs9yC46cHk8c8pCM7EHc90H0688RAAAVXOAAJVzyIPzsgAAMVc5s9844484i9c584gCi+EBc8C78F46y5yEs9y6cHy4S5M848S90Hi7S7K5i+S4K90HU9q7IHC4a+EAAFEaviu7OcgAB1Vztr5r8APrjrtNAAaXa8q5K9+HS-ACXFc5XDG77URAACkUvXOHOhu5IpuZv+veFXOtv1vEQ9vxvOvJuqvhBmP9u2P+vzvQAuBbvaA7ubv7unvHuXuHu3vnv3vXv7vKLPvfuPv-uvvAe-ugeAfgewfQeIeQeofwfofIeYf4e4fEfYfke3uHQHQgA"
));

export default createNewAscii;
