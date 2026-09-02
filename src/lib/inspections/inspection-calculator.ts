import {
  InspectionGrade,
  InspectionItem,
  TestDriveItem,
  GradeSummary,
} from "@/lib/types/inspection";

export const GRADE_SCORE_MAP: Record<InspectionGrade, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
};

export const SCORE_GRADE_THRESHOLDS = [
  { min: 4.5, grade: "A" as InspectionGrade },
  { min: 3.5, grade: "B" as InspectionGrade },
  { min: 2.5, grade: "C" as InspectionGrade },
  { min: 1.5, grade: "D" as InspectionGrade },
  { min: 0.0, grade: "E" as InspectionGrade },
];

export function scoreToGrade(score: number): InspectionGrade {
  for (const t of SCORE_GRADE_THRESHOLDS) {
    if (score >= t.min) return t.grade;
  }
  return "E";
}

export function calculateCategoryGrade(
  items: InspectionItem[],
): InspectionGrade {
  const gradedItems = items.filter((item) => item.grade !== undefined);
  if (gradedItems.length === 0) return "A";

  const totalScore = gradedItems.reduce((acc, item) => {
    return acc + (GRADE_SCORE_MAP[item.grade || "A"] || 5);
  }, 0);

  const avg = totalScore / gradedItems.length;
  return scoreToGrade(avg);
}

export function calculateGradeSummary(
  exteriorItems: InspectionItem[],
  interiorItems: InspectionItem[],
  mechanicalItems: InspectionItem[],
  frameItems: InspectionItem[],
  testDriveItems: TestDriveItem[],
): GradeSummary {
  const allItems = [
    ...exteriorItems,
    ...interiorItems,
    ...mechanicalItems,
    ...frameItems,
  ];

  const totalItems = allItems.length;
  const gradedItems = allItems.filter((i) => i.grade !== undefined);
  const gradedItemsCount = gradedItems.length;
  const ungradedItemsCount = totalItems - gradedItemsCount;

  let gradeACount = 0;
  let gradeBCount = 0;
  let gradeCCount = 0;
  let gradeDCount = 0;
  let gradeECount = 0;

  allItems.forEach((item) => {
    if (item.grade === "A") gradeACount++;
    else if (item.grade === "B") gradeBCount++;
    else if (item.grade === "C") gradeCCount++;
    else if (item.grade === "D") gradeDCount++;
    else if (item.grade === "E") gradeECount++;
  });

  const testDriveIssues = testDriveItems.filter((t) => t.status === "ISSUE");
  const testDriveStatus = testDriveIssues.length > 0 ? "HAS_ISSUES" : "NORMAL";

  // Issues count includes C, D, E items plus test drive issues
  const issuesCount =
    gradeCCount + gradeDCount + gradeECount + testDriveIssues.length;

  // Category grades
  const exteriorGrade = calculateCategoryGrade(exteriorItems);
  const interiorGrade = calculateCategoryGrade(interiorItems);
  const mechanicalGrade = calculateCategoryGrade(mechanicalItems);
  const frameGrade = calculateCategoryGrade(frameItems);

  // Weighted average: Mechanical (30%), Frame (25%), Exterior (25%), Interior (20%)
  const extScore = GRADE_SCORE_MAP[exteriorGrade];
  const intScore = GRADE_SCORE_MAP[interiorGrade];
  const mechScore = GRADE_SCORE_MAP[mechanicalGrade];
  const frameScore = GRADE_SCORE_MAP[frameGrade];

  const weightedScore =
    mechScore * 0.3 + frameScore * 0.25 + extScore * 0.25 + intScore * 0.2;

  // Safety overrides:
  // 1. If any Frame item is Grade E or D, chassis damage prevents Grade A or B
  const hasSevereFrameDamage = frameItems.some((f) => f.grade === "E");
  const hasModerateFrameDamage = frameItems.some((f) => f.grade === "D");

  // 2. If test drive has severe brake/steering issues
  const hasSevereTestDriveIssues = testDriveItems.some(
    (td) =>
      td.status === "ISSUE" &&
      (td.id === "td_brake_performance" ||
        td.id === "td_steering_noise" ||
        td.id === "td_at_shift_jump"),
  );

  let overallGrade = scoreToGrade(weightedScore);

  if (hasSevereFrameDamage || hasSevereTestDriveIssues) {
    if (overallGrade === "A" || overallGrade === "B" || overallGrade === "C") {
      overallGrade = "D";
    }
  } else if (hasModerateFrameDamage) {
    if (overallGrade === "A" || overallGrade === "B") {
      overallGrade = "C";
    }
  }

  const scorePercentage = Math.round((weightedScore / 5) * 100);

  return {
    overallGrade,
    exteriorGrade,
    interiorGrade,
    mechanicalGrade,
    frameGrade,
    testDriveStatus,
    totalItems,
    gradedItemsCount,
    ungradedItemsCount,
    gradeACount,
    gradeBCount,
    gradeCCount,
    gradeDCount,
    gradeECount,
    issuesCount,
    scorePercentage,
  };
}

export function getGradeColor(grade: InspectionGrade): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  label: string;
} {
  switch (grade) {
    case "A":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        badge: "bg-emerald-600 text-white",
        label: "Sangat Baik",
      };
    case "B":
      return {
        bg: "bg-teal-50",
        text: "text-teal-700",
        border: "border-teal-200",
        badge: "bg-teal-600 text-white",
        label: "Baik",
      };
    case "C":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        badge: "bg-amber-500 text-white",
        label: "Cukup",
      };
    case "D":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        badge: "bg-orange-500 text-white",
        label: "Kurang Baik",
      };
    case "E":
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        badge: "bg-rose-600 text-white",
        label: "Buruk / Perlu Perbaikan",
      };
    default:
      return {
        bg: "bg-neutral-50",
        text: "text-neutral-700",
        border: "border-neutral-200",
        badge: "bg-neutral-600 text-white",
        label: "Belum Diisi",
      };
  }
}
