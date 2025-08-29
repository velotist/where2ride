import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      units: { km: "km", mi: "miles", kilometer: "Kilometers", miles: "Miles" },
      labels: {
        helpButton: "Help",
        radius: "Target distance as the crow flies to the location ({{unit}})",
        radiusLive: "{{value}} {{unitLabel}}",
        radiusHelp: "Max {{max}} {{unit}}.",
        startPoint: "Get your location coordinates",
        useDeviceLocation: "Use my device location",
        locating: "Locating…",
        enterAddress: "Enter address",
        hideAddressField: "Hide address field",
        geoHelp:
          "You may be asked for permission. We do not store your location.",
        manualAddress: "Manual address",
        address: "Address",
        useAddress: "Use address",
        startSummary: "Your location coordinates",
        latlon: "Latitude, Longitude",
        startNotSetHint:
          'Click on "Use my device location" or enter an address manually.',
        targetSummary: "Your target coordinates",
        noTargetYet: "No target yet.",
        copy: "Copy",
        copied: "Copied",
        actionsGenerate: "Generate random target",
        helpTitle: "How it works",
        helpStep1: "Set radius: choose between {{range}}.",
        helpStep2: "Pick start: use your device location or enter an address.",
        helpStep3:
          "Copy result: paste the destination coordinates into the route application of your choice to plan your ride.",
        privacyTitle: "Privacy",
        privacy1: "No tracking, no storage, HTTPS only.",
        gotIt: "Got it",
        skipToContent: "Skip to content",
        routeWith: "Route with",
        routingGroupDirectTitle: "Open directly",
        routingGroupDirectNote:
          "Opens with a calculated route when you follow the link.",
        routingGroupManualTitle: "Manual in Komoot and Strava",
        routingManualNote: "Direct routing is not available in these apps yet.",
        openIn: "Open in",
        mapsGoogle: "Google Maps",
        mapsApple: "Apple Maps",
        garmin: "Garmin Connect",
        komoot: "Komoot",
        strava: "Strava",
        bikeModeNote: "Bicycle mode where supported",
        routingHelpTitle: "Routing notes",
        routingDirectText:
          "Google Maps and Apple Maps open directly with a calculated route when you follow the link.",
        routingManualIntro:
          "Komoot, Garmin and Strava currently need a manual workflow:",
        routingStepCopy: "Copy the target coordinates.",
        routingStepLogin: "Sign in to the application.",
        routingStepSetStart:
          "Set your current location as the start inside the app.",
        routingStepPaste:
          "Paste the copied target coordinates into the destination field and start planning.",
        routingLimitations:
          "Direct routing in these apps is not possible at the moment.",
        routingFutureFeature:
          "A one-click route hand-off is planned as a future feature.",
        correctionLabel: "Correct route distance (~+49%)",
        correctionHint:
          "Straight-line distance is auto-adjusted so the planned route roughly matches your desired distance.",
        title: "So, how far do you want to go?",
        actionsGenerateTitle: "Generate random target",
        actionsGenerateHint:
          "Creates a reachable point within your selected radius.",
        generate: "Generate",
        generating: "Generating…",
        aboutTitle: "Why this app exists",
        about1: "I wanted fresh rides instead of repeating similar directions.",
        about2:
          "Tapping a place on the map with closed eyes was still biased because I sensed the map’s direction.",
        about3: "Even spinning the device did not remove that bias.",
        about4:
          "So this app lets you set a radius and lets the computer pick a random target inside it.",
        about5:
          "Your chosen distance is a straight-line value; real routes differ because roads, surfaces, access and terrain matter.",
        about6:
          "The optional correction helps the planned route match your desired distance better.",
        aboutButton: "Why this app?",
      },
      status: {
        requestingLocation: "Requesting location…",
        locationSet: "Location set from device.",
        lookingUpAddress: "Looking up address…",
        startFromAddress: "Start set from address.",
        newTarget: "New target generated.",
        copiedStart: "Start coordinates copied to clipboard.",
        copiedTarget: "Target coordinates copied to clipboard.",
        closeModal: "Close modal",
        lang: {
          groupLabel: "Language switcher",
          deActive: "German is active",
          deSwitch: "Switch language to German",
          enActive: "English is active",
          enSwitch: "Switch language to English",
        },
      },
      error: {
        geoUnavailable: "Geolocation is not available in this browser.",
        invalidDeviceLocation: "Got invalid location from the device.",
        readLocationFailed: "Could not read your location.",
        addressMin: "Please type at least 3 characters.",
        addressTimeout: "Address lookup timed out.",
        addressFailed: "Address lookup failed.",
        copyFailed:
          "Copy failed. You can select the text and copy it manually.",
        needStartAndRadius:
          "Set a start point and a radius ≤ {{max}} {{unit}}.",
      },
    },
  },
  de: {
    translation: {
      units: {
        km: "km",
        mi: "Meilen",
        kilometer: "Kilometer",
        miles: "Meilen",
      },
      labels: {
        helpButton: "Hilfe",
        radius: "Ziel-Distanz Luftlinie zum Standort ({{unit}})",
        radiusLive: "{{value}} {{unitLabel}}",
        radiusHelp: "Maximal {{max}} {{unit}}.",
        startPoint: "Ermittle Deine Standort-Koordinaten",
        useDeviceLocation: "Gerätestandort verwenden",
        locating: "Standort wird ermittelt…",
        enterAddress: "Adresse eingeben",
        hideAddressField: "Adressfeld ausblenden",
        geoHelp:
          "Eventuell wirst du um Erlaubnis gebeten. Wir speichern deinen Standort nicht.",
        manualAddress: "Manuelle Adresse",
        address: "Adresse",
        useAddress: "Adresse verwenden",
        startSummary: "Deine Standort-Koordinaten",
        latlon: "Breite, Länge",
        startNotSetHint:
          "Klicke auf „Gerätestandort verwenden“ oder gib eine Adresse ein.",
        targetSummary: "Deine Ziel-Koordinaten",
        noTargetYet: "Noch kein Ziel.",
        copy: "Kopieren",
        copied: "Kopiert",
        actionsGenerate: "Zufälliges Ziel erzeugen",
        helpTitle: "So funktioniert’s",
        helpStep1: "Radius setzen: wähle zwischen {{range}}.",
        helpStep2:
          "Start wählen: Gerätestandort verwenden oder Adresse eingeben.",
        helpStep3:
          "Ergebnis kopieren: Ziel-Koordinaten in die Routen-Applikation Deiner Wahl einfügen.",
        privacyTitle: "Datenschutz",
        privacy1: "Kein Tracking, keine Speicherung, nur HTTPS.",
        gotIt: "Verstanden",
        skipToContent: "Zum Inhalt springen",
        routeWith: "Routen mit",
        routingGroupDirectTitle: "Direkt öffnen",
        routingGroupDirectNote:
          "Öffnet mit berechneter Route, wenn du dem Link folgst.",
        routingGroupManualTitle: "Manuell in Komoot und Strava",
        routingManualNote:
          "Eine direkte Routenberechnung ist dort derzeit nicht möglich.",
        openIn: "Öffnen in",
        mapsGoogle: "Google Maps",
        mapsApple: "Apple Karten",
        garmin: "Garmin Connect",
        komoot: "Komoot",
        strava: "Strava",
        bikeModeNote: "Fahrradmodus sofern unterstützt",
        routingHelpTitle: "Routen-Hinweise",
        routingDirectText:
          "Google Maps und Apple Karten öffnen direkt mit berechneter Route, wenn du dem Link folgst.",
        routingManualIntro:
          "Komoot, Garmin und Strava benötigen derzeit einen manuellen Ablauf:",
        routingStepCopy: "Ziel-Koordinaten kopieren.",
        routingStepLogin: "In der jeweiligen Applikation anmelden.",
        routingStepSetStart:
          "Den aktuellen Standort in der App als Start festlegen.",
        routingStepPaste:
          "Die kopierten Ziel-Koordinaten in das Zielfeld einfügen und die Planung starten.",
        routingLimitations:
          "Eine direkte Routenberechnung in diesen Apps ist aktuell nicht möglich.",
        routingFutureFeature:
          "Eine Ein-Klick-Übergabe ist als zukünftiges Feature geplant.",
        correctionLabel: "Routendistanz korrigieren (~+49%)",
        correctionHint:
          "Die Luftlinie wird automatisch angepasst, damit die Route ungefähr der gewünschten Distanz entspricht.",
        title: "So, wie weit möchtest du weg?",
        actionsGenerateTitle: "Zufälliges Ziel erzeugen",
        actionsGenerateHint:
          "Erzeugt einen erreichbaren Punkt innerhalb deines gewählten Radius.",
        generate: "Erzeugen",
        generating: "Wird erzeugt…",
        aboutTitle: "Warum es diese App gibt",
        about1:
          "Ich wollte neue Touren statt immer ähnliche Richtungen zu fahren.",
        about2:
          "Mit geschlossenen Augen auf die Karte zu tippen war trotzdem voreingenommen, weil ich die Ausrichtung der Karte kannte.",
        about3:
          "Selbst das Drehen des Gerätes hat die Voreingenommenheit nicht gelöst.",
        about4:
          "Darum setzt diese App einen Radius, und der Computer wählt darin ein zufälliges Ziel.",
        about5:
          "Die eingegebene Distanz ist Luftlinie; echte Routen weichen ab, weil Straßen, Belag, Zugang und Gelände eine Rolle spielen.",
        about6:
          "Die optionale Korrektur bringt die geplante Route näher an die gewünschte Distanz.",
        aboutButton: "Warum diese App?",
      },
      status: {
        requestingLocation: "Standort wird angefordert…",
        locationSet: "Standort vom Gerät gesetzt.",
        lookingUpAddress: "Adresse wird gesucht…",
        startFromAddress: "Start aus Adresse gesetzt.",
        newTarget: "Neues Ziel erzeugt.",
        copiedStart: "Standort-Koordinaten in die Zwischenablage kopiert.",
        copiedTarget: "Ziel-Koordinaten in die Zwischenablage kopiert.",
        closeModal: "Modal schließen",
        lang: {
          groupLabel: "Sprachauswahl",
          deActive: "Deutsch ist aktiv",
          deSwitch: "Sprache zu Deutsch wechseln",
          enActive: "Englisch ist aktiv",
          enSwitch: "Sprache zu Englisch wechseln",
        },
      },
      error: {
        geoUnavailable: "Geolocation ist in diesem Browser nicht verfügbar.",
        invalidDeviceLocation: "Ungültiger Gerätestandort empfangen.",
        readLocationFailed: "Standort konnte nicht gelesen werden.",
        addressMin: "Bitte mindestens 3 Zeichen eingeben.",
        addressTimeout: "Adresssuche hat zu lange gedauert.",
        addressFailed: "Adresssuche fehlgeschlagen.",
        copyFailed:
          "Kopieren fehlgeschlagen. Du kannst den Text manuell kopieren.",
        needStartAndRadius:
          "Setze einen Startpunkt und einen Radius ≤ {{max}} {{unit}}.",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

function applyHtmlLangDir(lng: string | undefined) {
  const html = document.documentElement;
  const lang = (lng || "en").split("-")[0].toLowerCase();
  html.setAttribute("lang", lang);

  const rtl = new Set(["ar", "fa", "he", "ur"]);
  html.setAttribute("dir", rtl.has(lang) ? "rtl" : "ltr");
}

applyHtmlLangDir(i18n.resolvedLanguage || i18n.language);

i18n.on("languageChanged", (lng: string) => applyHtmlLangDir(lng));

export default i18n;
