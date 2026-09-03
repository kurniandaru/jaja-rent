// ==============================================================================
// Telematics Domain Types (Phase 4: Advanced Fleet & Telematics)
// Canonical Telemetry, Trips, Geofences, and Telematics Events
// ==============================================================================

export type TelematicsMovementStatus =
  | "MOVING"
  | "STOPPED"
  | "IDLE"
  | "GPS_OFFLINE";

export type TelematicsIgnitionStatus = "ON" | "OFF";

export interface TelemetryEvent {
  vehicleId: string;
  deviceId?: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading?: string;
  odometer?: number;
  ignition: TelematicsIgnitionStatus;
  batteryLevel?: number;
  fuelLevel?: number;
  satellites?: number;
  recordedAt: string;
  provider: string; // e.g. 'TELTONIKA', 'QUECLINK', 'CONCOX', 'GENERIC'
  externalEventId?: string;
  metadata?: Record<string, any>;
}

export type GeofenceType =
  | "BRANCH"
  | "WORKSHOP"
  | "PARKING"
  | "OPERATING_AREA"
  | "RESTRICTED_AREA"
  | "CUSTOM";

export interface GeofenceRecord {
  id: string;
  name: string;
  type: GeofenceType;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  severity?: "CRITICAL" | "WARNING" | "INFO";
  status: "ACTIVE" | "INACTIVE";
  description?: string;
}

export type TripStatus = "ACTIVE" | "COMPLETED" | "INVALID";

export interface VehicleTripRecord {
  id: string;
  vehicleId: string;
  rentalId?: string;
  driverId?: string;
  startedAt: string;
  endedAt?: string;
  startLatitude: number;
  startLongitude: number;
  endLatitude?: number;
  endLongitude?: number;
  distanceKm: number;
  durationSeconds: number;
  maxSpeed: number;
  averageSpeed: number;
  status: TripStatus;
}

export type TelematicsEventType =
  | "TRIP_STARTED"
  | "TRIP_COMPLETED"
  | "OVERSPEED_STARTED"
  | "OVERSPEED_CONTINUED"
  | "OVERSPEED_ENDED"
  | "LONG_STOP_STARTED"
  | "LONG_STOP_ENDED"
  | "GPS_OFFLINE"
  | "GPS_BACK_ONLINE"
  | "GEOFENCE_ENTER"
  | "GEOFENCE_EXIT"
  | "RESTRICTED_AREA_ENTRY";

export interface TelematicsEventRecord {
  id: string;
  eventType: TelematicsEventType;
  vehicleId: string;
  vehiclePlate?: string;
  rentalId?: string;
  customerId?: string;
  driverId?: string;
  telemetry: TelemetryEvent;
  geofenceId?: string;
  geofenceName?: string;
  details?: Record<string, any>;
  timestamp: string;
}
