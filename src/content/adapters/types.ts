export interface EmailData {
  subject: string;
  body: string;
  sender: string;
  links: string[];
}

export interface EmailPlatformAdapter {
  isEmailOpen(): boolean;
  readEmail(): EmailData | null;
  getBadgeTarget(): HTMLElement | null;
  getBodyElement(): HTMLElement | null;
}