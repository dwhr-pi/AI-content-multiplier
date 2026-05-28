import type { PublishCheckResult, SocialPostDraft } from "../types.js";

export function runPolicyCheck(draft: SocialPostDraft): PublishCheckResult {
  const warnings: string[] = [
    "Review platform-specific rules before publishing sensitive, regulated, or political content.",
    "Check double-post risk against recent account history before scheduling.",
  ];
  const blockers: string[] = [];

  if (draft.platform === "instagram" && draft.type === "carousel" && !draft.media.carousel?.length) {
    blockers.push("Carousel drafts require at least one carousel media item.");
  }

  return {
    ok: blockers.length === 0,
    warnings,
    blockers,
  };
}
