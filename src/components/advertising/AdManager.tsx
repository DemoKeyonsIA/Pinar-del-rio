import { useEffect, useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import type { UserProfile } from "../../types";
import { money, today, type DemoState } from "../../domain/demo";
import {
  adIsVisible,
  adQuote,
  adStatusLabels,
  adPaymentState,
  DEFAULT_AD_POLICY,
  type AdStatus,
  type Advertisement,
} from "../../domain/advertising";
import {
  AdEditor,
  AdDetails,
  AdPreview,
  AdQuoteCard,
  adPrice,
  adLabel,
  type AdRun,
} from "./AdShared";
import { DataTable } from "../admin/DataTable";

export function AdManager({
  state,
  user,
  run,
  requestKey = 0,
}: {
  state: DemoState;
  user: UserProfile;
  run: AdRun;
  requestKey?: number;
}) {
  const admin = user.role === "admin";
  const [editor, setEditor] = useState<Advertisement | "new" | null>(null),
    [selected, setSelected] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [filter, setFilter] = useState("");
  const [showMine, setShowMine] = useState(false);
  useEffect(() => {
    if (requestKey > 0) setEditor("new");
  }, [requestKey]);
  const currentQuote = adQuote(
    state,
    user.unitId,
    today().slice(0, 7),
    new Date().toISOString(),
  );
  const rows = (state.advertisements || []).filter((a) =>
    admin
      ? a.status !== "draft" || a.createdBy === user.name
      : a.unitId === user.unitId,
  );
  const ad = rows.find((a) => a.id === selected);
  const open = (a: Advertisement) => {
    try {
      run({
        kind: "record",
        module: "Anuncios",
        action: "Consultar solicitud de anuncio",
        entityId: a.id,
        summary: `${a.title} · ${a.status}`,
      });
      setSelected(a.id);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <section
      className="ad-ui ads-module"
      id={admin ? "admin-advertising" : "resident-advertising"}
    >
      {!admin && (
        <section className="ad-benefit-banner">
          <div>
            <span className="ad-eyebrow">Un espacio para su negocio</span>
            <h2>Comparta lo que hace con su comunidad.</h2>
            <p>
              Solicite un anuncio desde Amenidades. Consulte su beneficio o
              tarifa antes de enviarlo.
            </p>
            <p className="ad-banner-price">
              {currentQuote.tier === "benefit"
                ? "Tiene disponible un anuncio sin costo este mes."
                : `${adPrice(currentQuote.amount)} · ${currentQuote.tier === "preferential" ? "Tarifa preferencial" : "Tarifa general"}. Cuota del mes aplicada: ${currentQuote.percent} %.`}
            </p>
            <p className="ad-banner-rule">
              <ShieldCheck size={17} />
              Todos los anuncios requieren revisión y aprobación de
              administración.
            </p>
          </div>
          <button
            className="button primary"
            onClick={() => {
              setEditor("new");
              setMessage("");
            }}
          >
            <Plus size={18} />
            Solicitar anuncio
          </button>
        </section>
      )}
      {admin && (
        <>
          <div className="ad-notice">
            <ShieldCheck size={20} />
            <p>
              <strong>
                Todos los anuncios requieren aprobación de administración.
              </strong>
              <br />
              El beneficio y el pago no publican automáticamente. Cada
              publicación requiere «Publicar ahora».
            </p>
          </div>
          <div className="ad-metrics">
            <div>
              <span>Por revisar</span>
              <strong>
                {rows.filter((a) => a.status === "submitted").length}
              </strong>
            </div>
            <div>
              <span>Pagos por validar</span>
              <strong>
                {
                  rows.filter((a) =>
                    a.payments.some((p) => p.status === "pending"),
                  ).length
                }
              </strong>
            </div>
            <div>
              <span>Publicados vigentes</span>
              <strong>
                {rows.filter((a) => adIsVisible(a, today())).length}
              </strong>
            </div>
            <div>
              <span>Ingresos publicitarios validados</span>
              <strong>
                {money(
                  rows
                    .flatMap((a) => a.payments)
                    .filter((p) => p.status === "validated")
                    .reduce((n, p) => n + p.amount, 0),
                )}
              </strong>
            </div>
          </div>
        </>
      )}
      <div className="ad-list-heading">
        <div>
          <h2>{admin ? "Solicitudes de anuncios" : "Mis anuncios"}</h2>
          <p>
            {admin
              ? "Contenido, condición de la filial y cobros separados de mantenimiento."
              : "Sus solicitudes, revisiones y pagos publicitarios."}
          </p>
        </div>
        {admin ? (
          <button className="button primary" onClick={() => setEditor("new")}>
            <Plus size={17} />
            Registrar solicitud
          </button>
        ) : (
          <button
            className="button secondary"
            aria-expanded={showMine}
            onClick={() => setShowMine(!showMine)}
          >
            {showMine
              ? "Ocultar solicitudes"
              : `Ver mis anuncios (${rows.length})`}
          </button>
        )}
      </div>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="ad-success" role="status">
          {message}
        </p>
      )}
      {(admin || showMine) &&
        (admin ? (
          <DataTable
            caption="Solicitudes de anuncios"
            rows={rows.filter((a) => !filter || a.status === filter)}
            searchPlaceholder="Título, anunciante o filial…"
            filters={
              <select
                aria-label="Estado del anuncio"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                {Object.entries(adStatusLabels).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            }
            columns={[
              {
                key: "title",
                title: "Anuncio",
                value: (a) => `${a.title} ${a.advertiser}`,
                render: (a) => (
                  <>
                    <strong>{a.title}</strong>
                    <small className="ad-table-small">
                      {a.advertiser} ·{" "}
                      {a.unitId
                        ? state.units.find((u) => u.id === a.unitId)?.number
                        : "Externo"}
                    </small>
                  </>
                ),
              },
              { key: "month", title: "Mes", value: (a) => a.month },
              {
                key: "price",
                title: "Tarifa",
                value: (a) => a.quote.amount ?? -1,
                render: (a) => adPrice(a.quote.amount),
              },
              {
                key: "payment",
                title: "Pago",
                value: (a) => adPaymentState(a),
              },
              {
                key: "status",
                title: "Revisión",
                value: (a) => adLabel(a),
                render: (a) => (
                  <span
                    className={`badge ${["rejected", "withdrawn"].includes(a.status) ? "negative" : adIsVisible(a, today()) ? "success" : "review"}`}
                  >
                    {adLabel(a)}
                  </span>
                ),
              },
            ]}
            actions={(a) => (
              <button className="text-action" onClick={() => open(a)}>
                Revisar solicitud
              </button>
            )}
          />
        ) : (
          <div className="ad-own-list">
            {!rows.length && (
              <p className="ad-empty">
                Todavía no tiene solicitudes. Use «Solicitar anuncio» para
                preparar la primera.
              </p>
            )}
            {rows.map((a) => (
              <article key={a.id}>
                <div>
                  <h3>{a.title}</h3>
                  <p>
                    {a.month} · {adLabel(a)}
                  </p>
                  <small>
                    {adPrice(a.quote.amount)} · {adPaymentState(a)}
                  </small>
                </div>
                <button className="button secondary" onClick={() => open(a)}>
                  Ver detalle
                </button>
              </article>
            ))}
          </div>
        ))}
      {!admin && (
        <section className="ad-community">
          <h2>Anuncios de la comunidad</h2>
          <p className="ad-muted">
            Publicaciones comerciales aprobadas y publicadas expresamente por
            administración.
          </p>
          <div className="ad-public-grid">
            {(state.advertisements || [])
              .filter((a) => adIsVisible(a, today()))
              .map((a) => (
                <AdPreview key={a.id} ad={a} />
              ))}
          </div>
          {!(state.advertisements || []).some((a) =>
            adIsVisible(a, today()),
          ) && (
            <p className="ad-empty">No hay anuncios comerciales vigentes.</p>
          )}
        </section>
      )}
      {ad && !editor && (
        <AdDetails
          key={ad.id}
          ad={ad}
          state={state}
          user={user}
          run={run}
          onClose={() => setSelected("")}
          onEdit={() => setEditor(ad)}
        />
      )}
      {editor && (
        <AdEditor
          state={state}
          user={user}
          run={run}
          ad={editor === "new" ? undefined : editor}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setSelected("");
            setShowMine(true);
            setMessage(
              "Solicitud guardada. Enviar a revisión no publica el anuncio.",
            );
          }}
        />
      )}
    </section>
  );
}

export function AdRates({ state, run }: { state: DemoState; run: AdRun }) {
  const policy = state.adPolicy || DEFAULT_AD_POLICY;
  const [preferential, setPreferential] = useState(
      policy.preferential?.toString() || "",
    ),
    [general, setGeneral] = useState(policy.general?.toString() || ""),
    [duration, setDuration] = useState(policy.durationDays?.toString() || ""),
    [reason, setReason] = useState(""),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  return (
    <section className="ad-ui ad-rates">
      <h2>Tarifas y reglas</h2>
      <p className="ad-muted">
        Un anuncio gratuito por filial y mes con el 100 % de la cuota mensual
        aplicada. El beneficio se consume al publicar y no se acumula.
      </p>
      <div className="ad-rule">
        <strong>Aprobación obligatoria para todos</strong>Los condóminos con
        entre 50 % y menos del 100 % pagado tienen tarifa preferencial. Quienes
        pagan menos del 50 % y los externos tienen tarifa general. Los anuncios
        adicionales de un condómino con cuota completa usan la tarifa
        preferencial.
      </div>
      <form
        className="ad-fields"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            run({
              kind: "adPolicy",
              preferential: Number(preferential),
              general: Number(general),
              durationDays: Number(duration),
              reason,
            });
            setSaved(true);
            setError("");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <div className="ad-two">
          <label>
            Tarifa preferencial (₡) *
            <input
              required
              type="number"
              min="0.01"
              max="10000000"
              step="0.01"
              value={preferential}
              placeholder="Por definir"
              onChange={(e) => {
                setPreferential(e.target.value);
                setSaved(false);
              }}
            />
          </label>
          <label>
            Tarifa general (₡) *
            <input
              required
              type="number"
              min="0.01"
              max="10000000"
              step="0.01"
              value={general}
              placeholder="Por definir"
              onChange={(e) => {
                setGeneral(e.target.value);
                setSaved(false);
              }}
            />
          </label>
        </div>
        <label>
          Duración máxima de publicación (días) *
          <input
            required
            type="number"
            min="1"
            max="90"
            value={duration}
            placeholder="Por definir"
            onChange={(e) => {
              setDuration(e.target.value);
              setSaved(false);
            }}
          />
          <small>
            Se limita al último día del mes solicitado. No se publica ni se
            renueva automáticamente.
          </small>
        </label>
        <label>
          Motivo de configuración *
          <textarea
            required
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <p className="ad-muted">
          La condición se calcula con las facturas del mes y sus pagos
          aplicados, sin incluir saldos de apertura. Las cotizaciones guardadas
          no cambian automáticamente al modificar tarifas; use «Actualizar
          tarifa» antes del pago.
        </p>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        {saved && (
          <p className="ad-success" role="status">
            Tarifas guardadas y registradas en la bitácora.
          </p>
        )}
        <div className="ad-actions">
          <button className="button primary">Guardar tarifas y reglas</button>
        </div>
      </form>
    </section>
  );
}
