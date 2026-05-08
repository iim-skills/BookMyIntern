/**
 * Lightweight email allow/block checker.
 * Blocks a short list of well-known disposable/temporary email domains.
 * Add more domains to BLOCKED_DOMAINS as needed.
 */

const BLOCKED_DOMAINS = new Set([
  // Disposable / temp-mail services
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamail.info',
  'sharklasers.com',
  'spam4.me',
  'trashmail.com',
  'trashmail.me',
  'trashmail.net',
  'trashmail.org',
  'trashmail.at',
  'trashmail.io',
  'yopmail.com',
  'yopmail.fr',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'throwam.com',
  'throwam.net',
  'dispostable.com',
  'maildrop.cc',
  'fakeinbox.com',
  'mailnull.com',
  'spamgourmet.com',
  'spamgourmet.net',
  'spamgourmet.org',
  'nfmail.com',
  'emailondeck.com',
  'getnada.com',
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.co.za',
  'minutemail.com',
  'mohmal.com',
  'burnermail.io',
  'inboxbear.com',
  'spambox.us',
  'discard.email',
]);

export interface EmailCheckResult {
  ok:      boolean;
  reason?: string;
}

export function isEmailAllowed(email: string): EmailCheckResult {
  if (!email || typeof email !== 'string') {
    return { ok: false, reason: 'Email is required.' };
  }

  const trimmed = email.trim().toLowerCase();
  const parts   = trimmed.split('@');

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { ok: false, reason: 'Invalid email format.' };
  }

  const domain = parts[1];

  if (BLOCKED_DOMAINS.has(domain)) {
    return {
      ok:     false,
      reason: 'Disposable email addresses are not allowed. Please use a real email.',
    };
  }

  return { ok: true };
}
