export function createSchedulePlan() {
  return {
    timeZoneStrategy: "Require explicit ISO timestamps with offsets.",
    safetyRules: [
      "Reject scheduling when human approval is still missing.",
      "Reject scheduling when provider capabilities do not support the requested media type.",
      "Prevent duplicate scheduling for the same account, media fingerprint, and caption hash.",
    ],
  };
}
