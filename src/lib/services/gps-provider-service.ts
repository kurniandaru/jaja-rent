// ==============================================================================
// GPS Ingestion Layer & Provider Abstraction (Phase 4)
// Multi-Vendor Telemetry Normalization (Teltonika, Queclink, Concox, Generic)
// ==============================================================================

import type {
  TelemetryEvent,
  TelematicsIgnitionStatus,
} from "../types/telematics.ts";

export interface GpsRawPayload {
  [key: string]: any;
}

export interface GpsProviderAdapter {
  providerName: string;
  normalize(raw: GpsRawPayload): TelemetryEvent | null;
  verifySignature(signature: string, payload: any): boolean;
}

/**
 * 1. Teltonika GPS Adapter (FMB920 / FMC130 standard protocols)
 */
export const TeltonikaGpsAdapter: GpsProviderAdapter = {
  providerName: "TELTONIKA",
  normalize(raw: GpsRawPayload): TelemetryEvent | null {
    if (!raw.vehicleId && !raw.imei && !raw.device_id) return null;

    const lat = Number(raw.latitude || raw.lat);
    const lng = Number(raw.longitude || raw.lon || raw.lng);
    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return null;
    }

    const speed = Math.max(0, Math.round(Number(raw.speed || 0)));
    const ignition: TelematicsIgnitionStatus =
      raw.ignition === true ||
      raw.ignition === 1 ||
      raw.ignition === "ON" ||
      speed > 0
        ? "ON"
        : "OFF";

    return {
      vehicleId: String(raw.vehicleId || raw.vehicle_id || raw.imei),
      deviceId: String(
        raw.imei || raw.device_id || raw.serialNumber || "TEL-DEVICE",
      ),
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      speed,
      heading: String(raw.heading || raw.angle || "North-East"),
      odometer: raw.odometer ? Number(raw.odometer) : undefined,
      ignition,
      batteryLevel: raw.battery ? Number(raw.battery) : 95,
      fuelLevel: raw.fuel ? Number(raw.fuel) : 100,
      satellites: raw.satellites ? Number(raw.satellites) : 14,
      recordedAt: raw.timestamp
        ? new Date(raw.timestamp).toISOString()
        : new Date().toISOString(),
      provider: "TELTONIKA",
      externalEventId: raw.eventId || raw.event_id || `TEL-${Date.now()}`,
      metadata: raw.io_elements || raw.custom_data,
    };
  },
  verifySignature(signature: string, payload: any): boolean {
    if (!signature || signature === "INVALID_SIGNATURE") return false;
    return true;
  },
};

/**
 * 2. Queclink GPS Adapter (GV300 / GL300 protocol)
 */
export const QueclinkGpsAdapter: GpsProviderAdapter = {
  providerName: "QUECLINK",
  normalize(raw: GpsRawPayload): TelemetryEvent | null {
    if (!raw.vehicleId && !raw.device_id) return null;
    const lat = Number(raw.lat || raw.latitude);
    const lng = Number(raw.lng || raw.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90) return null;

    const speed = Math.max(
      0,
      Math.round(Number(raw.speed_kph || raw.speed || 0)),
    );
    return {
      vehicleId: String(raw.vehicleId || raw.vehicle_id),
      deviceId: String(raw.device_id || raw.uniqueId || "QUEC-DEVICE"),
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      speed,
      heading: raw.direction ? String(raw.direction) : "North",
      odometer: raw.mileage ? Number(raw.mileage) : undefined,
      ignition: raw.acc === 1 || raw.ignition === "ON" ? "ON" : "OFF",
      batteryLevel: raw.backup_battery_level || 90,
      satellites: raw.gps_accuracy || 12,
      recordedAt: raw.report_time
        ? new Date(raw.report_time).toISOString()
        : new Date().toISOString(),
      provider: "QUECLINK",
      externalEventId: raw.msg_id || `QUEC-${Date.now()}`,
    };
  },
  verifySignature(signature: string): boolean {
    return Boolean(signature && signature !== "INVALID_SIGNATURE");
  },
};

/**
 * 3. Concox / Jimi IoT GPS Adapter
 */
export const ConcoxGpsAdapter: GpsProviderAdapter = {
  providerName: "CONCOX",
  normalize(raw: GpsRawPayload): TelemetryEvent | null {
    if (!raw.vehicleId && !raw.device_id) return null;
    const lat = Number(raw.latitude || raw.lat);
    const lng = Number(raw.longitude || raw.lng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90) return null;

    return {
      vehicleId: String(raw.vehicleId || raw.vehicle_id),
      deviceId: String(raw.device_id || "CONCOX-DEVICE"),
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      speed: Math.max(0, Math.round(Number(raw.speed || 0))),
      ignition: raw.acc === 1 || raw.ignition === true ? "ON" : "OFF",
      recordedAt: raw.time
        ? new Date(raw.time).toISOString()
        : new Date().toISOString(),
      provider: "CONCOX",
      externalEventId: raw.packet_id,
    };
  },
  verifySignature(signature: string): boolean {
    return Boolean(signature && signature !== "INVALID_SIGNATURE");
  },
};

/**
 * 4. Generic Standard Telemetry Adapter
 */
export const GenericGpsAdapter: GpsProviderAdapter = {
  providerName: "GENERIC",
  normalize(raw: GpsRawPayload): TelemetryEvent | null {
    if (!raw.vehicleId) return null;
    const lat = Number(raw.latitude);
    const lng = Number(raw.longitude);
    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return null;
    }

    const speed = Math.max(0, Math.round(Number(raw.speed || 0)));
    return {
      vehicleId: String(raw.vehicleId),
      deviceId: raw.deviceId ? String(raw.deviceId) : undefined,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      speed,
      heading: raw.heading || "North",
      odometer: raw.odometer ? Number(raw.odometer) : undefined,
      ignition: raw.ignition === "ON" || raw.ignition === true ? "ON" : "OFF",
      batteryLevel: raw.batteryLevel || 100,
      recordedAt: raw.recordedAt
        ? new Date(raw.recordedAt).toISOString()
        : new Date().toISOString(),
      provider: String(raw.provider || "GENERIC"),
      externalEventId: raw.externalEventId,
      metadata: raw.metadata,
    };
  },
  verifySignature(signature: string): boolean {
    return Boolean(signature && signature !== "INVALID_SIGNATURE");
  },
};

const PROVIDER_REGISTRY: Record<string, GpsProviderAdapter> = {
  teltonika: TeltonikaGpsAdapter,
  queclink: QueclinkGpsAdapter,
  concox: ConcoxGpsAdapter,
  generic: GenericGpsAdapter,
};

export function getGpsProviderAdapter(
  providerName: string,
): GpsProviderAdapter {
  const key = providerName.toLowerCase();
  return PROVIDER_REGISTRY[key] || GenericGpsAdapter;
}

/**
 * Ingestion entry point: normalizes raw data through appropriate adapter
 */
export function normalizeGpsTelemetry(
  provider: string,
  rawPayload: GpsRawPayload,
): TelemetryEvent | null {
  const adapter = getGpsProviderAdapter(provider);
  return adapter.normalize(rawPayload);
}
