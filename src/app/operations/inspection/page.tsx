"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function LegacyInspectionRedirect() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/operations/inspections");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500 text-xs gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span>Mengarahkan ke modul Digital Vehicle Inspection...</span>
    </div>
  );
}
