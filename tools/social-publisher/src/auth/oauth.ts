import type { OAuthClientConfig } from "../types.js";

export function buildOAuthPlan(): Record<string, OAuthClientConfig> {
  return {
    instagram: {
      clientIdEnv: "META_APP_ID",
      clientSecretEnv: "META_APP_SECRET",
      redirectUriEnv: "META_REDIRECT_URI",
      scopes: [
        "instagram_basic",
        "instagram_content_publish",
        "pages_show_list",
        "business_management",
      ],
    },
    facebook: {
      clientIdEnv: "META_APP_ID",
      clientSecretEnv: "META_APP_SECRET",
      redirectUriEnv: "META_REDIRECT_URI",
      scopes: ["pages_manage_posts", "pages_read_engagement"],
    },
    linkedin: {
      clientIdEnv: "LINKEDIN_CLIENT_ID",
      clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
      redirectUriEnv: "LINKEDIN_REDIRECT_URI",
      scopes: ["openid", "profile", "w_member_social"],
    },
    youtube: {
      clientIdEnv: "YOUTUBE_CLIENT_ID",
      clientSecretEnv: "YOUTUBE_CLIENT_SECRET",
      redirectUriEnv: "YOUTUBE_REDIRECT_URI",
      scopes: ["https://www.googleapis.com/auth/youtube.upload"],
    },
    x: {
      clientIdEnv: "X_CLIENT_ID",
      clientSecretEnv: "X_CLIENT_SECRET",
      redirectUriEnv: "X_REDIRECT_URI",
      scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    },
  };
}
