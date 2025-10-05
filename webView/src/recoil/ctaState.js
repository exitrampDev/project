import { atom } from "recoil";

export const ctaClicksState = atom({
  key: "ctaClicksState",
  default: {}, // e.g., { ctaId1: true, ctaId2: false }
});
