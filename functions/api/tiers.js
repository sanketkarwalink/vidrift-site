// Which titles are on the fast tier, proxied so the page never names the
// upstream endpoint in its own markup or the visitor's network tab.
export async function onRequestGet() {
  try {
    const r = await fetch('https://embed.vidrift.in/api/selfhost/catalog', {
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return Response.json({ movies: [], tv: [] }, { status: 502 });
    const d = await r.json();
    return Response.json(
      { movies: d.movies || [], tv: d.tv || [] },
      { headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600' } }
    );
  } catch {
    return Response.json({ movies: [], tv: [] }, { status: 502 });
  }
}
