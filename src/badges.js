/* badges.js — explicit imports so Vite bundles the credential images
   with hashed, cache-busted URLs. Keyed by the filename used in resume-data. */
import dataAnalyst from "./assets/badges/sap-data-analyst-sac.png";
import associate from "./assets/badges/sap-associate-sac.png";
import positioning from "./assets/badges/sap-positioning-btp.png";
import integration from "./assets/badges/sap-integration-black-belt-l3.png";
import solace from "./assets/badges/solace-eda-practitioner.png";
import google from "./assets/badges/google-generative-ai.png";

export const BADGE_IMG = {
  "sap-data-analyst-sac.png": dataAnalyst,
  "sap-associate-sac.png": associate,
  "sap-positioning-btp.png": positioning,
  "sap-integration-black-belt-l3.png": integration,
  "solace-eda-practitioner.png": solace,
  "google-generative-ai.png": google,
};
