import { createPlatformAdapter } from './adapters';

console.log('PhishSense AI content script loaded.');

const adapter = createPlatformAdapter();

if (adapter) {
  console.log('PhishSense: Adapter loaded:', adapter.constructor.name);
} else {
  console.error('PhishSense: No adapter found for this platform.');
}

// Listen for READ_EMAIL requests from the popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'READ_EMAIL') {
    if (!adapter) {
      sendResponse({ type: 'EMAIL_DATA', emailData: null });
      return;
    }

    if (!adapter.isEmailOpen()) {
      sendResponse({ type: 'EMAIL_DATA', emailData: null });
      return;
    }

    const emailData = adapter.readEmail();
    console.log('PhishSense: Email data read on demand:', emailData);
    sendResponse({ type: 'EMAIL_DATA', emailData });
  }
});
