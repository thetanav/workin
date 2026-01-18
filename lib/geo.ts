export type LatLng = { lat: number; lng: number };

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// Very small helper: compute a simple viewport bbox using a rough degrees-per-km.
// For MVP discovery, this is fine.
export function bboxAround(
  center: LatLng,
  radiusKm: number,
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusKm / 110.574;
  const lngDelta = radiusKm / (111.32 * Math.cos((center.lat * Math.PI) / 180));

  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}
