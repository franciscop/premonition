// Static server for the demo: bun run demo
const root = new URL("..", import.meta.url).pathname;

const server = Bun.serve({
  port: 3200,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname.includes("..")) return new Response("Nope", { status: 400 });

    const file = Bun.file(root + (pathname.endsWith("/") ? `${pathname}index.html` : pathname).slice(1));
    if (!(await file.exists())) return new Response("Not found", { status: 404 });

    // Delay the pages, but not the assets, so preloading is actually visible
    if (file.type.includes("html")) await Bun.sleep(400);
    return new Response(file, { headers: { "Cache-Control": "no-store" } });
  },
});

console.log(`Demo running on ${server.url}demo/`);
