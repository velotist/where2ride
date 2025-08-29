import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = { readonly i18n: any };

let __lsIdSeq = 0;
const nextId = (prefix: string) => `${prefix}-${++__lsIdSeq}`;

export default function LanguageSwitcher({ i18n }: Props) {
  const { t } = useTranslation();

  const [current, setCurrent] = useState<string>(
    i18n.resolvedLanguage || i18n.language || "en"
  );

  // Refs
  const groupRef = useRef<HTMLFieldSetElement | null>(null);
  const deBtnRef = useRef<HTMLButtonElement | null>(null);
  const enBtnRef = useRef<HTMLButtonElement | null>(null);
  const deLabelRef = useRef<HTMLSpanElement | null>(null);
  const enLabelRef = useRef<HTMLSpanElement | null>(null);

  // Track changes of i18n
  useEffect(() => {
    const onChange = (lng: string) =>
      setCurrent(i18n.resolvedLanguage || lng || "en");
    i18n.on("languageChanged", onChange);
    return () => i18n.off("languageChanged", onChange);
  }, [i18n]);

  // IDs assigned once
  useEffect(() => {
    if (deLabelRef.current && !deLabelRef.current.id) {
      deLabelRef.current.setAttribute("id", nextId("ls-de"));
    }
    if (enLabelRef.current && !enLabelRef.current.id) {
      enLabelRef.current.setAttribute("id", nextId("ls-en"));
    }
  }, []);

  // ARIA / Labels in current UI language
  useEffect(() => {
    const isDE = current?.toLowerCase().startsWith("de");
    const isEN = current?.toLowerCase().startsWith("en");

    const labelDe = isDE
      ? t("status.lang.deActive")
      : t("status.lang.deSwitch");
    const labelEn = isEN
      ? t("status.lang.enActive")
      : t("status.lang.enSwitch");

    // Name group; inherit lang from <html>
    if (groupRef.current) {
      groupRef.current.setAttribute("aria-label", t("status.lang.groupLabel"));
      groupRef.current.removeAttribute("lang");
    }

    // Fill hidden labels with text (SR name comes from aria-labelledby)
    if (deLabelRef.current) {
      deLabelRef.current.textContent = labelDe;
    }
    if (enLabelRef.current) {
      enLabelRef.current.textContent = labelEn;
    }

    if (deBtnRef.current && deLabelRef.current?.id) {
      deBtnRef.current.setAttribute("aria-pressed", isDE ? "true" : "false");
      deBtnRef.current.setAttribute("aria-labelledby", deLabelRef.current.id);
      deBtnRef.current.setAttribute("title", labelDe);
      deBtnRef.current.removeAttribute("aria-label");
      deBtnRef.current.removeAttribute("lang");
    }
    if (enBtnRef.current && enLabelRef.current?.id) {
      enBtnRef.current.setAttribute("aria-pressed", isEN ? "true" : "false");
      enBtnRef.current.setAttribute("aria-labelledby", enLabelRef.current.id);
      enBtnRef.current.setAttribute("title", labelEn);
      enBtnRef.current.removeAttribute("aria-label");
      enBtnRef.current.removeAttribute("lang");
    }
  }, [current, t]);

  const setLang = (lng: "de" | "en") => {
    i18n.changeLanguage(lng);
  };

  const isDE = current?.toLowerCase().startsWith("de");
  const isEN = current?.toLowerCase().startsWith("en");

  return (
    <fieldset
      ref={groupRef}
      className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white p-1 shadow-sm m-0">
      <legend className="sr-only">{t("status.lang.groupLabel")}</legend>

      <button
        ref={deBtnRef}
        type="button"
        onClick={() => setLang("de")}
        title={isDE ? t("status.lang.deActive") : t("status.lang.deSwitch")}
        aria-label={
          isDE ? t("status.lang.deActive") : t("status.lang.deSwitch")
        }
        className={`px-3 py-1 rounded-lg text-sm font-medium outline-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
          ${isDE ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>
        <span aria-hidden="true">DE</span>
        <span ref={deLabelRef} className="sr-only"></span>
      </button>
      <button
        ref={enBtnRef}
        type="button"
        onClick={() => setLang("en")}
        title={isEN ? t("status.lang.enActive") : t("status.lang.enSwitch")}
        aria-label={
          isEN ? t("status.lang.enActive") : t("status.lang.enSwitch")
        }
        className={`px-3 py-1 rounded-lg text-sm font-medium outline-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
          ${isEN ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>
        <span aria-hidden="true">EN</span>
        <span ref={enLabelRef} className="sr-only"></span>
      </button>
    </fieldset>
  );
}
