import type { Premonition } from "./index";
import validate from "./validate";

// Load either a URL or an <a> element referenced HTML into the body
export default async function (
  this: Premonition,
  ref: string | HTMLAnchorElement,
  { history }: { history?: boolean } = {},
): Promise<void> {
  // Declared outside the try so the fallback below can still reach it
  let href: string | undefined;
  try {
    href = validate(ref, "pre.open():");

    // A fragment on the page we are already on is not a navigation; let the
    // browser move the target itself so :target and scrolling keep working
    const [path, ...rest] = href.split("#");
    const hash = rest.join("#");
    if (hash && path === location.href.split("#")[0]) {
      location.hash = hash;
      return;
    }

    // .load() already does all the cache and loading checking
    const data = await this.load(href);

    // Pass the original href, not the cache key: .load() strips the fragment
    // to avoid caching the same page once per anchor, but the URL needs it
    await this.replace(href, data.html, { history });

    return this.init();
  } catch (error) {
    // Manually load the new page
    this.report(error as Error);
    if (href) location.href = href;
  }
}
