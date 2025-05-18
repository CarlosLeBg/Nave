// modern-browser.js - Version moderne du navigateur Nave

// Importation des modules nécessaires
const { ipcRenderer } = require('electron');

// Configuration initiale
let activeTabId = 'tab-1';
let tabCounter = 1;
let bookmarks = [];
let settings = {
  theme: 'light',
  homepage: 'https://www.google.com'
};

// Classe principale du navigateur
class ModernBrowser {
  constructor() {
    this.initializeUI();
    this.loadSettings();
    this.loadBookmarks();
    this.setupEventListeners();
    this.createFirstTab();
  }

  // Initialisation de l'interface utilisateur
  initializeUI() {
    // Supprimer l'ancien contenu
    document.body.innerHTML = '';
    
    // Créer la structure moderne du navigateur
    const browserContainer = document.createElement('div');
    browserContainer.className = 'browser-container';
    
    // Créer une barre de navigation unifiée (comme Firefox)
    const navbar = document.createElement('div');
    navbar.className = 'navbar modern-navbar';
    
    // Boutons de navigation
    const navControls = document.createElement('div');
    navControls.className = 'nav-controls';
    navControls.innerHTML = `
      <button id="back-button" class="nav-button" title="Retour">
        <i class="fa fa-arrow-left"></i>
      </button>
      <button id="forward-button" class="nav-button" title="Avancer">
        <i class="fa fa-arrow-right"></i>
      </button>
      <button id="refresh-button" class="nav-button" title="Actualiser">
        <i class="fa fa-refresh"></i>
      </button>
      <button id="home-button" class="nav-button" title="Accueil">
        <i class="fa fa-home"></i>
      </button>
    `;
    
    // Barre d'adresse intégrée
    const addressBar = document.createElement('div');
    addressBar.className = 'address-bar modern-address-bar';
    addressBar.innerHTML = `
      <input type="text" id="url-input" placeholder="Rechercher ou saisir une adresse web">
      <button id="go-button" class="nav-button" title="Aller">
        <i class="fa fa-arrow-circle-right"></i>
      </button>
    `;
    
    // Actions du navigateur
    const browserActions = document.createElement('div');
    browserActions.className = 'browser-actions';
    browserActions.innerHTML = `
      <button id="bookmark-button" class="nav-button" title="Ajouter aux favoris">
        <i class="fa fa-star"></i>
      </button>
      <button id="new-tab-button" class="nav-button" title="Nouvel onglet">
        <i class="fa fa-plus"></i>
      </button>
      <button id="settings-button" class="nav-button" title="Paramètres">
        <i class="fa fa-cog"></i>
      </button>
    `;
    
    // Assembler la barre de navigation
    navbar.appendChild(navControls);
    navbar.appendChild(addressBar);
    navbar.appendChild(browserActions);
    
    // Contenu du navigateur
    const browserContent = document.createElement('div');
    browserContent.className = 'browser-content';
    browserContent.id = 'browser-content';
    
    // Panneaux (favoris, paramètres)
    const bookmarksPanel = this.createPanel('bookmarks-panel', 'Favoris');
    const settingsPanel = this.createPanel('settings-panel', 'Paramètres');
    settingsPanel.querySelector('.panel-content').innerHTML = this.createSettingsContent();
    
    // Assembler le conteneur principal
    browserContainer.appendChild(navbar);
    browserContainer.appendChild(browserContent);
    browserContainer.appendChild(bookmarksPanel);
    browserContainer.appendChild(settingsPanel);
    
    // Ajouter à la page
    document.body.appendChild(browserContainer);
    
    // Mettre à jour les références DOM
    this.updateDOMReferences();
  }
  
  // Créer un panneau (favoris, paramètres)
  createPanel(id, title) {
    const panel = document.createElement('div');
    panel.className = id;
    panel.id = id;
    
    const panelHeader = document.createElement('div');
    panelHeader.className = 'panel-header';
    panelHeader.innerHTML = `
      <h3>${title}</h3>
      <button id="close-${id}" class="nav-button">
        <i class="fa fa-times"></i>
      </button>
    `;
    
    const panelContent = document.createElement('div');
    panelContent.className = 'panel-content';
    
    panel.appendChild(panelHeader);
    panel.appendChild(panelContent);
    
    return panel;
  }
  
  // Créer le contenu des paramètres
  createSettingsContent() {
    return `
      <div class="settings-section">
        <h4>Apparence</h4>
        <div class="setting-item">
          <label for="theme-select">Thème :</label>
          <select id="theme-select">
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
            <option value="system">Système</option>
          </select>
        </div>
      </div>
      <div class="settings-section">
        <h4>Navigation</h4>
        <div class="setting-item">
          <label for="homepage-input">Page d'accueil :</label>
          <input type="text" id="homepage-input" placeholder="https://www.google.com">
        </div>
      </div>
    `;
  }
  
  // Mettre à jour les références DOM
  updateDOMReferences() {
    this.urlInput = document.getElementById('url-input');
    this.goButton = document.getElementById('go-button');
    this.backButton = document.getElementById('back-button');
    this.forwardButton = document.getElementById('forward-button');
    this.refreshButton = document.getElementById('refresh-button');
    this.homeButton = document.getElementById('home-button');
    this.newTabButton = document.getElementById('new-tab-button');
    this.browserContent = document.getElementById('browser-content');
    this.bookmarkButton = document.getElementById('bookmark-button');
    this.settingsButton = document.getElementById('settings-button');
    this.bookmarksPanel = document.getElementById('bookmarks-panel');
    this.settingsPanel = document.getElementById('settings-panel');
    this.closeBookmarks = document.getElementById('close-bookmarks-panel');
    this.closeSettings = document.getElementById('close-settings-panel');
    this.themeSelect = document.getElementById('theme-select');
    this.homepageInput = document.getElementById('homepage-input');
  }
  
  // Charger les paramètres
  loadSettings() {
    const savedSettings = localStorage.getItem('nave-settings');
    if (savedSettings) {
      settings = JSON.parse(savedSettings);
    }
    
    // Appliquer le thème
    this.applyTheme(settings.theme);
    if (this.themeSelect) {
      this.themeSelect.value = settings.theme;
    }
    
    // Définir la page d'accueil
    if (this.homepageInput) {
      this.homepageInput.value = settings.homepage;
    }
  }
  
  // Sauvegarder les paramètres
  saveSettings() {
    localStorage.setItem('nave-settings', JSON.stringify(settings));
  }
  
  // Appliquer le thème
  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }
  
  // Charger les favoris
  loadBookmarks() {
    const savedBookmarks = localStorage.getItem('nave-bookmarks');
    if (savedBookmarks) {
      bookmarks = JSON.parse(savedBookmarks);
    }
    
    this.renderBookmarks();
  }
  
  // Sauvegarder les favoris
  saveBookmarks() {
    localStorage.setItem('nave-bookmarks', JSON.stringify(bookmarks));
  }
  
  // Afficher les favoris
  renderBookmarks() {
    const bookmarksListElement = document.querySelector('.bookmarks-panel .panel-content');
    if (!bookmarksListElement) return;
    
    if (bookmarks.length === 0) {
      bookmarksListElement.innerHTML = '<div class="empty-message">Aucun favori enregistré</div>';
      return;
    }
    
    bookmarksListElement.innerHTML = '';
    
    bookmarks.forEach((bookmark, index) => {
      const bookmarkItem = document.createElement('div');
      bookmarkItem.className = 'bookmark-item';
      bookmarkItem.innerHTML = `
        <div class="bookmark-icon">
          <i class="fa fa-globe"></i>
        </div>
        <div class="bookmark-info">
          <div class="bookmark-title">${bookmark.title}</div>
          <div class="bookmark-url">${bookmark.url}</div>
        </div>
        <div class="bookmark-actions">
          <button class="bookmark-delete" data-index="${index}">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      `;
      
      bookmarkItem.addEventListener('click', (e) => {
        if (!e.target.closest('.bookmark-delete')) {
          this.navigateTo(bookmark.url);
        }
      });
      
      bookmarksListElement.appendChild(bookmarkItem);
    });
    
    // Ajouter les écouteurs d'événements pour les boutons de suppression
    document.querySelectorAll('.bookmark-delete').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(button.getAttribute('data-index'));
        this.removeBookmark(index);
      });
    });
  }
  
  // Ajouter un favori
  addBookmark(title, url) {
    // Vérifier si le favori existe déjà
    const exists = bookmarks.some(bookmark => bookmark.url === url);
    if (exists) {
      this.showNotification('Ce site est déjà dans vos favoris');
      return;
    }
    
    bookmarks.push({ title, url });
    this.saveBookmarks();
    this.renderBookmarks();
    this.showNotification('Favori ajouté');
  }
  
  // Supprimer un favori
  removeBookmark(index) {
    bookmarks.splice(index, 1);
    this.saveBookmarks();
    this.renderBookmarks();
    this.showNotification('Favori supprimé');
  }
  
  // Afficher une notification
  showNotification(message) {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
      notification.remove();
    });
    
    // Créer une nouvelle notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Afficher la notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Masquer la notification après 3 secondes
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
  
  // Configurer les écouteurs d'événements
  setupEventListeners() {
    // Navigation
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      
      // Boutons de navigation
      if (target.id === 'back-button') this.goBack();
      if (target.id === 'forward-button') this.goForward();
      if (target.id === 'refresh-button') this.refresh();
      if (target.id === 'home-button') this.goHome();
      if (target.id === 'go-button') this.navigateTo(this.urlInput.value);
      
      // Gestion des onglets
      if (target.id === 'new-tab-button') this.createNewTab();
      if (target.classList.contains('tab-close')) {
        const tabId = target.closest('.tab').getAttribute('data-tab-id');
        this.closeTab(tabId);
      }
      
      // Panneaux
      if (target.id === 'bookmark-button') this.toggleBookmarksPanel();
      if (target.id === 'settings-button') this.toggleSettingsPanel();
      if (target.id === 'close-bookmarks-panel') this.closeBookmarksPanel();
      if (target.id === 'close-settings-panel') this.closeSettingsPanel();
    });
    
    // Entrée URL
    if (this.urlInput) {
      this.urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.navigateTo(this.urlInput.value);
        }
      });
    }
    
    // Changement de thème
    if (this.themeSelect) {
      this.themeSelect.addEventListener('change', () => {
        const theme = this.themeSelect.value;
        settings.theme = theme;
        this.applyTheme(theme);
        this.saveSettings();
      });
    }
    
    // Changement de page d'accueil
    if (this.homepageInput) {
      this.homepageInput.addEventListener('change', () => {
        settings.homepage = this.homepageInput.value;
        this.saveSettings();
      });
    }
  }
  
  // Créer le premier onglet
  createFirstTab() {
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content active';
    tabContent.id = 'tab-1';
    
    const webview = document.createElement('webview');
    webview.id = 'webview-1';
    webview.setAttribute('src', settings.homepage);
    webview.setAttribute('allowpopups', 'true');
    webview.setAttribute('preload', './preload.js');
    webview.setAttribute('webpreferences', 'contextIsolation=yes, nodeIntegration=no');
    
    tabContent.appendChild(webview);
    this.browserContent.appendChild(tabContent);
    
    // Mettre à jour l'URL dans la barre d'adresse lorsque la page est chargée
    webview.addEventListener('did-navigate', () => {
      this.urlInput.value = webview.getURL();
    });
    
    webview.addEventListener('page-title-updated', () => {
      document.title = `${webview.getTitle()} - Nave`;
    });
    
    webview.addEventListener('did-fail-load', (e) => {
      if (e.errorCode !== -3) { // Ignorer les erreurs d'annulation
        this.showErrorPage(webview, e.errorDescription);
      }
    });
  }
  
  // Créer un nouvel onglet
  createNewTab(url = settings.homepage) {
    tabCounter++;
    const tabId = `tab-${tabCounter}`;
    
    // Créer le contenu de l'onglet
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    tabContent.id = tabId;
    
    const webview = document.createElement('webview');
    webview.id = `webview-${tabCounter}`;
    webview.setAttribute('src', url);
    webview.setAttribute('allowpopups', 'true');
    webview.setAttribute('preload', './preload.js');
    webview.setAttribute('webpreferences', 'contextIsolation=yes, nodeIntegration=no');
    
    tabContent.appendChild(webview);
    this.browserContent.appendChild(tabContent);
    
    // Activer le nouvel onglet
    this.activateTab(tabId);
    
    // Mettre à jour l'URL dans la barre d'adresse lorsque la page est chargée
    webview.addEventListener('did-navigate', () => {
      if (activeTabId === tabId) {
        this.urlInput.value = webview.getURL();
      }
    });
    
    webview.addEventListener('page-title-updated', () => {
      if (activeTabId === tabId) {
        document.title = `${webview.getTitle()} - Nave`;
      }
    });
    
    webview.addEventListener('did-fail-load', (e) => {
      if (e.errorCode !== -3) { // Ignorer les erreurs d'annulation
        this.showErrorPage(webview, e.errorDescription);
      }
    });
    
    return tabId;
  }
  
  // Activer un onglet
  activateTab(tabId) {
    // Désactiver l'onglet actif
    const activeTabContent = document.querySelector('.tab-content.active');
    if (activeTabContent) {
      activeTabContent.classList.remove('active');
    }
    
    // Activer le nouvel onglet
    const newTabContent = document.getElementById(tabId);
    if (newTabContent) {
      newTabContent.classList.add('active');
      activeTabId = tabId;
      
      // Mettre à jour l'URL dans la barre d'adresse
      const webview = newTabContent.querySelector('webview');
      if (webview) {
        this.urlInput.value = webview.getURL();
        document.title = `${webview.getTitle() || 'Nouvel onglet'} - Nave`;
      }
    }
  }
  
  // Fermer un onglet
  closeTab(tabId) {
    const tabContent = document.getElementById(tabId);
    if (!tabContent) return;
    
    // Si c'est l'onglet actif, activer un autre onglet
    if (activeTabId === tabId) {
      const allTabContents = Array.from(document.querySelectorAll('.tab-content'));
      const currentIndex = allTabContents.findIndex(tab => tab.id === tabId);
      
      // Trouver l'onglet à activer (précédent ou suivant)
      let nextTabIndex = currentIndex - 1;
      if (nextTabIndex < 0) nextTabIndex = currentIndex + 1;
      
      // S'il n'y a plus d'onglets, en créer un nouveau
      if (allTabContents.length <= 1) {
        tabContent.remove();
        this.createNewTab();
        return;
      }
      
      // Activer l'onglet suivant
      const nextTabId = allTabContents[nextTabIndex].id;
      this.activateTab(nextTabId);
    }
    
    // Supprimer l'onglet
    tabContent.remove();
  }
  
  // Navigation
  navigateTo(input) {
    let url = input.trim();
    
    // Ajouter http:// si nécessaire
    if (!/^https?:\/\//i.test(url) && !url.startsWith('file://')) {
      // Vérifier si c'est une URL valide
      if (/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?/i.test(url)) {
        url = 'https://' + url;
      } else {
        // Sinon, considérer comme une recherche Google
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }
    
    // Obtenir le webview actif
    const webview = document.querySelector(`#${activeTabId} webview`);
    if (webview) {
      webview.src = url;
      this.urlInput.value = url;
    }
  }
  
  // Retour en arrière
  goBack() {
    const webview = document.querySelector(`#${activeTabId} webview`);
    if (webview && webview.canGoBack()) {
      webview.goBack();
    }
  }
  
  // Avancer
  goForward() {
    const webview = document.querySelector(`#${activeTabId} webview`);
    if (webview && webview.canGoForward()) {
      webview.goForward();
    }
  }
  
  // Actualiser
  refresh() {
    const webview = document.querySelector(`#${activeTabId} webview`);
    if (webview) {
      webview.reload();
    }
  }
  
  // Aller à la page d'accueil
  goHome() {
    this.navigateTo(settings.homepage);
  }
  
  // Afficher une page d'erreur
  showErrorPage(webview, errorMessage) {
    const errorHTML = `
      <html>
      <head>
        <title>Erreur de chargement</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .error-container {
            text-align: center;
            max-width: 600px;
            padding: 40px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #e74c3c;
            margin-bottom: 20px;
          }
          p {
            margin-bottom: 20px;
            line-height: 1.5;
          }
          button {
            background-color: #4a6da7;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
          }
          button:hover {
            background-color: #304878;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Impossible de charger la page</h1>
          <p>${errorMessage || 'Une erreur s\'est produite lors du chargement de la page.'}</p>
          <button onclick="window.location.reload()">Réessayer</button>
        </div>
      </body>
      </html>
    `;
    
    webview.executeJavaScript(`
      document.open();
      document.write(${JSON.stringify(errorHTML)});
      document.close();
    `);
  }
  
  // Afficher/masquer le panneau des favoris
  toggleBookmarksPanel() {
    this.bookmarksPanel.classList.toggle('show');
    this.settingsPanel.classList.remove('show');
  }
  
  // Fermer le panneau des favoris
  closeBookmarksPanel() {
    this.bookmarksPanel.classList.remove('show');
  }
  
  // Afficher/masquer le panneau des paramètres
  toggleSettingsPanel() {
    this.settingsPanel.classList.toggle('show');
    this.bookmarksPanel.classList.remove('show');
  }
  
  // Fermer le panneau des paramètres
  closeSettingsPanel() {
    this.settingsPanel.classList.remove('show');
  }
}

// Initialiser le navigateur moderne lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const browser = new ModernBrowser();
  
  // Exposer l'instance du navigateur pour le débogage
  window.browser = browser;
});