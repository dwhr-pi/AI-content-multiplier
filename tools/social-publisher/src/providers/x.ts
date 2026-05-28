import type { SocialProvider } from "../types.js";

export const xProvider: SocialProvider = {
  platform: "x",
  displayName: "X / Twitter",
  capabilities: {
    oauth: true,
    scheduling: true,
    images: true,
    videos: true,
    reels: false,
    carousels: false,
  },
  notes: [
    "Use official API credentials and human-approved connected accounts only.",
    "Keep rate limits and policy changes isolated behind the provider adapter.",
  ],
};
