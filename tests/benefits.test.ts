import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBenefit,
  benefitMonths,
  type BenefitInput,
} from "../src/domain/benefits";
import { execute, initialState } from "../src/domain/demo";
import { INITIAL_USERS } from "../src/data/mockData";
const admin = INITIAL_USERS.find((u) => u.role === "admin")!;
const resident = INITIAL_USERS.find((u) => u.role === "resident")!;
const fixture = (): BenefitInput => ({
  type: "aguinaldo",
  employeeId: initialState().employees[0].id,
  startDate: "2025-12-01",
  endDate: "2026-11-30",
  salaries: Array(12).fill(600000),
  reason: "renuncia",
  averageMonthly: 0,
  vacationDaily: 0,
  vacationDays: 0,
  noticeDays: 0,
  severanceDays: 0,
  notes: "Salarios de ejemplo revisados.",
});

test("aguinaldo usa ingresos reales divididos entre doce aun con período parcial", () => {
  const input = fixture();
  input.startDate = "2026-09-01";
  input.salaries = [...Array(9).fill(0), 600000, 630000, 570000];
  assert.equal(calculateBenefit(input).aguinaldo, 150000);
  assert.equal(calculateBenefit(input).total, 150000);
});
test("ciclo diciembre-noviembre y liquidación no incluyen meses futuros", () => {
  assert.equal(benefitMonths("2026-11-30")[0], "2025-12");
  assert.equal(benefitMonths("2026-12-01")[0], "2026-12");
  const input = fixture();
  input.type = "liquidacion";
  input.endDate = "2026-09-15";
  assert.throws(() => calculateBenefit(input), /fuera/);
  input.salaries = [...Array(10).fill(600000), 0, 0];
  assert.equal(calculateBenefit(input).aguinaldo, 500000);
});
test("liquidación distingue bases de vacaciones e indemnizaciones y suma rubros redondeados", () => {
  const input = fixture();
  Object.assign(input, {
    type: "liquidacion",
    reason: "con_responsabilidad",
    averageMonthly: 660000,
    vacationDaily: 21000,
    vacationDays: 10,
    noticeDays: 30,
    severanceDays: 40,
  });
  assert.deepEqual(calculateBenefit(input), {
    salaryTotal: 7200000,
    aguinaldo: 600000,
    vacations: 210000,
    notice: 660000,
    severance: 880000,
    total: 2350000,
  });
  input.reason = "renuncia";
  assert.throws(() => calculateBenefit(input), /corresponden/);
  input.noticeDays = 0;
  input.severanceDays = 0;
  assert.equal(calculateBenefit(input).total, 810000);
});
test("rechaza fechas imposibles, cifras no finitas, valores negativos y parámetros sin fundamento", () => {
  for (const patch of [
    { startDate: "2026-02-30" },
    { salaries: [NaN, ...Array(11).fill(0)] },
    { vacationDays: -1 },
    { notes: " " },
    { endDate: "2026-10-31" },
  ])
    assert.throws(() => calculateBenefit({ ...fixture(), ...patch }));
});
test("guardar conserva identidad, autoría y resultado sin alterar planilla ni vacaciones", () => {
  const state = initialState(),
    input = fixture();
  const next = execute(state, admin, { kind: "benefit", input });
  assert.equal(next.benefits?.length, 1);
  assert.equal(next.benefits![0].createdBy, admin.name);
  assert.equal(next.benefits![0].employeeName, state.employees[0].name);
  input.salaries[0] = 0;
  assert.equal(next.benefits![0].input.salaries[0], 600000);
  assert.deepEqual(next.employees, state.employees);
  assert.deepEqual(next.payrollRuns, state.payrollRuns);
  assert.equal(next.audit.at(-1)?.outcome, "success");
});
test("bloquea duplicados y permisos; anular permite reemplazo y conserva el anterior", () => {
  const state = execute(initialState(), admin, {
    kind: "benefit",
    input: fixture(),
  });
  const duplicate = execute(state, admin, {
    kind: "benefit",
    input: fixture(),
  });
  assert.equal(duplicate.benefits!.length, 1);
  assert.equal(duplicate.audit.at(-1)?.outcome, "blocked");
  const forbidden = execute(state, resident, {
    kind: "benefit",
    input: fixture(),
  });
  assert.equal(forbidden.audit.at(-1)?.outcome, "blocked");
  const id = state.benefits![0].id;
  const confirmed = execute(state, admin, {
    kind: "resolveBenefit",
    id,
    status: "confirmado",
    reason: "Revisado",
  });
  assert.equal(confirmed.benefits![0].status, "confirmado");
  const twice = execute(confirmed, admin, {
    kind: "resolveBenefit",
    id,
    status: "confirmado",
    reason: "Repetido",
  });
  assert.equal(twice.audit.at(-1)?.outcome, "blocked");
  const voided = execute(confirmed, admin, {
    kind: "resolveBenefit",
    id,
    status: "anulado",
    reason: "Corrección de base",
  });
  const replaced = execute(voided, admin, {
    kind: "benefit",
    input: fixture(),
  });
  assert.equal(replaced.benefits!.length, 2);
  assert.equal(replaced.benefits![1].resolutionReason, "Corrección de base");
});
