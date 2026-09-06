// TMDB proxy for the playground's search box and season/episode counts.
// The key lives in the Pages project env (TMDB_API_KEY) — never in client JS,
// because 7movies.in shares the same key and an abused key breaks both.
const ALLOWED = /^(search\/multi|tv\/\d+)$/;

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const path = (url.searchParams.get('path') || '').replace(/^\/+/, '');
  const query = url.searchParams.get('query') || '';

  if (!ALLOWED.test(path) || !env.TMDB_API_KEY) {
    return Response.json({ results: [], error: 'unavailable' }, { status: 400 });
  }

  const tmdb = new URL('https://api.themoviedb.org/3/' + path);
  tmdb.searchParams.set('api_key', env.TMDB_API_KEY);
  tmdb.searchParams.set('language', 'en-US');
  tmdb.searchParams.set('include_adult', 'false');
  if (query) tmdb.searchParams.set('query', query.slice(0, 120));

  try {
    // Edge caching comes from the Cache-Control below, not a cf: option —
    // the cf: form breaks under `wrangler pages dev`, so it can't be tested.
    const upstream = await fetch(tmdb.toString(), { signal: AbortSignal.timeout(6000) });
    if (!upstream.ok) return Response.json({ results: [] }, { status: upstream.status });
    const data = await upstream.json();
    // Only the fields the page renders — no point shipping TMDB's full payload.
    const body = path === 'search/multi'
      ? {
          results: (data.results || [])
            .filter((r) => (r.media_type === 'movie' || r.media_type === 'tv') && !r.adult)
            .slice(0, 12)
            .map((r) => ({
              id: r.id,
              type: r.media_type,
              title: r.title || r.name,
              poster: r.poster_path,
              year: (r.release_date || r.first_air_date || '').slice(0, 4),
              rating: r.vote_average ? Number(r.vote_average.toFixed(1)) : null,
            })),
        }
      : {
          id: data.id,
          title: data.name,
          poster: data.poster_path,
          seasons: (data.seasons || [])
            .filter((s) => s.episode_count > 0)
            .map((s) => ({ season: s.season_number, episodes: s.episode_count })),
        };
    return Response.json(body, {
      headers: { 'Cache-Control': 'public, max-age=600, s-maxage=86400' },
    });
  } catch {
    return Response.json({ results: [] }, { status: 502 });
  }
}
