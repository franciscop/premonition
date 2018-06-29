// Update the links with the corresponding classes
export default function (sel = 'a') {
  const links = Object.keys(this.cache.cache);
  document.querySelectorAll(sel).forEach(link => {
    if (links.includes(link.href)) {
      if (link.getAttribute(this.attrs.cache)) return;
      return link.setAttribute(this.attrs.cache, true);
    } else {
      if (!link.getAttribute(this.attrs.cache)) return;
      link.removeAttribute(this.attrs.cache);
    }
  });
};
