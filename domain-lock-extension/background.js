// background.js - Domain Lock for Tabs (v1.5)

// 1. Controleer of een URL een interne browser- of foutpagina is
function isSystemUrl(url) {
  if (!url) return true;
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-error://') ||
    url.startsWith('chrome-search://') ||
    url.startsWith('brave://') ||
    url.startsWith('about:') ||
    url.startsWith('edge://')
  );
}

// 2. Hoofdlogica: Controleer navigatie vóór het laden van de pagina
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Alleen het hoofdframe van de tab controleren (negeer iFrames)
  if (details.frameId !== 0) return;

  // Systeem- en foutpagina's altijd negeren (voorkomt hibernation-loops)
  if (isSystemUrl(details.url)) return;

  try {
    // Haal opgeslagen beschermde domeinen op (standaard: mail.google.com)
    const { protectedDomains = ['mail.google.com'] } = await chrome.storage.sync.get('protectedDomains');

    // Haal de huidige status van de tab op
    const tab = await chrome.tabs.get(details.tabId);
    if (!tab || !tab.url || isSystemUrl(tab.url)) return;

    // Check of de tab op dit moment op een beschermd domein staat
    const currentProtectedDomain = protectedDomains.find(domain => tab.url.includes(domain));

    if (currentProtectedDomain) {
      // Als de doellocatie NIET het beschermde domein bevat:
      if (!details.url.includes(currentProtectedDomain)) {
        // Open de doel-URL in een nieuw tabblad
        await chrome.tabs.create({ url: details.url });

        // Herstel de originele beschermde URL op de huidige tab
        await chrome.tabs.update(details.tabId, { url: tab.url });
      }
    }
  } catch (error) {
    // Vang eventuele tab-opvraagfouten op tijdens opstarten/hibernation
    console.debug('Domain Lock check skipped:', error);
  }
});
