export function createPublishQueueRecord() {
  return {
    states: ["draft", "scheduled", "awaiting_approval", "published", "failed"],
    requiredFields: [
      "platform",
      "account",
      "type",
      "caption",
      "requiresApproval",
    ],
    logFields: [
      "createdAt",
      "scheduledAt",
      "approvedAt",
      "publishedAt",
      "providerMessage",
    ],
  };
}
