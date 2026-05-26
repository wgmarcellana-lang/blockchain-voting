import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { getServerSigner, getServerSignerContract, waitForTransactionWithGasLog } from "@/lib/serverContract";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  const contract = getServerSignerContract();

  if (req.method === "POST") {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, error: "Position name is required" });
    }

    try {
      const signer = getServerSigner();
      const balanceBefore = await signer.provider!.getBalance(signer.address);
      const tx = await contract.addPosition(String(name).trim());
      await waitForTransactionWithGasLog("Add Position", tx, balanceBefore);
      return res.status(200).json({ success: true, data: { txHash: tx.hash } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add position";
      return res.status(500).json({ success: false, error: message });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: "Position ID is required" });
    }

    try {
      const signer = getServerSigner();
      const balanceBefore = await signer.provider!.getBalance(signer.address);
      const tx = await contract.removePosition(BigInt(id));
      await waitForTransactionWithGasLog("Remove Position", tx, balanceBefore);
      return res.status(200).json({ success: true, data: { txHash: tx.hash } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to remove position";
      return res.status(500).json({ success: false, error: message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
