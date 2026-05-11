import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { getServerSignerContract } from "@/lib/serverContract";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  const contract = getServerSignerContract();

  if (req.method === "POST") {
    const { name, positionId } = req.body;
    if (!name || !String(name).trim() || !positionId) {
      return res.status(400).json({ success: false, error: "Candidate name and position are required" });
    }

    try {
      const tx = await contract.addCandidate(String(name).trim(), BigInt(positionId));
      await tx.wait();
      return res.status(200).json({ success: true, data: { txHash: tx.hash } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add candidate";
      return res.status(500).json({ success: false, error: message });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: "Candidate ID is required" });
    }

    try {
      const tx = await contract.removeCandidate(BigInt(id));
      await tx.wait();
      return res.status(200).json({ success: true, data: { txHash: tx.hash } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to remove candidate";
      return res.status(500).json({ success: false, error: message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
