import { tmdb, formatItem, cors } from "../_lib";

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const [pop, top] = await Promise.all([
      tmdb("/tv/popular", { page: "1" }),
      tmdb("/tv/top_rated", { page: "1" }),
    ]);
    const seen = new Set<string>(); const items: any[] = [];
    for (const r of [...(pop.results ?? []), ...(top.results ?? [])]) {
      const k = String(r.id);
      if (!seen.has(k)) { seen.add(k); items.push(formatItem(r, "tv")); }
    }
    res.json({ success: true, data: items });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
