DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Voter"
    GROUP BY "uniqueId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot make Voter.uniqueId globally unique because duplicate uniqueId values already exist. Resolve duplicates before applying this migration.';
  END IF;
END $$;

DROP INDEX "Voter_electionId_uniqueId_key";
DROP INDEX "Voter_uniqueId_idx";
CREATE UNIQUE INDEX "Voter_uniqueId_key" ON "Voter"("uniqueId");
