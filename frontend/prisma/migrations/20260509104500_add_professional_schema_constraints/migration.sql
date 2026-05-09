DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "User"
    GROUP BY lower("email")
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add case-insensitive email uniqueness because duplicate emails differing only by case already exist.';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Candidate"
    GROUP BY "electionRoleId", lower("name")
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add candidate name uniqueness because duplicate candidate names exist within an election role.';
  END IF;
END $$;

CREATE UNIQUE INDEX "User_email_lower_key" ON "User"(lower("email"));
CREATE UNIQUE INDEX "Candidate_electionRoleId_name_key" ON "Candidate"("electionRoleId", "name");
CREATE UNIQUE INDEX "Candidate_electionRoleId_name_lower_key" ON "Candidate"("electionRoleId", lower("name"));

ALTER TABLE "ElectionSettings"
ADD CONSTRAINT "ElectionSettings_maxVotesPerUser_check"
CHECK ("maxVotesPerUser" >= 1 AND "maxVotesPerUser" <= 10);

ALTER TABLE "ElectionSettings"
ADD CONSTRAINT "ElectionSettings_voting_mode_check"
CHECK (NOT ("allowOnlineVoting" = true AND "allowOfflineVoting" = true));

ALTER TABLE "ElectionSettings"
ADD CONSTRAINT "ElectionSettings_online_requires_authorization_check"
CHECK (NOT ("allowOnlineVoting" = true AND "authorizeVoters" = false));
