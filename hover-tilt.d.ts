import { HoverTiltProps } from "hover-tilt";

declare class HoverTiltElement extends HTMLElement {
  /**
   * Typed props bag mirroring the web component's configurable options.
   * This is primarily for IDE intellisense when accessing the element via JS.
   */
  props?: HoverTiltProps;
}

declare global {
  interface HTMLElementTagNameMap {
    "hover-tilt": HoverTiltElement;
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "hover-tilt": HoverTiltProps & JSX.IntrinsicElements["div"];
    }
  }
}

export {};
