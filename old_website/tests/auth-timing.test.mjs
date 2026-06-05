import test from "node:test"
import assert from "node:assert/strict"

import {
  AUTH_TOKEN_RESEND_COOLDOWN_MS,
  AUTH_TOKEN_RESEND_COOLDOWN_SECONDS,
  AUTH_TOKEN_TTL_MS,
  MAX_AUTH_TOKEN_ATTEMPTS,
} from "../lib/auth/timing.ts"

test("auth token timing constants stay aligned", () => {
  assert.equal(AUTH_TOKEN_TTL_MS, 60 * 60 * 1000)
  assert.equal(AUTH_TOKEN_RESEND_COOLDOWN_MS, 60 * 1000)
  assert.equal(AUTH_TOKEN_RESEND_COOLDOWN_SECONDS, 60)
  assert.equal(MAX_AUTH_TOKEN_ATTEMPTS, 5)
})
