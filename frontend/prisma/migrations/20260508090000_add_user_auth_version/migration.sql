-- Add a lightweight session invalidation marker for auth/session-sensitive user changes.
ALTER TABLE "User" ADD COLUMN "authVersion" INTEGER NOT NULL DEFAULT 0;
