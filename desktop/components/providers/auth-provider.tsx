"use client"

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react"
import { api, type ApiError } from "@/lib/api"

// --------------- Types ---------------

export interface AuthUser {
    id: string
    name: string | null
    email: string
    emailVerified: string | null
    image: string | null
    role: "USER" | "STAFF" | "VIEWER" | "ORG_ADMIN" | "ADMIN"
    organizationId: string | null
    isActive: boolean
    lastLoginAt: string | null
    createdAt: string
}

interface AuthResponse {
    access_token: string
    token_type: string
    expires_in: number
    user: AuthUser
}

interface AuthContextType {
    user: AuthUser | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
    refreshUser: () => Promise<void>
    error: string | null
    clearError: () => void
}

// --------------- Context ---------------

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// --------------- Inactivity timeout (1 hour) ---------------
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000 // 1 hour

// --------------- Provider ---------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null)

    const clearError = useCallback(() => setError(null), [])

    // Logout: clear in-memory token and user state
    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout")
        } catch (err) {
            console.error("[Auth] Logout cleanup failed on server:", err)
        } finally {
            api.setToken(null)
            setUser(null)
            setError(null)

            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current)
                inactivityTimer.current = null
            }
        }
    }, [])

    // Reset inactivity timer on user activity
    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current)
        }

        if (api.getToken()) {
            inactivityTimer.current = setTimeout(() => {
                console.log("[Auth] Session expired due to inactivity")
                logout()
            }, INACTIVITY_TIMEOUT_MS)
        }
    }, [logout])

    // Login
    const login = useCallback(
        async (email: string, password: string) => {
            setError(null)
            try {
                const data = await api.post<AuthResponse>("/auth/login", {
                    email,
                    password,
                })
                
                // Check if email is verified
                if (!data.user.emailVerified) {
                    // Do not authenticate yet, just notify the UI
                    const error = new Error("NOT_VERIFIED")
                    ;(error as any).email = data.user.email
                    throw error
                }

                api.setToken(data.access_token)
                setUser(data.user)
                resetInactivityTimer()
            } catch (err) {
                if (err instanceof Error && err.message === "NOT_VERIFIED") {
                    throw err
                }
                const apiError = err as ApiError
                setError(apiError.detail || "Login failed")
                throw err
            }
        },
        [resetInactivityTimer],
    )

    // Signup
    const signup = useCallback(
        async (name: string, email: string, password: string) => {
            setError(null)
            try {
                const data = await api.post<AuthResponse>("/auth/signup", {
                    name,
                    email,
                    password,
                })
                
                // After signup, we always require verification
                // So we don't set the token/user here yet
                const error = new Error("NOT_VERIFIED")
                ;(error as any).email = data.user.email
                throw error

            } catch (err) {
                if (err instanceof Error && err.message === "NOT_VERIFIED") {
                    throw err
                }
                const apiError = err as ApiError
                setError(apiError.detail || "Signup failed")
                throw err
            }
        },
        [resetInactivityTimer],
    )

    const refreshUser = useCallback(async () => {
        try {
            const userData = await api.get<AuthUser>("/auth/me")
            setUser(userData)
        } catch (err) {
            console.error("[Auth] User refresh failed:", err)
        }
    }, [])

    // On mount: check if token exists in memory (e.g. after hot reload in dev)
    useEffect(() => {
        const checkAuth = async () => {
            const token = api.getToken()
            if (!token) {
                setIsLoading(false)
                return
            }

            try {
                const userData = await api.get<AuthUser>("/auth/me")
                setUser(userData)
                resetInactivityTimer()
            } catch {
                // Token is invalid/expired
                api.setToken(null)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [resetInactivityTimer])

    // Add global activity listeners for inactivity tracking
    useEffect(() => {
        const events = ["mousedown", "keydown", "scroll", "touchstart"]

        const handleActivity = () => {
            if (api.getToken()) {
                resetInactivityTimer()
            }
        }

        events.forEach((event) =>
            window.addEventListener(event, handleActivity, { passive: true }),
        )

        return () => {
            events.forEach((event) =>
                window.removeEventListener(event, handleActivity),
            )
            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current)
            }
        }
    }, [resetInactivityTimer])

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                refreshUser,
                error,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// --------------- Hook ---------------

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
