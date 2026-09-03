// ==============================================================================
// GPS Event Engine (Phase 4: Advanced Fleet & Telematics)
// Automated Event Detection: Overspeed, Long Stop, GPS Offline, Trip Detection,
// Geofence Evaluation, and Context-Aware Operational Alert Dispatching
// ==============================================================================

import type {
  TelemetryEvent,
  GeofenceRecord,
  VehicleTripRecord,
  TelematicsEventType,
  TelematicsEventRecord,
} from "../types/telematics.ts";
import {
  getTelematicsConfig,
  type TelematicsConfiguration,
} from "./telematics-config-service.ts";
import {
  createOperationalAlert,
  resolveAlertAction,
} from "./operational-alert-service.ts";
import { getRentals } from "../data/rentals.ts";
import { recordAuditLog } from "./audit-service.ts";

/**
 * Standard Seed Geofences
 */
export const activeGeofences: GeofenceRecord[] = [
  {
    id: "GEO-001",
    name: "Pool Utama Jaja SCBD",
    type: "BRANCH",
    latitude: -6.2255,
    longitude: 106.8095,
    radiusMeters: 400,
    severity: "INFO",
    status: "ACTIVE",
    description: "Hub operasional pusat Jakarta",
  },
  {
    id: "GEO-002",
    name: "Bandara Soekarno-Hatta Pickup Zone",
    type: "OPERATING_AREA",
    latitude: -6.1275,
    longitude: 106.6537,
    radiusMeters: 2500,
    severity: "INFO",
    status: "ACTIVE",
    description: "Zona pickup dan dropoff terminal bandara",
  },
  {
    id: "GEO-003",
    name: "Zona Terlarang Penyeberangan Merak",
    type: "RESTRICTED_AREA",
    latitude: -5.9325,
    longitude: 105.9985,
    radiusMeters: 1500,
    severity: "CRITICAL",
    status: "ACTIVE",
    description:
      "Area pelabuhan penyeberangan luar pulau (Dilarang tanpa izin)",
  },
];

// In-memory repositories for state machines
export const inMemoryVehicleTrips: VehicleTripRecord[] = [
  {
    id: "TRIP-001",
    vehicleId: "B-1234-XYZ",
    rentalId: "RNT-B2B-2026-001",
    driverId: "DRV-001",
    startedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    endedAt: new Date(Date.now() - 40 * 60000).toISOString(),
    startLatitude: -6.2255,
    startLongitude: 106.8095,
    endLatitude: -6.2589,
    endLongitude: 106.9812,
    distanceKm: 28.4,
    durationSeconds: 4800,
    maxSpeed: 88,
    averageSpeed: 42.5,
    status: "COMPLETED",
  },
];

export const inMemoryTelematicsEvents: TelematicsEventRecord[] = [];

// State caches for state machines per vehicle
interface VehicleTelematicsState {
  lastTelemetry?: TelemetryEvent;
  isOverspeeding: boolean;
  overspeedStart?: string;
  overspeedMaxSpeed: number;
  stopStartTime?: string;
  isLongStopReported: boolean;
  activeTripId?: string;
  insideGeofenceIds: Set<string>;
}

const vehicleStates = new Map<string, VehicleTelematicsState>();

function getOrCreateState(vehicleId: string): VehicleTelematicsState {
  if (!vehicleStates.has(vehicleId)) {
    vehicleStates.set(vehicleId, {
      isOverspeeding: false,
      overspeedMaxSpeed: 0,
      isLongStopReported: false,
      insideGeofenceIds: new Set<string>(),
    });
  }
  return vehicleStates.get(vehicleId)!;
}

/**
 * Haversine formula to compute geodesic distance in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Process a normalized Telemetry event through all detection rules
 */
export async function processTelemetryEvent(
  telemetry: TelemetryEvent,
): Promise<{
  eventsDetected: TelematicsEventType[];
  activeTrip?: VehicleTripRecord;
}> {
  const config = getTelematicsConfig();
  const state = getOrCreateState(telemetry.vehicleId);
  const todayDateOnly = telemetry.recordedAt.split("T")[0];
  const detected: TelematicsEventType[] = [];

  // 1. Fetch Business Context (Active Rental & Driver)
  const allRentals = await getRentals();
  const activeRental = allRentals.find(
    (r) =>
      r.status === "ACTIVE" &&
      (r.vehicleId.toLowerCase() === telemetry.vehicleId.toLowerCase() ||
        r.vehiclePlate.toLowerCase() === telemetry.vehicleId.toLowerCase()),
  );

  const vehiclePlate = activeRental?.vehiclePlate || telemetry.vehicleId;
  const customerId = activeRental?.customerId;
  const customerName = activeRental?.customerName;
  const driverId = activeRental?.driverId;
  const driverName = activeRental?.driverName;

  // --------------------------------------------------------------------------
  // Rule A: Overspeed Detection State Machine
  // --------------------------------------------------------------------------
  if (telemetry.speed > config.overspeedSpeedLimitKmH) {
    if (!state.isOverspeeding) {
      // OVERSPEED_STARTED
      state.isOverspeeding = true;
      state.overspeedStart = telemetry.recordedAt;
      state.overspeedMaxSpeed = telemetry.speed;
      detected.push("OVERSPEED_STARTED");

      const severity = telemetry.speed >= 120 ? "CRITICAL" : "WARNING";
      await createOperationalAlert({
        alertType: "OVERSPEED",
        severity,
        vehicleId: telemetry.vehicleId,
        vehiclePlate,
        rentalId: activeRental?.id,
        customerId,
        customerName,
        driverId,
        driverName,
        incidentKey: `OVERSPEED:${telemetry.vehicleId}:${todayDateOnly}`,
        title: `Pelanggaran Batas Kecepatan (${telemetry.speed} km/h)`,
        description: `Unit melaju dengan kecepatan ${telemetry.speed} km/h melewati batas maksimal ${config.overspeedSpeedLimitKmH} km/h.`,
        locationLat: telemetry.latitude,
        locationLng: telemetry.longitude,
        speed: telemetry.speed,
        startedAt: telemetry.recordedAt,
      });
    } else {
      // OVERSPEED_CONTINUED
      state.overspeedMaxSpeed = Math.max(
        state.overspeedMaxSpeed,
        telemetry.speed,
      );
      detected.push("OVERSPEED_CONTINUED");

      // Update existing alert with higher speed if reached
      await createOperationalAlert({
        alertType: "OVERSPEED",
        severity: telemetry.speed >= 120 ? "CRITICAL" : "WARNING",
        vehicleId: telemetry.vehicleId,
        vehiclePlate,
        rentalId: activeRental?.id,
        incidentKey: `OVERSPEED:${telemetry.vehicleId}:${todayDateOnly}`,
        title: `Pelanggaran Kecepatan Berlanjut (${state.overspeedMaxSpeed} km/h)`,
        description: `Kendaraan melanjutkan overspeed hingga ${state.overspeedMaxSpeed} km/h.`,
        speed: state.overspeedMaxSpeed,
        locationLat: telemetry.latitude,
        locationLng: telemetry.longitude,
      });
    }
  } else if (state.isOverspeeding) {
    // OVERSPEED_ENDED
    state.isOverspeeding = false;
    detected.push("OVERSPEED_ENDED");
  }

  // --------------------------------------------------------------------------
  // Rule B: Long Stop Detection State Machine
  // --------------------------------------------------------------------------
  if (telemetry.speed === 0) {
    if (!state.stopStartTime) {
      state.stopStartTime = telemetry.recordedAt;
    } else {
      const stopDurationMs =
        new Date(telemetry.recordedAt).getTime() -
        new Date(state.stopStartTime).getTime();
      const stopHours = stopDurationMs / (1000 * 60 * 60);

      // Trigger long stop when threshold is reached
      if (
        stopHours >= config.longStopThresholdHours &&
        !state.isLongStopReported
      ) {
        state.isLongStopReported = true;
        detected.push("LONG_STOP_STARTED");

        await createOperationalAlert({
          alertType: "LONG_STOP",
          severity: "WARNING",
          vehicleId: telemetry.vehicleId,
          vehiclePlate,
          rentalId: activeRental?.id,
          customerId,
          customerName,
          driverId,
          driverName,
          incidentKey: `LONG_STOP:${telemetry.vehicleId}:${todayDateOnly}`,
          title: `Peringatan Kendaraan Berhenti Lama (> ${config.longStopThresholdHours} Jam)`,
          description: `Kendaraan berhenti selama ${stopHours.toFixed(1)} jam dalam posisi diam.`,
          locationLat: telemetry.latitude,
          locationLng: telemetry.longitude,
          speed: 0,
          startedAt: state.stopStartTime,
        });
      }
    }
  } else {
    // Vehicle is moving again
    if (state.isLongStopReported) {
      detected.push("LONG_STOP_ENDED");
    }
    state.stopStartTime = undefined;
    state.isLongStopReported = false;
  }

  // --------------------------------------------------------------------------
  // Rule C: Trip Detection State Machine
  // --------------------------------------------------------------------------
  let tripResult: VehicleTripRecord | undefined;
  if (telemetry.ignition === "ON" && telemetry.speed > 0) {
    if (!state.activeTripId) {
      // TRIP_START
      const newTrip: VehicleTripRecord = {
        id: `TRIP-${Date.now()}`,
        vehicleId: telemetry.vehicleId,
        rentalId: activeRental?.id,
        driverId,
        startedAt: telemetry.recordedAt,
        startLatitude: telemetry.latitude,
        startLongitude: telemetry.longitude,
        distanceKm: 0,
        durationSeconds: 0,
        maxSpeed: telemetry.speed,
        averageSpeed: telemetry.speed,
        status: "ACTIVE",
      };
      state.activeTripId = newTrip.id;
      inMemoryVehicleTrips.push(newTrip);
      tripResult = newTrip;
      detected.push("TRIP_STARTED");
    } else {
      // Active trip continuation: compute distance from previous coordinate
      const trip = inMemoryVehicleTrips.find(
        (t) => t.id === state.activeTripId,
      );
      if (trip && state.lastTelemetry) {
        const deltaMeters = calculateDistanceMeters(
          state.lastTelemetry.latitude,
          state.lastTelemetry.longitude,
          telemetry.latitude,
          telemetry.longitude,
        );
        trip.distanceKm = Number(
          (trip.distanceKm + deltaMeters / 1000).toFixed(2),
        );
        trip.maxSpeed = Math.max(trip.maxSpeed, telemetry.speed);
        trip.endLatitude = telemetry.latitude;
        trip.endLongitude = telemetry.longitude;

        const durationSec = Math.max(
          1,
          Math.round(
            (new Date(telemetry.recordedAt).getTime() -
              new Date(trip.startedAt).getTime()) /
              1000,
          ),
        );
        trip.durationSeconds = durationSec;
        trip.averageSpeed = Number(
          (trip.distanceKm / (durationSec / 3600) || telemetry.speed).toFixed(
            1,
          ),
        );
        tripResult = trip;
      }
    }
  } else if (telemetry.ignition === "OFF" && state.activeTripId) {
    // TRIP_COMPLETED
    const trip = inMemoryVehicleTrips.find((t) => t.id === state.activeTripId);
    if (trip) {
      trip.status = "COMPLETED";
      trip.endedAt = telemetry.recordedAt;
      trip.endLatitude = telemetry.latitude;
      trip.endLongitude = telemetry.longitude;
      state.activeTripId = undefined;
      tripResult = trip;
      detected.push("TRIP_COMPLETED");
    }
  }

  // --------------------------------------------------------------------------
  // Rule D: Geofence Engine (Enter, Exit, Restricted Zone)
  // --------------------------------------------------------------------------
  if (config.geofenceAlertsEnabled) {
    for (const gf of activeGeofences) {
      if (gf.status !== "ACTIVE") continue;

      const dist = calculateDistanceMeters(
        telemetry.latitude,
        telemetry.longitude,
        gf.latitude,
        gf.longitude,
      );
      const isInside = dist <= gf.radiusMeters;
      const wasInside = state.insideGeofenceIds.has(gf.id);

      if (isInside && !wasInside) {
        // GEOFENCE_ENTER
        state.insideGeofenceIds.add(gf.id);
        detected.push("GEOFENCE_ENTER");

        // CRITICAL ALERT: Entered Restricted Area!
        if (gf.type === "RESTRICTED_AREA") {
          detected.push("RESTRICTED_AREA_ENTRY");
          await createOperationalAlert({
            alertType: "RESTRICTED_AREA_ENTRY",
            severity: "CRITICAL",
            vehicleId: telemetry.vehicleId,
            vehiclePlate,
            rentalId: activeRental?.id,
            customerId,
            customerName,
            driverId,
            driverName,
            incidentKey: `RESTRICTED_AREA_ENTRY:${telemetry.vehicleId}:${gf.id}:${todayDateOnly}`,
            title: `Pelanggaran Masuk Zona Terlarang (${gf.name})`,
            description: `Kendaraan terdeteksi memasuki kawasan terlarang ${gf.name} tanpa otorisasi.`,
            locationLat: telemetry.latitude,
            locationLng: telemetry.longitude,
            speed: telemetry.speed,
            startedAt: telemetry.recordedAt,
          });
        }
      } else if (!isInside && wasInside) {
        // GEOFENCE_EXIT
        state.insideGeofenceIds.delete(gf.id);
        detected.push("GEOFENCE_EXIT");

        // Warning if exiting operating boundary
        if (gf.type === "OPERATING_AREA") {
          await createOperationalAlert({
            alertType: "GEOFENCE_EXIT",
            severity: "WARNING",
            vehicleId: telemetry.vehicleId,
            vehiclePlate,
            rentalId: activeRental?.id,
            customerId,
            customerName,
            driverId,
            driverName,
            incidentKey: `GEOFENCE_EXIT:${telemetry.vehicleId}:${gf.id}:${todayDateOnly}`,
            title: `Unit Keluar Batas Operasional (${gf.name})`,
            description: `Kendaraan telah keluar dari batas radius operasional ${gf.name}.`,
            locationLat: telemetry.latitude,
            locationLng: telemetry.longitude,
            speed: telemetry.speed,
          });
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Rule E: GPS Offline / Back Online Detection
  // --------------------------------------------------------------------------
  if (state.lastTelemetry) {
    const elapsedSinceLast =
      new Date(telemetry.recordedAt).getTime() -
      new Date(state.lastTelemetry.recordedAt).getTime();
    const elapsedMinutes = elapsedSinceLast / (1000 * 60);

    if (elapsedMinutes > config.gpsOfflineThresholdMinutes) {
      detected.push("GPS_BACK_ONLINE");
      // Resolve any open GPS_OFFLINE alert for this vehicle
      await resolveAlertAction(
        `ALT-OFFLINE-${telemetry.vehicleId}`,
        "Telematics Engine",
        "Perangkat GPS kembali terhubung dan mentransmisikan data normal.",
      );
    }
  }

  // Save current telemetry as lastTelemetry
  state.lastTelemetry = telemetry;

  // Record detected events in inMemoryTelematicsEvents
  for (const ev of detected) {
    inMemoryTelematicsEvents.unshift({
      id: `EV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType: ev,
      vehicleId: telemetry.vehicleId,
      vehiclePlate,
      rentalId: activeRental?.id,
      customerId,
      driverId,
      telemetry,
      timestamp: telemetry.recordedAt,
    });
  }

  return { eventsDetected: detected, activeTrip: tripResult };
}

/**
 * Checks for GPS devices that have gone offline (> threshold mins)
 */
export async function checkOfflineGpsDevices(
  thresholdMinutes: number = 30,
): Promise<{ offlineDetectedCount: number }> {
  const now = Date.now();
  let count = 0;

  for (const [vehicleId, state] of Array.from(vehicleStates.entries())) {
    if (state.lastTelemetry) {
      const elapsedMins =
        (now - new Date(state.lastTelemetry.recordedAt).getTime()) /
        (1000 * 60);
      if (elapsedMins > thresholdMinutes) {
        count++;
        const todayDateOnly = new Date().toISOString().split("T")[0];
        await createOperationalAlert({
          alertType: "GPS_OFFLINE",
          severity: "WARNING",
          vehicleId,
          incidentKey: `GPS_OFFLINE:${vehicleId}:${todayDateOnly}`,
          title: `Perangkat GPS Offline (> ${thresholdMinutes} Menit)`,
          description: `Perangkat GPS tidak mengirimkan sinyal telematika selama lebih dari ${Math.round(elapsedMins)} menit.`,
          locationLat: state.lastTelemetry.latitude,
          locationLng: state.lastTelemetry.longitude,
        });
      }
    }
  }

  return { offlineDetectedCount: count };
}

export function getTripsForVehicle(vehicleId: string): VehicleTripRecord[] {
  return inMemoryVehicleTrips.filter(
    (t) => t.vehicleId.toLowerCase() === vehicleId.toLowerCase(),
  );
}

export function getTelematicsEventsForVehicle(
  vehicleId: string,
): TelematicsEventRecord[] {
  return inMemoryTelematicsEvents.filter(
    (e) => e.vehicleId.toLowerCase() === vehicleId.toLowerCase(),
  );
}
