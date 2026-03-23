import axios from "axios";
import { cors } from "../_lib";

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  const query = `{Page(perPage:24){media(type:ANIME,sort:TRENDING_DESC){id title{romaji english}description coverImage{large}averageScore genres startDate{year}}}}`;
  try {
    const resp = await axios.post("https://graphql.anilist.co", { query }, {
      headers: { "Content-Type": "application/json" }, timeout: 12000,
    });
    const media = resp.data?.data?.Page?.media ?? [];
    const items = media.filter((r: any) => r.title?.english || r.title?.romaji).map((r: any) => ({
      id: `anilist-${r.id}`, tmdbId: null, mediaType: "tv",
      title: r.title?.english || r.title?.romaji,
      description: (r.description || "").replace(/<[^>]*>/g, ""),
      releaseDate: r.startDate?.year ? `${r.startDate.year}-01-01` : null,
      duration: null, genre: (r.genres || []).join(", ") || null,
      cover: r.coverImage?.large || null, backdrop: null, country: "Japan",
      imdbRating: r.averageScore ? String((r.averageScore / 10).toFixed(1)) : null,
      subtitles: null, type: 2, hasResource: true, stars: [],
      trailerUrl: null, detailPath: null, season: null, corner: "Anime",
      videoUrls: [], seasons: [], source: "anilist",
    }));
    res.json({ success: true, data: items });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
