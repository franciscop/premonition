// Fetch either a URL or an <a> element corresponding HTML
export default function (ref) {
  const href = ref.href || ref;

  // Already cached
  if (this.loader[href]) return this.loader[href];
  if (this.cache.get(href)) return Promise.resolve(this.cache.get(href));

  // Add to cache
  this.loader[href] = fetch(href).then(res => {
    if (!res.ok) this.report(new Error(res.statusText));
    return res.text();
  }).then(html => {
    this.cache.set(href, { href, html });
    delete this.loader[href];
    return this.cache.get(href);
  });

  return this.loader[href];
};
