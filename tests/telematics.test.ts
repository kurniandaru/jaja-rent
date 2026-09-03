// ==============================================================================
// Phase 4: Advanced Fleet & Telematics Automated Test Suite
// Test Coverage: Telemetry Normalization, Overspeed, Long Stop, GPS Offline,
// Geofence Evaluation, Webhook Ingestion, Alert Lifecycle & Full Acceptance Flow
// ==============================================================================

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  TeltonikaGpsAdapter,
  QueclinkGpsAdapter,
  ConcoxGpsAdapter,
  GenericGpsAdapter,
  normalizeGpsTelemetry,
} from "../src/lib/services/gps-provider-service.ts";

import {
  processTelemetryEvent,
  calculateDistanceMeters,
  checkOfflineGpsDevices,
  activeGeofences,
  inMemoryVehicleTrips,
} from "../src/lib/services/gps-event-engine.ts";

import {
  createOperationalAlert,
  acknowledgeAlertAction,
  resolveAlertAction,
  dismissAlertAction,
  queryOperationalAlerts,
  inMemoryOperationalAlerts,
} from "../src/lib/services/operational-alert-service.ts";

import {
  getTelematicsConfig,
  updateTelematicsConfig,
} from "../src/lib/services/telematics-config-service.ts";

import { queryAuditLogs } from "../src/lib/services/audit-service.ts";

describe("Phase 4: Advanced Fleet & Telematics", () => {
  // ----------------------------------------------------------------------------
  // 1. Telemetry Normalization & Multi-Vendor Ingestion
  // ----------------------------------------------------------------------------
  describe("1. Telemetry Normalization & Multi-Vendor Ingestion", () => {
    test("Normalizes Teltonika payload accurately", () => {
      const raw = {
        imei: "869402058192019",
        vehicleId: "VEH-TEL-001",
        latitude: -6.2088,
        longitude: 106.8456,
        speed: 74,
        heading: "North-West",
        odometer: 12500,
        ignition: true,
        battery: 98,
        timestamp: "2026-09-03T10:00:00.000Z",
      };

      const normalized = TeltonikaGpsAdapter.normalize(raw);
      assert.ok(normalized);
      assert.equal(normalized.vehicleId, "VEH-TEL-001");
      assert.equal(normalized.speed, 74);
      assert.equal(normalized.ignition, "ON");
      assert.equal(normalized.provider, "TELTONIKA");
      assert.equal(normalized.latitude, -6.2088);
    });

    test("Normalizes Queclink and Concox payloads", () => {
      const quecRaw = {
        device_id: "QUEC-300",
        vehicle_id: "VEH-QUEC-002",
        lat: -6.2255,
        lng: 106.8095,
        speed_kph: 55,
        acc: 1,
      };
      const quecNorm = QueclinkGpsAdapter.normalize(quecRaw);
      assert.ok(quecNorm);
      assert.equal(quecNorm.vehicleId, "VEH-QUEC-002");
      assert.equal(quecNorm.speed, 55);
      assert.equal(quecNorm.ignition, "ON");

      const concoxRaw = {
        device_id: "CONCOX-900",
        vehicle_id: "VEH-CON-003",
        lat: -6.2415,
        lng: 106.8521,
        speed: 0,
        acc: 0,
      };
      const concoxNorm = ConcoxGpsAdapter.normalize(concoxRaw);
      assert.ok(concoxNorm);
      assert.equal(concoxNorm.speed, 0);
      assert.equal(concoxNorm.ignition, "OFF");
    });

    test("Rejects invalid coordinates and corrupted telemetry", () => {
      const invalidLat = {
        vehicleId: "VEH-BAD-01",
        latitude: 145.0, // Lat exceeds 90
        longitude: 106.8456,
        speed: 50,
      };
      assert.equal(normalizeGpsTelemetry("generic", invalidLat), null);

      const invalidLng = {
        vehicleId: "VEH-BAD-02",
        latitude: -6.2,
        longitude: 250.0, // Lng exceeds 180
        speed: 50,
      };
      assert.equal(normalizeGpsTelemetry("generic", invalidLng), null);

      const missingVehicle = {
        latitude: -6.2,
        longitude: 106.8,
        speed: 30,
      };
      assert.equal(normalizeGpsTelemetry("generic", missingVehicle), null);
    });
  });

  // ----------------------------------------------------------------------------
  // 2. Overspeed Detection & Incident Deduplication
  // ----------------------------------------------------------------------------
  describe("2. Overspeed Detection & Incident Deduplication", () => {
    test("Detects overspeed, transitions Started -> Continued -> Ended, and deduplicates active incident", async () => {
      updateTelematicsConfig({ overspeedSpeedLimitKmH: 80 });
      const vehicleId = "VEH-OVERSPEED-TEST";

      // 1. First Ping: 84 km/h -> OVERSPEED_STARTED
      const ping1 = await processTelemetryEvent({
        vehicleId,
        latitude: -6.2088,
        longitude: 106.8456,
        speed: 84,
        ignition: "ON",
        recordedAt: "2026-09-03T10:01:00.000Z",
        provider: "TELTONIKA",
      });
      assert.ok(ping1.eventsDetected.includes("OVERSPEED_STARTED"));

      const alertsAfterPing1 = await queryOperationalAlerts({
        vehicleId,
        alertType: "OVERSPEED",
      });
      assert.equal(alertsAfterPing1.length, 1);
      assert.equal(alertsAfterPing1[0].status, "OPEN");
      assert.equal(alertsAfterPing1[0].speed, 84);

      // 2. Second Ping: 95 km/h -> OVERSPEED_CONTINUED (Deduplication: NO new alert created!)
      const ping2 = await processTelemetryEvent({
        vehicleId,
        latitude: -6.21,
        longitude: 106.849,
        speed: 95,
        ignition: "ON",
        recordedAt: "2026-09-03T10:02:00.000Z",
        provider: "TELTONIKA",
      });
      assert.ok(ping2.eventsDetected.includes("OVERSPEED_CONTINUED"));

      const alertsAfterPing2 = await queryOperationalAlerts({
        vehicleId,
        alertType: "OVERSPEED",
      });
      // Deduplication check: Still exactly 1 alert, with max speed updated to 95 km/h!
      assert.equal(alertsAfterPing2.length, 1);
      assert.equal(alertsAfterPing2[0].speed, 95);

      // 3. Third Ping: 72 km/h -> OVERSPEED_ENDED
      const ping3 = await processTelemetryEvent({
        vehicleId,
        latitude: -6.212,
        longitude: 106.852,
        speed: 72,
        ignition: "ON",
        recordedAt: "2026-09-03T10:03:00.000Z",
        provider: "TELTONIKA",
      });
      assert.ok(ping3.eventsDetected.includes("OVERSPEED_ENDED"));
    });
  });

  // ----------------------------------------------------------------------------
  // 3. Long Stop Detection
  // ----------------------------------------------------------------------------
  describe("3. Long Stop Detection", () => {
    test("Detects long stop when stationary duration exceeds threshold, and ends when vehicle moves", async () => {
      updateTelematicsConfig({ longStopThresholdHours: 2 });
      const vehicleId = "VEH-STOP-TEST";

      // Stop starts at 08:00
      await processTelemetryEvent({
        vehicleId,
        latitude: -6.3789,
        longitude: 107.1245,
        speed: 0,
        ignition: "OFF",
        recordedAt: "2026-09-03T08:00:00.000Z",
        provider: "TELTONIKA",
      });

      // At 09:00 (1 hour elapsed) -> Below 2h threshold, no alert
      const check1 = await processTelemetryEvent({
        vehicleId,
        latitude: -6.3789,
        longitude: 107.1245,
        speed: 0,
        ignition: "OFF",
        recordedAt: "2026-09-03T09:00:00.000Z",
        provider: "TELTONIKA",
      });
      assert.equal(check1.eventsDetected.includes("LONG_STOP_STARTED"), false);

      // At 10:30 (2.5 hours elapsed) -> Exceeds 2h threshold -> LONG_STOP_STARTED
      const check2 = await processTelemetryEvent({
        vehicleId,
        latitude: -6.3789,
        longitude: 107.1245,
        speed: 0,
        ignition: "OFF",
        recordedAt: "2026-09-03T10:30:00.000Z",
        provider: "TELTONIKA",
      });
      assert.ok(check2.eventsDetected.includes("LONG_STOP_STARTED"));

      const stopAlerts = await queryOperationalAlerts({
        vehicleId,
        alertType: "LONG_STOP",
      });
      assert.ok(stopAlerts.length >= 1);

      // Vehicle resumes moving -> LONG_STOP_ENDED
      const resume = await processTelemetryEvent({
        vehicleId,
        latitude: -6.38,
        longitude: 107.126,
        speed: 35,
        ignition: "ON",
        recordedAt: "2026-09-03T10:45:00.000Z",
        provider: "TELTONIKA",
      });
      assert.ok(resume.eventsDetected.includes("LONG_STOP_ENDED"));
    });
  });

  // ----------------------------------------------------------------------------
  // 4. Trip Detection & Distance Calculation
  // ----------------------------------------------------------------------------
  describe("4. Trip Detection & Distance Calculation", () => {
    test("Calculates geodesic distance using Haversine formula accurately", () => {
      // Distance between SCBD (-6.2255, 106.8095) and Tebet (-6.2415, 106.8521) is ~5.0 km
      const distance = calculateDistanceMeters(
        -6.2255,
        106.8095,
        -6.2415,
        106.8521,
      );
      assert.ok(distance > 4500 && distance < 5500);
    });

    test("Creates trip on ignition ON + moving, accumulates distance, and completes on ignition OFF", async () => {
      const vehicleId = "VEH-TRIP-TEST";

      // 1. Ignition ON + Speed 40 -> TRIP_STARTED
      const p1 = await processTelemetryEvent({
        vehicleId,
        latitude: -6.2255,
        longitude: 106.8095,
        speed: 40,
        ignition: "ON",
        recordedAt: "2026-09-03T07:00:00.000Z",
        provider: "TELTONIKA",
      });
      assert.ok(p1.eventsDetected.includes("TRIP_STARTED"));
      assert.ok(p1.activeTrip);
      assert.equal(p1.activeTrip.status, "ACTIVE");

      // 2. Continues moving -> Distance increases
      const p2 = await processTelemetryEvent({
        vehicleId,
        latitude: -6.2415,
        longitude: 106.8521,
        speed: 60,
        ignition: "ON",
        recordedAt: "2026-09-03T07:15:00.000Z",
        provider: "TELTONIKA",
      });
      assert.ok(p2.activeTrip);
      assert.ok(p2.activeTrip.distanceKm > 4.0);
      assert.equal(p2.activeTrip.maxSpeed, 60);

      // 3. Ignition OFF -> TRIP_COMPLETED
      const p3 = await processTelemetryEvent({
        vehicleId,
        latitude: -6.2415,
        longitude: 106.8521,
        speed: 0,
        ignition: "OFF",
        recordedAt: "2026-09-03T07:20:00.000Z",
        provider: "TELTONIKA",
      });
      assert.ok(p3.eventsDetected.includes("TRIP_COMPLETED"));
      assert.equal(p3.activeTrip?.status, "COMPLETED");
    });
  });

  // ----------------------------------------------------------------------------
  // 5. Geofence Evaluation & Restricted Area Critical Alert
  // ----------------------------------------------------------------------------
  describe("5. Geofence Evaluation & Restricted Area Critical Alert", () => {
    test("Detects GEOFENCE_ENTER for normal area and RESTRICTED_AREA_ENTRY with CRITICAL severity", async () => {
      const vehicleId = "VEH-GEOFENCE-TEST";

      // 1. Vehicle enters SCBD Pool (-6.2255, 106.8095)
      const enterPool = await processTelemetryEvent({
        vehicleId,
        latitude: -6.2255,
        longitude: 106.8095,
        speed: 15,
        ignition: "ON",
        recordedAt: "2026-09-03T11:00:00.000Z",
        provider: "TELTONIKA",
      });
      assert.ok(enterPool.eventsDetected.includes("GEOFENCE_ENTER"));

      // 2. Vehicle leaves SCBD Pool
      const exitPool = await processTelemetryEvent({
        vehicleId,
        latitude: -6.235,
        longitude: 106.82,
        speed: 45,
        ignition: "ON",
        recordedAt: "2026-09-03T11:10:00.000Z",
        provider: "TELTONIKA",
      });
      assert.ok(exitPool.eventsDetected.includes("GEOFENCE_EXIT"));

      // 3. Vehicle enters Restricted Area Pelabuhan Merak (-5.9325, 105.9985)
      const enterRestricted = await processTelemetryEvent({
        vehicleId,
        latitude: -5.9325,
        longitude: 105.9985,
        speed: 30,
        ignition: "ON",
        recordedAt: "2026-09-03T14:30:00.000Z",
        provider: "TELTONIKA",
      });
      assert.ok(
        enterRestricted.eventsDetected.includes("RESTRICTED_AREA_ENTRY"),
      );

      const restrictedAlerts = await queryOperationalAlerts({
        vehicleId,
        alertType: "RESTRICTED_AREA_ENTRY",
      });
      assert.ok(restrictedAlerts.length >= 1);
      assert.equal(restrictedAlerts[0].severity, "CRITICAL");
    });
  });

  // ----------------------------------------------------------------------------
  // 6. Operational Alert Lifecycle & Audit Trail
  // ----------------------------------------------------------------------------
  describe("6. Operational Alert Lifecycle & Audit Trail", () => {
    test("Follows OPEN -> ACKNOWLEDGED -> RESOLVED with audit records", async () => {
      const created = await createOperationalAlert({
        alertType: "VEHICLE_TAMPERING",
        severity: "CRITICAL",
        vehicleId: "VEH-LIFECYCLE-TEST",
        vehiclePlate: "B 5555 XYZ",
        incidentKey: `TAMPERING:VEH-LIFECYCLE-TEST:2026-09-03`,
        title: "Perangkat GPS Dicabut dari Port OBD-II",
        description:
          "Sinyal daya eksternal terputus tiba-tiba saat unit aktif disewa.",
        locationLat: -6.2,
        locationLng: 106.8,
      });

      assert.equal(created.alert.status, "OPEN");

      // 1. Acknowledge Alert
      const ackRes = await acknowledgeAlertAction(
        created.alert.id,
        "Field Ops Supervisor",
        "Menghubungi supir di lapangan.",
      );
      assert.equal(ackRes.success, true);
      assert.equal(ackRes.alert?.status, "ACKNOWLEDGED");
      assert.equal(ackRes.alert?.acknowledgedBy, "Field Ops Supervisor");

      // 2. Resolve Alert
      const resolveRes = await resolveAlertAction(
        created.alert.id,
        "Field Ops Supervisor",
        "Kabel perangkat GPS telah dipasang kembali dengan segel baru.",
      );
      assert.equal(resolveRes.success, true);
      assert.equal(resolveRes.alert?.status, "RESOLVED");
      assert.equal(
        resolveRes.alert?.resolutionNote,
        "Kabel perangkat GPS telah dipasang kembali dengan segel baru.",
      );

      // 3. Audit trail verification
      const audits = await queryAuditLogs({ search: "VEH-LIFECYCLE-TEST" });
      assert.ok(audits.length >= 2);
    });
  });

  // ----------------------------------------------------------------------------
  // 7. Full Section 38 Acceptance Scenario End-to-End
  // ----------------------------------------------------------------------------
  describe("7. Full Section 38 Acceptance Scenario End-to-End", () => {
    test("Executes full 16-step operational telematics flow seamlessly", async () => {
      const testVehicleId = "VEH-UAC-PHASE4";
      const today = new Date().toISOString().split("T")[0];

      // 1. Handover done -> Rental ACTIVE
      // 2. GPS starts transmitting -> Speed 0, ignition ON
      const p1 = await processTelemetryEvent({
        vehicleId: testVehicleId,
        latitude: -6.2255,
        longitude: 106.8095,
        speed: 0,
        ignition: "ON",
        recordedAt: `${today}T08:00:00.000Z`,
        provider: "TELTONIKA",
      });

      // 3. Vehicle moves -> Trip created
      const p2 = await processTelemetryEvent({
        vehicleId: testVehicleId,
        latitude: -6.228,
        longitude: 106.812,
        speed: 45,
        ignition: "ON",
        recordedAt: `${today}T08:05:00.000Z`,
        provider: "TELTONIKA",
      });
      assert.ok(p2.eventsDetected.includes("TRIP_STARTED"));

      // 4. Vehicle exceeds speed threshold (92 km/h) -> OVERSPEED event
      const p3 = await processTelemetryEvent({
        vehicleId: testVehicleId,
        latitude: -6.25,
        longitude: 106.84,
        speed: 92,
        ignition: "ON",
        recordedAt: `${today}T08:15:00.000Z`,
        provider: "TELTONIKA",
      });
      assert.ok(p3.eventsDetected.includes("OVERSPEED_STARTED"));

      // 5. Operational Alert created
      const overspeedAlerts = await queryOperationalAlerts({
        vehicleId: testVehicleId,
        alertType: "OVERSPEED",
      });
      assert.ok(overspeedAlerts.length >= 1);
      const alert = overspeedAlerts[0];
      assert.equal(alert.status, "OPEN");

      // 6. Operations acknowledges alert
      const ack = await acknowledgeAlertAction(
        alert.id,
        "Ops Dispatcher Budi",
        "Peringatan kecepatan dikirimkan ke supir.",
      );
      assert.equal(ack.success, true);
      assert.equal(ack.alert?.status, "ACKNOWLEDGED");

      // 7. Vehicle returns to normal speed (65 km/h) -> OVERSPEED ends
      const p4 = await processTelemetryEvent({
        vehicleId: testVehicleId,
        latitude: -6.26,
        longitude: 106.85,
        speed: 65,
        ignition: "ON",
        recordedAt: `${today}T08:20:00.000Z`,
        provider: "TELTONIKA",
      });
      assert.ok(p4.eventsDetected.includes("OVERSPEED_ENDED"));

      // 8. Vehicle enters restricted geofence -> CRITICAL alert
      const p5 = await processTelemetryEvent({
        vehicleId: testVehicleId,
        latitude: -5.9325,
        longitude: 105.9985,
        speed: 25,
        ignition: "ON",
        recordedAt: `${today}T11:30:00.000Z`,
        provider: "TELTONIKA",
      });
      assert.ok(p5.eventsDetected.includes("RESTRICTED_AREA_ENTRY"));

      const criticalAlerts = await queryOperationalAlerts({
        vehicleId: testVehicleId,
        severity: "CRITICAL",
      });
      assert.ok(criticalAlerts.length >= 1);
      const critAlert = criticalAlerts[0];

      // 9. Operations resolves critical alert
      const resCrit = await resolveAlertAction(
        critAlert.id,
        "Head of Operations",
        "Izin operasional pelabuhan telah diverifikasi secara manual.",
      );
      assert.equal(resCrit.success, true);
      assert.equal(resCrit.alert?.status, "RESOLVED");

      // 10. Vehicle returns and finishes trip
      const p6 = await processTelemetryEvent({
        vehicleId: testVehicleId,
        latitude: -6.2255,
        longitude: 106.8095,
        speed: 0,
        ignition: "OFF",
        recordedAt: `${today}T17:00:00.000Z`,
        provider: "TELTONIKA",
      });
      assert.ok(p6.eventsDetected.includes("TRIP_COMPLETED"));

      // 11. Verify complete audit trail exists
      const timelineAudits = await queryAuditLogs({ search: testVehicleId });
      assert.ok(timelineAudits.length >= 2);
    });
  });
});
