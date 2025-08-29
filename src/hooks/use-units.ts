import { useCallback, useEffect, useState } from "react";
import i18n from "../i18n";
import { KM_TO_MI, MAX_RADIUS_KM, MI_TO_KM, prefersMiles } from "../utils/geo";

export function useUnits() {
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">(
    prefersMiles(i18n.language) ? "mi" : "km"
  );

  useEffect(() => {
    const languageChangeHandler = () =>
      setDistanceUnit(prefersMiles(i18n.language) ? "mi" : "km");
    i18n.on("languageChanged", languageChangeHandler);

    return () => i18n.off("languageChanged", languageChangeHandler);
  }, []);

  const convertToKilometers = useCallback(
    (valueInCurrentUnit: number) => {
      return distanceUnit === "km"
        ? valueInCurrentUnit
        : valueInCurrentUnit * MI_TO_KM;
    },
    [distanceUnit]
  );

  const convertFromKilometers = useCallback(
    (valueInKilometers: number) => {
      return distanceUnit === "km"
        ? valueInKilometers
        : Math.round(valueInKilometers * KM_TO_MI);
    },
    [distanceUnit]
  );

  const maximumDistanceValue =
    distanceUnit === "km"
      ? MAX_RADIUS_KM
      : Math.round(MAX_RADIUS_KM * KM_TO_MI);
  const minimumDistanceValue = 1;

  return {
    unit: distanceUnit,
    maxUnit: maximumDistanceValue,
    minUnit: minimumDistanceValue,
    kmFromUnit: convertToKilometers,
    unitFromKm: convertFromKilometers,
  };
}
