import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL_USERS } from "../src/data/mockData";
import { execute, initialState } from "../src/domain/demo";
import {
  createSchedule,
  dayDuration,
  weekFromSchedule,
  vacationBalance,
  vacationDays,
} from "../src/domain/personnel";
const admin = INITIAL_USERS.find((u) => u.role === "admin")!;
const resident = INITIAL_USERS.find((u) => u.role === "resident")!;
function fixture() {
  const state = initialState();
  const employee = state.employees[0];
  employee.schedule = {
    shiftName: "Semana de prueba",
    hoursWeekly: 40,
    daysOff: ["Sábado", "Domingo"],
    monday: "08:00 - 16:00",
    tuesday: "08:00 - 16:00",
    wednesday: "08:00 - 16:00",
    thursday: "08:00 - 16:00",
    friday: "08:00 - 16:00",
    saturday: "Libre",
    sunday: "Libre",
  };
  employee.vacationDaysTotal = 10;
  employee.vacationDaysTaken = 0;
  employee.vacationHistory = [];
  return { state, employee };
}

test("horario personalizado cuenta días libres y turno nocturno", () => {
  const { employee } = fixture();
  const week = weekFromSchedule(employee.schedule);
  week.monday = { off: false, start: "22:00", end: "06:00" };
  week.friday.off = true;
  const schedule = createSchedule("Personalizado", week, "Turno de prueba");
  assert.equal(schedule.hoursWeekly, 32);
  assert.equal(schedule.monday, "22:00 - 06:00");
  assert.ok(schedule.daysOff.includes("Viernes"));
});
test("horarios inválidos y solapamientos semanales se rechazan", () => {
  assert.throws(() =>
    dayDuration({ off: false, start: "25:00", end: "08:00" }),
  );
  assert.throws(() =>
    dayDuration({ off: false, start: "08:00", end: "08:00" }),
  );
  const { employee } = fixture(),
    week = weekFromSchedule(employee.schedule);
  week.sunday = { off: false, start: "23:00", end: "09:00" };
  assert.throws(() => createSchedule("Solapado", week), /superponen/);
});
test("guardar un horario actualiza días, total y trazabilidad del empleado", () => {
  const { state, employee } = fixture(),
    week = weekFromSchedule(employee.schedule);
  week.friday.off = true;
  const next = execute(state, admin, {
    kind: "schedule",
    employeeId: employee.id,
    name: "Cuatro días",
    week,
    notes: "Ajuste de equipo",
  });
  assert.equal(next.employees[0].schedule.hoursWeekly, 32);
  assert.equal(next.employees[0].schedule.friday, "Libre");
  assert.equal(next.audit.at(-1)!.actorId, admin.id);
  assert.ok(
    next.audit.at(-1)!.changes.some((c) => c.field === "schedule.friday"),
  );
  const denied = execute(state, resident, {
    kind: "schedule",
    employeeId: employee.id,
    name: "No permitido",
    week,
    notes: "",
  });
  assert.equal(denied.audit.at(-1)!.outcome, "blocked");
  assert.deepEqual(denied.employees, state.employees);
});
test("vacaciones cuentan días laborables reales y validan fechas", () => {
  const { employee } = fixture();
  assert.equal(vacationDays(employee, "2026-11-02", "2026-11-08"), 5);
  assert.throws(() => vacationDays(employee, "2026-02-30", "2026-03-03"));
  assert.throws(() => vacationDays(employee, "2026-11-08", "2026-11-02"));
  assert.throws(() => vacationDays(employee, "2026-11-07", "2026-11-08"));
});
test("aprobar reserva saldo y cancelar lo libera sin sumar días disfrutados", () => {
  const { state, employee } = fixture();
  const request = execute(state, admin, {
    kind: "vacation",
    employeeId: employee.id,
    startDate: "2026-11-02",
    endDate: "2026-11-06",
    notes: "Prueba",
  });
  const id = request.employees[0].vacationHistory![0].id;
  assert.equal(vacationBalance(request.employees[0]).reserved, 0);
  const approved = execute(request, admin, {
    kind: "resolveVacation",
    employeeId: employee.id,
    id,
    status: "aprobado",
    reason: "Cobertura confirmada",
  });
  assert.deepEqual(vacationBalance(approved.employees[0]), {
    total: 10,
    taken: 0,
    reserved: 5,
    available: 5,
  });
  const cancelled = execute(approved, admin, {
    kind: "resolveVacation",
    employeeId: employee.id,
    id,
    status: "cancelado",
    reason: "Reprogramación",
  });
  assert.deepEqual(vacationBalance(cancelled.employees[0]), {
    total: 10,
    taken: 0,
    reserved: 0,
    available: 10,
  });
  assert.equal(cancelled.audit.at(-1)!.reason, "Reprogramación");
});
test("marcar disfrutadas descuenta una sola vez y conserva el horario usado al solicitar", () => {
  const { state, employee } = fixture();
  const request = execute(state, admin, {
    kind: "vacation",
    employeeId: employee.id,
    startDate: "2025-11-03",
    endDate: "2025-11-07",
    notes: "Histórico de prueba",
  });
  const id = request.employees[0].vacationHistory![0].id;
  const approved = execute(request, admin, {
    kind: "resolveVacation",
    employeeId: employee.id,
    id,
    status: "aprobado",
    reason: "Revisión histórica",
  });
  const complete = execute(approved, admin, {
    kind: "resolveVacation",
    employeeId: employee.id,
    id,
    status: "disfrutado",
    reason: "Regreso confirmado",
  });
  assert.deepEqual(vacationBalance(complete.employees[0]), {
    total: 10,
    taken: 5,
    reserved: 0,
    available: 5,
  });
  assert.equal(
    complete.employees[0].vacationHistory![0].scheduledDays!.length,
    5,
  );
  const again = execute(complete, admin, {
    kind: "resolveVacation",
    employeeId: employee.id,
    id,
    status: "disfrutado",
    reason: "Doble clic",
  });
  assert.equal(again.audit.at(-1)!.outcome, "blocked");
  assert.equal(again.employees[0].vacationDaysTaken, 5);
});
test("solicitudes solapadas o sin saldo no cambian el historial", () => {
  const { state, employee } = fixture();
  const requested = execute(state, admin, {
    kind: "vacation",
    employeeId: employee.id,
    startDate: "2026-11-02",
    endDate: "2026-11-06",
    notes: "",
  });
  const overlap = execute(requested, admin, {
    kind: "vacation",
    employeeId: employee.id,
    startDate: "2026-11-05",
    endDate: "2026-11-09",
    notes: "",
  });
  assert.equal(overlap.audit.at(-1)!.outcome, "blocked");
  assert.equal(overlap.employees[0].vacationHistory!.length, 1);
  const insufficient = execute(state, admin, {
    kind: "vacation",
    employeeId: employee.id,
    startDate: "2026-11-02",
    endDate: "2026-11-30",
    notes: "",
  });
  assert.equal(insufficient.audit.at(-1)!.outcome, "blocked");
});
test("la ficha genérica no puede alterar el contador de vacaciones", () => {
  const { state, employee } = fixture();
  const denied = execute(state, admin, {
    kind: "save",
    collection: "employees",
    value: { ...employee, vacationDaysTaken: 5 },
  });
  assert.equal(denied.audit.at(-1)!.outcome, "blocked");
  assert.equal(denied.employees[0].vacationDaysTaken, 0);
});
test("las nuevas boletas conservan la identidad del momento del cálculo", () => {
  const { state, employee } = fixture();
  const next = execute(state, admin, {
    kind: "payroll",
    period: "Prueba de identidad",
  });
  const slip = next.employees[0].payslips[0];
  assert.equal(slip.employeeName, employee.name);
  assert.equal(slip.employeeIdentification, employee.idNumber);
  next.employees[0].name = "Nombre actualizado";
  assert.equal(slip.employeeName, employee.name);
});
