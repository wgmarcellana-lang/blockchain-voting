import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createVoterSessionCookie } from "@/lib/voterAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { studentId, email } = req.body;

  if (!studentId || !email) {
    return res.status(400).json({ success: false, error: "Student ID and email are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const student = await prisma.student.findFirst({
    where: {
      studentId: String(studentId),
      email: normalizedEmail,
    },
    include: { registration: true },
  });

  if (!student) {
    return res.status(404).json({ success: false, error: "No student record found with that ID and email combination" });
  }

  if (!student.registration) {
    return res.status(409).json({ success: false, error: "You have not registered to vote yet." });
  }

  if (student.registration.status !== "approved") {
    if (student.registration.status === "pending") {
      return res.status(409).json({ success: false, error: "Your registration is still pending admin approval." });
    }

    return res.status(409).json({ success: false, error: "Your registration is not approved for voting." });
  }

  res.setHeader("Set-Cookie", createVoterSessionCookie(student.studentId, student.registration.voterId));
  return res.status(200).json({
    success: true,
    data: {
      name: student.name,
      studentId: student.studentId,
    },
  });
}
