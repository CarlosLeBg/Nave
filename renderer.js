// renderer.js

// Récupération des éléments DOM
const urlInput = document.getElementById('url-input');
const goButton = document.getElementById('go-button');
const backButton = document.getElementById('back-button');
const forwardButton = document.getElementById('forward-button');
const refreshButton = document.getElementById('refresh-button');
const homeButton = document.getElementById('home-button');
const newTabButton = document.getElementById('new-tab-button');
const tabsBar = document.getElementById('tabs-bar');
const browserContent = document.getElementById('browser-content');
const bookmarkButton = document.getElementById('bookmark-button');
const settingsButton = document.getElementById('settings-button');
const bookmarksPanel = document.getElementById('bookmarks-panel');
const settingsPanel = document.getElementById('settings-panel');
const closeBookmarks = document.getElementById('close-bookmarks');
const closeSettings = document.getElementById('close-settings');
const bookmarksList = document.getElementById('bookmarks-list');
const themeSelect = document.getElementById('theme-select');
const homepageInput = document.getElementById('homepage-input');

// État de l'application
let activeTabId = 'tab-1';
let tabCounter = 1;
let bookmarks = [];
let settings = {
  theme: 'light',
  homepage: 'https://www.google.com'
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Charger les paramètres
  loadSettings();
  
  // Charger les favoris
  loadBookmarks();
  
  // Initialiser le premier onglet
  const firstWebview = document.getElementById('webview-1');
  firstWebview.src = settings.homepage;
  
  // Mettre à jour l'URL dans la barre d'adresse lorsque la page est chargée
  firstWebview.addEventListener('did-navigate', (e) => {
    urlInput.value = firstWebview.getURL();
    updateTabTitle('tab-1', firstWebview.getTitle() || 'Nouvel onglet');
  });
  
  firstWebview.addEventListener('page-title-updated', (e) => {
    updateTabTitle('tab-1', firstWebview.getTitle() || 'Nouvel onglet');
  });
  
  // Appliquer le thème
  applyTheme(settings.theme);
  themeSelect.value = settings.theme;
  
  // Définir la page d'accueil dans les paramètres
  homepageInput.value = settings.homepage;
  
  // Ajouter les écouteurs d'événements pour les boutons de navigation
  setupEventListeners();
  
  // Écouter les événements IPC
  setupIPCListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
  // Navigation
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      navigateTo(urlInput.value);
    }
  });
  
  goButton.addEventListener('click', () => {
    navigateTo(urlInput.value);
  });
  
  backButton.addEventListener('click', () => {
    const webview = document.querySelector(`#${activeTabId} webview`);
    if (webview && webview.canGoBack()) {
      webview.goBack();
    }
  });
  
  forwardButton.addEventListener('click', () => {
    const webview = document.querySelector(`#${activeTabId} webview`);
    if (webview && webview.canGoForward()) {
      webview.goForward();
    }
  });
  
  refreshButton.addEventListener('click', () => {
    const webview = document.querySelector(`#${activeTabId} webview`);
    if (webview) {
      webview.reload();
    }
  });
  
  homeButton.addEventListener('click', () => {
    navigateTo(settings.homepage);
  });
  
  // Onglets
  newTabButton.addEventListener('click', () => {
    createNewTab();
  });
  
  // Favoris
  bookmarkButton.addEventListener('click', () => {
    addBookmark();
  });
  
  // Panneau des favoris
  document.getElementById('show-bookmarks').addEventListener('click', () => {
    toggleBookmarksPanel();
  });
  
  closeBookmarks.addEventListener('click', () => {
    toggleBookmarksPanel();
  });
  
  // Paramètres
  settingsButton.addEventListener('click', () => {
    toggleSettingsPanel();
  });
  
  closeSettings.addEventListener('click', () => {
    toggleSettingsPanel();
  });
  
  // Thème
  themeSelect.addEventListener('change', () => {
    settings.theme = themeSelect.value;
    applyTheme(settings.theme);
    saveSettings();
  });
  
  // Page d'accueil
  homepageInput.addEventListener('change', () => {
    settings.homepage = homepageInput.value;
    saveSettings();
  });
}

// Configuration des écouteurs d'événements IPC
function setupIPCListeners() {
  // Écouter les événements de navigation
  window.electronAPI.navigateTo((url) => {
    navigateTo(url);
  });
  
  // Écouter les événements de création d'onglet
  window.electronAPI.onCreateNewTab((url) => {
    createNewTab(url);
  });
  
  // Écouter les événements de favoris
  window.electronAPI.onBookmarkAdded((bookmark) => {
    bookmarks.push(bookmark);
    saveBookmarks();
    renderBookmarks();
    showNotification(`Favori ajouté : ${bookmark.title}`);
  });
}

// Navigation
function navigateTo(url) {
  if (!url) return;
  
  // Ajouter http:// si nécessaire
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Vérifier si c'est une recherche ou une URL
    if (url.includes('.') && !url.includes(' ')) {
      url = 'http://' + url;
    } else {
      // C'est une recherche, utiliser Google
      url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
    }
  }
  
  const webview = document.querySelector(`#${activeTabId} webview`);
  if (webview) {
    webview.src = url;
    urlInput.value = url;
    
    // Ajouter à l'historique
    addToHistory({
      url: url,
      title: webview.getTitle() || url,
      timestamp: Date.now()
    });
  }
}

// Gestion des onglets
function createNewTab(url = settings.homepage) {
  tabCounter++;
  const tabId = `tab-${tabCounter}`;
  const webviewId = `webview-${tabCounter}`;
  
  // Créer un nouvel onglet
  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.dataset.tabId = tabId;
  tab.innerHTML = `
    <span class="tab-title">Nouvel onglet</span>
    <button class="tab-close"><i class="fa fa-times"></i></button>
  `;
  
  // Ajouter l'onglet à la barre d'onglets
  tabsBar.appendChild(tab);
  
  // Créer le contenu de l'onglet
  const tabContent = document.createElement('div');
  tabContent.className = 'tab-content';
  tabContent.id = tabId;
  tabContent.innerHTML = `<webview id="${webviewId}" src="${url}" class="webview"></webview>`;
  
  // Ajouter le contenu au navigateur
  browserContent.appendChild(tabContent);
  
  // Activer le nouvel onglet
  activateTab(tabId);
  
  // Ajouter les écouteurs d'événements pour le webview
  const webview = document.getElementById(webviewId);
  webview.addEventListener('did-navigate', (e) => {
    if (activeTabId === tabId) {
      urlInput.value = webview.getURL();
    }
    updateTabTitle(tabId, webview.getTitle() || 'Nouvel onglet');
  });
  
  webview.addEventListener('page-title-updated', (e) => {
    updateTabTitle(tabId, webview.getTitle() || 'Nouvel onglet');
  });
  
  // Ajouter les écouteurs d'événements pour l'onglet
  tab.addEventListener('click', () => {
    activateTab(tabId);
  });
  
  const closeButton = tab.querySelector('.tab-close');
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(tabId);
  });
  
  return tabId;
}
 
function switchTab(tabId) {
  // Désactiver l'onglet actif
  const currentTab = document.querySelector('.tab.active');
  if (currentTab) {
    currentTab.classList.remove('active');
  }
  
  // Masquer le contenu d'onglet actif
  const currentContent = document.querySelector('.tab-content.active');
  if (currentContent) {
    currentContent.classList.remove('active');
  }
  
  // Activer le nouvel onglet
  const newTab = document.querySelector(`[data-tab-id="${tabId}"]`);
  if (newTab) {
    newTab.classList.add('active');
  }
  
  // Afficher le nouveau contenu d'onglet
  const newContent = document.getElementById(tabId);
  if (newContent) {
    newContent.classList.add('active');
    
    // Mettre à jour la barre d'adresse
    const webview = newContent.querySelector('webview');
    if (webview) {
      urlInput.value = webview.getURL() || '';
    }
  }
  
  // Mettre à jour l'onglet actif
  activeTabId = tabId;
}

function closeTab(tabId) {
  // Supprimer l'onglet
  const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
  if (tab) {
    tab.remove();
  }
  
  // Supprimer le webview
  const webviewContainer = document.getElementById(tabId);
  if (webviewContainer) {
    webviewContainer.remove();
  }
  
  // Si c'était l'onglet actif, activer un autre onglet
  if (tabId === activeTabId) {
    const remainingTabs = document.querySelectorAll('.tab');
    if (remainingTabs.length > 0) {
      const newActiveTab = remainingTabs[remainingTabs.length - 1];
      switchTab(newActiveTab.dataset.tabId);
    } else {
      // S'il n'y a plus d'onglets, en créer un nouveau
      createNewTab();
    }
  }
}

function updateTabTitle(tabId, title) {
  const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
  if (tab) {
    const tabTitle = tab.querySelector('.tab-title');
    if (tabTitle) {
      // Limiter la longueur du titre
      const shortTitle = title.length > 20 ? title.substring(0, 20) + '...' : title;
      tabTitle.textContent = shortTitle;
      tab.title = title; // Tooltip avec le titre complet
    }
  }
}

// Gestion des favoris
function addBookmark() {
  const webview = document.querySelector(`#${activeTabId} webview`);
  if (webview) {
    const url = webview.getURL();
    const title = webview.getTitle() || url;
    
    // Vérifier si le favori existe déjà
    const exists = bookmarks.some(bookmark => bookmark.url === url);
    if (!exists) {
      const newBookmark = { url, title, icon: 'fa-star' };
      bookmarks.push(newBookmark);
      saveBookmarks();
      renderBookmarks();
      
      // Notification
      showNotification(`Favori ajouté : ${title}`);
    } else {
      showNotification('Ce site est déjà dans vos favoris');
    }
  }
}

function renderBookmarks() {
  bookmarksList.innerHTML = '';
  
  if (bookmarks.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'Aucun favori enregistré';
    bookmarksList.appendChild(emptyMessage);
    return;
  }
  
  bookmarks.forEach((bookmark, index) => {
    const bookmarkItem = document.createElement('div');
    bookmarkItem.className = 'bookmark-item';
    bookmarkItem.innerHTML = `
      <div class="bookmark-icon"><i class="fa ${bookmark.icon || 'fa-star'}"></i></div>
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
    
    // Ajouter un événement de clic pour naviguer vers le favori
    bookmarkItem.addEventListener('click', (e) => {
      if (!e.target.closest('.bookmark-delete')) {
        navigateTo(bookmark.url);
        toggleBookmarksPanel();
      }
    });
    
    // Ajouter un événement pour supprimer le favori
    const deleteButton = bookmarkItem.querySelector('.bookmark-delete');
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      bookmarks.splice(index, 1);
      saveBookmarks();
      renderBookmarks();
      showNotification('Favori supprimé');
    });
    
    bookmarksList.appendChild(bookmarkItem);
  });
}

function removeBookmark(index) {
  bookmarks.splice(index, 1);
  saveBookmarks();
  renderBookmarks();
}

function saveBookmarks() {
  localStorage.setItem('nave_bookmarks', JSON.stringify(bookmarks));
}

function loadBookmarks() {
  const savedBookmarks = localStorage.getItem('nave_bookmarks');
  if (savedBookmarks) {
    bookmarks = JSON.parse(savedBookmarks);
    renderBookmarks();
  }
}

// Gestion des paramètres
function saveSettings() {
  localStorage.setItem('nave_settings', JSON.stringify(settings));
}

function loadSettings() {
  const savedSettings = localStorage.getItem('nave_settings');
  if (savedSettings) {
    settings = JSON.parse(savedSettings);
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  settings.theme = theme;
  saveSettings();
}

// Gestion de l'historique
function addToHistory(historyItem) {
  let history = JSON.parse(localStorage.getItem('nave-history') || '[]');
  history.unshift(historyItem);
  
  // Limiter l'historique à 100 entrées
  if (history.length > 100) {
    history = history.slice(0, 100);
  }
  
  localStorage.setItem('nave-history', JSON.stringify(history));
}

// Utilitaires
function toggleBookmarksPanel() {
  bookmarksPanel.classList.toggle('show');
  settingsPanel.classList.remove('show');
  
  // Si le panneau est affiché, mettre à jour les favoris
  if (bookmarksPanel.classList.contains('show')) {
    renderBookmarks();
  }
}

function toggleSettingsPanel() {
  settingsPanel.classList.toggle('show');
  bookmarksPanel.classList.remove('show');
  
  // Si le panneau est affiché, mettre à jour les paramètres
  if (settingsPanel.classList.contains('show')) {
    themeSelect.value = settings.theme;
    homepageInput.value = settings.homepage;
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animation d'entrée
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Disparition après 3 secondes
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Écouteurs d'événements
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    navigateTo(urlInput.value);
  }
});

goButton.addEventListener('click', () => {
  navigateTo(urlInput.value);
});

backButton.addEventListener('click', () => {
  const webview = document.querySelector(`#${activeTabId} webview`);
  if (webview && webview.canGoBack()) {
    webview.goBack();
  }
});

forwardButton.addEventListener('click', () => {
  const webview = document.querySelector(`#${activeTabId} webview`);
  if (webview && webview.canGoForward()) {
    webview.goForward();
  }
});

refreshButton.addEventListener('click', () => {
  const webview = document.querySelector(`#${activeTabId} webview`);
  if (webview) {
    webview.reload();
  }
});

homeButton.addEventListener('click', () => {
  navigateTo(settings.homepage);
});

newTabButton.addEventListener('click', () => {
  createNewTab();
});

bookmarkButton.addEventListener('click', () => {
  addBookmark();
});

settingsButton.addEventListener('click', () => {
  toggleSettingsPanel();
});

closeBookmarks.addEventListener('click', () => {
  bookmarksPanel.classList.remove('show');
});

closeSettings.addEventListener('click', () => {
  settingsPanel.classList.remove('show');
});

themeSelect.addEventListener('change', () => {
  applyTheme(themeSelect.value);
});

homepageInput.addEventListener('change', () => {
  settings.homepage = homepageInput.value;
  saveSettings();
});

// Écouter les messages de l'API Electron
window.electronAPI.onBookmarkAdded((bookmark) => {
  bookmarks.push(bookmark);
  saveBookmarks();
  renderBookmarks();
});

window.electronAPI.onCreateNewTab((url) => {
  createNewTab(url);
});