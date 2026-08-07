import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Lang } from "@/i18n/translations";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
}
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {} });

const STORAGE_KEY = "rde-lang";

const readStoredLang = (): Lang => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch {
    /* ignore */
  }
  return "en";
};

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
};

export const useLang = () => useContext(LangCtx);
