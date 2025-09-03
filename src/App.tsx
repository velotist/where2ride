import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "./components/Modal";
import "./i18n";
import { useTranslation } from "react-i18next";

import { geocodeAddress } from "./services/geocode";
import { useUnits } from "./hooks/use-units";
import { useAriaAttr } from "./hooks/use-aria-attr";
import { useRoutingUrls, Coordinate } from "./hooks/use-routing-urls";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { copyText, formatCoordinateToSixDecimals } from "./utils/copy";
import {
  MAX_RADIUS_KM,
  clamp,
  KM_TO_MI,
  isValidLat,
  isValidLon,
  randomDestination,
} from "./utils/geo";

// ---------- Status Store -------------------------------------------------
function useStatus(i18nLang: string, t: (k: string, o?: any) => string) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const info = useCallback(
    (key: string, langAtStart: string) => {
      if (i18nLang !== langAtStart) return;
      setStatus(t(key));
      setError("");
    },
    [i18nLang, t]
  );

  const errMsg = useCallback(
    (msg: string, langAtStart: string) => {
      if (i18nLang !== langAtStart) return;
      setError(msg);
      setStatus("");
    },
    [i18nLang]
  );

  const resetTransient = useCallback(() => {
    setStatus("");
    setError("");
  }, []);

  return { status, error, info, errMsg, resetTransient };
}

// ---------- Radius state (unit-aware) -----------------------------------
function useRadius() {
  const { unit, minUnit, kmFromUnit, unitFromKm } = useUnits();
  const [radiusKm, setRadiusKm] = useState<number>(20);
  const uiMaxUnit = unit === "km" ? MAX_RADIUS_KM : 100;

  const initialUi = useMemo(
    () => clamp(unit === "km" ? 20 : Math.round(20 * KM_TO_MI), minUnit, uiMaxUnit),
    [unit, minUnit, uiMaxUnit]
  );
  const [uiRadius, setUiRadius] = useState<number>(initialUi);

  useEffect(() => {
    const v = unitFromKm(Math.round(clamp(radiusKm, 1, MAX_RADIUS_KM)));
    setUiRadius(clamp(v, minUnit, uiMaxUnit));
  }, [unit]);

  const setFromUi = (vUnit: number) => {
    const v = clamp(vUnit, minUnit, uiMaxUnit);
    setUiRadius(v);
    setRadiusKm(clamp(kmFromUnit(v), 1, MAX_RADIUS_KM));
  };

  return { unit, radiusKm, uiRadius, uiMaxUnit, minUnit, setFromUi };
}

// ---------- Start location acquisition ----------------------------------
function useStartLocation(
  t: (k: string, o?: any) => string,
  info: (k: string, lang: string) => void,
  errMsg: (msg: string, lang: string) => void,
  i18nLang: string
) {
  const [address, setAddress] = useState("");
  const [start, setStart] = useState<Coordinate>(null);
  const [isLocating, setIsLocating] = useState(false);

  const getDeviceLocation = useCallback(() => {
    const langAtStart = i18nLang;
    setIsLocating(true);
    setStart(null);

    if (!("geolocation" in navigator)) {
      setIsLocating(false);
      errMsg(t("error.geoUnavailable"), langAtStart);
      return;
    }

    info("status.requestingLocation", langAtStart);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        if (i18nLang !== langAtStart) return;
        const { latitude, longitude } = pos.coords;
        if (!isValidLat(latitude) || !isValidLon(longitude)) {
          errMsg(t("error.invalidDeviceLocation"), langAtStart);
          return;
        }
        setStart({ lat: latitude, lon: longitude });
        info("status.locationSet", langAtStart);
      },
      (e) => {
        setIsLocating(false);
        errMsg(e?.message || t("error.readLocationFailed"), langAtStart);
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 }
    );
  }, [i18nLang, t, info, errMsg]);

  const lookupAddress = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault?.();
      const langAtStart = i18nLang;
      const q = address.trim();

      if (q.length < 3) {
        errMsg(t("error.addressMin"), langAtStart);
        return;
      }

      info("status.lookingUpAddress", langAtStart);
      setStart(null);

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 8_000);
      try {
        const { lat, lon } = await geocodeAddress(q, ctrl.signal);
        if (i18nLang !== langAtStart) return;
        setStart({ lat, lon });
        info("status.startFromAddress", langAtStart);
      } catch (e: any) {
        if (i18nLang !== langAtStart) return;
        if (e?.name === "AbortError") errMsg(t("error.addressTimeout"), langAtStart);
        else errMsg(e?.message || t("error.addressFailed"), langAtStart);
      } finally {
        clearTimeout(timeout);
      }
    },
    [address, i18nLang, t, info, errMsg]
  );

  return { address, setAddress, start, isLocating, getDeviceLocation, lookupAddress };
}

// ---------- Copy helper --------------------------------------------------
async function copyCoords(text: string): Promise<boolean> {
  try {
    await copyText(text, () => {}, () => {});
    return true;
  } catch {
    return false;
  }
}

// ---------- Presentational Components -----------------------------------
function SectionTitle(props: Readonly<{ step: number; children: React.ReactNode }>) {
  return (
    <h2 className="section-title">
      <span className="badge-step">{props.step}</span>
      {props.children}
    </h2>
  );
}

function RadiusSection(
  props: Readonly<{
    t: any;
    unitAbbr: string;
    unitLabel: string;
    uiRadius: number;
    uiMaxUnit: number;
    minUnit: number;
    setFromUi: (v: number) => void;
  }>
) {
  return (
    <section className="section mt-8" aria-labelledby="radius-label">
      <h2 id="radius-label" className="section-title">
        <span className="badge-step">1</span>
        {props.t("labels.radius", { unit: props.unitAbbr })}
      </h2>
      <p className="section-sub">{props.t("labels.radiusHelp", { max: props.uiMaxUnit, unit: props.unitAbbr })}</p>
      <div className="section-divider" />

      <fieldset className="mt-1 flex items-center gap-3" aria-describedby="radius-help radius-live">
        <label htmlFor="radius-input" className="field-label sr-only">
          {props.t("labels.radius", { unit: props.unitAbbr })}
        </label>

        <input
          id="radius-input"
          name="radius"
          type="number"
          min={props.minUnit}
          max={props.uiMaxUnit}
          step={1}
          value={props.uiRadius}
          onChange={(e) => props.setFromUi(Number(e.currentTarget.value))}
          className="w-28 h-11 rounded-lg border border-gray-300 px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          inputMode="numeric"
          required
        />

        <input
          type="range"
          min={props.minUnit}
          max={props.uiMaxUnit}
          step={1}
          value={props.uiRadius}
          onChange={(e) => props.setFromUi(Number(e.currentTarget.value))}
          className="slider-big-thumb flex-1 h-6 rounded-lg bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          aria-label="Radius slider"
          aria-controls="radius-input"
        />

        <output id="radius-live" className="sr-only" aria-live="polite">
          {props.t("labels.radiusLive", { value: props.uiRadius, unitLabel: props.unitLabel })}
        </output>
      </fieldset>
    </section>
  );
}

function CorrectionToggle(
  props: Readonly<{ t: any; enabled: boolean; onChange: (v: boolean) => void }>
) {
  return (
    <div className="mt-5 flex items-center gap-2">
      <input
        id="correction"
        type="checkbox"
        checked={props.enabled}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
        className="relative h-5 w-5 cursor-pointer rounded border border-gray-400 bg-white text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 appearance-none checked:bg-blue-600 checked:border-blue-600 checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-white checked:after:text-sm checked:after:font-bold"
      />
      <label htmlFor="correction" className="text-sm cursor-pointer select-none">
        {props.t("labels.correctionLabel")}
      </label>
    </div>
  );
}

function StartSummary(
  props: Readonly<{ t: any; start: Coordinate; onCopy: () => void; copied: boolean }>
) {
  return (
    <section aria-labelledby="start-summary-label">
      <h3 id="start-summary-label" className="field-label">
        {props.t("labels.startSummary")}
      </h3>

      <div className="result-card mt-2">
        {!props.start ? (
          <p className="text-sm text-gray-700">{props.t("labels.startNotSetHint")}</p>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-sm">{props.t("labels.latlon")}</div>
              <div className="font-mono text-lg">
                {formatCoordinateToSixDecimals(props.start.lat)}, {formatCoordinateToSixDecimals(props.start.lon)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={props.onCopy}
                className="h-11 rounded-xl border border-gray-300 px-3 text-sm font-medium hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                aria-describedby="copy-start-status"
              >
                {props.t("labels.copy")}
              </button>
              {props.copied && (
                <output id="copy-start-status" className="text-xs text-green-700" aria-live="polite">
                  {props.t("labels.copied")}
                </output>
              )}
            </div>
          </div>
        )}

        <output className="sr-only" aria-live="polite">
          {props.start ? `${formatCoordinateToSixDecimals(props.start.lat)}, ${formatCoordinateToSixDecimals(props.start.lon)}` : props.t("labels.startNotSetHint")}
        </output>
      </div>
    </section>
  );
}

function GenerateSection(
  props: Readonly<{ t: any; canGenerate: boolean; isGenerating: boolean; onGenerate: () => void; status: string }>
) {
  const labelGenerate = props.t("labels.generate");
  const labelGenerating = props.t("labels.generating");
  const title = props.t("labels.actionsGenerateTitle");
  const hint = props.t("labels.actionsGenerateHint");

  return (
    <section className="section mt-8" aria-labelledby="generate-label">
      <h2 id="generate-label" className="section-title mb-2">
        <span className="badge-step">3</span>
        {title}
      </h2>
      <p id="generate-hint" className="section-sub">{hint}</p>
      <div className="section-divider" />

      <div className="action-row mt-3">
        <button
          type="button"
          onClick={props.onGenerate}
          disabled={!props.canGenerate || props.isGenerating}
          className={[
            "h-12 min-w-[11rem] rounded-2xl px-5 text-sm font-semibold transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
            !props.canGenerate || props.isGenerating ? "bg-gray-200 text-gray-700 cursor-not-allowed" : "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800",
          ].join(" ")}
          aria-describedby="generate-hint"
        >
          {props.isGenerating ? labelGenerating : labelGenerate}
        </button>

        <output className="sr-only" aria-live="polite">
          {props.isGenerating ? labelGenerating : props.status}
        </output>
      </div>
    </section>
  );
}

function DestinationSection(
  props: Readonly<{
    t: any;
    haveRoute: boolean;
    links: { google: string; apple: string; komoot: string; strava: string };
    destination: Coordinate;
    onCopy: () => void;
    copied: boolean;
    refs: {
      googleRef: React.RefObject<HTMLAnchorElement>;
      appleRef: React.RefObject<HTMLAnchorElement>;
      komootRef: React.RefObject<HTMLAnchorElement>;
      stravaRef: React.RefObject<HTMLAnchorElement>;
      resultRef: React.RefObject<HTMLDivElement>;
    };
  }>
) {
  const { googleRef, appleRef, komootRef, stravaRef, resultRef } = props.refs;

  useEffect(() => {
    [googleRef.current, appleRef.current, komootRef.current, stravaRef.current].forEach((el) => {
      if (!el) return;
      if (!props.haveRoute) el.setAttribute("aria-disabled", "true");
      else el.removeAttribute("aria-disabled");
    });
  }, [props.haveRoute]);

  return (
    <section className="section mt-8" aria-labelledby="destination-label">
      <h2 id="destination-label" className="section-title mb-3">
        <span className="badge-step">4</span>
        {props.t("labels.destinationSummary")}
      </h2>

      <div tabIndex={-1} ref={resultRef} className="result-card" aria-labelledby="destination-label">
        {!props.destination ? (
          <p className="text-sm text-gray-700">{props.t("labels.noDestinationYet")}</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-sm">{props.t("labels.latlon")}</div>
                <div className="font-mono text-lg">
                  {formatCoordinateToSixDecimals(props.destination.lat)}, {formatCoordinateToSixDecimals(props.destination.lon)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={props.onCopy}
                  className="h-11 rounded-xl border border-gray-300 px-3 text-sm font-medium hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  aria-describedby="copy-status"
                >
                  {props.t("labels.copy")}
                </button>
                {props.copied && (
                  <output id="copy-status" className="text-xs text-green-700" aria-live="polite">
                    {props.t("labels.copied")}
                  </output>
                )}
              </div>
            </div>

            <div className="section-divider" />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <fieldset role="group" aria-labelledby="routing-direct-title" className="rounded-2xl border border-gray-200 p-3 sm:p-4">
                <h3 id="routing-direct-title" className="field-label">
                  {props.t("labels.routingGroupDirectTitle")}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    ref={googleRef}
                    href={props.links.google}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={props.haveRoute ? 0 : -1}
                    className={`h-10 inline-flex items-center rounded-xl border px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${!props.haveRoute ? "opacity-50" : "hover:bg-white border-gray-300"}`}
                  >
                    {props.t("labels.mapsGoogle")}
                  </a>
                  <a
                    ref={appleRef}
                    href={props.links.apple}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={props.haveRoute ? 0 : -1}
                    className={`h-10 inline-flex items-center rounded-xl border px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${!props.haveRoute ? "pointer-events-none opacity-50" : "hover:bg-white border-gray-300"}`}
                  >
                    {props.t("labels.mapsApple")}
                  </a>
                </div>
                <p className="hint-muted mt-3">{props.t("labels.routingGroupDirectNote")}</p>
              </fieldset>

              <fieldset role="group" aria-labelledby="routing-manual-title" className="rounded-2xl border border-gray-200 p-3 sm:p-4">
                <h3 id="routing-manual-title" className="field-label">
                  {props.t("labels.routingGroupManualTitle")}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    ref={komootRef}
                    href={props.links.komoot}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={props.haveRoute ? 0 : -1}
                    className={`h-10 inline-flex items-center rounded-xl border px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${!props.haveRoute ? "pointer-events-none opacity-50" : "hover:bg-white border-gray-300"}`}
                    title={props.t("labels.bikeModeNote")}
                  >
                    {props.t("labels.komoot")}
                  </a>
                  <a
                    ref={stravaRef}
                    href={props.links.strava}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={props.haveRoute ? 0 : -1}
                    className={`h-10 inline-flex items-center rounded-xl border px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${!props.haveRoute ? "pointer-events-none opacity-50" : "hover:bg-white border-gray-300"}`}
                  >
                    {props.t("labels.strava")}
                  </a>
                </div>
                <ol className="list-inside list-decimal text-sm space-y-1 mt-3">
                  <li>{props.t("labels.routingStepCopy")}</li>
                  <li>{props.t("labels.routingStepLogin")}</li>
                  <li>{props.t("labels.routingStepSetStart")}</li>
                  <li>{props.t("labels.routingStepPaste")}</li>
                </ol>
                <p className="hint-muted mt-3">{props.t("labels.routingManualNote")}</p>
              </fieldset>
            </div>

            <p className="hint-muted mt-4">{props.t("labels.bikeModeNote")}</p>
          </>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();

  // Units + radius
  const { unit, radiusKm, uiRadius, uiMaxUnit, minUnit, setFromUi } = useRadius();

  // Correction factor
  const [correctionEnabled, setCorrectionEnabled] = useState(false);
  const CORRECTION = 1.49;

  // Status
  const { status, error, info, errMsg, resetTransient } = useStatus(i18n.language, t);

  // UI state (declare BEFORE ARIA usage)
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

  // Start + address
  const { address, setAddress, start, isLocating, getDeviceLocation, lookupAddress } = useStartLocation(
    t,
    info,
    errMsg,
    i18n.language
  );

  // Destination + routing
  const [destination, setDestination] = useState<Coordinate>(null);
  const [copiedDestination, setCopiedDestination] = useState(false);
  const [copiedStart, setCopiedStart] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = !!start && Number.isFinite(radiusKm) && radiusKm > 0 && radiusKm <= MAX_RADIUS_KM;

  const { hasValidRoutes: haveRoute, google, apple, komoot, strava } = useRoutingUrls(start, destination);

  // Refs & ARIA
  const geoBtnRef = useRef<HTMLButtonElement | null>(null);
  const addrToggleRef = useRef<HTMLButtonElement | null>(null);
  const generateBtnRef = useRef<HTMLButtonElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const googleRef = useRef<HTMLAnchorElement | null>(null);
  const appleRef = useRef<HTMLAnchorElement | null>(null);
  const komootRef = useRef<HTMLAnchorElement | null>(null);
  const stravaRef = useRef<HTMLAnchorElement | null>(null);

  // no expressions in JSX ARIA; but pass booleans to the util hook
  useAriaAttr(geoBtnRef as any, "aria-busy", isLocating);
  useAriaAttr(addrToggleRef as any, "aria-expanded", showAddress);
  useAriaAttr(generateBtnRef as any, "aria-disabled", !canGenerate);
  useAriaAttr(generateBtnRef as any, "aria-busy", isGenerating);

  // Handlers
  const handleUseLocation = useCallback(() => {
    setShowAddress(false);
    requestAnimationFrame(() => geoBtnRef.current?.focus?.());
    setDestination(null);
    setCopiedDestination(false);
    getDeviceLocation();
  }, [getDeviceLocation]);

  const handleUseAddress = useCallback(async (e?: React.FormEvent) => {
    setDestination(null);
    setCopiedDestination(false);
    await lookupAddress(e);
  }, [lookupAddress]);

  const handleGenerate = useCallback(async () => {
    const langAtStart = i18n.language;
    if (!canGenerate) {
      const u = unit === "km" ? t("units.km") : t("units.mi");
      errMsg(t("error.needStartAndRadius", { max: uiMaxUnit, unit: u }), langAtStart);
      return;
    }

    setIsGenerating(true);
    try {
      const desiredKm = clamp(Number(radiusKm) || 0, 0.1, MAX_RADIUS_KM);
      const effectiveKm = correctionEnabled ? desiredKm / CORRECTION : desiredKm;
      if (!start) return;
      const g = randomDestination(start.lat, start.lon, effectiveKm);
      if (i18n.language !== langAtStart) return;
      setDestination(g);
      info("status.newDestination", langAtStart);
      setTimeout(() => resultRef.current?.focus?.(), 0);
    } finally {
      setIsGenerating(false);
    }
  }, [i18n.language, canGenerate, unit, t, uiMaxUnit, radiusKm, correctionEnabled, start, info, errMsg]);

  const handleCopyDestination = useCallback(async () => {
    if (!destination) return;
    const text = `${formatCoordinateToSixDecimals(destination.lat)},${formatCoordinateToSixDecimals(destination.lon)}`;
    const ok = await copyCoords(text);
    if (ok) {
      setCopiedDestination(true);
      setCopiedStart(false);
      info("status.copiedDestination", i18n.language);
    } else {
      errMsg(t("error.copyFailed"), i18n.language);
    }
  }, [destination, i18n.language, info, errMsg, t]);

  const handleCopyStart = useCallback(async () => {
    if (!start) return;
    const text = `${formatCoordinateToSixDecimals(start.lat)},${formatCoordinateToSixDecimals(start.lon)}`;
    const ok = await copyCoords(text);
    if (ok) {
      setCopiedStart(true);
      setCopiedDestination(false);
      info("status.copiedStart", i18n.language);
    } else {
      errMsg(t("error.copyFailed"), i18n.language);
    }
  }, [start, i18n.language, info, errMsg, t]);

  // Clear transient text on language change
  useEffect(() => {
    resetTransient();
    setCopiedStart(false);
    setCopiedDestination(false);
  }, [i18n.language, resetTransient]);

  // Labels derived from i18n
  const labels = useMemo(
    () => ({ unitAbbr: unit === "km" ? t("units.km") : t("units.mi"), unitLabel: unit === "km" ? t("units.kilometer") : t("units.miles") }),
    [unit, t]
  );

  // URLs snapshot for child
  const links = useMemo(
    () => ({ google: google(), apple: apple(), komoot: komoot(), strava: strava() }),
    [google, apple, komoot, strava]
  );

  return (
    <>
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:m-3 focus:rounded-lg focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-white"
      >
        {t("labels.skipToContent")}
      </a>

      <main id="main" className="min-h-screen bg-white text-gray-900 antialiased">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t("labels.title")}</h1>
            <LanguageSwitcher i18n={i18n} />
          </div>

          {/* STEP 1: Distance */}
          <RadiusSection
            t={t}
            unitAbbr={labels.unitAbbr}
            unitLabel={labels.unitLabel}
            uiRadius={uiRadius}
            uiMaxUnit={uiMaxUnit}
            minUnit={minUnit}
            setFromUi={setFromUi}
          />

          <CorrectionToggle t={t} enabled={correctionEnabled} onChange={setCorrectionEnabled} />
          <p className="hint-muted">{t("labels.correctionHint")}</p>

          {/* STEP 2: Start */}
          <section className="section mt-8" aria-labelledby="start-label">
            <SectionTitle step={2}>{t("labels.startPoint")}</SectionTitle>
            <p className="section-sub">{t("labels.helpStep2")}</p>

            <div className="section-divider" />

            <div className="action-row">
              <button
                ref={geoBtnRef}
                type="button"
                onClick={handleUseLocation}
                className="h-12 w-full sm:w-auto rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                aria-describedby="geo-help"
              >
                <span className="inline-flex items-center gap-2">
                  {isLocating ? t("labels.locating") : t("labels.useDeviceLocation")}
                </span>
              </button>

              {/* Accordion Trigger */}
              <h3>
                <button
                  ref={addrToggleRef}
                  id="address-toggle"
                  type="button"
                  className="h-12 w-full sm:w-auto rounded-2xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  aria-controls="address-panel"
                  onClick={() => setShowAddress((s) => !s)}
                >
                  <span className="inline-flex items-center gap-2">
                    {showAddress ? t("labels.hideAddressField") : t("labels.enterAddress")}
                  </span>
                </button>
              </h3>
            </div>

            <p id="geo-help" className="hint-muted">{t("labels.geoHelp")}</p>

            {/* Accordion Panel */}
            <section id="address-panel" aria-labelledby="address-toggle" hidden={!showAddress} className="mt-4 rounded-2xl border border-gray-200 p-3 sm:p-4">
              <form onSubmit={handleUseAddress}>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="flex-1">
                    <label htmlFor="address" className="field-label">
                      {t("labels.address")}
                    </label>
                    <input
                      id="address"
                      name="address"
                      autoComplete="street-address"
                      placeholder={t("labels.address")}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1 w-full h-12 rounded-2xl border border-gray-300 px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      inputMode="search"
                      autoFocus
                    />
                  </div>
                  <div className="sm:flex sm:items-end mt-2 sm:mt-0">
                    <button
                      type="submit"
                      className="h-12 w-full sm:w-auto min-w-[3.5rem] rounded-2xl border border-gray-300 bg-white px-4 text-sm font-semibold shadow-sm transition hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    >
                      {t("labels.useAddress")}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            <div className="section-divider" />

            <StartSummary t={t} start={start} onCopy={handleCopyStart} copied={copiedStart} />
          </section>

          {/* STEP 3: Generate destination */}
          {start && (
            <GenerateSection t={t} canGenerate={canGenerate} isGenerating={isGenerating} onGenerate={handleGenerate} status={status} />
          )}

          {/* STEP 4: Destination + Routing */}
          <DestinationSection
            t={t}
            haveRoute={haveRoute}
            links={links}
            destination={destination}
            onCopy={handleCopyDestination}
            copied={copiedDestination}
            refs={{ googleRef, appleRef, komootRef, stravaRef, resultRef }}
          />

          {/* Alerts */}
          <div className="mt-6">
            {status && (
              <output className="mb-2 block max-w-full overflow-hidden overflow-wrap-anywhere rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900 whitespace-normal" aria-live="polite">
                {status}
              </output>
            )}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-8 text-xs text-gray-600">
            <button
              type="button"
              className="rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
              onClick={() => setHelpOpen(true)}
              aria-haspopup="dialog"
              aria-controls="help-modal"
            >
              ⓘ {t("labels.helpButton")}
            </button>
            <button
              type="button"
              className="ml-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
              onClick={() => setAboutOpen(true)}
              aria-haspopup="dialog"
              aria-controls="about-modal"
            >
              {t("labels.aboutButton")}
            </button>
          </footer>
        </div>

        {/* Help Modal */}
        <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title={t("labels.helpTitle")}>
          <ol className="list-inside list-decimal space-y-3 leading-relaxed">
            <li>
              {(() => {
                const s = t("labels.helpStep1", { range: `1 und ${uiMaxUnit} ${labels.unitAbbr}` });
                const i = s.indexOf(":");
                const title = i >= 0 ? s.slice(0, i) : s;
                const rest = i >= 0 ? s.slice(i + 1) : "";
                return (
                  <span className="block">
                    <strong className="font-semibold">{title.trim()}</strong>
                    {i >= 0 ? ":" : ""} <span className="align-baseline">{rest.trim()}</span>
                  </span>
                );
              })()}
            </li>
            <li>
              {(() => {
                const s = t("labels.helpStep2");
                const i = s.indexOf(":");
                const title = i >= 0 ? s.slice(0, i) : s;
                const rest = i >= 0 ? s.slice(i + 1) : "";
                return (
                  <span className="block">
                    <strong className="font-semibold">{title.trim()}</strong>
                    {i >= 0 ? ":" : ""} <span className="align-baseline">{rest.trim()}</span>
                  </span>
                );
              })()}
            </li>
            <li>
              {(() => {
                const s = t("labels.helpStep3");
                const i = s.indexOf(":");
                const title = i >= 0 ? s.slice(0, i) : s;
                const rest = i >= 0 ? s.slice(i + 1) : "";
                return (
                  <span className="block">
                    <strong className="font-semibold">{title.trim()}</strong>
                    {i >= 0 ? ":" : ""} <span className="align-baseline">{rest.trim()}</span>
                  </span>
                );
              })()}
            </li>
          </ol>

          <hr className="my-4" />

          <section className="mt-2" aria-labelledby="privacy-heading">
            <h3 id="privacy-heading" className="text-base font-semibold">
              {t("labels.privacyTitle")}
            </h3>
            <p className="mt-1">{t("labels.privacy1")}</p>
          </section>

          <div className="mt-6">
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-2xl bg-blue-600 px-5 py-3 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={() => setHelpOpen(false)}
            >
              {t("labels.gotIt")}
            </button>
          </div>
        </Modal>

        {/* About Modal */}
        <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title={t("labels.aboutTitle")}>
          <div className="space-y-3 leading-relaxed">
            <p>{t("labels.about1")}</p>
            <p>{t("labels.about2")}</p>
            <p>{t("labels.about3")}</p>
            <p>{t("labels.about4")}</p>
            <p>{t("labels.about5")}</p>
            <p>{t("labels.about6")}</p>
            <div className="mt-5">
              <button
                type="button"
                className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-2xl bg-blue-600 px-5 py-3 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={() => setAboutOpen(false)}
                aria-label={t("status.closeModal")}
              >
                {t("labels.gotIt")}
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </>
  );
}
