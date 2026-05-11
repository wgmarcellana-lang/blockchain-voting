-- CreateTable
CREATE TABLE IF NOT EXISTS "students" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "registrations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" TEXT NOT NULL,
    "voter_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approved_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "registrations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("student_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "students_student_id_key" ON "students"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "students_email_key" ON "students"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "registrations_student_id_key" ON "registrations"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "registrations_voter_id_key" ON "registrations"("voter_id");
