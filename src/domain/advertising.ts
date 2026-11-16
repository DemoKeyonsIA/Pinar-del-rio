import type { DemoState } from "./demo";
import type { UserProfile } from "../types";

export interface AdPolicy {
  preferential: number | null;
  general: number | null;
  durationDays: number | null;
  version: number;
}
export const DEFAULT_AD_POLICY: AdPolicy = {
  preferential: null,
  general: null,
  durationDays: null,
  version: 0,
};
export type AdStatus =
  | "draft"
  | "submitted"
  | "changes"
  | "approved"
  | "rejected"
  | "published"
  | "withdrawn";
export interface AdQuote {
  tier: "benefit" | "preferential" | "general";
  amount: number | null;
  percent: number;
  billed: number;
  paid: number;
  used: boolean;
  policyVersion: number;
  at: string;
}
export interface AdInput {
  id?: string;
  unitId?: string;
  advertiser: string;
  title: string;
  category: string;
  content: string;
  contact: string;
  month: string;
  image: string;
}
export interface AdPayment {
  id: string;
  amount: number;
  reference: string;
  proof: string;
  status: "pending" | "validated" | "rejected" | "voided";
  reportedAt: string;
  reportedBy: string;
  resolvedAt?: string;
  resolvedBy?: string;
  reason?: string;
}
export interface Advertisement {
  id: string;
  unitId?: string;
  advertiser: string;
  title: string;
  category: string;
  content: string;
  contact: string;
  month: string;
  image: string;
  status: AdStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  quote: AdQuote;
  payments: AdPayment[];
  reviewedAt?: string;
  reviewedBy?: string;
  reviewReason?: string;
  publishedAt?: string;
  publishedOn?: string;
  publishedBy?: string;
  expiresOn?: string;
  benefitConsumedAt?: string;
}
export type AdCommand =
  | { kind: "adSave"; input: AdInput; submit: boolean }
  | {
      kind: "adPolicy";
      preferential: number;
      general: number;
      durationDays: number;
      reason: string;
    }
  | {
      kind: "adDecision";
      id: string;
      decision:
        "approve" | "changes" | "reject" | "publish" | "withdraw" | "quote";
      reason: string;
    }
  | { kind: "adPayment"; id: string; reference: string; proof: string }
  | {
      kind: "adResolvePayment";
      id: string;
      paymentId: string;
      decision: "validated" | "rejected" | "voided";
      reason: string;
    };
export const adStatusLabels: Record<AdStatus, string> = {
  draft: "Borrador",
  submitted: "En revisión",
  changes: "Requiere cambios",
  approved: "Contenido aprobado",
  rejected: "Rechazada",
  published: "Publicado",
  withdrawn: "Retirado",
};
export const tierLabels = {
  benefit: "Beneficio mensual",
  preferential: "Tarifa preferencial",
  general: "Tarifa general",
};
export const paymentLabels = {
  pending: "Por validar",
  validated: "Validado",
  rejected: "Rechazado",
  voided: "Anulado",
};
function check(value: unknown, text: string): asserts value {
  if (!value) throw new Error(text);
}
const normalized = (s: string) =>
  s.trim().toLocaleLowerCase("es").replace(/\s/g, "");
export function adQuote(
  s: DemoState,
  unitId: string | undefined,
  month: string,
  at: string,
  ignoreId?: string,
): AdQuote {
  const invoices = s.invoices.filter(
    (i) =>
      i.unitId === unitId &&
      !i.id.startsWith("OPEN-") &&
      i.issueDate.slice(0, 7) === month,
  );
  const billed = invoices.reduce((n, i) => n + i.total, 0);
  const paid = invoices.reduce(
    (n, i) =>
      n +
      Math.min(i.total, i.paidAmount ?? (i.status === "paid" ? i.total : 0)),
    0,
  );
  const percent =
    billed > 0 ? Math.min(100, Math.floor((paid / billed) * 10000) / 100) : 0;
  const used =
    !!unitId &&
    (s.advertisements || []).some(
      (a) =>
        a.id !== ignoreId &&
        a.unitId === unitId &&
        a.month === month &&
        !!a.benefitConsumedAt,
    );
  const tier =
    !unitId || percent < 50
      ? "general"
      : percent >= 100 && !used
        ? "benefit"
        : "preferential";
  const policy = s.adPolicy || DEFAULT_AD_POLICY;
  return {
    tier,
    amount: tier === "benefit" ? 0 : policy[tier],
    percent,
    billed,
    paid,
    used,
    policyVersion: policy.version,
    at,
  };
}
export function adIsVisible(a: Advertisement, date: string) {
  return (
    a.status === "published" &&
    !!a.publishedOn &&
    a.publishedOn <= date &&
    !!a.expiresOn &&
    a.expiresOn >= date
  );
}
export function adPaymentState(a: Advertisement) {
  return a.quote.amount === null
    ? "Tarifa por definir"
    : a.quote.amount === 0
      ? "Sin cobro"
      : a.payments.length
        ? paymentLabels[a.payments.at(-1)!.status]
        : "No reportado";
}
function safeAd(a: Advertisement | undefined) {
  return a
    ? {
        ...a,
        image: a.image ? "[imagen]" : "",
        payments: a.payments.map((p) => ({
          ...p,
          proof: p.proof ? "[comprobante]" : "",
        })),
      }
    : {};
}
function checkImage(image: string, pdf = false) {
  check(
    !image ||
      (image.length <= 2800000 &&
        (pdf
          ? /^data:(image\/(png|jpeg)|application\/pdf);base64,[A-Za-z0-9+/=]+$/
          : /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/
        ).test(image)),
    "Adjunte JPG, PNG o PDF válido de hasta 2 MB; las imágenes de anuncios deben ser JPG o PNG.",
  );
}
export function mutateAdvertisement(
  s: DemoState,
  user: UserProfile | null,
  command: AdCommand,
  at: string,
  date: string,
) {
  check(user, "Seleccione un perfil.");
  const admin = user.role === "admin";
  const action = (
    name: string,
    id: string,
    summary: string,
    before: object,
    after: object,
  ) => ({ name, id, summary, before, after });
  if (command.kind === "adPolicy") {
    check(admin, "Solo administración configura las tarifas.");
    check(
      [command.preferential, command.general].every(
        (n) => Number.isFinite(n) && n >= 0.01 && n <= 10000000,
      ) && command.general >= command.preferential,
      "Indique tarifas positivas; la general no puede ser menor que la preferencial.",
    );
    check(
      Number.isInteger(command.durationDays) &&
        command.durationDays >= 1 &&
        command.durationDays <= 90,
      "La duración debe ser de 1 a 90 días.",
    );
    check(command.reason.trim(), "Indique el motivo del cambio.");
    const before = s.adPolicy || DEFAULT_AD_POLICY;
    s.adPolicy = {
      preferential: Math.round(command.preferential * 100) / 100,
      general: Math.round(command.general * 100) / 100,
      durationDays: command.durationDays,
      version: before.version + 1,
    };
    return action(
      "Configurar tarifas de anuncios",
      "ad-policy",
      command.reason.trim(),
      before,
      s.adPolicy,
    );
  }
  if (command.kind === "adSave") {
    const i = command.input;
    const old = (s.advertisements || []).find((a) => a.id === i.id);
    check(!i.id || old, "La solicitud no existe.");
    const unitId = old
      ? old.unitId
      : admin
        ? i.unitId || undefined
        : user.unitId;
    check(
      admin || (user.role === "resident" && unitId && unitId === user.unitId),
      "Solo puede solicitar anuncios para su filial.",
    );
    check(
      !unitId || s.units.some((u) => u.id === unitId),
      "La filial no existe.",
    );
    check(
      !old || ["draft", "changes", "rejected"].includes(old.status),
      "La solicitud no se puede editar en este estado.",
    );
    check(
      !old?.payments.some((p) => ["pending", "validated"].includes(p.status)),
      "Debe resolver o anular el registro de pago antes de editar.",
    );
    check(
      /^\d{4}-(0[1-9]|1[0-2])$/.test(i.month) && i.month >= date.slice(0, 7),
      "Seleccione el mes actual o uno futuro.",
    );
    check(
      i.title.trim().length >= 3 &&
        i.title.length <= 80 &&
        i.content.length <= 1500 &&
        i.contact.length <= 150 &&
        i.advertiser.length <= 100,
      "Revise título y longitud del contenido.",
    );
    if (command.submit)
      check(
        i.content.trim().length >= 10 &&
          i.contact.trim().length >= 5 &&
          i.advertiser.trim().length >= 2,
        "Complete descripción, anunciante y contacto antes de enviar a revisión.",
      );
    check(
      ["Servicios", "Productos", "Clases", "Eventos"].includes(i.category),
      "Seleccione una categoría válida.",
    );
    checkImage(i.image);
    const ad: Advertisement = {
      id: old?.id || crypto.randomUUID(),
      unitId,
      advertiser: i.advertiser.trim(),
      title: i.title.trim(),
      category: i.category,
      content: i.content.trim(),
      contact: i.contact.trim(),
      month: i.month,
      image: i.image,
      status: command.submit ? "submitted" : "draft",
      createdAt: old?.createdAt || at,
      createdBy: old?.createdBy || user.name,
      updatedAt: at,
      quote: adQuote(s, unitId, i.month, at, old?.id),
      payments: old?.payments || [],
    };
    s.advertisements = [
      ad,
      ...(s.advertisements || []).filter((a) => a.id !== ad.id),
    ];
    return action(
      command.submit
        ? "Enviar anuncio a revisión"
        : "Guardar borrador de anuncio",
      ad.id,
      `${ad.advertiser} · ${ad.title}`,
      safeAd(old),
      safeAd(ad),
    );
  }
  const ad = s.advertisements?.find((a) => a.id === command.id);
  check(ad, "La solicitud no existe.");
  check(
    admin ||
      (user.role === "resident" && !!ad.unitId && user.unitId === ad.unitId),
    "No puede acceder a esta solicitud.",
  );
  const before = safeAd(structuredClone(ad));
  if (command.kind === "adPayment") {
    check(
      ad.status === "approved",
      "El contenido debe ser aprobado antes de reportar un pago.",
    );
    check(
      ad.quote.amount !== null && ad.quote.amount > 0,
      "Este anuncio no tiene un cobro definido.",
    );
    check(
      !ad.payments.some((p) => ["pending", "validated"].includes(p.status)),
      "Ya hay un pago reportado o validado.",
    );
    const ref = command.reference.trim();
    check(
      ref.length >= 4 && ref.length <= 80,
      "Indique una referencia de 4 a 80 caracteres.",
    );
    check(
      !s.payments.some((p) => normalized(p.reference) === normalized(ref)) &&
        !(s.advertisements || []).some((a) =>
          a.payments.some((p) => normalized(p.reference) === normalized(ref)),
        ),
      "La referencia ya se utilizó en un pago.",
    );
    checkImage(command.proof, true);
    ad.payments.push({
      id: crypto.randomUUID(),
      amount: ad.quote.amount,
      reference: ref,
      proof: command.proof,
      status: "pending",
      reportedAt: at,
      reportedBy: user.name,
    });
    ad.updatedAt = at;
    return action(
      "Reportar pago publicitario",
      ad.id,
      `${ad.title} · ${ref}`,
      before,
      safeAd(ad),
    );
  }
  check(admin, "La revisión y publicación corresponden a administración.");
  check(
    command.reason.trim() && command.reason.length <= 500,
    "Indique un motivo de hasta 500 caracteres.",
  );
  if (command.kind === "adResolvePayment") {
    const payment = ad.payments.find((p) => p.id === command.paymentId);
    check(
      payment && ad.status !== "published",
      "El pago no existe o el anuncio está publicado; retírelo antes de anular su pago.",
    );
    check(
      ["validated", "rejected", "voided"].includes(command.decision),
      "Decisión de pago inválida.",
    );
    check(
      command.decision === "voided"
        ? ["pending", "validated"].includes(payment.status)
        : payment.status === "pending",
      "El pago ya fue resuelto.",
    );
    payment.status = command.decision;
    payment.resolvedAt = at;
    payment.resolvedBy = user.name;
    payment.reason = command.reason.trim();
    return action(
      `${command.decision === "validated" ? "Validar" : command.decision === "rejected" ? "Rechazar" : "Anular registro de"} pago publicitario`,
      ad.id,
      `${ad.title} · ${payment.reference} · ${command.reason}`,
      before,
      safeAd(ad),
    );
  }
  if (command.decision === "quote") {
    check(
      ["submitted", "approved", "changes"].includes(ad.status) &&
        !ad.payments.some((p) => ["pending", "validated"].includes(p.status)),
      "No se puede actualizar la tarifa con pagos vigentes o en este estado.",
    );
    ad.quote = adQuote(s, ad.unitId, ad.month, at, ad.id);
  } else if (command.decision === "approve") {
    check(
      ad.status === "submitted",
      "Solo se aprueban solicitudes en revisión.",
    );
    ad.status = "approved";
    ad.reviewedAt = at;
    ad.reviewedBy = user.name;
    ad.reviewReason = command.reason.trim();
  } else if (["changes", "reject"].includes(command.decision)) {
    check(
      ["submitted", "approved"].includes(ad.status) &&
        !ad.payments.some((p) => ["pending", "validated"].includes(p.status)),
      "Resuelva los pagos vigentes antes de devolver o rechazar el contenido.",
    );
    ad.status = command.decision === "changes" ? "changes" : "rejected";
    ad.reviewedAt = at;
    ad.reviewedBy = user.name;
    ad.reviewReason = command.reason.trim();
  } else if (command.decision === "publish") {
    check(
      ad.status === "approved" && ad.reviewedBy,
      "El contenido debe tener aprobación explícita de administración.",
    );
    check(
      ad.month === date.slice(0, 7),
      "La publicación manual debe realizarse dentro del mes solicitado.",
    );
    const duration = s.adPolicy?.durationDays;
    check(
      duration && Number.isInteger(duration),
      "Configure la duración de las publicaciones antes de publicar.",
    );
    const current = adQuote(s, ad.unitId, ad.month, at, ad.id);
    check(
      current.tier === ad.quote.tier,
      "Cambió el beneficio o la condición de la cuota. Revise y actualice la tarifa antes de publicar.",
    );
    check(
      ad.quote.amount !== null &&
        (ad.quote.amount === 0 ||
          ad.payments.some(
            (p) => p.status === "validated" && p.amount === ad.quote.amount,
          )),
      "La tarifa debe estar definida y el pago validado antes de publicar.",
    );
    ad.status = "published";
    ad.publishedAt = at;
    ad.publishedOn = date;
    ad.publishedBy = user.name;
    const end = new Date(date + "T12:00:00Z");
    end.setUTCDate(end.getUTCDate() + duration - 1);
    const monthEnd = new Date(
      Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 0),
    )
      .toISOString()
      .slice(0, 10);
    ad.expiresOn =
      end.toISOString().slice(0, 10) < monthEnd
        ? end.toISOString().slice(0, 10)
        : monthEnd;
    if (ad.quote.tier === "benefit") ad.benefitConsumedAt = at;
  } else if (command.decision === "withdraw") {
    check(ad.status === "published", "Solo se retiran anuncios publicados.");
    ad.status = "withdrawn";
  } else throw new Error("Decisión no válida.");
  ad.updatedAt = at;
  const labels = {
    quote: "Actualizar tarifa de anuncio",
    approve: "Aprobar contenido de anuncio",
    changes: "Solicitar correcciones de anuncio",
    reject: "Rechazar anuncio",
    publish: "Publicar anuncio manualmente",
    withdraw: "Retirar anuncio",
  };
  return action(
    labels[command.decision],
    ad.id,
    `${ad.title} · ${command.reason}`,
    before,
    safeAd(ad),
  );
}
