import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { studentId, email } = req.body;

  if (!studentId || !email) {
    return res.status(400).json({ success: false, error: "Student ID and email are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // Validate email domain
  if (!normalizedEmail.endsWith("@adamson.edu.ph")) {
    return res.status(400).json({
      success: false,
      error: "Only @adamson.edu.ph email addresses are accepted",
    });
  }

  // Look up student in DB
  const student = await prisma.student.findFirst({
    where: {
      studentId: String(studentId),
      email: normalizedEmail,
    },
    include: { registration: true },
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      error: "No student record found with that ID and email combination",
    });
  }

  // Check if already registered
  if (student.registration) {
    const status = student.registration.status;
    if (status === "pending") {
      return res.status(409).json({
        success: false,
        error: "You have already submitted a registration. Please wait for admin approval.",
        status: "pending",
      });
    }
    if (status === "approved") {
      return res.status(409).json({
        success: false,
        error: "Your registration is already approved. Please continue to the voting page and sign in there.",
        status: "approved",
        voterId: student.registration.voterId,
      });
    }
    if (status === "rejected") {
      return res.status(409).json({
        success: false,
        error: "Your previous registration was rejected. Please contact the admin.",
        status: "rejected",
      });
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      studentId: student.studentId,
      name: student.name,
      email: student.email,
    },
  });
}
