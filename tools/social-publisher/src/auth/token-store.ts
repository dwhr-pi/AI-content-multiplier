export function createTokenStorePlan() {
  return {
    locationEnv: "SOCIAL_TOKEN_STORE",
    encryptionRequired: true,
    passwordStorageAllowed: false,
    notes: [
      "Store only OAuth-derived tokens.",
      "Encrypt token storage at rest before enabling real publishing.",
      "Do not commit token files to the repository.",
    ],
  };
}
