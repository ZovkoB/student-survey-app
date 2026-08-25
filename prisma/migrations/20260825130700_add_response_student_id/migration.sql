-- AlterTable
ALTER TABLE "Response" ADD COLUMN "studentId" TEXT;

-- Backfill is not possible without user linkage; remove orphaned responses if any exist
DELETE FROM "Response" WHERE "studentId" IS NULL;

-- AlterTable
ALTER TABLE "Response" ALTER COLUMN "studentId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Response_studentId_idx" ON "Response"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Response_surveyId_studentId_key" ON "Response"("surveyId", "studentId");

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
