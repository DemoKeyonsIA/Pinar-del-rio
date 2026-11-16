import test from "node:test";
import assert from "node:assert/strict";
import {
  calendarDates,
  itemsOnDate,
  monthItems,
  scopedRequests,
  vacationStats,
  adjacentMonth,
  type VacationItem,
} from "../src/domain/vacationView";
const item = (
  id: string,
  status: VacationItem["status"],
  extra: Partial<VacationItem> = {},
): VacationItem => ({
  id,
  status,
  employeeId: "demo-employee",
  employeeName: "María Pérez",
  startDate: "2026-11-02",
  endDate: "2026-11-06",
  daysTaken: 4,
  scheduledDays: ["2026-11-02", "2026-11-03", "2026-11-05", "2026-11-06"],
  ...extra,
});

test("el calendario respeta días guardados y oculta solicitudes negativas", () => {
  const rows = [
    item("a", "aprobado"),
    item("b", "pendiente", { employeeId: "demo-2" }),
    item("c", "cancelado"),
    item("d", "rechazado"),
  ];
  assert.equal(itemsOnDate(rows, "2026-11-03").length, 2);
  assert.equal(itemsOnDate(rows, "2026-11-04").length, 0);
  assert.equal(monthItems(rows, "2026-11").length, 2);
  assert.equal(monthItems(rows, "2026-12").length, 0);
});
test("el historial y la cola pendiente no se mezclan; búsqueda sin tildes", () => {
  const rows = [
    item("a", "pendiente"),
    item("b", "aprobado"),
    item("c", "disfrutado"),
    item("d", "cancelado"),
    item("e", "rechazado"),
  ];
  assert.deepEqual(
    scopedRequests(rows, "pending").map((v) => v.id),
    ["a"],
  );
  assert.deepEqual(
    scopedRequests(rows, "approved").map((v) => v.id),
    ["b"],
  );
  assert.equal(scopedRequests(rows, "history").length, 3);
  assert.equal(scopedRequests(rows, "all", "maria").length, 5);
  assert.equal(scopedRequests(rows, "all", "no existe").length, 0);
});
test("los contadores distinguen reservas de solicitudes pendientes y cuentan personas únicas", () => {
  const rows = [
    item("a", "aprobado"),
    item("b", "pendiente", { employeeId: "other" }),
    item("c", "aprobado", {
      startDate: "2026-11-16",
      endDate: "2026-11-17",
      scheduledDays: ["2026-11-16", "2026-11-17"],
    }),
    item("d", "aprobado", {
      startDate: "2026-11-23",
      endDate: "2026-11-24",
      scheduledDays: ["2026-11-23", "2026-11-24"],
    }),
  ];
  assert.deepEqual(vacationStats(rows, "2026-11-03"), {
    out: 1,
    pending: 1,
    upcoming: 1,
  });
});
test("la cuadrícula conserva seis semanas y cruza el año correctamente", () => {
  const days = calendarDates("2026-11");
  assert.equal(days.length, 42);
  assert.equal(days[0], "2026-10-26");
  assert.equal(days.at(-1), "2026-12-06");
  assert.equal(adjacentMonth("2026-12", 1), "2027-01");
  assert.equal(adjacentMonth("2026-01", -1), "2025-12");
});
test("los filtros de presentación no alteran la autoría ni el historial original", () => {
  const rows = [
    item("late", "cancelado", {
      startDate: "2026-12-01",
      endDate: "2026-12-02",
    }),
    item("early", "pendiente"),
  ];
  const before = structuredClone(rows);
  scopedRequests(rows, "all");
  monthItems(rows, "2026-11");
  assert.deepEqual(rows, before);
});
