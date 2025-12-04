import { atom } from "recoil";

export const ctaClicksState = atom({
  key: "ctaClicksState",
  default: {}, // e.g., { ctaId1: true, ctaId2: false }
});

export const authState = atom({
  key: "authState",
  default: {
    access_token: null,
    user: null,
  },
});

export const pageTitleAtom = atom({
  key: "pageTitleAtom",
  default: "Dashboard",
});

export const ndaListingId = atom({
  key: "ndaListingId",
  default: null,
});

export const showNDAAtom = atom({
  key: "showNDA",
  default: false,
});

export const activePageAtom = atom({
  key: "activePage",
  default: "Dashboard", // default page
});
export const apiBaseUrlState = atom({
  key: "apiBaseUrlState",
  default: "http://localhost:3000", //need to add till /api if needed
  // default: "http://testapi.exitramp.co"
});