import $ from "./fquery";
import type { Premonition } from "./index";
import inject from "./inject";

// Set the new content to whatever it is passed
export default function (
  this: Premonition,
  href: string,
  html: string,
  { history = true }: { history?: boolean } = {},
): Promise<void> {
  // This has to be before the DOM manipulations, otherwise the browser might
  // think that the data is the old one
  if (history) {
    window.history.pushState({ href }, "", href);
  }

  const doc = new DOMParser().parseFromString(html, "text/html");

  // Body replacement
  const body = document.body;
  body.replaceChildren(...doc.body.childNodes);

  // Head replacement
  this.head(document.head, doc.head);

  // Land on the anchor when the new URL names one, the way a real navigation
  // would. Only after the swap, since the target lives in the new document.
  const hash = href.split("#").slice(1).join("#");
  const anchor = hash ? document.getElementById(hash) : null;
  if (anchor) anchor.scrollIntoView();
  else window.scrollTo(0, 0);

  // Recursive iteration over the scripts when they have finished loading
  const flipScript = ([
    current,
    ...scripts
  ]: HTMLScriptElement[]): Promise<void> => {
    if (!current) return Promise.resolve();
    return inject(current, body, this.loaded).then(() => flipScript(scripts));
  };

  // Inject each of the scripts sequentially, skipping the opted-out ones
  const scripts = $<HTMLScriptElement>("script").filter(
    (s) => !s.hasAttribute(this.attrs.ignore),
  );
  return flipScript(scripts);
}
