const { app, BrowserWindow, ipcMain, session, Menu } = require('electron');
const path = require('path');
const url = require('url');

// Gardez une référence globale de l'objet window, sinon la fenêtre sera
// fermée automatiquement quand l'objet JavaScript sera garbage collected.
let mainWindow;

function createWindow() {
  // Créer la fenêtre du navigateur
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icons/icon.png')
  });

  // Charger l'index.html de l'application
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Ouvrir les DevTools en mode développement
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Émis lorsque la fenêtre est fermée
  mainWindow.on('closed', function () {
    // Dé-référence l'objet window, généralement vous stockeriez les fenêtres
    // dans un tableau si votre application supporte le multi-fenêtre. C'est le moment
    // où vous devriez supprimer l'élément correspondant.
    mainWindow = null;
  });

  // Créer le menu de l'application
  const template = [
    {
      label: 'Fichier',
      submenu: [
        { role: 'quit', label: 'Quitter' }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Rétablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'selectAll', label: 'Sélectionner tout' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Actualiser' },
        { role: 'toggledevtools', label: 'Outils de développement' },
        { type: 'separator' },
        { role: 'resetzoom', label: 'Zoom normal' },
        { role: 'zoomin', label: 'Zoom avant' },
        { role: 'zoomout', label: 'Zoom arrière' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' }
      ]
    },
    {
      role: 'help',
      label: 'Aide',
      submenu: [
        {
          label: 'À propos de Nave',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/CarlosLeBg/Nave');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Cette méthode sera appelée quand Electron aura fini
// de s'initialiser et sera prêt à créer des fenêtres de navigateur.
// Certaines APIs peuvent être utilisées uniquement après cet événement.
app.on('ready', () => {
  createWindow();
  
  // Initialiser les gestionnaires d'événements IPC
  setupIPCHandlers();
});

// Configuration des gestionnaires d'événements IPC
function setupIPCHandlers() {
  // Navigation
  ipcMain.on('navigate', (event, url) => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('navigate-to', url);
    }
  });
  
  // Nouvel onglet
  ipcMain.on('new-tab', (event, url) => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('create-new-tab', url);
    }
  });
  
  // Favoris
  ipcMain.on('add-bookmark', (event, bookmark) => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('bookmark-added', bookmark);
    }
  });
  
  // Historique
  ipcMain.on('add-to-history', (event, historyItem) => {
    // Ici, vous pourriez stocker l'historique dans une base de données locale
    // Pour l'instant, nous nous contentons de le recevoir
    console.log('Ajout à l\'historique:', historyItem);
  });
  
  // Paramètres
  ipcMain.handle('get-settings', async () => {
    // Ici, vous pourriez charger les paramètres depuis un fichier de configuration
    // Pour l'instant, nous retournons des paramètres par défaut
    return {
      theme: 'light',
      homepage: 'https://www.google.com'
    };
  });
  
  ipcMain.on('save-settings', (event, settings) => {
    // Ici, vous pourriez sauvegarder les paramètres dans un fichier de configuration
    console.log('Sauvegarde des paramètres:', settings);
  });
}

// Quitter quand toutes les fenêtres sont fermées.
app.on('window-all-closed', function () {
  // Sur macOS, il est commun pour une application et leur barre de menu
  // de rester active tant que l'utilisateur ne quitte pas explicitement avec Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // Sur macOS, il est commun de re-créer une fenêtre de l'application quand
  // l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres ouvertes.
  if (mainWindow === null) createWindow();
});

// Gérer les messages IPC depuis le renderer
ipcMain.on('navigate', (event, url) => {
  if (mainWindow) {
    mainWindow.webContents.loadURL(url);
  }
});

// Gérer la création de nouveaux onglets
ipcMain.on('new-tab', (event, url) => {
  // Dans une implémentation réelle, vous géreriez les onglets dans le renderer
  // Ici, nous envoyons simplement un message au renderer pour créer un nouvel onglet
  if (mainWindow) {
    mainWindow.webContents.send('create-new-tab', url || 'about:blank');
  }
});

// Gérer les favoris
ipcMain.on('add-bookmark', (event, bookmark) => {
  if (mainWindow) {
    mainWindow.webContents.send('bookmark-added', bookmark);
  }
});