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
  '»', '░', '▒', '▓', '│', '┤', 'Á', 'Â', 'À', '©', '╣', '║', '╗', '╝', '¢', '¥', '┐', '└',
  '┴', '┬', '├', '─', '┼', 'ã', 'Ã', '╚', '╔', '╩', '╦', '╠', '═', '╬', '¤', 'ð', 'Ð', 'Ê',
  'Ë', 'È', 'ı', 'Í', 'Î', 'Ï', '┘', '┌', '█', '▄', '¦', 'Ì', '▀', 'Ó', 'ß', 'Ô', 'Ò', 'õ',
  'Õ', 'µ', 'þ', 'Þ', 'Ú', 'Û', 'Ù', 'ý', 'Ý', '¯', '´', '≡', '±', '‗', '¾', '¶', '§', '÷',
  '¸', '°', '¨', '·', '¹', '³', '²',
];

// Toolbar icons
export const toolbarIcons = [{
    name: 'default',
    icon: 'mouse-pointer',
    fa: 'fas',
    svgPath: 'assets/mouse-pointer-solid.svg',
  },
  {
    name: 'select',
    icon: 'square',
    fa: 'far',
    svgPath: 'assets/square-regular.svg',
  },
  {
    name: 'text',
    icon: 'font',
    fa: 'fas',
    svgPath: 'assets/font-solid.svg',
  },
  {
    name: 'fill',
    icon: 'fill-drip',
    fa: 'fas',
    svgPath: 'assets/fill-drip-solid.svg',
  },
  {
    name: 'brush',
    icon: 'paint-brush',
    fa: 'fas',
    svgPath: 'assets/paint-brush-solid.svg',
  },
  {
    name: 'dropper',
    icon: 'eye-dropper',
    fa: 'fas',
    svgPath: 'assets/eye-dropper-solid.svg',
  },
  {
    name: 'eraser',
    icon: 'eraser',
    fa: 'fas',
    svgPath: 'assets/eraser-solid.svg',
  },
];

export const emptyBlock = {
  bg: null,
  fg: null,
  char: null,
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

export const parseMircAscii = (content, title) => {
  const MIRC_MAX_COLOURS = mircColours99.length;

  // The current state of the Colours
  let curBlock = {
    ...emptyBlock,
  };

  const contents = content;
  const filename = title;

  // set asciiImport as the entire file contents as a string
  const asciiImport = contents
    .split('\u0003\u0003')
    .join('\u0003')
    .split('\u000F').join('')
    .split('\u0003\n')
    .join('\n')
    .split('\u0002\u0003')
    .join('\u0003');

  // This will end up in the asciibirdMeta
  const finalAscii = {
    width: false, // defined in: switch (curChar) case "\n":
    height: asciiImport.split('\n').length,
    title: filename,
    key: store.getters.nextTabValue,
    blockWidth: blockWidth * store.getters.blockSizeMultiplier,
    blockHeight: blockHeight * store.getters.blockSizeMultiplier,
    blocks: create2DArray(asciiImport.split('\n').length),
    history: [],
    redo: [],
    x: blockWidth * 35, // the dragable ascii canvas x
    y: blockHeight * 2, // the dragable ascii canvas y
  };

  // Turn the entire ascii string into an array
  let asciiStringArray = asciiImport.split('');
  const linesArray = asciiImport.split('\n');

  // The proper X and Y value of the block inside the ASCII
  let asciiX = 0;
  let asciiY = 0;

  // used to determine colours
  let colourChar1 = null;
  let colourChar2 = null;
  let parsedColour = null;

  // This variable just counts the amount of colour and char codes to minus
  // to get the real width
  let widthOfColCodes = 0;

  // Better for colourful asciis
  let maxWidthLoop = 0;

  // Used before the loop, better for plain text
  let maxWidthFound = 0;

  for (let i = 0; i < linesArray.length; i++) {
    if (linesArray[i].length > maxWidthFound) {
      maxWidthFound = linesArray[i].length;
    }
  }

  while (asciiStringArray.length) {
    const curChar = asciiStringArray[0];

    // Defining a small finite state machine
    // to detect the colour code
    switch (curChar) {
      case '\n':
        // Reset the colours here on a new line
        curBlock = {
          ...emptyBlock,
        };

        if (linesArray[asciiY] && linesArray[asciiY].length > maxWidthLoop) {
          maxWidthLoop = linesArray[asciiY].length;
        }

        // the Y value of the ascii
        asciiY++;

        // Calculate widths mirc asciis vs plain text
        if (!finalAscii.width && widthOfColCodes > 0) {
          finalAscii.width = maxWidthLoop - widthOfColCodes; // minus \n for the proper width
        }

        if (!finalAscii.width && widthOfColCodes === 0) {
          // Plain text
          finalAscii.width = maxWidthFound; // minus \n for the proper width
        }

        // Resets the X value
        asciiX = 0;

        asciiStringArray.shift();
        widthOfColCodes = 0;
        break;

      case '\u0003':
        // Remove the colour char
        asciiStringArray.shift();
        widthOfColCodes++;

        // Attempt to work out bg
        colourChar1 = `${asciiStringArray[0]}`;
        colourChar2 = `${asciiStringArray[1]}`;
        parsedColour = parseInt(`${colourChar1}${colourChar2}`);

        // Work out the 01, 02 double digit codes
        if (parseInt(colourChar1) === 0 && parseInt(colourChar2) >= 0) {
          asciiStringArray.shift();
        }

        if (Number.isNaN(parsedColour)) {
          curBlock.bg = parseInt(colourChar1);
          widthOfColCodes += 1;
          asciiStringArray.shift();
        } else if (parsedColour <= MIRC_MAX_COLOURS && parsedColour >= 0) {
          curBlock.fg = parseInt(parsedColour);
          widthOfColCodes += parsedColour.toString().length;

          asciiStringArray = asciiStringArray.slice(
            parsedColour.toString().length,
            asciiStringArray.length,
          );
        }

        // No background colour
        if (asciiStringArray[0] !== ',') {
          break;
        } else {
          // Remove , from array
          widthOfColCodes += 1;
          asciiStringArray.shift();
        }

        // Attempt to work out bg
        colourChar1 = `${asciiStringArray[0]}`;
        colourChar2 = `${asciiStringArray[1]}`;
        parsedColour = parseInt(`${colourChar1}${colourChar2}`);

        if (
          !Number.isNaN(colourChar1) &&
          !Number.isNaN(colourChar2) &&
          parseInt(colourChar2) > parseInt(colourChar1) &&
          !Number.isNaN(parsedColour) &&
          parseInt(parsedColour) < 10
        ) {
          parsedColour = parseInt(colourChar2);
          widthOfColCodes += 1;
          asciiStringArray.shift();
        }

        if (
          parseInt(colourChar2) === parseInt(colourChar1) &&
          parseInt(parsedColour) < 10
        ) {
          parsedColour = parseInt(colourChar1);
          asciiStringArray.shift();
          asciiStringArray.shift();
          widthOfColCodes += 2;

          curBlock.bg = parseInt(colourChar1);

          break;
        }

        if (Number.isNaN(parsedColour)) {
          curBlock.bg = parseInt(colourChar1);
          widthOfColCodes += 1;
          asciiStringArray.shift();
        } else if (parsedColour <= MIRC_MAX_COLOURS && parsedColour >= 0) {
          curBlock.bg = parseInt(parsedColour);
          widthOfColCodes += parsedColour.toString().length;

          asciiStringArray = asciiStringArray.slice(
            parsedColour.toString().length,
            asciiStringArray.length,
          );

          break;
        }

        break;

      default:
        curBlock.char = curChar;
        asciiStringArray.shift();
        asciiX++;

        finalAscii.blocks[asciiY][asciiX - 1] = {
          ...curBlock,
        };
        break;
    } // End Switch
  } // End loop charPos

  // Store the ASCII
  finalAscii.blocks = LZString.compressToUTF16(
    JSON.stringify(finalAscii.blocks),
  );

  // We need to also store in the first undo history the original state
  finalAscii.history.push(finalAscii.blocks);

  store.commit('newAsciibirdMeta', finalAscii);

  // Update the browsers title to the ASCII filename
  document.title = `asciibird - ${store.getters.currentAscii.title}`;

  return true;
};

// Creates new blank ASCII
export const createNewAscii = (forms) => {
  const newAscii = {
    title: forms.createAscii.title,
    key: store.getters.asciibirdMeta.length,
    width: forms.createAscii.width,
    height: forms.createAscii.height,
    blockWidth: blockWidth * store.getters.blockSizeMultiplier,
    blockHeight: blockHeight * store.getters.blockSizeMultiplier,
    history: [],
    redo: [],
    x: 247, // the dragable ascii canvas x
    y: 24, // the dragable ascii canvas y
    blocks: create2DArray(forms.createAscii.height),
  };

  // Push all the default ASCII blocks
  for (let x = 0; x < newAscii.width; x++) {
    for (let y = 0; y < newAscii.height; y++) {
      newAscii.blocks[y].push({
        ...emptyBlock,
      });
    }
  }

  newAscii.blocks = LZString.compressToUTF16(JSON.stringify(newAscii.blocks));
  newAscii.history.push(newAscii.blocks);
  store.commit('newAsciibirdMeta', newAscii);
  store.commit('closeModal', 'new-ascii');

  return true;
};

// Converts ASCIIBIRD blocks to mIRC colours
export const exportMirc = () => {
  const {
    currentAscii
  } = store.getters;
  const blocks = store.getters.currentAsciiBlocks;
  const output = [];
  let curBlock = null;
  let prevBlock = {
    bg: -1,
    fg: -1
  };

  for (let y = 0; y <= blocks.length - 1; y++) {
    if (y >= currentAscii.height) {
      continue;
    }

    for (let x = 0; x <= blocks[y].length - 1; x++) {
      if (x >= currentAscii.width) {
        continue;
      }

      curBlock = blocks[y][x];

      // If we have a difference between our previous block
      // we'll put a colour codes and continue as normal
      if (curBlock.bg !== prevBlock.bg || curBlock.fg !== prevBlock.fg) {
        curBlock = {
          ...blocks[y][x]
        };
        const zeroPad = (num, places) => String(num).padStart(places, '0');
        output.push(
          `\u0003${zeroPad(
                curBlock.fg ?? store.getters.options.defaultFg,
                2,
              )},${zeroPad(curBlock.bg ?? store.getters.options.defaultBg, 2)}`,
        );
      }

      // null .chars will end up as space
      output.push(curBlock.char ?? ' ');
      prevBlock = blocks[y][x];
    }

    // We can never have a -1 colour code so we'll always
    // write one at the start of each line
    prevBlock = {
      bg: -1,
      fg: -1
    };

    // New line except for the very last line
    if (y < blocks.length - 1) {
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
    return;
  }
}

export default createNewAscii;
