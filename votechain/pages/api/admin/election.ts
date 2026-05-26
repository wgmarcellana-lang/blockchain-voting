import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { getServerSigner, getServerSignerContract, waitForTransactionWithGasLog } from "@/lib/serverContract";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { action } = req.body as { action?: "open" | "close" };
  if (!action) {
    return res.status(400).json({ success: false, error: "Election action is required" });
  }

  try {
    const signer = getServerSigner();
    const contract = getServerSignerContract();
    const balanceBefore = await signer.provider!.getBalance(signer.address);
    const tx = action === "open"
      ? await contract.openVoting()
      : await contract.closeVoting();
    await waitForTransactionWithGasLog(`${action === "open" ? "Open" : "Close"} Voting`, tx, balanceBefore);

    return res.status(200).json({ success: true, data: { txHash: tx.hash } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update election state";
    return res.status(500).json({ success: false, error: message });
  }
}
