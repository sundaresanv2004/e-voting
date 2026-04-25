const API_BASE_URL = process.env.API_URL || 'http://127.0.0.1:8000/api/v1';

class ApiClient {
    /**
     * Helper to perform standardized fetch requests with consistent error handling
     */
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            // For 204 No Content
            if (response.status === 204) {
                return { success: true, ok: true };
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                return { 
                    success: false, 
                    error: data.detail || data.message || 'An error occurred',
                    status: response.status 
                };
            }

            return { success: true, data, ok: true };
        } catch (error) {
            console.error(`API Request failed for ${endpoint}:`, error);
            // Distinguish between network drops and server crashes
            return { 
                success: false, 
                error: 'Connection failed. Is the backend or internet available?',
                networkError: true 
            };
        }
    }

    static async connectSystem(payload) {
        return this.request('/systems/connect', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    static async getStatus(payload) {
        return this.request('/systems/status', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    static async activateSystem(payload) {
        return this.request('/systems/activate', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    static async verifyTerminal(payload) {
        return this.request('/systems/verify', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    static async logoutSystem(payload) {
        return this.request('/systems/logout', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    static async cancelRegistration(payload) {
        return this.request('/systems/cancel', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
}

module.exports = ApiClient;
