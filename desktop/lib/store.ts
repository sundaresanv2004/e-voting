import { load } from "@tauri-apps/plugin-store"

export interface SystemData {
    systemId: string
    organizationId: string
    systemType: "ADMIN" | "VOTE"
    accessToken?: string
    expiresAt?: string
}

const STORE_PATH = "system_config.json"

export async function saveSystemData(data: SystemData) {
    const store = await load(STORE_PATH)
    await store.set("system_identity", data)
    await store.save()
}

export async function getSystemData(): Promise<SystemData | null> {
    try {
        const store = await load(STORE_PATH)
        return await store.get<SystemData>("system_identity")
    } catch (e) {
        console.error("Failed to load system data:", e)
        return null
    }
}

export async function clearSystemData() {
    const store = await load(STORE_PATH)
    await store.delete("system_identity")
    await store.save()
}
