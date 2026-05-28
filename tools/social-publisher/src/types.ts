export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "youtube"
  | "x";

export type SocialPostType =
  | "image"
  | "video"
  | "reel"
  | "carousel"
  | "text";

export interface SocialMediaInput {
  image?: string;
  video?: string;
  cover?: string;
  carousel?: string[];
}

export interface SocialPostDraft {
  platform: SocialPlatform;
  account: string;
  type: SocialPostType;
  media: SocialMediaInput;
  caption: string;
  hashtags: string[];
  scheduleAt?: string;
  requiresApproval: boolean;
}

export interface PublishCheckResult {
  ok: boolean;
  warnings: string[];
  blockers: string[];
}

export interface ProviderCapabilities {
  oauth: boolean;
  scheduling: boolean;
  images: boolean;
  videos: boolean;
  reels: boolean;
  carousels: boolean;
}

export interface SocialProvider {
  platform: SocialPlatform;
  displayName: string;
  capabilities: ProviderCapabilities;
  notes: string[];
}

export interface OAuthClientConfig {
  clientIdEnv: string;
  clientSecretEnv: string;
  redirectUriEnv: string;
  scopes: string[];
}

export interface ConnectedSocialAccount {
  id: string;
  platform: SocialPlatform;
  label: string;
  approvedByHuman: boolean;
  tokenStored: boolean;
}
