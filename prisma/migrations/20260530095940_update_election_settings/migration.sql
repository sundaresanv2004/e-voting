/*
  Warnings:

  - You are about to drop the column `allowAnonymousVoting` on the `ElectionSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ElectionSettings" DROP COLUMN "allowAnonymousVoting",
ADD COLUMN     "assignVoterToSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inOrgElection" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockResult" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showSummary" BOOLEAN NOT NULL DEFAULT true;
