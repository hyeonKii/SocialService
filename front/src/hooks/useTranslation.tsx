import { languageState } from "atom/index";
import TRANSLATIONS from "constant/language";
import { useRecoilValue } from "recoil";

export const useTranslation = () => {
  const lang = useRecoilValue(languageState);
  return (key: keyof typeof TRANSLATIONS) => {
    return TRANSLATIONS[key][lang];
  };
};
