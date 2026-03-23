import { tmdb, formatItem, cors } from "../_lib";

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const data = await tmdb("/trending/all/week");
    const items = (data.results ?? [])
      .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
      .map((r: any) => formatItem(r));
    res.json({ success: true, data: items });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
