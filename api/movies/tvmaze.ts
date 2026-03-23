import axios from "axios";
import { formatTVmazeShow, cors } from "../_lib";

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const resp = await axios.get("https://api.tvmaze.com/shows?page=0", { timeout: 10000 });
    const items = (resp.data || []).slice(0, 30).map(formatTVmazeShow);
    res.json({ success: true, data: items });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
