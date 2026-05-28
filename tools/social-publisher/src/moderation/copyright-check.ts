import type { PublishCheckResult, SocialPostDraft } from "../types.js";

export function runCopyrightCheck(draft: SocialPostDraft): PublishCheckResult {
  const warnings: string[] = [
    "Verify you have rights to every uploaded image, video, cover, soundtrack, and brand asset.",
  ];
  const blockers: string[] = [];

  if (draft.type === "reel" && !draft.media.video) {
    blockers.push("Reel drafts require a video file.");
  }

  return {
    ok: blockers.length === 0,
    warnings,
    blockers,
  };
}
