import validate from './validate';

// Fetch either a URL or an <a> element corresponding HTML
// TODO: script preloading (https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content#Scripting_and_preloads)
export default async function (ref = '') {
  let href = validate(ref.href || ref, 'pre.load():');

  // Remove the local url; for pre.load() we do not need it
  href = href.split('#')[0];

  // Already loading or already in cache; return the current action
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
