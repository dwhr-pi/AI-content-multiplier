export function buildApprovalGate() {
  return {
    requireHumanApprovalEnv: "SOCIAL_REQUIRE_HUMAN_APPROVAL",
    hardRules: [
      "No publication without explicit human confirmation.",
      "No account creation by the AI agent.",
      "Only officially authorized accounts may be used.",
      "No password handling or cookie automation.",
    ],
  };
}
