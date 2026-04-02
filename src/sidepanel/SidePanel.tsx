import { useEffect, useState } from 'react';
import type { PhishAnalysisResult } from '../shared/types';
import { STORAGE_KEY } from '../shared/constants';
import SidePanelContainer from './SidePanelContainer';
import { mockData } from './mockData'; // Keep mockData for fallback

const SidePanel = () => {
  const [data, setData] = useState<PhishAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestResult = async () => {
      try {
        const result = await chrome.runtime.sendMessage({ type: 'GET_LATEST_RESULT' });
        if (result) {
          setData(result);
        } else {
          // Use mock data as a fallback if no result is found
          // @ts-expect-error - mockData may not perfectly match PhishAnalysisResult
          setData(mockData);
        }
      } catch (e) {
        console.error('Error fetching analysis result:', e);
        setError('Could not load analysis data.');
        // @ts-expect-error - mockData may not perfectly match PhishAnalysisResult
        setData(mockData); // Use mock data on error
      }
    };

    fetchLatestResult();

    // Also listen for storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes[STORAGE_KEY.LATEST_RESULT]) {
        setData(changes[STORAGE_KEY.LATEST_RESULT].newValue as PhishAnalysisResult);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    // Reset to idle when a new email is detected in the tab
    const handleMessage = (message: { type: string }) => {
      if (message.type === 'RESET') {
        setData(null);
        setError(null);
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4">
        <h1 className="text-lg font-bold text-red-500">Error</h1>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center justify-center gap-3">
        <span className="text-4xl">🛡️</span>
        <h1 className="text-lg font-bold">PhishSense AI</h1>
        <p className="text-sm text-slate-400 text-center">
          New email detected. Open the popup to scan it.
        </p>
      </div>
    );
  }

  // Map the PhishAnalysisResult to the SidePanelData format
  const sidePanelData = {
    classification: (data.verdict.charAt(0).toUpperCase() + data.verdict.slice(1)) as 'Safe' | 'Suspicious' | 'Phishing',
    score: data.riskScore,
    verdict: { title: data.verdict.charAt(0).toUpperCase() + data.verdict.slice(1), description: data.summary },
    sender: mockData.sender, // Placeholder
    emailBody: mockData.emailBody, // Placeholder
    highlightedPhrases: mockData.highlightedPhrases, // Placeholder
    urls: mockData.urls, // Placeholder
    explanation: data.summary,
  };

  return <SidePanelContainer data={sidePanelData} />;
};

export default SidePanel;
