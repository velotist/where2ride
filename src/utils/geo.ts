/** ---------------- Geometry utils ---------------- */
export const toRad = (deg: number) => (deg * Math.PI) / 180;
export const toDeg = (rad: number) => (rad * 180) / Math.PI;
export const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);
export const normalizeLon = (lonDeg: number) => ((lonDeg + 540) % 360) - 180;
export const isValidLat = (lat: number) =>
  Number.isFinite(lat) && lat >= -90 && lat <= 90;
export const isValidLon = (lon: number) =>
  Number.isFinite(lon) && lon >= -180 && lon <= 180;

/** ---------------- Units ---------------- */
export const KM_TO_MI = 0.621371192;
export const MI_TO_KM = 1 / KM_TO_MI;
export const MAX_RADIUS_KM = 150;
export const prefersMiles = (lang: string | undefined) =>
  !!lang && /^en/i.test(lang);

/** ---------------- WGS-84 constants ---------------- */
const WGS84_A = 6378137.0; // Semi-major axis in meters
const WGS84_F = 1 / 298.257223563; // Flattening
const WGS84_B = WGS84_A * (1 - WGS84_F); // Semi-minor axis in meters

/** ---------------- Random helper ---------------- */
function randUnit() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);

  return arr[0] / 4294967296;
}

/** ---------------- Vincenty Direct (extracted) ---------------- */
export function vincentyDirect(
  latDeg: number,
  lonDeg: number,
  distanceMeters: number,
  initialBearingRad: number
) {
  const latitudeRad = toRad(latDeg);
  const longitudeRad = toRad(lonDeg);
  const flattening = WGS84_F,
    semiMajorAxis = WGS84_A,
    semiMinorAxis = WGS84_B;

  const reducedLatitude = Math.atan((1 - flattening) * Math.tan(latitudeRad));
  const cosReducedLat = Math.cos(reducedLatitude);

  const sinBearing = Math.sin(initialBearingRad),
    cosBearing = Math.cos(initialBearingRad);

  const sinAzimuth = cosReducedLat * sinBearing;
  const sinAzimuthSquared = sinAzimuth * sinAzimuth;
  const cosAzimuthSquared = 1 - sinAzimuthSquared;

  const sigma1 = Math.atan2(Math.tan(reducedLatitude), cosBearing);

  const u2 =
    (cosAzimuthSquared *
      (semiMajorAxis * semiMajorAxis - semiMinorAxis * semiMinorAxis)) /
    (semiMinorAxis * semiMinorAxis);
  const coefficientA =
    1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
  const coefficientB = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));

  let sigma = distanceMeters / (semiMinorAxis * coefficientA);
  let sigmaPrevious = 0;
  let iterations = 0;

  while (Math.abs(sigma - sigmaPrevious) > 1e-12 && iterations++ < 100) {
    const twoSigmaMean = 2 * sigma1 + sigma;
    const sinSigma = Math.sin(sigma);
    const cosSigma = Math.cos(sigma);
    const cos2SigmaMean = Math.cos(twoSigmaMean);

    const deltaSigma =
      coefficientB *
      sinSigma *
      (cos2SigmaMean +
        (coefficientB / 4) *
          (cosSigma * (-1 + 2 * cos2SigmaMean * cos2SigmaMean) -
            (coefficientB / 6) *
              cos2SigmaMean *
              (-3 + 4 * sinSigma * sinSigma) *
              (-3 + 4 * cos2SigmaMean * cos2SigmaMean)));

    sigmaPrevious = sigma;
    sigma = distanceMeters / (semiMinorAxis * coefficientA) + deltaSigma;
  }

  const sinSigma = Math.sin(sigma);
  const cosSigma = Math.cos(sigma);
  const twoSigmaMean = 2 * sigma1 + sigma;

  const temp =
    Math.sin(reducedLatitude) * sinSigma -
    Math.cos(reducedLatitude) * cosSigma * cosBearing;
  const latitude2Rad = Math.atan2(
    Math.sin(reducedLatitude) * cosSigma +
      Math.cos(reducedLatitude) * sinSigma * cosBearing,
    (1 - flattening) * Math.sqrt(sinAzimuthSquared + temp * temp)
  );

  const lambda = Math.atan2(
    sinSigma * sinBearing,
    Math.cos(reducedLatitude) * cosSigma -
      Math.sin(reducedLatitude) * sinSigma * cosBearing
  );

  const coefficientC =
    (flattening / 16) *
    cosAzimuthSquared *
    (4 + flattening * (4 - 3 * cosAzimuthSquared));
  const longitudeDelta =
    lambda -
    (1 - coefficientC) *
      flattening *
      sinAzimuth *
      (sigma +
        coefficientC *
          sinSigma *
          (Math.cos(twoSigmaMean) +
            coefficientC *
              cosSigma *
              (-1 + 2 * Math.cos(twoSigmaMean) * Math.cos(twoSigmaMean))));
  const longitude2Rad = longitudeRad + longitudeDelta;

  return { lat: toDeg(latitude2Rad), lon: normalizeLon(toDeg(longitude2Rad)) };
}

export function randomDestination(
  latDeg: number,
  lonDeg: number,
  radiusKm: number
) {
  const distanceMeters = radiusKm * 1000;
  const randomBearingRadians = randUnit() * 2 * Math.PI;

  return vincentyDirect(latDeg, lonDeg, distanceMeters, randomBearingRadians);
}
