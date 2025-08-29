import i18n from "../i18n";
import { isValidLat, isValidLon } from "../utils/geo";

export async function geocodeAddress(address: string, signal: AbortSignal) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
    address
  )}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": i18n.language || navigator.language || "en",
    },
    method: "GET",
    credentials: "omit",
    cache: "no-store",
    signal,
  });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0)
    throw new Error("Address not found");
  const item = data[0];
  const lat = Number.parseFloat(item.lat);
  const lon = Number.parseFloat(item.lon);
  if (!isValidLat(lat) || !isValidLon(lon))
    throw new Error("Invalid coordinates from geocoder");

  return { lat, lon };
}
