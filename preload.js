// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Exposer des API protégées aux scripts de rendu
contextBridge.exposeInMainWorld('electronAPI', {
  // Navigation
  navigate: (url) => ipcRenderer.send('navigate', url),
  navigateTo: (callback) => ipcRenderer.on('navigate-to', (event, url) => callback(url)),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  refresh: () => ipcRenderer.send('refresh'),
  
  // Onglets
  newTab: (url) => ipcRenderer.send('new-tab', url),
  onCreateNewTab: (callback) => ipcRenderer.on('create-new-tab', (event, url) => callback(url)),
  closeTab: (tabId) => ipcRenderer.send('close-tab', tabId),
  
  // Favoris
  addBookmark: (bookmark) => ipcRenderer.send('add-bookmark', bookmark),
  onBookmarkAdded: (callback) => ipcRenderer.on('bookmark-added', (event, bookmark) => callback(bookmark)),
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  
  // Historique
  addToHistory: (historyItem) => ipcRenderer.send('add-to-history', historyItem),
  getHistory: () => ipcRenderer.invoke('get-history'),
  
  // Paramètres
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
  
  // Événements webview
  onTitleUpdated: (callback) => ipcRenderer.on('page-title-updated', (event, title) => callback(title)),
  onURLUpdated: (callback) => ipcRenderer.on('did-navigate', (event, url) => callback(url))
});