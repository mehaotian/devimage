/// <reference types="vitepress/client" />

/** Vite define 注入，见 .vitepress/config.ts */
declare const __API_BASE__: string;

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
