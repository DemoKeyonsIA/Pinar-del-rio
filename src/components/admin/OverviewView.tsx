import type { WorkspaceModuleProps } from "./WorkspaceModuleProps";
import { money, today } from "../../domain/demo";
import {
  Building2,
  ArrowUpRight,
  ArrowRight,
  Plus,
  CalendarDays,
  Check,
  Landmark,
  Wrench,
  Wallet,
  Clock3,
  ArrowDownLeft,
  Megaphone,
  Upload,
} from "lucide-react";
import { DataTable } from "./DataTable";
import { AuditView } from "./AuditView";
import { Metric } from "./AdminWidgets";
export function OverviewView({
  s,
  setSub,
  filter,
  setFilter,
  setEditor,
  setModal,
  inspect,
  navigate,
  month,
}: WorkspaceModuleProps) {
  const pending = s.payments.filter((p) =>
    ["reported", "pending_validation"].includes(p.status),
  );
  const open = s.tickets.filter(
    (t) => !["resuelto", "cerrado"].includes(t.status),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CADA DÍA, UNA COMUNIDAD MEJOR</span>
          <h1>Todo en su lugar.</h1>
          <p>Una mirada clara a lo que necesita su atención hoy.</p>
        </div>
        <div className="heading-actions">
          <span className="date-chip">
            <CalendarDays size={16} />
            {new Intl.DateTimeFormat("es-CR", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "America/Costa_Rica",
            }).format(new Date())}
          </span>
          <button className="button primary" onClick={() => setModal("cash")}>
            <Plus size={17} /> Registrar recibo
          </button>
        </div>
      </div>
      <div className="metric-grid">
        <Metric
          label="Saldo pendiente"
          value={money(
            s.units.reduce((n, u) => n + Math.max(0, u.currentBalance), 0),
          )}
          note={`${s.units.filter((u) => u.currentBalance > 0).length} filiales con saldo por cobrar`}
          icon={<Wallet size={19} />}
          onClick={() => {
            navigate("treasury");
            setSub("receivables");
          }}
        />
        <Metric
          label="Recaudación del mes"
          value={money(
            s.payments
              .filter(
                (p) =>
                  p.status === "applied" &&
                  p.date.startsWith(today().slice(0, 7)),
              )
              .reduce((n, p) => n + p.amount, 0),
          )}
          note={month}
          icon={<ArrowDownLeft size={19} />}
          onClick={() => {
            navigate("treasury");
            setFilter("applied");
          }}
        />
        <Metric
          label="Pagos por validar"
          value={String(pending.length).padStart(2, "0")}
          note={`${money(pending.reduce((n, p) => n + p.amount, 0))} por revisar`}
          icon={<Clock3 size={19} />}
          onClick={() => {
            navigate("treasury");
            setFilter("pending_validation");
          }}
        />
        <Metric
          label="Incidencias abiertas"
          value={String(open.length).padStart(2, "0")}
          note={`${open.filter((t) => ["alta", "urgente"].includes(t.priority)).length} con prioridad alta o urgente`}
          icon={<Wrench size={19} />}
          onClick={() => navigate("maintenance")}
        />
      </div>
      <div className="overview-main">
        <section className="content-card attention-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PRIMERO LO IMPORTANTE</span>
              <h2>Requiere su atención</h2>
            </div>
            <span className="badge review">
              {pending.length + open.length} pendientes
            </span>
          </div>
          {!pending.length && !open.length ? (
            <div className="empty-state">
              <Check />
              <h3>Todo al día</h3>
              <p>No hay pagos ni incidencias pendientes.</p>
            </div>
          ) : (
            <div className="attention-list">
              {pending.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    navigate("treasury");
                    setFilter("pending_validation");
                  }}
                >
                  <span className="attention-icon">
                    <Landmark size={19} />
                  </span>
                  <span>
                    <strong>Validar pago · {p.unitNumber}</strong>
                    <small>
                      {p.payerName} · {p.reference}
                    </small>
                  </span>
                  <span className="attention-amount">
                    {money(p.amount)}
                    <small>Por validar</small>
                  </span>
                  <ArrowUpRight size={18} />
                </button>
              ))}
              {open
                .sort(
                  (a, b) =>
                    ["urgente", "alta", "media", "baja"].indexOf(a.priority) -
                    ["urgente", "alta", "media", "baja"].indexOf(b.priority),
                )
                .slice(0, 2)
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      navigate("maintenance");
                      inspect(t, t.title);
                    }}
                  >
                    <span className="attention-icon soft">
                      <Wrench size={19} />
                    </span>
                    <span>
                      <strong>{t.title}</strong>
                      <small>
                        {t.location} · {t.assignedVendor || "Sin responsable"}
                      </small>
                    </span>
                    <span className="badge review">{t.priority}</span>
                    <ArrowUpRight size={18} />
                  </button>
                ))}
            </div>
          )}
          <button
            className="text-action attention-footer"
            onClick={() => {
              navigate("treasury");
              setFilter("pending_validation");
            }}
          >
            Revisar pagos pendientes <ArrowRight size={16} />
          </button>
        </section>
        <section className="community-card">
          <span className="eyebrow">SU COMUNIDAD, CONECTADA</span>
          <div className="community-orbit" aria-hidden="true">
            <Building2 size={36} />
            <span />
            <i />
          </div>
          <h2>
            Los detalles hacen
            <br />
            la diferencia.
          </h2>
          <p>
            {s.units.length} filiales. Un espacio compartido que cuidamos entre
            todos.
          </p>
          <button onClick={() => navigate("units")}>
            Conocer las filiales <ArrowUpRight size={17} />
          </button>
        </section>
      </div>
      <div className="overview-bottom">
        <section className="content-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EL TRABAJO DE CADA DÍA</span>
              <h2>Actividad reciente</h2>
            </div>
            <button className="text-action" onClick={() => navigate("audit")}>
              Ver historial <ArrowUpRight size={16} />
            </button>
          </div>
          <AuditView compact events={s.audit} />
        </section>
        <section className="content-card quick-actions">
          <span className="eyebrow">A UN PASO</span>
          <h2>Accesos rápidos</h2>
          {[
            {
              label: "Registrar un recibo",
              icon: Landmark,
              action: () => setModal("cash"),
            },
            {
              label: "Crear un comunicado",
              icon: Megaphone,
              action: () => setEditor({ collection: "news" }),
            },
            {
              label: "Reportar mantenimiento",
              icon: Wrench,
              action: () => setEditor({ collection: "tickets" }),
            },
            {
              label: "Importar un archivo",
              icon: Upload,
              action: () => navigate("imports"),
            },
          ].map((a) => (
            <button key={a.label} onClick={a.action}>
              <a.icon size={18} />
              {a.label}
              <ArrowUpRight size={16} />
            </button>
          ))}
        </section>
      </div>
    </>
  );
}
