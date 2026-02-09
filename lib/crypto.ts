/**
 * Client-side E2EE (MVP) using AES-GCM via Web Crypto API.
 * Messages are encrypted in the browser before being sent over Supabase Realtime.
 * Supabase only relays ciphertext — no plaintext is ever stored.
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

/**
 * Derive an AES key from a room secret (passphrase) using PBKDF2.
 * In a full E2EE setup you'd exchange keys; for MVP we use a shared room secret.
 */
async function deriveKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Generate a random IV for AES-GCM.
 */
function randomIv(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Generate a random salt for key derivation.
 */
function randomSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Encrypt plaintext with AES-GCM. Returns base64-encoded iv + ciphertext.
 * Salt is generated and prepended for key derivation (roomId used as passphrase in MVP).
 */
export async function encrypt(
  plaintext: string,
  roomSecret: string
): Promise<{ ciphertext: string; iv: string }> {
  const salt = randomSalt();
  const key = await deriveKey(roomSecret, salt);
  const iv = randomIv();
  const encoder = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv as BufferSource,
      tagLength: 128,
    },
    key,
    encoder.encode(plaintext)
  );

  // Prepend salt to ciphertext so receiver can derive same key
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  return {
    ciphertext: btoa(String.fromCharCode.apply(null, Array.from(combined))),
    iv: btoa(String.fromCharCode.apply(null, Array.from(iv))),
  };
}

/**
 * Decrypt ciphertext (base64) with AES-GCM using room secret.
 */
export async function decrypt(
  ciphertextB64: string,
  ivB64: string,
  roomSecret: string
): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertextB64), (c) =>
    c.charCodeAt(0)
  );
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(roomSecret, salt);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv as BufferSource,
      tagLength: 128,
    },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Generate a random sender ID for anonymous display (not stored).
 */
export function generateSenderId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 12);
}
