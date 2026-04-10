/**
 * API client for communicating with the FastAPI backend.
 * Handles JWT token attachment, response parsing, and error handling.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export interface ApiError {
    detail: string;
    status: number;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Get the JWT token from in-memory storage.
     * We use a module-level variable so the token is cleared on app close (Tauri restart).
     */
    getToken(): string | null {
        if (typeof window === "undefined") return null;
        return window.__evoting_token ?? null;
    }

    setToken(token: string | null): void {
        if (typeof window === "undefined") return;
        if (token) {
            window.__evoting_token = token;
        } else {
            delete window.__evoting_token;
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<T> {
        const token = this.getToken();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string> || {}),
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({
                detail: "An unexpected error occurred",
            }));

            throw {
                detail: error.detail || "Request failed",
                status: response.status,
            } as ApiError;
        }

        return response.json() as Promise<T>;
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "GET" });
    }

    async post<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }
}

// Singleton instance
export const api = new ApiClient();

// Extend Window interface for in-memory token storage
declare global {
    interface Window {
        __evoting_token?: string;
    }
}
