import { useState } from 'react';
import type { EmailData, PhishAnalysisResult } from '../shared/types';

type ScanState = 'idle' | 'scanning' | 'success' | 'no-email' | 'error';

const verdictConfig = {
  safe: { label: 'Safe', color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-700/50' },
  suspicious: { label: 'Suspicious', color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700/50' },
  phishing: { label: 'Phishing', color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-700/50' },
};

const Popup = () => {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [analysis, setAnalysis] = useState<PhishAnalysisResult | null>(null);

  const handleScan = async () => {
    setScanState('scanning');
    setEmailData(null);
    setAnalysis(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setScanState('error');
        return;
      }

      // Step 1: Read email from content script
      const readResponse = await chrome.tabs.sendMessage(tab.id, { type: 'READ_EMAIL' });

      if (!readResponse?.emailData) {
        setScanState('no-email');
        return;
      }

      setEmailData(readResponse.emailData);

      // Step 2: Send to background for analysis and await result
      const analysisResult: PhishAnalysisResult = await chrome.runtime.sendMessage({
        type: 'SCAN_EMAIL',
        emailData: readResponse.emailData,
      });

      console.log('PhishSense Popup: Analysis result:', analysisResult);
      setAnalysis(analysisResult);
      setScanState('success');
    } catch (err) {
      console.error('PhishSense Popup: Scan failed:', err);
      setScanState('error');
    }
  };

  const verdict = analysis ? verdictConfig[analysis.verdict] : null;

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

      {/* Idle */}
      {scanState === 'idle' && (
        <p className="text-xs text-slate-500 mt-3 text-center">
          Open an email in Gmail or Outlook, then click Scan.
        </p>
      )}

      {/* No email */}
      {scanState === 'no-email' && (
        <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
          <p className="text-sm text-yellow-400">No email detected.</p>
          <p className="text-xs text-yellow-600 mt-1">
            Make sure you have an email open in Gmail or Outlook.
          </p>
        </div>
      )}

      {/* Error */}
      {scanState === 'error' && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
          <p className="text-sm text-red-400">Could not scan email.</p>
          <p className="text-xs text-red-600 mt-1">
            Ensure you are on a Gmail or Outlook tab.
          </p>
        </div>
      )}

      {/* Analysis Result */}
      {scanState === 'success' && analysis && verdict && (
        <div className="mt-3 space-y-3">
          {/* Verdict Banner */}
          <div className={`p-3 ${verdict.bg} border ${verdict.border} rounded-lg flex items-center justify-between`}>
            <div>
              <p className={`text-lg font-bold ${verdict.color}`}>{verdict.label}</p>
              <p className="text-xs text-slate-400">Risk Score: {analysis.riskScore}/100</p>
            </div>
            <div className={`text-3xl font-bold ${verdict.color}`}>{analysis.riskScore}</div>
          </div>

          {/* Summary */}
          <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Summary</p>
            <p className="text-xs text-slate-300 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Email Info */}
          {emailData && (
            <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg space-y-1.5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Email Details</p>
              <p className="text-xs text-slate-300 truncate">
                <span className="text-slate-500">Subject: </span>{emailData.subject}
              </p>
              <p className="text-xs text-slate-300 truncate">
                <span className="text-slate-500">From: </span>{emailData.senderName} &lt;{emailData.sender}&gt;
              </p>
              <p className="text-xs text-slate-300">
                <span className="text-slate-500">Links: </span>{emailData.links.length}
                <span className="text-slate-500 ml-3">Platform: </span>
                <span className="capitalize">{emailData.platform}</span>
              </p>
            </div>
          )}

          {/* Flags */}
          {analysis.technicalFlags.length > 0 && (
            <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Technical Flags</p>
              <ul className="space-y-1">
                {analysis.technicalFlags.map((flag, i) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                    <span className="text-red-400">&#9679;</span>{flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Popup;
