import axios from "axios";
import { tmdb, formatItem, formatJikanAnime, formatTVmazeShow, cors } from "../_lib";

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  const keyword = (req.query?.q as string) || "";
  if (!keyword.trim()) return res.json({ success: true, data: [] });
  try {
    const [tmdbRes, jikanRes, tvmazeRes] = await Promise.allSettled([
      tmdb("/search/multi", { query: keyword, page: "1" }),
      axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(keyword)}&limit=5`, { timeout: 8000 }),
      axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(keyword)}`, { timeout: 8000 }),
    ]);
    const items: any[] = []; const seen = new Set<string>();
    if (tmdbRes.status === "fulfilled") for (const r of tmdbRes.value.results ?? []) {
      if (r.media_type === "movie" || r.media_type === "tv") {
        items.push(formatItem(r)); seen.add((r.title ?? r.name ?? "").toLowerCase());
      }
    }
    if (jikanRes.status === "fulfilled") for (const r of jikanRes.value.data?.data ?? []) {
      const t = (r.title_english || r.title || "").toLowerCase();
      if (!seen.has(t)) { seen.add(t); items.push(formatJikanAnime(r)); }
    }
    if (tvmazeRes.status === "fulfilled") for (const r of tvmazeRes.value.data ?? []) {
      const t = (r.show?.name || "").toLowerCase();
      if (!seen.has(t)) { seen.add(t); items.push(formatTVmazeShow(r)); }
    }
    res.json({ success: true, data: items, keyword });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
