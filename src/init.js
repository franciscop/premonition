export default function (links = 'a') {
  document.querySelectorAll('script[data-once]').forEach(scr => this.loaded[scr.src] = true);

  document.querySelectorAll(links).forEach(link => {
    // Ignore the totally external links since they cannot be loaded anyway
    if (link.host !== location.host) return;

    link.addEventListener('mouseover', e => this.preload(e.currentTarget));
    link.addEventListener('touchstart', e => this.preload(e.currentTarget));
    link.addEventListener('click', e => {
      e.preventDefault();
      return this.open(e.currentTarget);
    });
  });

  this.links();
};
