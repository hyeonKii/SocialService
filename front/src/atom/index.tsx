import { atom } from "recoil";

export type LanguageType = "ko" | "en";

export const languageState = atom({
  key: "language",
  default: "ko",
});
