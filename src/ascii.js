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
          block.fg = 1;
          block.bg = 0;
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
  "NrDeCICMHNwLgIwFYA04BmtFoMYAsBDAJ3nAAJwBfFCGeZNTe3QkucqmqLBjHl4qQrVaPVH2bh8g9sK51E4ptimshnUfSX9VMjiO5bGO6W33yxxyafUGFvZQgFm5mxVZU3ZGw+4me1bztLfyddFx97bWtA8zcHE1jXXwSYvWSojzCvOJTogPTIkOUABmdSQCTSIvgy0OzYwGTSarhax3q9JuCarPazTotuuvL2frdWnl7SUd9x+kmR5tnEefBphSWEFbWsDa3FnuHV-aHwqeO2w+3Bi9OFrpaD26P73cvzibeXx5yrh5Of95zT4DP43AFff6NQHLYFjb5QiFghEg15PX6o8Eo+EdaGbWEzbF9XF7REfNHE-HrQlnUlA8m0mH0rGQnEMvFMuEsolsknMpGsvlkzGc-ncwV04UErk08WMyVU6V3WXs+U7alKkVC5GaiXaqWimU6uV6hUGjX6rUCo0qk1qxXPZW861Oi26q2u43u02WsXO2GUAC6KDAeSyhwyxUShXuqQKERj+RWEaMoXDzQAHB5ajlk3BM-5s0kM1m0-d86VSyDy3ac81Y0m64nK-Em09c-Xm6HU23G2Gewm+7WBwXDlVh45O5kR08x47KXazQ6-RyPTavQufYbVy7vW7fdv59dN+bd5796e1+eN3utxed9ez7eH5en0ebyfn-e34+P9+X7-QWPJcDxXO9D0A99gLA0DP3AjFbT-L8IJ-KDYJgxC4PVVCMPQ5D-2wvCkPg9ccNVUiEMIzD7XRLCaOoilcOIq9yJIyjGNohiyLYrimNfbiKN4gDBII4S6MXMSgIkyCpJQmT8LkoiOJEQNgxbQci3HKN4xBDt+yrEs9LcatBiHfTp1MoyDIs3xjL+ayFFswtozMitDJsqyNJcmtPLU7t7MjNJtN8ic3KnEL-JTcKfK7KLnOCrTbB01sIr8VyclneKTNiDKQJ4pS53Y+ieSo8TOIE-LlzyoqCqq0risKuqavK6rKuaxrWtY0Sys6ircrayTuuY-iepavqRvasahq6+raoGmb+ukwa+Omprxrm1apt66DZsW+a1t2jblq2tCdtkpahOOljNtG7aFrOvbrom26rRUkMwoSoIkvUuL3PM6KHI8n6Ab+oGdEXXNHMnLBIdC6HAaClIsIh+HEsskGEeBtL-oCuNUZij7cnewK8aJ3HPsysnCZxhtNOJ8n8bpqnIoJ9t8icswcoUAB2b6OeaHm-Oy-necqYXBb0TmsAF2K+fuaWCcl+B5cZxW4GVynVfVlZNZF9gdfF2WQS10cxZl0W5d18B9bNvXTYVu2VYdjWne1l2TYtg3zaNy3rftj2batt2ZyD9KQ6F-2-e9z3bYjx3Y+d+PXcT92o4D3249TyO3GN4Pk9zzOM+zn2w4lkvDaL6PA7z0Pq-DguE-rpPG5Tiu07Lr3W6z3wc5r5v887wvu+L2vS5H8vXopmmvsr5H0ZJuG5-pzHvNB+AYZS9fsbXlGl4XgOAD5i0Xpm8x3k-N9X0-j9Zy2b5n3t79pym74Dl+WeaZKt7gT-L5-jGsD-vPbe-gBYbw8KAr+YRlDiBSlAgBUNJDQIQWrW+7dd5K1QWPIBKDH59xSj3L+BDL5EP-hg3BA9n5oJPiQ7BND0E4NflQ3MdDqGYLwYQthFCp5cOQSw5hnCh7kMEYwrB9C+FMIkaI1hQjuYCNkTIqWcjFEKLISI9hxClGqPflI-hKiGHaPUaQ-RjNdFqJ4bDLRJjJGGNoZo4xlDlJBjetTZBukwHXyPljS+F8jE+OwX4+hATz5n1nl43xITPEr3CR4p+3CGYOOnmY3wgD6EpJPmk3MGSP52KyfcXJXkyGwI8DAyBxTXFlIsfYpu5je41LrnU0eNiY5NKri09ODcGnl2EV3eRbcpHtOqd0wevSenKL6W0qhAyW5DI6TMwZIzhljNGZY2ZCzVlLMWSs+ZGz1lbOmWs7Zez+5zP2Tsw5VTTlHNqSc45BzLkXNuWc+5LCpmPKufUm51y7lvIeV8p5PyXmTKBf04FEyQWONUvEuJpNoV7yif4iJZZEXKkOIAbwJcRooxU8dFbJMW4uxVinIOKCl2UgfkyeyDyXJJyTSvRVKFD0pcZUuB8ASmXxZd-cp-g2VGI5Ty7BK0OqPXWkKo6N0Tp3XkudESl1hrCoOqKi64qrpiqehK-a91DpKrVSq7VIrJqqv1c9eVmrFUyuVXKw1CqDV6utcaq1pqbXmp1Za21jr7VuqlQ9B1XqtXOqNeqk1vqzUKRKgG3V-q7WBp9YpC1gqnWjAnlC1xjLWV2KCaE+FgTkXWjxSigl+KiWEtiMStGYTsGps5XS2lSSGU1oMRS5lla3GlO5VypBzKKlFLbZU+NpN2Yd3iQO5pIbpWhoauG11kb3XRs9bGl1fbZ3TuDQmsda7vVzrDVGiN47Toro9cu+dk7F07vXX63dkqj3bqnRejV+6l23qDVemdp6N2Hq3S+m9Z7R1vsfTGj997X3nu-auiFzjmZWLyfWyDIJK0ZsiVlbxObfrluzTEklw70nQYSW4SteG7EtvZc2rtraO3drI6R+Bnae2wObWze5J7UpZtaRTTDqtGMbH5SO1cXGWOgeA7+kDB6-2bondejjsqJNxskzJ6TcmF2yYUxahAAAWZD9g1PofiJp1DJ9VPqZ4Dp5j7YjOId5aZ0l7KLOYZMwZ+g1nXEOeZU52BLnIFuas3ZxAHnzNef01plIPnsH+d07ZgLGm-NBfoSF4zdYot6fi2F0LcWvNSfakmut1asu1qozltN2WG3UoKzB3D2HYX5by1WyrdGCM1b0RsQ4gAnUmLXoZrhbYhtZ0iR9l3XeW9eC-1sRw8wUjc6YO75fy-y8deZN35HyJvzf+bNwF4LRufMW+8xpY3uMLa2+tvbu2umHfG0tjbc2DunYu5to7l2bvXZO-dnbhnUt2Ia7217H36ufcq29lKv2v7-cvoDoxwOBXfcKxeZBoP6HQ5PrD3M8OWsg-ByV1cUOUc4bR85rzK3RsZdyxDgnqPMvVeG6V4rmOSeE4q9TqrtP8MU-K3T4nRPKfPia0j0gnXc1PG51jnIfPIe885+wQXYMqPkYl5R-LkuZccL0eInR1jtvSJ+1kabyv9tGMVy00xtOdcq71yzx7qv9d2IN1r2xCvzc2+t3byrMWzNg6+5XAAyiL8AABbD3BAPcABt-ce4R5bAAQh7gAlh7gAXkHj3AAZD3AB7H3HuAB2dYlg2Yz152yTPc-IPz5Uwv7jKvF8gZn1xFf3t6Md5Z7XtuzH45p8b5nbPm9t9b0ztJqsGek8Z5SsrA-+-V4DmLv8HP2utY92PvCE-80C+n4vmMg29Mr-bGvusG+lfb915r47Q29Fl6Q4f9Np+T-n8qxb-fpuW-q3zDkAAzk7e-sRk-xxf3oNA7-eEeA-2YX33+Tw3uO+FCf+pAAAknvs9uFuziPgTIAACkHuiBk+ZgyB8+sQaBPOOQmB-OGBSBseKBzuauLuxBpBtOCAVeJetOR+0SpeZ+dBF+1BBGlBAOBGiWUBJurgTeneQ+fefB9Og+Py3e2SlcPeghKUlasOM+UhS+6BU+hBoushWBHWShiMNG0uVasumhGhvG6+6hGi9uZuhht+DeTBjBLeNBCK5hHelhaGDB9hRhl+phwCOQAB9cYB7AAADs-ocN4YATkCQP4a-j4U8AAG4hE5AACmERsQAAJjEXoAAPwpYwHj5wGMwAByKeChXuHu0ROR7AORwelcOAHueA0eFRRRBBchyO1hee9B5BSMCGNhDRLeHK+EmaFhGOTOteWeIBlu5M3BhGRiveAhw+Eh4hX8oxmyV8ygECx+cx6Olc0hlsKxyxqhQuC+ORaxo+m++hfW+xA2hx0WW+u+-R1+RuHeV+t2VuThdRBerRHe7R9R9xReBGTRSKrx+CzhVxPxTO1xnBHB529exhTx7BVRORWROR+RNRpAAALh7gAO5J4e6BGwnsAADWHuhR6JcOlsMJyheg6AaeeRHuCJnxDhXRXxX8thwSlch8FJZhlJLRJB5B4JZxHJoAQxdWDu0xHefJXekxv8jx8xtByif2qxGxsBWxuJOxBMM+fK7aUuPWxxq+qplx-xfxP+oJmpOp2pdxBpTJRpVJzJLxpphwDJJKZpxpLJhpJheplSAJwJtxjhrp9pdpYJL2rJjMAAgh7sAbiW-riQAK4kk5Hkm4k4mEm1EBwAAkHuAATB7iUB7gANLVHRlWGOCYaAAhpM0daSacxoAMGkzRmGJZjJTu7A5ZGGhw1ZZaxZ+ZDx3pnpqRzpB+jeTijatG7x6pexFGKp-ZBxg5RB8pUpaRMpmZih2xY5s+wu05y+vZC5w5Jxi5XWq58QpxKuM28uHpupu5+pbpvxDp3x1JCxNpBZdepAdZKGDZFZl5VZpZtZj5Tw15y8hZ7ph5e5n5B5H5v5R5+5jpbBXpZBjMAACh7qGTkWiZOeAH4YGR7k-tCdiRmbgXoAGTBZHjkfETkZhbie2CwWefQLmY2W8c2R4eAK+Q+ORZRd+NRSRVQW0QRTGWyTjlqYZNybVpxTXpuWocuWqXxXoQJTOTIfObKTOYqdRkJUucqUOTJUcVJQJopVuUCU6apWxSeQBRpd+YBceTSY8ReUzksORYAKGk0IJlZlhwpld5BlP5-52lWlf5X5jltlTldlzl2OrZiOORAASqSTkYhbibhTBdhbiQSahWYOnjkaUUhQUShZsbEEFeFaQJFbiSFTBUGelaiQhXFdKawc2YZd0UsQ7uyYbsrtwYxsMcFjyY0eubxXJSuQpRubVfFfIWJdJXLgOfVfxV1YJT1X2X1YJoNUpfxspecTce2fZTuZNQYZpe5pbL8LXkhIteBByn0XhTlcAuaaRSBR3l5WucljGBZktUdStSdbhGpbpTNdNSCbNZ5p5YVU8AAPIe7RW4mvUwWQW4lwUwVuEwURkYUok5EpUwVRlJUw6WzvVg3gDlE5G-VQ3-VQ3FEBzoVQ1w0tURUbWzkSn5VFUsWtkXUdmQrCZCYPok1AY-r7UDWU0dWyU03yVU1NWNV1V00NUM0jXs3E1DUU3c0DF8YXEqXqVTXuWubzUpEBwLVnVcSrVKmVndWy29Xy2Y0Jm-7ILK3+DkW5hq3KAa2Y3S2SWxbtX3ly1G1JYEwS2i1jWAmW1tk35uUtkHXrU5GQFA0vWA24ko3o2kBhWe3sCg0+14mVzA1Q0ZXw2Y2w7e25V6BB3+0h3+2fUwWwA5Ew2O0p0wVI2057Vp260lW80anNjlWKbHqF3ibF2fppZF3yYV1KbV1V210l2V31013Xq46lXW0E3XXBaS0UTLW4R61aFrWM0G3U0m39WK2G0D3M3ea43wBq0pRa0LzY3KCz0aH+ZaGr0aET32B+bb2tk91S1d2sTt3C1C1209E53+3p2+nZX+V+W4kI3+0BUg1h2Wyx2R1mDhFJ3P2Vwf1fXX24lf6p1Q2P3B3+m31Z1YVhm4nAMRb42C1xQF0N1l2l2AZfpc0c2k1oOc3DVYM804PoPk34OoPYPjV80kN506W3U3V43i2j0j3j0y10PD2b3QE0P0P61j3D3r1A4eDL2Xzz0uF5VL0MNcO02MOD0cPaYW1MMMPMOIJD2SOVzm2KMC2XVUNtHn0sPyOBaRY6O70aP2a6MO0KNGPaN6OGNaMwMmOWMWOaMSOmNWO2NiP2M2MGNmNuMOOuMeNT3uMuPeNeO9GObmN2P80gEINN1IOIMoPl2N110RPhNRPIPPoJORNJOpMAZpPnVk650qOUMunqNSPiNONb271BOUwLU73+MVPQFz1nyAAxpM0Pw1fIvVgLw2YIALGktDIj9NwT4uPTcjfTfjZttDsjKglTPjjMvwR9p9LlMzFDHdE1x9V1izaj0zczyzeTqzIt4zRTjjIzUzrlBzszDlmzJ9hz7DOzVtnJ2ToTnZhD0Tn6whUGohIh4y5OrzRW7zVOMxjzsGWTXzuyPBQhfzrO5yPzbzyygLs2YLHzEL0L-zoLwL7eCLzzh1BTk9IzfdG9MjgTyjqLuL0j5zXT9CjTOt9wJLqtKthLmm-dOLrDOkB9Q0mLnVAzTLvm+LxjQzTznzIL9ycLPLQLKLvzgr4L3ziLkLZ2fLSLvLYrkr4rV2crd2CrD2SrT2njvjATHlXjsr2rMrurwrMLor+r8L0rRr-Ls2rL3TFzKrpDUr-cYTsTKDOrprtrULHxQr4MLzQEmSbrIrKE3r9o-rHrXLXrnrkEgbIbwbYbobfrzQAAzB4AAJyHCABBpHG4mym2m-4Em08Km-cPG1mxm3m+mzm80Nm8oPmzkIAFGk0bHRNbZ9aL1jEzwz2L5zGLVTLLDLPqTZlW5L21GdQF7L6LLbNLrbtLnL9LDbILgpAbdbvBEb7r87vrtbkbMbK7y7C7Uba707QbG7q7u767S727i7Bre7h7c7m7E72zGL+jneR7F7Z7lSiYd7p7J7B7r7z7b78LH73757L7xTWrPr9r16Tr3LSLP7j7Pr77v7n7U70H4HExM7W7cHyHEHiHII+byg2bOQub6Hxb2HmbmHhbuHBbJbRbJH+H9wZbWAFbsQ1blHHgNHegdH+78HUxkHX7Y7TbeLdLHLXHl7PHzjfHvHZTmNtJmtlLDFu1A7AnjbIn3H47wnx1k7YHKHCHO7D7anx7HHqH6nUHOnWnsH+n97enmnxn2npnf7hnWz-jN7Gr1n6rtnjnpT17znnHVrT7qnbHaHGnXnun5nvnBnKno7Rnp73BIHsL7HVnAXZnUXwp3nJn0XlnQXFnMHyXiXqXt7nnl8GH1TX8OXjMkNCg+XlMydbgxXKwaN1Hls99WAVH8AjHZgzHbgdXcADXpATXCXcXfnsXIxkXaXXXgXmXIXGXHnmrzGgAYaRi0TdTey2TfyezczdG1zf8fTfzdLeLeYbLfCebezvDescDcxf9e9fxf+cHdJdDcpf7fHfdcuuxBWX7uWU1uPdrvPcPdPD3dLuveffvdPc-cvd-dvc5Afevtfcg8A-fdA+-eQ--fQ+A93dQ-w8w+I9w96DA-Gvg9g+w8Q-I-Y+o8I949I8E8sfDvpfcJhd6s3cXek9ZfXeDejeXc08Vp9dU9ncjfM-0-U+VLlfILc9PCFdVeVyVf1eWzQMC8Byle+AtdtfsAdene0+Hcs-y-ncc+s9XdM8nc9fq+U+w4ADtX9Ac-P45sQQvWNsQovRvegiVMd+vYxlPKvSvbPGvR3WvdP7PbvTvivLvCv9vlrLn2zWHsQeZa3AfegQfK38AIfZgYfwnkfpA0fgncAsf7A8fsnSf4AKfjjafGfarEfhw2fgzAz8WaVvg8WEd8A8WhvcA8WAe9w8WVvWA8W0dDfZ8ZfVfZ8xfCgpfzQFf3fZ8NfIIdfG3JPzL7n7v6nQx6uwjuhnT0-htvAa9s-KPoj8-6XU-a-hLi-hTK-rP6-KXjP7ASAu3OQAApEf5zzkJAGf3oNBZ12YPX87+wJf0h08K3z76kmP67x72-1hl-x-wr7rzb0ZhYkcir9C3mYBv7+1E6gDC+riGpbn94Bqvffj-zt5-9leqAx3igN-4e8LW0WG9i1xWCV98BhwE3kQKeAQDaudiUgTkH77NcX6pbS2CQMthN8c+VrRvr32Pit8i+7A3TJwLPiV9q+QJNgbXxb7cDmMHfZvhwNEGy1K+dnLFntyQHht72E-UIJv0x4r1VB6PBftB136r9huoPTQboK0F6CN+2g+QWYIZ7mCEBDvNXu-ywGYD7Bn-Bwd73QE2CA6AcPXhCVxLkCwBpAUAabz0A0DUakDYKrAIUFX9rBYQ5-hYOiFWCveaAuwY4MG44CEspTLPotzSHB88+6QrIZkKeD59a8GQ8PonxyFFDCh23ZBAIOEHHx7+bfY+MwNqE8CpBRtcQeXxEHxw9mlsQAPGkVCboVIl6EtJ+hbgLgWtzbatlv+ig+IeP1ub-sQge-EwcYKMFzDFhhg9QToJH7b9l+Ggs1qsIWGxDbBTgyYYkOcEJDjhBwjAUcMOGnCLh5wq4f-0tgeDoBb9UgAAE9si7tN4TBQl7+0TeGwOAYgMsH-CYhgIvYcgOuGuCJhNwy4ed2SGm0BmVA2IB7QoGVw-B8I6-vQMrg1dc+lcKAbQMF7oiA4OIyXviSH6VIu+VQ3TPwL75NDMMNQoQVc2vyDCZkHQ2BiyK8Z0jyhwXIEREIBFBQJ4ykGgAYFKCCjmMAAKh8BJJdMYo4UXY0lHiitGumAAMJyjZaz1aUUbShJcBdMAAcWVFG1fKaozDH6QNGHAAAKrqMwwAAtc0Z2EVHWingAACTtE5ArRxop4C6M1HyjmMAAMSdGxBVRHo2WvqIDFONdMRo4MZhndyuicgSoqMbEGdrhjDg8YiACY10z+jkx3o30T9F0xmjYxegR0bmLMAABRTMQjF0wAB1EsaQGLEFiqxlY9gOmRrH0xdMCAOseAAABsrY5ILph9GNjwA1YhMU8DDy9iuxzGJMr2JTK9ixxA4nIFOPTEyjRRnY1sVKOnHRRZRBotUQgA3H8iuSAo3cTuP3HbjDxe4w8Z2SPEHjjxF488VeLPE3jLxt468XeMfEPjnx9418U+LfEvj3xX4z8T+JPEBggAA"
));

export default createNewAscii;
