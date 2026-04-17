// electron/main.js
const { app, BrowserWindow, ipcMain, shell, nativeTheme, safeStorage } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { machineIdSync } = require('node-machine-id');

const os = require('os');

const ApiClient = require('./api_client');

// Initialize Store
const store = new Store();

function clearLocalTerminalData() {
    store.delete('systemId');
    store.delete('secretToken');
    store.delete('terminalStatus');
    store.delete('organizationName');
    store.delete('organizationLogo');
    store.delete('organizationLogoCache');
    store.delete('systemName');
    store.set('terminalStatus', 'UNREGISTERED');
    
    if (mainWindow) {
        mainWindow.webContents.send('terminal:status-updated', 'UNREGISTERED');
    }
}

function handleApiResult(result) {
    if (result && result.networkError && mainWindow) {
        mainWindow.webContents.send('terminal:network-error', 'backend');
    }
    // If the record was deleted from the dashboard (404), purge local state
    if (result && result.status === 404) {
        clearLocalTerminalData();
    }
    return result;
}

/**
 * Captures basic system information for registration.
 */
function getSystemInfo() {
  const networkInterfaces = os.networkInterfaces();
  let macAddress = machineIdSync(); // Fallback to machineId
  
  // Try to find a real MAC address
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
        macAddress = iface.mac;
        break;
      }
    }
  }

  return {
    macAddress,
    hostName: os.hostname(),
    platform: os.platform(),
    ipAddress: '127.0.0.1' // In a real app, you might fetch external IP
  };
}

/**
 * Securely saves the secret token using Electron's safeStorage API.
 */
function saveSecretToken(token) {
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(token);
    store.set('secretToken', encrypted.toString('base64'));
    return true;
  }
  return false;
}

/**
 * Retrieves and decrypts the secret token.
 */
function getSecretToken() {
  const encryptedBase64 = store.get('secretToken');
  if (encryptedBase64 && safeStorage.isEncryptionAvailable()) {
    try {
        return safeStorage.decryptString(Buffer.from(encryptedBase64, 'base64'));
    } catch (e) {
        console.error("Failed to decrypt token:", e);
        return null;
    }
  }
  return null;
}

app.setName('E-Voting');

/**
 * Downloads a logo from a URL and caches it as a Base64 string in the store.
 */
async function cacheLogo(url) {
  if (!url) return;
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;
    store.set('organizationLogoCache', dataUrl);
  } catch (e) {
    console.error("Failed to cache logo:", e);
  }
}

// Phase 3: Registration & Verification Logic
ipcMain.handle('terminal:get-identity', async () => {
  return {
    systemId: store.get('systemId'),
    systemName: store.get('systemName'),
    organizationName: store.get('organizationName'),
    organizationLogo: store.get('organizationLogoCache') || store.get('organizationLogo'),
    machineId: machineIdSync(),
    hasToken: !!store.get('secretToken')
  };
});

ipcMain.handle('terminal:get-status', async () => {
    const systemId = store.get('systemId');
    const token = getSecretToken();
    const storedStatus = store.get('terminalStatus');
    
    if (!systemId) return 'UNREGISTERED';
    
    // If we have a stored status that isn't APPROVED (like REJECTED), use it.
    if (storedStatus && storedStatus !== 'APPROVED') {
        return storedStatus;
    }

    if (!token) return 'PENDING';
    return storedStatus || 'APPROVED';
});

ipcMain.handle('terminal:register', async (event, { organizationCode, systemName }) => {
    const sysInfo = getSystemInfo();
    
    try {
        const result = handleApiResult(await ApiClient.connectSystem({
            organizationCode,
            systemName,
            macAddress: sysInfo.macAddress,
            hostName: sysInfo.hostName,
            ipAddress: sysInfo.ipAddress
        }));

        if (result.success && result.data?.success) {
            const data = result.data;
            store.set('systemId', data.systemId);
            store.set('systemName', systemName);
            store.set('organizationName', data.organizationName);
            store.set('terminalStatus', 'PENDING');
            
            // Start polling for approval immediately
            startStatusPolling(data.systemId);
            
            return { success: true, systemId: data.systemId };
        } else {
            return { success: false, error: result.error || 'Registration failed' };
        }
    } catch (error) {
        return { success: false, error: 'Connection failed. Is the backend running?' };
    }
});

ipcMain.handle('terminal:logout', async () => {
    const systemId = store.get('systemId');
    try {
        if (systemId) {
            handleApiResult(await ApiClient.revokeSystem(systemId));
        }
    } catch (e) {
        console.error("Logout API call failed:", e);
    } finally {
        // Use the centralized purge helper
        clearLocalTerminalData();
    }
    return { success: true };
});

// Verification Poller (to check for approval)
let pollInterval;
function startStatusPolling(systemId) {
    if (pollInterval) clearInterval(pollInterval);
    
    pollInterval = setInterval(async () => {
        try {
            const result = handleApiResult(await ApiClient.getStatus(systemId));
            if (result.success && result.data) {
                const data = result.data;
                if (data.status === 'APPROVED' && data.secretToken) {
                    saveSecretToken(data.secretToken);
                    store.set('terminalStatus', 'APPROVED');
                    const oldLogoUrl = store.get('organizationLogo');
                    store.set('organizationLogo', data.organizationLogo);
                    
                    if (data.organizationLogo) {
                        // Only re-cache if URL changed or cache is missing
                        if (data.organizationLogo !== oldLogoUrl || !store.has('organizationLogoCache')) {
                            cacheLogo(data.organizationLogo);
                        }
                    } else {
                        // Logo was removed from server, clear local cache
                        store.delete('organizationLogoCache');
                    }

                    if (mainWindow) {
                        mainWindow.webContents.send('terminal:status-updated', 'APPROVED');
                    }
                    clearInterval(pollInterval);
                } else if (data.status === 'REJECTED') {
                    // Admin rejected the request. Update status but don't clear ID yet
                    // so the UI can show the "Denied" message.
                    store.set('terminalStatus', 'REJECTED');

                    if (mainWindow) {
                        mainWindow.webContents.send('terminal:status-updated', 'REJECTED');
                    }
                    clearInterval(pollInterval);
                }
            }
        } catch (e) {
            console.error("Polling error:", e);
        }
    }, 5000);
}

ipcMain.handle('terminal:cancel-registration', async () => {
    const systemId = store.get('systemId');
    try {
        if (systemId) {
            // Call the backend DELETE endpoint as requested
            handleApiResult(await ApiClient.cancelRegistration(systemId));
        }
    } catch (e) {
        console.error("Cancel registration API call failed:", e);
    } finally {
        // Use the centralized purge helper
        clearLocalTerminalData();
    }
    return { success: true };
});

ipcMain.handle('terminal:reset-registration-state', async () => {
    // This just clears local state without calling the DELETE API.
    clearLocalTerminalData();
    return { success: true };
});

ipcMain.handle('terminal:verify-handshake', async () => {
    const systemId = store.get('systemId');
    const status = store.get('terminalStatus');
    const secretToken = getSecretToken();

    if (!systemId) return { success: false, status: 'UNREGISTERED' };

    // 2. If PENDING, EXPIRED, or REVOKED, start polling for approval/renewal/restores
    if (status === 'PENDING' || status === 'EXPIRED' || status === 'REVOKED') {
        startStatusPolling(systemId);
        return { success: true, status };
    }

    // 3. If REJECTED, there's nothing to poll, we stay in REJECTED state
    if (status === 'REJECTED') {
        return { success: true, status: 'REJECTED' };
    }

    // 4. If APPROVED, perform a Handshake (Verify)
    if (status === 'APPROVED' && secretToken) {
        try {
            const sysInfo = getSystemInfo();
            const result = handleApiResult(await ApiClient.verifyTerminal({
                systemId,
                secretToken,
                macAddress: sysInfo.macAddress
            }));

            if (result.success && result.data) {
                const data = result.data;
            
                if (data.valid) {
                    store.set('terminalStatus', 'APPROVED');
                    // Update cache with fresh data
                    const oldLogoUrl = store.get('organizationLogo');
                    store.set('organizationName', data.organizationName);
                    store.set('organizationLogo', data.organizationLogo);
                    store.set('systemName', data.systemName);

                    // Background cache the image for offline usage
                    if (data.organizationLogo) {
                        // Only re-cache if URL changed or cache is missing
                        if (data.organizationLogo !== oldLogoUrl || !store.has('organizationLogoCache')) {
                            cacheLogo(data.organizationLogo);
                        }
                    } else {
                        // Logo was removed from server, clear local cache
                        store.delete('organizationLogoCache');
                    }
                    return { success: true, status: 'APPROVED' };
                } else {
                    // VERIFICATION FAILED - Be precise about the new status
                    const serverStatus = data.status;
                    
                    if (serverStatus === 'PENDING') {
                        store.set('terminalStatus', 'PENDING');
                        startStatusPolling(systemId);
                    } else if (serverStatus === 'REJECTED') {
                        store.set('terminalStatus', 'REJECTED');
                    } else if (serverStatus === 'REVOKED' || serverStatus === 'SUSPENDED') {
                        store.set('terminalStatus', 'REVOKED');
                        // We keep the systemId but clear the secretToken as it's no longer valid
                        store.delete('secretToken');
                        startStatusPolling(systemId);
                    } else if (serverStatus === 'EXPIRED') {
                        store.set('terminalStatus', 'EXPIRED');
                        startStatusPolling(systemId);
                    } else {
                        // Fallback for missing/deleted records
                        store.delete('systemId');
                        store.delete('secretToken');
                        store.delete('systemName');
                        store.delete('organizationName');
                        store.delete('organizationLogo');
                        store.delete('organizationLogoCache');
                        store.set('terminalStatus', 'UNREGISTERED');
                    }
                    return { success: false, status: store.get('terminalStatus') };
                }
            }
        } catch (e) {
            console.error("Startup handshake failed:", e);
            // On network error, we stay "APPROVED" but in an offline/cached mode
            return { success: false, status: 'APPROVED', networkError: true };
        }
    }

    return { success: false, status: store.get('terminalStatus') || 'UNREGISTERED' };
});

// Auto-start
app.whenReady().then(async () => {
    createWindow();
});

ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});

ipcMain.on('set-theme', (event, theme) => {
  nativeTheme.themeSource = theme; // 'light', 'dark', or 'system'
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 480,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Force external links to open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.maximize();

  // Dev -> loads your Next.js dev server
  // Production -> loads built static files
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

// app.whenReady is handled in the Handshake section below

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
