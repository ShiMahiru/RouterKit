// RouterKit Cloudflare Workers entry.
// All routes are prerendered to static HTML at build time.
// Workers Assets serves them directly; this handler only catches 404s.

export default {
  async fetch(_request: Request): Promise<Response> {
    return new Response("Not Found", { status: 404 });
  },
};