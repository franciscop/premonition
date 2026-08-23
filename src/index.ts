import Cache from "./cache";
import follows from "./follows";
import head from "./head";
import init from "./init";
import links from "./links";
import load from "./load";
import open from "./open";
import replace from "./replace";

export type Attrs = { once: string; ignore: string; keep: string; cache: string };
export type Options = { attrs?: Partial<Attrs> };

export class Premonition {
  attrs: Attrs;

  // The in-progress request Promises, keyed by href
  loader: Record<string, Promise<{ href: string; html: string }>> = {};

  // These are already executed and should not be executed again
  loaded: Record<string, boolean> = {};

  // Whether .init() already ran once for this page load
  started = false;

  // Then they go to the cache. This only stores serializable data.
  cache = new Cache(100, 10000);

  follows = follows;
  init = init;
  load = load;
  preload = load; // Alias for .load()
  open = open;
  links = links;
  head = head;
  replace = replace;
  report = (error: Error) => console.log("Error:", error);

  constructor({ attrs }: Options = {}) {
    this.attrs = {
      once: "data-pre-once",
      ignore: "data-pre-ignore",
      keep: "data-pre-keep",
      cache: "data-pre-cached",
      ...attrs,
    };

    this.cache.onchange = () => this.links();

    window.addEventListener("popstate", () => {
      this.open(location.href, { history: false });
    });

    // Initialize the calls in the current window
    this.init();
  }
}

declare global {
  interface Window {
    pre: Premonition;
  }
}

export default Premonition;
