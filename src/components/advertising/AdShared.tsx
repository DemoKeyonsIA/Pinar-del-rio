import { useEffect, useRef, useState } from "react";
import type { UserProfile } from "../../types";
import {
  money,
  stamp,
  today,
  type Command,
  type DemoState,
} from "../../domain/demo";
import {
  adQuote,
  adStatusLabels,
  adPaymentState,
  tierLabels,
  paymentLabels,
  adIsVisible,
  type AdInput,
  type Advertisement,
} from "../../domain/advertising";
import { Dialog } from "../common/Dialog";
import { AuditView } from "../admin/AuditView";
import "../../advertising.css";
export type AdRun = (command: Command) => DemoState;
export const adPrice = (amount: number | null) =>
  amount === null ? "Por definir" : amount === 0 ? "Sin costo" : money(amount);
export const adLabel = (ad: Advertisement) =>
  ad.status === "published" && !adIsVisible(ad, today())
    ? "Finalizado"
    : adStatusLabels[ad.status];
export async function readAdFile(
  file: File | undefined,
  pdf = false,
): Promise<string> {
  if (!file) return "";
  if (
    file.size > 2 * 1024 * 1024 ||
    !(
      pdf
        ? ["image/png", "image/jpeg", "application/pdf"]
        : ["image/png", "image/jpeg"]
    ).includes(file.type)
  )
    throw new Error(
      pdf
        ? "Use un JPG, PNG o PDF de hasta 2 MB."
        : "Use un JPG o PNG de hasta 2 MB.",
    );
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}
export function AdPreview({
  ad,
}: {
  ad: Pick<
    Advertisement,
    "image" | "title" | "content" | "contact" | "advertiser"
  >;
}) {
  return (
    <article className="ad-preview">
      {ad.image && <img src={ad.image} alt={`Imagen de ${ad.title}`} />}
      <span className="ad-eyebrow">Anuncio comercial</span>
      <h3>{ad.title}</h3>
      <p className="ad-content">{ad.content}</p>
      <p className="ad-contact">
        {ad.advertiser} · {ad.contact}
      </p>
    </article>
  );
}
export function AdQuoteCard({
  state,
  unitId,
  month,
  ignoreId,
}: {
  state: DemoState;
  unitId?: string;
  month: string;
  ignoreId?: string;
}) {
  const quote = adQuote(
    state,
    unitId,
    month,
    new Date().toISOString(),
    ignoreId,
  );
  return (
    <aside className="ad-quote">
      <span className="ad-eyebrow">Condición para {month}</span>
      <strong className="ad-price">{adPrice(quote.amount)}</strong>
      <h3>{tierLabels[quote.tier]}</h3>
      <p>
        {unitId
          ? `Cuota del mes aplicada: ${quote.percent} %`
          : "Solicitud de anunciante externo"}
      </p>
      <p className="ad-rule">
        <strong>Revisión obligatoria</strong>Administración debe aprobar y
        publicar el anuncio expresamente.
      </p>
      <details className="ad-quote-conditions">
        <summary>Ver cuota y condiciones del beneficio</summary>
        <dl>
          <div>
            <dt>Cuota del mes aplicada</dt>
            <dd>{unitId ? `${quote.percent} %` : "Externo"}</dd>
          </div>
          <div>
            <dt>Beneficio mensual</dt>
            <dd>
              {quote.used
                ? "Utilizado"
                : quote.tier === "benefit"
                  ? "Disponible"
                  : "No disponible"}
            </dd>
          </div>
        </dl>
        {unitId && !quote.billed && (
          <p>
            No hay una factura de cuota emitida para este mes; no se presume la
            cuota pagada.
          </p>
        )}
        <small>
          Un beneficio por filial y mes, no acumulable. Solo cuentan pagos
          aplicados a la cuota del mes. El beneficio se utiliza al publicar.
        </small>
      </details>
      {quote.amount === null && (
        <p>
          Puede enviar la solicitud. Administración debe definir y comunicar la
          tarifa antes de solicitar el pago.
        </p>
      )}
    </aside>
  );
}

export function AdEditor({
  state,
  user,
  run,
  ad,
  onClose,
  onSaved,
}: {
  state: DemoState;
  user: UserProfile;
  run: AdRun;
  ad?: Advertisement;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [input, setInput] = useState<AdInput>(() =>
    ad
      ? {
          id: ad.id,
          unitId: ad.unitId,
          advertiser: ad.advertiser,
          title: ad.title,
          category: ad.category,
          content: ad.content,
          contact: ad.contact,
          month: ad.month,
          image: ad.image,
        }
      : {
          unitId: user.role === "resident" ? user.unitId : undefined,
          advertiser: user.role === "resident" ? user.name : "",
          title: "",
          category: "Servicios",
          content: "",
          contact: "",
          month: today().slice(0, 7),
          image: "",
        },
  );
  const [review, setReview] = useState(false),
    [error, setError] = useState(""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    formRef.current?.closest("dialog")?.scrollTo(0, 0);
  }, [review]);
  const update = (patch: Partial<AdInput>) => {
    setInput((previous) => ({ ...previous, ...patch }));
    setError("");
    setConsent(false);
  };
  const save = (submit: boolean) => {
    try {
      run({ kind: "adSave", input, submit });
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Dialog
      title={
        review
          ? "Revise su solicitud"
          : ad
            ? "Editar solicitud de anuncio"
            : "Solicitar anuncio"
      }
      onClose={onClose}
      wide
    >
      <form
        className="ad-ui"
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          if (!review) {
            setReview(true);
            setError("");
          } else if (consent) save(true);
        }}
      >
        <p className="ad-intro">
          Todos los anuncios requieren revisión y aprobación de administración.
        </p>
        <div className="ad-compose-grid">
          <div>
            {review ? (
              <>
                <AdPreview ad={input} />
                <p className="ad-rule">
                  Se enviará a revisión. El anuncio todavía no estará publicado.
                </p>
                <label className="ad-check">
                  <input
                    type="checkbox"
                    checked={consent}
                    required
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  Revisé el contenido, el costo indicado y el requisito de
                  aprobación administrativa.
                </label>
              </>
            ) : (
              <div className="ad-fields">
                {user.role === "admin" && (
                  <label>
                    Solicitante
                    <select
                      disabled={!!ad}
                      value={input.unitId || ""}
                      onChange={(e) =>
                        update({ unitId: e.target.value || undefined })
                      }
                    >
                      <option value="">Anunciante externo</option>
                      {state.units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.number} · {u.ownerName}
                        </option>
                      ))}
                    </select>
                    <small>
                      La filial de una solicitud guardada no se puede
                      transferir.
                    </small>
                  </label>
                )}
                <label>
                  Persona o negocio anunciante *
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={input.advertiser}
                    onChange={(e) => update({ advertiser: e.target.value })}
                  />
                </label>
                <label>
                  Título del anuncio *
                  <input
                    required
                    minLength={3}
                    maxLength={80}
                    value={input.title}
                    onChange={(e) => update({ title: e.target.value })}
                  />
                </label>
                <div className="ad-two">
                  <label>
                    Categoría
                    <select
                      value={input.category}
                      onChange={(e) => update({ category: e.target.value })}
                    >
                      {["Servicios", "Productos", "Clases", "Eventos"].map(
                        (x) => (
                          <option key={x}>{x}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <label>
                    Mes solicitado *
                    <input
                      required
                      type="month"
                      min={today().slice(0, 7)}
                      value={input.month}
                      onChange={(e) => update({ month: e.target.value })}
                    />
                  </label>
                </div>
                <label>
                  Descripción *
                  <textarea
                    required
                    minLength={10}
                    maxLength={1500}
                    rows={4}
                    value={input.content}
                    onChange={(e) => update({ content: e.target.value })}
                  />
                </label>
                <label>
                  Contacto público *
                  <input
                    required
                    minLength={5}
                    maxLength={150}
                    value={input.contact}
                    onChange={(e) => update({ contact: e.target.value })}
                    placeholder="Teléfono o correo que desea publicar"
                  />
                </label>
                <label>
                  Imagen del anuncio (opcional)
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      setBusy(true);
                      try {
                        update({ image: await readAdFile(file) });
                      } catch (e) {
                        setError((e as Error).message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                  <small>JPG o PNG · Hasta 2 MB</small>
                </label>
                {input.image && (
                  <>
                    <img
                      className="ad-thumbnail"
                      src={input.image}
                      alt="Vista previa de la imagen adjunta"
                    />
                    <button
                      type="button"
                      className="text-action"
                      onClick={() => update({ image: "" })}
                    >
                      Quitar imagen
                    </button>
                  </>
                )}
                <p className="ad-muted">
                  La publicación se realiza manualmente dentro del mes
                  solicitado. La vigencia será la configurada por
                  administración, hasta el último día de ese mes.
                </p>
              </div>
            )}
          </div>
          <AdQuoteCard
            state={state}
            unitId={input.unitId}
            month={input.month}
            ignoreId={ad?.id}
          />
        </div>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <div className="ad-actions">
          {review ? (
            <button
              type="button"
              className="button secondary"
              onClick={() => setReview(false)}
            >
              Corregir contenido
            </button>
          ) : (
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => save(false)}
            >
              Guardar borrador
            </button>
          )}
          <button
            className="button primary"
            disabled={busy || (review && !consent)}
          >
            {busy
              ? "Leyendo imagen…"
              : review
                ? "Enviar a revisión"
                : "Revisar solicitud"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export function AdDetails({
  state,
  user,
  run,
  ad,
  onClose,
  onEdit,
}: {
  state: DemoState;
  user: UserProfile;
  run: AdRun;
  ad: Advertisement;
  onClose: () => void;
  onEdit: () => void;
}) {
  const admin = user.role === "admin";
  const [action, setAction] = useState(""),
    [reason, setReason] = useState(""),
    [error, setError] = useState(""),
    [reference, setReference] = useState(""),
    [proof, setProof] = useState(""),
    [busy, setBusy] = useState(false);
  const pending = ad.payments.find((p) => p.status === "pending"),
    validated = ad.payments.find((p) => p.status === "validated");
  const editable = ["draft", "changes", "rejected"].includes(ad.status);
  const decide = (choice: string) => {
    setAction(choice);
    setReason("");
    setError("");
  };
  const submitAction = () => {
    try {
      if (action.startsWith("pay:")) {
        const [, decision, paymentId] = action.split(":");
        run({
          kind: "adResolvePayment",
          id: ad.id,
          paymentId,
          decision: decision as "validated" | "rejected" | "voided",
          reason,
        });
      } else
        run({
          kind: "adDecision",
          id: ad.id,
          decision: action as
            "approve" | "changes" | "reject" | "quote" | "publish" | "withdraw",
          reason,
        });
      setAction("");
      setReason("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Dialog title={ad.title} onClose={onClose} wide>
      <div className="ad-ui">
        <div className="ad-detail-heading">
          <span
            className={`badge ${["rejected", "withdrawn"].includes(ad.status) ? "negative" : ad.status === "published" ? "success" : "review"}`}
          >
            {adLabel(ad)}
          </span>
          <span className="ad-muted">
            {ad.month} ·{" "}
            {ad.unitId
              ? state.units.find((u) => u.id === ad.unitId)?.number
              : "Externo"}
          </span>
        </div>
        <div className="ad-compose-grid">
          <div>
            <AdPreview ad={ad} />
            {ad.reviewReason && (
              <p className="ad-rule">
                <strong>Última revisión · {ad.reviewedBy}</strong>
                {ad.reviewReason}
              </p>
            )}
            {ad.status === "submitted" && (
              <p className="ad-rule">
                Su solicitud está en revisión. No está publicada.
              </p>
            )}
            {ad.status === "approved" && (
              <p className="ad-rule">
                El contenido fue aprobado.{" "}
                {ad.quote.amount === null
                  ? "Administración debe definir la tarifa."
                  : ad.quote.amount > 0 && !validated
                    ? "El pago debe validarse antes de que administración publique."
                    : "Administración debe publicar el anuncio expresamente."}
              </p>
            )}
            {ad.publishedAt && (
              <p className="ad-muted">
                Publicado por {ad.publishedBy} · {stamp(ad.publishedAt)} ·
                Vigente hasta {ad.expiresOn}.{" "}
                {ad.benefitConsumedAt && "Beneficio mensual utilizado."}
              </p>
            )}
          </div>
          <aside className="ad-quote">
            <span className="ad-eyebrow">Tarifa guardada</span>
            <strong className="ad-price">{adPrice(ad.quote.amount)}</strong>
            <h3>{tierLabels[ad.quote.tier]}</h3>
            <dl>
              <div>
                <dt>Cuota aplicada al cotizar</dt>
                <dd>{ad.unitId ? `${ad.quote.percent} %` : "Externo"}</dd>
              </div>
              <div>
                <dt>Pago del anuncio</dt>
                <dd>{adPaymentState(ad)}</dd>
              </div>
              <div>
                <dt>Versión de tarifas</dt>
                <dd>{ad.quote.policyVersion}</dd>
              </div>
            </dl>
            <small>
              Creada por {ad.createdBy} · {stamp(ad.createdAt)}. La tarifa queda
              guardada; administración puede revisarla antes del pago.
            </small>
            <p className="ad-rule">
              El pago no reduce la deuda de mantenimiento ni publica el anuncio.
            </p>
          </aside>
        </div>
        {ad.payments.length > 0 && (
          <section className="ad-payment-history">
            <h3>Pagos publicitarios</h3>
            {ad.payments.map((p) => (
              <article key={p.id}>
                <div>
                  <strong>
                    {p.reference} · {money(p.amount)}
                  </strong>
                  <span className="badge review">
                    {paymentLabels[p.status]}
                  </span>
                </div>
                <p>
                  {p.reportedBy} · {stamp(p.reportedAt)}
                </p>
                {p.reason && (
                  <p>
                    {p.resolvedBy} · {p.reason}
                  </p>
                )}
                {p.proof && (
                  <details>
                    <summary>Ver comprobante</summary>
                    {p.proof.startsWith("data:application/pdf") ? (
                      <iframe
                        title={`Comprobante ${p.reference}`}
                        src={p.proof}
                      />
                    ) : (
                      <img src={p.proof} alt={`Comprobante ${p.reference}`} />
                    )}
                  </details>
                )}
              </article>
            ))}
          </section>
        )}
        {ad.status === "approved" &&
          ad.quote.amount !== null &&
          ad.quote.amount > 0 &&
          !pending &&
          !validated && (
            <form
              className="ad-report ad-fields"
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  run({ kind: "adPayment", id: ad.id, reference, proof });
                  setReference("");
                  setProof("");
                  setError("");
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              <h3>Reportar pago del anuncio · {money(ad.quote.amount)}</h3>
              <p className="ad-muted">
                Use los datos de pago indicados por administración. Reportar no
                valida ni ejecuta una transferencia.
              </p>
              <label>
                Referencia del pago *
                <input
                  required
                  minLength={4}
                  maxLength={80}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </label>
              <label>
                Comprobante (opcional)
                <input
                  type="file"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={async (e) => {
                    setBusy(true);
                    try {
                      setProof("");
                      setProof(await readAdFile(e.target.files?.[0], true));
                      setError("");
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </label>
              <button className="button primary" disabled={busy}>
                Reportar pago publicitario
              </button>
            </form>
          )}
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        {action ? (
          <form
            className="ad-decision ad-fields"
            onSubmit={(e) => {
              e.preventDefault();
              submitAction();
            }}
          >
            <h3>
              {action === "publish"
                ? "Publicar anuncio ahora"
                : action === "quote"
                  ? "Actualizar tarifa y condición"
                  : action.includes("voided")
                    ? "Anular registro de pago · no realiza un reembolso"
                    : "Confirmar decisión"}
            </h3>
            <label>
              Motivo de la decisión *
              <textarea
                autoFocus
                required
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <div className="ad-actions">
              <button
                type="button"
                className="button secondary"
                onClick={() => setAction("")}
              >
                Volver
              </button>
              <button
                className={`button ${/reject|withdraw|voided/.test(action) ? "danger" : "primary"}`}
              >
                Confirmar decisión
              </button>
            </div>
          </form>
        ) : (
          <div className="ad-actions">
            {editable && (
              <button className="button primary" onClick={onEdit}>
                Editar solicitud
              </button>
            )}
            {admin && ad.status === "submitted" && (
              <button
                className="button primary"
                onClick={() => decide("approve")}
              >
                Aprobar contenido
              </button>
            )}
            {admin &&
              ["submitted", "approved"].includes(ad.status) &&
              !pending &&
              !validated && (
                <>
                  <button
                    className="button secondary"
                    onClick={() => decide("changes")}
                  >
                    Pedir correcciones
                  </button>
                  <button
                    className="button danger"
                    onClick={() => decide("reject")}
                  >
                    Rechazar solicitud
                  </button>
                </>
              )}
            {admin &&
              ["submitted", "approved", "changes"].includes(ad.status) &&
              !pending &&
              !validated && (
                <button
                  className="button secondary"
                  onClick={() => decide("quote")}
                >
                  Actualizar tarifa
                </button>
              )}
            {admin && pending && ad.status !== "published" && (
              <>
                <button
                  className="button primary"
                  onClick={() => decide(`pay:validated:${pending.id}`)}
                >
                  Validar pago
                </button>
                <button
                  className="button danger"
                  onClick={() => decide(`pay:rejected:${pending.id}`)}
                >
                  Rechazar pago
                </button>
              </>
            )}
            {admin && validated && ad.status !== "published" && (
              <button
                className="button danger"
                onClick={() => decide(`pay:voided:${validated.id}`)}
              >
                Anular registro de pago
              </button>
            )}
            {admin && ad.status === "approved" && (
              <button
                className="button primary"
                onClick={() => decide("publish")}
              >
                Publicar ahora
              </button>
            )}
            {admin && ad.status === "published" && (
              <button
                className="button danger"
                onClick={() => decide("withdraw")}
              >
                Retirar anuncio
              </button>
            )}
          </div>
        )}
        <details className="ad-history">
          <summary>Actividad y trazabilidad</summary>
          <AuditView events={state.audit} entityId={ad.id} />
        </details>
      </div>
    </Dialog>
  );
}
