"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CorporateAllocationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/operations/contracts");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[300px] text-xs text-neutral-500">
      Mengarahkan ke modul Corporate Contracts & Allocation...
    </div>
  );
}
