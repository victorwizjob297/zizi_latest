/**
 * JWT Utility Functions
 * Decode JWT tokens and check if they're expired
 */

interface DecodedToken {
  exp: number;
  iat: number;
  [key: string]: any;
}

/**
 * Decode a JWT token (without verification)
 * Note: This only decodes the token - it doesn't verify the signature.
 * Signature verification happens on the backend.
 */
export const decodeJWT = (token: string): DecodedToken | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * Returns true if expired, false if still valid
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true;
  }

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Get the time remaining until token expires (in seconds)
 * Returns negative value if already expired
 */
export const getTimeUntilExpiry = (token: string | null): number => {
  if (!token) {
    return -1;
  }

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return -1;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp - currentTime;
};

/**
 * Format seconds into a human-readable string
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) {
    return "expired";
  }

  if (seconds < 60) {
    return `${Math.floor(seconds)} seconds`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""}`;
};
