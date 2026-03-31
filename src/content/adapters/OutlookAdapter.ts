import type { EmailData, EmailPlatformAdapter } from './types';

export class OutlookAdapter implements EmailPlatformAdapter {
  isEmailOpen(): boolean {
    // TODO: Implement logic to check if an Outlook email is open
    return false;
  }

  readEmail(): EmailData | null {
    // TODO: Implement logic to read email data from Outlook DOM
    return null;
  }

  getBadgeTarget(): HTMLElement | null {
    // TODO: Implement logic to find the target element for the badge in Outlook
    return null;
  }

  getBodyElement(): HTMLElement | null {
    // TODO: Implement logic to get the email body element in Outlook
    return null;
  }
}