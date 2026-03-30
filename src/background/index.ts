// Service Worker - NO DOM, NO Window, NO document here

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("PhishSense AI extension installed.");
});

// Enable side panel on supported pages
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

// Message listener - central hub for all communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message in background:", message, sender);

  return true; // Indicates we will respond asynchronously
});

console.log("PhishSense AI background script loaded.");

export {};