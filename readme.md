# premonition [![npm install premonition](https://img.shields.io/badge/npm%20install-premonition-blue.svg)](https://www.npmjs.com/package/premonition) [![test badge](https://github.com/franciscop/premonition/workflows/tests/badge.svg "test badge")](https://github.com/franciscop/premonition/actions) [![gzip size](https://img.badgesize.io/franciscop/premonition/master/index.min.js.svg?label=gzip&logo=&compression=gzip)](https://github.com/franciscop/premonition/blob/master/index.min.js) [![dependencies](https://img.shields.io/badge/dependencies-0-limegreen.svg)](https://github.com/franciscop/premonition/blob/master/package.json)

Make your website load instantly: links are fetched when the user hovers them, and opening one swaps the page in place instead of doing a full reload.

```html
<script src="https://cdn.jsdelivr.net/npm/premonition"></script>
```

That is the whole setup. Every same-site link on the page is now preloaded on hover and opened without a page reload.

> **Early experiment**, use at your own [high] risk.

## Getting started

Load it from a CDN, which needs no build step and no configuration:

```html
<script src="https://cdn.jsdelivr.net/npm/premonition"></script>
```

Or install it and import it, which does the same setup and defines the same `pre` global:

```bash
npm install premonition
```

```js
import 'premonition';
```

Either way there is nothing to call: premonition hooks up the page as soon as it loads.

## Usage

Premonition attaches itself to every `<a>` on the page that points to the same site, and then:

1. On `mouseover` or `touchstart`, it fetches the target page and keeps the HTML in memory.
2. On `click`, it swaps the current `<body>` and `<head>` for the new ones and pushes the URL to the history, so the back button keeps working.

It leaves these link types alone, because swapping the body would break things: other hosts, `target="_blank"`, `download`, schemes like `mailto:` or `tel:`, bare `#fragment` links, and anything marked with `data-pre-ignore`.

The cache holds the 100 most recent pages for 10 seconds each, in memory only: a real page reload clears it.

Three attributes change what premonition does with a given element, and they are how you fix a script or a link that misbehaves across page swaps.

### `once`

Evaluate a `<script>` only once, even when it is also in the new page:

```html
<script src="..." data-pre-once></script>
```

If the script `src` is not in the old page but is in the new one, it runs. If it already ran, it is skipped.

**Add this option** to libraries that only define a global API, since they should only run once:

- jQuery.js
- moment.js
- etc.

**Do not add it** to scripts that run against the current HTML, since those need to run again with the new HTML:

- prism.js: it highlights the code snippets on the page, so it needs to run on every page load.
- etc.

### `ignore`

Premonition will completely ignore the element:

```html
<a href="/logout" data-pre-ignore>Log out</a>
<script src="..." data-pre-ignore></script>
```

Useful for links you do not want preloaded, and for scripts you do not want re-evaluated. Inline scripts that must only run on a real page load are the common case: we cannot stop them on a full refresh, but we can avoid re-running them here.

For links that change state, we would recommend following the HTTP specification instead, so that links only make GET requests with no side effects, and side effects live in a `<form>`.

Comparing the three ways a script from the new page can be treated:

- `<script src="..."></script>`: run it after the new HTML is in place.
- `<script src="..." data-pre-once></script>`: run it only if the `src` did not run before.
- `<script src="..." data-pre-ignore></script>`: never run it.

### `cached`

Premonition sets `data-pre-cached` on the links whose page is currently in the cache, and removes it when it is not. It is written by the library, not by you, and it is there so you can style preloaded links:

```css
a[data-pre-cached] { border-bottom: 1px solid green; }
```

## Javascript API

> **You do not need any of this.** The script tag sets everything up on its own.
> The calls below are for the few things it cannot do for you: clearing the cache when
> someone logs in or out, hooking up links that your own Javascript added after the
> page loaded, and sending errors somewhere other than the console.

Loading it as a `<script>` exposes the instance as the `pre` global:

```js
// Parse the current page and hook up its links. Called automatically onload
pre.init(SELECTOR); // default: 'a'

// Open a url or <a> element, loading it first if it is not cached yet
pre.open(URL);

// Preload a url or <a> element into memory for a later .open()
pre.load(URL);
pre.preload(URL); // Alias for .load()

// Replace the current page with a new url + html
pre.replace('/hello', '<html>...</html>');

// Update the data-pre-cached attributes. Called automatically on cache changes
pre.links(SELECTOR); // default: 'a'

// Called with any error that happens along the way; overwrite it to report them
pre.report = error => console.log('Error:', error);
```

The cache is a small LRU store that you can read and clear directly:

```js
pre.cache.get(HREF);      // Returns { href, html } or undefined
pre.cache.set(HREF, { href: HREF, html: HTML });  // Prefer pre.load(HREF)
pre.cache.keys();         // The hrefs currently cached
pre.cache.clear();        // Remove all items from cache (login/logout)
pre.cache.max = 100;      // Maximum number of pages kept
pre.cache.ttl = 10000;    // Milliseconds before a page is considered stale
```

## Demo

There is a small site under `demo/` to try it by hand. Its pages are served with an
artificial delay, so the difference between a cold click and a preloaded one is easy to see:

```bash
npm run build && npm run demo   # http://localhost:3200/demo/
```

## FAQ

### What about [InstantClick](http://instantclick.io/)?

I love it, it was the main inspiration for Premonition. However it is ridden with bugs and [development seems to be stopped](https://github.com/dieulot/instantclick/), with [pull requests languishing](https://github.com/dieulot/instantclick/pulls). These were show-stoppers for me:

- No cache: moving the mouse around fetches the same links again and again.
- Important [race conditions](https://github.com/dieulot/instantclick/pull/85): you never know which script finishes first, which leads to bugs. Premonition loads the scripts sequentially.
- Plug and play: I wanted to drop the script into a project and have it work by default, while InstantClick is more oriented towards using its API.

### What about [Turbolinks](https://github.com/turbolinks/turbolinks)?

Another very nice project, with a smaller scope: it swaps pages on click, while Premonition also preloads them on hover.
