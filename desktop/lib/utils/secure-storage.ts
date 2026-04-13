/**
 * Simple secure storage utility.
 * In production, this should use something more robust for desktop apps,
 * but for now it uses localStorage as a bridge.
 */

export async function secureSave(key: string, value: string) {
    if (typeof window !== "undefined") {
        localStorage.setItem(`_secure_${key}`, value);
    }
}

export async function secureGet(key: string): Promise<string | null> {
    if (typeof window !== "undefined") {
        return localStorage.getItem(`_secure_${key}`);
    }
    return null;
}

export async function secureDelete(key: string) {
    if (typeof window !== "undefined") {
        localStorage.removeItem(`_secure_${key}`);
    }
}

export async function secureReset() {
    if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith("_secure_")) {
                localStorage.removeItem(key);
            }
        });
    }
}

export async function plainSave(key: string, value: any) {
    if (typeof window !== "undefined") {
        localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
}

export async function plainGet<T>(key: string): Promise<T | null> {
    if (typeof window !== "undefined") {
        const item = localStorage.getItem(key);
        if (!item) return null;
        try {
            return JSON.parse(item) as T;
        } catch {
            return item as unknown as T;
        }
    }
    return null;
}

export async function plainClear() {
    if (typeof window !== "undefined") {
        localStorage.clear();
    }
}
