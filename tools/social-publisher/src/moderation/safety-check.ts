import type { PublishCheckResult, SocialPostDraft } from "../types.js";

export function runSafetyCheck(draft: SocialPostDraft): PublishCheckResult {
  const warnings: string[] = [];
  const blockers: string[] = [];

  if (!draft.requiresApproval) {
    blockers.push("Human approval must remain enabled for all social publishing drafts.");
  }

  if (draft.caption.length > 2200 && draft.platform === "instagram") {
    warnings.push("Instagram captions may need trimming before publication.");
  }

  if (draft.hashtags.length > 30 && draft.platform === "instagram") {
    warnings.push("Instagram hashtag count is high and should be reviewed.");
  }

  if (!draft.caption.trim()) {
    blockers.push("Caption is empty.");
  }

  return {
    ok: blockers.length === 0,
    warnings,
    blockers,
  };
}
