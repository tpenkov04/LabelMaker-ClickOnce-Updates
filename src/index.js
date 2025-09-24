export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const upstreamUrl = `${env.UPSTREAM_BASE}${url.pathname}`;

    const resp = await fetch(upstreamUrl, { redirect: "follow" });
    if (!resp.ok) {
      return new Response(`Not found (${resp.status})`, { status: resp.status });
    }

    const headers = new Headers(resp.headers);
    headers.delete("Content-Disposition");
    const p = url.pathname.toLowerCase();

    if (p.endsWith(".application") || p.endsWith(".manifest")) {
      headers.set("Content-Type", "application/x-ms-application");
      headers.set("Cache-Control", "no-cache, must-revalidate");
    } else if (p.endsWith(".deploy")) {
      headers.set("Content-Type", "application/octet-stream");
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    }

    const body = await resp.arrayBuffer();
    return new Response(body, { status: 200, headers });
  }
};