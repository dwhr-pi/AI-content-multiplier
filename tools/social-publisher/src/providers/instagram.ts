import type { SocialProvider } from "../types.js";

export const instagramProvider: SocialProvider = {
  platform: "instagram",
  displayName: "Instagram Business / Creator",
  capabilities: {
    oauth: true,
    scheduling: true,
    images: true,
    videos: true,
    reels: true,
    carousels: true,
  },
  notes: [
    "Use official Meta OAuth only.",
    "Support should target media upload, media container creation, publishing, reels, and carousel posts.",
    "Never store passwords or rely on cookie automation.",
  ],
};
