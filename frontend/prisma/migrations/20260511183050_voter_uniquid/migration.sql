/*
  Warnings:

  - A unique constraint covering the columns `[electionId,uniqueId]` on the table `Voter` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Voter_uniqueId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Voter_electionId_uniqueId_key" ON "Voter"("electionId", "uniqueId");
