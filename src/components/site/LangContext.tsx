import { createContext, useContext, useState, ReactNode } from "react";
import type { Lang } from "@/i18n/translations";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
}
const LangCtx = createContext<Ctx>({ lang: "es", setLang: () => {} });

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("es");
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
};

export const useLang = () => useContext(LangCtx);
