// InstaClick is so broken that I had to do this :(

import lru from 'tiny-lru';

import init from './init';
import load from './load';
import open from './open';
import links from './links';
import head from './head';
import replace from './replace';

const Premonition = function ({ attrs } = {}) {

  // Make sure we are working with the instance even for const a = Premonition()
  if (!(this instanceof Premonition)) return new Premonition({ attrs });

  // The names of the attributes
  this.attrs = Object.assign({
    once: 'data-pre-once',
    keep: 'data-pre-keep',
    cache: 'data-pre-cached'
  }, attrs);

  // Loader is the one for the current in-progress request Promises
  this.loader = {};

  // These are already executed and should not be executed again
  this.loaded = {};

  // Then they go to the cache. This only stores serializable data.
  // Args: max (items), notify (of changes), ttl, expire (10 seconds)
  this.cache = lru(100, true, 0, 10000);

  this.cache.onchange = event => this.links();

  this.init = init;
  this.load = load;
  this.preload = load;  // Alias for .load()
  this.open = open;
  this.links = links;
  this.head = head;
  this.replace = replace;
  this.report = error => console.log('Error:', error);

  window.onpopstate = e => {
    this.open(e.currentTarget.location.href, { history: false });
  };

  // Initialize the calls in the current window
  this.init();
};

export default (new Premonition());
