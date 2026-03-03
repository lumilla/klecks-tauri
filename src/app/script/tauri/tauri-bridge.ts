/**
 * Tauri bridge
 * Bridges Klecks file operations to native Tauri APIs.
 * This module detects when running inside Tauri and provides native
 * file open/save dialogs instead of browser-based ones.
 */

declare global {
    interface Window {
        __TAURI__?: any;
        __TAURI_INTERNALS__?: any;
    }
}

export function isTauri(): boolean {
    return !!(window.__TAURI_INTERNALS__ || window.__TAURI__);
}

let tauriDialog: any = null;
let tauriInvoke: any = null;

async function ensureTauriModules(): Promise<void> {
    if (!tauriDialog) {
        tauriDialog = await import('@tauri-apps/plugin-dialog');
    }
    if (!tauriInvoke) {
        const core = await import('@tauri-apps/api/core');
        tauriInvoke = core.invoke;
    }
}

/**
 * Open a native file picker and return the file contents as an ArrayBuffer + filename
 */
export async function tauriOpenFile(
    filters?: { name: string; extensions: string[] }[],
): Promise<{ data: ArrayBuffer; name: string } | null> {
    await ensureTauriModules();
    const selected = await tauriDialog.open({
        multiple: false,
        filters: filters ?? [
            {
                name: 'Image Files',
                extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'psd', 'bmp'],
            },
        ],
    });
    if (!selected) {
        return null;
    }
    const filePath = typeof selected === 'string' ? selected : selected.path;
    const bytes: number[] = await tauriInvoke('read_file_bytes', { path: filePath });
    const uint8 = new Uint8Array(bytes);
    const name = filePath.split(/[\\/]/).pop() || 'file';
    return { data: uint8.buffer, name };
}

/**
 * Show a native save dialog and write a Blob to the selected path
 */
export async function tauriSaveFile(
    blob: Blob,
    suggestedName: string,
    filters?: { name: string; extensions: string[] }[],
): Promise<boolean> {
    await ensureTauriModules();

    // Determine default filter from blob type
    const defaultFilters: { name: string; extensions: string[] }[] = [];
    if (blob.type === 'image/png') {
        defaultFilters.push({ name: 'PNG Image', extensions: ['png'] });
    } else if (blob.type === 'image/vnd.adobe.photoshop') {
        defaultFilters.push({ name: 'PSD Document', extensions: ['psd'] });
    } else {
        defaultFilters.push({ name: 'All Files', extensions: ['*'] });
    }

    const savePath = await tauriDialog.save({
        defaultPath: suggestedName,
        filters: filters ?? defaultFilters,
    });
    if (!savePath) {
        return false; // user cancelled
    }

    const arrayBuf = await blob.arrayBuffer();
    const bytes = Array.from(new Uint8Array(arrayBuf));
    await tauriInvoke('write_file_bytes', { path: savePath, contents: bytes });
    return true;
}

/**
 * Get the app version from the Tauri backend
 */
export async function tauriGetVersion(): Promise<string> {
    await ensureTauriModules();
    return await tauriInvoke('get_app_version');
}
