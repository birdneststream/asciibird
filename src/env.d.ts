/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'hack-font' {}

declare module 'hotkeys-js' {
  const hotkeys: {
    (key: string, callback: (e: KeyboardEvent) => void): void
    (key: string, scope: string, callback: (e: KeyboardEvent) => void): void
    unbind: (key?: string, scope?: string) => void
    filter: (filter: (e: KeyboardEvent) => boolean) => void
    setScope: (scope: string) => void
    deleteScope: (scope: string) => void
  }
  export default hotkeys
}
