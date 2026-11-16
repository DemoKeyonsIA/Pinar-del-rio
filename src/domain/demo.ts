import type {
  Unit,
  Invoice,
  PaymentRecord,
  Reservation,
  MaintenanceTicket,
  NewsAnnouncement,
  Employee,
  PayrollRun,
  ShiftDefinition,
  UserProfile,
  Amenity,
  CommunityEvent,
  AppNotification,
} from "../types";
import * as seed from "../data/mockData";
import {
  mutateAdvertisement,
  type AdCommand,
  type AdPolicy,
  type Advertisement,
} from "./advertising";
import {
  calculateBenefit,
  type BenefitInput,
  type BenefitRecord,
} from "./benefits";
import {
  createSchedule,
  vacationDates,
  vacationBalance,
  dateValue,
  type WeekHours,
} from "./personnel";

export const STORAGE_KEY = "pinar.demo.v1";
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const money = (n: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 2,
  }).format(n);
export const stamp = (date: string) =>
  new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
export const uid = () => crypto.randomUUID();
export const PAYROLL_RATES = { worker: 0.1083, employer: 0.2667 }; // Parámetros del escenario, no certificación normativa.

export interface AuditEvent {
  origin?: "human" | "agent" | "system";
  id: string;
  sequence: number;
  at: string;
  sessionId: string;
  actorId: string;
  actorName: string;
  role: string;
  module: string;
  action: string;
  entityId: string;
  summary: string;
  outcome: "success" | "blocked" | "error";
  changes: { field: string; before: string; after: string }[];
  operationId: string;
  reason?: string;
}
export interface DemoState {
  version: 1;
  sessionId: string;
  units: Unit[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  reservations: Reservation[];
  tickets: MaintenanceTicket[];
  news: NewsAnnouncement[];
  employees: Employee[];
  payrollRuns: PayrollRun[];
  shifts: ShiftDefinition[];
  amenities: Amenity[];
  events: CommunityEvent[];
  notifications: AppNotification[];
  audit: AuditEvent[];
  benefits?: BenefitRecord[];
  advertisements?: Advertisement[];
  adPolicy?: AdPolicy;
}
export type Collection = "units" | "tickets" | "news" | "employees" | "shifts";
export type Entity =
  Unit | MaintenanceTicket | NewsAnnouncement | Employee | ShiftDefinition;
export type Command =
  | AdCommand
  | {
      kind: "approveVisit";
      unitId: string;
      name: string;
      date: string;
      plate: string;
      notes: string;
    }
  | { kind: "revokeVisit"; unitId: string; id: string; reason: string }
  | { kind: "benefit"; input: BenefitInput }
  | {
      kind: "resolveBenefit";
      id: string;
      status: "confirmado" | "anulado";
      reason: string;
    }
  | { kind: "session"; user: UserProfile | null; previous?: UserProfile | null }
  | { kind: "save"; collection: Collection; value: Entity }
  | { kind: "delete"; collection: Collection; id: string }
  | { kind: "reportPayment"; value: PaymentRecord }
  | { kind: "applyPayment"; id: string }
  | { kind: "rejectPayment"; id: string; reason: string }
  | { kind: "reversePayment"; id: string; reason: string }
  | { kind: "cash"; value: PaymentRecord }
  | { kind: "reservation"; value: Reservation }
  | { kind: "quota"; unitId?: string; amount: number; percent?: number }
  | {
      kind: "import";
      collection: "units" | "payments" | "employees";
      rows: unknown[];
    }
  | { kind: "payroll"; period: string }
  | { kind: "approvePayroll"; id: string }
  | {
      kind: "schedule";
      employeeId: string;
      name: string;
      week: WeekHours;
      notes: string;
    }
  | {
      kind: "vacation";
      employeeId: string;
      startDate: string;
      endDate: string;
      notes: string;
    }
  | {
      kind: "resolveVacation";
      employeeId: string;
      id: string;
      status: "aprobado" | "rechazado" | "cancelado" | "disfrutado";
      reason: string;
    }
  | {
      kind: "boardDecision";
      id: string;
      approved: boolean;
      reason: string;
      acta: string;
    }
  | {
      kind: "record";
      module: string;
      action: string;
      entityId: string;
      summary: string;
      origin?: "human" | "agent" | "system";
    };

export function initialState(): DemoState {
  const s: DemoState = structuredClone({
    version: 1 as const,
    sessionId: uid(),
    units: seed.INITIAL_UNITS,
    invoices: seed.INITIAL_INVOICES,
    payments: seed.INITIAL_PAYMENTS,
    reservations: seed.INITIAL_RESERVATIONS,
    tickets: seed.INITIAL_TICKETS,
    news: seed.INITIAL_NEWS,
    employees: seed.INITIAL_EMPLOYEES,
    payrollRuns: seed.INITIAL_PAYROLL_RUNS,
    shifts: seed.INITIAL_SHIFTS,
    amenities: seed.INITIAL_AMENITIES,
    events: seed.INITIAL_EVENTS,
    notifications: [],
    audit: [],
  });
  const iso = (date: string) =>
    date.includes("/")
      ? date.split("/").reverse().join("-")
      : date.slice(0, 10);
  for (const invoice of s.invoices) {
    invoice.issueDate = iso(invoice.issueDate);
    invoice.dueDate = iso(invoice.dueDate);
    if (invoice.status === "paid") {
      invoice.paidAmount = invoice.total;
      invoice.paidWithPayId = invoice.paidWithPayId || invoice.payId;
      invoice.allocations = invoice.paidWithPayId
        ? [{ paymentId: invoice.paidWithPayId, amount: invoice.total }]
        : [];
    }
  }
  for (const payment of s.payments)
    payment.receiptProofUrl =
      payment.status === "pending_validation" ? "/demo-receipt.svg" : undefined;
  // Los comunicados históricos de muestra permanecen visibles al reiniciar la demo.
  for (const notice of s.news)
    if (notice.status === "active") delete notice.unpublishDate;
  for (const unit of s.units) {
    const billed = s.invoices
      .filter((i) => i.unitId === unit.id && i.status !== "paid")
      .reduce((n, i) => n + i.total - (i.paidAmount || 0), 0);
    if (unit.currentBalance > billed) {
      const total = unit.currentBalance - billed;
      s.invoices.push({
        id: `OPEN-${unit.id}`,
        unitId: unit.id,
        unitNumber: unit.number,
        ownerName: unit.ownerName,
        ownerIdNumber: "",
        month: "Saldo de apertura del escenario",
        issueDate: "2026-10-01",
        dueDate: "2026-10-05",
        items: [
          { concept: "Saldo histórico pendiente de apertura", amount: total },
        ],
        subtotal: total,
        reserveFund: 0,
        total,
        status: "overdue",
        paidAmount: 0,
        allocations: [],
      });
    }
  }
  return s;
}

export function loadState(): DemoState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return initialState();
  const value = JSON.parse(stored) as DemoState;
  if (
    value.version !== 1 ||
    !value.sessionId ||
    ![
      "units",
      "invoices",
      "payments",
      "reservations",
      "tickets",
      "news",
      "employees",
      "payrollRuns",
      "shifts",
      "amenities",
      "events",
      "notifications",
      "audit",
    ].every((k) => Array.isArray(value[k as keyof DemoState]))
  ) {
    throw new Error(
      "Los datos locales no son compatibles. Exporte o restablezca la demo.",
    );
  }
  if (value.benefits !== undefined && !Array.isArray(value.benefits))
    throw new Error("El historial local de prestaciones no es compatible.");
  if (
    value.advertisements !== undefined &&
    !Array.isArray(value.advertisements)
  )
    throw new Error("El historial local de anuncios no es compatible.");
  return value;
}

const modules: Record<Collection, string> = {
  units: "Filiales",
  tickets: "Mantenimiento",
  news: "Comunicaciones",
  employees: "Personal",
  shifts: "Turnos",
};
const summaryValue = (field: string, value: unknown): string => {
  if (
    /proof|iban|phone|email|idNumber|identification|insurance|photos|image/i.test(
      field,
    )
  )
    return value ? "[dato protegido]" : "—";
  if (value === undefined || value === null) return "—";
  if (typeof value === "object")
    return Array.isArray(value)
      ? `${value.length} registros`
      : "[datos actualizados]";
  return String(value).slice(0, 300);
};
function changes(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) {
  const flatten = (source: Record<string, unknown>) => {
    const result: Record<string, unknown> = {};
    const walk = (value: unknown, path: string, depth: number) => {
      if (depth > 4 || /proof|photos|image/i.test(path)) {
        result[path] = value;
        return;
      }
      if (Array.isArray(value)) {
        if (!value.length) result[path] = "0 registros";
        value
          .slice(0, 100)
          .forEach((v, i) =>
            walk(
              v,
              `${path}.${v && typeof v === "object" && "id" in v ? String(v.id) : i}`,
              depth + 1,
            ),
          );
      } else if (value && typeof value === "object")
        Object.entries(value).forEach(([k, v]) =>
          walk(v, path ? `${path}.${k}` : k, depth + 1),
        );
      else result[path] = value;
    };
    walk(source, "", 0);
    return result;
  };
  const a = flatten(before),
    b = flatten(after);
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]))
    .map((field) => ({
      field,
      before: summaryValue(field, a[field]),
      after: summaryValue(field, b[field]),
    }));
}
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const positive = (n: number) => Number.isFinite(n) && n > 0;
export const referenceKey = (p: PaymentRecord) =>
  `${p.method}:${p.reference.trim().toLowerCase()}`;

function applyPayment(s: DemoState, p: PaymentRecord) {
  const unit = s.units.find((u) => u.id === p.unitId);
  assert(unit, "La filial del pago no existe.");
  assert(positive(p.amount), "El monto debe ser mayor que cero.");
  p.status = "applied";
  p.validatedAt = today();
  // Un saldo negativo representa crédito a favor; nunca se descarta el excedente.
  unit.currentBalance =
    Math.round((unit.currentBalance - p.amount) * 100) / 100;
  unit.lastPaymentDate = p.date;
  if (unit.currentBalance <= 0) {
    unit.arrearsStatus = "up_to_date";
    unit.overdueMonths = [];
  }
  let remaining = p.amount;
  for (const invoice of s.invoices
    .filter((i) => i.unitId === unit.id && i.status !== "paid")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))) {
    const needed = invoice.total - (invoice.paidAmount || 0);
    const allocated = Math.min(remaining, needed);
    if (allocated <= 0) continue;
    invoice.paidAmount = (invoice.paidAmount || 0) + allocated;
    invoice.allocations = [
      ...(invoice.allocations || []),
      { paymentId: p.id, amount: allocated },
    ];
    remaining -= allocated;
    if (invoice.paidAmount >= invoice.total) {
      invoice.status = "paid";
      invoice.paidWithPayId = p.id;
    }
  }
}

export function execute(
  state: DemoState,
  actor: UserProfile | null,
  command: Command,
): DemoState {
  command = structuredClone(command);
  const next = structuredClone(state);
  const operationId = uid();
  const eventActor =
    command.kind === "session" ? command.user || command.previous : actor;
  const event: AuditEvent = {
    id: uid(),
    sequence: (state.audit.at(-1)?.sequence || 0) + 1,
    at: new Date().toISOString(),
    sessionId: state.sessionId,
    actorId: eventActor?.id || "visitor",
    actorName: eventActor?.name || "Visitante",
    role: eventActor?.role || "visitor",
    module: "Demo",
    action: command.kind,
    entityId: "",
    summary: "",
    outcome: "success",
    changes: [],
    operationId,
    origin: command.kind === "record" ? command.origin || "human" : "human",
  };
  const log = (
    module: string,
    action: string,
    entityId: string,
    summary: string,
    before: object = {},
    after: object = {},
  ) => {
    Object.assign(event, {
      module,
      action,
      entityId,
      summary,
      changes: changes(
        before as Record<string, unknown>,
        after as Record<string, unknown>,
      ),
    });
  };
  const children: AuditEvent[] = [];
  const child = (
    module: string,
    action: string,
    entityId: string,
    summary: string,
    before: object,
    after: object,
  ) =>
    children.push({
      ...event,
      id: uid(),
      module,
      action,
      entityId,
      summary,
      changes: changes(
        before as Record<string, unknown>,
        after as Record<string, unknown>,
      ),
    });
  try {
    if (command.kind !== "session")
      assert(actor, "Seleccione un perfil de demostración.");
    const adminOnly = [
      "delete",
      "cash",
      "applyPayment",
      "rejectPayment",
      "reversePayment",
      "quota",
      "import",
      "payroll",
      "approvePayroll",
      "schedule",
      "vacation",
      "resolveVacation",
      "benefit",
      "resolveBenefit",
    ];
    if (adminOnly.includes(command.kind))
      assert(
        actor?.role === "admin",
        "Esta operación corresponde a la administradora.",
      );
    switch (command.kind) {
      case "adSave":
      case "adPolicy":
      case "adDecision":
      case "adPayment":
      case "adResolvePayment": {
        const result = mutateAdvertisement(
          next,
          actor,
          command,
          event.at,
          today(),
        );
        log(
          "Anuncios",
          result.name,
          result.id,
          result.summary,
          result.before,
          result.after,
        );
        if ("reason" in command) event.reason = command.reason;
        break;
      }
      case "approveVisit":
      case "revokeVisit": {
        const unit = next.units.find((u) => u.id === command.unitId);
        assert(
          unit &&
            (actor?.role === "admin" ||
              (actor?.role === "resident" && actor.unitId === unit.id)),
          "Solo puede gestionar visitas de su filial.",
        );
        if (command.kind === "approveVisit") {
          const name = command.name.trim().replace(/\s+/g, " ");
          const plate = command.plate.trim().toUpperCase();
          assert(
            name.length >= 2 &&
              name.length <= 100 &&
              plate.length <= 20 &&
              command.notes.length <= 240,
            "Revise el nombre, placa y notas de la visita.",
          );
          dateValue(command.date);
          assert(
            command.date >= today(),
            "La fecha de visita no puede estar en el pasado.",
          );
          assert(
            !(unit.approvedVisits || []).some(
              (v) =>
                v.status === "approved" &&
                v.date === command.date &&
                v.name.toLocaleLowerCase("es") ===
                  name.toLocaleLowerCase("es") &&
                v.plate === plate,
            ),
            "Esta visita ya está aprobada para esa fecha.",
          );
          const visit = {
            id: uid(),
            name,
            date: command.date,
            plate,
            notes: command.notes.trim(),
            status: "approved" as const,
            approvedAt: event.at,
            approvedBy: actor!.name,
            approvedById: actor!.id,
          };
          unit.approvedVisits = [visit, ...(unit.approvedVisits || [])];
          log(
            "Convivencia",
            "Aprobar visita",
            unit.id,
            `${unit.number} · ${name} · ${command.date}`,
            {},
            visit,
          );
        } else {
          const visit = unit.approvedVisits?.find((v) => v.id === command.id);
          assert(
            visit && visit.status === "approved" && visit.date >= today(),
            "La visita ya no tiene una aprobación vigente.",
          );
          assert(
            command.reason.trim() && command.reason.length <= 240,
            "Indique un motivo de hasta 240 caracteres.",
          );
          const before = { ...visit };
          visit.status = "revoked";
          visit.revokedAt = event.at;
          visit.revokedBy = actor!.name;
          visit.revocationReason = command.reason.trim();
          event.reason = visit.revocationReason;
          log(
            "Convivencia",
            "Revocar visita",
            unit.id,
            `${unit.number} · ${visit.name} · ${visit.date}`,
            before,
            visit,
          );
        }
        break;
      }
      case "benefit": {
        const input = command.input;
        const employee = next.employees.find((e) => e.id === input.employeeId);
        assert(employee, "El empleado no existe.");
        const result = calculateBenefit(input);
        assert(
          !(next.benefits || []).some(
            (r) =>
              r.status !== "anulado" &&
              r.input.employeeId === employee.id &&
              r.input.type === input.type &&
              (input.type === "liquidacion" ||
                r.input.endDate.slice(0, 4) === input.endDate.slice(0, 4)),
          ),
          "Ya existe un cálculo vigente para esta persona y ciclo. Anule el anterior antes de reemplazarlo.",
        );
        const record: BenefitRecord = {
          id: uid(),
          input,
          result,
          employeeName: employee.name,
          employeeIdentification: employee.idNumber,
          employeeRole: employee.roleTitle,
          createdAt: event.at,
          createdBy: actor!.name,
          status: "calculado",
        };
        next.benefits = [record, ...(next.benefits || [])];
        log(
          "Personal",
          "Guardar cálculo de prestaciones",
          record.id,
          `${employee.name} · ${input.type} · ${money(result.total)}`,
          {},
          record,
        );
        break;
      }
      case "resolveBenefit": {
        const record = next.benefits?.find((r) => r.id === command.id);
        assert(record, "El cálculo no existe.");
        assert(
          ["confirmado", "anulado"].includes(command.status),
          "Estado inválido.",
        );
        assert(command.reason.trim(), "Indique el motivo de la decisión.");
        assert(
          record.status !== "anulado" &&
            (command.status !== "confirmado" || record.status === "calculado"),
          "El cálculo ya fue resuelto.",
        );
        const before = structuredClone(record);
        record.status = command.status;
        record.resolvedAt = event.at;
        record.resolvedBy = actor!.name;
        record.resolutionReason = command.reason.trim();
        event.reason = record.resolutionReason;
        log(
          "Personal",
          command.status === "confirmado"
            ? "Confirmar cálculo de prestaciones"
            : "Anular cálculo de prestaciones",
          record.id,
          `${record.employeeName} · ${record.input.type}`,
          before,
          record,
        );
        break;
      }
      case "session":
        log(
          "Demo",
          command.user ? "Entrar / cambiar perfil" : "Salir",
          eventActor?.id || "",
          command.user
            ? `${command.user.name} abrió la vista ${command.user.roleTitle}`
            : "Sesión de demostración cerrada",
        );
        break;
      case "save": {
        const { collection, value } = command;
        const old = (state[collection] as Entity[]).find(
          (v) => v.id === value.id,
        );
        assert(
          actor?.role === "admin" ||
            (collection === "units" &&
              actor?.role === "resident" &&
              actor.unitId === value.id) ||
            (collection === "tickets" && !old && actor?.role === "resident"),
          "No puede modificar este registro.",
        );
        if (actor?.role === "resident" && collection === "units") {
          const allowed = [
            "ownerPhone",
            "ownerEmail",
            "emergencyPhone",
            "emergencyContactName",
            "hasChildren",
            "hasPets",
            "residents",
          ];
          assert(
            old &&
              Object.keys(value).every(
                (k) =>
                  allowed.includes(k) ||
                  JSON.stringify(old[k as keyof Entity]) ===
                    JSON.stringify(value[k as keyof Entity]),
              ),
            "Solo puede actualizar los datos de convivencia de su filial.",
          );
        }
        if (collection === "units") {
          const u = value as Unit;
          assert(
            JSON.stringify(u.approvedVisits || []) ===
              JSON.stringify((old as Unit | undefined)?.approvedVisits || []),
            "Gestione las visitas desde su lista de autorizaciones.",
          );
          assert(
            u.number.trim() && u.ownerName.trim(),
            "Indique filial y propietario.",
          );
          assert(
            Number.isFinite(u.currentBalance) && positive(u.monthlyQuota),
            "Revise saldo y cuota.",
          );
          assert(
            !next.units.some(
              (x) =>
                x.id !== u.id &&
                x.number.trim().toLowerCase() === u.number.trim().toLowerCase(),
            ),
            "Ya existe esa filial.",
          );
        }
        if (collection === "employees") {
          const e = value as Employee;
          assert(
            (e.vacationDaysTotal || 0) >=
              (e.vacationDaysTaken || 0) + vacationBalance(e).reserved,
            "El saldo configurado no puede ser menor que los días disfrutados y reservados.",
          );
          if (old) {
            const previous = old as Employee;
            assert(
              JSON.stringify(e.schedule) === JSON.stringify(previous.schedule),
              "Use la edición de horario por día para cambiar la jornada.",
            );
            assert(
              (e.vacationDaysTaken || 0) ===
                (previous.vacationDaysTaken || 0) &&
                JSON.stringify(e.vacationHistory || []) ===
                  JSON.stringify(previous.vacationHistory || []),
              "Las vacaciones se actualizan desde su flujo de solicitudes e historial.",
            );
          }
          assert(
            e.name.trim() && positive(e.baseSalary),
            "Indique nombre y salario válido.",
          );
          assert(
            [
              e.payrollExtras || 0,
              e.payrollDeductions || 0,
              e.unworkedDays || 0,
              e.vacationDaysTotal || 0,
              e.vacationDaysTaken || 0,
            ].every((v) => Number.isFinite(v) && v >= 0) &&
              (e.unworkedDays || 0) <= 30 &&
              (e.vacationDaysTaken || 0) <= (e.vacationDaysTotal || 0),
            "Revise extras, deducciones, días no laborados y vacaciones.",
          );
          assert(
            !next.employees.some(
              (x) => x.id !== e.id && x.idNumber === e.idNumber,
            ),
            "Ya existe un empleado con esa identificación.",
          );
        }
        if (collection === "tickets") {
          const t = value as MaintenanceTicket;
          assert(
            t.title.trim() && t.description.trim(),
            "Indique título y descripción.",
          );
          if (actor?.role === "resident")
            assert(
              t.unitNumber ===
                next.units.find((u) => u.id === actor.unitId)?.number,
              "Solo puede reportar para su filial.",
            );
        }
        if (collection === "news") {
          const n = value as NewsAnnouncement;
          assert(
            n.title.trim() && n.content.trim(),
            "Indique título y contenido.",
          );
          if (n.status === "scheduled")
            assert(
              n.publishScheduleDate && n.publishScheduleDate >= today(),
              "Seleccione una fecha de publicación válida.",
            );
        }
        if (collection === "shifts") {
          const t = value as ShiftDefinition;
          assert(
            t.name.trim() &&
              t.startTime &&
              t.endTime &&
              positive(t.hoursWeekly),
            "Complete nombre, horario y horas semanales.",
          );
        }
        const list = next[collection] as Entity[];
        const index = list.findIndex((x) => x.id === value.id);
        if (index < 0) list.unshift(value);
        else list[index] = value;
        if (
          collection === "units" &&
          !old &&
          (value as Unit).currentBalance > 0
        ) {
          const u = value as Unit,
            total = u.currentBalance;
          next.invoices.push({
            id: uid(),
            unitId: u.id,
            unitNumber: u.number,
            ownerName: u.ownerName,
            ownerIdNumber: "",
            month: "Saldo inicial",
            issueDate: today(),
            dueDate: today(),
            items: [{ concept: "Saldo inicial de la filial", amount: total }],
            subtotal: total,
            reserveFund: 0,
            total,
            status: "pending",
            paidAmount: 0,
            allocations: [],
          });
        }
        log(
          modules[collection],
          old ? "Actualizar" : "Crear",
          value.id,
          `${old ? "Actualización" : "Creación"} de ${"name" in value ? value.name : "title" in value ? value.title : (value as Unit).number}`,
          old || {},
          value,
        );
        break;
      }
      case "delete": {
        const item = (next[command.collection] as Entity[]).find(
          (x) => x.id === command.id,
        );
        assert(item, "El registro ya no existe.");
        if (command.collection === "units")
          assert(
            !next.payments.some((p) => p.unitId === command.id) &&
              !next.invoices.some((i) => i.unitId === command.id),
            "No se puede eliminar una filial con movimientos financieros.",
          );
        if (command.collection === "employees")
          assert(
            !(item as Employee).payslips.length &&
              !(item as Employee).vacationHistory?.length,
            "No se puede eliminar un empleado con boletas o vacaciones registradas. Marque su estado como inactivo.",
          );
        (next[command.collection] as Entity[]) = (
          next[command.collection] as Entity[]
        ).filter((x) => x.id !== command.id);
        log(
          modules[command.collection],
          "Eliminar",
          command.id,
          "Registro eliminado",
          item,
          {},
        );
        break;
      }
      case "reportPayment":
      case "cash": {
        const p = command.value;
        assert(
          actor?.role === "admin" ||
            (actor?.role === "resident" && actor.unitId === p.unitId),
          "Solo puede reportar pagos para su filial.",
        );
        assert(
          positive(p.amount) &&
            p.reference.trim() &&
            next.units.some((u) => u.id === p.unitId) &&
            /^\d{4}-\d{2}-\d{2}/.test(p.date) &&
            p.date.slice(0, 10) <= today(),
          "Revise monto, referencia, fecha y filial.",
        );
        assert(
          !next.payments.some((x) => referenceKey(x) === referenceKey(p)),
          "La referencia ya fue registrada para este medio de pago.",
        );
        p.status = command.kind === "cash" ? "applied" : "pending_validation";
        next.payments.unshift(p);
        if (command.kind === "cash") {
          applyPayment(next, p);
          p.validatedBy = actor!.name;
        }
        log(
          "Tesorería",
          command.kind === "cash" ? "Registrar recibo" : "Reportar pago",
          p.id,
          `${p.unitNumber} · ${money(p.amount)} · ${p.reference}`,
          {},
          { amount: p.amount, status: p.status, unitId: p.unitId },
        );
        break;
      }
      case "applyPayment":
      case "rejectPayment":
      case "reversePayment": {
        const p = next.payments.find((p) => p.id === command.id);
        assert(p, "El pago no existe.");
        event.entityId = p.id;
        event.module = "Tesorería";
        const before = {
          ...p,
          balance: next.units.find((u) => u.id === p.unitId)?.currentBalance,
        };
        if (command.kind === "reversePayment") {
          assert(
            p.status === "applied" && command.reason.trim(),
            "Solo se revierte un pago aplicado, indicando el motivo.",
          );
          const unit = next.units.find((u) => u.id === p.unitId)!;
          unit.currentBalance =
            Math.round((unit.currentBalance + p.amount) * 100) / 100;
          if (unit.currentBalance > 0) unit.arrearsStatus = "late_30";
          for (const invoice of next.invoices) {
            const amount = (invoice.allocations || [])
              .filter((a) => a.paymentId === p.id)
              .reduce((n, a) => n + a.amount, 0);
            if (!amount) continue;
            invoice.paidAmount = Math.max(
              0,
              (invoice.paidAmount || 0) - amount,
            );
            invoice.allocations = invoice.allocations!.filter(
              (a) => a.paymentId !== p.id,
            );
            invoice.status = invoice.dueDate < today() ? "overdue" : "pending";
            delete invoice.paidWithPayId;
          }
          p.status = "rejected";
          p.rejectionReason = `Reversión: ${command.reason}`;
          event.reason = command.reason;
        } else {
          assert(
            ["reported", "pending_validation"].includes(p.status),
            "Este pago ya fue procesado.",
          );
          if (command.kind === "applyPayment") applyPayment(next, p);
          else {
            assert(command.reason.trim(), "Indique el motivo del rechazo.");
            p.status = "rejected";
            p.rejectionReason = command.reason;
            event.reason = command.reason;
          }
        }
        p.validatedBy = actor!.name;
        p.validatedAt = today();
        log(
          "Tesorería",
          command.kind === "applyPayment"
            ? "Validar pago"
            : command.kind === "reversePayment"
              ? "Revertir pago"
              : "Rechazar pago",
          p.id,
          `${p.unitNumber} · ${money(p.amount)}`,
          before,
          {
            ...p,
            balance: next.units.find((u) => u.id === p.unitId)?.currentBalance,
          },
        );
        break;
      }
      case "reservation": {
        const r = command.value;
        const amenity = next.amenities.find((a) => a.id === r.amenityId);
        assert(
          actor?.role === "admin" ||
            (actor?.role === "resident" &&
              next.units.find((u) => u.id === actor.unitId)?.number ===
                r.unitNumber),
          "No puede reservar para esta filial.",
        );
        assert(
          amenity &&
            r.date >= today() &&
            r.guestsCount >= 1 &&
            r.guestsCount <= amenity.capacity &&
            amenity.reservationSlots.includes(r.timeSlot),
          "Revise fecha, horario y capacidad.",
        );
        assert(
          !next.reservations.some(
            (x) =>
              x.amenityId === r.amenityId &&
              x.date === r.date &&
              x.timeSlot === r.timeSlot &&
              x.status !== "cancelled",
          ),
          "Ese horario ya está reservado.",
        );
        next.reservations.unshift(r);
        log(
          "Reservas",
          "Reservar",
          r.id,
          `${r.amenityName} · ${r.date} · ${r.timeSlot}`,
          {},
          r,
        );
        break;
      }
      case "quota": {
        assert(
          positive(command.amount) &&
            (command.percent === undefined ||
              (Number.isFinite(command.percent) && command.percent > -100)),
          "La cuota debe ser positiva.",
        );
        const affected = next.units.filter(
          (u) => !command.unitId || command.unitId === u.id,
        );
        assert(affected.length, "Seleccione una filial válida.");
        for (const u of affected) {
          const before = u.monthlyQuota;
          u.monthlyQuota =
            command.percent !== undefined
              ? Math.round(before * (1 + command.percent / 100))
              : command.amount;
          event.changes.push({
            field: `${u.number} · cuota`,
            before: money(before),
            after: money(u.monthlyQuota),
          });
          child(
            "Filiales",
            "Actualizar cuota",
            u.id,
            u.number,
            { monthlyQuota: before },
            { monthlyQuota: u.monthlyQuota },
          );
        }
        Object.assign(event, {
          module: "Tesorería",
          action: "Actualizar cuotas",
          entityId: command.unitId || "all",
          summary: `${affected.length} filiales actualizadas; no genera deuda retroactiva`,
        });
        break;
      }
      case "import": {
        assert(
          command.rows.length > 0 && command.rows.length <= 5000,
          "Importe entre 1 y 5.000 filas.",
        );
        let imported = 0,
          skipped = 0;
        for (const raw of command.rows) {
          assert(raw && typeof raw === "object", "Fila inválida.");
          if (command.collection === "payments") {
            const p = raw as PaymentRecord;
            assert(
              positive(p.amount) &&
                typeof p.reference === "string" &&
                p.reference.trim() &&
                next.units.some((u) => u.id === p.unitId),
              "Hay pagos con monto, referencia o filial inválidos.",
            );
            if (
              next.payments.some((x) => referenceKey(x) === referenceKey(p))
            ) {
              skipped++;
              continue;
            }
            p.id = uid();
            next.payments.unshift(p);
            applyPayment(next, p);
            p.validatedBy = actor!.name;
            child(
              "Tesorería",
              "Importar pago",
              p.id,
              `${p.unitNumber} · ${p.reference} · ${money(p.amount)}`,
              {},
              { amount: p.amount, status: p.status, unitId: p.unitId },
            );
          } else if (command.collection === "units") {
            const u = raw as Unit;
            assert(
              u.number?.trim() &&
                u.ownerName?.trim() &&
                positive(u.monthlyQuota) &&
                Number.isFinite(u.currentBalance),
              "Hay filiales con datos inválidos.",
            );
            if (
              next.units.some(
                (x) => x.number.toLowerCase() === u.number.toLowerCase(),
              )
            ) {
              skipped++;
              continue;
            }
            u.id = uid();
            next.units.push(u);
            if (u.currentBalance > 0) {
              const total = u.currentBalance;
              next.invoices.push({
                id: uid(),
                unitId: u.id,
                unitNumber: u.number,
                ownerName: u.ownerName,
                ownerIdNumber: "",
                month: "Saldo de apertura importado",
                issueDate: today(),
                dueDate: today(),
                items: [{ concept: "Saldo inicial importado", amount: total }],
                subtotal: total,
                reserveFund: 0,
                total,
                status: "pending",
                paidAmount: 0,
                allocations: [],
              });
            }
            child("Filiales", "Importar filial", u.id, u.number, {}, u);
          } else {
            const e = raw as Employee;
            assert(
              e.name?.trim() && e.idNumber?.trim() && positive(e.baseSalary),
              "Hay empleados sin nombre, identificación o salario válido.",
            );
            if (next.employees.some((x) => x.idNumber === e.idNumber)) {
              skipped++;
              continue;
            }
            e.id = uid();
            next.employees.push(e);
            child("Personal", "Importar empleado", e.id, e.name, {}, e);
          }
          imported++;
        }
        log(
          "Importaciones",
          "Importar",
          command.collection,
          `${imported} registros importados · ${skipped} duplicados omitidos`,
          {},
          { accepted: imported, duplicates: skipped },
        );
        break;
      }
      case "schedule": {
        const employee = next.employees.find(
          (e) => e.id === command.employeeId,
        );
        assert(employee, "El empleado no existe.");
        const before = employee.schedule;
        employee.schedule = createSchedule(
          command.name,
          command.week,
          command.notes,
        );
        log(
          "Personal",
          "Actualizar horario",
          employee.id,
          `${employee.name} · ${employee.schedule.hoursWeekly} horas semanales`,
          { schedule: before },
          { schedule: employee.schedule },
        );
        break;
      }
      case "vacation": {
        const employee = next.employees.find(
          (e) => e.id === command.employeeId,
        );
        assert(
          employee && employee.status !== "inactivo",
          "Seleccione un empleado activo.",
        );
        const dates = vacationDates(
          employee,
          command.startDate,
          command.endDate,
        );
        assert(
          !(employee.vacationHistory || []).some(
            (v) =>
              !["cancelado", "rechazado"].includes(v.status) &&
              v.startDate <= command.endDate &&
              v.endDate >= command.startDate,
          ),
          "Existe una solicitud que se superpone con estas fechas.",
        );
        assert(
          dates.length <= vacationBalance(employee).available,
          "Los días solicitados superan el saldo disponible.",
        );
        const record = {
          id: uid(),
          startDate: command.startDate,
          endDate: command.endDate,
          daysTaken: dates.length,
          scheduledDays: dates,
          status: "pendiente" as const,
          notes: command.notes,
        };
        employee.vacationHistory = [
          record,
          ...(employee.vacationHistory || []),
        ];
        log(
          "Vacaciones",
          "Registrar solicitud",
          employee.id,
          `${employee.name} · ${dates.length} días laborables · ${command.startDate} a ${command.endDate}`,
          {},
          record,
        );
        break;
      }
      case "resolveVacation": {
        const employee = next.employees.find(
          (e) => e.id === command.employeeId,
        );
        assert(employee, "El empleado no existe.");
        const record = employee.vacationHistory?.find(
          (v) => v.id === command.id,
        );
        assert(record, "La solicitud no existe.");
        const before = { ...record },
          beforeTaken = employee.vacationDaysTaken || 0;
        assert(command.reason.trim(), "Indique el motivo de la decisión.");
        if (command.status === "aprobado")
          assert(
            record.status === "pendiente" &&
              record.daysTaken <= vacationBalance(employee).available,
            "La solicitud ya fue resuelta o no tiene saldo disponible.",
          );
        if (command.status === "rechazado")
          assert(
            record.status === "pendiente",
            "Solo se puede rechazar una solicitud pendiente.",
          );
        if (command.status === "cancelado")
          assert(
            ["pendiente", "aprobado"].includes(record.status),
            "Esta solicitud ya no se puede cancelar.",
          );
        if (command.status === "disfrutado") {
          assert(
            record.status === "aprobado" && record.endDate <= today(),
            "Solo se pueden cerrar vacaciones aprobadas cuya fecha final ya pasó.",
          );
          employee.vacationDaysTaken = beforeTaken + record.daysTaken;
        }
        record.status = command.status;
        record.resolvedAt = new Date().toISOString();
        record.resolvedBy = actor!.name;
        record.resolutionReason = command.reason;
        event.reason = command.reason;
        const actions = {
          aprobado: "Aprobar vacaciones",
          rechazado: "Rechazar vacaciones",
          cancelado: "Cancelar vacaciones",
          disfrutado: "Cerrar vacaciones disfrutadas",
        };
        log(
          "Vacaciones",
          actions[command.status],
          employee.id,
          `${employee.name} · ${record.startDate} a ${record.endDate}`,
          { ...before, vacationDaysTaken: beforeTaken },
          { ...record, vacationDaysTaken: employee.vacationDaysTaken || 0 },
        );
        break;
      }
      case "payroll": {
        assert(
          command.period.trim() &&
            !next.payrollRuns.some(
              (r) =>
                r.period.toLowerCase() === command.period.trim().toLowerCase(),
            ),
          "El período ya fue procesado o está vacío.",
        );
        const emps = next.employees.filter((e) => e.status === "activo");
        assert(emps.length, "No hay empleados activos.");
        const slips = emps.map((e) => {
          const extras = e.payrollExtras || 0,
            other = e.payrollDeductions || 0,
            days = e.unworkedDays || 0;
          const unworked = Math.round((e.baseSalary / 30) * days * 100) / 100;
          const gross =
            Math.round((e.baseSalary + extras - unworked) * 100) / 100;
          const worker = Math.round(gross * PAYROLL_RATES.worker * 100) / 100;
          const net = Math.round((gross - worker - other) * 100) / 100;
          assert(
            gross >= 0 && net >= 0,
            "Las deducciones superan el salario disponible.",
          );
          return {
            id: uid(),
            employeeId: e.id,
            employeeName: e.name,
            employeeIdentification: e.idNumber,
            employeeRoleTitle: e.roleTitle,
            period: command.period.trim(),
            paymentDate: today(),
            grossSalary: e.baseSalary,
            overtimeAmount: extras,
            subtotal: e.baseSalary + extras,
            unworkedDays: days,
            unworkedDaysDeduction: unworked,
            workerCCSSDeduction: worker,
            otherDeductions: other,
            netSalary: net,
            employerCCSSContribution:
              Math.round(gross * PAYROLL_RATES.employer * 100) / 100,
            status: "pendiente" as const,
            ccssSicereBatchId: "",
            bankReference: "",
          };
        });
        emps.forEach((e, i) => e.payslips.unshift(slips[i]));
        const run: PayrollRun = {
          id: uid(),
          period: command.period.trim(),
          runDate: today(),
          totalGross: slips.reduce(
            (a, s) => a + s.subtotal - s.unworkedDaysDeduction,
            0,
          ),
          totalWorkerDeductions: slips.reduce(
            (a, s) => a + s.workerCCSSDeduction,
            0,
          ),
          totalNetPaid: slips.reduce((a, s) => a + s.netSalary, 0),
          totalEmployerCCSS: slips.reduce(
            (a, s) => a + s.employerCCSSContribution,
            0,
          ),
          status: "pendiente",
          sicereExportGenerated: false,
          sicereBatchId: "",
          employeesCount: emps.length,
        };
        next.payrollRuns.unshift(run);
        log(
          "Personal",
          "Calcular planilla",
          run.id,
          `${run.period} · ${emps.length} empleados · ${money(run.totalNetPaid)}`,
          {},
          run,
        );
        break;
      }
      case "approvePayroll": {
        const run = next.payrollRuns.find((r) => r.id === command.id);
        assert(run?.status === "pendiente", "La planilla ya fue revisada.");
        run.status = "procesando";
        log(
          "Personal",
          "Aprobar cálculo",
          run.id,
          `${run.period} aprobado; no se efectuaron transferencias`,
          { status: "pendiente" },
          { status: run.status },
        );
        break;
      }
      case "boardDecision": {
        assert(
          actor?.role === "board",
          "Esta decisión corresponde a la junta directiva.",
        );
        assert(
          command.reason.trim() && command.acta.trim(),
          "Indique motivo y acta.",
        );
        const t = next.tickets.find((t) => t.id === command.id);
        assert(t, "La solicitud no existe.");
        const before = { ...t };
        t.boardApproval = command.approved ? "Aprobado" : "Rechazado";
        t.boardActaNumber = command.acta;
        event.reason = command.reason;
        log(
          "Junta directiva",
          "Resolver solicitud",
          t.id,
          `${t.title} · ${t.boardApproval} · ${command.acta}`,
          before,
          t,
        );
        break;
      }
      case "record":
        assert(
          actor?.role === "admin" ||
            actor?.role === "board" ||
            (actor?.role === "resident" && command.entityId === actor.unitId),
          "No puede consultar esta información.",
        );
        log(command.module, command.action, command.entityId, command.summary);
        break;
    }
    for (const notice of next.news) {
      const expire =
        notice.unpublishDate &&
        notice.unpublishDate <= today() &&
        notice.status === "active";
      const publish =
        notice.status === "scheduled" &&
        notice.publishScheduleDate &&
        notice.publishScheduleDate <= today();
      if (!expire && !publish) continue;
      const before = notice.status;
      notice.status = expire ? "expired" : "active";
      child(
        "Comunicaciones",
        expire ? "Archivar por fecha" : "Publicar por fecha",
        notice.id,
        notice.title,
        { status: before },
        { status: notice.status },
      );
      Object.assign(children.at(-1)!, {
        actorId: "system",
        actorName: "Sistema de demostración",
        role: "system",
        origin: "system",
      });
    }
    // Relacionar efectos financieros con la ficha y las facturas, bajo la misma operación.
    for (const unit of next.units) {
      const old = state.units.find((u) => u.id === unit.id);
      if (old && old.currentBalance !== unit.currentBalance)
        child(
          "Filiales",
          "Actualizar saldo",
          unit.id,
          `${unit.number} · ${money(old.currentBalance)} → ${money(unit.currentBalance)}`,
          { currentBalance: old.currentBalance },
          { currentBalance: unit.currentBalance },
        );
    }
    for (const invoice of next.invoices) {
      const old = state.invoices.find((i) => i.id === invoice.id);
      if (
        old &&
        (old.paidAmount !== invoice.paidAmount || old.status !== invoice.status)
      )
        child(
          "Facturas",
          "Conciliar factura",
          invoice.id,
          `${invoice.unitNumber} · ${invoice.id}`,
          { paidAmount: old.paidAmount || 0, status: old.status },
          { paidAmount: invoice.paidAmount || 0, status: invoice.status },
        );
    }
    let sequence = state.audit.at(-1)?.sequence || 0;
    children.forEach((e) => {
      e.sequence = ++sequence;
      next.audit.push(e);
    });
    event.sequence = ++sequence;
    next.audit.push(event);
    return next;
  } catch (error) {
    event.outcome = "blocked";
    event.reason =
      error instanceof Error ? error.message : "No se completó la operación.";
    event.summary = event.reason;
    event.action ||= command.kind;
    // Ningún cambio de negocio sobrevive a un comando fallido.
    return { ...state, audit: [...state.audit, event] };
  }
}
