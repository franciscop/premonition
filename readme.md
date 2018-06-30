# Preload App

> **Early experiment**: only basic automatic parsing and the API specified are available now.

Convert your website to a Progressive Web App with a single link. Or just make it faster, it's up to you. Include the script in your website to see it work:

```html
<script src="https://cdn.jsdelivr.net/npm/premonition"></script>
```

There are several modes, useful depending on your type of website and desired performance boost:

- PWA (Progressive Web App): will load and cache all the internal pages linked from the current page for 24h. Needs a `manifest.json` to actually become a PWA.
- Preload: will fetch the link when hovering a link for significantly faster loading. Cache the pages for 1h.
- SPA6: load the new page in-body without triggering a full reload. Make the page seem slightly faster. Cache the pages for 1 minute.
- Off: will not try to load or cache anything. You can now call the different methods to hook up.

To trigger a mode, just write the attribute `data-mode` inside the `<body>`:

```html
<body data-mode="pwa">...</body>
<body data-mode="preload">...</body>
<body data-mode="spa">...</body>
<body data-mode="off">...</body>
```

**Default**: there is no default! In normal web usage it will use `preload`, but if it detects it's installed in a device as a PWA it will trigger `pwa`. If you want tight control specify the mode manually as shown above.

Note: the cache is only in-memory; any page reload or the PWA getting closed will clear it.



## API

```js
// Automatically launch the full parser. Useful if you modify links dynamically
pre.init();

// Open one of the urls. Fallback if it's an external path
pre.open(URL);

// [pre]load a link into memory so a click later will be very fast cached
pre.load(URL);

// Replace the current, full html by a new url+html content
pre.replace('/hello', '<html>...</html>');

// Cache instance. Using tiny-lru: https://www.npmjs.com/package/tiny-lru
pre.cache = lru(100, false, 0, 100000);
pre.cache.get(HREF);
// cache.set is mostly internal; highly prefer pre.load(HREF)
pre.cache.set(HREF, { href: HREF, html: HTML });
pre.cache.expire = 1000;  // Maximum time of the page
pre.cache.clear();        // Remove all items from cache (login/logout)

// All events happen just BEFORE the actual name, so they can be prevented
// NOTE: not available yet
pre.on('ready', e => {});         // The DOM is ready to be used
pre.on('init', e => {});          // The script initialization is called
pre.on('load', e => {});          // A single URL is attempted to be preloaded
pre.on('preload', e => {});       // Alias for 'load'
pre.on('open', e => {});          // An HREF is going to be open (load+replace?)
pre.on('replace', e => {});       // The website content is going to be updated
pre.on('fetch', e => {});         // A HREF is going to be fetched
pre.on('error', e => {});         // There is an error somewhere
pre.on('cache.get', e => {});     // When a link is read from cache
pre.on('cache.set', e => {});     // Update the cache with more HREF+HTML
pre.on('cache.remove', e => {});  // Some HTML is removed from the cache
```
