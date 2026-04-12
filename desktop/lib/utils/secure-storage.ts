import { Stronghold } from '@tauri-apps/plugin-stronghold';
import { appDataDir } from '@tauri-apps/api/path';
import { LazyStore } from '@tauri-apps/plugin-store';

const VAULT_NAME = 'evoting_vault.hold';
const VAULT_PASSWORD = 'e-voting-secure-local-vault';
const CLIENT_NAME = 'evoting_client';
const STORE_NAME = 'auth_store.json';

/**
 * Shared utility for secure storage using Tauri Stronghold.
 */
export async function secureSave(key: string, value: string) {
    try {
        const path = `${await appDataDir()}/${VAULT_NAME}`;
        const stronghold = await Stronghold.load(path, VAULT_PASSWORD);
        let client;
        try {
            client = await stronghold.loadClient(CLIENT_NAME);
        } catch {
            client = await stronghold.createClient(CLIENT_NAME);
        }
        const store = client.getStore();
        const data = Array.from(new TextEncoder().encode(value));
        await store.insert(key, data);
        await stronghold.save();
    } catch (e) {
        localStorage.setItem(`secure_${key}`, value);
    }
}

export async function secureGet(key: string): Promise<string | null> {
    try {
        const path = `${await appDataDir()}/${VAULT_NAME}`;
        const stronghold = await Stronghold.load(path, VAULT_PASSWORD);
        const client = await stronghold.loadClient(CLIENT_NAME);
        const store = client.getStore();
        const data = await store.get(key);
        if (!data) return null;
        return new TextDecoder().decode(new Uint8Array(data));
    } catch (e) {
        return localStorage.getItem(`secure_${key}`);
    }
}

export async function secureDelete(key: string) {
    try {
        const path = `${await appDataDir()}/${VAULT_NAME}`;
        const stronghold = await Stronghold.load(path, VAULT_PASSWORD);
        const client = await stronghold.loadClient(CLIENT_NAME);
        const store = client.getStore();
        await store.remove(key);
        await stronghold.save();
    } catch (e) {
        localStorage.removeItem(`secure_${key}`);
    }
}

/**
 * Shared utility for plain metadata storage using Tauri Store.
 */
export async function plainSave(key: string, value: any) {
    try {
        const store = new LazyStore(STORE_NAME);
        await store.set(key, value);
    } catch (e) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

export async function plainGet<T>(key: string): Promise<T | null> {
    try {
        const store = new LazyStore(STORE_NAME);
        return await store.get(key) as T;
    } catch (e) {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
    }
}

export async function plainDelete(key: string) {
    try {
        const store = new LazyStore(STORE_NAME);
        await store.delete(key);
    } catch (e) {
        localStorage.removeItem(key);
    }
}

export async function plainClear() {
    try {
        const store = new LazyStore(STORE_NAME);
        await store.clear();
    } catch (e) {
        localStorage.clear();
    }
}

/**
 * Full system reset: Wipes all sensitive tokens and plain metadata.
 */
export async function secureReset() {
    await secureDelete("systemId");
    await secureDelete("secretToken");
    await plainClear();
}
