const DEFAULT_DOMAINS = ["mail.google.com", "web.whatsapp.com"];

function getOrigin(url) {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch (e) {
    return null;
  }
}

// Luister direct naar navigaties
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Alleen het hoofdframe (niet iframes)
  if (details.frameId !== 0) return;

  try {
    // Haal de HUIDIGE status van de tab op voordat hij navigeert
    const tab = await chrome.tabs.get(details.tabId);
    if (!tab || !tab.url) return;

    const currentOrigin = getOrigin(tab.url);
    const targetOrigin = getOrigin(details.url);

    // Als de huidige pagina al een beschermd domein is...
    if (currentOrigin) {
      const data = await chrome.storage.sync.get({ protectedDomains: DEFAULT_DOMAINS });
      const isCurrentProtected = data.protectedDomains.some(domain => currentOrigin.includes(domain));

      // ...en de NIEUWE pagina gaat naar een ANDER domein:
      if (isCurrentProtected && targetOrigin && targetOrigin !== currentOrigin) {

        // 1. Open de aangeklikte bookmark/URL direct in een nieuw tabblad
        chrome.tabs.create({ url: details.url, active: true });

        // 2. Houd de huidige tab geforceerd op z'n eigen domein
        chrome.tabs.update(details.tabId, { url: tab.url });
      }
    }
  } catch (e) {
    // Tab bestaat mogelijk niet meer of is een interne chrome:// pagina
  }
});
