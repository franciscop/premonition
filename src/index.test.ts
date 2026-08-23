import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import Cache from "./cache";
import follows from "./follows";
import head from "./head";
import { Premonition } from "./index";
import links from "./links";
import validate from "./validate";

const attrs = {
  once: "data-pre-once",
  ignore: "data-pre-ignore",
  keep: "data-pre-keep",
  cache: "data-pre-cached",
};
const self = { attrs } as Premonition;

const url = (path: string) => new URL(path, location.href).href;

function anchor(html: string): HTMLAnchorElement {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.firstElementChild as HTMLAnchorElement;
}

describe("follows", () => {
  const check = (html: string) => follows.call(self, anchor(html));

  it("follows a plain same-site link", () => {
    expect(check('<a href="/about">a</a>')).toBe(true);
    expect(check('<a href="/about" target="_self">a</a>')).toBe(true);
  });

  it("ignores links without a href", () => {
    expect(check("<a>a</a>")).toBe(false);
    expect(check('<a href="">a</a>')).toBe(false);
  });

  it("ignores bare fragments", () => {
    expect(check('<a href="#main">a</a>')).toBe(false);
  });

  it("ignores other hosts", () => {
    expect(check('<a href="https://another.com/a">a</a>')).toBe(false);
  });

  it("ignores other targets", () => {
    expect(check('<a href="/a" target="_blank">a</a>')).toBe(false);
  });

  it("ignores downloads and non-http schemes", () => {
    expect(check('<a href="/a.pdf" download>a</a>')).toBe(false);
    expect(check('<a href="mailto:a@b.com">a</a>')).toBe(false);
    expect(check('<a href="tel:123">a</a>')).toBe(false);
  });

  it("ignores the opted-out links", () => {
    expect(check('<a href="/logout" data-pre-ignore>a</a>')).toBe(false);
  });
});

describe("validate", () => {
  it("returns a plain url", () => {
    expect(validate("/about")).toBe(url("/about"));
  });

  it("reads the href of an anchor", () => {
    expect(validate(anchor('<a href="/about">a</a>'))).toBe(`${location.origin}/about`);
  });

  it("throws without an argument", () => {
    expect(() => validate("")).toThrow("has to be an url or a <a> element");
  });

  it("throws for an anchor without href", () => {
    expect(() => validate(anchor("<a>a</a>"))).toThrow("missing the href");
  });

  it("throws for another element", () => {
    expect(() => validate(document.createElement("div"))).toThrow('received "DIV"');
  });

  it("prefixes the error with the caller", () => {
    expect(() => validate("", "pre.load():")).toThrow("pre.load():");
  });
});

describe("cache", () => {
  it("stores and retrieves pages", () => {
    const cache = new Cache();
    cache.set("/a", { href: "/a", html: "A" });
    expect(cache.get("/a")?.html).toBe("A");
    expect(cache.get("/b")).toBeUndefined();
  });

  it("evicts the least recently used entry", () => {
    const cache = new Cache(2);
    cache.set("/a", { href: "/a", html: "A" });
    cache.set("/b", { href: "/b", html: "B" });
    cache.get("/a");
    cache.set("/c", { href: "/c", html: "C" });
    expect(cache.keys()).toEqual(["/a", "/c"]);
  });

  it("expires entries after the ttl", async () => {
    const cache = new Cache(10, 1);
    cache.set("/a", { href: "/a", html: "A" });
    await Bun.sleep(5);
    expect(cache.get("/a")).toBeUndefined();
  });

  it("notifies on changes", () => {
    const cache = new Cache();
    const onchange = mock(() => {});
    cache.onchange = onchange;
    cache.set("/a", { href: "/a", html: "A" });
    cache.clear();
    expect(onchange).toHaveBeenCalledTimes(2);
    expect(cache.keys()).toEqual([]);
  });
});

describe("head", () => {
  const make = (html: string) => {
    const el = document.createElement("head");
    el.innerHTML = html;
    return el;
  };
  const patch = (from: string, to: string) => {
    const current = make(from);
    head.call(self, current, make(to));
    return current.innerHTML;
  };

  it("keeps an identical head untouched", () => {
    expect(patch("<title>A</title>", "<title>A</title>")).toBe("<title>A</title>");
  });

  it("updates an element", () => {
    expect(patch("<title>A</title>", "<title>B</title>")).toBe("<title>B</title>");
  });

  it("adds the new elements", () => {
    const out = patch("<title>A</title>", '<title>A</title><meta name="a">');
    expect(out).toBe('<title>A</title><meta name="a">');
  });

  it("removes the elements that are gone", () => {
    const out = patch('<title>A</title><meta name="a">', "<title>A</title>");
    expect(out).toBe("<title>A</title>");
  });

  it("leaves no leftover marker attributes", () => {
    expect(patch("<title>A</title>", "<title>B</title>")).not.toContain(attrs.keep);
  });
});

describe("links", () => {
  it("flags the links that are already cached, whatever the url they were loaded with", () => {
    document.body.innerHTML = `<a href="/a">a</a><a href="/b">b</a>`;
    const self = { attrs, cache: new Cache() } as Premonition;
    self.cache.set(`${location.origin}/a`, { href: "/a", html: "A" });
    links.call(self);
    const [a, b] = [...document.querySelectorAll("a")];
    expect(a!.hasAttribute(attrs.cache)).toBe(true);
    expect(b!.hasAttribute(attrs.cache)).toBe(false);
  });

  it("unflags them when the cache is cleared", () => {
    document.body.innerHTML = `<a href="/a">a</a>`;
    const self = { attrs, cache: new Cache() } as Premonition;
    self.cache.set(`${location.origin}/a`, { href: "/a", html: "A" });
    links.call(self);
    self.cache.clear();
    links.call(self);
    expect(document.querySelector("a")!.hasAttribute(attrs.cache)).toBe(false);
  });
});

describe("load", () => {
  let pre: Premonition;
  const original = globalThis.fetch;
  let calls: string[] = [];

  beforeEach(() => {
    pre = new Premonition();
    pre.cache.clear();
    calls = [];
    globalThis.fetch = ((url: string) => {
      calls.push(url);
      return Promise.resolve(new Response("<html><body>hi</body></html>"));
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = original;
  });

  it("fetches and caches the html", async () => {
    const page = await pre.load("/a");
    expect(page.html).toContain("hi");
    expect(pre.cache.get(url("/a"))?.html).toContain("hi");
  });

  it("does not fetch twice for the same page", async () => {
    await pre.load("/a");
    await pre.load("/a");
    expect(calls).toEqual([url("/a")]);
  });

  it("dedupes the requests that are in flight", async () => {
    await Promise.all([pre.load("/a"), pre.load("/a")]);
    expect(calls).toEqual([url("/a")]);
  });

  it("drops the fragment from the cache key", async () => {
    await pre.load("/a#one");
    await pre.load("/a#two");
    expect(calls).toEqual([url("/a")]);
    expect(pre.cache.get(url("/a"))).toBeDefined();
    expect(pre.cache.get(url("/a#one"))).toBeUndefined();
  });

  it("forgets a failed request so it can be retried", async () => {
    let fail = true;
    globalThis.fetch = ((u: string) => {
      calls.push(u);
      return fail ? Promise.reject(new Error("offline")) : Promise.resolve(new Response("later"));
    }) as unknown as typeof fetch;

    expect(pre.load("/flaky")).rejects.toThrow("offline");
    await Bun.sleep(5);
    expect(Object.keys(pre.loader)).toEqual([]);

    fail = false;
    expect((await pre.load("/flaky")).html).toBe("later");
    expect(calls.length).toBe(2);
  });

  it("reports a failed response", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(new Response("", { status: 404, statusText: "Not Found" }))) as unknown as typeof fetch;
    const report = mock(() => {});
    pre.report = report;
    await pre.load("/missing");
    expect(report).toHaveBeenCalled();
  });
});

describe("init", () => {
  const original = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = original;
    history.pushState({}, "", "/");
  });

  it("caches the current page without its fragment", async () => {
    history.pushState({}, "", "/here#section");
    document.body.innerHTML = "<p>current</p>";
    const pre = new Premonition();
    await pre.init();
    expect(pre.cache.keys()).toContain(url("/here"));
    expect(pre.cache.get(url("/here"))?.html).toContain("current");
  });

  it("does not overwrite the cached page on a later run", async () => {
    history.pushState({}, "", "/twice");
    document.body.innerHTML = "<p>as the server sent it</p>";
    const pre = new Premonition();
    await pre.init();

    // What .replace() does to the document between one .init() and the next
    document.body.innerHTML = "<p>as the server sent it</p><script></" + "script>";
    await pre.init();

    expect(pre.cache.get(url("/twice"))?.html).not.toContain("script");
  });

  it("reports a preload failure instead of leaving it unhandled", async () => {
    document.body.innerHTML = `<a href="/hovered">a</a>`;
    globalThis.fetch = (() => Promise.reject(new Error("offline"))) as unknown as typeof fetch;
    const pre = new Premonition();
    const report = mock(() => {});
    pre.report = report;
    await pre.init();

    document.querySelector("a")!.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    await Bun.sleep(5);
    expect(report).toHaveBeenCalled();
  });
});

describe("replace", () => {
  let pre: Premonition;

  beforeEach(() => {
    pre = new Premonition();
    document.head.innerHTML = "<title>Old</title>";
    document.body.innerHTML = "<p>old</p>";
  });

  const page = (body: string, headHtml = "<title>New</title>") =>
    `<html><head>${headHtml}</head><body>${body}</body></html>`;

  it("swaps the body and the head", async () => {
    await pre.replace("/new", page("<p>new</p>"));
    expect(document.body.innerHTML).toBe("<p>new</p>");
    expect(document.title).toBe("New");
  });

  it("pushes the new url to the history", async () => {
    await pre.replace("/new", page("<p>new</p>"));
    expect(location.pathname).toBe("/new");
  });

  it("does not touch the history when asked not to", async () => {
    const before = location.pathname;
    await pre.replace("/other", page("<p>new</p>"), { history: false });
    expect(location.pathname).toBe(before);
  });

  it("scrolls to the top", async () => {
    const scrollTo = mock(() => {});
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    await pre.replace("/new", page("<p>new</p>"));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("scrolls to the anchor named by the url", async () => {
    const scrollIntoView = mock(() => {});
    Element.prototype.scrollIntoView = scrollIntoView;
    await pre.replace("/new#here", page('<p id="here">new</p>'));
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it("re-injects the scripts of the new page", async () => {
    await pre.replace("/new", page("<scr" + "ipt>window.ran = true;</scr" + "ipt>"));
    expect(document.querySelectorAll("script").length).toBe(2);
  });

  it("skips the opted-out scripts", async () => {
    await pre.replace("/new", page('<script src="/a.js" data-pre-ignore></script>'));
    expect(document.querySelectorAll('script[src="/a.js"]').length).toBe(1);
  });

  it("does not re-run a script already loaded once", async () => {
    pre.loaded[`${location.origin}/a.js`] = true;
    await pre.replace("/new", page('<script src="/a.js"></script>'));
    expect(document.querySelectorAll('script[src="/a.js"]').length).toBe(1);
  });
});

describe("open", () => {
  let pre: Premonition;
  const original = globalThis.fetch;

  beforeEach(() => {
    pre = new Premonition();
    pre.cache.clear();
    globalThis.fetch = (() =>
      Promise.resolve(new Response("<html><body><p>new</p></body></html>"))) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = original;
  });

  it("loads and replaces the page", async () => {
    await pre.open("/target");
    expect(document.body.innerHTML).toContain("new");
    expect(location.pathname).toBe("/target");
  });

  it("keeps the fragment in the url", async () => {
    await pre.open("/target#here");
    expect(location.hash).toBe("#here");
    expect(pre.cache.get(url("/target"))).toBeDefined();
  });

  it("only moves the hash within the current page", async () => {
    const replace = mock(() => Promise.resolve());
    pre.replace = replace as unknown as typeof pre.replace;
    await pre.open(`${location.href.split("#")[0]}#here`);
    expect(replace).not.toHaveBeenCalled();
    expect(location.hash).toBe("#here");
  });

  it("reports an invalid argument instead of navigating", async () => {
    const report = mock(() => {});
    pre.report = report;
    await pre.open("");
    expect(report).toHaveBeenCalled();
  });
});
