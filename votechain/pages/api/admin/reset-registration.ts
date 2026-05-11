import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { getReadOnlyContract } from "@/lib/contract";
import { getServerSignerContract } from "@/lib/serverContract";

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
    include: {
      student: {
        select: { name: true, studentId: true },
      },
    },
  });

  if (!registration) {
    return res.status(404).json({ success: false, error: "Registration not found" });
  }

  if (registration.status === "approved") {
    const readContract = getReadOnlyContract();
    const [isAuthorized, hasVoted] = await Promise.all([
      readContract.authorizedVoters(registration.voterId),
      readContract.hasVoted(registration.voterId),
    ]);

    if (hasVoted) {
      return res.status(409).json({ success: false, error: "This voter has already voted and cannot be reset." });
    }

    if (isAuthorized) {
      const signerContract = getServerSignerContract();
      const tx = await signerContract.revokeVoter(registration.voterId);
      await tx.wait();
    }
  }

  await prisma.registration.delete({
    where: { id: Number(registrationId) },
  });

  return res.status(200).json({
    success: true,
    data: {
      studentName: registration.student.name,
      studentId: registration.student.studentId,
      voterId: registration.voterId,
      previousStatus: registration.status,
    },
  });
}
