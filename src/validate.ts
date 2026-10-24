// Accept either a URL string or an <a>, since those have a .href property
export default (ref: unknown, pre = ""): string => {
  const href = (ref as HTMLAnchorElement)?.href || ref;

  if (!href) {
    throw new Error(`${pre} the argument has to be an url or a <a> element`);
  }
  const node = href as Node;
  if (node.nodeName === "A") {
    throw new Error(
      `${pre} argument element is missing the href="" or it is empty`,
    );
  }
  if (node.nodeName) {
    throw new Error(
      `${pre} expected an anchor <a> element, received "${node.nodeName}"`,
    );
  }
  if (typeof href !== "string") {
    throw new Error(`${pre} expected a string, received ${typeof href}`);
  }

  // Canonical absolute url, so the cache keys of "/a" and of an <a href="/a">
  // are the same entry
  try {
    return new URL(href, location.href).href;
  } catch {
    throw new Error(`${pre} expected a valid url, received "${href}"`);
  }
};
