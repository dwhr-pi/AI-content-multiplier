import type { SocialProvider } from "../types.js";

export const facebookProvider: SocialProvider = {
  platform: "facebook",
  displayName: "Facebook Page",
  capabilities: {
    oauth: true,
    scheduling: true,
    images: true,
    videos: true,
    reels: false,
    carousels: false,
  },
  notes: [
    "Use Page-level permissions granted through official Meta APIs.",
    "Require a human-managed Page connection before any draft can be scheduled.",
  ],
};
