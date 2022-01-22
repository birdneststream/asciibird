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


  // const mIrcSingleColourRegex = new RegExp(/(\u0003\d{0,2}[^,])/, 'gu');
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
    // let cleanLines = line.replace(mIrcSingleColourRegex, '');

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
    console.log({
      parsedLine
    });

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
  "NrDeCICMHNwLgIwBYA04Bms4E4C+KIZ5k1N5s0BjACwEMAnecACXH0KxIywvBoaYBLNgSidU3clTqM44AAQiOxCWRzSBcgA5KxK0jw2zwtXUUSrDfGUwA2Z8QanXN4AM4P9k9S+OL2ehZOPvzGAO6eQd68oUwAppFcajE2cvYB5klWsXKUiZbOOeAA9vnBKa4AtmXRRvE1yXVy-qKZBSGp4AAuDdmdpRmOtb5MLcpRjSNypoNek0UesxN9rnlLWYWdwuvtFcbbrUPznZC9m64H4xsdrow75U3gACZnN36ve0wAbh+PCL9TBQAoo9e7DIoJMHHVyLQ5zFbGUFw5bnfbAzoAO3RrlgUIRo2xxlOeNRTAAroShJS0tTnq8AMwkuAAJiZrOR13ZV3aXMCnLZAo5PMF3OCvLaYpFfOFQslsu84qOWEV8PgKpRLKlEoVWqVat1qs18rU6v5xuVBo1pplop15v19qNoFwAF0UGBpXLbSbLWbvRbHdavZ67f6HWGnSGfYHfTaowGI0HQ-HwynI9ro4nY8GMwm03hHQWI585OhaXdC48BpXAdUmSWgfXHkji49qLTITWimN848K63AZ2B0UZl3Oi8m7WO7SAHS0utj1wTmMrrOrtNJzMb7PJ3OpvfpvWHw2bvMH0-7o8X49Wndb893s9Xx+Xk8vm9+7frh-f58EV3umuiaPAAxK817Mo8ABC4GPJcG6PLiv4no8ADKsGAu2bJVhhRQUthgItl+wGAtWJF4bhnREeejywkBCGEZRrhkcRDFFAACkxxijuRVFcUw-Zsf0-FyFiBELOB74QVJMnIbecmfj+9FKaxKlqX+ykaapWnqW+Clxrp8maXpxlGdpJnmWZhmKTptkWdZBl2VZTk2fZLmOSZAEeg5Obub5bkBc5gWuUFoUheFHlhZFEX+VFsUxbufmJcF0WpfFaXJXFmUJfeSW5Sl6WFdlGX5VlpU5U+BXFUV5UlZVZX1RVr4Nc1TUfnVrUde1NWNV10n6T1nWDd11WjbVw39c6breXlyqPAAfJJgaPMSy2DiJ4BDkJrhiWtRQAF4bWgUmPAAHhtPHbcYgk0Yx4mdFtt0gkdS28a4ADyG1lvdrgALIbSxT2YhtdFXUw1FXo8j2Q4CN0wxJP3GAAZBtADCG1wyhgLwUDVQbdDWNFMdA0Ko8C5vcYgPw50+F7Z0oO48YBNWo8xOmZyjzfXTri0xTTC7XzcgANYbToiNMFThOdBE4tyMzHOwy9J2AujsvgFh3PcRjG3pJr9Rqwz1OuGzlkKxxG2cWrSAbQAMkrJPjWNvUTbJ7N9SKXlu2KOFq2setyBDUvMaLG282DciG0Hxgmz5pOApdjNMMugt0r7G2ByzgIx7NaptgD6c6xtONG8YAvh5t9te3HRTJ+XxdR-zG1ISnkuZ0UYv++AmNt1sG214ncuV6bPK0RtItq835fZ1VJpQ9rasJyXTCRz3rjyyPitq9PLUso8i8N9MF1D7Hs+An7Kcaynh1b695d22rAAMG0AFYbf8avjw7ztO0NP8jY7ADv6AN-sA-+CZPbDxdl-EBQDYEwPgWAhBk1IF-2QSfOBiDMFoJzlg12KDQHYJnhgwhO8SFtTIe7aBuCqEUKgVXAheD0FIMYTg2hqCWFEOYTQjhpDXYQKYbvQEYFlZFFVp3MOA8u7z07uvb2gIy6SIzuQx4AAxfGR81ZKI3hRNW3czYPRBrfARbCGHcLMfQ4hPDyFWMipBaunQezmDsafbskRnFzUBI4jxLiHFuLka4pY7jc6eL8fY1wXjOHUIsVw6JUT8GWPMfEmJgQgmCICciVJdj0njEyY8CJgifHhNCYU94gT-G+LKWE0piTjE2LoUkp0-DWF1PYTU5pbTIkmISbErpyTakdN4QM6xQzKE9J4Q-cpRSlgTKqQSaZkzqnjBmSUuZyJlkeOyQ03pcT+ljJGfU3ZWzxkLNWUsk5zRIjrOCZs8wVy0kVLWecxs+zWl7LeUc1cTTOmPAAFRGKXnIAAKhozuq0U5gvLrI2Zch+6sMeAAQQ2uhNWYiU4AEkNoYpEQYtWsKD7gHrqvRERcNoKIBeASehyqXtPedSzpLTSp3KyQ8s50LnmspWRc+ZbL8lMryZcp5vLBUCp5SKzl7KPm0ppZKmVdLBmmT5SE7l4qhWiuVRsllgRFU3KwNqzVtzhXquufq3VhqXmmKlfSz500em-P+fi++nd95EqYAAT3Ubowx2KYShxDmrDuLdpEpy0Qc6VcrhmWvlbKsNMarWmVyUqjJZqcnJpSampx6bvEaqmUmtVuaVXFOzYs6NcaS1RvDaMstIUE06uCQWyp9b81FtOWmvNKa22tsbe2rtnbm1cvNd0qtlalJfPLXCwEfzvXGGRZ3S+5dW76NcDLGhe9SV93tS6uQc7JGEsXcYPFm6K5TrsCClO7q1ZQvFXo7R9MN0RqHaG0tFbH1wAAByZvgO+tl-0lhfp7eYP9fbwCIt-R+t9TyACakRAPGpzeMGD9yPrQbA-e59ryH3obQxayyCHmVwcCLhx4P7kSEcTfBp5IGSNgdI0UKDoGO0AaeZ9ej-7Y1jqfWxv0o7UPjqKJOldKsNrbvJc6vdjcJ4eoE0UXWKdRM3tcOemRQatk+07tep5B6xOD09QywdWG9OceHYZ2KNGTWfuoxZhjWBTP4cY1Z8z9nwOOZs8W-TfTjOYY89htzN4XMtrs6xhzgWnPBb8-28jznLOhZQ0ZjjcX2NGW47F0hdrj1yAACL5zVhI8lELJEychXe+Txhz7lwKzujapXJGf1tXdTuC6+p9kkynMl+K5NPPJoVtL4BysiY2oplOl6gPqc8-FkKerbOmscxN1zU3gszf83NoDqr5tgYW+FjD3mvMGbG8lnjgV1sSoNdNtbp2TvndWxd5bRWX37YSxGpLt3GsTpu2y1F8612aOa+Xc6X3uudckUN2DpdfXda5oGnTUnOi9ba-177kiRvipXndlHe20dPYx6N+76Oseo8x1t3b+OdvY6J+5wnuOccE5JxTuhj3UGpah64d7kiGtPIDeXAbKn46fc7pp577dT3l2R8V8G8PeOdEoynGdKdmfkqxZ3eXtWih5fJTDw9rO2VVfJTVoXr3xUq-xUDxDxK1bLsG2L-FrWUt1dkxtA3h7hcTUeGbuuBc1bCe+Tb8uHvD1G4gqPC9hdA9pz+4zk39WsudzV3jmnseqcx-j5T7pdOCEM6V50AAShbw9APyV+7Jnb7PWmpEGz10Bx3bKQ1sva5Xov-PhJqyt8ozeSm1bg-LojoD+fAQV-FT75vI4ecpz507wELvJH95F9pzuTf6+uCr33uvo-lfKZZxtcf5Le9d9X+L1w0ep8lEF5IkfbKt-A6YNvAfnQtew8b2X8-h81b76eWf43Et79v+nynX7nd2dr8h8Gh-tssAR7Dalzs9O7kvvTj3m7k6rAebt1gvkBhrqntzmDiSk-lAagYPnfrikAY8M-myigUBjXuKiftgTilHl6q3p3BvvipPk8t3kUJ3g-kep3HOLpmTtTonqTjsttlwQnsToIQIUniIbwSAQOmIXHuAmAT5v7i9t1tLh9t1pzv-uIvgfIlgUBj8MHmphodJpHinK-nhkzPoZ0KoeSsQawTlviiwVgquqXiHp3Lugfi4cvp0KQcNvAeXAAIRAGcF8Hk48HSFSHBFhFCGiGBHcERHiEBESGRrCFRIp4xHQF8ZmGuBKGSKeGsE6E0FGHpHGCEHirZGf7gAWGG4774rGGswFFMD27F52EmHkjUEXxaGsHGF4ELzeFZG1GP5UGOER6IGGHgG3pdFqy54VHoFqxuFspFHb5xELGSFRGJHxGbYpHhGhHrFbGbExLJFIJp4jFM5H7kqz7uEXAbQTGHp-6WGVGHpIH7GAjt4I7DGSKXFX6rBB7OF+qgovF9YAHlzkFAaX5z6FG-G36869EYC3HF5WGlFvEglUj-GSI36HocG0HHH4r3GlEonF4MFsoAD0GJDulWGBXxN83WcxrBsJTRfRw+kJTx5KjRqmKc8JZxxgDJ+KMx4qlJpRfuixCRkRXIex9hChYeTAsu4JLWkJTBnQP+Kc1x+K1JTWoe6eeM0x0JB+OJCJtJuuThKcXJQGBpDxEBgxYpuQnx+p3x4KYJh6JRNJJeEJ5JZpUJ6pmBuhqplMGpbJTArAaswKfpFskJlsnczGncmR5K-pSxqxch-JaxOxyxgpsZI6shu+xg-GHpTA2AG0WZ3WEp6uFpyh6hSJqZy8oOv+VphZKcTJXuMZUZSZ-BCZsRdZzZApTZrZIRjZHZ0ZDZ3ZQR2xnZGxA5-ZvZ8qwp8haRih6+RJxeCp1uRQHJh6lKJZOpkipxbKgJxpJwTckJWpTySpgIPJ9p+5OiehAxGZcgdBh6RppRWJ9peJFBrg9RB+Nhdx3RNxuBzpu5sxpJKcX54qOuxizJHekJkuZWb5nuRQAA1JCY0fWX2fGSOSsXBdEQhchVximRBZ0OmYccYMRpacWbYTaQ0ZCQABqQl2mPBrlkGQl0YtlxlDmoV0W1ntmDmIWJlMU9loXsUsXDlcVtn0VsX8XMUCXsBjlqzYWAWAgADiXpbK159pG5IpRQrJRB667pOFTAl5xe8lzYQmIFBZiikJ0F3WS58FDF5lglXZfFVlHFZlllrF1lDltlKFFljlvFzlSF-4GFc5WFkJAAqkPgCURdqSYIFcfjBW0aUYpUeZCVpa4eBYevecQo8HmcXrecqf0c6cZc6dfM6RRZoZ0c6alQfulS3inIeWrNleeWUcfMueAC+cXlRUBtFUBZIh0XAQRb7pCdUetCqRpQHMFd6SuXVYeXBBcT+eXLeWrMeZ0Aue8cYMyBtE-I-P4eYmJXlQlfNaLpAepZJcpYNWyipeKjKTtJtQfmiTxYxZda5R5dxSJbdUJZxQ9TZddfZe5a9W5VdfdR9c9U5UBOtSnBJXVWohJk6dVTBKDRtR+XSbmXpWMaec6U+XuRtHKV1p3O1YAdNfSRNflmdYwbJQ+eEHDXkeXE1ZuTzC0a7tDeXKZT5R8btYyXjdXjjScZCaVUUDNcHG6ejatT9Xzd9QLcJULRpADQJQcXtZ0CDaaVWdKSjdOQfkdUBrOcXqNb1c6XNfFdzeVSzZbtud1nFU8jpTWeSkleTcYMVU8qbaUflcwZCQ1QfmTdicTQgZ3H+UBgBXnmpc6QbXJQZarpCUbUULTY1QdVepFeOdfs7eXDbZ0NWTga7UzcdQTeXrFVHYDmFXVRrYbX7fiqrUUIHcDJDVNIBILeSkDZha4IruXFnakeYaHUBvbUNeAD7cURnZiWzfXWbQJOHQXljWrLkS7dVezZ0FbfaXyT8fDb+WPHrQjRDkWTPl7dVUjWyo3bXt1h7ZMSTZIsrSFcPa4KPXPEMQzfiqjYZWDf1fVW3Yem7awQfWrVPR-JCVLSnDJd1jHadYVdVRbWynffHTLaJd5Z5dVe-SDp-RfSdddPLS-j3WVRfXvcYL-ZQUvTPdVZzaA5lWehtBdaXXZZ9TdfzcLbg79e9Tgy5W9V9YQ2QwEUWKQ0A6LZIuXXTcYFXa8VA2ysHQfuPXPSnAPWjf-Rg9HXDkfdLXA8nawSA0wDfbyQHeNZPTTTAwjMQxQ09QQyo7Q3dZQ0A-mPWDoxyMEAAGyPCAABpIkAY8Y6Y+CJ0IACGkFj0IxgNj6wDwgIDjej3g9IjwLjVwZjZGfI3jRQJjjj3ghjgIAThYujqjRD-1gDgp4tdVoFyJJJx9VxidKd3WAVasWeasjq+R3WaD4mAjki5RTDTAEjA1wjrRSTW1cgitVJsjW9rNfVmjGjajTTj1kT6jbTO8NDmQfjZmiAdyDYgAEaS2P4hyChNeOWOuDjOBDuOTPGCABJpCM8QPyoE2oAgCs8iLM2s-aYAImkkQWznA9pgAyaRLNwDBO1qIC9OTaGjdMtN3OeTRPiGxMV3m1sPiqO0R2uClOpydyvzZaU1n3OnwNMCINrzdU62Hq5WD0X3fMfOPDRX+piOlF5PaAKOx0pOsEF1gtnkdMvW4t-X4skOtN-znN9MIADOPDDOrOjPgBUuuNrMbMTMMs+PmAHOkhyB7PUvLMsucDBDrM8vwBsuID2mLNLBCsIDHP7N8v2l0tMtYCkvXOXNBOMuEvKMPMl0S2uCMNVPgCRncOVlgVqzL2t2dU6tSMxXU2Au26ukL02tSlF2qv4OOvkNOvEsEtutEv3NUNKOutHgKuzY3OUu0iyu9iAghustONFCcubORtkvSseOnMSsJtcvCuPCAAxpIm-aYAAmkUr3g-LRQ4bvLyrArSrag-ri27THr4Y9DPZzzxTcg4Zm92tlTmpGLpRwJTdwLcg1JepBr29QjUNtrjpzpO9Ty3zPVJp0LmrRIOd+Zvb1WALdV47kJxrXh-zOLE+aLPqeDLru71DKbszFz-LdjTA0zPTczTAnjvjF7YzpzDYZ7Rbagh7nQD73L2z5jKbSbzjubzLBbibMyR7VzAbGotzlbXr6FGr4HB+2rIVerfDP2bbnzxgNTyLi98HkiHbtdS6ELaVadS7SL9pcdDe6J69W7xgRTOrE7NMFZ-bfds9k1vNzrO7zHPre7VCoHIHKb5bcgV757Zbyb9LNLr7pbQnd7H7gn7L4Awnx78rKrfHsn37XHAnxY4TTHLZNbdldbOrz9VNBT-t3Wq74jiTncG9i5BHrV5Kq97zaH07dRs7MJxnKcpnxeGNanET3r7nWjVbvrYHvnHnbnAX3nbHnn3FGnZDWnIVEN9HkiVnqTs6kJKHFrw7U75KmHhNkjbzQGHzRr4d8775Q7mN0X+XzbenTbQV+tOHJVeHLzTAznnDA71pdH1rRX+KCLHVBX5XzpiXFn+KsX7RuXrHLHIXnTXnUHXoYXKxEXTdUXJX+rCTj93Wo7vteX+KdX+NprIVAAFCg8BXI5IoZ0pbNTtxhyu8d-h5a+Sm1w-fF3t4zbk19ORad1rX2+Sua48Gt2ygAJSMdBdDeBdjd4u-eDfWqQd+fF4wdN0ACi5naBPNLbTysFncAAtBFfD4dZ3aUbw+nQZ-Zwfii3wNPRu6lzuZl6wdlxPfUzV+aU16TYhxlXN-p6V11WA7ZxeZV08l2+rJCR90nWrBRwfgd0l81-wzDYO-a8lxfd16RGWTk5T-50D3zRNzE6KdVTpxVs97jd1tDxt2O4u2V88d1ij91mr+Sli6CRr3VUR9i53FLxzRtFj57Tjxb4qY5+XDz3F8g3z0953Bw08ml8lY8Wd1T4fjr1hyVtV7aQR39wr-92D803H22Ur08hD2H0wDN7t-PbLxU86dk7p41y15H6H+Kvz03bCzZ3Vb6WSXD53Jz-j1b+Rz9wD+60356wn4Dy32q-Lx3z513238333636OY8+3-iin+l3IHhYIwt3L2a+z2yvXxl878z53P713RHBtAAI4y9T8F-F4QMX4k9F-IF6-Elv1X3F5Xcvft07Uz8H6I-58i-lx9elFUf71kellO+dwl+p-r92vlxQvodN8jfAfp31G4gCe+YAofqD176Hox+AfIoOnwN6Z9dSN3Z0qCzRBE9r+IjJAZg3Pqs8Cet3XWt1lf5ax+6A3BnoRW6wL8v85cI3sgLarkCr+h6POuOG96P8YuJ-XEu-1-7A9huI-GAZAMEHx8BBwgh7MP376wDISufdXhT3YF-Fd+B+b-uP3AB0DqqjbQvp3Ad7686qtvYjlnwY7dZn+9pEgfrAl74DBe9PJ-pwIPzoDTB+g-AbX0hIsDziOXI-kZzcGlElBg-IQSN1EF+DfBAQ-gT4KCGjIk+XZKbj-3ACIC7u9AoATf2qq2C5AZvD-jXwx6EcGuF9ZITwOqomCaBVrURjT3wF2kl+2lOpvhVSH3c28kJAAKxLVgBIgwIRIOCFND-BIQxod4NaEtDE+4g+Ab5W6zRDKBsQqohHx1bBk5B2g-FFoKvLcDm69Q5oR0PaGgDOhCwtoasK6FrCVh6wrYZsJ2FLDFhEA5YXsNeRhDWKEQ5QdrzMGm86esPB-oa1v5N0LBsDDgZgMSqQkluYdNHuKimGlDPhQGFursIOH7DgusfBoRsKOHbDwRAI4ETHxhHd94iJw4cmcN6FHEShmtBOtP3KHi8U4vvSIUYMeDvDmqpPG8jMNc77dceyNFboend6QiaRgIsEXSIhEMioR0fOESyPAHQjWRvA4iAiIQpIi1+4ATJlX2xEjCqu3WN7geTn7ipxRRQakaUSyHgA4WgIHEcoOoFsEWSaQx4N8Pq4vCdWjwgwoUNe6E8uRsI9kWyNBGMiORpo40ZyL4EWi+EPQ2kfaTgH8jK+FAw9FqPW4KDs6F3fFMqORGel12FQ6vpiM64pdg+eo9FoGPsEm1HuHgsekSKQ6aVJRQGZweb2dK5DQqZA34fyIjG3Bt+DA+IQUOwF1VEhBKawRzw1FPDyUXgx0WaPmG1jrRcaHkaUWdGHcURxYogUGLDGHpT65KKajbxmGKiTywDe3gmLGqojdergpnnv0hL49yewvO4bNwvq5jIGUYlAdn27Euc3hMPCEKOL-7Y8SOYvDPpuIPzLs6xhwpkQ2NtHMjGxiWB0RZT5FtjjAFw7-DR2K7HiDBR41chkPME7jqOOomwR3QNHB8xh5cAAHIbRX6K-BLpig2iCiZch-acWiPlKF5gJGg8YYekv5qEMJOrGuuKnlGpi7By4n8Zb2TGsE-Rt9RDpSJVpkSnaGIvPrTwdYOCRRnoz3l6JXrlif6r0ZsZaPNE3jrxV4kEfWMvEiTeJwksSReIklAjzx0k28eJJkn0j4R94xMXIGETOkAA0jMJrGlEVx7+QgYelVFYTyU6grgWhOIqNNDRa4-IQWLkmSSFJdo2ybJIEmiT7J-EoSXZMcmKShuPE1yYJJNF8S-JNo9yU5OCleTPJDk5yVJLCmRTfJLk8KfxJ4mgQNoak6qvE2MloxYJasFhnVRfGhiGJ1kq4T6LM6xSopEU0KWVP8nyT4pgUq0TFOqlxS6pjU76j5PqmlS3JlUjyU1I6khTup0U8qe1KCm9SKpg0kabVP6m7FlJ4lSEt-XFSc9VRFVTuFVQvoAAtSEqoIvrpMOu4VMyZ1PGkNS9pbUmqQFP2lDSBpY006UdKqldSVGiUlXhfRmlAY5p5IyIUtPwG0Vqq60-AfBMAGtc0hJU-6a1IBnXTzpo046YdJOmgyrpB0oGS1OBlgygZ0MwGUjLhlQyLpEMkGRjPhnIzEZKM3aQr1ukTlnSuUmyddwXG0d7hkQz6XVW+kHjCuKcPEVWM7FD0-plwiYYejwkkF8xjPOmZL0rE1wZhq-J8SkJ5nYTy4BI-kQzMUYhjvxTE87ltOrFASOxc7JCaX3P4H4jJ+KaUdDj5mjEKZygjmeRNqrhig+WMxqQTI8JqyNMiEjcTvxwkhVxZ1tS2Wyn340gAJTybBmjPBleyEZnsn2ZDLxn+yepgcvqb7OxnJloBqM4OcNMxmRyY5AcuOUHITkhyo5Z002TjPTmhzcZicu8RHJCqtiVJwGZ6bNMhLvwgWLMlOK+jWmQkAA6rRPtKETXZZcnaU8gomlFW59cxgQVPoKdzLJSs8yexN57BixZOsj+qzOmFFTi87ciyS72bnfkpxZMmIdVXlFayua8spOdHLTmZycZsMjOSnMunxzN5e89GYfPXmpzY5J8i+efKvkHzr52c2+aGHNlatpp1w22hOMiGlzmZs85QctWdJUzg+D0yifpJDqyy2ZOrNKfihMkH4AFpRbKfilgX1tugY4wEIL33HkoDZQs1Fl-I97rj8puWIufMTDlHzvZhC0+fvLvmdSd5W8qhUQr9mkLj598jeQwrPk3yWF5CthcnLoXEKs5D8yaZ3HzlqxwFzAqiYtOtkX0-5CC0MihOzGlEhxus6qivIQZILX57XUmZ+JPEI8gySiwunrJTGQltuasd6UwOLxGDqJp4p2coM56liXZCo7cXGMPpDySZF9OcYrJtm0yL6so+MV73nlGKzFdiwEBrMPTaSheVguMd5N4Wi91Fp+OuZYLcXbTPyLE5mn4r-rlwFF21HRawXv4+KNFxAmYQ3LVEpLhFKcdBekKwWsFEu0814dIoLl5L5RGYznt91oWXzWFHCppewsYXNKIpj8tMvpTfnFzusr0zOlXO6ySLh5VSyipxP1kjzVx6StuX+NXn0zzFhIxblotHmRLuSei13j0Qnm70Elg8rERfQdklKZlxgiZf6KYA-zP5fckKjmXVpTLu65Tb3D3M1l3LG5bo4xXMuMANKSFOcmaMH34WdxBFNEipTqwGXGzDekJEZeTLWVZdTlOYlZeH3omSJ25MS98c8LXmYTbFKixiccoIIbLTFk49FTq0sWDjMVds1iTgscX4CLlRYt5dcuxqlLSimSruZUuOX4rVKvS4-lZMXnlwvl3Ci1JQpoXfKmFZClpcKvoUdLmFbSyVaKolUir2lUquVdKs6XhLy4-ylOICoPx5L+xKcUFQgqnnI9IScHUWUipNlArWVPvD5YiTHk6tdB8yvKbEsFV8qlVzqxVa6vFUKr3VMqj1Vwu5EqrqFnCxpWKp9X+rWlXqsNfKvDUurPVEamNVGuDWOqulTANVeXA1VPItVRlSEr2OD7iKdWRq1FeSmRVKj8FrBLhuXEn4yCyV8-F5Q6WqpkVA1sq6NXGvrXerm1kat1fGoDUg9flCC5NZIlTVzyuxF9XVTqyCVqwc1sHatYWqDrFrpG3WctYVIHlrsrl2S50oYpDVBrW1sa9tZuqbVCqG1Ha02YmrkC9ryU-a9ZcCpCrDqQqJig1d1jzUzyLVICoRVUrVibSpF1q3xYOodXB8BhBkrmcMMLH4D9F6I1AQvKZnyMX1sgj8WiujHdzllSSpBuXA9HLccVY+GRlUKmKProJn-YUZUMXX8jUlW6eFfcr3XdDc5TdQjVzyAUO1TV2ohxeSl5W7zO1Tq7daRrbWNrWNLGjjdxoPUbq2NW6-BkevAAnr8UZ63RReqbpXqm6TK8lOOqbom9c60SwEIcrVgKbD0UEkcdsqtn9DIJoi41dzKyUcSEN27fjbuq428b91O6zjUxtDX8q-VjqmzXxvM1WaeNLmizS2tM3Wb11lmzza5t4FCaRNh6aBfaSekcr+RUmyIaWskRybIhxMy7kpsnYX0xNrBSBU8mC2PB4FxeTLT5uc2+b3N7G-LQJsK1mbHNOW5qfZtH7PyJNVasLRgvAARblBW-cFbDVq3BLKVjvZ0sltKKpa3smUhXHMLK3eaPNuWkbaVuG1jaCtbm+0eRsiGBbi86W42oMKXH4CGtZy6pkMudIQSxlaG7rF1vtI9bxUC2ooNlqeQnbIhwG1RVssJUH4AA5IUpCX0bQFIVSjaFpVkvTISsi1wIxqG2Ta8tU2v7QDreQBaqtX67lZryyqziNt1Ve9crNw1YbltHW1KbCrolCjcF+KXSUkMtUwoIVb4rAdLPzXgb2tzGibUVv+2jaftpOwHQKuJ0U6SttOrzQ5vp1+bydjO1nTTrZ22a6dNooTSlPLi87JE-OuqmdvFS2rjAhynrn+uq34TFlhssnSTq53s7FdnOhnUrqc3y6Vdyu5nZKmp2a7itGutXUzr11a7Ddcuk3YDvV3G6OdTm4HS1tB1LbFxQ6yEgdqAylj5RxS3Sv0sh3NbnSkK8lOLvvrYrqqoupgMLqAw0zyUwWgMmrDrWdwYd2nBLdrMg1gbT+zpT7aYVNw9LHt19BPS4PN3rr4oBe7KIXvKjF7Gope1qOXo-CV7TQZG7tTqzm1QKX5kYt7coNW38jndgC1HZInd2LaEFbeurchuUExblBoEq7bBtfJJ7wJMw-4fyL20B4QN+OzkgNvG1m6WdquvbNXqWDVDYo2+zKLvtKj776oh+5qMfpvCn71Q5+rfTvuv176b9B+zfRJ0aQVbddpuq3YNrf0r6P9v2tfS-rz2cYH9crCvUXuAP37b9YB0AxAaP136oD4BmA5AZP3QGEDPCmbcoMF34o0Dh6DAzqzi0n1cdsO6DX2Jz3oM4dP+g3V-sp2kH396+z-THIAPXsS9IBsvYwaAMMHWDcB9g0gfgNn7ED3B2A5wY4O8GuDQpZ-WQeoPf6LdRuyQ6-rEMUGJDdYug-JxYP1QAA7LFFUOZR1DpUTQ0wbYNKG9DghgQxfp4NGG+DVe5g2Yd0NP6UDa24TSDpFlg6DNK2p3bssNIPcpdNh-vQXMj23qiq1a-3UUFHV278D+AyjTUrwPF4MdIfLFTgPtXkGFdv+lGQoawDaHmoKRm8GkfVAZGlgWR5EDkfGB5HAgBRxQxYZ0OlH9DNe8wxUcsNVGyjJR6tiIeg52G1FBBxTZ7snKAaF1RS+7ZIk8OqaodF9DvY7KzHmr7DD66HRtBj0pw49IVHvfnRnWeK-9Mh+I1fKSPwAijyRtQ5sY0NbGtDOxlQ3sdSMHH0jRxzIyceyNnHcjFx4unXrzlNHmV-chHcH16NhkXDmLNw0EZBWQkNNYi5w9RqeSD6CFly2lU3VH3kottncb4-gNmO9xWt9iygzQYSOObVjcAdY2seRMydyjKbGo5icf3Ynjj2xyo1iaJO4niTgBuo+SeEPWH+RDetLU3rzGtbKqvx0DWjvZndHyUzxlOK6J+PtHoj5KAEyWpcWGblBXJyRNMaeRim2UoJkCdWrqXL7xDq+oSeiaVOEmSTqpjlPVCZRGobwmptU-QdqN4mDTpJrVLFB1PqnmoppvUzieuPwn5TcR-XVQcRMKmnTdpy3bQZVP5GrjhRz08UcNOPJMoFp47IymVO7GCT1Ro04GY1Mmmoz7py01YZuNN0sDB+RM03UGN3lq1M+uUTLtmXdZCS3WEU50diNL6tN7DGCdtqKBp7mibstlILILmc9vmkR1-Bx2Lxl8WedVfwxbOLN7KHdROx0y6cQrInUTKJ70xsZjM+nwzj7fU+ObfaTnLjoZmc2Sd9MLmpzInK07GcpPxnbTSx+0widEO9mtzrpvc4ed3OCCBzw5tE3OcOMXn8TIZsM7qbHN3mJzq58wIOZfNnmhzV59c9VRpO9b3DGS+Y4yd23zGPdEOh5fgOH02H8zRZj9eSvwG5nnSqZvOAyvtIZmC5Epk1lBp7PHmHTWFncxvtHOPmKTy5jE9ef2OmGTDQhq-WRcosUXkQl+2i8YfOMfnGLN5mQlSbq3fnDtdJ6ZY8b72Z6eLuHNo1136P4DIL486C87MhJwW1Brx1DhnrnUkquV+5qQ4saPN4XbzS5h8-ADovjBtLa5oi8GfnN6XNLK5wi-RaotmWaL1pi+hxaAxHa+IxmtMdVQ5MpqgLvez491gCXF5wLLoog0nCeWHopLAxmS21vJQoW1YmWMs1uUUvFTnSUp9CYHp+nPqVLOFzc2FAMtPmCLi5wILpfMA5WsAeVrSwxYsuGHqLJV4q-wYqsGHKrn56y3ccIMOWT0glpHbCbcuXq2B3J50qJZ+HiWuzsFpk64oJ2HowrncX9Q8Ye3j7TJOfXy3IEiOqjvmqowIzadkP3mNLq1oy2tZWvrWtrm1na5leXMFW4AB1o60VZ0snXsrZ13K+lbjNfm6reOlo0lact8Xuz9VkC86QWkpxvLdWrq8hMLPL9qqgV-AQhcwjpmpBxGuQEErhP3Wtx0h1SzufRNqXDLu16cxleRumWNre14y8RaytI2TL2NjG+jdRt43Cb6wA6wgG0s27fDv5xlf+ZEWAWWriWpw91nnG0DIS3170T1cBMX0AbdVIG0UFLH49hrUx6tfjzyWRH5rcp5a32f0uZRcMLGbwfDdwtXX1QstqjDLZMzq21bmt0qCrYJu43ptG55QTZdYJ2X58WOnrBmrpst7HpFt50lFtk2s3prPzaFfyO5vB9ebI9EGzpoatyBJZcix5d1jitjXv17ox29YsFuKn8L55li5eejto3tr-+yO5fORM62CMGt7W0rblvNQU7ONrG-reqrJm2UBd5Qe7et78W6Nl2l69VXnVjHfrM4mGylcltKX672FhGyjZCz1Rs7I52O0Tb1uY2RuCt3HMnbTuI38b8d4m6rfTuJ3c7a1Bo4rdSsN3ljLdue43dhvz2b5Gdvu1PY3u63p7O91u3HZzvD2s7R93zCfeVtn3M7B90e5kFJvk3Z7bKI26URNvh5K15616-IuEt1Vn7ek8sl4sRquW7ebK-8sjtrPlyCl9NmE7-YwuDXmzZtzy0vbXvb2x7vdne0g8PtMXZz6l5ByjlvvxRcH2UfB+VEIeNRiHrUUh1ffHtWX8Bj9+0t-bKb4bSi718uM5ckRZqEFn1rw-+on3-2IHdq+biZxAdU2QrwfUI47fbOPlq14t1s03eSvRQB78eNB9faUeUOvTGDiLJPawfoPNHyjlB9g8UcqOtHI9oLB3fG733xUNDlKlxZI1l3JNkJfk3Vo4dqxA7n6ia6KJGPlxIjeS-HpRo8Xz7NNWe3UWbd9smaBrMjpa2fP0e6PDHbd3e3o7UeqONHJjre4g5ScSDO7xj+o2xYLkWPAQEV1DfqPyf2X3H0WyEnk+duMOZhnPO2wBsKd74ZhL2mYfA6eSePq1PjwR7I+XtCF5HZ88hz3difROKHUTnR-0+GeRORnBj0Z8k+0cTOZnQz2Z7vZ10L3tzqTxe50+Wcr2lnB58KGM52dTOMETZ08-E4CxJPEnx9o513dIvd3mLlzm5zHduckWznpz0+1rdYsG2bDRdoDB8-5E4HJdvJmp+U6OVV3q1LVAPc6bCdyGOnKzy6bs+mdzO4X4z+F5E9fMvPHnJztF6i4xfPOnn59lF1i-Rd4vMXOL7F5faJevPwn6z1Z1C62cIONnNLyl00ORPHW9nMT-u4neRfEuJ7+L0l3c55eDOEX-LpF2+fSft3CXJLgBlk6mnG9q1wT7izCzNuqiBb3PLSe04rs12ZZHxu-tWqYf3Hy7CHIR0A4bpm2MxdfCW-S6MdwumXsL-l3S5ZfnOo7XLsV5y9FeYP7nfT1l7C-ZcOunXBLn1zVeof9XRlfz7PZPpKdn9EW4bq26wUWuJWg78g1xzBYcPguwXAgxlxdYTuwvLX5r612s4gGHOrn3r7l768dcem7XiLoIXm9dfFvU7uLwt366luQvaXOb5S+S9zeJ3M35p6M1a7TeFXmX1Lpt9La7e9u3XQ7gd-LZHeb3B36lnnclMhKjXNX0V6G8yfwHV3gj8WkN-W5bfNuI7Gb7t4dd3ftu+X7r67Fibk6ZXT3hN896vcndZuRuvTqxN04EIPu+3yBt5xS7ffPvG3VLrd8m+2fjvUHU9m1xScvdY3gPKGMD45hA8lsUcML7wXe6GRPuyECHmGWY6Aw5Oigamhzgu-ndfjE3vz4E2ynDsLtIrCmFV+A+XVsoKz9D1+5ysjd1aqnctfVwvvGtQ2D8xrqPg2+WPgfgskHwDhB64-HvcToHiD4B9NBweEiSHhSBJ5G0U3pLEb5PcXko3VPD0jjoNzOXCOaqSJYKhh-aRlfCz-bHH99w-CZBGfHQJniMGZ7TAWeDwVno8DZ8NB2eNQDn64E5-aAufggbn+e-x9YL5IePcbPj-5+49efSiPnoL-aRC9-u4n17211a-3vDuovh790zJ-ulWO5A80m29VRdCf3g+oesnpstw913VPrH-yxEerXEqcNLHp5Lp+yH6fzPxnvx5Z-HGmfHgAA6z5Dda8wFjPdX5Ba8AA511OvTXwEB-Ms+BrQvQnwLwF4E8Lmxvk3tc9N+8+nMwvpr999+43e+qJXfC269w+o+sFtX7JyEsACy8IKynMb1tt7fyVj6KViO4iUheAuhOEFs1rh4u7u-OeuvUshr9jB6-NfPvoLgi715Cexm-vwHYi4D7s4psQf4N05uD6Oy-e-gkPub8F4W-w-Fv97ib-N5PdQfRvGP1Hwj-R+8fxv+Pmbz6aR-E+sfBPtH8lcx9HsRP4r19+xdlre7qqCrlL5mI1cJutP230olV-cDBXm7-bqhE5-c-w+of4XtQML7h+k+psePyX359F9C+5fEv+AGL7B8k+pf5Pqbwr5x+CeNfyPrX6r81-q+9fOvg3zL8J9nvtfKvk32r9m-m+bfhvi34q188O+Yst2Sn2S2p8z31vgNSEk1t-n0raP9peUSpugf26YNl3uDQZ4-ddPsfRv633r6V+P74-ZJxPwD-l9x-U-lvuAMn+KNZ+YfGvnP6jfz+437fQP1307+j-F+K2Rf23xn5j9E-q-Zfsn-r9j81+K-G2Ov3b-r8l-y-nfyv4767-cf3fZslD8t959fvR-n7xkR59F-9ek-6fhv9L-n+K+5--fhfyv6X95-l-vfwXxv539p+e-bfs3x36P8t-9-0Pi96f5F+m-z-x-xf03-b8n+b-a-u-4f4f+v-b-tfl-+-9b9n+q-j-rf937-8D-a-zf8n-I32nc1YL5zq00LTm1Yc2TfFGD1u2cvie0+fTd3H8zXaF28BC-YH038gAkyywDt-Pf0ICM-fAMwCcAn-z79--Rvw-9gAr-wv9EfOgNx8QAygKv9f-JgNwCKA9gNL9QA7-0v8rfe-1oDAA8gK4DmAvgM-9uAhgN182A9lEWdB-CF1QCI-FbzMop-XVBn9hvUz1UDrPDQNz8iA2-xIDZfXf2ICyA3gMz8jA8Xx0Cn-PQNX8RAkwIMDdA0wOV9bAiwJ4D6AwQOMDqA1gIECpAtwOcDGAzwL8DxA1wKW8kiYfxbEn6aV3Y95PbDw59hHIayVdiPBvirNlBSjWcUhHFFTVdHDOqno81YNhwEt4lLDwIDm9cz3q92vQBwG9lFWr3UCE-ewKqDHA6wMsD1-cwLqDqg2f1qDOA0gJLZT9Qv06DmglP1aChA9oIuZugjoIKC7AvoOMD6gmwMaC2g-QKmD+gmYMMCxgswK8CXA5YLJ0kvfAWO9g7M1QBdbvE7yboVPFOHD1kA9Hhu9AQexwWMgTPYLZQcgtx2qpoTek3I8RdSEld1aNS2m+8CnIoI+9XvToFbkofK2ih8lEEYPT0ag-mQcDZg+oiBDGrEEL0FegooBxJIQ4WEiAhgwYIRC5gqwOmD0Qn-2RC+mbEId9XPYD3xDFgsELd9UQnz0JCqfUkPeCcQykNKsGghYNmDxgnoOz8mQ7QPpC2Q-wOsD3AjgLRDRAmgICDVgyQI5DwsdYLqo53AlVVcqREB3xEwbAgWKd7bbrCOC-rcuAQCojHhmK9TvIYTw8KvCS07NrbMUWCsHCMoMKD3vZJRKDI6YkNNsLQ4EJaDyg2EPZDSBaENWU7QpcCWDRg-aitCf7U6wGDOgKYVxDrQ50KcDe9P0M9Dzrb0LxDUQh2Sh89EVEPlhUQ+xyh9ryKHwXRUQhqlRDkcGkMdCZ2WkMmDE9cqxzC+HVkPppMw2riRCMwr0PmC3Q+0KaCJA43yFCeQ5-z5DOQnwORAD8fJFbClAEUOD4fnYBVZ8dQ7TzHUvjMBx1cKRVPRmEbgisQpJHbSj3O85ZfZTiVGfSKih9X8KHyNwAQnr2+DXASYzUDPggXA3CAxI0P+8zQ3PR3CinG0MgczwgsIL9xlD0IxC6Qy0OLDEAm8PrCofalSPCgfckOpCww4DmDDbw-MMDCLmO5EL9AI4Dx-DyA0CLJCywk0M-CKw78Mgib7OCM4BwI0sK-DK-JCKfDvAmsOb9FWdsKWAcIlsLAw8Ikt2CwMjRlhkCUAuQIoif3WQIERlAxXy0D7PeiMc9GIl70qCKgtiO3COI5kKJCHw58JAiEI4gDQiDw98P4jEAQSKuAxIgMOrCAIkSOAioPCSPgiUI9gI-DwwxSPIDlI4SNUiIIzSKpDFWeSPysRI7AMwj+A-kLrCMIi5hIiS2CyPMiwMKyJZRwAzuEgD7SRyKyYZQiGx+8Q-OIWdJFQgrxsdElXsN6s13BQLQCEEWiMz9mI1z3Cj3PSKMwC0KYQN-CuQuKPrD3A8-UvcUouSJQw0oo9kyiyWbKJUiB-Z32E8DIvSIEiDI9SN78yo3AOKi93bSPQjXQ-8KrDcA1JEL8a0PplsjFWNqOA5CIwIC6jnzGyIIj+ottDIix-IKJGj5Alt1CiJo6KOn9WIyiPA5EorSPyjHMXKNgiIPZaN781o9gI2iwIjKJ2jVo3aMWiDolgO5CzI6CJYCtohaKOieorNF5CCkFgI6jK-e6NwDHon-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-nTXLhV13DyPBiINVRLutk0lDMx0DXVgl8chMi-g-wrcuLMXTrc0LNey7CFcJCzvhHjIfTYwl9JTzOktHNayvczHNUjmYAPOKzw8trO7gt8p6NRCFyffJyzeYr3K6zUQlEmPyM4Y-MJRj81uGPzz84jKXyc84vOTzJs9PKLyC8j-LzzC8n-O-y4AXPIALM8t-OBzzk3-OqjwCwAqgLX8xP2-Sy4+VKoTFUhVNLi6Io1Jii0C6aJNTDUk1LHTwC4-OjyQ8wgrwKE8kAsjz48r-JLzUcigtIKWc6gtTy6C5fOoLAk25L6Z7kxxJeTIkx5M4LG-CYN4KXc3Av-y9MnHM9hRKf8DELnQcQtEKJC6QqkLZCyQvkKZChQrkLFClQuUK1C8QvQKIATAs0KdC7QswL1C1QqUKjCwwpMKDCswuMLzCqaBdAgAA"
));

export default createNewAscii;
