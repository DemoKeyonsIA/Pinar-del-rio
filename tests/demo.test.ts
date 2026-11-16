import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL_USERS } from "../src/data/mockData";
import {
  execute,
  initialState,
  today,
  uid,
  type DemoState,
} from "../src/domain/demo";
import type { PaymentRecord } from "../src/types";
const admin = INITIAL_USERS.find((u) => u.role === "admin")!;
const resident = INITIAL_USERS.find((u) => u.role === "resident")!;
const board = INITIAL_USERS.find((u) => u.role === "board")!;
const pending = (s: DemoState) =>
  s.payments.find((p) => p.status === "pending_validation")!;
const payment = (s: DemoState, amount = 10000): PaymentRecord => ({
  id: uid(),
  unitId: s.units[0].id,
  unitNumber: s.units[0].number,
  payerName: "Persona demo",
  payerEmail: "demo@example.com",
  amount,
  reference: uid(),
  method: "cash",
  date: today(),
  concept: "Prueba",
  status: "applied",
});

test("el escenario inicial concilia deuda de filiales con facturas pendientes", () => {
  const s = initialState();
  for (const u of s.units) {
    const debt = s.invoices
      .filter((i) => i.unitId === u.id && i.status !== "paid")
      .reduce((n, i) => n + i.total - (i.paidAmount || 0), 0);
    assert.equal(debt, Math.max(0, u.currentBalance));
  }
});
test("validar dos veces no vuelve a descontar y registra el intento", () => {
  const s = initialState(),
    p = pending(s),
    before = s.units.find((u) => u.id === p.unitId)!.currentBalance;
  const once = execute(s, admin, { kind: "applyPayment", id: p.id });
  const twice = execute(once, admin, { kind: "applyPayment", id: p.id });
  assert.equal(
    twice.units.find((u) => u.id === p.unitId)!.currentBalance,
    before - p.amount,
  );
  assert.equal(twice.audit.at(-1)!.outcome, "blocked");
  assert.equal(s.units.find((u) => u.id === p.unitId)!.currentBalance, before);
});
test("un pago parcial y su reversión concilian factura y saldo", () => {
  const s = initialState(),
    p = payment(s, 10000);
  const paid = execute(s, admin, { kind: "cash", value: p });
  const invoice = paid.invoices.find(
    (i) => i.unitId === p.unitId && i.status !== "paid",
  )!;
  assert.equal(invoice.paidAmount, 10000);
  const reversed = execute(paid, admin, {
    kind: "reversePayment",
    id: p.id,
    reason: "Corrección de referencia",
  });
  assert.equal(reversed.units[0].currentBalance, s.units[0].currentBalance);
  assert.equal(
    reversed.invoices.find((i) => i.id === invoice.id)!.paidAmount,
    0,
  );
  assert.equal(reversed.audit.at(-1)!.reason, "Corrección de referencia");
});
test("los excedentes se conservan como crédito a favor", () => {
  const s = initialState(),
    p = payment(s, s.units[0].currentBalance + 1234.5);
  const n = execute(s, admin, { kind: "cash", value: p });
  assert.equal(n.units[0].currentBalance, -1234.5);
  assert.equal(n.units[0].arrearsStatus, "up_to_date");
});
test("importación repetida omite duplicados y mantiene balance", () => {
  const s = initialState(),
    p = payment(s);
  const n = execute(s, admin, {
    kind: "import",
    collection: "payments",
    rows: [p, p],
  });
  const again = execute(n, admin, {
    kind: "import",
    collection: "payments",
    rows: [p],
  });
  assert.equal(n.payments.length, s.payments.length + 1);
  assert.equal(again.units[0].currentBalance, n.units[0].currentBalance);
  assert.match(again.audit.at(-1)!.summary, /0 registros importados/);
  assert.equal(p.id === n.payments[0].id, false);
  const importEvent = n.audit.at(-1)!;
  assert.ok(
    n.audit.some(
      (e) =>
        e.entityId === n.payments[0].id &&
        e.operationId === importEvent.operationId,
    ),
  );
});
test("una fila inválida revierte el lote completo", () => {
  const s = initialState(),
    p = payment(s);
  const n = execute(s, admin, {
    kind: "import",
    collection: "payments",
    rows: [p, { ...p, reference: uid(), amount: NaN }],
  });
  assert.deepEqual(n.payments, s.payments);
  assert.deepEqual(n.units, s.units);
  assert.equal(n.audit.length, 1);
  assert.equal(n.audit[0].outcome, "blocked");
});
test("permisos de residente se aplican en dominio y no solo en botones", () => {
  const s = initialState();
  const n = execute(s, resident, { kind: "applyPayment", id: pending(s).id });
  assert.deepEqual(n.payments, s.payments);
  assert.equal(n.audit.at(-1)!.actorId, resident.id);
  assert.equal(n.audit.at(-1)!.outcome, "blocked");
  const changed = execute(s, resident, {
    kind: "save",
    collection: "units",
    value: { ...s.units[0], currentBalance: 0 },
  });
  assert.equal(changed.audit.at(-1)!.outcome, "blocked");
});
test("cuotas masivas conservan antes/después e historia por filial", () => {
  const s = initialState(),
    n = execute(s, admin, { kind: "quota", amount: 123456 });
  assert.ok(n.units.every((u) => u.monthlyQuota === 123456));
  for (const u of s.units)
    assert.ok(
      n.audit.some(
        (e) =>
          e.entityId === u.id &&
          e.changes.some((c) => c.field === "monthlyQuota"),
      ),
    );
  assert.deepEqual(
    n.audit.map((e) => e.sequence),
    n.audit.map((_, i) => i + 1),
  );
});
test("planilla usa suma de boletas y bloquea repetir período", () => {
  const s = initialState(),
    period = "Período de prueba";
  const n = execute(s, admin, { kind: "payroll", period });
  const slips = n.employees.flatMap((e) =>
    e.payslips.filter((p) => p.period === period),
  );
  const run = n.payrollRuns[0];
  assert.equal(
    run.totalNetPaid,
    slips.reduce((v, p) => v + p.netSalary, 0),
  );
  assert.equal(
    run.totalWorkerDeductions,
    slips.reduce((v, p) => v + p.workerCCSSDeduction, 0),
  );
  assert.equal(run.sicereExportGenerated, false);
  assert.ok(slips.every((p) => p.status === "pendiente" && !p.bankReference));
  const twice = execute(n, admin, { kind: "payroll", period });
  assert.equal(twice.payrollRuns.length, n.payrollRuns.length);
  assert.equal(twice.audit.at(-1)!.outcome, "blocked");
});
test("reserva conflictiva no se confirma", () => {
  const s = initialState(),
    a = s.amenities[0];
  const value = {
    id: uid(),
    amenityId: a.id,
    amenityName: a.name,
    unitNumber: s.units[0].number,
    residentName: resident.name,
    date: today(),
    timeSlot: a.reservationSlots[0],
    guestsCount: 2,
    status: "confirmed" as const,
    createdAt: today(),
  };
  const n = execute(s, resident, { kind: "reservation", value });
  assert.equal(n.audit.at(-1)!.outcome, "success");
  const again = execute(n, resident, {
    kind: "reservation",
    value: { ...value, id: uid() },
  });
  assert.equal(again.reservations.length, n.reservations.length);
  assert.equal(again.audit.at(-1)!.outcome, "blocked");
});
test("decisiones de junta exigen acta y motivo", () => {
  const s = initialState(),
    id = s.tickets[0].id;
  const blocked = execute(s, board, {
    kind: "boardDecision",
    id,
    approved: true,
    acta: "",
    reason: "",
  });
  assert.equal(blocked.audit.at(-1)!.outcome, "blocked");
  const n = execute(s, board, {
    kind: "boardDecision",
    id,
    approved: true,
    acta: "JD-DEMO-01",
    reason: "Revisión de presupuesto",
  });
  assert.equal(n.tickets[0].boardApproval, "Aprobado");
  assert.equal(n.audit.at(-1)!.actorId, board.id);
});
test("cambiar de perfil no reasigna la autoría histórica", () => {
  const s = initialState(),
    n = execute(s, admin, { kind: "session", user: admin });
  const changed = execute(n, board, {
    kind: "session",
    user: board,
    previous: admin,
  });
  const sessions=changed.audit.filter(e=>e.action==='Entrar / cambiar perfil');
  assert.equal(sessions[0].actorId, admin.id);
  assert.equal(sessions[1].actorId, board.id);
  assert.equal(changed.sessionId, s.sessionId);
});

test("la planilla incluye extras, ausencias y deducciones sin descuadrar totales", () => {
  const s = initialState();
  const e = s.employees.find((e) => e.status === "activo")!;
  e.payrollExtras = 12000;
  e.payrollDeductions = 5000;
  e.unworkedDays = 1;
  const n = execute(s, admin, {
    kind: "payroll",
    period: "Prueba con novedades",
  });
  const slip = n.employees.find((x) => x.id === e.id)!.payslips[0];
  assert.equal(slip.overtimeAmount, 12000);
  assert.equal(slip.otherDeductions, 5000);
  assert.equal(slip.unworkedDays, 1);
  assert.equal(
    slip.netSalary,
    Math.round(
      (slip.subtotal! -
        slip.unworkedDaysDeduction! -
        slip.workerCCSSDeduction -
        5000) *
        100,
    ) / 100,
  );
  assert.equal(
    n.payrollRuns[0].totalGross,
    n.employees
      .flatMap((e) =>
        e.payslips.filter((p) => p.period === "Prueba con novedades"),
      )
      .reduce((n, p) => n + p.subtotal! - p.unworkedDaysDeduction!, 0),
  );
});

test("los comunicados programados se publican con autoría del sistema", () => {
  const s = initialState();
  s.news[0].status = "scheduled";
  s.news[0].publishScheduleDate = today();
  const n = execute(s, admin, { kind: "session", user: admin });
  assert.equal(n.news[0].status, "active");
  const event = n.audit.find((e) => e.action === "Publicar por fecha")!;
  assert.equal(event.actorId, "system");
  assert.equal(event.origin, "system");
});

test("una filial importada conserva su deuda en una factura de apertura", () => {
  const s = initialState();
  const row = {
    ...s.units[0],
    id: uid(),
    number: "Filial DEMO NUEVA",
    currentBalance: 12500,
  };
  const n = execute(s, admin, {
    kind: "import",
    collection: "units",
    rows: [row],
  });
  const unit = n.units.find((u) => u.number === row.number)!;
  assert.equal(n.invoices.find((i) => i.unitId === unit.id)!.total, 12500);
});
