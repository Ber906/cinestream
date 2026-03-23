import { tmdb, formatItem, cors } from "../_lib";

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  const title = (req.query?.title as string) || "";
  const type = (req.query?.type as string) || "tv";
  if (!title) return res.status(400).json({ success: false, error: "Missing title" });
  try {
    const searchPath = type === "movie" ? "/search/movie" : "/search/tv";
    const data = await tmdb(searchPath, { query: title, page: 1 });
    const result = data.results?.[0];
    if (!result) return res.json({ success: false, error: "Not found on TMDB" });
    const detailPath = type === "movie" ? `/movie/${result.id}` : `/tv/${result.id}`;
    const detail = await tmdb(detailPath, { append_to_response: "credits,seasons" });
    res.json({ success: true, data: formatItem(detail, type as "movie" | "tv") });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
