
// Inject the old, unevaluated script in the new document
export default (scr, body, loaded) => new Promise((resolve, reject) => {

  // If the script src="" was already loaded, no need to load it again
  if (loaded[scr.src]) return resolve();

  // Create the main script tag
  const script = document.createElement("script");

  // External source script
  // https://www.danielcrabtree.com/blog/25/gotchas-with-dynamically-adding-script-tags-to-html
  if (scr.src) {
    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
    // Cannot wrap this unfortunately ¯\_(ツ)_/¯
    script.src = scr.src;
    body.appendChild(script);
    // resolve() goes only inside addEventListener('load', resolve), not here
    return;
  }

  // Script just has a string, which will be evaluated synchronously
  // Wrap it in a new context to avoid globals being re-assigned
  const wrapped = `(() => {${scr.innerText}})();`;
  script.appendChild(document.createTextNode(wrapped));
  body.appendChild(script);
  resolve();
});
