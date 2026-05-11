import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getVoterSession } from "@/lib/voterAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const session = getVoterSession(req);
  if (!session) {
    return res.status(200).json({ success: true, data: { authenticated: false } });
  }

  const student = await prisma.student.findUnique({
    where: { studentId: session.studentId },
    include: { registration: true },
  });

  if (!student || !student.registration || student.registration.voterId !== session.voterId || student.registration.status !== "approved") {
    return res.status(200).json({ success: true, data: { authenticated: false } });
  }

  return res.status(200).json({
    success: true,
    data: {
      authenticated: true,
      student: {
        name: student.name,
        studentId: student.studentId,
      },
    },
  });
}
