-- Add lightweight database-backed throttling and token-consumption metadata.
-- Existing token values are kept structurally valid, but the application now
-- stores SHA-256 hashes in the token column for newly generated tokens.

ALTER TABLE "VerificationToken"
ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "lastAttemptAt" TIMESTAMP(3),
ADD COLUMN "consumedAt" TIMESTAMP(3);

CREATE INDEX "VerificationToken_identifier_idx" ON "VerificationToken"("identifier");
CREATE INDEX "VerificationToken_expires_idx" ON "VerificationToken"("expires");

ALTER TABLE "PasswordResetToken"
ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "lastAttemptAt" TIMESTAMP(3),
ADD COLUMN "consumedAt" TIMESTAMP(3);

CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");
CREATE INDEX "PasswordResetToken_expires_idx" ON "PasswordResetToken"("expires");
