// Inject the old, unevaluated script into the new document
export default (
  scr: HTMLScriptElement,
  body: HTMLElement,
  loaded: Record<string, boolean>,
): Promise<void> =>
  new Promise((resolve, reject) => {
    // If the script src="" was already loaded, no need to load it again
    if (loaded[scr.src]) return resolve();

    const script = document.createElement("script");

    // https://www.danielcrabtree.com/blog/25/gotchas-with-dynamically-adding-script-tags-to-html
    if (scr.src) {
      script.addEventListener("load", () => resolve());
      script.addEventListener("error", reject);
      script.src = scr.src;
      body.appendChild(script);
      // resolve() goes only inside addEventListener('load', resolve), not here
      return;
    }

    // Wrap the inline code in a new context to avoid globals being re-assigned
    script.appendChild(document.createTextNode(`(() => {${scr.textContent}})();`));
    body.appendChild(script);
    resolve();
  });
