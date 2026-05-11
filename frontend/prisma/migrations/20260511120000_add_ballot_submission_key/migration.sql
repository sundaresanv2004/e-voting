-- Add a nullable unique submission key for race-safe online ballot creation.
-- Existing ballots remain valid because PostgreSQL permits multiple NULL values in a unique index.
ALTER TABLE "Ballot" ADD COLUMN "submissionKey" TEXT;

CREATE UNIQUE INDEX "Ballot_submissionKey_key" ON "Ballot"("submissionKey");
