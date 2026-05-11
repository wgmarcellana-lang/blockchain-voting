import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    const students = await prisma.student.findMany({
      include: {
        registration: {
          select: { voterId: true, status: true, createdAt: true, approvedAt: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return res.status(200).json({ success: true, data: students });
  }

  if (req.method === "POST") {
    const { studentId, name, email } = req.body;

    if (!studentId || !name || !email) {
      return res.status(400).json({ success: false, error: "studentId, name, and email are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (!normalizedEmail.endsWith("@adamson.edu.ph")) {
      return res.status(400).json({ success: false, error: "Only @adamson.edu.ph emails allowed" });
    }

    const existing = await prisma.student.findFirst({
      where: { OR: [{ studentId: String(studentId) }, { email: normalizedEmail }] },
    });

    if (existing) {
      return res.status(409).json({ success: false, error: "Student ID or email already exists" });
    }

    const student = await prisma.student.create({
      data: {
        studentId: String(studentId),
        name: name.trim(),
        email: normalizedEmail,
      },
    });

    return res.status(201).json({ success: true, data: student });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
