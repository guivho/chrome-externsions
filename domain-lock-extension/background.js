const lockedTabs = new Map();
const DEFAULT_DOMAINS = ["mail.google.com", "web.whatsapp.com"];

function getOrigin(url) {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch (e) {
    return null;
  }
}

// Onderschep navigatie
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;

  const tabId = details.tabId;
  const targetOrigin = getOrigin(details.url);

  if (lockedTabs.has(tabId)) {
    const allowedOrigin = lockedTabs.get(tabId);

    if (targetOrigin && targetOrigin !== allowedOrigin) {
      chrome.tabs.create({ url: details.url, active: true });
      chrome.tabs.update(tabId, { url: allowedOrigin });
    }
  }
});

// Controleer geladen tabs tegen de opgeslagen domeinlijst
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const origin = getOrigin(tab.url);

    if (origin) {
      chrome.storage.sync.get({ protectedDomains: DEFAULT_DOMAINS }, (data) => {
        const isProtected = data.protectedDomains.some(domain => origin.includes(domain));
        if (isProtected) {
          lockedTabs.set(tabId, origin);
        }
      });
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  lockedTabs.delete(tabId);
});
