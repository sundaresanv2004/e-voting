const DEFAULT_LOGIN_REDIRECT = "/admin/organization"

export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = DEFAULT_LOGIN_REDIRECT
) {
  if (!value) return fallback

  let decodedValue = value

  try {
    decodedValue = decodeURIComponent(value)
  } catch {
    return fallback
  }

  if (!decodedValue.startsWith("/") || decodedValue.startsWith("//")) {
    return fallback
  }

  try {
    const parsedUrl = new URL(decodedValue, "http://e-voting.local")
    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
  } catch {
    return fallback
  }
}

export function withLoggedInParam(path: string) {
  const safePath = getSafeRedirectPath(path)
  const separator = safePath.includes("?") ? "&" : "?"

  return `${safePath}${separator}logged_in=true`
}
