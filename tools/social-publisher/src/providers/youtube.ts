import type { SocialProvider } from "../types.js";

export const youtubeProvider: SocialProvider = {
  platform: "youtube",
  displayName: "YouTube",
  capabilities: {
    oauth: true,
    scheduling: true,
    images: false,
    videos: true,
    reels: false,
    carousels: false,
  },
  notes: [
    "Focus on official upload, metadata, and scheduling APIs.",
    "Use this module for video metadata and publication planning rather than account management.",
  ],
};
