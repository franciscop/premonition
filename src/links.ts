import $ from "./fquery";
import type { Premonition } from "./index";

// Flag the links whose page is already in the cache
export default function (this: Premonition, sel = "a"): void {
  const cached = this.cache.keys();
  $<HTMLAnchorElement>(sel).forEach((link) => {
    const href = link.href.split("#")[0]!;
    if (cached.includes(href)) {
      if (!link.hasAttribute(this.attrs.cache)) {
        link.setAttribute(this.attrs.cache, "true");
      }
    } else if (link.hasAttribute(this.attrs.cache)) {
      link.removeAttribute(this.attrs.cache);
    }
  });
}
