// InstaClick is so broken that I had to do this :(

import lru from 'tiny-lru';

import init from './init';
import preload from './preload';
import open from './open';
import links from './links';
import head from './head';
import merge from './merge';

const pageLoad = new Promise((resolve) => {

  // without jQuery (doesn't work in older IEs)
  document.addEventListener('DOMContentLoaded', resolve, false);
});

const Premonition = function () {
  if (!(this instanceof Premonition)) {
    return new Premonition();
  }

  // Loader is the one for the current in-progress request Promises
  this.loader = {};

  // These are already executed and should not be executed again
  this.loaded = {};

  // Then they go to the cache. This only stores serializable data.
  this.cache = lru();

  // Cache for 100 seconds (or browser refresh)
  this.cache.expire = 10000;

  this.cache.notify = true;
  this.cache.onchange = event => {
    if (event !== 'remove' && event !== 'set') return;
    this.links();
  };

  // The names of the attributes
  this.attrs = {
    keep: 'data-pre-keep',
    cache: 'data-pre-cached'
  };

  window.onpopstate = e => load(e.currentTarget.location.href);

  this.preload = preload;
  this.open = open;
  this.links = links;
  this.head = head;
  this.merge = merge;
  this.init = init;

  // This needs to be here so that any script loaded a posteriori is also added
  pageLoad.then(() => {

    this.cache.set(window.location.href, {
      href: window.location.href,
      html: document.querySelector('html').outerHTML
    });

    this.init();
  });
};

export default (new Premonition());
