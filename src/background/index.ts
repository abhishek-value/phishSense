import type { ExtensionMessage, PhishAnalysisResult } from '../shared/types';
import { STORAGE_KEY } from '../shared/constants';

// Service Worker - NO DOM, NO Window, NO document here

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('PhishSense AI extension installed.');
});

// Enable side panel on supported pages
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

// Message listener - central hub for all communication
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    console.log('Received message in background:', message, sender);

    (async () => {
      switch (message.type) {
        case 'SCAN_EMAIL': {
          // MOCK API RESPONSE - REMOVE LATER
          const mockAnalysis: PhishAnalysisResult = {
            riskScore: Math.floor(Math.random() * 101),
            verdict: ['safe', 'suspicious', 'phishing'][Math.floor(Math.random() * 3)] as 'safe' | 'suspicious' | 'phishing',
            manipulationTactics: [
              { principle: 'Urgency', evidence: 'The email creates a sense of urgency to make you act quickly.', severity: 'high' },
              { principle: 'Authority', evidence: 'The sender claims to be from a well-known company.', severity: 'medium' },
            ],
            becIndicators: ['The sender email domain does not match the company.', 'The email contains a generic greeting.'],
            technicalFlags: ['SPF record not found.', 'DKIM signature invalid.'],
            summary: 'This email shows several signs of a phishing attempt. The sender is trying to create a sense of urgency and is impersonating a known brand.',
            detailedReport: [
              'The "From" address is suspicious because the domain does not match the company it claims to be from.',
              'The link in the email goes to a different domain than the one displayed.',
              'The email contains spelling and grammar errors.'
            ],
          };

          // Store the latest result
          await chrome.storage.local.set({
            [STORAGE_KEY.LATEST_RESULT]: mockAnalysis,
          });

          // Open the side panel and then send the response
          const targetTabId = message.tabId || sender.tab?.id;
          if (targetTabId) {
            await chrome.sidePanel.open({ tabId: targetTabId });
          }
          sendResponse({ status: 'complete' });
          break;
        }

        case 'GET_LATEST_RESULT': {
          const data = await chrome.storage.local.get(STORAGE_KEY.LATEST_RESULT);
          sendResponse(data[STORAGE_KEY.LATEST_RESULT] || null);
          break;
        }

        default:
          sendResponse({ status: 'not_implemented' });
      }
    })();
    return true; // Indicates we will respond asynchronously
  }
);

console.log('PhishSense AI background script loaded.');

export {};