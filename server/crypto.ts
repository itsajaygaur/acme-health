import crypto from 'crypto';

// Configuration
const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.JWT_SECRET! ; // 32 characters for AES-256

// Ensure the key is exactly 32 bytes for AES-256
function getKey(encryptionKey?: string): Buffer {
  return crypto.createHash('sha256').update(encryptionKey || SECRET_KEY).digest();
}

/**
 * Encrypts a string value
 * @param text - The text to encrypt
 * @returns Encrypted string in format: iv:encryptedData
 */
export function encrypt(text: string, encryptionKey?: string): string {
  const key = getKey(encryptionKey);
  const iv = crypto.randomBytes(16); // 16 bytes IV for AES
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV and encrypted data separated by colon
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted string
 * @param encryptedText - The encrypted text in format: iv:encryptedData
 * @returns Decrypted original string
 */
export function decrypt(encryptedText: string, encryptionKey?: string): string {
  const key =   getKey(encryptionKey);
  const [ivHex, encrypted] = encryptedText.split(':');
  
  if (!ivHex || !encrypted) {
    throw new Error('Invalid encrypted data format');
  }
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Utility functions for .env file operations
/**
 * Encrypts all values in an object (useful for environment variables)
 */
export function encryptEnvValues(envObject: Record<string, string>): Record<string, string> {
  const encrypted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(envObject)) {
    encrypted[key] = encrypt(value);
  }
  
  return encrypted;
}

/**
 * Decrypts all values in an object (useful for environment variables)
 */
export function decryptEnvValues(encryptedEnvObject: Record<string, string>): Record<string, string> {
  const decrypted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(encryptedEnvObject)) {
    try {
      decrypted[key] = decrypt(value);
    } catch (error) {
      // If decryption fails, assume it's not encrypted and use as-is
      decrypted[key] = value;
    }
  }
  
  return decrypted;
}

// // Example usage
// if (require.main === module) {
//   // Example usage
//   const originalText = "my-secret-database-password";
//   console.log("Original:", originalText);
  
//   const encrypted = encrypt(originalText);
//   console.log("Encrypted:", encrypted);
  
//   const decrypted = decrypt(encrypted);
//   console.log("Decrypted:", decrypted);
  
//   // Example with env-like object
//   const envVars = {
//     DATABASE_URL: "postgresql://user:pass@localhost:5432/mydb",
//     API_SECRET: "super-secret-api-key",
//     JWT_SECRET: "jwt-signing-secret"
//   };
  
//   console.log("\nOriginal env vars:", envVars);
  
//   const encryptedEnv = encryptEnvValues(envVars);
//   console.log("Encrypted env vars:", encryptedEnv);
  
//   const decryptedEnv = decryptEnvValues(encryptedEnv);
//   console.log("Decrypted env vars:", decryptedEnv);
// }