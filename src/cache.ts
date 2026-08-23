export type Page = { href: string; html: string };

type Entry = { value: Page; expires: number };

// Least-recently-used store with a TTL. Map iteration is insertion-ordered, so
// re-inserting on a hit keeps the least recently used entry first.
export default class Cache {
  max: number;
  ttl: number;
  onchange: () => void = () => {};
  private items = new Map<string, Entry>();

  constructor(max = 100, ttl = 10000) {
    this.max = max;
    this.ttl = ttl;
  }

  keys(): string[] {
    return [...this.items.keys()];
  }

  get(href: string): Page | undefined {
    const entry = this.items.get(href);
    if (!entry) return undefined;
    if (this.ttl && entry.expires < performance.now()) {
      this.items.delete(href);
      this.onchange();
      return undefined;
    }
    this.items.delete(href);
    this.items.set(href, entry);
    return entry.value;
  }

  set(href: string, value: Page): void {
    this.items.delete(href);
    this.items.set(href, { value, expires: performance.now() + this.ttl });
    if (this.items.size > this.max) {
      this.items.delete(this.items.keys().next().value!);
    }
    this.onchange();
  }

  clear(): void {
    this.items.clear();
    this.onchange();
  }
}
