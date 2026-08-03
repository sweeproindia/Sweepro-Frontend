/**
 * Shared authentication validation utilities for Email and Password.
 * Enforces strict, RFC-compliant rules across all forms (SignupPage, SignupForm, LoginPage, etc.).
 */

// Email regex enforcing standard user@domain.tld structure with at least a 2-character TLD (.com, .in, .org, etc.)
// Strictly rejects backticks, emojis, spaces, missing @, invalid characters, single-letter TLDs (.j).
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Non-ASCII or emoji character detection regex (printable ASCII range is \x20 to \x7E)
export const NON_ASCII_EMOJI_REGEX = /[^\x20-\x7E]/;

/**
 * Validates an email address and returns a descriptive error message explaining HOW/WHY it failed, or null if valid.
 */
export const validateEmail = (email: string): string | null => {
  const trimmed = email ? email.trim() : '';
  if (!trimmed) {
    return 'Email address is required.';
  }

  // Check for emojis or non-ASCII characters
  if (NON_ASCII_EMOJI_REGEX.test(email)) {
    return 'Email cannot contain emojis or non-standard characters.';
  }

  // Check for invalid characters like backticks or spaces
  if (/[`\s]/.test(email)) {
    return 'Email contains invalid characters (backticks or spaces are not allowed).';
  }

  // Check structure
  if (!trimmed.includes('@')) {
    return 'Email address must include an "@" symbol (e.g., user@example.com).';
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return 'Please enter a valid email format with username and domain (e.g., user@example.com).';
  }

  const domainParts = parts[1].split('.');
  const tld = domainParts[domainParts.length - 1];

  if (domainParts.length < 2 || !tld || tld.length < 2) {
    return 'Email domain must end with a valid domain extension of at least 2 letters (e.g., .com, .in, .org).';
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address (e.g., user@example.com).';
  }

  if (trimmed.length > 255) {
    return 'Email address is too long (maximum 255 characters).';
  }

  return null;
};

/**
 * Validates a password against complexity and character restrictions, returning a descriptive error message or null if valid.
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required.';
  }

  // Check for emojis or non-ASCII characters
  if (NON_ASCII_EMOJI_REGEX.test(password)) {
    return 'Password cannot contain emojis or non-standard characters.';
  }

  // Count visual graphemes/characters instead of UTF-16 code units
  const charCount = Array.from(password).length;
  if (charCount < 8) {
    return `Password must be at least 8 characters long (currently ${charCount} character${charCount === 1 ? '' : 's'}).`;
  }

  if (charCount > 128) {
    return 'Password cannot exceed 128 characters.';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must include at least one lowercase letter (a-z).';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter (A-Z).';
  }

  if (!/\d/.test(password)) {
    return 'Password must include at least one number (0-9).';
  }

  if (!/[@$!%*?&#^()_+\-=\[\]{}|;:'",.<>\/~\`]/.test(password)) {
    return 'Password must include at least one special character (e.g., @$!%*?&).';
  }

  return null;
};

/**
 * Helper to scroll smoothly to the first input element with a validation error and focus it.
 */
export const scrollToFirstError = (fieldErrors: Record<string, string | undefined>) => {
  const errorFieldKeys = Object.keys(fieldErrors).filter((key) => Boolean(fieldErrors[key]));
  if (errorFieldKeys.length === 0) return;

  const firstKey = errorFieldKeys[0];
  const element = document.getElementById(firstKey) || document.querySelector(`[name="${firstKey}"]`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if ('focus' in element && typeof (element as any).focus === 'function') {
      (element as HTMLElement).focus({ preventScroll: true });
    }
  }
};
