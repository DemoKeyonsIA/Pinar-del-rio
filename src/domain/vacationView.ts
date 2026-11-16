import type { Employee, EmployeeVacationRecord } from "../types";
import { dateValue } from "./personnel";

export interface VacationItem extends EmployeeVacationRecord {
  employeeId: string;
  employeeName: string;
}
export type RequestScope = "pending" | "approved" | "history" | "all";
export const vacationLabels: Record<EmployeeVacationRecord["status"], string> =
  {
    pendiente: "Pendiente",
    aprobado: "Aprobada",
    disfrutado: "Disfrutadas",
    rechazado: "Rechazada",
    cancelado: "Cancelada",
  };
export const vacationActions = {
  aprobado: "Aprobar",
  rechazado: "Rechazar",
  cancelado: "Cancelar",
  disfrutado: "Marcar disfrutadas",
} as const;
export const allVacationItems = (employees: Employee[]): VacationItem[] =>
  employees.flatMap((e) =>
    (e.vacationHistory || []).map((v) => ({
      ...v,
      employeeId: e.id,
      employeeName: e.name,
    })),
  );
export const isCalendarItem = (v: VacationItem) =>
  ["pendiente", "aprobado", "disfrutado"].includes(v.status);
export const itemsOnDate = (rows: VacationItem[], date: string) =>
  rows.filter(
    (v) =>
      isCalendarItem(v) &&
      (v.scheduledDays
        ? v.scheduledDays.includes(date)
        : v.startDate <= date && v.endDate >= date),
  );
export function monthItems(rows: VacationItem[], month: string) {
  const start = `${month}-01`,
    d = dateValue(start);
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 12))
    .toISOString()
    .slice(0, 10);
  return rows
    .filter(
      (v) =>
        isCalendarItem(v) &&
        (v.scheduledDays
          ? v.scheduledDays.some((day) => day.startsWith(month))
          : v.startDate <= end && v.endDate >= start),
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}
const searchable = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
export function scopedRequests(
  rows: VacationItem[],
  scope: RequestScope,
  query = "",
) {
  return rows
    .filter(
      (v) =>
        (scope === "all" ||
          (scope === "pending" && v.status === "pendiente") ||
          (scope === "approved" && v.status === "aprobado") ||
          (scope === "history" &&
            ["disfrutado", "rechazado", "cancelado"].includes(v.status))) &&
        searchable(
          `${v.employeeName} ${v.notes || ""} ${v.resolutionReason || ""}`,
        ).includes(searchable(query)),
    )
    .sort((a, b) =>
      scope === "history"
        ? b.startDate.localeCompare(a.startDate)
        : a.startDate.localeCompare(b.startDate),
    );
}
export function calendarDates(month: string): string[] {
  const start = dateValue(`${month}-01`);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + i);
    return day.toISOString().slice(0, 10);
  });
}
export function adjacentMonth(month: string, delta: number) {
  const day = dateValue(`${month}-01`);
  day.setUTCMonth(day.getUTCMonth() + delta);
  return day.toISOString().slice(0, 7);
}
export function vacationStats(rows: VacationItem[], now: string) {
  const limit = dateValue(now);
  limit.setUTCDate(limit.getUTCDate() + 30);
  return {
    out: new Set(
      itemsOnDate(rows, now)
        .filter((v) => v.status !== "pendiente")
        .map((v) => v.employeeId),
    ).size,
    pending: rows.filter((v) => v.status === "pendiente").length,
    upcoming: new Set(
      rows
        .filter(
          (v) =>
            v.status === "aprobado" &&
            v.startDate > now &&
            v.startDate <= limit.toISOString().slice(0, 10),
        )
        .map((v) => v.employeeId),
    ).size,
  };
}
export function availableActions(
  v: VacationItem,
  now: string,
): (keyof typeof vacationActions)[] {
  if (v.status === "pendiente") return ["aprobado", "rechazado", "cancelado"];
  if (v.status === "aprobado")
    return v.endDate <= now ? ["disfrutado", "cancelado"] : ["cancelado"];
  return [];
}
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
export const shortDate = (date: string) =>
  new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(dateValue(date));
export const dateRange = (v: VacationItem) =>
  `${shortDate(v.startDate)} — ${shortDate(v.endDate)}${v.startDate.slice(0, 4) !== v.endDate.slice(0, 4) ? ` · ${v.startDate.slice(0, 4)}/${v.endDate.slice(0, 4)}` : ` · ${v.startDate.slice(0, 4)}`}`;
