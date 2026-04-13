const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Navigation & External
  openExternal: (url) => ipcRenderer.send('open-external', url),
  
  // Theme
  setTheme: (theme) => ipcRenderer.send('set-theme', theme),

  // Terminal Identity (New Phase 1)
  terminal: {
    getIdentity: () => ipcRenderer.invoke('terminal:get-identity'),
    register: (data) => ipcRenderer.invoke('terminal:register', data),
    getStatus: () => ipcRenderer.invoke('terminal:get-status'),
    logout: () => ipcRenderer.invoke('terminal:logout'),
    verifyHandshake: () => ipcRenderer.invoke('terminal:verify-handshake'),
    cancelRegistration: () => ipcRenderer.invoke('terminal:cancel-registration'),
    resetRegistrationState: () => ipcRenderer.invoke('terminal:reset-registration-state'),
    onStatusUpdate: (callback) => {
        ipcRenderer.on('terminal:status-updated', (event, status) => callback(status));
    }
  }
});
