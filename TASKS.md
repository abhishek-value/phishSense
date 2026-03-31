# PhishSense — Task Tracker

---

## Completed Tasks

### T-01 — Project Scaffold ✅
Set up Chrome Extension project using Vite + React. Configure build to output content.js, background.js and side panel bundle. Share repo with all team members.

**Status:** Done — Vite + React + TypeScript scaffold in place with `@crxjs/vite-plugin`, Tailwind CSS, popup UI, side panel UI, and shared types/messaging utilities.

### T-02 — manifest.json ✅
Define Manifest V3 config. Add host permissions for Gmail and all Outlook domains (outlook.live.com, outlook.office.com, outlook.office365.com). Register content script and background service worker.

**Status:** Done — `manifest.json` configured with Manifest V3, all required host permissions, content script registration for Gmail + Outlook, and background service worker.

### T-03 — Platform Adapter Factory ✅
Create a factory function that detects the active email platform from `window.location.hostname` and returns the correct adapter (Gmail or Outlook). Both adapters must expose the same interface: `isEmailOpen()`, `readEmail()`, `getBadgeTarget()`, `getBodyElement()`. Dev 2 will implement Outlook adapter against this interface.

**Status:** Done — Adapter interface, stubs, and factory are complete.

### T-04 — Gmail DOM Adapter ✅
Read subject, body text, sender email and all HTTP links from the Gmail reading pane DOM. Return as `{ subject, body, sender, links[] }`. Use stable DOM selectors.

**Status:** Done — `GmailAdapter` implemented with DOM selectors for reading email content.

---

## Pending Tasks

### T-07 — Content Script Orchestrator 🔲
Main content.js logic: initialise platform adapter, watch for new emails, call `readEmail()`, deduplicate, send payload to background worker, handle response, trigger badge and side panel updates. Dev 2 badge and Dev 3 side panel integrate via `postMessage` — no hard dependency.

**Status:** Not started — `src/ content/index.tsx` contains only a console.log.

**Steps to complete:**
1. Import and initialise the platform adapter via the factory function from T-03.
2. Set up a `MutationObserver` on the email list/reading pane to detect when a new email is opened.
3. On email change, call `adapter.readEmail()` to extract email data.
4. Implement deduplication logic (e.g. hash of sender + subject + timestamp) to avoid re-scanning the same email.
5. Send `ANALYZE_EMAIL` message (with email payload) to the background service worker via `chrome.runtime.sendMessage`.
6. Handle the analysis response — dispatch badge update and side panel update via `postMessage` (loose coupling for Dev 2 and Dev 3).
7. Handle error states (adapter not ready, message send failure, timeout).

---

### T-08 — Background Service Worker 🔲 (Partial)
background.js message listener. Receive `ANALYZE_EMAIL` message from content script, call the backend `/analyze` endpoint (URL from Dev 4 / You), return API response to content script. Handle errors gracefully.

**Status:** Partially done — `src/background/index.ts` has a message listener registered but no `ANALYZE_EMAIL` handling or API call logic.

**Steps to complete:**
1. Add a `switch`/`if` block inside the existing `onMessage` listener to handle the `ANALYZE_EMAIL` message type.
2. Extract `emailData` from the message payload.
3. Call `fetch()` to POST the email data to `${API_BASE_URL}/analyze` (URL defined in `src/shared/constants.ts`).
4. Parse the JSON response and map it to the `PhishAnalysisResult` type.
5. Store the result in `chrome.storage.local` using the `STORAGE_KEY.LATEST_RESULT` key.
6. Send the analysis result back to the content script via `sendResponse()`.
7. Add error handling — network errors, non-200 responses, malformed JSON — and return a structured error to the content script.
