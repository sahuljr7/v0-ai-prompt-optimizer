/**
 * Format token count to readable string
 */
export function formatTokens(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

/**
 * Format temperature description
 */
export function getTemperatureDescription(temp: number): string {
  if (temp < 0.3) return 'Very Focused';
  if (temp < 0.6) return 'Focused';
  if (temp < 1) return 'Balanced';
  if (temp < 1.5) return 'Creative';
  return 'Very Creative';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

/**
 * Validate API key format (basic check)
 */
export function isValidApiKey(key: string): boolean {
  return key.trim().length > 0;
}

/**
 * Delay function for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
