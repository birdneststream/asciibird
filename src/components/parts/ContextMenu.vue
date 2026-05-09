<template>
  <div
    class="context-menu"
    v-show="show"
    :style="style"
    ref="context"
    tabindex="0"
    @blur="close"
  >
    <slot />
  </div>
</template>
<script>
import { nextTick } from "vue";

export default {
  name: "ContextMenu",
  props: {
    display: Boolean,
  },
  data() {
    return {
      left: 0,
      top: 0,
      show: false,
    };
  },
  computed: {
    style() {
      return {
        top: `${this.top}px`,
        left: `${this.left}px`,
      };
    },
  },
  methods: {
    close() {
      this.show = false;
      this.left = 0;
      this.top = 0;
    },
    open(evt) {
      this.left = evt.pageX || evt.clientX;
      this.top = (evt.pageY || evt.clientY) - window.pageYOffset;
      nextTick(() => this.$el.focus());
      this.show = true;
    },
  },
};
</script>
