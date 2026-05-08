import test from "node:test"
import assert from "node:assert/strict"

import {
  getSafeRedirectPath,
  withLoggedInParam,
} from "../lib/auth/redirects.ts"

test("getSafeRedirectPath allows internal paths", () => {
  assert.equal(getSafeRedirectPath("/admin/organization"), "/admin/organization")
  assert.equal(
    getSafeRedirectPath("/admin/election/abc?tab=settings#access"),
    "/admin/election/abc?tab=settings#access"
  )
})

test("getSafeRedirectPath rejects external redirects", () => {
  assert.equal(getSafeRedirectPath("https://example.com"), "/admin/organization")
  assert.equal(getSafeRedirectPath("//example.com"), "/admin/organization")
  assert.equal(getSafeRedirectPath("javascript:alert(1)"), "/admin/organization")
})

test("withLoggedInParam preserves existing query strings", () => {
  assert.equal(
    withLoggedInParam("/admin/election/abc?tab=settings"),
    "/admin/election/abc?tab=settings&logged_in=true"
  )
  assert.equal(
    withLoggedInParam("/admin/organization"),
    "/admin/organization?logged_in=true"
  )
})
