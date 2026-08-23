import type { Page } from "./cache";
import type { Premonition } from "./index";
import validate from "./validate";

// Fetch the HTML of either a URL or an <a> element
export default async function (
  this: Premonition,
  ref: string | HTMLAnchorElement = "",
): Promise<Page> {
  // The fragment is dropped so the same page is not cached once per anchor
  const href = validate(ref, "pre.load():").split("#")[0]!;

  // Already loading or already in cache; return the current action
  const loading = this.loader[href];
  if (loading) return loading;
  const cached = this.cache.get(href);
  if (cached) return cached;

  this.loader[href] = fetch(href)
    .then((res) => {
      if (!res.ok) this.report(new Error(res.statusText));
      return res.text();
    })
    .then((html) => {
      const page = { href, html };
      this.cache.set(href, page);
      return page;
    })
    // Also on failure, otherwise a single network error would keep returning
    // the same rejected promise for that url forever
    .finally(() => delete this.loader[href]);

  return this.loader[href]!;
}
