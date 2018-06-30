import $ from './fquery';
import inject from './inject';

// Set the new content to whatever it is passed
export default function (href, html, { history = true } = {}) {
  // URL & History
  // This has to be before the DOM manipulations, otherwise the browser might
  //   think that the data is the old one
  if (history) {
    window.history.pushState({ href }, "", href);
  }

  window.scrollTo(0, 0);

  // Generate a "virtual dom" (no, not your React virtual dom)
  const dom = document.createElement("html");
  dom.innerHTML = html;

  // Body replacement
  const body = document.body;
  body.innerHTML = '';
  [...$('body', dom)[0].childNodes].forEach(node => body.appendChild(node));

  // Head replacement
  this.head(document.head, dom.querySelector('head'));

  // Recursive iteration over the scripts when they have finished loading
  const flipScript = ([current, ...scripts]) => {
    if (!current) return Promise.resolve();
    return inject(current, body, this.loaded).then(() => flipScript(scripts));
  }

  // Inject each of the scripts sequentially
  return flipScript($('script'));
};
