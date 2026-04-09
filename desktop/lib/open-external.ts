import { open } from "@tauri-apps/plugin-shell"

/**
 * Opens a URL with the OS default handler.
 * For mailto: links this opens the default mail app.
 * For https: links this opens the default browser.
 */
export async function openExternal(url: string) {
    try {
        await open(url)
    } catch (err) {
        // Fallback for dev mode / browser preview
        window.open(url, "_blank")
    }
}
