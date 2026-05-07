import { createHmac } from 'crypto';

const salt = process.env.AUDIT_IP_HASH_SALT;

if (!salt) {
  console.warn('⚠️ [SECURITY WARNING] AUDIT_IP_HASH_SALT is not set. IP hashing will be completely disabled, and ip_hash will be stored as null. NEVER store raw IP addresses in production.');
}

/**
 * Hashes an IP address using SHA256 HMAC with a secret salt.
 * If salt is not configured, returns null to avoid raw IP exposure.
 */
export function hashIp(ipAddress: string | undefined): string | null {
  if (!ipAddress || !salt) {
    return null;
  }
  try {
    return createHmac('sha256', salt).update(ipAddress).digest('hex');
  } catch (err) {
    console.error('Failed to hash IP address', err);
    return null;
  }
}
