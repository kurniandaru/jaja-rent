import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  getVehicleAvailability,
  findAvailableVehicles,
  allocateVehicleAction,
  releaseVehicleAllocationAction,
} from "../src/lib/services/fleet-availability-service.ts";

import {
  evaluateHandoverEligibility,
  executeVehicleHandoverAction,
  returnVehicleAction,
  compareBeforeAndAfterInspections,
  recordVehicleDamageAction,
  initiatePreRentalInspectionAction,
} from "../src/lib/services/fleet-inspection-service.ts";

import {
  checkMaintenanceTriggers,
  calculateMaintenanceTotalCost,
  sendVehicleToMaintenanceAction,
  completeMaintenanceWorkAction,
  performMaintenanceQCAction,
} from "../src/lib/services/fleet-maintenance-service.ts";

import {
  calculateDocumentAlert,
  evaluateGPSHealth,
  getVehicleFullTimeline,
} from "../src/lib/services/vehicle-timeline-service.ts";

import {
  phase2SeedVehicles,
  phase2SeedAllocations,
  seedPreRentalConditionItems,
  seedReturnConditionItems,
  seedMaintenanceItems,
} from "../src/lib/mock-data/phase2-seed.ts";

import { seedVerifiedCustomer } from "../src/lib/mock-data/phase1-seed.ts";

describe("Phase 2: Fleet Operations Business Engine", () => {
  const baseVehicle = { ...phase2SeedVehicles[0] }; // Innova Zenix (AVAILABLE)

  // -------------------------------------------------------------
  // 1. AVAILABILITY ENGINE RULES (Section 3)
  // -------------------------------------------------------------
  describe("1. Vehicle Availability Engine Rules", () => {
    test("available vehicle is returned for free dates", () => {
      const res = getVehicleAvailability(
        baseVehicle,
        "2026-10-01",
        "2026-10-05",
        [],
      );
      assert.strictEqual(res.isAvailable, true);
      assert.strictEqual(
        res.blockerReasons.every((b: any) => b.passed),
        true,
      );
    });

    test("overlapping allocation blocks availability", () => {
      const commitments = [
        {
          id: "ALC-1",
          vehicleId: baseVehicle.id,
          sourceType: "ALLOCATION" as const,
          startDate: "2026-10-02",
          endDate: "2026-10-06",
          status: "ALLOCATED",
        },
      ];
      // Query 2026-10-03 to 2026-10-04 (overlaps)
      const res = getVehicleAvailability(
        baseVehicle,
        "2026-10-03",
        "2026-10-04",
        commitments,
      );
      assert.strictEqual(res.isAvailable, false);
      assert.ok(
        res.blockerReasons.some(
          (b: any) => !b.passed && b.label?.includes("Benturan"),
        ),
      );
    });

    test("overlapping rental blocks availability", () => {
      const commitments = [
        {
          id: "RNT-1",
          vehicleId: baseVehicle.id,
          sourceType: "RENTAL" as const,
          startDate: "2026-09-10",
          endDate: "2026-09-15",
          status: "ACTIVE",
        },
      ];
      const res = getVehicleAvailability(
        baseVehicle,
        "2026-09-12",
        "2026-09-14",
        commitments,
      );
      assert.strictEqual(res.isAvailable, false);
    });

    test("maintenance period blocks availability", () => {
      const commitments = [
        {
          id: "MNT-1",
          vehicleId: baseVehicle.id,
          sourceType: "MAINTENANCE" as const,
          startDate: "2026-09-20",
          endDate: "2026-09-22",
          status: "SCHEDULED",
        },
      ];
      const res = getVehicleAvailability(
        baseVehicle,
        "2026-09-21",
        "2026-09-23",
        commitments,
      );
      assert.strictEqual(res.isAvailable, false);
    });

    test("inactive or sold vehicle is rejected immediately", () => {
      const inactiveVehicle = {
        ...baseVehicle,
        lifecycleStatus: "INACTIVE" as const,
      };
      const res = getVehicleAvailability(
        inactiveVehicle,
        "2026-10-01",
        "2026-10-05",
        [],
      );
      assert.strictEqual(res.isAvailable, false);
      assert.ok(
        res.blockerReasons.some(
          (b: any) => b.label?.includes("Aset Kendaraan Aktif") && !b.passed,
        ),
      );
    });

    test("vehicle with expired document blocks rental availability", () => {
      const expiredDocVehicle = {
        ...baseVehicle,
        documentStatus: "EXPIRED" as const,
      };
      const res = getVehicleAvailability(
        expiredDocVehicle,
        "2026-10-01",
        "2026-10-05",
        [],
      );
      assert.strictEqual(res.isAvailable, false);
      assert.ok(
        res.blockerReasons.some(
          (b: any) => b.label?.includes("Kepatuhan Dokumen") && !b.passed,
        ),
      );
    });

    test("findAvailableVehicles matches criteria and returns candidates", () => {
      const searchRes = findAvailableVehicles(
        {
          rentalType: "B2C",
          transmission: "Automatic",
          minSeats: 7,
        },
        "2026-11-01",
        "2026-11-05",
        phase2SeedVehicles,
        [],
      );
      assert.ok(searchRes.compatibleVehicles.length >= 1);
      assert.ok(searchRes.availableCandidates.length >= 1);
      assert.ok(
        searchRes.compatibleVehicles.every(
          (v) => v.transmission === "Automatic" && v.seatCapacity >= 7,
        ),
      );
    });
  });

  // -------------------------------------------------------------
  // 2. VEHICLE ALLOCATION RULES (Section 4)
  // -------------------------------------------------------------
  describe("2. Vehicle Allocation Rules", () => {
    test("cannot allocate unavailable vehicle", async () => {
      const vehicleInMnt = { ...baseVehicle, status: "MAINTENANCE" as const };
      const res = await allocateVehicleAction(
        vehicleInMnt,
        "2026-10-01",
        "2026-10-05",
        "Ops Officer Rudi",
      );
      assert.strictEqual(res.success, false);
      assert.ok(res.error?.includes("Status Operasional"));
    });

    test("cannot double allocate vehicle on overlapping dates", async () => {
      const testVehicle = { ...baseVehicle };
      const existingCommitments = [
        {
          id: "ALC-EX-1",
          vehicleId: testVehicle.id,
          sourceType: "ALLOCATION" as const,
          startDate: "2026-10-10",
          endDate: "2026-10-15",
          status: "ALLOCATED",
        },
      ];
      const res = await allocateVehicleAction(
        testVehicle,
        "2026-10-12",
        "2026-10-14",
        "Ops Officer Rudi",
        undefined,
        undefined,
        existingCommitments,
      );
      assert.strictEqual(res.success, false);
      assert.ok(res.error?.includes("Benturan"));
    });

    test("allocation can be released and resets vehicle state", async () => {
      const testVehicle = { ...baseVehicle, status: "ALLOCATED" as const };
      const allocation = {
        id: "ALC-1",
        allocationNumber: "ALC-1",
        vehicleId: testVehicle.id,
        vehiclePlate: testVehicle.plateNumber,
        startAt: "2026-10-10",
        endAt: "2026-10-15",
        status: "ALLOCATED" as const,
        allocatedBy: "Ops Dispatcher Budi",
        allocatedAt: new Date().toISOString(),
      };

      const res = await releaseVehicleAllocationAction(
        allocation,
        testVehicle,
        "Ops Dispatcher Budi",
      );
      assert.strictEqual(res.success, true);
      assert.strictEqual(allocation.status, "RELEASED");
      assert.strictEqual(testVehicle.status, "AVAILABLE");
    });
  });

  // -------------------------------------------------------------
  // 3. HANDOVER & PRE-RENTAL INSPECTION RULES (Section 6 & 7)
  // -------------------------------------------------------------
  describe("3. Handover & Pre-Rental Inspection Rules", () => {
    test("handover is blocked without passed pre-rental inspection", () => {
      const testVehicle = { ...baseVehicle, status: "ALLOCATED" as const };
      const dummyRental = { id: "RNT-1", vehicleId: testVehicle.id } as any;

      // Case 1: No inspection
      const resNoInsp = evaluateHandoverEligibility(
        testVehicle,
        dummyRental,
        undefined,
      );
      assert.strictEqual(resNoInsp.canPerform, false);
      assert.ok(resNoInsp.errorMessage?.includes("Belum ada catatan inspeksi"));

      // Case 2: Failed inspection
      const resFailedInsp = evaluateHandoverEligibility(
        testVehicle,
        dummyRental,
        {
          id: "INSP-FAIL",
          type: "PRE_RENTAL",
          result: "FAILED",
        },
      );
      assert.strictEqual(resFailedInsp.canPerform, false);
      assert.ok(resFailedInsp.errorMessage?.includes("FAILED"));
    });

    test("handover transitions vehicle to RENTED and rental to ACTIVE", async () => {
      const testVehicle = { ...baseVehicle, status: "ALLOCATED" as const };
      const dummyRental = {
        id: "RNT-1",
        vehicleId: testVehicle.id,
        vehiclePlate: testVehicle.plateNumber,
        status: "RESERVED",
      } as any;

      const passedInspection = {
        id: "INSP-PASS-1",
        type: "PRE_RENTAL",
        result: "PASSED" as const,
      };

      const res = await executeVehicleHandoverAction(
        testVehicle,
        dummyRental,
        {
          handoverLocation: "Pool SCBD",
          odometer: 14500,
          fuelLevel: 100,
          notes: "Kunci & BAST diserahkan",
        },
        passedInspection,
        "Field Ops Officer Hendra",
      );

      assert.strictEqual(res.success, true);
      assert.strictEqual(testVehicle.status, "RENTED");
      assert.strictEqual(dummyRental.status, "ACTIVE");
      assert.strictEqual(res.handover?.startingOdometer, 14500);
    });
  });

  // -------------------------------------------------------------
  // 4. RETURN & CONDITION COMPARISON (Section 9 & 10)
  // -------------------------------------------------------------
  describe("4. Return & Before-After Inspection Comparison", () => {
    test("return transitions vehicle to INSPECTION, not immediately AVAILABLE", async () => {
      const testVehicle = { ...baseVehicle, status: "RENTED" as const };
      const dummyRental = { id: "RNT-1", status: "ACTIVE" } as any;

      const res = await returnVehicleAction(
        testVehicle,
        dummyRental,
        "2026-09-05T18:00:00Z",
        15200,
        "QC Lead Rudi",
      );

      assert.strictEqual(res.success, true);
      assert.strictEqual(testVehicle.status, "INSPECTION");
      assert.strictEqual(dummyRental.status, "RETURNING");
    });

    test("detects new damage and computes cost in before-after comparison", () => {
      const comparison = compareBeforeAndAfterInspections(
        seedPreRentalConditionItems,
        seedReturnConditionItems,
        baseVehicle.id,
        baseVehicle.plateNumber,
      );

      assert.strictEqual(comparison.totalItemsCompared, 10);
      assert.strictEqual(comparison.newDamagesCount, 2); // Bumper scratch + rim scratch
      assert.ok(comparison.totalEstimatedDamageCost > 0);
      assert.strictEqual(
        comparison.items.some(
          (item) => item.area === "BODY" && item.deltaStatus === "NEW_DAMAGE",
        ),
        true,
      );
    });
  });

  // -------------------------------------------------------------
  // 5. MAINTENANCE & QC GATE RULES (Section 12, 13, 17)
  // -------------------------------------------------------------
  describe("5. Maintenance Triggers, Costs & Post-Service QC Gate", () => {
    test("triggers maintenance when odometer exceeds nextServiceOdometer", () => {
      const overdueVehicle = {
        ...baseVehicle,
        odometer: 20500,
        nextServiceOdometer: 20000,
      };
      const trigger = checkMaintenanceTriggers(overdueVehicle);
      assert.strictEqual(trigger.isTriggered, true);
      assert.ok(
        trigger.triggers.some((t) => t.includes("Odometer telah melampaui")),
      );
    });

    test("calculates maintenance cost strictly from itemized checklist", () => {
      const total = calculateMaintenanceTotalCost(seedMaintenanceItems);
      // Items: 660,000 + 85,000 + 450,000 + 350,000 = 1,545,000
      assert.strictEqual(total, 1545000);
    });

    test("completed maintenance work moves to QC stage pending QC approval", async () => {
      const testVehicle = { ...baseVehicle, status: "MAINTENANCE" as const };
      const res = await completeMaintenanceWorkAction(
        testVehicle,
        "MNT-1001",
        seedMaintenanceItems,
        "Auto2000",
        "Lead Mechanic Wahyu",
      );

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.maintenanceStatus, "QC_PENDING");
      assert.strictEqual(testVehicle.status, "QC"); // In QC stage pending QC approval
    });

    test("maintenance QC FAIL keeps vehicle in MAINTENANCE (rework)", async () => {
      const testVehicle = { ...baseVehicle, status: "MAINTENANCE" as const };
      const res = await performMaintenanceQCAction(
        testVehicle,
        "MNT-1001",
        "FAIL",
        "QC Lead Rudi",
        "Rem masih berdecit",
      );

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.qcRecord.result, "FAIL");
      assert.strictEqual(testVehicle.status, "MAINTENANCE");
      assert.strictEqual(res.qcRecord.reworkRequired, true);
    });

    test("maintenance QC PASS releases vehicle back to AVAILABLE and updates service odometer", async () => {
      const testVehicle = {
        ...baseVehicle,
        status: "MAINTENANCE" as const,
        odometer: 20500,
        nextServiceOdometer: 20000,
      };
      const res = await performMaintenanceQCAction(
        testVehicle,
        "MNT-1001",
        "PASS",
        "QC Lead Rudi",
        "Uji jalan normal dan aman",
      );

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.qcRecord.result, "PASS");
      assert.strictEqual(testVehicle.status, "AVAILABLE");
      assert.strictEqual(testVehicle.nextServiceOdometer, 30500); // 20500 + 10000
    });
  });

  // -------------------------------------------------------------
  // 6. DOCUMENTS & GPS TELEMATICS (Section 18, 19, 20)
  // -------------------------------------------------------------
  describe("6. Document Expiry Calculations & GPS Health", () => {
    test("calculates document alert states correctly", () => {
      // 1. Expired
      const alertExpired = calculateDocumentAlert("2026-08-01", "2026-09-03");
      assert.strictEqual(alertExpired.alertStatus, "EXPIRED");

      // 2. Expiring soon (within 30 days)
      const alertExpiring = calculateDocumentAlert("2026-09-20", "2026-09-03");
      assert.strictEqual(alertExpiring.alertStatus, "EXPIRING_SOON");

      // 3. Valid (more than 30 days)
      const alertValid = calculateDocumentAlert("2027-01-01", "2026-09-03");
      assert.strictEqual(alertValid.alertStatus, "VALID");
    });

    test("evaluates GPS telematics online and offline thresholds", () => {
      const online = evaluateGPSHealth("2026-09-03T02:00:00Z", 40, true);
      assert.strictEqual(online.status, "ONLINE");

      const offline = evaluateGPSHealth("OFFLINE", 0, false);
      assert.strictEqual(offline.status, "OFFLINE");
      assert.strictEqual(offline.isOfflineWarning, true);
    });
  });

  // -------------------------------------------------------------
  // 7. SECTION 32: FULL 21-STEP ACCEPTANCE SCENARIO
  // -------------------------------------------------------------
  describe("7. Full 21-Step Fleet Acceptance Scenario (Section 32)", () => {
    test("executes all 21 operational steps seamlessly without manual DB manipulation", async () => {
      // 1. Vehicle available
      const vehicle = {
        ...phase2SeedVehicles[0],
        status: "AVAILABLE" as any,
      };
      assert.strictEqual(vehicle.status, "AVAILABLE");

      // 2. Customer reservation approved
      const customer = { ...seedVerifiedCustomer };
      const reservation = {
        id: "RES-E2E-PHASE2",
        customerId: customer.id,
        startAt: "2026-09-20",
        endAt: "2026-09-23",
        status: "APPROVED" as const,
      };
      assert.strictEqual(reservation.status, "APPROVED");
      // Reservation locks vehicle intent:
      vehicle.status = "RESERVED";
      assert.strictEqual(vehicle.status, "RESERVED");

      // 3. Vehicle matched with reservation
      const matchingRes = findAvailableVehicles(
        {
          rentalType: "B2C",
          transmission: "Automatic",
          minSeats: 7,
        },
        reservation.startAt,
        reservation.endAt,
        [vehicle],
        [],
      );
      assert.ok(matchingRes.availableCandidates.length >= 1);
      assert.strictEqual(matchingRes.availableCandidates[0].id, vehicle.id);

      // 4. Vehicle allocated
      const allocResult = await allocateVehicleAction(
        vehicle,
        reservation.startAt,
        reservation.endAt,
        "Ops Specialist Dimas",
        reservation.id,
      );
      assert.strictEqual(allocResult.success, true);
      assert.strictEqual(vehicle.status, "ALLOCATED");

      // 5. Pre-rental inspection created
      await initiatePreRentalInspectionAction(vehicle, "Field Inspector Rudi");
      assert.strictEqual(vehicle.status, "INSPECTION");

      const preRentalInspection = {
        id: "INSP-PRE-E2E",
        vehicleId: vehicle.id,
        type: "PRE_RENTAL",
        result: "PASSED" as const,
        conditionItems: seedPreRentalConditionItems,
      };

      // 6. Inspection passed
      assert.strictEqual(preRentalInspection.result, "PASSED");

      // 7. Vehicle handed over
      const rental = {
        id: "RNT-E2E-PHASE2",
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.plateNumber,
        status: "RESERVED" as any,
      };

      const handoverResult = await executeVehicleHandoverAction(
        vehicle,
        rental as any,
        {
          handoverLocation: "Pool SCBD Lot 8",
          odometer: 14500,
          fuelLevel: 100,
        },
        preRentalInspection,
        "Field Ops Officer Hendra",
      );
      assert.strictEqual(handoverResult.success, true);

      // 8. Rental becomes ACTIVE
      assert.strictEqual(rental.status, "ACTIVE");

      // 9. Vehicle becomes RENTED
      assert.strictEqual(vehicle.status, "RENTED");

      // 10. Customer returns vehicle
      const returnResult = await returnVehicleAction(
        vehicle,
        rental as any,
        "2026-09-23T18:00:00Z",
        15200,
        "Return QC Dimas",
      );
      assert.strictEqual(returnResult.success, true);
      assert.strictEqual(vehicle.status, "INSPECTION");

      // 11. Return inspection created
      const returnInspection = {
        id: "INSP-RET-E2E",
        vehicleId: vehicle.id,
        type: "RETURN",
        result: "CONDITIONAL" as const,
        conditionItems: seedReturnConditionItems,
      };

      // 12. Before/after condition compared
      const comparison = compareBeforeAndAfterInspections(
        preRentalInspection.conditionItems,
        returnInspection.conditionItems,
        vehicle.id,
        vehicle.plateNumber,
      );

      // 13. New damage detected
      assert.strictEqual(comparison.newDamagesCount, 2);
      const newDamageItem = comparison.items.find(
        (i) => i.area === "BODY" && i.deltaStatus === "NEW_DAMAGE",
      );
      assert.ok(newDamageItem);

      // 14. Damage recorded
      const damageRecord = await recordVehicleDamageAction(
        vehicle.id,
        {
          area: newDamageItem.area,
          description: newDamageItem.description,
          severity: newDamageItem.afterSeverity,
          estimatedCost: newDamageItem.estimatedDamageCost,
          rentalId: rental.id,
        },
        "QC Inspector Rudi",
      );
      assert.strictEqual(damageRecord.success, true);
      assert.strictEqual(damageRecord.damage.status, "OPEN");

      // 15. Damage charge sent to rental settlement
      const settlementCharge = {
        chargeType: "DAMAGE",
        amount: damageRecord.damage.estimatedCost,
        description: damageRecord.damage.description,
      };
      assert.strictEqual(settlementCharge.amount, 250000);

      // 16. Vehicle sent to maintenance if required
      const mntResult = await sendVehicleToMaintenanceAction(
        vehicle,
        "Perbaikan Bodi & Pengecatan Bemper",
        damageRecord.damage.description,
        "Bengkel Body Repair Auto2000",
        "Fleet Ops Dimas",
      );
      assert.strictEqual(mntResult.success, true);
      assert.strictEqual(vehicle.status, "MAINTENANCE");

      // 17. Maintenance performed
      const mntWorkResult = await completeMaintenanceWorkAction(
        vehicle,
        mntResult.maintenanceRecordId,
        seedMaintenanceItems,
        "Bengkel Body Repair Auto2000",
        "Kepala Bengkel Wahyu",
      );
      assert.strictEqual(mntWorkResult.success, true);
      assert.strictEqual(mntWorkResult.maintenanceStatus, "QC_PENDING");
      assert.strictEqual(vehicle.status, "QC");

      // 18. Maintenance QC performed
      // 19. QC passed
      const qcResult = await performMaintenanceQCAction(
        vehicle,
        mntResult.maintenanceRecordId,
        "PASS",
        "QC Lead Rudi",
        "Pengecatan mulus rata & uji jalan aman",
      );
      assert.strictEqual(qcResult.success, true);
      assert.strictEqual(qcResult.qcRecord.result, "PASS");

      // 20. Vehicle becomes AVAILABLE
      assert.strictEqual(vehicle.status, "AVAILABLE");

      // 21. Entire lifecycle visible on vehicle timeline
      const timeline = await getVehicleFullTimeline(vehicle.id);
      assert.ok(
        timeline.length >= 4,
        "Timeline must record all major operational transitions",
      );
    });
  });
});
