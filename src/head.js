const equals = (a, b) => a.outerHTML === b.outerHTML;
const exists = (stack, el) => !!stack.find(n => equals(n, el));

// # Diff the head
//
// Replace the current head for the new head. It will happen in 2 passes to avoid
// any kind of FOUC. There's an edge case where it might not work (see comments).
//
// It works in this way:
// 1. Go through the new head, insert the new elements in the right place
// 2. Remove any elements that are not in the new page
//
// While normally styles are incremental, it might blow up if the combination of
// the new styles and old styles does not work nicely together
export default function (head, updated) {
  let index = 0;
  [...updated.children].forEach((node, i) => {
    const up = node.cloneNode(true);

    const children = [...head.children];
    const partial = children.slice(index);
    if (exists(partial, up)) {
      index += partial.findIndex(n => equals(up, n));
      children[index].setAttribute(this.attrs.keep, true);
      return;
    }
    const ref = children[index];
    up.setAttribute(this.attrs.keep, true);
    ref.parentNode.insertBefore(up, ref.nextSibling);
  });
  [...head.children].forEach(node => {
    if (node.getAttribute(this.attrs.keep)) {
      node.removeAttribute(this.attrs.keep);
    } else {
      head.removeChild(node);
    }
  });
};
