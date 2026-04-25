-- AlterTable
ALTER TABLE "AuthorizedSystem" ADD COLUMN     "claimTokenHash" TEXT;

-- AlterTable
ALTER TABLE "ElectionSettings" ADD COLUMN     "allowMultipleVotes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxVotesPerUser" INTEGER NOT NULL DEFAULT 1;
