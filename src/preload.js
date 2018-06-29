// Fetch either a URL or an <a> element corresponding HTML
export default function (ref) {
  const href = ref.href || ref;

  // Already cached
  if (this.loader[href]) return this.loader[href];
  if (this.cache.get(href)) return Promise.resolve(this.cache.get(href));

  // Add to cache
  // console.log('Preloading:', href);
  this.loader[href] = fetch(href).then(res => res.text()).then(html => {
    this.cache.set(href, { href, html });
    this.links();
    delete this.loader[href];
    return this.cache.get(href);
  });

  this.links();
  return this.loader[href];
};
