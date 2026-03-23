import axios from "axios";
import { formatJikanAnime, cors } from "../_lib";

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const [top, seasonal] = await Promise.allSettled([
      axios.get("https://api.jikan.moe/v4/top/anime?limit=24&filter=airing", { timeout: 12000 }),
      axios.get("https://api.jikan.moe/v4/seasons/now?limit=24", { timeout: 12000 }),
    ]);
    const topData = top.status === "fulfilled" ? top.value.data?.data ?? [] : [];
    const seasonalData = seasonal.status === "fulfilled" ? seasonal.value.data?.data ?? [] : [];
    const seen = new Set<string>(); const items: any[] = [];
    for (const r of [...topData, ...seasonalData]) {
      const k = String(r.mal_id);
      if (!seen.has(k)) { seen.add(k); items.push(formatJikanAnime(r)); }
    }
    res.json({ success: true, data: items });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
