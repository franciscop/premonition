import inject from './inject';


// Set the new content to whatever it is passed
export default function ({ href, html }) {
  // URL & History
  // This has to be before the DOM manipulations, otherwise the browser might
  //   think that the data is the old one
  history.pushState({ href }, "", href);

  // Generate a "virtual dom" (no, not your React virtual dom)
  const dom = document.createElement("html");
  dom.innerHTML = html;

  // Body replacement
  const body = document.querySelector('body')
  body.innerHTML = '';
  [...dom.querySelector('body').children].forEach(node => {
    body.appendChild(node);
  });

  // Head replacement
  this.head(document.head, dom.querySelector('head'));

  // Load scripts
  const scripts = [...document.querySelectorAll('script')];

  // Recursive iteration over the scripts when they have finished loading
  const flipScript = ([current, ...scripts]) => {
    if (!current) return Promise.resolve();
    return inject(current, body, this.loaded).then(() => flipScript(scripts));
  }

  // Reattach the links
  return flipScript(scripts);
};
