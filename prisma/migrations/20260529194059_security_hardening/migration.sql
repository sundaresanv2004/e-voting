/*
  Warnings:

  - You are about to drop the column `allowOfflineVoting` on the `ElectionSettings` table. All the data in the column will be lost.
  - The `role` column on the `member` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[voterId,electionId]` on the table `Ballot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Ballot" DROP CONSTRAINT "Ballot_electionId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_ballotId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_electionRoleId_fkey";

-- AlterTable
ALTER TABLE "Ballot" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ElectionSettings" DROP COLUMN "allowOfflineVoting",
ALTER COLUMN "allowOnlineVoting" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "member" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'viewer';

-- CreateIndex
CREATE UNIQUE INDEX "Ballot_voterId_electionId_key" ON "Ballot"("voterId", "electionId");

-- CreateIndex
CREATE INDEX "Election_deletedAt_idx" ON "Election"("deletedAt");

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_ballotId_fkey" FOREIGN KEY ("ballotId") REFERENCES "Ballot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_electionRoleId_fkey" FOREIGN KEY ("electionRoleId") REFERENCES "ElectionRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
