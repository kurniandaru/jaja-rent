import { ScheduleEvent, ScheduleEventType } from "../types/schedule";
import { mockScheduleEvents } from "../mock-data/schedules";

const cachedSchedules: ScheduleEvent[] = [...mockScheduleEvents];

export async function getScheduleEvents(
  filterType?: ScheduleEventType | "ALL",
): Promise<ScheduleEvent[]> {
  if (!filterType || filterType === "ALL") {
    return cachedSchedules.sort((a, b) => a.date.localeCompare(b.date));
  }
  return cachedSchedules
    .filter((e) => e.type === filterType)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getScheduleEventsByDate(
  dateStr: string,
): Promise<ScheduleEvent[]> {
  return cachedSchedules.filter((e) => e.date === dateStr);
}

export async function getScheduleEventsByMonth(
  year: number,
  month: number,
): Promise<ScheduleEvent[]> {
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  return cachedSchedules.filter((e) => e.date.startsWith(monthStr));
}
