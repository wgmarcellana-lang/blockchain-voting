import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getReadOnlyContract } from "@/lib/contract";
import { getServerSigner, getServerSignerContract } from "@/lib/serverContract";
import { requireVoter } from "@/lib/voterAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const session = requireVoter(req, res);
  if (!session) return;

  const { selections } = req.body as { selections?: Record<string, string> };

  if (!selections || Object.keys(selections).length === 0) {
    return res.status(400).json({ success: false, error: "At least one vote selection is required" });
  }

  const registration = await prisma.registration.findUnique({
    where: { voterId: session.voterId },
  });

  if (!registration || registration.studentId !== session.studentId || registration.status !== "approved") {
    return res.status(403).json({ success: false, error: "Your voting access is no longer active." });
  }

  try {
    const readContract = getReadOnlyContract();
    const [isOpen, isAuthorized, hasVoted] = await Promise.all([
      readContract.votingOpen(),
      readContract.authorizedVoters(session.voterId),
      readContract.hasVoted(session.voterId),
    ]);

    if (!isOpen) {
      return res.status(409).json({ success: false, error: "Voting is currently closed." });
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, error: "You are not authorized to vote on-chain." });
    }

    if (hasVoted) {
      return res.status(409).json({ success: false, error: "Your vote has already been recorded." });
    }

    const positionIds = Object.keys(selections).map(BigInt);
    const candidateIds = Object.values(selections).map(BigInt);

    const signer = getServerSigner();
    const contract = getServerSignerContract();
    const tx = await contract.vote(session.voterId, positionIds, candidateIds);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Vote transaction was submitted but no receipt was returned");
    }

    const gasUsed = BigInt(receipt.gasUsed.toString());
    const gasPrice = BigInt(receipt.gasPrice.toString());
    const gasFee = gasUsed * gasPrice;
    const balanceAfter = await signer.provider!.getBalance(signer.address, receipt.blockNumber);
    const balanceBefore = balanceAfter + gasFee;

    return res.status(200).json({
      success: true,
      data: {
        txHash: tx.hash,
        contractAddress: await contract.getAddress(),
        signerAddress: signer.address,
        blockNumber: receipt.blockNumber,
        gasUsed: gasUsed.toString(),
        gasPriceWei: gasPrice.toString(),
        gasFeeWei: gasFee.toString(),
        balanceBeforeWei: balanceBefore.toString(),
        balanceAfterWei: balanceAfter.toString(),
        balanceDeductedWei: (balanceBefore - balanceAfter).toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Vote submission failed";
    return res.status(500).json({ success: false, error: message });
  }
}
