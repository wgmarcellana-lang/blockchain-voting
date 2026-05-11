import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getReadOnlyContract } from "@/lib/contract";
import { requireVoter } from "@/lib/voterAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const session = requireVoter(req, res);
  if (!session) return;

  const registration = await prisma.registration.findUnique({
    where: { voterId: session.voterId },
    include: { student: true },
  });

  if (!registration || registration.studentId !== session.studentId || registration.status !== "approved") {
    return res.status(403).json({ success: false, error: "Your voting access is no longer active." });
  }

  try {
    const contract = getReadOnlyContract();
    const [isOpen, isAuthorized, hasVoted] = await Promise.all([
      contract.votingOpen(),
      contract.authorizedVoters(session.voterId),
      contract.hasVoted(session.voterId),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        student: {
          name: registration.student.name,
          studentId: registration.student.studentId,
        },
        voterId: registration.voterId,
        votingOpen: isOpen,
        authorized: isAuthorized,
        hasVoted,
      },
    });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to read voter status from the blockchain" });
  }
}
