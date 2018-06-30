import $ from './fquery';

export default async function (links = 'a') {

  await new Promise((resolve) => {
    if (document.readyState === "complete") return resolve();
    // without jQuery (doesn't work in older IEs)
    document.addEventListener('DOMContentLoaded', resolve, false);
  });

  // Load the current page
  this.cache.set(window.location.href, {
    href: window.location.href,
    html: $('html')[0].outerHTML
  });

  $(`script[${this.attrs.once}]`).forEach(scr => this.loaded[scr.src] = true);

  $(links).forEach(link => {
    // Ignore the totally external links since they cannot be loaded anyway
    if (link.host !== location.host) return;

    link.addEventListener('mouseover', e => this.load(e.currentTarget));
    link.addEventListener('touchstart', e => this.load(e.currentTarget));
    link.addEventListener('click', e => {
      e.preventDefault();
      return this.open(e.currentTarget);
    });
  });
};
