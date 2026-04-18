/**
 * Bad Word Filtering System using API Layer Bad Words API
 * with fallback to local profanities package
 * 
 * Provides two modes:
 * 1. Check: Returns boolean indicating if bad words exist
 * 2. Censor: Returns sanitized string with profanity replaced by asterisks
 * 
 * Fallback: If API fails, uses local profanities list
 */

import { profanities } from "profanities";

const API_URL = "https://api.apilayer.com/bad_words";
const API_KEY = process.env.BAD_WORDS_API_LAYER_KEY;
const API_TIMEOUT = 5000; // 5 second timeout

if (!API_KEY) {
  console.warn("[bad-words] BAD_WORDS_API_LAYER_KEY is not configured in environment variables");
}

export interface BadWordsCheckResult {
  hasBadWords: boolean;
  error?: string;
  usedFallback?: boolean;
}

export interface BadWordsCensorResult {
  sanitized: string;
  hasBadWords: boolean;
  error?: string;
  usedFallback?: boolean;
}

// =============================================================================
// Fallback Functions (Local Profanities Package)
// =============================================================================

/**
 * Check if text contains bad words using local profanities list
 */
function checkBadWordsLocally(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Check if any profanity exists in the text (word boundary aware)
  return profanities.some((word: string) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lowerText);
  });
}

/**
 * Censor bad words using local profanities list
 */
function censorBadWordsLocally(text: string): string {
  let sanitized = text;

  // Replace each profanity with asterisks
  profanities.forEach((word: string) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    sanitized = sanitized.replace(regex, (match) => "*".repeat(match.length));
  });

  return sanitized;
}

/**
 * Create a fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Check if text contains bad words
 * @param text - The text to check
 * @returns Object with hasBadWords boolean and optional error message
 */
export async function checkBadWords(text: string): Promise<BadWordsCheckResult> {
  if (!text || text.trim().length === 0) {
    return { hasBadWords: false };
  }

  // Try API first if key is configured
  if (API_KEY) {
    try {
      const response = await fetchWithTimeout(
        `${API_URL}?censor_character=*`,
        {
          method: "POST",
          headers: {
            "apikey": API_KEY,
            "Content-Type": "text/plain",
          },
          body: text,
        },
        API_TIMEOUT
      );

      // If API returns 5xx error, fall back to local
      if (response.status >= 500) {
        console.warn(`[bad-words] API returned ${response.status}, using fallback`);
        const hasBadWords = checkBadWordsLocally(text);
        return { hasBadWords, usedFallback: true };
      }

      if (!response.ok) {
        console.error(`[bad-words] API error: ${response.status} ${response.statusText}`);
        const hasBadWords = checkBadWordsLocally(text);
        return { hasBadWords, usedFallback: true };
      }

      const result = await response.json();
      
      // Check if bad words were found
      const hasBadWords = result.bad_words_total > 0;
      
      return { hasBadWords };
    } catch (error) {
      // Fallback to local on any error (network, timeout, etc.)
      console.warn("[bad-words] API request failed, using local fallback:", error);
      const hasBadWords = checkBadWordsLocally(text);
      return { hasBadWords, usedFallback: true };
    }
  }

  // No API key configured, use local fallback
  console.warn("[bad-words] No API key configured, using local fallback");
  const hasBadWords = checkBadWordsLocally(text);
  return { hasBadWords, usedFallback: true };
}

/**
 * Censor bad words in text by replacing them with asterisks
 * @param text - The text to censor
 * @returns Object with sanitized text, hasBadWords boolean, and optional error message
 */
export async function censorBadWords(text: string): Promise<BadWordsCensorResult> {
  if (!text || text.trim().length === 0) {
    return { 
      sanitized: text, 
      hasBadWords: false 
    };
  }

  // Try API first if key is configured
  if (API_KEY) {
    try {
      const response = await fetchWithTimeout(
        `${API_URL}?censor_character=*`,
        {
          method: "POST",
          headers: {
            "apikey": API_KEY,
            "Content-Type": "text/plain",
          },
          body: text,
        },
        API_TIMEOUT
      );

      // If API returns 5xx error, fall back to local
      if (response.status >= 500) {
        console.warn(`[bad-words] API returned ${response.status}, using fallback`);
        const sanitized = censorBadWordsLocally(text);
        const hasBadWords = sanitized !== text;
        return { sanitized, hasBadWords, usedFallback: true };
      }

      if (!response.ok) {
        console.error(`[bad-words] API error: ${response.status} ${response.statusText}`);
        const sanitized = censorBadWordsLocally(text);
        const hasBadWords = sanitized !== text;
        return { sanitized, hasBadWords, usedFallback: true };
      }

      const result = await response.json();
      
      // Extract censored content from JSON response
      const sanitized = result.censored_content || text;
      const hasBadWords = result.bad_words_total > 0;
      
      return { 
        sanitized, 
        hasBadWords 
      };
    } catch (error) {
      // Fallback to local on any error (network, timeout, etc.)
      console.warn("[bad-words] API request failed, using local fallback:", error);
      const sanitized = censorBadWordsLocally(text);
      const hasBadWords = sanitized !== text;
      return { sanitized, hasBadWords, usedFallback: true };
    }
  }

  // No API key configured, use local fallback
  console.warn("[bad-words] No API key configured, using local fallback");
  const sanitized = censorBadWordsLocally(text);
  const hasBadWords = sanitized !== text;
  return { sanitized, hasBadWords, usedFallback: true };
}

/**
 * Validate and sanitize text for user-generated content
 * This is a convenience function that censors bad words and returns the sanitized text
 * Use this for content that should be sanitized rather than blocked
 */
export async function sanitizeUserContent(text: string): Promise<string> {
  const result = await censorBadWords(text);
  return result.sanitized;
}

/**
 * Validate text for strict blocking (e.g., usernames)
 * Returns true if text is clean (no bad words), false otherwise
 * Use this for content that should be blocked entirely if it contains bad words
 */
export async function validateCleanText(text: string): Promise<boolean> {
  const result = await checkBadWords(text);
  return !result.hasBadWords;
}
