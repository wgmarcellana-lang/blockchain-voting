import type { NextApiRequest, NextApiResponse } from "next";
import { clearVoterSessionCookie } from "@/lib/voterAuth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  res.setHeader("Set-Cookie", clearVoterSessionCookie());
  return res.status(200).json({ success: true });
}
