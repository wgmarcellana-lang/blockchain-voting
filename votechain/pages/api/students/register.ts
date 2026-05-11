import crypto from "crypto";
import { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

function generateVoterId() {
  return `0x${crypto.randomBytes(32).toString("hex")}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    const { name, studentId, email } = req.body;

    if (!name || !studentId || !email) {
      return res.status(400).json({ success: false, error: "Full name, student ID, and email are required" });
    }

    const trimmedName = String(name).trim();
    const normalizedStudentId = String(studentId).trim();
    const normalizedEmail = String(email).toLowerCase().trim();

    if (!trimmedName) {
      return res.status(400).json({ success: false, error: "Full name is required" });
    }

    if (!normalizedEmail.endsWith("@adamson.edu.ph")) {
      return res.status(400).json({
        success: false,
        error: "Only @adamson.edu.ph email addresses are accepted",
      });
    }

    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ studentId: normalizedStudentId }, { email: normalizedEmail }],
      },
      include: { registration: true },
    });

    if (existingStudent) {
      const exactMatch =
        existingStudent.studentId === normalizedStudentId &&
        existingStudent.email === normalizedEmail;

      if (!exactMatch) {
        return res.status(409).json({
          success: false,
          error: "That student ID or Adamson email is already being used by another registration.",
        });
      }

      if (existingStudent.registration) {
        const status = existingStudent.registration.status;

        if (status === "pending") {
          return res.status(409).json({
            success: false,
            error: "You have already submitted a registration. Please wait for admin approval.",
          });
        }

        if (status === "approved") {
          return res.status(409).json({
            success: false,
            error: "Your registration is already approved. Please continue to the voting page and sign in there.",
          });
        }

        if (status === "rejected") {
          return res.status(409).json({
            success: false,
            error: "Your previous registration was rejected. Please contact the admin if you need another review.",
          });
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const student = existingStudent
        ? await tx.student.update({
            where: { id: existingStudent.id },
            data: { name: trimmedName },
          })
        : await tx.student.create({
            data: {
              name: trimmedName,
              studentId: normalizedStudentId,
              email: normalizedEmail,
            },
          });

      const registration = await tx.registration.create({
        data: {
          studentId: student.studentId,
          voterId: generateVoterId(),
          status: "pending",
        },
      });

      return { student, registration };
    });

    return res.status(201).json({
      success: true,
      data: {
        student: {
          name: result.student.name,
          studentId: result.student.studentId,
          email: result.student.email,
        },
        registrationId: result.registration.id,
        status: result.registration.status,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "That student ID or Adamson email is already being used by another registration.",
      });
    }

    const message = error instanceof Error ? error.message : "Registration failed.";
    return res.status(500).json({ success: false, error: message });
  }
}
