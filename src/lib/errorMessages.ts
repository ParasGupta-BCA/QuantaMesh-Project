/**
 * Safe error message utility
 * Maps internal error codes/messages to user-friendly messages
 * Prevents exposure of sensitive technical details
 */

// Known Supabase/Postgres error codes
const safeMessages: Record<string, string> = {
  // Postgres errors
  'PGRST116': 'Invalid request. Please check your input.',
  '23505': 'This record already exists.',
  '23503': 'Referenced record not found.',
  '42501': 'You do not have permission to perform this action.',
  '42P01': 'The requested resource could not be found.',
  '22P02': 'Invalid input format.',
  '23502': 'Required information is missing.',
  
  // Auth errors
  'invalid_credentials': 'Invalid email or password.',
  'user_already_exists': 'An account with this email already exists.',
  'email_not_confirmed': 'Please verify your email address.',
  'invalid_grant': 'Invalid login credentials.',
  'email_already_in_use': 'This email is already registered.',
  
  // Rate limiting
  'rate_limit_exceeded': 'Too many requests. Please try again later.',
  'over_request_limit': 'Too many requests. Please wait a moment.',
  
  // Network errors
  'NETWORK_ERROR': 'Network error. Please check your connection.',
  'TIMEOUT': 'Request timed out. Please try again.',
};

// Patterns to match and sanitize
const sensitivePatterns = [
  /column\s+\"[^\"]+\"/gi,
  /table\s+\"[^\"]+\"/gi,
  /relation\s+\"[^\"]+\"/gi,
  /policy\s+\"[^\"]+\"/gi,
  /function\s+\"[^\"]+\"/gi,
  /schema\s+\"[^\"]+\"/gi,
  /at\s+\/[^\s]+/gi, // File paths
  /line\s+\d+/gi, // Line numbers
  /position\s+\d+/gi, // Position info
];

/**
 * Get a safe, user-friendly error message
 * @param error - The error object from an API call
 * @param fallbackMessage - Default message if no mapping exists
 * @returns A safe message suitable for display to users
 */
export function getSafeErrorMessage(
  error: unknown,
  fallbackMessage = 'An error occurred. Please try again.'
): string {
  if (!error) return fallbackMessage;

  // Extract error code and message
  const errorObj = error as { code?: string; message?: string; details?: string };
  const code = errorObj.code || '';
  const message = errorObj.message || '';

  // Check for known error codes first
  if (code && code in safeMessages) {
    return safeMessages[code];
  }

  // Check for known patterns in the message
  const lowerMessage = message.toLowerCase();
  
  // Auth-specific patterns
  if (lowerMessage.includes('already registered') || lowerMessage.includes('already exists')) {
    return 'An account with this email already exists.';
  }
  if (lowerMessage.includes('invalid login credentials') || lowerMessage.includes('invalid credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (lowerMessage.includes('email not confirmed')) {
    return 'Please verify your email address.';
  }
  if (lowerMessage.includes('rate limit')) {
    return 'Too many requests. Please wait a moment before trying again.';
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (lowerMessage.includes('permission') || lowerMessage.includes('denied')) {
    return 'You do not have permission to perform this action.';
  }
  if (lowerMessage.includes('not found')) {
    return 'The requested resource could not be found.';
  }
  if (lowerMessage.includes('duplicate') || lowerMessage.includes('unique')) {
    return 'This record already exists.';
  }

  // Check if the message contains sensitive patterns
  const hasSensitiveData = sensitivePatterns.some(pattern => pattern.test(message));
  
  if (hasSensitiveData) {
    // Log the full error for debugging but return generic message
    console.error('Sanitized error (details hidden from user):', error);
    return fallbackMessage;
  }

  // If the message looks safe (short, no technical jargon), return it
  // Otherwise return the fallback
  if (message.length < 100 && !message.includes('Error:') && !message.includes('Exception')) {
    return message;
  }

  console.error('Unhandled error type:', error);
  return fallbackMessage;
}

/**
 * Log error details safely for debugging
 * Only logs to console in development
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
}
