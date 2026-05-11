import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { name, studentId, email } = req.body;

  if (!name || !studentId || !email) {
    return res.status(400).json({ success: false, error: "Full name, student ID, and email are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedStudentId = String(studentId).trim();
  const trimmedName = String(name).trim();

  if (!normalizedEmail.endsWith("@adamson.edu.ph")) {
    return res.status(400).json({
      success: false,
      error: "Only @adamson.edu.ph email addresses are accepted",
    });
  }

  const student = await prisma.student.findFirst({
    where: {
      OR: [{ studentId: normalizedStudentId }, { email: normalizedEmail }],
    },
    include: { registration: true },
  });

  if (student) {
    const exactMatch =
      student.studentId === normalizedStudentId &&
      student.email === normalizedEmail;

    if (!exactMatch) {
      return res.status(409).json({
        success: false,
        error: "That student ID or Adamson email is already being used by another registration.",
      });
    }

    if (student.registration?.status === "pending") {
      return res.status(409).json({
        success: false,
        error: "You have already submitted a registration. Please wait for admin approval.",
        status: "pending",
      });
    }
    if (student.registration?.status === "approved") {
      return res.status(409).json({
        success: false,
        error: "Your registration is already approved. Please continue to the voting page and sign in there.",
        status: "approved",
      });
    }
    if (student.registration?.status === "rejected") {
      return res.status(409).json({
        success: false,
        error: "Your previous registration was rejected. Please contact the admin if you need another review.",
        status: "rejected",
      });
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      studentId: normalizedStudentId,
      name: trimmedName,
      email: normalizedEmail,
    },
  });
}
