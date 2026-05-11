import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

function generateVoterId() {
  return `0x${crypto.randomBytes(32).toString("hex")}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ success: false, error: "Student ID is required" });
  }

  const student = await prisma.student.findUnique({
    where: { studentId: String(studentId) },
    include: { registration: true },
  });

  if (!student) {
    return res.status(404).json({ success: false, error: "Student not found" });
  }

  if (student.registration) {
    return res.status(409).json({
      success: false,
      error: "This student already has a registration",
    });
  }

  const registration = await prisma.registration.create({
    data: {
      studentId: student.studentId,
      voterId: generateVoterId(),
      status: "pending",
    },
  });

  return res.status(201).json({
    success: true,
    data: {
      registrationId: registration.id,
      status: registration.status,
    },
  });
}
