# Preload App

Convert your website to a Progressive Web App with a single link. Or just make it faster, it's up to you. Include the script in your website to see it work:

```html
<script src="https://cdn.jsdelivr.net/npm/[NAME]"></script>
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

**Default**: there is no default! In normal web usage it will use `preload`, but if it detects it's installed in a device as a PWA it will trigger `pwa`. If you want consistency, specify the mode manually as shown above.

Note: the cache is only in-memory; any hard page reload or the PWA going into sleep will clear the cache.



## API

```js
// Open one of the urls. Fallback if it's an external path (use only relative!)
link.open(URL);

// [pre]load a link into memory so a click later on will already be cached
link.load(URL);

// Show a loading bar 300ms. Pass a number for the timing, or a promise to hide the bar on resolution/error. Feel free to pass `link.open(URL)` for the best performance:
link.bar(NUMBER|PROMISE|UNDEFINED);

// To never show the bar, set bar() to an empty function:
link.bar = () => {};

// Cache instance. Using tiny-lru: https://www.npmjs.com/package/tiny-lru
link.cache = lru(100, false, 100000, 100000);
link.cache.get(HREF);
link.cache.set(HREF, { href: HREF, html: HTML });
link.cache.expire = 1000;  // Maximum time of the page
link.cache.clear();        // Remove all items from cache

// All events happen just BEFORE the actual name, so they can be prevented
link.on('load', e => {});
link.on('open', e => {});
link.on('success', e => {});
link.on('error', e => {});
link.on('bar', e => {});
link.on('cache.get', e => {});
link.on('cache.set', e => {});
link.on('cache.remove', e => {});
```
