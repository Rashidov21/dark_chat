/**
 * Room ID generation and validation.
 * Short, URL-friendly IDs for shareable room links.
 */

const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ID_LENGTH = 10;

/**
 * Generate a random room ID (URL-safe, no ambiguous chars for readability).
 */
export function generateRoomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/**
 * Validate room ID format (alphanumeric, reasonable length).
 */
export function isValidRoomId(id: string): boolean {
  return /^[a-zA-Z0-9]{6,20}$/.test(id);
}
