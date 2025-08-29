import { useCallback } from "react";
import { formatCoordinateToSixDecimals } from "../utils/copy";

export type Coordinate = { lat: number; lon: number } | null;

/**
 * Hook to generate navigation URLs for different mapping services
 * @param startingPoint Starting coordinate
 * @param destination Destination coordinate
 */
export function useRoutingUrls(
  startingPoint: Coordinate,
  destination: Coordinate
) {
  const hasValidCoordinates = !!(startingPoint && destination);

  const getGoogleMapsUrl = useCallback(() => {
    if (!hasValidCoordinates) return "#";
    const originCoordinates = `${formatCoordinateToSixDecimals(
      startingPoint.lat
    )},${formatCoordinateToSixDecimals(startingPoint.lon)}`;
    const destinationCoordinates = `${formatCoordinateToSixDecimals(
      destination.lat
    )},${formatCoordinateToSixDecimals(destination.lon)}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      originCoordinates
    )}&destination=${encodeURIComponent(
      destinationCoordinates
    )}&travelmode=bicycling`;
  }, [hasValidCoordinates, startingPoint, destination]);

  const getAppleMapsUrl = useCallback(() => {
    if (!hasValidCoordinates) return "#";
    const sourceCoordinates = `${formatCoordinateToSixDecimals(
      startingPoint.lat
    )},${formatCoordinateToSixDecimals(startingPoint.lon)}`;
    const destinationCoordinates = `${formatCoordinateToSixDecimals(
      destination.lat
    )},${formatCoordinateToSixDecimals(destination.lon)}`;
    return `https://maps.apple.com/directions?source=${encodeURIComponent(
      sourceCoordinates
    )}&destination=${encodeURIComponent(destinationCoordinates)}&mode=cycling`;
  }, [hasValidCoordinates, startingPoint, destination]);

  const getKomootUrl = useCallback(() => {
    if (!hasValidCoordinates) return "#";
    const startCoordinates = `${formatCoordinateToSixDecimals(
      startingPoint.lat
    )},${formatCoordinateToSixDecimals(startingPoint.lon)}`;
    const endCoordinates = `${formatCoordinateToSixDecimals(
      destination.lat
    )},${formatCoordinateToSixDecimals(destination.lon)}`;
    return `https://www.komoot.com/plan?from=${encodeURIComponent(
      startCoordinates
    )}&to=${encodeURIComponent(endCoordinates)}`;
  }, [hasValidCoordinates, startingPoint, destination]);

  const getStravaUrl = useCallback(() => {
    if (!hasValidCoordinates) return "#";
    const startCoordinates = `${formatCoordinateToSixDecimals(
      startingPoint.lat
    )},${formatCoordinateToSixDecimals(startingPoint.lon)}`;
    const endCoordinates = `${formatCoordinateToSixDecimals(
      destination.lat
    )},${formatCoordinateToSixDecimals(destination.lon)}`;
    return `https://www.strava.com/maps?from=${encodeURIComponent(
      startCoordinates
    )}&to=${encodeURIComponent(endCoordinates)}`;
  }, [hasValidCoordinates, startingPoint, destination]);

  return {
    hasValidRoutes: hasValidCoordinates,
    google: getGoogleMapsUrl,
    apple: getAppleMapsUrl,
    komoot: getKomootUrl,
    strava: getStravaUrl,
  };
}
