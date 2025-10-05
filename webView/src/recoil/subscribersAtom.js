import { atom } from "recoil";

export const subscribersState = atom({
  key: "subscribersState",
  default: [], // holds list of subscribed emails
});
