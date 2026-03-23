import axios from "axios";

export const IMG_BASE = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

export function tmdbKey() { return process.env.TMDB_API_KEY || ""; }

export const MOVIE_GENRES: Record<number, string> = {
  28:"Action",12:"Adventure",16:"Animation",35:"Comedy",80:"Crime",
  99:"Documentary",18:"Drama",10751:"Family",14:"Fantasy",36:"History",
  27:"Horror",10402:"Music",9648:"Mystery",10749:"Romance",878:"Science Fiction",
  10770:"TV Movie",53:"Thriller",10752:"War",37:"Western",
};
export const TV_GENRES: Record<number, string> = {
  10759:"Action & Adventure",16:"Animation",35:"Comedy",80:"Crime",
  99:"Documentary",18:"Drama",10751:"Family",10762:"Kids",9648:"Mystery",
  10763:"News",10764:"Reality",10765:"Sci-Fi & Fantasy",10766:"Soap",
  10767:"Talk",10768:"War & Politics",37:"Western",
};

export async function tmdb(path: string, params: Record<string, string | number> = {}) {
  const key = tmdbKey();
  if (!key) throw new Error("TMDB_API_KEY not configured");
  const resp = await axios.get(`https://api.themoviedb.org/3${path}`, {
    params: { api_key: key, ...params },
    timeout: 15000,
  });
  return resp.data;
}

export function formatItem(raw: any, forcedType?: "movie" | "tv") {
  const mediaType: "movie" | "tv" = forcedType ?? (raw.media_type === "tv" || raw.first_air_date ? "tv" : "movie");
  const isTV = mediaType === "tv";
  const genreMap = isTV ? TV_GENRES : MOVIE_GENRES;
  const genreIds: number[] = raw.genre_ids ?? (raw.genres ?? []).map((g: any) => g.id);
  const genre = genreIds.map(id => genreMap[id]).filter(Boolean).join(", ") || null;
  const cover = raw.poster_path ? `${IMG_BASE}${raw.poster_path}` : null;
  const backdrop = raw.backdrop_path ? `${BACKDROP_BASE}${raw.backdrop_path}` : null;
  const country =
    (Array.isArray(raw.origin_country) ? raw.origin_country[0] : null) ??
    (Array.isArray(raw.production_countries) ? raw.production_countries[0]?.iso_3166_1 : null) ?? null;
  const stars = (raw.credits?.cast ?? []).slice(0, 5).map((c: any) => ({
    name: c.name ?? "", role: c.character ?? "",
    avatar: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
  }));
  let seasons: { se: number; maxEp: number }[] = [];
  if (isTV && Array.isArray(raw.seasons)) {
    seasons = raw.seasons.filter((s: any) => s.season_number > 0 && s.episode_count > 0)
      .map((s: any) => ({ se: s.season_number, maxEp: s.episode_count }));
  }
  return {
    id: String(raw.id), tmdbId: raw.id, mediaType,
    title: raw.title ?? raw.name ?? "Unknown",
    description: raw.overview ?? "",
    releaseDate: raw.release_date ?? raw.first_air_date ?? null,
    duration: raw.runtime ?? raw.episode_run_time?.[0] ?? null,
    genre, cover, backdrop, country,
    imdbRating: raw.vote_average ? String(raw.vote_average.toFixed(1)) : null,
    subtitles: null, type: isTV ? 2 : 1, hasResource: true, stars,
    trailerUrl: null, detailPath: String(raw.id), season: null, corner: null,
    videoUrls: [], seasons, source: "tmdb",
  };
}

export function formatJikanAnime(raw: any) {
  return {
    id: `jikan-${raw.mal_id}`, tmdbId: null, mediaType: "tv",
    title: raw.title_english || raw.title,
    description: (raw.synopsis || "").replace(/\[Written by.*?\]/gi, "").trim(),
    releaseDate: raw.year ? `${raw.year}-01-01` : null, duration: null,
    genre: (raw.genres || []).map((g: any) => g.name).join(", ") || null,
    cover: raw.images?.jpg?.large_image_url || null, backdrop: null,
    country: "Japan", imdbRating: raw.score ? String(raw.score.toFixed(1)) : null,
    subtitles: null, type: 2, hasResource: true, stars: [],
    trailerUrl: null, detailPath: null, season: null, corner: "Anime",
    videoUrls: [], seasons: [], source: "jikan",
  };
}

export function formatTVmazeShow(raw: any) {
  const show = raw.show || raw;
  return {
    id: `tvmaze-${show.id}`, tmdbId: null, mediaType: "tv",
    title: show.name,
    description: (show.summary || "").replace(/<[^>]*>/g, ""),
    releaseDate: show.premiered || null, duration: show.averageRuntime || null,
    genre: (show.genres || []).join(", ") || null,
    cover: show.image?.original || show.image?.medium || null,
    backdrop: null, country: show.network?.country?.code || null,
    imdbRating: show.rating?.average ? String(show.rating.average.toFixed(1)) : null,
    subtitles: null, type: 2, hasResource: true, stars: [],
    trailerUrl: null, detailPath: null, season: null, corner: null,
    videoUrls: [], seasons: [], source: "tvmaze",
  };
}

export function cors(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
}
