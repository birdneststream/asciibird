/// <reference types="vite/client" />

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'vue-tailwind' {
  import { PluginObject } from 'vue'
  const VueTailwind: PluginObject<object>
  export default VueTailwind
}

declare module 'vue-tailwind/dist/t-input' {
  import Vue from 'vue'
  export default Vue
}
declare module 'vue-tailwind/dist/t-textarea' {
  import Vue from 'vue'
  export default Vue
}
declare module 'vue-tailwind/dist/t-radio' {
  import Vue from 'vue'
  export default Vue
}
declare module 'vue-tailwind/dist/t-checkbox' {
  import Vue from 'vue'
  export default Vue
}
declare module 'vue-tailwind/dist/t-button' {
  import Vue from 'vue'
  export default Vue
}
declare module 'vue-tailwind/dist/t-card' {
  import Vue from 'vue'
  export default Vue
}
declare module 'vue-tailwind/dist/t-modal' {
  import Vue from 'vue'
  export default Vue
}
declare module 'vue-tailwind/dist/t-dialog' {
  import Vue from 'vue'
  export default Vue
}
declare module 'vue-tailwind/dist/t-select' {
  import Vue from 'vue'
  export default Vue
}
declare module 'vue-tailwind/dist/t-dropdown' {
  import Vue from 'vue'
  export default Vue
}

declare module 'vue-clipboard2' {
  import { PluginObject } from 'vue'
  const VueClipboard: PluginObject<object>
  export default VueClipboard
}

declare module 'vue-toasted' {
  import { PluginObject } from 'vue'
  const Toasted: PluginObject<object>
  export default Toasted
}

declare module 'vue-draggable-resizable' {
  import Vue from 'vue'
  export default Vue
}

declare module 'vue-draggable-resizable/dist/VueDraggableResizable.css' {}

declare module 'vue-slider-component' {
  import Vue from 'vue'
  export default Vue
}

declare module 'vuex-persist' {
  export default class VuexPersistence {
    constructor(options: { storage: Storage })
    plugin: (store: any) => void
  }
}

declare module 'hack-font' {}

declare module 'hotkeys-js' {
  const hotkeys: {
    (key: string, callback: (e: KeyboardEvent) => void): void
    unbind: (key?: string) => void
    filter: (filter: (e: KeyboardEvent) => boolean) => void
  }
  export default hotkeys
}
