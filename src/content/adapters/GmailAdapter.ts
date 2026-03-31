import type { EmailData, EmailPlatformAdapter } from './types';

export class GmailAdapter implements EmailPlatformAdapter {
  isEmailOpen(): boolean {
    // TODO: Implement logic to check if a Gmail email is open
    return false;
  }

  readEmail(): EmailData | null {
    // TODO: Implement logic to read email data from Gmail DOM
    return null;
  }

  getBadgeTarget(): HTMLElement | null {
    // TODO: Implement logic to find the target element for the badge in Gmail
    return null;
  }

  getBodyElement(): HTMLElement | null {
    // TODO: Implement logic to get the email body element in Gmail
    return null;
  }
}