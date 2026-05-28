import type { ConnectedSocialAccount, PublishCheckResult, SocialPostDraft, SocialProvider } from "./types.js";
import { instagramProvider } from "./providers/instagram.js";
import { facebookProvider } from "./providers/facebook.js";
import { linkedinProvider } from "./providers/linkedin.js";
import { youtubeProvider } from "./providers/youtube.js";
import { xProvider } from "./providers/x.js";
import { buildApprovalGate } from "./auth/permissions.js";
import { buildOAuthPlan } from "./auth/oauth.js";
import { createTokenStorePlan } from "./auth/token-store.js";
import { runSafetyCheck } from "./moderation/safety-check.js";
import { runCopyrightCheck } from "./moderation/copyright-check.js";
import { runPolicyCheck } from "./moderation/policy-check.js";
import { createPublishQueueRecord } from "./queue/publish-queue.js";
import { createSchedulePlan } from "./queue/scheduler.js";

export const socialProviders: SocialProvider[] = [
  instagramProvider,
  facebookProvider,
  linkedinProvider,
  youtubeProvider,
  xProvider,
];

export function listConnectedAccountPlan(): ConnectedSocialAccount[] {
  return [
    {
      id: "main",
      platform: "instagram",
      label: "Primary Instagram Business account",
      approvedByHuman: true,
      tokenStored: false,
    },
  ];
}

export function buildDraftReview(draft: SocialPostDraft): PublishCheckResult {
  const checks = [
    runSafetyCheck(draft),
    runCopyrightCheck(draft),
    runPolicyCheck(draft),
  ];

  return {
    ok: checks.every((check) => check.ok),
    warnings: checks.flatMap((check) => check.warnings),
    blockers: checks.flatMap((check) => check.blockers),
  };
}

export function createSocialPublisherBlueprint() {
  return {
    providers: socialProviders,
    oauth: buildOAuthPlan(),
    tokenStore: createTokenStorePlan(),
    approval: buildApprovalGate(),
    queue: createPublishQueueRecord(),
    scheduling: createSchedulePlan(),
  };
}
