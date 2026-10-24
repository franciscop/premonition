import type { Premonition } from "./index";

const equals = (a: Element, b: Element) => a.outerHTML === b.outerHTML;
const exists = (stack: Element[], el: Element) =>
  stack.some((n) => equals(n, el));

// Replace the current head with the new one in two passes, to avoid a FOUC:
// first insert what the new page adds, then drop what it no longer has.
// Styles are normally incremental, but a page whose styles only work in
// isolation can look broken during the overlap.
export default function (
  this: Premonition,
  head: Element,
  updated: Element,
): void {
  let index = 0;
  [...updated.children].forEach((node) => {
    const up = node.cloneNode(true) as Element;

    const children = [...head.children];
    const partial = children.slice(index);
    if (exists(partial, up)) {
      index += partial.findIndex((n) => equals(up, n));
      children[index]!.setAttribute(this.attrs.keep, "true");
      return;
    }
    up.setAttribute(this.attrs.keep, "true");
    const ref = children[index];
    if (ref) ref.parentNode!.insertBefore(up, ref.nextSibling);
    else head.appendChild(up);
  });

  [...head.children].forEach((node) => {
    if (node.hasAttribute(this.attrs.keep)) {
      node.removeAttribute(this.attrs.keep);
    } else {
      head.removeChild(node);
    }
  });
}
