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
  "NrDeCICMHNwLgCwA4A04Bms4EY0GMALAQwCd5wACcAXxQhnmTU3l3ENPKtvqyYyxsOZOJRp0ofVANb5iIsT0mNpLHHM6juEholWCNC7bxXMD7eV3Em9Z2Rc2KdUu+odHry2zLfCrS3X41IUstT0D9ez8wgJcfEMdjLyDzaKcbFKjQ9OTI32ykiNcEj1jTeMN-Z3Lgypjq71r3Koy8kpbc4rqcoorm+tau-p64prTC0dSC8MmsxJmaqfmyxqXShsz85Y227onFufXBvvGF1cOO3rHplc32gc6Tm52h09vd4f3zraPH6+3jv9flc1pdZj8wQcIQ8QRcYeD7iMoYivnc9mc0Z8MR83i8ngC-qD4cj0e9Xs9AUSkd8UdjyQTYdDqZjcZS4cycRTCezUZyGQjSXigZCaYK2UzefTgQKsWT8dKSbKhVTJfKRSyuYzaXLhcTRUrxdrlTzrNQALooMDciV0tV6jX8xWs61Gw1il3urWemXOr0Gj3+v2+n2akOO-XBp2hqPhh0KiPRhOxvnxuPqlPpqWZu0crP2jP5vO5nOq3XUgDsrgADN74JWfDXA2HUwXi2XSyqzvW1I3I3Bu1he4m04WS7b2+POzqp8abdOTfO57PXQG+yO2zO3U2Yy2ix2F8va0nd2PFyug8PW-ul1u11fJwfb5e9w+b6vn6fD9vj9mJ2ej+u17ns2v6bu+yYvv+BrmpaT4QZ+cEnn+X53pBKEfshiGgY+4FIWBF7wZhuHYW+BF4ThZEkcBO5UQB95QahCHEaORGUSx+EgXqA7wEO4bcXAvHkaRnEVtWR78YJtHfoBr7UT+7EUSJQF0WhWEKcJNHqXJMkMRhHGaRuikGcp0n0ehhH6fJhkaVZJmMaxSmySpTFsdZ2lmWpbnOQ5xlOaZqnMV5-kuY5ukAjBVquXZelGbZfn2ZZOnmUJ7kBVF8UxTZSWedFFmxdlgW5Sl3mJR5hUZXlWVlelYXFd+EniWJ9VNX2DXNQ2jUdcFPlxbVUkJfl1Whcl-WZalIW+X1WklYNaXDTlFV1QNVVzfYPZHmw63fptg4bS1iY7Txe1dX2h0CcdW2nft4ZnZJeq3TNK0Tb1I3Td1pWrS9C1TUFrIRd9r2-WNR4AJwAKzXfG4OQyKINtX2cMw3qiMnYmKOXWj8OY0j1IPdtONfHjV2o+G6O7d+ZNHRTWOkzTUN07DDPI0z1KU+d1ME2cbN3azLNfNzj3jT1eQ818ItHuL36S61nMrHzXayw08ty4rNjKw00Mk1DENa7DOsY6T+vkwjRtUybqvlT9RWjZVQsfc9BU1YDhMW7oRMHa75gG-G7s3Z7a3Gx7uv3f7bjeyKvs+6HkcR9HoeO-NlvO4tNtLcD72Pv9ScAzYmvh8jpvs+bwes4XotnDHIcl-zZeg7X+PVxXod54HhvN-Xxf56X7c943Kwt2baMd0PvddzXo+t9rE+D23ffJ1bZzS4mS-hiv8ZryKG96lv1I72Lofq2rB-H3PR+n14h9eAPRcj+fujX+X-fD7bguvxnT09QnAcz1Hd9e5Psc-7fxvn7IBYcAFVzHk3MBldcZxxgfAqBKxYEuwQWgpBDQUEpzestO2s0HZDUmnQLOTsc7Z3IffZ+U90EQLgTQn+gCME2CwcgxBtDUFMK8CwzBbCGGQPYdAzhbteEgN-kI-+fC6HiOAY-Hh9DRGMIEQvZRDQ96L1DmolYmilYn2kf2XRSidFgMvpQ6eCiC5mNkWQ0hFDE42PsXYxxMiLqGOYSIqxXD3EuMkRw1xnj5EeOEQE7x5ipF+KCXo7hbjgkN0iV42J4SJGhOtjg9OuC35-QtJFJxX1bFEOsTkr+uSImJOcRTKhet4nEziTE9J788Ef0slE-xeiiltMIcUwpHT2mfRMVgPpdYDE+OwUDF+9SMlpMmWMupMyplp2mXM1OSzUkLNATU9ZpTwHDNYbUoOGztlyP2ckwRmzmklIOdEo5gSknXLKdU05VS9kPN2as+ZbzlmjKOCQrpn0ekEN+R0s5Ny66WNBgMuAAtymgoSRclpzyrkhNuVs45KiCn5LyZ09FDisU-P+Xiz+3SOngvBX8glALyX4vtmSyl+DqV0qpQy2ljKbJAruU82F5yUWHPhTyjlwKYVcsubywVcK+VsrWcKpFrLkVSseRKsVMrEVKvGSq2ZryPnGG+Ti7VmLdXSulQ-EFYDIUI3BYaqFLyxGbNJcyhpdqJnqpWe8p1GqRkpM+a61FGKbVMt9Y02KxL46EopfSv19rVWLJdVGj10b3VxpOQq-VcqrWJuTYo1Nlr00is5bKzN-CM0IoFbmwt9yC2Sodc6mNVb408C1bqn1-qWVposcaipLa9HmtLdm-larK01vngOtF9bg00sbeG3tnrB3epHaGsdFbJ1DobeOyN1a3Vrq9di4dIbbXztjQm7t4qU0HsVUW5VfZGxlgAHRnAvVSa9Kxb3snvdystr7j1JrzWEt9xbNmPqZM+mwf7EQAa8EB7oIGc1nvZe+5tX7j1Lt3ekOtCGI2Orgz+79UH5UwbAShide6N24tncutD-bF0zp3ahvt66p2brwyusj07t1hsQ4xujFGWNUYXUx0dJGj0YZwyW6DSKwPDAg+TMsAABG9RZpMPqLOJqmV790CdU1h-j6ms0iYUzJnMcmGiibSPpwDOn5M5kUyertanT02fw6u1FyGONzq4wR2jRHKN2bY+5zjnmaPkeY853zhGdX0dI35njxHWPhfYwFvj3GYu8ai8FrdiWXP2bcyFwFsHfGYds8JzT+bBPlry9h6zVmCvoYqzloruXyslY0-VrTVWVNJYy19RzsXWv+dS0FtroXqPJf6-F7zgWGPRZG3F1z3XItpa85lzrs3xvzZ62NwbTnJvpemx51bfX1vNZ2UJ0r+2X01dO2V-LjXCvnaO5dyrt3qvXYa3V57F2Xs3be09nbW3M5ZO+6Nyq0g0gAGFXyA+yAACVB90AAklD4YIPFxg8cAAQTh2kAA4mj7IAB5LHAPuio8R90AA0njhQhPZxI6ElT8gCPKfdEh0T4YsOmdpAALRk-IAAJU56ICn4oaeiAAIq8+soL8A-PrTi9J6z7IkvGTi+vOLgA6qLln9PhgADlRcABFRcAE1RdK+6HTgXMPRcABUDdG9FwAZUt6L+X4Jxc89l44K3buFAAFFReu418taXauHfJY-Ydz773XuR4j9H8Psemv3Zawng7xWPvx9T1d47QratR7jxnxba3VIdZW2FgvxeBu7YW71v7G25spZm1XiL22S8V7L8N5b9evuN5853hLHfm-V6613-75eB-57a6HlPOe09T7z+nu7c+HuZ9A0WAAPrpssa+zMb8TwvnfM-5-78X0nk7j3p8x7b3XzcRe+8j+tAgboAATV89-hhEGf49F-aQADW7-hgAEtf80gAAXQA7IUQRcT-TKSA-vIfGvJbS-bvGA3vJvW-ZAxA1AibQfNA4fC-IbKbWArAzAsfUfBvbAuAkPbLPfc-WfQ-Kg3PA-cMQzbITfAzVfdfKkFgkzHMTg5fbgugs-ego-XfZPbPaghgjA9vFAhda-a1bRcUJFBtHmQAHFJXwFCd5YBFweYAAbVQ7oAAe10OGDwEMO-xMMyh5gAHczDHAADNDugQC7D34eY39HDloeYABnawhQKw1w7IWw2cHmBwgI7oYw3wxwAgLw8gfw+Q7oAAU3gLwM2wIOIOSNIKILSMkPQNwL2xSLIMIMyJwPwM3Qn1EMEP4JoLEKENoJELOyX0g2Pyz1qIaNFSaIyIQMKKSLyOgl+1SJ7xG2UMiPUg8MGPAAiLCIUGiOtB5niPGPIE8NmNECCJiOGAAE8RjrweYABbEYlw4I4YeYvY0whY6yHmAAChGPQBGLIGOJmMOOyFuOWLcO6AAAcRiDDjj3i7jwj1iRiDjHjsgxiviJiRiHipjug-iwThgljIS0g1jjiABKBInItoxI2vVEpEyvPogo8gk-Oontao3E5o+o4Qwkkkxo0-Cosomoik8QgQukoo9IrE9onE0AGQrIhkgonmQAFFIfjjjdj-ibCrjeSgTyBLiPihTjjQiRTRBQTGQ1CcZPiBSFAAA7EE34jE1vDk5k-I7U3IxkpA-UiQ3UlE5Epk9E0vG-bIzEg0nVEo1ogk8kvEw9ek2kykl0qoyo8o1070j0qk0kh0lomk30q0zUzo+aNkjotE00m040s06Mo080lvS0rUxMkguM60hM+MkM5MsM7EnU1M3omMgsrok0jM7MqQt0ysn0r04Mqs2s6s6kp0yzAM4kls-Ez0xsok9sv0x0rs50usmswczs0s0MzVHoks9MnwaAhQJ-CA7ofku-D-cE0AxwHQuc1-FclUzc8gDQ2cac8gcAvcpc9+fc9SU86yc868S8jUnMqMsslMrMh8+83M2Mosx8l84sw08s9kj898u80cm8is3858-828wCn80CoCyCiC8CyM2ClkwszMkCvzCMhCicyqAY44jY+wkYwEpU8gRUmE7IaEuUx6eU3DOQoijC7oHg0ipw7oMU6U8AWU8ELYnYkYtcpiliqEciruPCqihQQiuitIbi74Xi2hWcpihc4S4i4U-C0QXc+S5ikYki1i5crC9i4464pioStS4YAAVxGNVOOMkrTLfOQotKgvgvzL-Osr1LzPstfKQoAsspgtcrgvcrQq-KfIQlQpsosqYpUI0uOMYqUt0p4riKMrVOOO2OCqTOZR5lor0qeKMI4rePVJuLkoEvIH4pkscHCrEu6FiqYsmLyoUFEs2B5gAHoLjNKmLiqlLsL6LHLPyHKRywLPL-KXL4q3KeqPK+qvK2rJyOqBquqRqzLnLxrELvz+qJrpDxzvLgLR1MKmKmq0gCrKruhjLVqRiAAPEYuEpigALyyrKpmsStOuStkvFLiqUoauyplIlKYqlKUtyquuov2PSpiuiqYtUoiuGDev+rSFKveq3OOMUump8qmvQsmqss6patsvhvarhtGoRoCrmqhpRoxqWuhsWugtmshpxqxr8rRu6qUqCp2u+syq0pGJeoetGJGJBqBuyG2qUohrOqGJosuuZscD+sKuGAqp3k4qUuFvpqZv5rSFZvpvZtBpImGJuvqp+qUr5s2oBsZqivBu5olr8IyspqYu0qUsFpxmktltEFFphpmsGqcstrGqxsJtrztKDKHP9I7NRuRt6uxvxqttautsxo9pJvdoJo5vAApsat1qUp8JKpUtptwvVupr1qUqSp5qEkCJGMMppuOKluDohODrWuyBluTvIHNtNvAA2p3jpuDp-1urFo1t+q+oTvppNsLtECzpLrzscCbu1scHTrroVrurquVrjuerssDu9sRrdtvg7TbW7lbUoOHLbP7IbJdp7MDKbMdqbJ9s3vHs9pQoWqGvMuWu6FDvpvboUFCvprLpxkBq7pTrIrvuapSsfuYNgp5nPuDp7qUorpLqrobuDsvpLg-vppVp3mAeNq1tVrSGvogfuKesNpHuGrtotr9qDrxvgYPtxv3tho9oxU7Unsn1dtzmnvHlnpIbD3dOdt7LJNXr7ObIIeoaodbLocYawdmoDoQeweDuPtzpGMgBGNMvptbubpOPvqfo+tEdvuGCTvaJ5l4eOOLqEc7ugccC-qEZ-rDpMqHqUpzpLpUZvqiJGNeLkaVpPtrqUsUZAc0YvtMZMeOIACYRiOdjiEAHGRjsARjnHq7g6wYRiAAZNBlhq29ei1Ke6FTuTZXB2eEJ0h8JohrmWJp+UJhe2hle5h8h+eph7stJ5em24gth9BxBkurhtukYguvR0Qfh4OwRsp4Rh+8wkRup2pxwKRpRiRtIUplpgi+upSt+kuw69Rpiipku8Wjp0QbRoR3RkZ8AYZneQxpi+R6po2iinGKpyZ8xnGUBkuaZhU6x7AnmdpneQZ1Rl++psR9hlBzBnJhhzJgc9J6hKJ+5mJxJyJx56JhVCJu5l5h5t5+JjWH5yhpJoJq5xer2rrPJgJ22yRIpoR0+ncrpqxkKg68Byi7hzxku5ppzZwpFnGHpoRwB4OiZneNRmuzOrFkuA2+mxZruDZruNZslvh-xy5s5se9G+2450mjB32l8wFgFue7Jm5vlmer549d5ypV54Vv5q+CV0xMVpFEV9tT5hV75p5j5pVmViF1hvezlkFxphQKF6pmFxY2OvugRkYol4Ovpmx3+4p449FoNMB1FoR+Z1ZkY+64Oyl2QnGV1kunFrVhl5B5lsm1lpGpl9VgNjlrez6bljJ4Fih+hnlz9esxN2N1J-lwh5V0VoV2VqVrAOVwVxV8V9N+V1VzNo1Vpbe7OMFxl-JyF0lruf+ruWZpSxty1-p1tlt9tlFpi21pZkuWlruFZ5Fku+t2hZt4O0dod8O4l3uqO41ypv1omjh1B4N6t85315do0qNlJ65pe-56N5JrJ3drdmN25g9uNvdzdjN-NrNwtvN4tq90t+94Jx9sJhVCN3yzVt98NnePVyZg18Aal2hSOuBvk01yxudh1-VkY7tst9Zge+mp1wlsDkugdu1kuAlnGcl4Ovt2hE644i14OmqhFkDox44sZhZ2tj1wNpBhdptBN5N7dpNk91Ns9o9-d5jlN6kP9bTMBLjo8Xj78fj89Xlw909jj4hktp9u9hVQTxMGTxg0OOT+MRTkUZTvUVTzj1Dr9wvD98t6jv9n9wdoRn1yZgDyRYd19wzyDiD39ijyRaDyjruYznePFnR0D6zix44qBned1iz7Z448doRgL6p3DieldsNgpi59jhj+j49gVxjuLmLtjndlj0TiTX9BTjLnjzLvRdTr4XL9g6T7L9LrLkrnLorwr0r4rsrujpj5LsTxL6VT9q-HTllvTkYnk9znGdDkuBDnGFz8Ztz0L8FnV8gezv1HmQ56pzDku-r6p-ZzT2hbDyRSbyZlbneLZtD6O9dqt4b0enUi9qL2LkTw7pL+L47ur6L2rvL8r49fLrffB1ju71gyrir6rt7qrj717z7+0894TlLk7g729gttVyT+DXT8Mlrqjpdobnb2H-10NhH9liLtdmH+HpHxdyLl83N8T59vBqT4HiTl9n71jwHs7-7jTl727m77j970o1Lo78nsn+rq7hrv75nhLlnznjn7ntNkHon69vnvHgn3H55-H8SjH9rSHrTqHzH7Vvb9H1dpriXpX1d0nuJm9nHsXh9rX0HgXwnoXvXkXlV4XnX-n7Xk34n+n07xLp7rg2nqnynmnh7q3tXrn87pny7nnxngrh3+3p3r7gPi3w303g3834PoPsPyP3XqPs33JqX5HlX8L5X8H2X+duXkNxy13r39n931nmr7Pz33Pt3734vnPkvgvhn6V-X0XiPmhrPoviv63+7wP-333771vp20vwv8vu39vvj6n-vx3wfv3mP0P6P8f2Pyfsfqfmv8Puf0f2fhfkfSttH+XtfjP9fsLxHzf3b+NshgHtn7vsv4-o-0-yvs-pvxv+vnvm-k-8-+-y-hvp-2-i-6VW33gkfgTgfr-ofn-z-oT3-gAP-6ydv+QAvvn-yN6XsQ+i-CftPzgEwCZ+xvefrAIQHwDl+8fZPq12h471tuq-DfvgK36OV3+ugYgWlxb7D9wBQLR-i-wf7X87+1A+gXQNf6H9aBLAhgcwPz7P9GBoAkAYAN4HAD5OfAwQQIKU48DhBlA-gZAKLa19EBUAmQWgLkHIDZB0gpQQoJUFL9FBoLDAYrxT4o8cBqPGjknx0FYDU+CTQXqgIsGiChBVgkQSpzEE2CJB4g8gRAOcFgDXBkg9wU4Lb6eCHBPguwdYP8G2C1O9gwIY4N8HeCIhHfCgX4OCEBDYhQQingkOu5xDEhYQ0ITENSEZDkhSQn3lEJcGRDohYPbTrBCDYGD0+hAnfnD0MHb8CBRpbHur3MFICNB6glAU0NaGaD8heQtwQUM6GFCuhHgnod0P6FeDhh4Q0YekMGEDDxh8QtITMKyG5C+hiw3ocsKGFLDVhKwqYWsM2EbCRhWw3YTsLGF7DDhBwiYdMMyGTD9h6wqvCv2qEK8jB9wmoRUNqFVDyhu-J4ZYI6HKCgeqgj4S0K+Ga95Bvw74c0OBHtC-hag0Ef8IaHV82hUIswTCM+EQiARPw2EUiOhFSDIRaI+ERiOREgjcRYIzEUCPxFwjfmGvdEdANRFEjyRgIykbSMRH94bhrwl4WnxZG4DbhlQvAe8LeHcjmRbIpkZyJ5ECjeRZQ1kSKL5Gij9Bko0oVKLa7ii5RYohUTKOwHSiVRsoxUaqIh6wRa0xCHUayV1Hai9Rhog0caP1GmijRZok0eaKtGWibRFou0daPtG2iHRzop0a6MdHuiXRxCM0GaCAA"
));

export default createNewAscii;
