// ==============================================================================
// Telematics Configuration Service (Phase 4: Advanced Fleet & Telematics)
// Configurable Operational Thresholds for Telemetry Event Detection
// ==============================================================================

export interface TelematicsConfiguration {
  overspeedSpeedLimitKmH: number; // default: 80 km/h
  overspeedMinDurationSeconds: number; // default: 30 seconds
  longStopThresholdHours: number; // default: 3 hours
  gpsOfflineThresholdMinutes: number; // default: 30 minutes
  tripMinDistanceKm: number; // default: 0.5 km
  geofenceAlertsEnabled: boolean; // default: true
}

export const DEFAULT_TELEMATICS_CONFIG: TelematicsConfiguration = {
  overspeedSpeedLimitKmH: 80,
  overspeedMinDurationSeconds: 30,
  longStopThresholdHours: 3,
  gpsOfflineThresholdMinutes: 30,
  tripMinDistanceKm: 0.5,
  geofenceAlertsEnabled: true,
};

let currentTelematicsConfig: TelematicsConfiguration = {
  ...DEFAULT_TELEMATICS_CONFIG,
};

export function getTelematicsConfig(): TelematicsConfiguration {
  return { ...currentTelematicsConfig };
}

export function updateTelematicsConfig(
  newConfig: Partial<TelematicsConfiguration>,
): TelematicsConfiguration {
  currentTelematicsConfig = {
    ...currentTelematicsConfig,
    ...newConfig,
  };
  return { ...currentTelematicsConfig };
}
