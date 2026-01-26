export const API_CONFIG = {
  BASE_URL: getBaseApiUrl(),
  AUTH_ENDPOINTS: {
    LOGIN: "/login/",
    REGISTER: "/register/",
    PROFILE: "/profile/",
    USERS: "/users/",
    REFRESH: "/token/refresh/",
    UPDATE_PROFILE: "/profile/update/",
  },
} as const;

function getBaseApiUrl() {
  // 1. If explicitly set in environment variables, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2. VPS Production URL
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    
    // If accessing via IP address
    if (host === "5.189.189.109" || host === "your-domain.com") { // Replace with your domain
      return "https://5.189.189.109/api"; // Use HTTPS if configured
    }
  }

  // 3. Fallback for local development
  return "http://localhost:8000/api";
}

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// NOTE: For media URLs, use getMediaUrl from '@/lib/media-utils' instead.
// It handles S3 URLs (production) and local development URLs properly.