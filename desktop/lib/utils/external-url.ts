/**
 * Gracefully opens an external URL using Tauri's opener plugin if available,
 * falling back to window.open for browser environments.
 */
export async function openExternalUrl(path: string) {
    const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "https://evoting.sundaresan.dev";
    const url = path.startsWith("http") || path.startsWith("mailto:") ? path : `${baseUrl}${path}`;

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tauri = (window as any).__TAURI__;
        if (tauri?.opener?.openUrl) {
            await tauri.opener.openUrl(url);
        } else {
            window.open(url, "_blank", "noopener,noreferrer");
        }
    } catch (e) {
        console.error("Failed to open external URL:", e);
        window.open(url, "_blank", "noopener,noreferrer");
    }
}
