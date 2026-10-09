const defaultDomains = ["mail.google.com"];

// Laad en toon de huidige lijst
function loadDomains() {
  chrome.storage.sync.get({ protectedDomains: defaultDomains }, (data) => {
    // Sla de standaardlijst meteen op als de opslag nog leeg was
    chrome.storage.sync.set({ protectedDomains: data.protectedDomains });

    const list = document.getElementById("domainList");
    list.innerHTML = "";

    data.protectedDomains.forEach((domain) => {
      const li = document.createElement("li");
      li.textContent = domain;

      const delBtn = document.createElement("button");
      delBtn.textContent = "Remove";
      delBtn.className = "btn-del";
      delBtn.onclick = () => removeDomain(domain);

      li.appendChild(delBtn);
      list.appendChild(li);
    });
  });
}

// Voeg nieuw domein toe
document.getElementById("addBtn").addEventListener("click", () => {
  const input = document.getElementById("domainInput");
  let val = input.value.trim().toLowerCase();

  // Strip eventuele http:// of trailing slashes indien meegekopieerd
  val = val.replace(/^https?:\/\//, '').split('/')[0];

  if (!val) return;

  chrome.storage.sync.get({ protectedDomains: defaultDomains }, (data) => {
    const current = data.protectedDomains;
    if (!current.includes(val)) {
      const updated = [...current, val];
      chrome.storage.sync.set({ protectedDomains: updated }, () => {
        input.value = "";
        loadDomains();
      });
    }
  });
});

// Verwijder domein
function removeDomain(domainToRemove) {
  chrome.storage.sync.get({ protectedDomains: defaultDomains }, (data) => {
    const updated = data.protectedDomains.filter(d => d !== domainToRemove);
    chrome.storage.sync.set({ protectedDomains: updated }, () => {
      loadDomains();
    });
  });
}

// Open de optiepagina wanneer de gebruiker op het extensie-icoon klikt
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

document.addEventListener("DOMContentLoaded", loadDomains);
