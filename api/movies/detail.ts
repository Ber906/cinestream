import { tmdb, formatItem, cors } from "../_lib";

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  const id = (req.query?.slug as string) || (req.query?.id as string) || "";
  const type = (req.query?.type as string) || "movie";
  if (!id) return res.status(400).json({ success: false, error: "Missing id" });
  try {
    const path = type === "tv" ? `/tv/${id}` : `/movie/${id}`;
    const data = await tmdb(path, { append_to_response: "credits,seasons" });
    res.json({ success: true, data: formatItem(data, type as "movie" | "tv") });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
