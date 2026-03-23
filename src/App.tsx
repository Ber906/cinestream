import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SeasonInfo {
  se: number;
  maxEp: number;
}

interface Movie {
  id: string;
  tmdbId?: number;
  mediaType?: "movie" | "tv";
  title: string;
  description: string;
  releaseDate: string | null;
  duration: number | null;
  genre: string | null;
  cover: string | null;
  backdrop?: string | null;
  country: string | null;
  imdbRating: string | null;
  subtitles: string | null;
  type: number;
  hasResource: boolean;
  stars: { name: string; role: string; avatar: string | null }[];
  trailerUrl: string | null;
  detailPath: string | null;
  season: number | null;
  corner: string | null;
  videoUrls?: string[];
  seasons?: SeasonInfo[];
  source?: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────
const BASE = "/api";
async function apiFetch<T>(path: string): Promise<T> {
  const r = await fetch(BASE + path);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// ─── Embed servers (ad-free) ──────────────────────────────────────────────────
const SERVERS = [
  { id: "vidlink", label: "Server 1" },
  { id: "embedsu", label: "Server 2" },
  { id: "vidsrcxyz", label: "Server 3" },
] as const;

type ServerId = (typeof SERVERS)[number]["id"];

function buildEmbedUrl(movie: Movie, season?: number, episode?: number, server: ServerId = "vidlink"): string {
  const id = movie.tmdbId ?? movie.id;
  const type = movie.mediaType ?? (movie.type === 2 ? "tv" : "movie");
  const isTV = type === "tv" && season && episode;

  if (server === "embedsu") {
    return isTV
      ? `https://embed.su/embed/tv/${id}/${season}/${episode}`
      : `https://embed.su/embed/movie/${id}`;
  }
  if (server === "vidsrcxyz") {
    return isTV
      ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
      : `https://vidsrc.xyz/embed/movie?tmdb=${id}`;
  }
  // default: vidlink.pro (ad-free)
  return isTV
    ? `https://vidlink.pro/tv/${id}/${season}/${episode}`
    : `https://vidlink.pro/movie/${id}`;
}

// ─── Welcome Modal ────────────────────────────────────────────────────────────
function WelcomeModal({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 400);
  };

  const stars = Array.from({ length: 28 }, (_, i) => ({
    x: Math.sin(i * 137.5) * 50 + 50,
    y: Math.cos(i * 97.3) * 50 + 50,
    r: (i % 3) * 0.8 + 0.6,
    op: (i % 4) * 0.15 + 0.15,
  }));

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: "rgba(4,4,10,0.92)",
        backdropFilter: "blur(12px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Floating star dots */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.5 }}>
        {stars.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.op} />
        ))}
      </svg>

      <div
        ref={cardRef}
        className="relative w-full max-w-[420px] rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #16101f 0%, #0e0e1a 60%, #1a0f1a 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(229,9,20,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
          transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Glow behind card */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(229,9,20,0.18) 0%, transparent 70%)", filter: "blur(20px)" }} />

        {/* Top gradient bar */}
        <div className="h-[3px] w-full"
          style={{ background: "linear-gradient(90deg, transparent, #e50914 30%, #ff6b35 60%, #e50914 80%, transparent)" }} />

        {/* Film strip decoration */}
        <div className="flex justify-between px-5 pt-3 pb-1 pointer-events-none select-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-5 h-3 rounded-sm" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
          ))}
        </div>

        <div className="px-8 pb-8 pt-2">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-2xl blur-xl" style={{ background: "rgba(229,9,20,0.5)", transform: "scale(1.3)" }} />
              <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-2xl"
                style={{ background: "linear-gradient(135deg, #e50914 0%, #c2030f 50%, #ff4d1a 100%)" }}>
                ▶
              </div>
            </div>
            <div className="text-center">
              <span className="text-3xl font-black tracking-tight text-white">
                Cine<span style={{ color: "#e50914" }}>Stream</span>
              </span>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {["Movies", "Series", "Anime"].map((tag) => (
                  <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Welcome heading */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-white mb-2 tracking-tight">
              Maligayang Pagdating! 🎬
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              Watch the latest movies, TV series, and anime — all for free, no subscription needed.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>made by</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Creator card */}
          <div className="rounded-2xl p-4 mb-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full blur-md" style={{ background: "rgba(229,9,20,0.4)", transform: "scale(1.2)" }} />
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-xl"
                  style={{ background: "linear-gradient(135deg, #e50914, #ff6b35)" }}>
                  B
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold text-base leading-tight">Berwin Villareal</p>
                <p className="text-[11px] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Developer &amp; Creator</p>
                <a
                  href="https://www.facebook.com/villareal.berwin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95"
                  style={{ background: "#1877f2", color: "white" }}
                >
                  <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Follow on Facebook
                </a>
              </div>
            </div>
          </div>

          {/* CTA button */}
          <button
            onClick={handleClose}
            className="relative w-full py-3.5 rounded-2xl font-bold text-white text-sm overflow-hidden group transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: "linear-gradient(135deg, #e50914 0%, #c2030f 50%, #ff4d1a 100%)", boxShadow: "0 8px 32px rgba(229,9,20,0.45)" }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>Start Watching</span>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "linear-gradient(135deg, #ff1a1a 0%, #e50914 50%, #ff6b35 100%)" }} />
          </button>
        </div>

        {/* Bottom film strip */}
        <div className="flex justify-between px-5 pb-3 pt-1 pointer-events-none select-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-5 h-3 rounded-sm" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-white/5 animate-pulse">
      <div className="aspect-[2/3] bg-white/10" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-white/10 rounded" />
        <div className="h-2 bg-white/10 rounded w-2/3" />
      </div>
    </div>
  );
}

// ─── Movie Card ───────────────────────────────────────────────────────────────
function MovieCard({ movie, onClick }: { movie: Movie; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  const genres = movie.genre?.split(",").slice(0, 2) ?? [];
  const year = movie.releaseDate?.slice(0, 4) ?? "";
  const img = movie.cover ?? "";

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl overflow-hidden bg-white/5 border border-white/8 hover:border-red-500/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
        {img && !imgErr ? (
          <img
            src={img}
            alt={movie.title}
            loading="lazy"
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-white/20 bg-gradient-to-br from-white/5 to-white/10">
            🎬
          </div>
        )}
        {movie.type === 2 && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            Series
          </div>
        )}
        {movie.imdbRating && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-yellow-400 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            ★ {movie.imdbRating}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-red-600 rounded-full p-3 scale-75 group-hover:scale-100 transition-transform duration-200 shadow-lg">
            <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight mb-1.5">
          {movie.title}
        </h3>
        <div className="flex gap-1.5 flex-wrap">
          {year && <span className="text-[11px] text-white/50">{year}</span>}
          {genres.map((g) => (
            <span key={g} className="text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
              {g.trim()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Movie Grid ───────────────────────────────────────────────────────────────
function MovieGrid({
  movies,
  loading,
  onSelect,
}: {
  movies: Movie[];
  loading: boolean;
  onSelect: (m: Movie) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  if (!movies.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <div className="text-5xl mb-4">📭</div>
        <p>No content available</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} onClick={() => onSelect(m)} />
      ))}
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ movies, onPlay }: { movies: Movie[]; onPlay: (m: Movie) => void }) {
  const [idx, setIdx] = useState(0);
  const featured = movies.filter((m) => m.cover || m.backdrop);
  const movie = featured[idx % Math.max(featured.length, 1)];

  useEffect(() => {
    if (featured.length <= 1) return;
    const t = setInterval(() => setIdx((i) => i + 1), 7000);
    return () => clearInterval(t);
  }, [featured.length]);

  if (!movie) return null;
  const img = movie.backdrop ?? movie.cover ?? "";

  return (
    <div className="relative h-[65vh] min-h-[480px] overflow-hidden flex items-end">
      {img && (
        <div className="absolute inset-0">
          <img src={img} alt={movie.title} className="w-full h-full object-cover opacity-40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-[#0a0a0f]/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-transparent" />

      <div className="relative z-10 p-8 md:p-16 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-3 py-1 text-xs text-red-400 font-semibold uppercase tracking-wider mb-4">
          ★ Featured
        </div>
        <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-white mb-3">
          {movie.title}
        </h1>
        <div className="flex flex-wrap gap-3 mb-4 text-sm text-white/60">
          {movie.imdbRating && (
            <span className="text-yellow-400 font-semibold">★ {movie.imdbRating} IMDb</span>
          )}
          {movie.releaseDate && <span>{movie.releaseDate.slice(0, 4)}</span>}
          {movie.genre && <span>{movie.genre.split(",").slice(0, 2).join(" · ")}</span>}
          {movie.country && <span>{movie.country}</span>}
        </div>
        {movie.description && (
          <p className="text-white/70 text-sm md:text-base leading-relaxed line-clamp-3 mb-6">
            {movie.description}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => onPlay(movie)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-red-600/30 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Now
          </button>
          <button
            onClick={() => onPlay(movie)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold px-5 py-3 rounded-xl backdrop-blur transition-all hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <circle cx="12" cy="16" r="0.5" fill="currentColor" />
            </svg>
            More Info
          </button>
        </div>
      </div>

      {featured.length > 1 && (
        <div className="absolute bottom-6 right-8 flex gap-1.5">
          {featured.slice(0, 6).map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1 rounded-full transition-all ${
                i === idx % featured.length
                  ? "w-6 bg-red-500"
                  : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Episode Picker ────────────────────────────────────────────────────────────
function EpisodePicker({
  seasons,
  activeKey,
  onSelect,
}: {
  seasons: SeasonInfo[];
  activeKey: string | null;
  onSelect: (season: number, episode: number) => void;
}) {
  const [activeSeason, setActiveSeason] = useState(seasons[0]?.se ?? 1);
  const currentSeason = seasons.find((s) => s.se === activeSeason) ?? seasons[0];

  return (
    <div className="mt-4">
      <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-3">Episodes</div>

      {seasons.length > 1 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {seasons.map((s) => (
            <button
              key={s.se}
              onClick={() => setActiveSeason(s.se)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeSeason === s.se
                  ? "bg-red-600 text-white"
                  : "bg-white/8 text-white/60 hover:bg-white/15"
              }`}
            >
              Season {s.se}
            </button>
          ))}
        </div>
      )}

      {currentSeason && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 max-h-52 overflow-y-auto pr-1">
          {Array.from({ length: currentSeason.maxEp }, (_, i) => i + 1).map((ep) => {
            const key = `${activeSeason}-${ep}`;
            const isActive = key === activeKey;
            return (
              <button
                key={ep}
                onClick={() => onSelect(activeSeason, ep)}
                className={`rounded-lg py-2 text-xs font-bold transition-colors border ${
                  isActive
                    ? "bg-red-600 border-red-500 text-white"
                    : "bg-white/5 border-white/8 text-white/70 hover:bg-red-600/20 hover:border-red-500/40 hover:text-white"
                }`}
              >
                {ep}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Video Player Modal ────────────────────────────────────────────────────────
function PlayerModal({
  movie,
  onClose,
}: {
  movie: Movie | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<Movie | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [activeEpKey, setActiveEpKey] = useState<string | null>(null);
  const [activeSeason, setActiveSeason] = useState<number | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<number | null>(null);
  const [nowPlaying, setNowPlaying] = useState<string>("");
  const [server, setServer] = useState<ServerId>("vidlink");

  const isSeries = (movie?.type ?? 1) === 2;

  // Load detail + set initial embed URL when movie changes
  useEffect(() => {
    if (!movie) return;
    setDetail(null);
    setActiveEpKey(null);
    setActiveSeason(null);
    setActiveEpisode(null);
    setNowPlaying("");
    setServer("vidlink");
    setEmbedUrl(null);

    const type = movie.mediaType ?? (movie.type === 2 ? "tv" : "movie");

    // Non-TMDB sources (Jikan, AniList, TVmaze) — resolve to TMDB first
    if (!movie.tmdbId && movie.source && movie.source !== "tmdb") {
      setLoadingDetail(true);
      apiFetch<{ success: boolean; data: Movie }>(
        `/movies/resolve?title=${encodeURIComponent(movie.title)}&type=${type}`
      )
        .then((r) => {
          if (r.success && r.data) {
            setDetail(r.data);
            const resolved = r.data;
            const resolvedIsSeries = resolved.type === 2;
            if (!resolvedIsSeries) {
              setEmbedUrl(buildEmbedUrl(resolved, undefined, undefined, "vidlink"));
            } else if ((resolved.seasons ?? []).length > 0) {
              setActiveEpKey("1-1");
              setActiveSeason(1);
              setActiveEpisode(1);
              setNowPlaying("S1 E1");
              setEmbedUrl(buildEmbedUrl(resolved, 1, 1, "vidlink"));
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingDetail(false));
      return;
    }

    // TMDB source — direct embed
    if (!isSeries) {
      setEmbedUrl(buildEmbedUrl(movie, undefined, undefined, "vidlink"));
    }

    if (!movie.detailPath) return;

    setLoadingDetail(true);
    apiFetch<{ success: boolean; data: Movie }>(
      `/movies/detail?slug=${encodeURIComponent(movie.detailPath)}&type=${type}`
    )
      .then((r) => {
        if (r.success) {
          setDetail(r.data);
          if (!isSeries) {
            setEmbedUrl(buildEmbedUrl(r.data, undefined, undefined, "vidlink"));
          } else if ((r.data.seasons ?? []).length > 0) {
            const s = 1, e = 1;
            setActiveEpKey(`${s}-${e}`);
            setActiveSeason(s);
            setActiveEpisode(e);
            setNowPlaying(`S${s} E${e}`);
            setEmbedUrl(buildEmbedUrl(r.data, s, e, "vidlink"));
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
  }, [movie]);

  const handleEpisodeSelect = useCallback((season: number, episode: number) => {
    if (!movie) return;
    const key = `${season}-${episode}`;
    setActiveEpKey(key);
    setActiveSeason(season);
    setActiveEpisode(episode);
    setNowPlaying(`S${season} E${episode}`);
    const src = detail ?? movie;
    setEmbedUrl(buildEmbedUrl(src, season, episode, server));
  }, [movie, detail, server]);

  const handleServerChange = useCallback((newServer: ServerId) => {
    setServer(newServer);
    const src = detail ?? movie;
    if (!src) return;
    if (isSeries && activeSeason && activeEpisode) {
      setEmbedUrl(buildEmbedUrl(src, activeSeason, activeEpisode, newServer));
    } else if (!isSeries) {
      setEmbedUrl(buildEmbedUrl(src, undefined, undefined, newServer));
    }
  }, [movie, detail, isSeries, activeSeason, activeEpisode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!movie) return null;

  const m = detail ?? movie;
  const seasons = detail?.seasons ?? [];

  const metaRows = [
    ["Year", m.releaseDate?.slice(0, 4)],
    ["Genre", m.genre],
    ["Country", m.country],
    ["IMDb", m.imdbRating ? `${m.imdbRating} / 10` : null],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#12121a] border border-white/8 rounded-2xl w-full max-w-5xl shadow-2xl my-auto" data-player>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{m.title}</h2>
            {isSeries && (
              <span className="shrink-0 text-[10px] bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold px-2 py-0.5 rounded uppercase">
                Series
              </span>
            )}
            {nowPlaying && (
              <span className="shrink-0 text-[10px] bg-red-600/20 border border-red-500/30 text-red-400 font-bold px-2 py-0.5 rounded">
                {nowPlaying}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Server switcher */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
              {SERVERS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleServerChange(s.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    server === s.id
                      ? "bg-red-600 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/8 hover:bg-red-600 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video area */}
        <div className="relative bg-black">
          {loadingDetail && !embedUrl ? (
            <div className="aspect-video flex flex-col items-center justify-center gap-3 text-white/50">
              <div className="w-10 h-10 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : isSeries && !activeEpKey && seasons.length > 0 ? (
            <div className="aspect-video flex flex-col items-center justify-center gap-4 text-white/50 bg-black">
              <div className="text-6xl">▶</div>
              <p className="text-sm text-center px-4">Pick an episode below to start watching</p>
            </div>
          ) : embedUrl ? (
            <div className="aspect-video relative">
              <iframe
                key={embedUrl}
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: "none" }}
              />
            </div>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center gap-4 text-white/50 bg-black">
              <div className="text-6xl">▶</div>
              <p className="text-sm">Pick an episode to start watching</p>
            </div>
          )}
        </div>

        {/* Info + Episodes */}
        <div className="p-5">
          {isSeries && seasons.length > 0 && (
            <EpisodePicker
              seasons={seasons}
              activeKey={activeEpKey}
              onSelect={handleEpisodeSelect}
            />
          )}

          {/* Meta grid */}
          <div className="grid md:grid-cols-[1fr_260px] gap-6 mt-4">
            <div>
              {m.description && (
                <p className="text-white/65 text-sm leading-relaxed mb-4">{m.description}</p>
              )}
              {m.stars && m.stars.length > 0 && (
                <div>
                  <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-2">Cast</div>
                  <div className="flex flex-wrap gap-2">
                    {m.stars.slice(0, 6).map((s, i) => (
                      <span key={i} className="bg-white/8 border border-white/8 rounded-lg px-2.5 py-1 text-xs text-white/70">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2.5">
              {metaRows.map(([label, value]) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="text-white/40 w-20 flex-shrink-0">{label}</span>
                  <span className="text-white/80 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({
  title,
  movies,
  loading,
  onSelect,
}: {
  title: string;
  movies: Movie[];
  loading: boolean;
  onSelect: (m: Movie) => void;
}) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-orange-500 rounded" />
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <MovieGrid movies={movies} loading={loading} onSelect={onSelect} />
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [homeMovies, setHomeMovies] = useState<Movie[]>([]);
  const [trendMovies, setTrendMovies] = useState<Movie[]>([]);
  const [tvSeries, setTvSeries] = useState<Movie[]>([]);
  const [animeMovies, setAnimeMovies] = useState<Movie[]>([]);
  const [anilistMovies, setAnilistMovies] = useState<Movie[]>([]);
  const [tvmazeShows, setTvmazeShows] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [loadingHome, setLoadingHome] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [loadingTv, setLoadingTv] = useState(true);
  const [loadingAnime, setLoadingAnime] = useState(true);
  const [loadingAnilist, setLoadingAnilist] = useState(true);
  const [loadingTvmaze, setLoadingTvmaze] = useState(true);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    apiFetch<{ success: boolean; data: Movie[] }>("/movies/list")
      .then((r) => setHomeMovies(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingHome(false));

    apiFetch<{ success: boolean; data: Movie[] }>("/movies/trending")
      .then((r) => setTrendMovies(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingTrend(false));

    apiFetch<{ success: boolean; data: Movie[] }>("/movies/tv-series")
      .then((r) => setTvSeries(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingTv(false));

    apiFetch<{ success: boolean; data: Movie[] }>("/movies/anime")
      .then((r) => setAnimeMovies(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingAnime(false));

    apiFetch<{ success: boolean; data: Movie[] }>("/movies/anilist")
      .then((r) => setAnilistMovies(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingAnilist(false));

    apiFetch<{ success: boolean; data: Movie[] }>("/movies/tvmaze")
      .then((r) => setTvmazeShows(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingTvmaze(false));
  }, []);

  const doSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchMode(false);
      return;
    }
    setSearchMode(true);
    setIsSearching(true);
    setSearchResults([]);
    try {
      const r = await apiFetch<{ success: boolean; data: Movie[] }>(
        `/movies/search?q=${encodeURIComponent(q)}`
      );
      setSearchResults(r.data ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchMode(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const heroMovies = [...trendMovies, ...homeMovies].filter((m) => m.cover || m.backdrop);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#f0f0f5" }}>
      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 h-16"
        style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <button onClick={clearSearch} className="flex items-center gap-2.5 text-left">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, #e50914, #ff6b35)" }}
          >
            ▶
          </div>
          <span className="text-lg font-bold tracking-tight">
            Cine<span style={{ color: "#e50914" }}>Stream</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={clearSearch}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            Home
          </button>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <button onClick={doSearch} className="text-white/50 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search movies, series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            className="bg-transparent text-sm text-white outline-none w-48 placeholder-white/40"
          />
          {searchQuery && (
            <button onClick={clearSearch} className="text-white/40 hover:text-white text-xs">
              ✕
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      {!searchMode && (
        <div className="pt-16">
          <Hero movies={heroMovies} onPlay={setActiveMovie} />
        </div>
      )}

      {/* MAIN */}
      <main className={`max-w-[1400px] mx-auto px-4 pb-16 ${searchMode ? "pt-24" : "pt-10"}`}>
        {searchMode ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSearching ? `Searching for "${searchQuery}"...` : `Results for "${searchQuery}"`}
            </h2>
            {!isSearching && (
              <p className="text-white/50 text-sm mb-8">
                {searchResults.length} title{searchResults.length !== 1 ? "s" : ""} found
              </p>
            )}
            <MovieGrid movies={searchResults} loading={isSearching} onSelect={setActiveMovie} />
          </div>
        ) : (
          <>
            <Section title="🔥 Trending Now" movies={trendMovies} loading={loadingTrend} onSelect={setActiveMovie} />
            <Section title="🎬 Movies" movies={homeMovies} loading={loadingHome} onSelect={setActiveMovie} />
            <Section title="📺 TV Series" movies={tvSeries} loading={loadingTv} onSelect={setActiveMovie} />
            <Section title="🎌 Anime (MyAnimeList)" movies={animeMovies} loading={loadingAnime} onSelect={setActiveMovie} />
            <Section title="✨ Trending Anime (AniList)" movies={anilistMovies} loading={loadingAnilist} onSelect={setActiveMovie} />
            <Section title="📡 TVmaze Picks" movies={tvmazeShows} loading={loadingTvmaze} onSelect={setActiveMovie} />
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer
        className="text-center py-8 px-6 text-sm text-white/30"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        Powered by TMDB · MyAnimeList · AniList · TVmaze · CineStream © 2026
      </footer>

      {/* PLAYER MODAL */}
      <PlayerModal movie={activeMovie} onClose={() => setActiveMovie(null)} />

      {/* WELCOME MODAL */}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
    </div>
  );
}
