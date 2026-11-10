/**
 * Geographic utility functions for point-in-polygon and metric calculations
 */

// Ray casting algorithm for point-in-polygon testing
// point: [lat, lng]
// polygon: array of [lng, lat] coordinates (standard GeoJSON polygon ring)
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [lat, lng] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]; // lng
    const yi = polygon[i][1]; // lat
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

// Haversine distance in kilometers between two lat/lng pairs
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format density numbers neatly with tabular numerals
 */
export function formatDensity(val: number, decimals: number = 2): string {
  if (isNaN(val) || !isFinite(val)) return '0.00';
  return val.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatNumber(val: number): string {
  return val.toLocaleString();
}
