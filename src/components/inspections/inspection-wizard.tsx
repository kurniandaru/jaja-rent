"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InspectionProgress, StepDef } from "./inspection-progress";
import { VehicleSelectionStep } from "./vehicle-selection-step";
import { ChecklistCategoryStep } from "./checklist-category-step";
import { TestDriveStep } from "./test-drive-step";
import { PhotoDocumentationStep } from "./photo-documentation-step";
import { InspectionReviewStep } from "./inspection-review-step";
import {
  defaultExteriorItems,
  defaultInteriorItems,
  defaultMechanicalItems,
  defaultFrameItems,
  defaultTestDriveItems,
} from "@/lib/inspections/inspection-items";
import { calculateGradeSummary } from "@/lib/inspections/inspection-calculator";
import {
  VehicleMasterSpecs,
  InspectionItem,
  TestDriveItem,
  PhotoDocumentation,
  DigitalInspectionRecord,
} from "@/lib/types/inspection";
import { saveDigitalInspection } from "@/lib/data/inspections";
import {
  Car,
  ShieldCheck,
  Armchair,
  Wrench,
  Layers,
  Gauge,
  Camera,
  ArrowLeft,
  ArrowRight,
  Save,
  X,
  CheckCircle2,
} from "lucide-react";

const DRAFT_STORAGE_KEY = "jaja_inspection_draft_v1";

interface InspectionWizardProps {
  initialInspection?: DigitalInspectionRecord;
}

export function InspectionWizard({ initialInspection }: InspectionWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [draftToast, setDraftToast] = React.useState<string | null>(null);

  // Wizard States
  const [inspectionId, setInspectionId] = React.useState(
    initialInspection?.id || `INSP-2026-${Date.now().toString().slice(-4)}`
  );
  const [vehicleSpecs, setVehicleSpecs] = React.useState<VehicleMasterSpecs | null>(
    initialInspection?.vehicleSpecs || null
  );
  const [inspectorName, setInspectorName] = React.useState(
    initialInspection?.inspectorName || "Ahmad Subarjo"
  );
  const [inspectionDate, setInspectionDate] = React.useState(
    initialInspection?.inspectionDate || new Date().toISOString().split("T")[0]
  );
  const [inspectionLocation, setInspectionLocation] = React.useState(
    initialInspection?.inspectionLocation || "Pool Pusat Sudirman"
  );
  const [inspectionOdometer, setInspectionOdometer] = React.useState(
    initialInspection?.inspectionOdometer || 0
  );
  const [inspectorNotes, setInspectorNotes] = React.useState(
    initialInspection?.inspectorNotes || ""
  );

  // Checklist States
  const [exteriorItems, setExteriorItems] = React.useState<InspectionItem[]>(
    initialInspection?.exteriorItems || defaultExteriorItems
  );
  const [interiorItems, setInteriorItems] = React.useState<InspectionItem[]>(
    initialInspection?.interiorItems || defaultInteriorItems
  );
  const [mechanicalItems, setMechanicalItems] = React.useState<InspectionItem[]>(
    initialInspection?.mechanicalItems || defaultMechanicalItems
  );
  const [frameItems, setFrameItems] = React.useState<InspectionItem[]>(
    initialInspection?.frameItems || defaultFrameItems
  );
  const [testDriveItems, setTestDriveItems] = React.useState<TestDriveItem[]>(
    initialInspection?.testDriveItems || defaultTestDriveItems
  );
  const [photos, setPhotos] = React.useState<PhotoDocumentation>(
    initialInspection?.photos || {}
  );

  // Load draft from localStorage on first mount if not editing existing
  React.useEffect(() => {
    if (!initialInspection && typeof window !== "undefined") {
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const draft: DigitalInspectionRecord = JSON.parse(savedDraft);
          setInspectionId(draft.id);
          setVehicleSpecs(draft.vehicleSpecs);
          setInspectorName(draft.inspectorName);
          setInspectionDate(draft.inspectionDate);
          setInspectionLocation(draft.inspectionLocation);
          setInspectionOdometer(draft.inspectionOdometer);
          setInspectorNotes(draft.inspectorNotes || "");
          if (draft.exteriorItems) setExteriorItems(draft.exteriorItems);
          if (draft.interiorItems) setInteriorItems(draft.interiorItems);
          if (draft.mechanicalItems) setMechanicalItems(draft.mechanicalItems);
          if (draft.frameItems) setFrameItems(draft.frameItems);
          if (draft.testDriveItems) setTestDriveItems(draft.testDriveItems);
          if (draft.photos) setPhotos(draft.photos);

          setDraftToast("Draft sebelumnya berhasil dipulihkan!");
          setTimeout(() => setDraftToast(null), 4000);
        }
      } catch (e) {
        console.warn("Could not load draft from localStorage", e);
      }
    }
  }, [initialInspection]);

  // Compute live grade summaries
  const grades = React.useMemo(() => {
    return calculateGradeSummary(
      exteriorItems,
      interiorItems,
      mechanicalItems,
      frameItems,
      testDriveItems
    );
  }, [exteriorItems, interiorItems, mechanicalItems, frameItems, testDriveItems]);

  // Step definitions
  const steps: StepDef[] = [
    {
      id: 1,
      title: "Identitas Unit",
      shortTitle: "Unit",
      icon: Car,
      isCompleted: Boolean(vehicleSpecs && inspectorName && inspectionOdometer > 0),
    },
    {
      id: 2,
      title: "Eksterior",
      shortTitle: "Eksterior",
      icon: ShieldCheck,
      isCompleted: exteriorItems.every((i) => i.grade !== undefined),
      uninspectedCount: exteriorItems.filter((i) => i.grade === undefined).length,
      hasIssues: exteriorItems.some((i) => i.grade === "C" || i.grade === "D" || i.grade === "E"),
    },
    {
      id: 3,
      title: "Interior",
      shortTitle: "Interior",
      icon: Armchair,
      isCompleted: interiorItems.every((i) => i.grade !== undefined),
      uninspectedCount: interiorItems.filter((i) => i.grade === undefined).length,
      hasIssues: interiorItems.some((i) => i.grade === "C" || i.grade === "D" || i.grade === "E"),
    },
    {
      id: 4,
      title: "Mesin & Mekanikal",
      shortTitle: "Mesin",
      icon: Wrench,
      isCompleted: mechanicalItems.every((i) => i.grade !== undefined),
      uninspectedCount: mechanicalItems.filter((i) => i.grade === undefined).length,
      hasIssues: mechanicalItems.some((i) => i.grade === "C" || i.grade === "D" || i.grade === "E"),
    },
    {
      id: 5,
      title: "Sasis & Rangka",
      shortTitle: "Rangka",
      icon: Layers,
      isCompleted: frameItems.every((i) => i.grade !== undefined),
      uninspectedCount: frameItems.filter((i) => i.grade === undefined).length,
      hasIssues: frameItems.some((i) => i.grade === "C" || i.grade === "D" || i.grade === "E"),
    },
    {
      id: 6,
      title: "Uji Jalan (Test Drive)",
      shortTitle: "Test Drive",
      icon: Gauge,
      isCompleted: true,
      hasIssues: testDriveItems.some((i) => i.status === "ISSUE"),
    },
    {
      id: 7,
      title: "Foto & Review",
      shortTitle: "Review",
      icon: Camera,
      isCompleted: grades.ungradedItemsCount === 0 && Boolean(vehicleSpecs),
    },
  ];

  const completionPercentage = Math.round(
    (steps.filter((s) => s.isCompleted).length / steps.length) * 100
  );

  // Build current record object
  const buildCurrentRecord = (status: "DRAFT" | "COMPLETED"): DigitalInspectionRecord => {
    return {
      id: inspectionId,
      vehicleId: vehicleSpecs?.vehicleId || "UNASSIGNED",
      vehicleSpecs: vehicleSpecs || {
        vehicleId: "UNASSIGNED",
        plateNumber: "B 0000 UNK",
        brand: "Unknown",
        model: "Unknown",
        series: "Standard",
        engineCapacityCc: 1500,
        vehicleType: "Passenger",
        transmission: "Automatic",
        year: 2024,
        lastOdometer: inspectionOdometer,
        color: "White",
        bodyModel: "Minibus",
        fuelType: "Bensin",
        vinChassisNumber: "N/A",
        engineNumber: "N/A",
        taxExpiryDate: "2026-12-31",
        ownership: "PT Jaja Rent Indonesia",
      },
      inspectorName,
      inspectionDate,
      inspectionLocation,
      inspectionOdometer,
      inspectorNotes,
      exteriorItems,
      interiorItems,
      mechanicalItems,
      frameItems,
      testDriveItems,
      photos,
      grades,
      status,
      recommendedVehicleStatus:
        grades.overallGrade === "D" || grades.overallGrade === "E" || grades.issuesCount >= 5
          ? "MAINTENANCE"
          : "AVAILABLE",
      createdAt: initialInspection?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Save draft to localStorage and DAL
  const handleSaveDraft = async () => {
    const record = buildCurrentRecord("DRAFT");
    await saveDigitalInspection(record);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(record));
      } catch (e) {
        console.warn(e);
      }
    }

    setDraftToast("Draft inspeksi berhasil disimpan di sistem lokal!");
    setTimeout(() => setDraftToast(null), 3500);
  };

  // Submit Final Inspection
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const record = buildCurrentRecord("COMPLETED");

    await saveDigitalInspection(record);

    // Clear draft storage key on submit
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {
        console.warn(e);
      }
    }

    // Redirect to detail page
    router.push(`/operations/inspections/${record.id}`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {draftToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{draftToast}</span>
          <button
            onClick={() => setDraftToast(null)}
            className="text-neutral-400 hover:text-white ml-2"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Wizard Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
              {inspectionId}
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              {vehicleSpecs ? `${vehicleSpecs.plateNumber} (${vehicleSpecs.brand} ${vehicleSpecs.model})` : "Pilih Unit Kendaraan"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Digital Vehicle Inspection Wizard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            className="text-xs gap-1.5 border-neutral-300"
          >
            <Save className="h-3.5 w-3.5 text-neutral-600" />
            Simpan Draft
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/operations/inspections")}
            className="text-xs text-neutral-600 hover:text-neutral-900"
          >
            Batal & Keluar
          </Button>
        </div>
      </div>

      {/* Step Progress Component */}
      <InspectionProgress
        currentStep={currentStep}
        onStepClick={(s) => setCurrentStep(s)}
        steps={steps}
        completionPercentage={completionPercentage}
      />

      {/* Step Contents */}
      <div className="pt-2">
        {currentStep === 1 && (
          <VehicleSelectionStep
            selectedVehicle={vehicleSpecs}
            onSelectVehicle={setVehicleSpecs}
            inspectorName={inspectorName}
            onChangeInspectorName={setInspectorName}
            inspectionDate={inspectionDate}
            onChangeInspectionDate={setInspectionDate}
            inspectionLocation={inspectionLocation}
            onChangeInspectionLocation={setInspectionLocation}
            inspectionOdometer={inspectionOdometer}
            onChangeInspectionOdometer={setInspectionOdometer}
            inspectorNotes={inspectorNotes}
            onChangeInspectorNotes={setInspectorNotes}
          />
        )}

        {currentStep === 2 && (
          <ChecklistCategoryStep
            title="Pemeriksaan Kondisi Bodi & Eksterior"
            description="Periksa kondisi fisik luar, cat, kaca, lampu, velg, dan ban secara menyeluruh."
            categoryIcon={ShieldCheck}
            items={exteriorItems}
            onChangeItems={setExteriorItems}
          />
        )}

        {currentStep === 3 && (
          <ChecklistCategoryStep
            title="Pemeriksaan Kabin & Interior"
            description="Periksa kebersihan, audio head unit, fungsi AC, jok, sabuk pengaman, plafon, dan doortrim."
            categoryIcon={Armchair}
            items={interiorItems}
            onChangeItems={setInteriorItems}
          />
        )}

        {currentStep === 4 && (
          <ChecklistCategoryStep
            title="Pemeriksaan Mesin, Mekanikal & Kelistrikan"
            description="Periksa volume oli, aki, fan belt, radiator coolant, minyak rem, dan sistem kelistrikan."
            categoryIcon={Wrench}
            items={mechanicalItems}
            onChangeItems={setMechanicalItems}
          />
        )}

        {currentStep === 5 && (
          <ChecklistCategoryStep
            title="Pemeriksaan Struktur Sasis & Rangka"
            description="Pastikan integritas pilar A/B/C, lantai bawah, dudukan radiator, apron, dan rangka bebas bekas benturan berat."
            categoryIcon={Layers}
            items={frameItems}
            onChangeItems={setFrameItems}
          />
        )}

        {currentStep === 6 && (
          <TestDriveStep
            items={testDriveItems}
            onChangeItems={setTestDriveItems}
          />
        )}

        {currentStep === 7 && (
          <div className="space-y-8">
            <PhotoDocumentationStep
              photos={photos}
              onChangePhotos={setPhotos}
            />

            <InspectionReviewStep
              vehicleSpecs={vehicleSpecs}
              inspectorName={inspectorName}
              inspectionDate={inspectionDate}
              inspectionLocation={inspectionLocation}
              inspectionOdometer={inspectionOdometer}
              inspectorNotes={inspectorNotes}
              exteriorItems={exteriorItems}
              interiorItems={interiorItems}
              mechanicalItems={mechanicalItems}
              frameItems={frameItems}
              testDriveItems={testDriveItems}
              photos={photos}
              grades={grades}
              onGoToStep={(s) => setCurrentStep(s)}
              onSaveDraft={handleSaveDraft}
              onSubmitInspection={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </div>

      {/* Floating Bottom Navigation Bar (for steps 1-6) */}
      {currentStep < 7 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 py-3 px-4 sm:px-8 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="text-xs sm:text-sm gap-2 disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                className="text-xs sm:text-sm gap-1.5 border-neutral-300 hidden sm:flex"
              >
                <Save className="h-3.5 w-3.5 text-neutral-600" />
                Simpan Draft
              </Button>

              <Button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
                className="text-xs sm:text-sm gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold"
              >
                Lanjutkan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
