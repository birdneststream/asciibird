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
  "NrDeCICMHNwLgKwBpwDNZwIwoMYAsBDAJ3nECTScAXyQhnmTQ23H2NIutowfXmdZJxyVGlG4peWXIUHDOY+hKbS2QjqLqIlfFbPVc+AFm1SWM0oGTSEQazHGOs6vBX5mzHcn9zQlxqYflR1lfG3cTLycQhVtw3UtraLD7UwF4139YoLS-I0zUnwS3AId850KM5Ijg8tzKuIL02s96ssaYuqyGnPbmztbupN7SqKK8737Q4pTxkYqhmZqewOHFweWFtrWSjYGpquzJscjVvZbZpvXjzdO+86Xtq92j6uvng8SbldeOr6efncO-0egPmwI+by6IMuLz+oJhUIe8PBQKRoxR7zRcIxc2h2IuiLx92mYMxuMhyKx5NJBKpOJpEwpZIZ1OJqLprMJWw5tPx3OZ7P2PKJgv5vJFdy54pOENFwrO0vRQsl8u+lNlytuCrVEs+AMZ9J1MsNivVupJApVsKZxu1WutdoNDr5NvtqtdVsdbs9HudTqlXt9Af9PuDCMDIctYdD+vDUcjMejLMTFs1QfjSfTKd+cdTEdzOezCczYuLcvzRfLGcrWYBlAAukgwNEeEz9M2ZW3NC36Z3xCbe4p+4tu3yB2XC1WJzXzSXq7Op-O9ZOl9O2YuZ+OV+u15uNxqF7ud-ut4fOWaj+ez0a-aXj3vL0JABGkN7np6VD9N17TfTHd70L9KX8PyAjsAPGECh2-QCwKcQAA0hg2Rnyg8CEPYYcZSQ7oRxFTCbGwlpcPbE1CK7DD0OI8i1RIvsqMoplqMHWjkKcCC1VY1tUKEQBQ0k48AGLfOQ82g5j-xEtCxLUXj+L-cShJQiTPxNF1vQLE8ZPfL85PvTTVO0pTeOU2MKwPdTFNtBTDOTbcr30iyDPsuzHK0i8dOMtSP0s28PIc5ybPM3yNNsgKzPdXSXKCsK-NCty9P8yLIXrRs8JlQBLUjont0tHTKRTHfCf2ylpctApz4pClSYvCuKKqi8rl1i6K6sqhrVxqozGtaqyBPYjKFO6rKFPghTpI-YbiuCvqct4ibCqm2berm8aFtK6b8vmtbFraPLSn4rbxh2sjNoOrCjuSijDrO46LuWpbqsk9brvu27BIejbXtKwbgtGq6npW4S3p+m72ru4LPNfUzQZM7ySpjAAGFoAGcnThvo8CRloAHs0b6ABXLHSgAFzx8YAAIiacTGA2R0pccplpCdpvpEYZ0pSeZ8Z6Z9KnxgpzmWlZ3m+gIMnZCZgXShwYXSAAS0loQZbZpx+bDLnydltA1aV2G6bV1GFdkABTDW1YAdzVw29dIc2xfGABrHzSpCRKm1IyDLrVNLzvdgq+g9t2mV9061UAA1Jvb+wOOOhoGyralrAqqqOIfc1yE-tp7E-q2rY+egHHqj375P+qOvrYwGs-zljS+s4GXprnPC7Lyuusb0zy9E+uq+zvPQ727unH276XaY9um9zhvR471vZNrrvx5H4eW6k5vgKXsbp7H+eoZBk21fl62nAAOzVw+LaEK3lZaEgT-AUXz76TWWRVkWdbVjnb5ZtWhav4+99kAATI2r43y1n0AANjvNWABbM2ACf6kAAA4fzVmAyOWd05NUzh3NBHUvLJ1QanFOJUnbh3pCHT2-te5t2IXyAOREvZkPpDQwe5D6HUIoaQRheCUGYPwZwreXCBJYLjs1bh-CF6zzERvVedc14TxXq7GRc8FESIUbtPubCnzqL4po-uQ8qE4W0QYlh+ijEEUMX7ekOj6JmL0aYkxfRLEWOsbQqxdjtpOKYY48Ry8vFSJnpI+R0jAl+KUd4-x8deEOx4SIvhMTImiM3nE2JacokCJSeDNJCTknxNwdExJeSslJIIYUiJBT8lFLKSU8ppTqlVPKUQ5xPVzH9SaZNVxBcbGrRaTNNpFcemUIac0jpYcBmtK6Z0oZ7SRndLGcMjxgypnjIWbMmiEcZmTLmaMiZvS1nbK2f04JQT14hN8Ucw5sifEBIORs2xOzELuJWZ425pAHF8hecYp5Gi+nPPuYxFxHytFfM+f8t5Ny9nfMBQC4FPytADwea86Fqi7kQpBfY6FyizmKIxeiq5pycXnOKbkmplTiWEtqSSgSAABXikBeI02Cv-BSQCyWkvJek7JEUiUsq5ak9l4TuVsoJTywVAqKn8sycyoVorJWculXUhszs4WbKWesxV0ywXV2VbszV+zVWLOuXq3VyzfmNPVZ3Q1KrjXzP1UamFJcIVFUuearV1qLW2tWaah1dr-mAEVSTRvqLleqUSYBgpRAA2pKsYNLRw2bEjX0aNAxY1hojckEN4x42hETWm5NkhU1OHTdq8FULkUIpOgWoFpqUVuOLdWottaK0lthZa959aa0trrWWyFbau0dsrT3VtPaG26IHQG91WLQnHI5RKkVMrp1TvFay+dHcqWMt4gghSZ8nrf1KrABSNKFKf2Cnu4Vi7ZULpyaesV57Z1nsnTevlF6H3Xsvbe5996n2PpPSK+pLrnVOp1U2tVHbPWjp-f+t1JqgOaOAxB0DU9IP2qg4hhDyH-nQatX+uDsGhD+rCSBjD2G-XN0zXm7NfYk0jpg7iqj+Lu1Yc7cO9tdHe1qP7UxwdfzaP4fo2x1jXHmNIsY3x9jjzOMAdRbxsTVbBOSb7dJ8D8KJPyebQx0Tpgc1RtI4OcjuHKOvuER+q9n6jOGZMy+ylq7eK62CrvUqyDgo81KkyrODmnpruClZ0qNmnoS33bxOzUr32BeM2ZoLpm33BfC2F-ToWQsRei3FjBkrv1cbuIiwkaWhQZdlFl1L56cuaNy2Z-LELCv3uK-80r8WTkyacDhlRMo6sdsa3R5r1HMV4qUy0VrNHEjEdkPmjr2K2tDZ6zxuTWX+OFtUxN4TCnxulrG9NhbQnFMzdW8tmrAmluNs6+J+bO21v7aHYtlTp2TvnZW-PPrpABuBHU3GuRgax1RcSzFyLsWXsxz069hLX2DMfYB+9oHVXAcg+Bz9z7nU3tg5hxD0HcPwd-ehwj2HSPftQ-RzgiKyXNvpby-jorBOytE-0+V01lXEtk47YIs1o2uPdfa21rLDORuM9xwRij6G6fc7U2RrNnOlWDfHWdy723jui5F+z7jEuLtS-4gADhlPfDAiuTTK-gKrtU6u4Ca6ZNr3X9J9dK8WAbvkRu1cm+N20U3Ipzda8txbxTNu+azeU7L3bUmxccclx72TXuRPPcdQ4e72mJ1PaF9V-7iOMeQ6x9HuPqOY-w7R7HsGmO0+p8hpnpOyek-x4z7nhPKPi8p8LwX-PWey+V4rznmvGdYw4997+qXpD-mt49Zo9vHau90Z71xvvUu0OC+G8LiPQe2dN9kCz0fI-I+s9Z8zx7eGefz5nyvtfE-V9z43wvjbOurfdGd3fB39vrcH5sEf9+Z-HeH-P9ES-JMT966f4bl-Zu3+24-y76-p-b834v3fpoA-orF-sfk7oASrhARrlAfvv-vfjAYdv7nNkgW7jLmgSvtdkILdsHnziRgLoBmPnXugqXkQdguXonkXiQRQeQSXnntQdXvQbXowfXnQbQZQawVQWwTQZwTwRwXwewQIdwfwUIYIQwVwdmI3llgPpPqQNIVIZ3goShqanITKCoSaIAAqkmimh+BBq6+2++h4+W+hhO+JhBh4es+xhZhy+m+phlhdh5heh9h1hiBPuwBsgduz+P+nhf+v+ABcBQBMBbhpAHhr+XhoRPh3hfhvh8B-hkBsR0B8RsB0RARiRQRQg2uLhKRyRcR2RCRuRSRkRMR+RaR4AIR7+YR5RcmzAIe-OOmXOvOWmtRYe1hRhDhNhVh4hTBnRLBohXRvBvRPRIhQxYh-RwxfRwhIxEx4xAxxBUxgxkxMxZBCxYx8x0xKxsxixQi3RGx6xBwkhkeWW2BMhQgahwcihqGSG-y2hVxlxzRum7RTh9xrRLRthbRzxTxrxLxHR9R7xPxnxHx3xw+OBjReBCaKaGmMa4JD2kJNRoJqmJRZRn+FRSJER4RURhRWRGJORWJeROJBRaJRReJCJoBV+qJlR6JBJmJlJ2J1JcuJJj+yJ3+ZJKJFJ5JhJtJ+JbJVJXJNJPJuJHJmRd2uB-WS+TxmB4ARxvxQJDxbx-xfxgJBBFhsp2eqxqpOxyxGpaxmpapSxWpepOpWxox2p6p+pJpBp0ccxZpVpup5pNOdpGSKp1phpoY+x4+WWQ+ipUuRxWWgAxqSaJ+kQrXGmrekyghmPHynhnSlSmekylfGRkxnRm6GxkAnxlJmJk2rVHCk3aaYwqh69ZQl5luDimSk77Fk5m5oimzyCl0mMlgHMlMmsksnsl8mclNncltm8kdn8ktnEm1mkmNkNnNldmtmDntmjmdnjk1n1l1kDkzlDmTkjlzljlLkTkrndnDm9lHbe5FkFlNH5mwmVl1FRllk6EZlylRnnkJmXlpnXlnmOk2lOkWmbFPm7HOnPn2m8rMGPkfnHr3lvmvkvnGkPnAX-lAWgWmkgWAUQXgXAiultHum3EdoBn-LIWmqoXwYXFKEYV3ERnKmpl3n4WurplEW3kkUKk3nkUEV4XUVxk0UplvEnlgkHnZmnlkVul76bmzn9nzlrmLncXLn8WrmCXrkLmcU8XCV8UMnTkSViUCVSVcXyWuGBHKWpEqXFFqVEkIF77VnJk-GMU4XHm7lwmB50W4W0XmX0UWVmWWU2XWVGnQVQW2kOlV4OU-kBbp5gWOXfnOWkEwXeWfnbGQVuUzoeWuU+WhRwXOEyjoUtaEYQoM6+mIWxVYV0YelJkIUpVKlWUXmUVsWmU5WEXN66UFX5VXm5VFXEUVWkUVX6X7lZlYGil2XSk6WyVCWKVyUgF9ntVtWdXSXdUiW8WtUDUyUaUclDWSW9XwmjU9nTUbmzWiVaU7aZkgmHkZpGWrUmUtG1WEHZVlWFVgaVUHXVVHXlUnX7WYZZWBV+VBXhVXVeU3UBX2VOWPWWkPW-kuXPXvW+X3XXW-U-X-XBVzo6SRX0hhnwUHEQ3sUmgxVcZg1Mhw2g2aII31EZWYVHl7WlUUXnUao7W2UlW7VY2Y1UUE3E140Y0k15UU01XrUsVMX1USnlkQl00rW01TWqXs3qUc2aVc1jXzWDV80jWJEtUC39UTXuH0mTXiWi3jU6XLW5l7k7nMUNXiLbXDaq2OFE2U1k2E1U1nWa1VWnUXUa261G1R5flvXuV-kA23VPX+VfXm1-WA13oO3W0vXvk22vWO0e3u2ELyrBlJVcZpU2qo0d6ZWD4B3h1h3HG07FXk3a2k1NVx2J063x1a3J0J342p0G0miAAhpLxHnaxdnfrXrSbTjUKSzcrczfLcZYrfTcjagcNdLSLZLR1eLV1S3T1W3X1R3Y3T3WLcERLV3QpX3cLTzTNWPXNRPQubLaWTTZXWtUrQzYXQderQ0dXRtbjenWnZnVvUXaXTHYdabYfWXcbVnXbZbR9efSFVbU7d9rbRbdfZfQ-UDU-V7W7QBbfWbXdZ-cjg3n7dhQA6lRHdHTDZHWjaHeA4A5dbvSXWfUfcdfA4bSfbHSnTA4g9jQfR+AADyLxtAfiABhpLg59I1TvaQ0nYZYvSWUgzHaPZzXQ9zfQ7zVPfzcw4LfkTpbQww1w0w4wy2Rw3vnLRWazViqvcfZg3PqIwg8g2I5PNI1I+Ixg7Iwo8Xegyo3Izfd7R-Zo55T-aFZ9Rfd9boxo+-To9o2FSY+Y-bd-WY7Bf-UAxCvXS0KAyA0jcAyHVA2AxAwZeQz46g2Q3474xnYE9vcE3vXA+o4oyQ6Ck9MXNuVnLE+E8o-vb+KI5I5DeLr3UPVLX3eNbk83Vk63QPe3QU53UU1uQHoU+kYPWU8PSU5kzU9k3U9HZNuWiI3PUvejWmWk5E8vao8k1EwE4M0E0MyEyM2E2gxE2o67VY-fW-TM57dMwYy7UY6-Ys4-YYzY1fS-RsxY-o+s8s9YCDSjek-DVoWcw424yc-ce45vf48M-c6Mw8+M3c4868886E7AxM0k4kwk8gTE0Q6VL8y8+82M588C2Cx86bfwwdtpbCzC-Cxk8067tE+7tC4i2i3E1OapoI0zQvXXQM08xC6C304k0o2SwS280S4SyS18+S705M-07s1s87dY0y8-Sy7M2s9swc2y3M0s6y-Mz7YK1o7y1yxEkc81Vc3yI4+laGa44Gec5A-Y8FAXSqxSyC9Swy6S+q1S5SzS+C1Nv80NAC0a8Q8a+a505q987Szq0favRixU+gUi+tgi5i86+U386i3C+i9626w6569AxQ-i-S9awa1qzayG3S5a3q+G2G6G5C7Gwm-G8S4myK8K6Y6Kyszs+m5Y-y5y1mzyzm3s9ywK3mwswW6W6UhK7i0hXFf8jK8HVK5K1DeDa6461iz7jI-nd2wpKq4Cya0XAO-E0Ox3ECyi8Oxa-2wNLa6m1a1G9410+05Kak0uzO8m3O43P6w3e69i-I-O3VRXeANPhI+08ez09G9TZQ4zdCRe7qxqzG+uw+-u7c0m8+4G6+2u2+3feW5s+y9+0K2WwB-s5WyW-m7+3y8B2B5m+B2K-+2m6ANWze147W1HTc4HZcy21FZh+2zu5tdq5G5+4R727xB9O9CRyOwJGOym4+-e7R3e-R-qwmSu1ezCcG7e3a6u6x4e8u5x+x7O66lu+O6fXpbx3i9x9e6UGewxaexJwre+9R1+ygxuwRyp3xzRwx-x3R4xwp0R2p0oxW1B0W8y3ByZHLSKKR4kGZy0IAI6kqwyMng5ndn4Qjnmw9nTALnAwbnfAIogAKaROcmiABOpDBwZz+9B2F0Z3+1-YZ3koh42yaA23J1Ls44lah02zGVln2z7oJ3tigUJ7h1622wGx2wVz64V9u9l57ll76zhxV37p2-a9V0V2vUIxzh6+V41+12V3l7Vyxm191x1-10tcx2x0GqJwe+vcI7XeJ6p2JxN61wu8p3p7pwt0+8t3hyJ5IHYKUJl5oF53AFt+MBZ7tyYAd04H520HtwAEwtAADyiwV3LQgAAKT3cmDXd9CAA8pC98kG96UM9xd6909195ID9+MAAJRA8YCneyDnfdB7dQ+kAw82Bw8tCI-RDI99Co-HfJDw9CBHfl37ctA7cctQ5Wd9CADxpP52qLZ6585wuZgHt5gMOfT7T7xcz5UEzwzxzzKIAECkwXfP4XgH8HkHoXEXfLsXAnaXfQCVMogAKqT+kYetuK9YdK81cDc5edsb49dbZVdLV7toqa8CN6+KZdvG-DeHss4NdDdjcld+uG8yh48dwO+b7ilSdbUyczc6+Ivz5m9zcdOzctd+-jcB8W-W-48B88csdV3B9rcvs6ce+x+LcrdafIPo+lDU+w8ncLmp+i3Z99259NP58NNY+bdZ+Z+8WF9VP-fY+l-V-l9l8SUV+lEQ-wA49N9V8l91+18N-1-jBBeiKk+lAU808mhD+ecs8SVs8Od0+c-T-j+i2T-ud0-hCPykCABRpPz6L7B1FyL4Lxm5vyF5GOL0VWh54x2nL6l9h8c5f82yr01zPZL5Vzb6r7rw-3V0-3f3b+e7l+r+-5117z7+HzXZO9TIwAl3uR3j7ydE+QfLrERnd5LcuOvvEPovSQH01XeYpUPsCV94R8Ru0AqXrJxrph8a2g2MARAOE5xtFOJveAVQKR498nAo-GgV3xz60CC+zAovhgEb7a4OBzfAnp3w77d9GBefVgZXwz4CCWBogtgfAC4Ht9IeNfPgUwPEHCCGBiLBnnlwX7edVBKg8npT0X6s8Z+ugufn3TUFYAue7PJfpUBX5CB1+AvYXkB1A478bBQvOwbYPFZ2N0OF-W-iKHP4+oFeyvXwdc1f69dv+j-J1lr0Na-9BuXvI3n1x-4hDP+Hg1QQbxf6GEABRAyAat1IFKd0hUfGAQgMAG5DUhmA6PirTgH+8ch2QpDrgMk74Cp8sAyPqUIqFTdEB1QyboQIaGtDCy7QxLs1zKFJ8NO6nbTlAIT5ZDehptRvn3xEFyCnAgAQNJuBrfGYdIJb4tB5hEwmQX0GWFKDVhpQdYWjyEHgBthxfTYeMH2HsDdhxwyQacNmFLDLhaw64VsNuFHD7hggnbJoOCHnClqeg14VgBeHjB6BiQD4fP3+GGDARTTIwYz1n6mDWey-FoFYP34b9d+ubBwXv3hHFtieh-VwV6R8H+D4umIvkNL2xHuC-BV-UrsSNt5JCpmQdN-k613xdcYhxXNIcfziGEi-+brSgaNzqGVCuhrI9buQJj6dDasvIwoT0I5H8jihyA5ofPTabsihhyfA+iQPKFVD8hbQwUUqO6EqicWeAjIVyOlF9CKBUQkYUKDGGPDZAZwuAI3xNFmijRpAc0RcIWE8C7htouYZaKEDWiFBewp0W6IdFXDPRNw20du2+GBCdhzwgRsCLCFMB-RsgX4W4BDGKC-hBgkEdGLb5j8IRE-BMdrlBEtBee1gpwY4NRE5iTOCI7MUiKrbojo6FIhkdfycY4ib+TI9LgELAyhDWmHWBsdLjpGtj8uVIvUZ71JEkjn+PYprlqPpE6iBRmQmUbqOoYpMShwomoZqJSEairsGA1UR0OVFLjFxnI7ptJzFGKiVx6ohUfKLXELidx4wNARG2oHciP2mozsYWILG5iixV4lEbkk4CPiaAxTUgE7zyasMm6JoE0SUW-EygTRctVXKUEADhpDmUAnjBCGCAsCU4B4gvjce1TIQH927qyBEJtTK0fBI9FIS0JsEjCahOdGgSWgMEqulBNkBE98x947fs4IfEliT+pY+Vt4IJFYj4hsrCscxL7HbsBxbY6kZEPHHItaRI4+sWr0+EcT+JAw4YWeLj6njtRok0cbUNQGyTze4oo9sOOEmHiCBy4o8YpKobJDJxxAnSYOI46bjJJ+kzTkOIvE8SsxN4k8KbgADMeXGyXZJMC2S+gb4xyS0BcnJAnJpQdyZIE8mHc38rfdPqyVb6Y9eSwU-ySj3CkY9IppQcYRsPpAhS3haoBKaaJlDJTwxWElYfSH-FxjQxmAsEX0EABBpDmXymfD0pQgNKalO4EihIxJwk0BVK-FVSvRVdEqZSLykigipCAlqQGIOHxTGpUUioq3wADk0U8YMlNNxhSBpEUyaX0AAB0I0pwLFOLFJQPGLjC5mtPraKt-aCrbaTcRdZsSIhLIxIftL4lcTDp5k6IZ8Pv5f9xJgw4yf0JMnSTTJRksgeePnGGT6h24uUR9I0lmTrpUk6Rl9KnEtD1JIot6XJK3E-SwZCk36eSOUmXi7p+nFJPZL4nIzPhqMz8T5IWoeSHJ2MlhpjLxkYBfJOTXYWUSGnoTfxDU6aaUGGl4MTAxEtfuhLGmVTsJTMj8cTMpmYS8J2EimUlPQng8WZjM8mULOwmIkmpuEnCY0wR58z5psgGmZzPACBTJZ5UmWRIM5Kt9tcUwemZYPthH8BJ0NKsbWPxEbT4qBs1iTWL4lXTYZe07sTbN7G2yP+NIoSfDJekST9R9092WOL+kIy4Z50t2ROKlF8jpxe40GX7J9leyXZGZQGf9NlF6SMCsckSQ9MTkeyw5Vs4eOjO6m8kiZ2vbklnNVnpymm+cvOa5JRnFy2GhMrGfjLLnwBc5MYypomPFmszeGIoRaXXMbmHCnAisuuQAAN0JKEpWeAD7l1zB5pTBCb3LHnYTh59TIQHLPFk9yJ548+WZPP7qjzsJM8-uaLIJn0h+Z8szuSPIVnoSN5Vcu0Q8KpknyySAUnWdRLlbrTTUeItUMlzrFQtr5SrNwS-LbGWzzZl0xkfhwumtSKJeYhOcnJhmMtnpgCz2anNDnAKf530kOUDPm43SxJ0c8BSArZHgzQF3veOapKDmQL0FzssBW-hrktjOShChXKXIxnlzN5cAQhWUWoUEKK5FCo+SQroWULaFFRVhWSXYXizD55Cnhtwz5Aty953C9mU3PoW8KxF49ERZQpFBLySiMimUHIpNAKK1QSipkCovpBqK+QGikUGvLrm7yp59c9eQfOYWMKEhxjZ8VfKNlbT6JKFOiVYtvm2KO0CXcscdK-lkiUFGKZsS0yIW-17Bd44zvgqgUnicFwShBTJMCU8iIZsCxoXkNwW+zQlT0kJdEqFFIL5JTQyJRvW9nhLXpCiQuY2MzmiKqFBSzhc2SYVsKcZlcv+bkoMU5zylDCnhYUpYVFKmlUigpZPUkVHy2lTIARfop5lMhelWU4WfLP6V8hhlIoUZWLP7njKfRQywZeLKmX2iZl3M9CXouXnVLBFRikWcYvqXFKalJ0hJLrOBm0SGJuI+XscpFB3zP5EvFia4u4nXK-5ni-XmYuRH+KfFlE-+Z5WQXQL4lj0n5UnM+VBLvlfyxSSgOhmxLw5ASsFRuLQWJK1amC9ce4pSVZLXZJS2pdXOaUmKS5uMtGWQozndkdl+SxpZioqXCK6lJKtFYSuxVYrKlOK7OQSo6WtKGVLSplfSr6DdKUpiRMqWssSl4lOVQiiMfhL6Awi4pLZXlX1P4HtKfhsywxZsplXyy+VRcsevirxWmLVmjsCxUxLi4arIZ9is5cktfnIdwhFs7+QCqbHGrfFlk8ia8oAVWrbxFqhJYCqAWQqEVmS9BVHMDmHKsFpAY8REqdVfLEVUMtJb6pNXur4FSSucTAuwUOr-lPq1kqUo4XortlCaslQ0oxWprE1RK0lQXJpUKriVWaqlcmrjWxrUVKa6lfmrzW5qc1maytYsNZUbK5VdahuehLZUlE259IZtfk2rV8hW1XaptYLOwntq2Z5avhZ0vEUjqJFVa2uXSvTVOzga6q05jfJWk0TF8EKB+SaAuWMTLluK9se-MEn3Ld1W6m1deLIkvK9GJ6p5YiIcrRrslUalOc6rjnvTJR0KuBUpKRW3SI5iCl1RGq9W3q-VIal9QGqKFBqY1N6spRmvJVpqC1SaodeBunWwbINYGktfBog3QbENKGpVcQqg2dr0NVSmhQUtb41Tuy6slWZOsI14ayNlCojafOTWUbz55Go+TRqCl0b6lDG5shfNA3IasNmGkjRhopVwbaVx6vYnOo3XCbpWps3cQav1VNYxNe6x2X-MPWWrT1kXeTWetVVwiL1Cmq2leuRX+qYV76sJcHMjW6SA5IMwzZ+pA1Abr1Rmp9TpvM1frQ1ZmmzY5raxVLSFZazjbxq3UuatlSGvje5spUVruNOG7zWhq41cqeNHGwLdmsi1ubotAWsLUFqo2yAB1kw40cRolnclHRiW0gCsvGlTTaN-U-LaUG7UsaMtTGhaWluGWZbCtZ8xjX0By1Rb4tDW3DR5pC0ta-Nvm2LROu8X7KhNRIzdXrK1VOBV1g2gbf1qfmyat1H8kDnaqU2KaIOfi2beeoW3zaZtQK19R+r032qrNoKuzf+tQU7bn1IKwNbpohUnaVJbqkzR6rwUYKH1Tmzbb8sdUnavN7GjrY1pi1va4tzWiLR9q61fbS1n24Le1p83A7Wt32v7SDqB2g7Xt4OqHRDs60wa4dP2hHbDpR2Q60d8O1DejqR2Y6Md2GprYDtx2haYdWO4nXkoE0JRet1YxGgurozDb51xst+UcsZ1LrqGB-a1XNq37KbFtqmiyeTs50c62dtq+7Wtos2LtbtDmv9d6qY6YLrtsuuJXdud4y75dsK8XcLse22aNduy-zb9oJ3Y68d720nXrqJ267XNAOl7YjsN2W7ddVu83ajsJ1tb7dYO63c7tt0k6Xd8ah3Ubs9026PdTu13Y7uh3u6i13uoPSipD3+7uts65acqwk1JcHFdGJxRktP4x7F1j8pOYLqPXvLM9XOlbXzoz0aaedsI3nVnoL3Ztnl3O76v7Os0S61dWmt9ads12S6f1G3avbXub3AbGhFg8AAAGocyXegALR96Wgg+hAV3t70R7DdpurrVPuR25TwtgeiPTPpx1e6-dvuhfWvot2h6td-26fVvqnWb6J9e+5VeHo3126V96+4Pavsv0X6w9V+2-Tfu30H7T9WOqjkiIOXIMUuDOuxVJt1VmyRNVOvrYkwlAmAx9Q+voCPqroD6wDpQcfUXrgPl7c9JelTWXvU3IHC2CB-nUttW2YHC9GB-PVtpr0N6Fdnq+zW3tFGt6iDhB87ckC70AAfaA9zAYNOAAA+kwdkAuZH9-G+fZ5oa1L7C19+xHXweN2H6RDz+gPU-uv0SGBDZ+n3ZIZkNH7uD8h0Q3Ibd3KHpDqhsQ+fqkOcGNDKh8Q1wee2aGhDJ+vQ5HuxyU7DZ98+PbDWk3OKxtH+tPTQ1Z1sHSA9B0fRjBcNCBWD7hvoBwfx4lb-DZglLarLloBHMBYRtehEdCNBH25IIkmTmSiPxGEBiR10WmKSNV0UjwR7jdEchGpGEjMRmtRP3SN4G1Ny2nAygbKP4GHtdejbauKiVUG5ddyuCJoid5Tbg1mAug2khAMtBYDs3UA4vpN2DGBjahnQ-obn0JbNDsh9Q2MZmNaGlDkxhQxMdMNTHRjcx3Q9MbWOzGVj+++Y8scWP46RjOxl-UMaMMnG9jwx+A+-qcNNHRt1Or-anpuPjaRtTx-esAZoMtA3DkBgo+ypgOeGe9+R3I1kbC05GijeR5I98cyOxGQjxR8bpCcKPz8YTjQuE8fMMGInAjgJqE9kbRMdGejfxiA30eH1-HejqBivegZJOIGc95Rl2jUf037bjtjennFllaP29eJNy+2cyJw5y1OjFxgk30E+PnGFjPJjY8Ybv2rGRTD+o41sf2MG7pTZu040KbFNnGNj2x4-aKclObGNTKpxQ+sdWNamljyp2UzroVPqnxTPBmU4cdVOvbX9tYCw3-sAOiaTZNOyTSnpdPOm3Tye1lN0b5NdH3j3p0RNiciMQmgzfQAAMQAnSgAABXDPjAAAEtGacAABJeM7IAAAyyZ0gHd3BN9AAAyumaECZmMjLQKM1mdKBxmSz4wJM+WacAABhPM+AAACCdZtMz4dKB+GcTfQbw18d8N-H+T5Jqk9Nrz2lHsDVRik40ahUHbiDY5u9RPjaNxs3jkgbk8Ki9OlBezupw07PqlMWntTm5+U4Kb3MCmDzBprc4YdMOmmDDvBpU4qePMHH9zR5282uevPmn7z6pvUzecPMPnnzlp7Qy+fXPL7J9cIq42WNuP2mAD5yutrHujqJ6Xj-+pNvOdqkrmfTC5j44hcxPAmAzIJhE2CcLMYn4TqJrC7N2ROEXgzoJoE2kd9O-GWz4wfE+NygOUWnAxJpE98f6NdmKL2Fki-BfGCrnhzKFt4axd5OlBqLnewk3RdkAMXuLxeykz-WXPjAxL7ZgS3iaJPt7LNXGZkyaFUtqhgBU517NJacBcWvzXBrk8hcfNxazz4xt83effMmnfz+uuU5Zf0s6mfzxp+y2Tu3NEKTzwpy845c-OuXXzT5uyz5esvCHvL+pj8-5ZCteXTznl5y5qcCt7Ko9CqDEU6cSv3HXTcepK0zogss6MGcF3i5xZ4s-G8r-p-C7CeIuYXSLdZsi+VarNxHirjFnCyiZqtVW2LZVji7pb+Ntm16Xezs-xcYPVXoTtV-HouYItMWjL8BmdDpfYP5Wu9HVwy36bGuVGhz-KCa6QBmvLWvD7Vns0pe00NHldg5kS64amujWwr5lnqXyBWWcr6paoZLUaeCsXnjLN14635YsvPXQrHlpy65dMsuXwr0V3y7ZZesRX-rP12K2qaBv3WNzMVsG8vs+tuWTrAN161ecykirz8VxjhFLlRsZWO06NrLFjccNAXoLIFyw68c2tFWkLc1koxJYF2LWkDpJgc51aOvjXyLMlxSxJbWvgA9Lj6Vm+zckuHWybNF4S0ucZttWKbWBvawLdJt8W+bfQWS3UdM1yXCrou+vSpK0vRdJbCF967NbVveXOV7N0Vb6NkE8qZQ7N9y-Dbhum3Qbt1p6ybfNuPW-rVtgK5DZssPXAb9ti27bbNsu2bbTtu299Y9vO2fb-t2G9bb9uB3fbCN4VSyRRu2HgLoFloDjceNCA47dCf5InfsPuycrBVoW2LdauyAublN4W7gb7Mjn+zKtoS7zanSc2qbgWCuyTezsHX87b6Vm9LY1tM2a7uVzO+TfmviXO7ct9uwzfFvy2O7g9wu5XbzssWB7fd2u0ICNsNbSJ7KtUARrnsG2OVMBZu04CFUbHZ7xt9U5vZnu66d772-e3FsPtdbj74N0+8vvPuELL7hPPe7fYj3X2+gD97bnfc0NP3xgb9pwB-ZIkv3TDX90gH-aEAAPwAQDkBz-Y3tgPVjoD965ypdFqh1hjeVe7IEEuDX+bPVpwMg57tIOFL+1oQBg7pvgHsHY99B4Q7QdYOcH4APB4g9IBN3WblVye-8fIeUPWbTDwW2Q6IdsPSHpAFh-3eIeMOSHqtqi-w9LvyW+Hoj9h9Q55sS3hHgjsR5w9wfM2s7bd0S0I5QcEPZHAj3h+I6EBN3P0jdlR5g64f6P8HIjrRxQ6MdUP5H6j6R-Rckct3TH3D+hw46UeGOrHqjkx3I7MeuODHlj+x+Y70et2M7yjrx8Y5keI2xlYqmrYGLgd-H17p14cpyoXu62wn+tjkkk-DspOkby9rJ-kTSdROl7OTmApyrZUwOInHcxYB+A1kwEKn5TwpzKGKd-jSnsgc67U+yf5O2nqTlpwU9acdPB1pABewBOhGHMSx3N+u2SYWujPabIz7u9TdHMi2Znxd81aLaHvjPpnUz5Z13fWdLPh7Ezkuxs+2erPR7mz+Z0XZOcpIEnjT1Wbk7rn9O6ZgzvW7wPaeZP57Fz7jVc9qldOPnjz+J506+cZPvn3Tp5784ec9PPnuF2QIAFzSGp4kWqfejSggADNIXnYWt59ypBdAvxVaL+QaC8BeoucX2L8dfSBufJAtZ4AIVQg8Of7Ojnazil9S5WeUvyXtLml3s4ZfMumXrLrZyy-ZdsvjnI9uZ1S45fcudnizgVwc95f0uuX76PbgH0InCqA+gAYNJEX8qoQIS8kDEvYn7zjF08KxfVSFXOr+5+i9xf-OtXfz418C7xeGuNXYgo16a-NdgvSAgAdNIoX+RGF4jdb6AA00l1fJPrXJr-V2a+9eYuLXlzn5wa79fJrtXkEu5+YqShPiEOz42NzG-jfRvE3cbpNwm+TdpvU3GblN1m-TfZvM3Ob-N3m8Le5vi3Bbkt0W9LcVvy3VbstzW8rc1u6wdYIAA"
));

export default createNewAscii;
