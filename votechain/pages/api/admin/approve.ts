import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { getReadOnlyContract } from "@/lib/contract";
import { getServerSigner, getServerSignerContract, waitForTransactionWithGasLog } from "@/lib/serverContract";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { registrationId } = req.body;

  if (!registrationId) {
    return res.status(400).json({ success: false, error: "Registration ID required" });
  }

  const registration = await prisma.registration.findUnique({
    where: { id: Number(registrationId) },
  });

  if (!registration) {
    return res.status(404).json({ success: false, error: "Registration not found" });
  }

  if (registration.status !== "pending") {
    return res.status(409).json({
      success: false,
      error: `Registration is already ${registration.status}`,
    });
  }

  const readContract = getReadOnlyContract();
  const alreadyAuthorized = await readContract.authorizedVoters(registration.voterId);

  if (!alreadyAuthorized) {
    const signer = getServerSigner();
    const balanceBefore = await signer.provider!.getBalance(signer.address);
    const signerContract = getServerSignerContract();
    const tx = await signerContract.authorizeVoter(registration.voterId);
    await waitForTransactionWithGasLog("Authorize Voter", tx, balanceBefore);
  }

  const updated = await prisma.registration.update({
    where: { id: Number(registrationId) },
    data: { status: "approved", approvedAt: new Date() },
  });

  return res.status(200).json({
    success: true,
    data: {
      voterId: updated.voterId,
      status: updated.status,
      alreadyAuthorized,
    },
  });
}
