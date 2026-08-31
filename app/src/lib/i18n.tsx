/**
 * Minimal HR/EN language layer. Croatian is the default; the choice persists
 * in localStorage (read in an effect, so SSR always renders Croatian).
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "hr" | "en";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "hr",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hr");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("si-lang");
      if (saved === "en" || saved === "hr") {
        setLangState(saved);
      }
    } catch {
      // storage unavailable: keep default
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("si-lang", l);
    } catch {
      // storage unavailable: in-memory only
    }
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
