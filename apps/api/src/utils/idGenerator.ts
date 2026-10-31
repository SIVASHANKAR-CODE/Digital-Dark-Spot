import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID using UUID v4.
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate a prefixed unique ID for categorized entities.
 */
export function generatePrefixedId(prefix: string): string {
  return `${prefix}_${uuidv4()}`;
}
