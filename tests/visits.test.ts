import test from "node:test";
import assert from "node:assert/strict";
import { execute, initialState, today, type Command } from "../src/domain/demo";
import { INITIAL_USERS } from "../src/data/mockData";
const resident = INITIAL_USERS.find((u) => u.role === "resident")!;
const other = INITIAL_USERS.find(
  (u) => u.role === "resident" && u.id !== resident.id,
)!;
const input = (): Command => ({
  kind: "approveVisit",
  unitId: resident.unitId!,
  name: "  Visita de prueba  ",
  date: today(),
  plate: " abc-123 ",
  notes: "Datos ficticios",
});
test("aprobar visita conserva autoría y se limita a la filial del residente", () => {
  const before = initialState();
  const next = execute(before, resident, input());
  const visit = next.units.find((u) => u.id === resident.unitId)!
    .approvedVisits![0];
  assert.equal(visit.name, "Visita de prueba");
  assert.equal(visit.plate, "ABC-123");
  assert.equal(visit.approvedById, resident.id);
  assert.equal(next.audit.at(-1)?.entityId, resident.unitId);
  assert.equal(next.audit.at(-1)?.action, "Aprobar visita");
  assert.equal(
    before.units.find((u) => u.id === resident.unitId)?.approvedVisits,
    undefined,
  );
  const denied = execute(before, other, input());
  assert.equal(denied.audit.at(-1)?.outcome, "blocked");
  assert.deepEqual(denied.units, before.units);
});
test("duplicados, fechas pasadas o imposibles no generan autorizaciones", () => {
  const state = execute(initialState(), resident, input());
  const duplicate = execute(state, resident, input());
  assert.equal(duplicate.audit.at(-1)?.outcome, "blocked");
  for (const date of ["2020-01-01", "2099-02-30"]) {
    const command = input();
    if (command.kind !== "approveVisit") return;
    command.date = date;
    const result = execute(state, resident, command);
    assert.equal(result.audit.at(-1)?.outcome, "blocked");
    assert.deepEqual(result.units, state.units);
  }
});
test("revocar exige motivo y conserva la aprobación original", () => {
  const state = execute(initialState(), resident, input());
  const visit = state.units.find((u) => u.id === resident.unitId)!
    .approvedVisits![0];
  const command: Command = {
    kind: "revokeVisit",
    unitId: resident.unitId!,
    id: visit.id,
    reason: "Cambio de planes",
  };
  assert.equal(
    execute(state, resident, { ...command, reason: " " }).audit.at(-1)?.outcome,
    "blocked",
  );
  assert.equal(execute(state, other, command).audit.at(-1)?.outcome, "blocked");
  const next = execute(state, resident, command);
  const revoked = next.units.find((u) => u.id === resident.unitId)!
    .approvedVisits![0];
  assert.equal(revoked.status, "revoked");
  assert.equal(revoked.approvedAt, visit.approvedAt);
  assert.equal(revoked.revokedBy, resident.name);
  assert.equal(next.audit.at(-1)?.reason, "Cambio de planes");
  assert.equal(
    execute(next, resident, command).audit.at(-1)?.outcome,
    "blocked",
  );
});
test("la ficha genérica no permite manipular o borrar el historial de visitas", () => {
  const state = execute(initialState(), resident, input());
  const unit = state.units.find((u) => u.id === resident.unitId)!;
  const admin = INITIAL_USERS.find((u) => u.role === "admin")!;
  for (const actor of [resident, admin]) {
    const next = execute(state, actor, {
      kind: "save",
      collection: "units",
      value: { ...unit, approvedVisits: [] },
    });
    assert.equal(next.audit.at(-1)?.outcome, "blocked");
    assert.deepEqual(next.units, state.units);
  }
});
