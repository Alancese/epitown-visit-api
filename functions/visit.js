// EpiTown visit tracking endpoint

const SITE_ORIGIN = "https://alancese.github.io";

export async function onRequestGet({ env }) {
  const headers = { "Access-Control-Allow-Origin": SITE_ORIGIN };
  if (!env.DB) {
    return new Response(JSON.stringify({ visits: -1, last_time: 0 }), { headers });
  }
  const row = await env.DB.prepare("SELECT COUNT(*) as visits, MAX(visited_at) as last_time FROM visits").first();
  return new Response(JSON.stringify(row || { visits: 0, last_time: 0 }), { headers });
}

export async function onRequestPost({ request, env }) {
  if (request.headers.get("Origin") !== SITE_ORIGIN) {
    return new Response(null, { status: 403 });
  }

  const headers = { "Access-Control-Allow-Origin": SITE_ORIGIN };
  const ip = request.headers.get("CF-Connecting-IP");

  if (!ip) return new Response(null, { status: 400, headers });
  if (!env.DB) {
    return new Response("D1 binding missing", { status: 503, headers });
  }

  await env.DB.prepare(
    "INSERT INTO visits (ip, visited_at) VALUES (?, ?)"
  ).bind(ip, Date.now()).run();

  return new Response(null, { status: 204, headers });
}