<template>
  <div>
    <div
      id="canvas-area"
      @mouseleave="isMouseOnCanvas = false"
      @mouseenter="isMouseOnCanvas = true"
    >
      <vue-draggable-resizable
        style="z-index: 5"
        :grid="[currentAscii.blockWidth, currentAscii.blockHeight]"
        :w="canvas.width"
        :h="canvas.height"
        :draggable="$store.getters.currentTool === 0"
        @resizestop="onCanvasResize"
        @dragstop="onCavasDragStop"
        :x="currentAscii.x"
        :y="currentAscii.y"
      >
        <canvas
          ref="canvastools"
          id="canvastools"
          class="canvastools"
          :width="canvas.width"
          :height="canvas.height"
          @mousemove="canvasMouseMove"
          @mousedown="canvasMouseDown"
          @mouseup="canvasMouseUp"
        />

        <canvas
          ref="canvas"
          id="canvas"
          class="canvas"
          :width="canvas.width"
          :height="canvas.height"
          @mousemove="canvasMouseMove"
          @mousedown="canvasMouseDown"
          @mouseup="canvasMouseUp"
        />
      </vue-draggable-resizable>
    </div>
  </div>
</template>

<style>
body {
  background: #eee;
}

.canvastools {
  position: absolute;
  z-index: 100;
  opacity: 0.5;
  cursor: crosshair;
}

.canvas {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  border: lightgrey 1px solid;
  z-index: 0;
}
</style>

<script>
import { emptyBlock, toolbarIcons, mircColours99 } from '../ascii';

export default {
  name: 'Editor',
  mounted() {
    if (this.currentAsciiBlocks) {
      this.ctx = this.$refs.canvas.getContext('2d');
      this.toolCtx = this.$refs.canvastools.getContext('2d');

      this.canvas.width = this.currentAscii.width * this.currentAscii.blockWidth;
      this.canvas.height = this.currentAscii.height * this.currentAscii.blockHeight;

      this.delayRedrawCanvas();
      this.$store.commit('changeTool', 0);

      const thisIs = this;
      this.keyListener = function (e) {
        e.preventDefault();

        if (this.isTextEditing) {
          thisIs.canvasKeyDown(e.key);
          return;
        }

        const ctrlKey = e.ctrlKey || e.metaKey;

        // Ctrl Z here
        // skg - thanks for mac key suggestion, bro
        if (e.key === 'z' && ctrlKey) {
          this.undo();
        }

        // Ctrl Y here
        if (e.key === 'y' && ctrlKey) {
          // Fk it works :\
          this.redo();
        }

        // Ctrl C - copy blocks
        if (e.key === 'c' && ctrlKey) {
          if (this.selectedBlocks.length) {
            this.$store.commit('selectBlocks', this.selectedBlocks);
            this.selectedBlocks = [];
          }
        }

        // Ctrl V - paste blocks
        if (e.key === 'v' && ctrlKey) {
          if (this.haveSelectBlocks) {
            this.$store.commit('brushBlocks', this.selectBlocks);
            this.$store.commit('changeTool', 4);
          }
        }

        if (e.key === 'd' && ctrlKey) {
          this.$store.commit('toggleDebugPanel', !this.debugPanelState.visible);
        }
      };

      document.addEventListener('keydown', this.keyListener.bind(this));
    }
  },
  data: () => ({
    ctx: null,
    toolCtx: null,
    canvas: {
      width: 512,
      height: 512,
    },
    x: 0, // Ascii X and Y
    y: 0, // Ascii X and Y
    redraw: true, // Used to limit canvas redraw
    canTool: false,
    textEditing: {
      startX: null,
      startY: null,
    },
    selecting: {
      startX: null,
      startY: null,
      endX: null,
      endY: null,
      canSelect: false,
    },
    isMouseOnCanvas: false,
    selectedBlocks: [],
  }),
  computed: {
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    currentAsciiBlocks() {
      return this.$store.getters.currentAsciiBlocks;
    },
    currentTool() {
      return toolbarIcons[this.$store.getters.currentTool];
    },
    canFg() {
      return this.$store.getters.isTargettingFg;
    },
    canBg() {
      return this.$store.getters.isTargettingBg;
    },
    canText() {
      return this.$store.getters.isTargettingChar;
    },
    currentFg() {
      return this.$store.getters.currentFg;
    },
    currentBg() {
      return this.$store.getters.currentBg;
    },
    currentChar() {
      return this.$store.getters.getChar;
    },
    isTextEditing() {
      return this.currentTool.name === 'text';
    },
    isSelecting() {
      return this.currentTool.name === 'select';
    },
    isSelected() {
      return (
        this.selecting.startX
        && this.selecting.startY
        && this.selecting.endX
        && this.selecting.endY
      );
    },
    brushBlocks() {
      return this.$store.getters.brushBlocks;
    },
    canvasX() {
      return this.x * this.currentAscii.blockWidth;
    },
    canvasY() {
      return this.y * this.currentAscii.blockHeight;
    },
    toolbarState() {
      return this.$store.getters.toolbarState;
    },
    mirrorX() {
      return this.toolbarState.mirrorX;
    },
    mirrorY() {
      return this.toolbarState.mirrorY;
    },
    debugPanelState() {
      return this.$store.getters.debugPanel;
    },
    selectBlocks() {
      return this.$store.getters.selectBlocks;
    },
    options() {
      return this.$store.getters.options;
    },
    haveSelectBlocks() {
      return !!this.selectBlocks.length;
    },
    mircColours() {
      return mircColours99;
    },
  },
  watch: {
    currentAscii(val, old) {
      if (val !== old) {
        this.onCanvasResize(
          100,
          100,
          this.currentAscii.width * this.currentAscii.blockWidth,
          this.currentAscii.height * this.currentAscii.blockHeight,
        );

        this.canvas.width = this.currentAscii.width * this.currentAscii.blockWidth;
        this.canvas.height = this.currentAscii.height * this.currentAscii.blockHeight;

        this.delayRedrawCanvas();

        document.title = `asciibird - ${this.currentAscii.title}`;
      }
    },
    currentTool() {
      switch (this.currentTool.name) {
        case 'default':
          // Reset default values for tools
          this.textEditing = {
            startX: null,
            startY: null,
          };

          this.selecting = {
            startX: null,
            startY: null,
            endX: null,
            endY: null,
            canSelect: false,
          };
          break;
      }
    },
    isMouseOnCanvas() {
      if (!this.isSelecting) {
        this.clearToolCanvas();
        this.canTool = false;
      }
    },
  },
  methods: {
    undo() {
      this.$store.commit('undoBlocks');
      this.delayRedrawCanvas();
    },
    redo() {
      this.$store.commit('redoBlocks');
      this.delayRedrawCanvas();
    },
    redrawSelect() {
      if (this.currentAsciiBlocks.length) {
        this.clearToolCanvas();
        this.toolCtx.fillStyle = this.mircColours[0];

        this.toolCtx.fillRect(
          this.selecting.startX,
          this.selecting.startY,
          this.selecting.endX - this.selecting.startX,
          this.selecting.endY - this.selecting.startY,
        );

        this.toolCtx.stroke();
      }
    },
    redrawCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.currentAsciiBlocks.length) {
        const BLOCK_WIDTH = this.currentAscii.blockWidth;
        const BLOCK_HEIGHT = this.currentAscii.blockHeight;

        // Position of the meta array
        let x = 0;
        let y = 0;

        // Draws the actual rectangle
        let canvasX = 0;
        let canvasY = 0;
        let curBlock = {};

        // hack font for ascii shout outs 2 beenz
        this.ctx.font = '13px Hack';

        for (y = 0; y < this.currentAscii.height + 1; y++) {
          canvasY = BLOCK_HEIGHT * y;

          for (x = 0; x < this.currentAscii.width + 1; x++) {
            if (this.currentAsciiBlocks[y] && this.currentAsciiBlocks[y][x]) {
              curBlock = { ...this.currentAsciiBlocks[y][x] };

              canvasX = BLOCK_WIDTH * x;

              // Background block
              if (curBlock.bg !== null) {
                this.ctx.fillStyle = this.mircColours[curBlock.bg];
                this.ctx.fillRect(canvasX, canvasY, BLOCK_WIDTH, BLOCK_HEIGHT);
              }

              if (curBlock.char) {
                if (curBlock.fg !== null) {
                  this.ctx.fillStyle = this.mircColours[curBlock.fg];
                } else {
                  this.ctx.fillStyle = '#000000';
                }

                this.ctx.fillText(
                  curBlock.char,
                  canvasX + 0.5,
                  canvasY + BLOCK_HEIGHT - 3,
                );
              }
            }
          }
        }
      }

      this.ctx.stroke();
    },
    onCanvasResize(left, top, width, height) {
      const blocks = this.currentAsciiBlocks;

      const oldWidth = blocks[0].length;
      const oldHeight = blocks.length;

      const canvasBlockHeight = Math.floor(
        height / this.currentAscii.blockHeight,
      );
      const canvasBlockWidth = Math.floor(width / this.currentAscii.blockWidth);

      if (canvasBlockHeight > oldHeight || canvasBlockWidth > oldWidth) {
        // console.log({ canvasBlockHeight, oldHeight });

        for (let y = 0; y < canvasBlockHeight; y++) {
          // New row
          if (!blocks[y]) {
            blocks[y] = [];
            for (let x = 0; x < canvasBlockWidth; x++) {
              blocks[y][x] = { ...emptyBlock };
            }
          } else {
            // blocks[y]
            // no new rows but new cols
            for (let x = 0; x < canvasBlockWidth; x++) {
              if (blocks[y] && !blocks[y][x]) {
                blocks[y][x] = { ...emptyBlock };
              }
            }
          }
        }
      }

      if (canvasBlockWidth > oldWidth) {
        // console.log({ canvasBlockWidth, oldWidth });
      }

      this.canvas.width = width;
      this.canvas.height = height;

      this.$store.commit('changeAsciiWidthHeight', {
        width: canvasBlockWidth,
        height: canvasBlockHeight,
      });

      this.$store.commit('updateAsciiBlocks', blocks);
      // Restructure blocks code here
      this.delayRedrawCanvas();
    },
    onCavasDragStop(x, y) {
      // Update left and top in panel
      this.$store.commit('changeAsciiCanvasState', { x, y });
    },
    canvasKeyDown(char) {
      if (this.isTextEditing) {
        if (
          this.currentAsciiBlocks[this.textEditing.startY]
          && this.currentAsciiBlocks[this.textEditing.startY][
            this.textEditing.startX
          ]
        ) {
          let targetBlock = this.currentAsciiBlocks[this.textEditing.startY][
            this.textEditing.startX
          ];

          switch (char) {
            case 'Backspace':
              if (
                this.currentAsciiBlocks[this.textEditing.startY][
                  this.textEditing.startX - 1
                ]
              ) {
                this.textEditing.startX--;
                targetBlock.char = null;
              }
              break;

            default:
              if (char.length === 1) {
                if (this.canFg) {
                  targetBlock.fg = this.currentFg;
                }

                targetBlock.char = char;

                if (this.mirrorX) {
                  targetBlock = this.currentAsciiBlocks[this.textEditing.startY][
                    this.currentAscii.width - this.textEditing.startX
                  ];

                  if (this.canFg) {
                    targetBlock.fg = this.currentFg;
                  }

                  targetBlock.char = char;
                }

                if (this.mirrorY) {
                  targetBlock = this.currentAsciiBlocks[
                    this.currentAscii.height - this.textEditing.startY
                  ][this.textEditing.startX];

                  if (this.canFg) {
                    targetBlock.fg = this.currentFg;
                  }

                  targetBlock.char = char;
                }

                if (this.mirrorY && this.mirrorX) {
                  targetBlock = this.currentAsciiBlocks[
                    this.currentAscii.height - this.textEditing.startY
                  ][this.currentAscii.width - this.textEditing.startX];

                  if (this.canFg) {
                    targetBlock.fg = this.currentFg;
                  }

                  targetBlock.char = char;
                }

                if (
                  this.currentAsciiBlocks[this.textEditing.startY][
                    this.textEditing.startX + 1
                  ]
                ) {
                  this.textEditing.startX++;
                } else {
                  this.textEditing.startX = 0;

                  if (this.textEditing.startY < this.currentAscii.height) {
                    this.textEditing.startY++;
                  }
                }
              }

              break;
          }

          this.drawTextIndicator();
        }
        this.delayRedrawCanvas();
        this.$store.commit('updateAsciiBlocks', this.currentAsciiBlocks);
      }
    },
    // Mouse Up, Down and Move
    canvasMouseUp() {
      if (this.currentTool.name === 'default') return;

      switch (this.currentTool.name) {
        case 'brush':
          this.canTool = false;

          this.$store.commit('updateAsciiBlocks', this.currentAsciiBlocks);

          break;

        case 'eraser':
          this.canTool = false;

          this.$store.commit('updateAsciiBlocks', this.currentAsciiBlocks);
          break;

        case 'fill':
          this.canTool = false;

          this.$store.commit('updateAsciiBlocks', this.currentAsciiBlocks);
          break;

        case 'select':
          this.selecting.canSelect = false;
          this.clearToolCanvas();
          this.processSelect();
          this.redrawSelect();
          break;

        case 'text':
          this.textEditing.startX = this.x;
          this.textEditing.startY = this.y;
          break;
      }

      this.delayRedrawCanvas();
    },
    canvasMouseDown() {
      if (this.currentTool.name === 'default') return;

      this.toolCtx.clearRect(0, 0, 10000, 10000);

      if (
        this.currentAsciiBlocks[this.y]
        && this.currentAsciiBlocks[this.y][this.x]
        && this.currentTool
      ) {
        const targetBlock = this.currentAsciiBlocks[this.y][this.x];

        switch (this.currentTool.name) {
          case 'default':
            break;

          case 'select':
            this.selecting.startX = this.canvasX;
            this.selecting.startY = this.canvasY;
            this.selecting.canSelect = true;
            break;

          case 'fill':
            this.fill();
            break;

          case 'brush':
            this.canTool = true;
            this.drawBrush();
            break;

          case 'eraser':
            this.canTool = true;
            this.eraser();
            break;

          case 'dropper':
            if (this.canFg) {
              this.$store.commit('changeColourFg', targetBlock.fg);
            }

            if (this.canBg) {
              this.$store.commit('changeColourBg', targetBlock.bg);
            }

            if (this.canText) {
              this.$store.commit('changeChar', targetBlock.char);
            }

            this.$store.commit('changeTool', 0);
            break;
        }
      }
    },
    canvasMouseMove(e) {
      if (this.currentTool.name === 'default') return;

      if (e.offsetX >= 0) {
        this.x = e.offsetX;
      }

      if (e.offsetY >= 0) {
        this.y = e.offsetY;
      }

      this.x = Math.floor(this.x / this.currentAscii.blockWidth);
      this.y = Math.floor(this.y / this.currentAscii.blockHeight);

      this.$emit('coordsupdate', { x: this.x, y: this.y });

      if (
        this.currentAsciiBlocks[this.y]
        && this.currentAsciiBlocks[this.y][this.x]
      ) {
        switch (this.currentTool.name) {
          case 'brush':
            if (this.isMouseOnCanvas) {
              this.drawBrush();
            }
            break;

          case 'eraser':
            if (this.isMouseOnCanvas) {
              this.drawBrush(true);
            }
            this.eraser();
            break;

          case 'select':
            // this.drawIndicator();

            if (this.selecting.canSelect) {
              this.selecting.endX = this.canvasX;
              this.selecting.endY = this.canvasY;

              this.redrawSelect();
            }

            if (!this.isSelected) {
              this.redrawSelect();
            }

            break;

          case 'text':
            this.drawIndicator();
            break;

          case 'dropper':
            this.drawIndicator();
            break;

          case 'fill':
            this.drawIndicator();
            break;
        }
      }

      this.delayRedrawCanvas();
    },
    clearToolCanvas() {
      if (this.toolCtx) {
        this.toolCtx.clearRect(0, 0, 10000, 10000);
        this.toolCtx.stroke();
      }
    },
    delayRedrawCanvas() {
      if (this.redraw) {
        this.redraw = false;

        setTimeout(() => {
          this.redraw = true;
          this.redrawCanvas();
        }, this.options.canvasRedrawSpeed);
      }
    },
    //
    // TOOLS
    //
    processSelect() {
      //
      let x = 0;
      let y = 0;

      let curBlock = {};
      this.selectedBlocks = [];

      for (y = 0; y < this.currentAscii.height; y++) {
        if (
          y
            >= Math.floor(this.selecting.startY / this.currentAscii.blockHeight)
          && y <= Math.floor(this.selecting.endY / this.currentAscii.blockHeight)
        ) {
          if (!this.selectedBlocks[y]) {
            this.selectedBlocks[y] = [];
          }

          for (x = 0; x < this.currentAscii.width; x++) {
            if (
              x
                >= Math.floor(
                  this.selecting.startX / this.currentAscii.blockWidth,
                )
              && x
                <= Math.floor(this.selecting.endX / this.currentAscii.blockWidth)
            ) {
              if (this.currentAsciiBlocks[y] && this.currentAsciiBlocks[y][x]) {
                curBlock = { ...this.currentAsciiBlocks[y][x] };

                if (!this.selectedBlocks[y][x]) {
                  this.selectedBlocks[y][x] = { ...curBlock };
                }
              }
            }
          }
        }
      }
    },
    drawIndicator() {
      this.clearToolCanvas();

      const targetBlock = this.currentAsciiBlocks[this.y][this.x];

      let indicatorColour = targetBlock.bg === 0 ? 1 : 0;

      if (targetBlock.bg === 8) {
        indicatorColour = 1;
      }

      this.toolCtx.fillStyle = this.mircColours[indicatorColour];
      const BLOCK_WIDTH = this.currentAscii.blockWidth;
      const BLOCK_HEIGHT = this.currentAscii.blockHeight;

      this.toolCtx.fillRect(
        this.x * BLOCK_WIDTH,
        this.y * BLOCK_HEIGHT,
        BLOCK_WIDTH,
        BLOCK_HEIGHT,
      );

      if (this.isTextEditing) {
        if (this.mirrorX) {
          this.toolCtx.fillRect(
            (this.currentAscii.width - this.x) * BLOCK_WIDTH,
            this.y * BLOCK_HEIGHT,
            BLOCK_WIDTH,
            BLOCK_HEIGHT,
          );
        }

        if (this.mirrorY) {
          this.toolCtx.fillRect(
            this.x * BLOCK_WIDTH,
            (this.currentAscii.height - this.y) * BLOCK_HEIGHT,
            BLOCK_WIDTH,
            BLOCK_HEIGHT,
          );
        }

        if (this.mirrorY && this.mirrorX) {
          this.toolCtx.fillRect(
            (this.currentAscii.width - this.x) * BLOCK_WIDTH,
            (this.currentAscii.height - this.y) * BLOCK_HEIGHT,
            BLOCK_WIDTH,
            BLOCK_HEIGHT,
          );
        }
      }

      this.toolCtx.stroke();
    },
    drawTextIndicator() {
      this.clearToolCanvas();

      const targetBlock = this.currentAsciiBlocks[this.textEditing.startY][
        this.textEditing.startX
      ];

      let indicatorColour = targetBlock.bg === 0 ? 1 : 0;

      if (targetBlock.bg === 8) {
        indicatorColour = 1;
      }

      this.toolCtx.fillStyle = this.mircColours[indicatorColour];
      const BLOCK_WIDTH = this.currentAscii.blockWidth;
      const BLOCK_HEIGHT = this.currentAscii.blockHeight;

      this.toolCtx.fillRect(
        this.textEditing.startX * BLOCK_WIDTH,
        this.textEditing.startY * BLOCK_HEIGHT,
        BLOCK_WIDTH,
        BLOCK_HEIGHT,
      );

      if (this.mirrorX) {
        this.toolCtx.fillRect(
          (this.currentAscii.width - this.textEditing.startX) * BLOCK_WIDTH,
          this.textEditing.startY * BLOCK_HEIGHT,
          BLOCK_WIDTH,
          BLOCK_HEIGHT,
        );
      }

      if (this.mirrorY) {
        this.toolCtx.fillRect(
          this.textEditing.startX * BLOCK_WIDTH,
          (this.currentAscii.height - this.textEditing.startY) * BLOCK_HEIGHT,
          BLOCK_WIDTH,
          BLOCK_HEIGHT,
        );
      }

      if (this.mirrorY && this.mirrorX) {
        this.toolCtx.fillRect(
          (this.currentAscii.width - this.textEditing.startX) * BLOCK_WIDTH,
          (this.currentAscii.height - this.textEditing.startY) * BLOCK_HEIGHT,
          BLOCK_WIDTH,
          BLOCK_HEIGHT,
        );
      }

      this.toolCtx.stroke();
    },
    //
    // drawBrush
    //  - draws brush
    //  - draws preview for all toolbar things that need it
    //  - also works with the copy / paste
    drawBrush(plain = false) {
      this.clearToolCanvas();
      const BLOCK_WIDTH = this.currentAscii.blockWidth;
      const BLOCK_HEIGHT = this.currentAscii.blockHeight;

      let targetBlock = this.currentAsciiBlocks[this.y][this.x];
      let brushDiffX = 0;
      let xLength = 0;

      const asciiWidth = this.currentAscii.width;
      const asciiHeight = this.currentAscii.height;

      // If the first row isn't selected then we cannot get the width
      // with the 0 index
      for (let i = 0; i <= this.brushBlocks.length; i++) {
        if (this.brushBlocks[i]) {
          brushDiffX = Math.floor(this.brushBlocks[i].length / 2) * BLOCK_WIDTH;
          xLength = this.brushBlocks[i].length;
          break;
        }
      }

      // We always have a Y array
      const brushDiffY = Math.floor(this.brushBlocks.length / 2) * BLOCK_HEIGHT;

      for (let y = 0; y < this.brushBlocks.length; y++) {
        if (!this.brushBlocks[y]) {
          continue;
        }

        for (let x = 0; x < xLength; x++) {
          if (!this.brushBlocks[y][x]) {
            continue;
          }

          const brushBlock = this.brushBlocks[y][x];

          const brushX = this.x * BLOCK_WIDTH + x * BLOCK_WIDTH - brushDiffX;
          const brushY = this.y * BLOCK_HEIGHT + y * BLOCK_HEIGHT - brushDiffY;

          const arrayY = brushY / BLOCK_HEIGHT;
          const arrayX = brushX / BLOCK_WIDTH;

          if (
            this.currentAsciiBlocks[arrayY]
            && this.currentAsciiBlocks[arrayY][arrayX]
          ) {
            targetBlock = this.currentAsciiBlocks[arrayY][arrayX];

            if (!plain) {
              if (this.canBg) {
                this.toolCtx.fillStyle = brushBlock.bg !== null
                  ? this.mircColours[brushBlock.bg]
                  : '#FFFFFF';

                this.toolCtx.fillRect(
                  brushX,
                  brushY,
                  BLOCK_WIDTH,
                  BLOCK_HEIGHT,
                );

                if (this.mirrorX) {
                  this.toolCtx.fillRect(
                    (asciiWidth - arrayX) * BLOCK_WIDTH,
                    brushY,
                    BLOCK_WIDTH,
                    BLOCK_HEIGHT,
                  );
                }

                if (this.mirrorY) {
                  this.toolCtx.fillRect(
                    brushX,
                    (asciiHeight - arrayY) * BLOCK_HEIGHT,
                    BLOCK_WIDTH,
                    BLOCK_HEIGHT,
                  );
                }

                if (this.mirrorY && this.mirrorX) {
                  this.toolCtx.fillRect(
                    (asciiWidth - arrayX) * BLOCK_WIDTH,
                    (asciiHeight - arrayY) * BLOCK_HEIGHT,
                    BLOCK_WIDTH,
                    BLOCK_HEIGHT,
                  );
                }

                if (this.canTool && brushBlock.bg !== null) {
                  targetBlock.bg = !this.haveSelectBlocks
                    ? this.currentBg
                    : brushBlock.bg;

                  if (this.mirrorX) {
                    this.currentAsciiBlocks[arrayY][asciiWidth - arrayX].bg = !this.haveSelectBlocks
                      ? this.currentBg
                      : brushBlock.bg;
                  }

                  if (this.mirrorY) {
                    this.currentAsciiBlocks[asciiHeight - arrayY][arrayX].bg = !this.haveSelectBlocks
                      ? this.currentBg
                      : brushBlock.bg;
                  }

                  if (this.mirrorY && this.mirrorX) {
                    this.currentAsciiBlocks[asciiHeight - arrayY][
                      asciiWidth - arrayX
                    ].bg = !this.haveSelectBlocks
                      ? this.currentBg
                      : brushBlock.bg;
                  }
                }
              }

              if (this.canFg) {
                this.toolCtx.fillStyle = brushBlock.fg !== null
                  ? this.mircColours[brushBlock.fg]
                  : '#000000';

                if (this.canTool && brushBlock.fg !== null) {
                  targetBlock.fg = !this.haveSelectBlocks
                    ? this.currentFg
                    : brushBlock.fg;

                  if (this.mirrorX) {
                    this.currentAsciiBlocks[arrayY][asciiWidth - arrayX].fg = !this.haveSelectBlocks
                      ? this.currentFg
                      : brushBlock.fg;
                  }

                  if (this.mirrorY) {
                    this.currentAsciiBlocks[asciiHeight - arrayY][arrayX].fg = !this.haveSelectBlocks
                      ? this.currentFg
                      : brushBlock.fg;
                  }

                  if (this.mirrorY && this.mirrorX) {
                    this.currentAsciiBlocks[asciiHeight - arrayY][
                      asciiWidth - arrayX
                    ].fg = !this.haveSelectBlocks
                      ? this.currentFg
                      : brushBlock.fg;
                  }
                }
              }

              if (this.canText && brushBlock.char !== null) {
                this.toolCtx.fillStyle = this.mircColours[brushBlock.fg];

                this.toolCtx.fillText(
                  brushBlock.char,
                  brushX - 1,
                  brushY + BLOCK_HEIGHT - 2,
                );

                if (this.mirrorX) {
                  this.toolCtx.fillText(
                    brushBlock.char,
                    (asciiWidth - arrayX) * BLOCK_WIDTH,
                    brushY + BLOCK_HEIGHT - 2,
                  );
                }

                if (this.mirrorY) {
                  this.toolCtx.fillText(
                    brushBlock.char,
                    brushX - 1,
                    (asciiHeight - arrayY) * BLOCK_HEIGHT + 10,
                  );
                }
                if (this.mirrorY && this.mirrorX) {
                  this.toolCtx.fillText(
                    brushBlock.char,
                    (asciiWidth - arrayX) * BLOCK_WIDTH,
                    (asciiHeight - arrayY) * BLOCK_HEIGHT + 10,
                  );
                }

                if (this.canTool && brushBlock.char !== null) {
                  targetBlock.char = !this.haveSelectBlocks
                    ? this.currentChar
                    : brushBlock.char;

                  if (this.mirrorX) {
                    this.currentAsciiBlocks[arrayY][asciiWidth - arrayX].char = !this.haveSelectBlocks
                      ? this.currentChar
                      : brushBlock.char;
                  }

                  if (this.mirrorY) {
                    this.currentAsciiBlocks[asciiHeight - arrayY][arrayX].char = !this.haveSelectBlocks
                      ? this.currentChar
                      : brushBlock.char;
                  }

                  if (this.mirrorY && this.mirrorX) {
                    this.currentAsciiBlocks[asciiHeight - arrayY][
                      asciiWidth - arrayX
                    ].char = !this.haveSelectBlocks
                      ? this.currentChar
                      : brushBlock.char;
                  }
                }
              }
            } else {
              let indicatorColour = targetBlock.bg === 0 ? 1 : 0;

              if (targetBlock.bg === 8) {
                indicatorColour = 1;
              }

              this.toolCtx.fillStyle = this.mircColours[indicatorColour];

              this.toolCtx.fillRect(brushX, brushY, BLOCK_WIDTH, BLOCK_HEIGHT);

              if (this.mirrorX) {
                this.toolCtx.fillRect(
                  (asciiWidth - arrayX) * BLOCK_WIDTH,
                  brushY,
                  BLOCK_WIDTH,
                  BLOCK_HEIGHT,
                );
              }

              if (this.mirrorY) {
                this.toolCtx.fillRect(
                  brushX,
                  (asciiHeight - arrayY) * BLOCK_HEIGHT,
                  BLOCK_WIDTH,
                  BLOCK_HEIGHT,
                );
              }

              if (this.mirrorY && this.mirrorX) {
                this.toolCtx.fillRect(
                  (asciiWidth - arrayX) * BLOCK_WIDTH,
                  (asciiHeight - arrayY) * BLOCK_HEIGHT,
                  BLOCK_WIDTH,
                  BLOCK_HEIGHT,
                );
              }
            }
          }
        }
      }

      this.toolCtx.stroke();
    },
    eraser() {
      if (this.canTool) {
        const BLOCK_WIDTH = this.currentAscii.blockWidth;
        const BLOCK_HEIGHT = this.currentAscii.blockHeight;

        let targetBlock = this.currentAsciiBlocks[this.y][this.x];

        const brushDiffX = Math.floor(this.brushBlocks[0].length / 2) * BLOCK_WIDTH;
        const brushDiffY = Math.floor(this.brushBlocks.length / 2) * BLOCK_HEIGHT;

        for (let y = 0; y < this.brushBlocks.length; y++) {
          for (let x = 0; x < this.brushBlocks[0].length; x++) {
            const brushX = this.x * BLOCK_WIDTH + x * BLOCK_WIDTH - brushDiffX;
            const brushY = this.y * BLOCK_HEIGHT + y * BLOCK_HEIGHT - brushDiffY;

            const arrayY = brushY / BLOCK_HEIGHT;
            const arrayX = brushX / BLOCK_WIDTH;

            if (
              this.currentAsciiBlocks[arrayY]
              && this.currentAsciiBlocks[arrayY][arrayX]
            ) {
              targetBlock = this.currentAsciiBlocks[arrayY][arrayX];

              if (this.canFg) {
                targetBlock.fg = null;
              }

              if (this.canBg) {
                targetBlock.bg = null;
              }

              if (this.canText) {
                targetBlock.char = null;
              }
            }

            if (this.mirrorX) {
              if (
                this.currentAsciiBlocks[arrayY]
                && this.currentAsciiBlocks[arrayY][
                  this.currentAscii.width - arrayX
                ]
              ) {
                targetBlock = this.currentAsciiBlocks[arrayY][
                  this.currentAscii.width - arrayX
                ];

                if (this.canFg) {
                  targetBlock.fg = null;
                }

                if (this.canBg) {
                  targetBlock.bg = null;
                }

                if (this.canText) {
                  targetBlock.char = null;
                }
              }
            }

            if (this.mirrorY) {
              if (
                this.currentAsciiBlocks[this.currentAscii.height - arrayY]
                && this.currentAsciiBlocks[this.currentAscii.height - arrayY][
                  arrayX
                ]
              ) {
                targetBlock = this.currentAsciiBlocks[this.currentAscii.height - arrayY][
                  arrayX
                ];

                if (this.canFg) {
                  targetBlock.fg = null;
                }

                if (this.canBg) {
                  targetBlock.bg = null;
                }

                if (this.canText) {
                  targetBlock.char = null;
                }
              }
            }

            if (this.mirrorY && this.mirrorX) {
              if (
                this.currentAsciiBlocks[this.currentAscii.height - arrayY]
                && this.currentAsciiBlocks[this.currentAscii.height - arrayY][
                  this.currentAscii.width - arrayX
                ]
              ) {
                targetBlock = this.currentAsciiBlocks[this.currentAscii.height - arrayY][
                  this.currentAscii.width - arrayX
                ];

                if (this.canFg) {
                  targetBlock.fg = null;
                }

                if (this.canBg) {
                  targetBlock.bg = null;
                }

                if (this.canText) {
                  targetBlock.char = null;
                }
              }
            }
          }
        }
      }
    },
    // Fill tool
    fill() {
      const newColor = this.currentBg;
      const current = this.currentAsciiBlocks[this.y][this.x].bg;

      // If the newColor is same as the existing
      // Then return the original image.
      if (current === newColor) {
        return this.currentAsciiBlocks;
      }

      this.fillTool(this.currentAsciiBlocks, this.y, this.x, current);
    },
    fillTool(fillBlocks, y, x, current) {
      // If row is less than 0
      if (x < 0) {
        return;
      }

      // If column is less than 0
      if (y < 0) {
        return;
      }

      // If row is greater than image length
      if (x >= this.currentAscii.width) {
        return;
      }

      // If column is greater than image length
      if (y >= this.currentAscii.height) {
        return;
      }

      if (!fillBlocks[y] && !fillBlocks[y][x]) {
        return;
      }

      // If the current pixel is not which needs to be replaced
      if (fillBlocks[y][x].bg !== current) {
        return;
      }

      if (this.canBg) {
        fillBlocks[y][x].bg = this.currentBg;
      }

      if (this.canFg) {
        fillBlocks[y][x].fg = this.currentFg;
      }

      if (this.canText) {
        fillBlocks[y][x].char = this.currentChar;
      }

      // Fill in all four directions
      // Fill Prev row
      this.fillTool(fillBlocks, y, x - 1, current);

      // Fill Next row
      this.fillTool(fillBlocks, y, x + 1, current);

      // Fill Prev col
      this.fillTool(fillBlocks, y - 1, x, current);

      // Fill next col
      this.fillTool(fillBlocks, y + 1, x, current);
    },
  },
};
</script>
