---
title: premonition.js
layout: home.hbs
---

# Preload App

> **Early experiment**, use at your own [high] risk.

Make your website load *very* fast. Converts your website to a Single Page Application. Or just make it faster, it's up to you. Include the script in your website to see it work:

```html
<script src="https://cdn.jsdelivr.net/npm/premonition" data-pre-once></script>
```

That's it, your website should be noticeably faster now. You can use the [Javascript API](#api) or configure it [with the options](#options). See [the troubleshooting guide](#troubleshooting) if you have any issue.

> **Experiment tip**: open [the CDN link](https://cdn.jsdelivr.net/npm/premonition), copy the JS and paste it into your website console for testing this project in a real env in ~10s. If there's any error you'll have to do this again.



## API

You now have this API available:

```js
// Parse the full current website from scratch
pre.init(OPTS);   // Note: it is called onload

// Open the passed urls or link element
pre.open(URL);

// [pre]load a link into memory for later opening
pre.load(URL);

// Replace the current page by a new url+html
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
pre.on('open', e => {});          // An HREF is going to be open (load+replace)
pre.on('replace', e => {});       // The website content is going to be updated
pre.on('fetch', e => {});         // A HREF is going to be fetched
pre.on('error', e => {});         // There is an error somewhere
pre.on('cache.get', e => {});     // When a link is read from cache
pre.on('cache.set', e => {});     // Update the cache with more HREF+HTML
pre.on('cache.remove', e => {});  // Some HTML is removed from the cache
```



## Options

There are global options and per-element options:

- Global options can be specified on the `<body>` element or when calling `pre.init({ OPTIONS })`.
- Element options should be specified in the element (e.g., `<script>`) or when calling the specific method.

When using HTML elements, they are always prefixed by `data-pre-NAME=""` (except `data-pre=""`, which is the mode).

Examples:

```html
<body data-pre="pwa">
<body data-pre="pwa" data-pre-expire="100s">
<body data-pre="pwa" data-pre-expire="100s" data-pre-elements="100">
<body data-pre="preload">
```



### `mode`

There are several modes that you can tweak within the `<body>` tag:

```html
<body data-pre="pwa">...</body>
<body data-pre="preload">...</body>
<body data-pre="spa">...</body>
<body data-pre="off">...</body>
```

These are useful depending on your type of website and desired performance boost:

- `pwa` (Progressive Web App): the most aggressive one, will load and cache all the internal pages linked from the current page for 24h. Note: still needs a `manifest.json` to actually become a PWA.
- `preload`: will fetch the link when hovering a link for significantly faster loading. Cache the pages for 100 seconds.
- `spa` (Single Page Application): will fetch the page onmousedown and load the new page in-body. Make the page seem slightly faster. Cache the pages for 10 seconds.
- `off`: will not try to load or cache anything. You can now call the different methods to hook up specific link in specific situations.

**Default mode**: In normal web usage it will use `preload`, but if it detects it's installed in a device as a PWA it will trigger the `pwa` mode. If you want tight control specify the mode manually as shown above.

> The cache is only in-memory; any page reload or the PWA getting closed will clear it.

#### Picking a mode

The mode will determine how aggressively the preload and cache is used and your users data consumption. Until you get used to the details, just don't pick a mode and let premonition.js choose for you.

Premonition *only* loads the html and scripts (see [skipping scripts](#load-once)). These normally are quite light and ~10-20 average HTML pages are the equivalent of a single image. So, if your site is fairly small, `pwa` is the recommended way to go.

If you are in the middle-ground, then `preload` is nice in that it will boost greatly page load speed while only preloading selectively those links that are hovered.

If you want a very light experience without any wasted requests for the user but still slightly faster loads, then use the `spa` mode. It has slightly better performance in mobile (300ms).

Finally, turn it off if you want to manually and selectively load links in some situations. Use this to load links only when they become visible on scrolling for example.



### `once`

Evaluate a `<script>` only once ever even if it's in the new page:

```html
<script src="..." data-pre-once></script>
```

If the script src target does not exist in the old page but exists in the new page, it will be run. If it already exists in the old page, it will be skipped.

**Add this option** for these kind of libraries since they *only define a global API* so we only want them to run once:
- jQuery.js
- moment.js
- etc.

**Do not add** to scripts that run some code against the current HTML since those will very likely need to run it with the new HTML:
- Inline scripts (will be ignored). To avoid re-rendering inline scripts, see [the option ignore](#ignore).
- prism.js: this will automatically highlight the page code snippets, so it needs to be run on every pageload.
- etc.

Compare the options for loading a script from the new page:

- `<script src="..."></script>`: run the full script after the HTML has loaded.
- `<script src="..." data-pre-once></script>`: run the script only if the `src` is not in the previous page(s).
- `<script src="..." data-pre-ignore></script>`: completely ignore the script. Will not be run at all in any case.



### `ignore`

Premonition will completely ignore a script, link, etc. with this option:

```html
<a href="/logout" data-pre-ignore></script>
<script src="..." data-pre-ignore></script>
```

This is useful for some links that you do not want preloaded or scripts that you do not want re-evaluated. Examples:

- Inline scripts that must be run only onload. We cannot prevent those from running on a full page refresh, but we can avoid re-running those.
- Links that are making a request that changes some state. We would recommend in this situation to follow the `HTTP` specification, so links only do GET requests which have no side effects. Leave side effects for `<form>`.

Compare the options for loading a script from the new page:

- `<script src="..."></script>`: run the full script after the HTML has loaded.
- `<script src="..." data-pre-once></script>`: run the script only if the `src` is not in the previous page(s).
- `<script src="..." data-pre-ignore></script>`: completely ignore the script. Will not be run at all in any case.



## Troubleshooting

**Very early experiment**, [please open an issue](https://github.com/franciscop/premonition) if you need any help.



## FAQ, credit and alternatives

### What about [Instant Click](http://instantclick.io/)?

I love it! It was the main inspiration for Premonition.js. However, it is ridden with bugs and [development seems to be stopped](https://github.com/dieulot/instantclick/) with [pull requests languishing](https://github.com/dieulot/instantclick/pulls). These bugs/lack of features were show-stoppers for me:

- No cache. This means that if you move your mouse around, the links will be fetched again and again.
- Important [race conditions](https://github.com/dieulot/instantclick/pull/85): you never know which script will finish first, which will definitely lead to bugs. I fixed this by loading the scripts sequentially.
- Plug-n-play: I would like to just drop the script into some of my projects, so I worked very hard to make this work by default. Instantclick seems to be more oriented to using the API.


### What about [Turbolinks](https://github.com/turbolinks/turbolinks)?

Another very awesome project. However, its scope seems to be a lot smaller. The similar feature with Premonition is `mode: spa`. Use Turbolinks if you want a very well tested and documented library, use Premonition if you want faster pages.


### Why do you use [Tiny-LRU](https://github.com/avoidwork/tiny-lru)?

Because it is awesome! The LRU algorithm ensures that only the most recent URLs are cached, improving the memory usage and reducing the cache misses.
