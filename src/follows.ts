import type { Premonition } from "./index";

// Should this link be preloaded and opened in-page? Anything that is not a
// plain, same-tab navigation to this site is left alone for the browser to
// handle, since swapping the body is the wrong answer for all of them.
export default function (this: Premonition, link: HTMLAnchorElement): boolean {
  // Explicitly opted out
  if (link.hasAttribute(this.attrs.ignore)) return false;

  const href = link.getAttribute("href");
  if (!href) return false;

  // A bare fragment moves within the current page; it is not a page load.
  // Intercepting it drops the fragment, so :target never matches and every
  // CSS-driven overlay, dialog and anchor on the page stops working.
  if (href[0] === "#") return false;

  // Another site: its HTML could not be swapped into ours anyway
  if (link.host !== location.host) return false;

  // Opening elsewhere is not this page's navigation
  const target = link.getAttribute("target");
  if (target && target !== "_self") return false;

  // Downloads, and schemes like mailto: or tel:, belong to the browser
  if (link.hasAttribute("download")) return false;
  if (link.protocol && !/^https?:$/.test(link.protocol)) return false;

  return true;
}
