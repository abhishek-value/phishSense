import { useState } from 'react';
import type { EmailData } from '../shared/types';

type ScanState = 'idle' | 'scanning' | 'success' | 'no-email' | 'error';

const Popup = () => {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [emailData, setEmailData] = useState<EmailData | null>(null);

  const handleScan = async () => {
    setScanState('scanning');
    setEmailData(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setScanState('error');
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, { type: 'READ_EMAIL' });

      if (response?.emailData) {
        setEmailData(response.emailData);
        setScanState('success');

        // Send to background for analysis
        chrome.runtime.sendMessage({ type: 'SCAN_EMAIL', emailData: response.emailData });
        await chrome.storage.local.set({ LATEST_RESULT: response.emailData });
      } else {
        setScanState('no-email');
      }
    } catch {
      setScanState('error');
    }
  };

  return (
    <div className="w-[380px] bg-slate-950 text-white p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🛡️</span>
        <div>
          <h1 className="text-lg font-bold leading-tight">PhishSense AI</h1>
          <p className="text-xs text-slate-400">Email threat detection</p>
        </div>
      </div>

      {/* Scan Button */}
      <button
        onClick={handleScan}
        disabled={scanState === 'scanning'}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
      >
        {scanState === 'scanning' ? 'Scanning...' : 'Scan Email'}
      </button>

      {/* Status Messages */}
      {scanState === 'idle' && (
        <p className="text-xs text-slate-500 mt-3 text-center">
          Open an email in Gmail or Outlook, then click Scan.
        </p>
      )}

      {scanState === 'no-email' && (
        <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
          <p className="text-sm text-yellow-400">No email detected.</p>
          <p className="text-xs text-yellow-600 mt-1">
            Make sure you have an email open in Gmail or Outlook.
          </p>
        </div>
      )}

      {scanState === 'error' && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
          <p className="text-sm text-red-400">Could not scan email.</p>
          <p className="text-xs text-red-600 mt-1">
            Ensure you are on a Gmail or Outlook tab.
          </p>
        </div>
      )}

      {/* Email Data Preview */}
      {scanState === 'success' && emailData && (
        <div className="mt-3 p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400 text-sm">&#10003;</span>
            <span className="text-sm text-green-400 font-medium">Email captured</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Subject</p>
            <p className="text-sm text-slate-200 truncate">{emailData.subject}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">From</p>
            <p className="text-sm text-slate-200 truncate">
              {emailData.senderName} &lt;{emailData.sender}&gt;
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Links found</p>
            <p className="text-sm text-slate-200">{emailData.links.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Platform</p>
            <p className="text-sm text-slate-200 capitalize">{emailData.platform}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;
