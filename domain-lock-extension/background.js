const DEFAULT_DOMAINS = ["mail.google.com", "web.whatsapp.com"];

// Domain Lock (beveiliging)
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (details.frameId !== 0) return;

    try {
        const tab = await chrome.tabs.get(details.tabId);
        if (!tab || !tab.url) return;

        const currentOrigin = getOrigin(tab.url);
        const targetOrigin = getOrigin(details.url);

        if (currentOrigin) {
            const data = await chrome.storage.sync.get({ protectedDomains: DEFAULT_DOMAINS });
            const isCurrentProtected = data.protectedDomains.some(domain => currentOrigin.includes(domain));

            if (isCurrentProtected && targetOrigin && targetOrigin !== currentOrigin) {
                chrome.tabs.create({ url: details.url, active: true });
                chrome.tabs.update(details.tabId, { url: tab.url });
            }
        }
    } catch (e) {}
});

function getOrigin(url) {
    try { return new URL(url).origin; } catch (e) { return null; }
}
