import test from "node:test";
import assert from "node:assert/strict";
import {
  execute,
  initialState,
  today,
  type Command,
  type DemoState,
} from "../src/domain/demo";
import {
  adQuote,
  adIsVisible,
  mutateAdvertisement,
  type AdInput,
} from "../src/domain/advertising";
import { INITIAL_USERS } from "../src/data/mockData";
const admin = INITIAL_USERS.find((u) => u.role === "admin")!;
const resident = INITIAL_USERS.find((u) => u.role === "resident")!;
const other = INITIAL_USERS.find(
  (u) => u.role === "resident" && u.id !== resident.id,
)!;
function fixture(paid = 100000) {
  const s = initialState();
  s.adPolicy = {
    preferential: 1000,
    general: 2500,
    durationDays: 7,
    version: 1,
  };
  s.invoices = [
    {
      ...s.invoices[0],
      id: "CUOTA-TEST",
      unitId: resident.unitId!,
      issueDate: today().slice(0, 7) + "-01",
      total: 100000,
      paidAmount: paid,
      status: paid === 100000 ? "paid" : "pending",
      allocations: [],
    },
  ];
  return s;
}
function input(title = "Anuncio de prueba"): AdInput {
  return {
    advertiser: "Negocio ficticio",
    title,
    category: "Servicios",
    content: "Un anuncio ficticio para las pruebas de dominio.",
    contact: "demo@ejemplo.test",
    month: today().slice(0, 7),
    image: "",
    unitId: resident.unitId,
  };
}
function ok(s: DemoState, command: Command, actor = admin) {
  const next = execute(s, actor, command);
  assert.equal(
    next.audit.at(-1)?.outcome,
    "success",
    next.audit.at(-1)?.reason,
  );
  return next;
}
function submit(s: DemoState, external = false) {
  const data = input();
  if (external) delete data.unitId;
  return ok(
    s,
    { kind: "adSave", input: data, submit: true },
    external ? admin : resident,
  );
}
function decision(
  s: DemoState,
  id: string,
  action: "approve" | "publish" | "changes" | "quote" | "withdraw",
) {
  return ok(s, {
    kind: "adDecision",
    id,
    decision: action,
    reason: "Decisión ficticia revisada",
  });
}

test("tarifas distinguen 50 %, cuota completa y externos con pagos aplicados al mes", () => {
  for (const [paid, tier, amount] of [
    [49999, "general", 2500],
    [50000, "preferential", 1000],
    [99999, "preferential", 1000],
    [100000, "benefit", 0],
  ] as const) {
    const s = fixture(paid),
      quote = adQuote(s, resident.unitId, today().slice(0, 7), "now");
    assert.equal(quote.tier, tier);
    assert.equal(quote.amount, amount);
  }
  const s = fixture();
  assert.equal(
    adQuote(s, undefined, today().slice(0, 7), "now").tier,
    "general",
  );
  assert.equal(adQuote(s, resident.unitId, "2099-01", "now").percent, 0);
  delete s.adPolicy;
  assert.equal(adQuote(s, undefined, today().slice(0, 7), "now").amount, null);
});
test("enviar y aprobar contenido jamás publican ni consumen el beneficio", () => {
  let s = submit(fixture());
  const id = s.advertisements![0].id;
  assert.equal(s.advertisements![0].status, "submitted");
  assert.equal(s.advertisements![0].benefitConsumedAt, undefined);
  s = decision(s, id, "approve");
  s = ok(s, {
    kind: "record",
    module: "Demo",
    action: "Revisar estado",
    entityId: id,
    summary: "Prueba",
  });
  assert.equal(s.advertisements![0].status, "approved");
  assert.equal(adIsVisible(s.advertisements![0], today()), false);
  assert.equal(s.news.length, initialState().news.length);
});
test("solo administración publica; el beneficio mensual es único y no se libera al retirar", () => {
  let s = submit(fixture());
  const first = s.advertisements![0].id;
  s = decision(s, first, "approve");
  assert.equal(
    execute(s, resident, {
      kind: "adDecision",
      id: first,
      decision: "publish",
      reason: "Prueba",
    }).audit.at(-1)?.outcome,
    "blocked",
  );
  s = submit(s);
  const second = s.advertisements![0].id;
  s = decision(s, second, "approve");
  s = decision(s, first, "publish");
  assert.equal(
    adIsVisible(
      s.advertisements!.find((a) => a.id === first)!,
      today(),
    ),
    true,
  );
  const duplicate = execute(s, admin, {
    kind: "adDecision",
    id: second,
    decision: "publish",
    reason: "Prueba",
  });
  assert.equal(duplicate.audit.at(-1)?.outcome, "blocked");
  s = decision(s, first, "withdraw");
  s = decision(s, second, "quote");
  assert.equal(
    s.advertisements!.find((a) => a.id === second)!.quote.tier,
    "preferential",
  );
});
test("pago publicitario requiere contenido aprobado y validación; no reduce deuda ni publica", () => {
  let s = submit(fixture(0), true);
  const id = s.advertisements![0].id;
  const pay: Command = {
    kind: "adPayment",
    id,
    reference: "PUBLICIDAD-01",
    proof: "",
  };
  assert.equal(execute(s, admin, pay).audit.at(-1)?.outcome, "blocked");
  s = decision(s, id, "approve");
  const invoices = structuredClone(s.invoices),
    payments = structuredClone(s.payments),
    units = structuredClone(s.units);
  s = ok(s, pay);
  assert.equal(
    execute(s, admin, {
      kind: "adDecision",
      id,
      decision: "publish",
      reason: "Prueba",
    }).audit.at(-1)?.outcome,
    "blocked",
  );
  const paymentId = s.advertisements![0].payments[0].id;
  s = ok(s, {
    kind: "adResolvePayment",
    id,
    paymentId,
    decision: "validated",
    reason: "Comprobante revisado",
  });
  assert.equal(s.advertisements![0].status, "approved");
  assert.deepEqual(s.invoices, invoices);
  assert.deepEqual(s.payments, payments);
  assert.deepEqual(s.units, units);
  s = decision(s, id, "publish");
  assert.equal(s.advertisements![0].payments[0].amount, 2500);
});
test("bloquea acceso cruzado, referencias repetidas y adjuntos no permitidos", () => {
  let s = submit(fixture(0));
  const id = s.advertisements![0].id;
  s = decision(s, id, "approve");
  const pay: Command = {
    kind: "adPayment",
    id,
    reference: "PUBLICIDAD-02",
    proof: "",
  };
  assert.equal(execute(s, other, pay).audit.at(-1)?.outcome, "blocked");
  assert.equal(
    execute(s, resident, { ...pay, proof: "javascript:alert(1)" }).audit.at(-1)
      ?.outcome,
    "blocked",
  );
  const existingRef = s.payments[0].reference;
  assert.equal(
    execute(s, resident, { ...pay, reference: existingRef }).audit.at(-1)
      ?.outcome,
    "blocked",
  );
  s = ok(s, pay, resident);
  assert.equal(execute(s, resident, pay).audit.at(-1)?.outcome, "blocked");
  const paymentId = s.advertisements![0].payments[0].id;
  assert.equal(
    execute(s, resident, {
      kind: "adResolvePayment",
      id,
      paymentId,
      decision: "validated",
      reason: "Prueba",
    }).audit.at(-1)?.outcome,
    "blocked",
  );
});
test("corregir contenido exige una nueva revisión y conserva el historial", () => {
  let s = submit(fixture());
  const id = s.advertisements![0].id;
  s = decision(s, id, "approve");
  assert.equal(
    execute(s, resident, {
      kind: "adSave",
      input: { ...input(), id },
      submit: true,
    }).audit.at(-1)?.outcome,
    "blocked",
  );
  s = decision(s, id, "changes");
  s = ok(
    s,
    {
      kind: "adSave",
      input: { ...input("Título corregido"), id },
      submit: true,
    },
    resident,
  );
  assert.equal(s.advertisements![0].status, "submitted");
  assert.equal(s.advertisements![0].reviewedBy, undefined);
  assert.ok(
    s.audit.some((a) => a.action === "Solicitar correcciones de anuncio"),
  );
});
test("configuración no reescribe cotizaciones ni permite revalorizar pagos vigentes", () => {
  let s = submit(fixture(50000));
  const id = s.advertisements![0].id;
  s = decision(s, id, "approve");
  s = ok(s, {
    kind: "adPolicy",
    preferential: 2000,
    general: 3000,
    durationDays: 5,
    reason: "Nueva tarifa",
  });
  assert.equal(s.advertisements![0].quote.amount, 1000);
  s = decision(s, id, "quote");
  assert.equal(s.advertisements![0].quote.amount, 2000);
  s = ok(
    s,
    { kind: "adPayment", id, reference: "PUB-TARIFA-01", proof: "" },
    resident,
  );
  assert.equal(
    execute(s, admin, {
      kind: "adDecision",
      id,
      decision: "quote",
      reason: "Prueba",
    }).audit.at(-1)?.outcome,
    "blocked",
  );
});
test("publicación nocturna usa fecha de Costa Rica y vence al finalizar el mes", () => {
  const s = fixture();
  const date = "2026-11-30",
    at = "2026-12-01T03:00:00.000Z";
  s.invoices[0].issueDate = "2026-11-01";
  mutateAdvertisement(
    s,
    resident,
    { kind: "adSave", input: { ...input(), month: "2026-11" }, submit: true },
    at,
    date,
  );
  const id = s.advertisements![0].id;
  mutateAdvertisement(
    s,
    admin,
    { kind: "adDecision", id, decision: "approve", reason: "Revisado" },
    at,
    date,
  );
  mutateAdvertisement(
    s,
    admin,
    {
      kind: "adDecision",
      id,
      decision: "publish",
      reason: "Publicación manual",
    },
    at,
    date,
  );
  assert.equal(adIsVisible(s.advertisements![0], date), true);
  assert.equal(s.advertisements![0].expiresOn, "2026-11-30");
  assert.equal(adIsVisible(s.advertisements![0], "2026-12-01"), false);
});
test("sin tarifa o duración configurada se reciben solicitudes pero no se publican", () => {
  const state = fixture(0);
  delete state.adPolicy;
  let s = submit(state);
  const id = s.advertisements![0].id;
  s = decision(s, id, "approve");
  assert.equal(s.advertisements![0].quote.amount, null);
  assert.equal(
    execute(s, admin, {
      kind: "adDecision",
      id,
      decision: "publish",
      reason: "Prueba",
    }).audit.at(-1)?.outcome,
    "blocked",
  );
  assert.equal(
    execute(s, resident, {
      kind: "adPolicy",
      preferential: 1000,
      general: 2000,
      durationDays: 7,
      reason: "Prueba",
    }).audit.at(-1)?.outcome,
    "blocked",
  );
});

test("rechaza tarifas menores de un céntimo y conserva el estado al fallar", () => {
  const state = fixture();
  const next = execute(state, admin, {
    kind: "adPolicy",
    preferential: 0.001,
    general: 2500,
    durationDays: 7,
    reason: "Prueba",
  });
  assert.equal(next.audit.at(-1)?.outcome, "blocked");
  assert.deepEqual(next.adPolicy, state.adPolicy);
});

test("el anuncio se bloquea si pierde el beneficio y la bitácora no copia adjuntos", () => {
  let s = fixture();
  const proof = "data:image/png;base64,iVBORw0KGgo=";
  s = ok(
    s,
    { kind: "adSave", input: { ...input(), image: proof }, submit: true },
    resident,
  );
  const id = s.advertisements![0].id;
  s = decision(s, id, "approve");
  s.invoices[0].paidAmount = 0;
  s.invoices[0].status = "pending";
  const result = execute(s, admin, {
    kind: "adDecision",
    id,
    decision: "publish",
    reason: "Prueba",
  });
  assert.equal(result.audit.at(-1)?.outcome, "blocked");
  assert.equal(result.advertisements![0].status, "approved");
  assert.equal(JSON.stringify(result.audit).includes("iVBORw0KGgo="), false);
});
