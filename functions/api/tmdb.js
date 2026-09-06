// Real season/episode counts for the playground's TV picker.
// The key lives in the Pages project env (TMDB_API_KEY) — never in client
// JS, because 7movies.in shares the same key and an abused key breaks both.
const ALLOWED = /^tv\/\d{1,8}$/;

export async function onRequestGet({ request, env }) {
  const path = (new URL(request.url).searchParams.get('path') || '').replace(/^\/+/, '');
  if (!ALLOWED.test(path) || !env.TMDB_API_KEY) {
    return Response.json({ seasons: [] }, { status: 400 });
  }

  const tmdb = new URL('https://api.themoviedb.org/3/' + path);
  tmdb.searchParams.set('api_key', env.TMDB_API_KEY);
  tmdb.searchParams.set('language', 'en-US');

  try {
    // Edge caching comes from the Cache-Control below, not a cf: option —
    // the cf: form breaks under `wrangler pages dev`, so it can't be tested.
    const upstream = await fetch(tmdb.toString(), { signal: AbortSignal.timeout(6000) });
    if (!upstream.ok) return Response.json({ seasons: [] }, { status: upstream.status });
    const data = await upstream.json();
    // Only the fields the picker renders.
    return Response.json({
      id: data.id,
      seasons: (data.seasons || [])
        .filter((s) => s.episode_count > 0)
        .map((s) => ({ season: s.season_number, episodes: s.episode_count })),
    }, { headers: { 'Cache-Control': 'public, max-age=600, s-maxage=86400' } });
  } catch {
    return Response.json({ seasons: [] }, { status: 502 });
  }
}
