import { NextResponse } from "next/server";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "healthy";
  let storageStatus = "healthy";
  let queueStatus = "healthy";

  // 1. Check Database Connectivity
  try {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { error } = await (supabase as any)
        .from("vehicles")
        .select("id")
        .limit(1);
      if (error) {
        dbStatus = "degraded";
      }
    }
  } catch {
    dbStatus = "degraded";
  }

  // 2. Overall Status Evaluation
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
  if (dbStatus === "unhealthy" || storageStatus === "unhealthy") {
    overallStatus = "unhealthy";
  } else if (dbStatus === "degraded" || storageStatus === "degraded") {
    overallStatus = "degraded";
  }

  const responseTimeMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: overallStatus,
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      responseTimeMs,
      services: {
        application: { status: "healthy" },
        database: { status: dbStatus },
        storage: { status: storageStatus },
        queue: { status: queueStatus },
      },
    },
    { status: overallStatus === "unhealthy" ? 503 : 200 },
  );
}
