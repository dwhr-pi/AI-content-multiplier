import type { SocialProvider } from "../types.js";

export const linkedinProvider: SocialProvider = {
  platform: "linkedin",
  displayName: "LinkedIn",
  capabilities: {
    oauth: true,
    scheduling: true,
    images: true,
    videos: true,
    reels: false,
    carousels: false,
  },
  notes: [
    "Use official LinkedIn OAuth and approved posting scopes only.",
    "Human approval remains mandatory before publication.",
  ],
};
