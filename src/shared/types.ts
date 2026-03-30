// Email data extracted by content script
export interface EmailData {
  sender: string;
  senderName: string;
    subject: string;
    body: string;
    links: string[];
    timestamp: string;
    platfrom: 'gmail' | 'outlook';
}

// Analysis result from Backend API
export interface PhishAnalysisResult {
    riskScore: number; // 0-100
    verdict: 'safe' | 'suspicious' | 'phishing';
    manipulationTactics: ManupulationTactic[];
    becIndicators: string[];
    technicalFlags: string[];
    summary: string;
    detailedReport: string[];
}

export interface ManupulationTactic {   
    principle: string; // e.g. Authority, Urgency, Scarcity
    evidence: string;
    severity: 'low' | 'medium' | 'high';
}

// Message format for communication between content script and background/sidepanel
export type ExtensionMessage  = 
| { type: 'SCAN_EMAIL'; emailData: EmailData }
| { type: 'ANALYSIS_RESULT'; analysis: PhishAnalysisResult }
| { type: 'GET_LATEST_RESULT'; }
| { type: 'OPEN_SIDE_PANEL' }