/**
 * User Utility Functions
 */

/**
 * Check if a user has been on the platform for more than 1 year
 */
export const isUserLongTimeMember = (createdAt: string | null): boolean => {
  if (!createdAt) {
    return false;
  }

  try {
    const userCreatedDate = new Date(createdAt);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return userCreatedDate <= oneYearAgo;
  } catch (error) {
    console.error("Failed to parse user creation date:", error);
    return false;
  }
};

/**
 * Get user tenure in years (rounded to 1 decimal)
 */
export const getUserTenureYears = (createdAt: string | null): number => {
  if (!createdAt) {
    return 0;
  }

  try {
    const userCreatedDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - userCreatedDate.getTime();
    const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

    return Math.floor(diffYears * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.error("Failed to calculate user tenure:", error);
    return 0;
  }
};
