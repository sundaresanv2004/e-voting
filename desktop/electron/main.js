const { app, BrowserWindow, ipcMain, shell, nativeTheme, safeStorage } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { machineIdSync } = require('node-machine-id');
const os = require('os');

const ApiClient = require('./api_client');

const store = new Store();

function saveSecureValue(key, value) {
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(value);
    store.set(key, encrypted.toString('base64'));
    return true;
  }
  return false;
}

function getSecureValue(key) {
  const encryptedBase64 = store.get(key);
  if (encryptedBase64 && safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.decryptString(Buffer.from(encryptedBase64, 'base64'));
    } catch (e) {
      console.error(`Failed to decrypt ${key}:`, e);
      return null;
    }
  }
  return null;
}

function clearSecureValue(key) {
  store.delete(key);
}

function clearLocalTerminalData() {
  store.delete('systemId');
  clearSecureValue('claimToken');
  clearSecureValue('secretToken');
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
  if (result && result.status === 404) {
    clearLocalTerminalData();
  }
  return result;
}

function getSystemInfo() {
  const networkInterfaces = os.networkInterfaces();
  let macAddress = machineIdSync();

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
    ipAddress: '127.0.0.1'
  };
}

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
    console.error('Failed to cache logo:', e);
  }
}

function updateApprovedTerminalState(data) {
  const oldLogoUrl = store.get('organizationLogo');
  store.set('terminalStatus', 'APPROVED');
  store.set('organizationName', data.organizationName);
  store.set('organizationLogo', data.organizationLogo);
  store.set('systemName', data.systemName);

  if (data.organizationLogo) {
    if (data.organizationLogo !== oldLogoUrl || !store.has('organizationLogoCache')) {
      cacheLogo(data.organizationLogo);
    }
  } else {
    store.delete('organizationLogoCache');
  }
}

async function activateApprovedSystem(systemId, claimToken) {
  const sysInfo = getSystemInfo();
  const result = handleApiResult(await ApiClient.activateSystem({
    systemId,
    claimToken,
    macAddress: sysInfo.macAddress
  }));

  if (result.success && result.data?.success && result.data.secretToken) {
    saveSecureValue('secretToken', result.data.secretToken);
    updateApprovedTerminalState(result.data);
    if (mainWindow) {
      mainWindow.webContents.send('terminal:status-updated', 'APPROVED');
    }
    return { success: true, status: 'APPROVED' };
  }

  if (result.success && result.data) {
    const nextStatus = result.data.status || 'PENDING';
    store.set('terminalStatus', nextStatus === 'SUSPENDED' ? 'REVOKED' : nextStatus);
    if (mainWindow) {
      mainWindow.webContents.send('terminal:status-updated', store.get('terminalStatus'));
    }
    return { success: false, status: store.get('terminalStatus') };
  }

  return { success: false, status: store.get('terminalStatus') || 'UNREGISTERED' };
}

let pollInterval;
function stopStatusPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

function startStatusPolling(systemId) {
  const claimToken = getSecureValue('claimToken');
  if (!claimToken) return;

  stopStatusPolling();

  pollInterval = setInterval(async () => {
    try {
      const result = handleApiResult(await ApiClient.getStatus({ systemId, claimToken }));
      if (result.success && result.data) {
        const data = result.data;

        if (data.status === 'APPROVED' && data.activationReady) {
          const activation = await activateApprovedSystem(systemId, claimToken);
          if (activation.success) {
            stopStatusPolling();
          }
          return;
        }

        if (data.status === 'REJECTED') {
          store.set('terminalStatus', 'REJECTED');
          if (mainWindow) {
            mainWindow.webContents.send('terminal:status-updated', 'REJECTED');
          }
          stopStatusPolling();
          return;
        }

        if (['PENDING', 'EXPIRED', 'REVOKED', 'SUSPENDED'].includes(data.status)) {
          const mappedStatus = data.status === 'SUSPENDED' ? 'REVOKED' : data.status;
          store.set('terminalStatus', mappedStatus);
          if (mainWindow) {
            mainWindow.webContents.send('terminal:status-updated', mappedStatus);
          }
        }
      }
    } catch (e) {
      console.error('Polling error:', e);
    }
  }, 5000);
}

app.setName('E-Voting');

ipcMain.handle('terminal:get-identity', async () => {
  return {
    systemId: store.get('systemId'),
    systemName: store.get('systemName'),
    organizationName: store.get('organizationName'),
    organizationLogo: store.get('organizationLogoCache') || store.get('organizationLogo'),
    machineId: machineIdSync(),
    hasToken: !!getSecureValue('secretToken'),
    hasClaimToken: !!getSecureValue('claimToken')
  };
});

ipcMain.handle('terminal:get-status', async () => {
  const systemId = store.get('systemId');
  const token = getSecureValue('secretToken');
  const claimToken = getSecureValue('claimToken');
  const storedStatus = store.get('terminalStatus');

  if (!systemId) return 'UNREGISTERED';
  if (storedStatus && storedStatus !== 'APPROVED') return storedStatus;
  if (!claimToken && !token) return 'UNREGISTERED';
  if (!token) return storedStatus || 'PENDING';
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

    if (result.success && result.data?.success && result.data.claimToken) {
      const data = result.data;
      store.set('systemId', data.systemId);
      store.set('systemName', systemName);
      store.set('organizationName', data.organizationName);
      saveSecureValue('claimToken', data.claimToken);
      clearSecureValue('secretToken');
      store.set('terminalStatus', 'PENDING');
      startStatusPolling(data.systemId);
      return { success: true, systemId: data.systemId };
    }

    return { success: false, error: result.error || 'Registration failed' };
  } catch (error) {
    return { success: false, error: 'Connection failed. Is the backend running?' };
  }
});

ipcMain.handle('terminal:logout', async () => {
  const systemId = store.get('systemId');
  const secretToken = getSecureValue('secretToken');
  try {
    if (systemId && secretToken) {
      handleApiResult(await ApiClient.logoutSystem({ systemId, secretToken }));
    }
  } catch (e) {
    console.error('Logout API call failed:', e);
  } finally {
    stopStatusPolling();
    clearLocalTerminalData();
  }
  return { success: true };
});

ipcMain.handle('terminal:cancel-registration', async () => {
  const systemId = store.get('systemId');
  const claimToken = getSecureValue('claimToken');
  try {
    if (systemId && claimToken) {
      handleApiResult(await ApiClient.cancelRegistration({ systemId, claimToken }));
    }
  } catch (e) {
    console.error('Cancel registration API call failed:', e);
  } finally {
    stopStatusPolling();
    clearLocalTerminalData();
  }
  return { success: true };
});

ipcMain.handle('terminal:reset-registration-state', async () => {
  stopStatusPolling();
  clearLocalTerminalData();
  return { success: true };
});

ipcMain.handle('terminal:verify-handshake', async () => {
  const systemId = store.get('systemId');
  const status = store.get('terminalStatus');
  const secretToken = getSecureValue('secretToken');
  const claimToken = getSecureValue('claimToken');

  if (!systemId) return { success: false, status: 'UNREGISTERED' };

  if (status === 'PENDING' || status === 'EXPIRED' || status === 'REVOKED') {
    startStatusPolling(systemId);
    return { success: true, status };
  }

  if (status === 'REJECTED') {
    return { success: true, status: 'REJECTED' };
  }

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
          updateApprovedTerminalState(data);
          return { success: true, status: 'APPROVED' };
        }

        const serverStatus = data.status;

        if (serverStatus === 'TOKEN_ROTATED') {
          clearSecureValue('secretToken');
          if (claimToken) {
            const activation = await activateApprovedSystem(systemId, claimToken);
            if (activation.success) {
              return activation;
            }
          }
          store.set('terminalStatus', 'PENDING');
          startStatusPolling(systemId);
          return { success: false, status: 'PENDING' };
        }

        if (serverStatus === 'REJECTED') {
          store.set('terminalStatus', 'REJECTED');
        } else if (serverStatus === 'REVOKED' || serverStatus === 'SUSPENDED') {
          store.set('terminalStatus', 'REVOKED');
          clearSecureValue('secretToken');
          startStatusPolling(systemId);
        } else if (serverStatus === 'EXPIRED') {
          store.set('terminalStatus', 'EXPIRED');
          clearSecureValue('secretToken');
          startStatusPolling(systemId);
        } else if (serverStatus === 'PENDING') {
          store.set('terminalStatus', 'PENDING');
          clearSecureValue('secretToken');
          startStatusPolling(systemId);
        } else {
          clearLocalTerminalData();
        }

        return { success: false, status: store.get('terminalStatus') };
      }
    } catch (e) {
      console.error('Startup handshake failed:', e);
      return { success: false, status: 'APPROVED', networkError: true };
    }
  }

  if (!secretToken && claimToken) {
    startStatusPolling(systemId);
    return { success: true, status: status || 'PENDING' };
  }

  return { success: false, status: store.get('terminalStatus') || 'UNREGISTERED' };
});

app.whenReady().then(async () => {
  createWindow();
});

ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});

ipcMain.on('set-theme', (event, theme) => {
  nativeTheme.themeSource = theme;
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

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.maximize();

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.on('window-all-closed', () => {
  stopStatusPolling();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
