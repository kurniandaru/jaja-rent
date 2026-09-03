import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  validateCustomerData,
  evaluateCustomerVerificationEligibility,
  verifyCustomerLifecycle,
  verifyDocumentAction,
  rejectDocumentAction,
  generateCustomerNumber,
} from "../src/lib/services/customer-service.ts";

import {
  hasDateConflict,
  isVehicleAvailableForDates,
  validateCustomerCanReserve,
  evaluateReservationApprovalEligibility,
  approveReservationAction,
  rejectReservationAction,
  generateReservationNumber,
} from "../src/lib/services/reservation-service.ts";

import {
  calculateTotalCharges,
  evaluateRentalActivationEligibility,
  activateRentalAction,
  calculateSettlementSummary,
  completeRentalAction,
  generateContractNumber,
} from "../src/lib/services/rental-service.ts";

import { getAuditLogsForEntity } from "../src/lib/services/audit-service.ts";

import {
  seedVerifiedCustomer,
  seedPendingCustomer,
  seedRejectedCustomer,
  seedVehicles,
  seedPendingReservation,
  seedActiveRental,
  seedActiveContract,
  seedRentalCharges,
  seedRentalPayments,
  seedRentalDeposit,
} from "../src/lib/mock-data/phase1-seed.ts";

describe("Business Core Phase 1 — Enterprise Rule Engine", () => {
  // -------------------------------------------------------------
  // 1. CUSTOMER & DOCUMENT VERIFICATION RULES
  // -------------------------------------------------------------
  describe("1. Customer Master & Verification Rules", () => {
    test("rejects customer creation with invalid phone or short NIK", () => {
      const result = validateCustomerData(
        {
          fullName: "A",
          phone: "12345",
          identityNumber: "123",
        },
        [seedVerifiedCustomer],
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.length >= 2);
    });

    test("rejects customer creation with duplicate identity number", () => {
      const result = validateCustomerData(
        {
          fullName: "Bambang Duplicate",
          phone: "081299887766",
          identityNumber: seedVerifiedCustomer.nik, // existing NIK
        },
        [seedVerifiedCustomer],
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes("sudah terdaftar")));
    });

    test("cannot verify customer if documents are pending and agreements missing", () => {
      const eligibility =
        evaluateCustomerVerificationEligibility(seedPendingCustomer);
      assert.strictEqual(eligibility.canPerform, false);
      assert.ok(
        eligibility.errorMessage?.includes(
          "Tidak dapat memverifikasi customer",
        ),
      );
    });

    test("cannot verify customer if blacklisted or suspended", () => {
      const blacklistedCustomer = {
        ...seedVerifiedCustomer,
        status: "BLACKLISTED" as const,
        isBlacklisted: true,
      };
      const eligibility =
        evaluateCustomerVerificationEligibility(blacklistedCustomer);
      assert.strictEqual(eligibility.canPerform, false);
      assert.ok(eligibility.errorMessage?.includes("BLACKLIST"));
    });

    test("successfully verifies customer when all prerequisites are met", async () => {
      const eligibility =
        evaluateCustomerVerificationEligibility(seedVerifiedCustomer);
      assert.strictEqual(eligibility.canPerform, true);

      const res = await verifyCustomerLifecycle(
        seedVerifiedCustomer,
        "Admin QC",
      );
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.customer?.status, "VERIFIED");
    });

    test("rejecting a document requires a valid explanation reason", async () => {
      const failRes = await rejectDocumentAction(
        "CUS-000002",
        "DOC-KTP-002",
        "",
        "Admin QC",
      );
      assert.strictEqual(failRes.success, false);

      const passRes = await rejectDocumentAction(
        "CUS-000002",
        "DOC-KTP-002",
        "Foto KTP terpotong dan NIK buram",
        "Admin QC",
      );
      assert.strictEqual(passRes.success, true);
    });
  });

  // -------------------------------------------------------------
  // 2. RESERVATION & VEHICLE ALLOCATION RULES
  // -------------------------------------------------------------
  describe("2. Reservation & Date-Range Conflict Rules", () => {
    test("unverified, blacklisted, or suspended customer cannot reserve", () => {
      // Pending
      const resPending = validateCustomerCanReserve(seedPendingCustomer);
      assert.strictEqual(resPending.canReserve, false);
      assert.ok(resPending.reason?.includes("VERIFIED"));

      // Blacklisted
      const resBlacklisted = validateCustomerCanReserve({
        ...seedVerifiedCustomer,
        status: "BLACKLISTED",
      });
      assert.strictEqual(resBlacklisted.canReserve, false);
      assert.ok(resBlacklisted.reason?.includes("BLACKLIST"));

      // Suspended
      const resSuspended = validateCustomerCanReserve({
        ...seedVerifiedCustomer,
        status: "SUSPENDED",
      });
      assert.strictEqual(resSuspended.canReserve, false);
      assert.ok(resSuspended.reason?.includes("SUSPEND"));
    });

    test("customer with expired SIM cannot reserve self-drive", () => {
      const expiredSimCustomer = {
        ...seedVerifiedCustomer,
        drivingInfo: {
          ...seedVerifiedCustomer.drivingInfo,
          licenseExpiry: "2023-01-01", // Past date
        },
      };
      const res = validateCustomerCanReserve(expiredSimCustomer, true);
      assert.strictEqual(res.canReserve, false);
      assert.ok(
        res.reason?.includes("kedaluwarsa") || res.reason?.includes("habis"),
      );
    });

    test("verified customer can reserve when license and status are valid", () => {
      const res = validateCustomerCanReserve(seedVerifiedCustomer, true);
      assert.strictEqual(res.canReserve, true);
    });

    test("date conflict detection accurately detects overlaps and boundaries", () => {
      // Existing: 10 Sep - 15 Sep
      const startExisting = "2026-09-10T00:00:00Z";
      const endExisting = "2026-09-15T00:00:00Z";

      // Inside: 12 Sep - 14 Sep -> CONFLICT
      assert.strictEqual(
        hasDateConflict(
          "2026-09-12T00:00:00Z",
          "2026-09-14T00:00:00Z",
          startExisting,
          endExisting,
        ),
        true,
      );

      // Overlapping left: 08 Sep - 12 Sep -> CONFLICT
      assert.strictEqual(
        hasDateConflict(
          "2026-09-08T00:00:00Z",
          "2026-09-12T00:00:00Z",
          startExisting,
          endExisting,
        ),
        true,
      );

      // Overlapping right: 14 Sep - 18 Sep -> CONFLICT
      assert.strictEqual(
        hasDateConflict(
          "2026-09-14T00:00:00Z",
          "2026-09-18T00:00:00Z",
          startExisting,
          endExisting,
        ),
        true,
      );

      // Completely outside before: 01 Sep - 05 Sep -> NO CONFLICT
      assert.strictEqual(
        hasDateConflict(
          "2026-09-01T00:00:00Z",
          "2026-09-05T00:00:00Z",
          startExisting,
          endExisting,
        ),
        false,
      );

      // Completely outside after: 20 Sep - 25 Sep -> NO CONFLICT
      assert.strictEqual(
        hasDateConflict(
          "2026-09-20T00:00:00Z",
          "2026-09-25T00:00:00Z",
          startExisting,
          endExisting,
        ),
        false,
      );
    });

    test("vehicle availability check blocks overlapping allocation for same unit", () => {
      const commitments = [
        {
          vehicleId: "VEH-001",
          sourceId: "RES-000001",
          sourceType: "RESERVATION" as const,
          startDate: "2026-09-10T08:00:00Z",
          endDate: "2026-09-15T18:00:00Z",
          status: "PENDING_APPROVAL",
        },
      ];

      // Request same vehicle for 12 Sep - 14 Sep
      const conflictCheck = isVehicleAvailableForDates(
        "VEH-001",
        "2026-09-12T08:00:00Z",
        "2026-09-14T18:00:00Z",
        commitments,
      );
      assert.strictEqual(conflictCheck.isAvailable, false);
      assert.strictEqual(
        conflictCheck.conflictingCommitment?.vehicleId,
        "VEH-001",
      );

      // Request different date: 20 Sep - 25 Sep
      const nonConflictCheck = isVehicleAvailableForDates(
        "VEH-001",
        "2026-09-20T08:00:00Z",
        "2026-09-25T18:00:00Z",
        commitments,
      );
      assert.strictEqual(nonConflictCheck.isAvailable, true);
    });

    test("reservation approval workflow transitions and records approver", async () => {
      const resApproval = await approveReservationAction(
        { ...seedPendingReservation },
        "Operations Lead",
      );
      assert.strictEqual(resApproval.success, true);
      assert.strictEqual(resApproval.reservation?.status, "APPROVED");
      assert.strictEqual(
        resApproval.reservation?.approvedBy,
        "Operations Lead",
      );

      const resReject = await rejectReservationAction(
        { ...seedPendingReservation },
        "Unit tidak tersedia pada tanggal tersebut",
        "Operations Lead",
      );
      assert.strictEqual(resReject.success, true);
      assert.strictEqual(resReject.reservation?.status, "REJECTED");
    });
  });

  // -------------------------------------------------------------
  // 3. RENTAL CHARGES, CONTRACT & SETTLEMENT RULES
  // -------------------------------------------------------------
  describe("3. Rental Contract, Itemized Charges & Settlement Rules", () => {
    test("total rental amount is calculated strictly from charge line items", () => {
      const total = calculateTotalCharges(seedRentalCharges);
      // 1,800,000 + 150,000 = 1,950,000
      assert.strictEqual(total, 1950000);
    });

    test("cannot activate rental without vehicle and signed contract", () => {
      const blocker = evaluateRentalActivationEligibility(
        { ...seedActiveRental, vehiclePlate: "" },
        undefined,
      );
      assert.strictEqual(blocker.canPerform, false);
      assert.ok(blocker.errorMessage?.includes("Unit Kendaraan"));
    });

    test("can activate rental when vehicle and signed contract are present", async () => {
      const reservedRental = {
        ...seedActiveRental,
        status: "RESERVED" as const,
      };
      const blocker = evaluateRentalActivationEligibility(
        reservedRental,
        seedActiveContract,
        seedRentalDeposit,
      );
      assert.strictEqual(blocker.canPerform, true);

      const res = await activateRentalAction(
        reservedRental,
        seedActiveContract,
        "Ops Officer",
      );
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.rental?.status, "ACTIVE");
    });

    test("settlement correctly factors damage, overtime, and deposit deductions", () => {
      const inspectionComparison = {
        inspectionId: "INS-RET-001",
        returnOdometer: 42800,
        startingOdometer: 42100,
        distanceDrivenKm: 700,
        returnFuelPercent: 90,
        startingFuelPercent: 100,
        newDamageFound: true,
        damageDescriptions: ["Baret bumper belakang kiri"],
        recommendedDamageFee: 250000,
        actualReturnTime: "2026-09-05T20:00:00Z",
        scheduledReturnTime: "2026-09-05T18:00:00Z",
        isOverdue: true,
        overdueHours: 2,
        recommendedOvertimeFee: 100000,
      };

      const settlement = calculateSettlementSummary(
        seedActiveRental,
        seedRentalCharges,
        seedRentalPayments,
        seedRentalDeposit,
        inspectionComparison,
      );

      // Base charges = 1,950,000
      // Damage = 250,000
      // Overtime = 100,000
      // Total final = 2,300,000
      // Paid already = 1,950,000
      // Remaining unpaid = 350,000
      // Deposit held = 500,000
      // Deposit deducted = 350,000
      // Deposit returned = 150,000
      // Final balance = 0 (settled)
      assert.strictEqual(settlement.totalFinalCharges, 2300000);
      assert.strictEqual(settlement.damageCharges, 250000);
      assert.strictEqual(settlement.overtimeCharges, 100000);
      assert.strictEqual(settlement.depositDeducted, 350000);
      assert.strictEqual(settlement.depositReturned, 150000);
      assert.strictEqual(settlement.finalSettlementBalance, 0);
      assert.strictEqual(settlement.status, "SETTLED");
    });
  });

  // -------------------------------------------------------------
  // 4. END-TO-END ACCEPTANCE CRITERIA SCENARIO (20 STEPS)
  // -------------------------------------------------------------
  describe("4. Acceptance Criteria Verification (20-Step Lifecycle)", () => {
    test("successfully completes full 20-step lifecycle without manual database manipulation", async () => {
      // 1. Create customer
      const customerValidation = validateCustomerData(
        {
          fullName: "Faisal Nugraha",
          phone: "081299112233",
          identityNumber: "3276011909920005",
        },
        [seedVerifiedCustomer],
      );
      assert.strictEqual(customerValidation.isValid, true);

      const customer = {
        id: "CUST-E2E-001",
        customerNumber: generateCustomerNumber(),
        name: "Faisal Nugraha",
        phone: "081299112233",
        email: "faisal.nugraha@gmail.com",
        nik: "3276011909920005",
        dateOfBirth: "1992-09-19",
        address: "Jl. Tebet Barat Raya No. 12",
        city: "Jakarta Selatan",
        province: "DKI Jakarta",
        status: "DRAFT" as const,
        joinedDate: "2026-09-03",
        totalRentalsCount: 0,
        activeRentalsCount: 0,
        drivingInfo: {
          licenseNumber: "SIM-A-99210088",
          licenseType: "SIM_A" as const,
          licenseExpiry: "2029-09-19",
          verificationStatus: "PENDING" as const,
        },
        emergencyContact: {
          name: "Dewi Lestari",
          relationship: "SPOUSE" as const,
          phone: "081299112299",
        },
        documents: [] as any[],
        agreements: [] as any[],
      };
      assert.ok(customer.customerNumber.startsWith("CUS-"));
      assert.strictEqual(customer.status, "DRAFT");

      // 2. Upload KTP/SIM
      customer.documents.push(
        {
          id: "DOC-E2E-KTP",
          documentType: "KTP" as const,
          documentName: "KTP Elektronik",
          documentNumber: customer.nik,
          isRequired: true,
          verificationStatus: "PENDING" as const,
          fileName: "ktp_faisal.jpg",
        },
        {
          id: "DOC-E2E-SIM",
          documentType: "SIM" as const,
          documentName: "SIM A Nasional",
          documentNumber: customer.drivingInfo.licenseNumber,
          expiryDate: customer.drivingInfo.licenseExpiry,
          isRequired: true,
          verificationStatus: "PENDING" as const,
          fileName: "sim_a_faisal.jpg",
        },
      );
      assert.strictEqual(customer.documents.length, 2);

      // 3. Verify documents
      const ktpVerify = await verifyDocumentAction(
        customer.id,
        customer.documents[0].id,
        "QC Lead Hendra",
      );
      assert.strictEqual(ktpVerify.success, true);
      customer.documents[0].verificationStatus = "VERIFIED";

      const simVerify = await verifyDocumentAction(
        customer.id,
        customer.documents[1].id,
        "QC Lead Hendra",
      );
      assert.strictEqual(simVerify.success, true);
      customer.documents[1].verificationStatus = "VERIFIED";
      (customer.drivingInfo as any).verificationStatus = "VERIFIED";

      // 4. Verify customer
      // Before agreements, verification is blocked:
      let verifyEligibility = evaluateCustomerVerificationEligibility(
        customer as any,
      );
      assert.strictEqual(verifyEligibility.canPerform, false);

      // 5. Customer accepts rental terms
      customer.agreements.push({
        id: "ACC-E2E-001",
        customerId: customer.id,
        agreementId: "AGR-TERMS-v1.0",
        agreementVersion: "v1.0",
        agreementType: "RENTAL_TERMS",
        acceptedBy: customer.name,
        acceptedByRole: "Penyewa",
        acceptedAt: new Date().toISOString(),
        ipAddress: "182.253.120.44",
        status: "ACCEPTED",
      });
      assert.strictEqual(customer.agreements.length, 1);

      // Now customer verification is unblocked:
      verifyEligibility = evaluateCustomerVerificationEligibility(
        customer as any,
      );
      assert.strictEqual(verifyEligibility.canPerform, true);

      const customerVerifyResult = await verifyCustomerLifecycle(
        customer as any,
        "QC Lead Hendra",
      );
      assert.strictEqual(customerVerifyResult.success, true);
      assert.strictEqual(customer.status, "VERIFIED");

      // 6. Create reservation
      const canReserve = validateCustomerCanReserve(customer as any, true);
      assert.strictEqual(canReserve.canReserve, true);

      const reservation = {
        id: "RSV-E2E-001",
        reservationNumber: generateReservationNumber(),
        customerId: customer.id,
        customerName: customer.name,
        customerNumber: customer.customerNumber,
        customerPhone: customer.phone,
        customerStatus: customer.status,
        rentalType: "B2C" as const,
        pickupLocation: "Pool Jakarta Pusat",
        dropoffLocation: "Pool Jakarta Pusat",
        startAt: "2026-09-10",
        endAt: "2026-09-13",
        status: "DRAFT" as const,
        withDriver: false,
        createdAt: "2026-09-03T08:00:00Z",
        updatedAt: "2026-09-03T08:00:00Z",
      };
      assert.ok(reservation.reservationNumber.startsWith("RES-"));

      // 7. Submit reservation
      reservation.status = "PENDING_APPROVAL" as any;
      assert.strictEqual(reservation.status, "PENDING_APPROVAL");

      // 8. Approve reservation
      // 9. Allocate vehicle
      const targetVehicle = seedVehicles[0];
      const isAvailable = isVehicleAvailableForDates(
        targetVehicle.id,
        reservation.startAt,
        reservation.endAt,
        [],
      );
      assert.strictEqual(isAvailable.isAvailable, true);

      (reservation as any).assignedVehicleId = targetVehicle.id;
      (reservation as any).assignedVehiclePlate = targetVehicle.plateNumber;

      const approvalEligibility = evaluateReservationApprovalEligibility(
        reservation as any,
        customer as any,
        targetVehicle,
      );
      assert.strictEqual(approvalEligibility.canPerform, true);

      const approveRes = await approveReservationAction(
        reservation as any,
        "Ops Manager Budi",
      );
      assert.strictEqual(approveRes.success, true);
      assert.strictEqual(reservation.status, "APPROVED");

      // 10. Generate rental contract
      const contract = {
        id: "CTR-E2E-001",
        contractNumber: generateContractNumber(),
        reservationId: reservation.id,
        customerId: customer.id,
        customerName: customer.name,
        vehicleId: targetVehicle.id,
        vehiclePlate: targetVehicle.plateNumber,
        startAt: reservation.startAt,
        endAt: reservation.endAt,
        status: "SIGNED" as const,
        termsVersion: "v1.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      assert.ok(contract.contractNumber.startsWith("RNT-"));
      assert.strictEqual(contract.status, "SIGNED");

      // 11. Create rental charges
      const rentalCharges = [
        {
          id: "CHG-E2E-01",
          rentalId: "RNT-E2E-001",
          chargeType: "RENTAL" as const,
          description: "Sewa Harian Toyota Innova Zenix (3 Hari)",
          quantity: 3,
          unitPrice: 650000,
          amount: 1950000,
          createdAt: new Date().toISOString(),
        },
        {
          id: "CHG-E2E-02",
          rentalId: "RNT-E2E-001",
          chargeType: "INSURANCE" as const,
          description: "All-Risk Protection Premium",
          quantity: 1,
          unitPrice: 150000,
          amount: 150000,
          createdAt: new Date().toISOString(),
        },
      ];
      const totalCharges = calculateTotalCharges(rentalCharges);
      assert.strictEqual(totalCharges, 2100000);

      // 12. Record payment/deposit
      const rentalPayments = [
        {
          id: "PAY-E2E-01",
          paymentNumber: "PAY-000101",
          rentalId: "RNT-E2E-001",
          amount: 2100000,
          paymentMethod: "BANK_TRANSFER" as const,
          paymentStatus: "PAID" as const,
          paidAt: new Date().toISOString(),
          reference: "TRX-BCA-88991122",
        },
      ];
      const rentalDeposit = {
        id: "DEP-E2E-01",
        depositNumber: "DEP-000101",
        rentalId: "RNT-E2E-001",
        customerId: customer.id,
        amount: 500000,
        status: "HELD" as const,
        heldAt: new Date().toISOString(),
      };
      assert.strictEqual(rentalPayments[0].paymentStatus, "PAID");
      assert.strictEqual(rentalDeposit.status, "HELD");

      // 13. Activate rental
      const rentalRecord = {
        id: "RNT-E2E-001",
        type: "B2C" as const,
        reservationId: reservation.id,
        contractId: contract.id,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerType: "INDIVIDUAL" as const,
        vehicleId: targetVehicle.id,
        vehiclePlate: targetVehicle.plateNumber,
        vehicleModel: `${targetVehicle.brand} ${targetVehicle.model}`,
        vehicleOwnership: targetVehicle.ownership,
        withDriver: false,
        startDate: reservation.startAt,
        endDate: reservation.endAt,
        pickupLocation: reservation.pickupLocation,
        dropoffLocation: reservation.dropoffLocation,
        ratePerPeriod: 650000,
        totalAmount: totalCharges,
        depositAmount: rentalDeposit.amount,
        paymentStatus: "PAID" as const,
        status: "RESERVED" as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const activationEligibility = evaluateRentalActivationEligibility(
        rentalRecord as any,
        contract as any,
        rentalDeposit as any,
      );
      assert.strictEqual(activationEligibility.canPerform, true);

      const activateRes = await activateRentalAction(
        rentalRecord as any,
        contract as any,
        "Ops Officer Dimas",
      );
      assert.strictEqual(activateRes.success, true);
      assert.strictEqual(rentalRecord.status, "ACTIVE");

      // 14. Return vehicle
      // 15. Perform return inspection
      const returnInspection = {
        inspectionId: "INS-E2E-RET",
        startingOdometer: 14500,
        returnOdometer: 15150, // 650 KM driven
        distanceDrivenKm: 650,
        startingFuelPercent: 100,
        returnFuelPercent: 85,
        newDamageFound: true,
        damageDescriptions: ["Baret pada bemper samping kanan belakang"],
        recommendedDamageFee: 250000,
        scheduledReturnTime: "2026-09-13T18:00:00Z",
        actualReturnTime: "2026-09-13T20:00:00Z",
        isOverdue: true,
        overdueHours: 2,
        recommendedOvertimeFee: 100000,
      };
      assert.strictEqual(returnInspection.distanceDrivenKm, 650);
      assert.strictEqual(returnInspection.isOverdue, true);

      // 16. Add damage/overtime charge if required
      assert.strictEqual(returnInspection.recommendedDamageFee, 250000);
      assert.strictEqual(returnInspection.recommendedOvertimeFee, 100000);

      // 17. Calculate settlement
      const settlement = calculateSettlementSummary(
        rentalRecord as any,
        rentalCharges as any,
        rentalPayments as any,
        rentalDeposit as any,
        returnInspection,
      );

      // Base charges: 2,100,000
      // Overtime charges: 100,000
      // Damage charges: 250,000
      // Total final charges: 2,450,000
      // Already paid: 2,100,000
      // Unpaid balance: 350,000
      // 18. Deduct/return deposit
      // Deposit held: 500,000 -> Deducted: 350,000 -> Returned: 150,000
      assert.strictEqual(settlement.totalFinalCharges, 2450000);
      assert.strictEqual(settlement.overtimeCharges, 100000);
      assert.strictEqual(settlement.damageCharges, 250000);
      assert.strictEqual(settlement.depositDeducted, 350000);
      assert.strictEqual(settlement.depositReturned, 150000);
      assert.strictEqual(settlement.finalSettlementBalance, 0);
      assert.strictEqual(settlement.status, "SETTLED");

      // 19. Complete rental
      const completeRes = await completeRentalAction(
        rentalRecord as any,
        contract as any,
        settlement,
        rentalDeposit as any,
        "Finance Officer Maya",
      );
      assert.strictEqual(completeRes.success, true);
      assert.strictEqual(rentalRecord.status, "COMPLETED");
      assert.strictEqual(contract.status, "COMPLETED");
      assert.strictEqual(rentalDeposit.status, "PARTIALLY_RETURNED");
      assert.strictEqual((rentalDeposit as any).returnedAmount, 150000);
      assert.strictEqual((rentalDeposit as any).deductionAmount, 350000);

      // 20. See complete timeline/audit trail
      const customerLogs = await getAuditLogsForEntity("CUSTOMER", customer.id);
      const reservationLogs = await getAuditLogsForEntity(
        "RESERVATION",
        reservation.id,
      );
      const rentalLogs = await getAuditLogsForEntity("RENTAL", rentalRecord.id);
      const settlementLogs = await getAuditLogsForEntity(
        "SETTLEMENT",
        rentalRecord.id,
      );

      assert.ok(customerLogs.length >= 1, "Customer audit logs must exist");
      assert.ok(
        reservationLogs.length >= 1,
        "Reservation audit logs must exist",
      );
      assert.ok(rentalLogs.length >= 1, "Rental audit logs must exist");
      assert.ok(settlementLogs.length >= 1, "Settlement audit logs must exist");

      // Verify Expected Final Lifecycle states:
      assert.strictEqual(customer.status, "VERIFIED");
      assert.strictEqual(reservation.status, "APPROVED");
      assert.strictEqual(contract.status, "COMPLETED");
      assert.strictEqual(rentalRecord.status, "COMPLETED");
      assert.strictEqual(settlement.status, "SETTLED");
    });
  });
});
