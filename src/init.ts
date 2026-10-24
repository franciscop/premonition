import $ from "./fquery";
import type { Premonition } from "./index";

export default async function (this: Premonition, links = "a"): Promise<void> {
  await new Promise<void>((resolve) => {
    // Anything past parsing is good enough: with defer, async, or an injected
    // script, DOMContentLoaded may well have fired before we got here
    if (document.readyState !== "loading") return resolve();
    document.addEventListener("DOMContentLoaded", () => resolve(), false);
  });

  // Cache the current page, but only on the first run: any later one happens
  // after a swap, when .replace() has already appended its executable copy of
  // every script to the body and the document is no longer what the server sent
  if (!this.started) {
    this.started = true;
    const href = location.href.split("#")[0]!;
    this.cache.set(href, { href, html: document.documentElement.outerHTML });
  }

  $<HTMLScriptElement>(`script[${this.attrs.once}]`).forEach((scr) => {
    this.loaded[scr.src] = true;
  });

  $<HTMLAnchorElement>(links).forEach((link) => {
    if (!this.follows(link)) return;

    // Nothing is waiting on a preload, so its failure has to be caught here
    const preload = (e: Event) =>
      this.load(e.currentTarget as HTMLAnchorElement).catch((error) =>
        this.report(error),
      );
    link.addEventListener("mouseover", preload);
    link.addEventListener("touchstart", preload);
    link.addEventListener("click", (e) => {
      e.preventDefault();
      return this.open(e.currentTarget as HTMLAnchorElement);
    });
  });
}
