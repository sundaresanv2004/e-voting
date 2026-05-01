-- DropIndex
DROP INDEX "Ballot_voterId_key";

-- AlterTable
ALTER TABLE "ElectionSettings" ADD COLUMN     "allowNota" BOOLEAN NOT NULL DEFAULT false;
