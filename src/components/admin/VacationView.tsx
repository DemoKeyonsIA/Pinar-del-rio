import { useId, useRef, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Wallet,
  Plus,
  Search,
  ArrowUpRight,
  Check,
  X,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react";
import type { Command, DemoState } from "../../domain/demo";
import { today } from "../../domain/demo";
import { vacationBalance } from "../../domain/personnel";
import {
  allVacationItems,
  availableActions,
  dateRange,
  initials,
  scopedRequests,
  vacationActions,
  vacationStats,
  type RequestScope,
  type VacationItem,
} from "../../domain/vacationView";
import { Dialog } from "../common/Dialog";
import { VacationCalendar } from "./VacationCalendar";
import { VacationRequest } from "./VacationRequest";
import { VacationStatus } from "./VacationShared";
import "../../vacations.css";

const views = [
  { id: "calendar", label: "Calendario", icon: CalendarDays },
  { id: "requests", label: "Solicitudes", icon: ClipboardList },
  { id: "balances", label: "Saldos", icon: Wallet },
] as const;
type View = (typeof views)[number]["id"];
export function VacationView({
  state: s,
  run,
}: {
  state: DemoState;
  run: (c: Command) => DemoState;
}) {
  const id = useId(),
    tabs = useRef(new Map<View, HTMLButtonElement>());
  const [view, setView] = useState<View>("calendar"),
    [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(today().slice(0, 7)),
    [selectedDate, setSelectedDate] = useState("");
  const [scope, setScope] = useState<RequestScope>("pending"),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(0);
  const [create, setCreate] = useState<{
      employeeId: string;
      date: string;
    } | null>(null),
    [detailId, setDetailId] = useState("");
  const [decision, setDecision] = useState<keyof typeof vacationActions>(),
    [reason, setReason] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const rows = allVacationItems(s.employees),
    filtered = rows.filter((v) => !employeeId || v.employeeId === employeeId),
    stats = vacationStats(filtered, today());
  const requests = scopedRequests(filtered, scope, query),
    pages = Math.max(1, Math.ceil(requests.length / 8)),
    currentPage = Math.min(page, pages - 1);
  const detail = rows.find((v) => v.id === detailId);
  const employees = s.employees.filter(
    (e) =>
      (!employeeId || e.id === employeeId) &&
      (employeeId || e.status !== "inactivo"),
  );
  const request = (personId = employeeId) => {
    setCreate({
      date: view === "calendar" && selectedDate ? selectedDate : today(),
      employeeId:
        s.employees.find((e) => e.id === personId && e.status !== "inactivo")
          ?.id || "",
    });
    setNotice("");
  };
  const changeMonth = (value: string) => {
    if (
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(value) ||
      value < "2000-01" ||
      value > "2100-12"
    )
      return;
    setMonth(value);
    setSelectedDate("");
  };
  const open = (v: VacationItem) => {
    try {
      run({
        kind: "record",
        module: "Vacaciones",
        action: "Consultar solicitud",
        entityId: v.employeeId,
        summary: `Consulta de solicitud · ${v.startDate} a ${v.endDate}`,
      });
      setDetailId(v.id);
      setDecision(undefined);
      setReason("");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const selectView = (target: View) => {
    setView(target);
  };
  return (
    <section className="vac-workspace" aria-label="Vacaciones y disponibilidad">
      <div className="vac-workspace-toolbar">
        <div
          className="vac-view-tabs"
          role="tablist"
          aria-label="Vistas de vacaciones"
        >
          {views.map((item, index) => (
            <button
              key={item.id}
              ref={(node) => {
                if (node) tabs.current.set(item.id, node);
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${item.id}`}
              aria-controls={`${id}-panel-${item.id}`}
              aria-selected={view === item.id}
              tabIndex={view === item.id ? 0 : -1}
              onClick={() => selectView(item.id)}
              onKeyDown={(e) => {
                let target: number | undefined;
                if (e.key === "ArrowRight") target = (index + 1) % views.length;
                else if (e.key === "ArrowLeft")
                  target = (index + views.length - 1) % views.length;
                else if (e.key === "Home") target = 0;
                else if (e.key === "End") target = views.length - 1;
                if (target !== undefined) {
                  e.preventDefault();
                  const next = views[target].id;
                  selectView(next);
                  tabs.current.get(next)?.focus();
                }
              }}
            >
              <item.icon size={16} aria-hidden="true" />
              {item.label}
              {item.id === "requests" && stats.pending > 0 && (
                <span>{stats.pending}</span>
              )}
            </button>
          ))}
        </div>
        <div className="vac-toolbar-actions">
          <label className="vac-team-filter">
            <Users size={15} />
            <span className="sr-only">Filtrar por persona</span>
            <select
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setPage(0);
              }}
            >
              <option value="">Todo el equipo</option>
              {s.employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                  {e.status === "inactivo" ? " (inactivo)" : ""}
                </option>
              ))}
            </select>
          </label>
          <button className="button primary" onClick={() => request()}>
            <Plus size={17} />
            Registrar solicitud
          </button>
        </div>
      </div>
      {notice && (
        <div className="success-message" role="status">
          <span>
            <CheckCircle2 size={17} />
            {notice}
          </span>
          <button
            onClick={() => setNotice("")}
            aria-label="Cerrar confirmación"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {error && !detail && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      <div className="vac-summary" aria-label="Resumen de vacaciones">
        <button
          onClick={() => {
            setView("calendar");
            setMonth(today().slice(0, 7));
            setSelectedDate(today());
          }}
        >
          <span className="vac-summary-icon">
            <CalendarDays size={18} />
          </span>
          <span>
            <strong>{stats.out}</strong>
            <small>Fuera hoy</small>
          </span>
          <ArrowUpRight size={15} />
        </button>
        <button
          onClick={() => {
            const next = stats.upcoming
              ? filtered
                  .filter(
                    (v) => v.status === "aprobado" && v.startDate > today(),
                  )
                  .sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
              : undefined;
            setView("calendar");
            if (next) {
              setMonth(next.startDate.slice(0, 7));
              setSelectedDate(next.startDate);
            } else {
              setMonth(today().slice(0, 7));
              setSelectedDate("");
            }
          }}
        >
          <span className="vac-summary-icon">
            <Users size={18} />
          </span>
          <span>
            <strong>{stats.upcoming}</strong>
            <small>Salidas en 30 días</small>
          </span>
          <ArrowUpRight size={15} />
        </button>
        <button
          onClick={() => {
            setView("requests");
            setScope("pending");
            setQuery("");
            setPage(0);
          }}
        >
          <span className="vac-summary-icon review">
            <Clock3 size={18} />
          </span>
          <span>
            <strong>{stats.pending}</strong>
            <small>Por aprobar</small>
          </span>
          <ArrowUpRight size={15} />
        </button>
      </div>
      {employeeId && (
        <div className="vac-filter-context">
          <span>
            Mostrando:{" "}
            <strong>
              {s.employees.find((e) => e.id === employeeId)?.name}
            </strong>
          </span>
          <button className="text-action" onClick={() => setEmployeeId("")}>
            Ver todo el equipo <X size={12} />
          </button>
        </div>
      )}
      {views.map((item) => (
        <section
          key={item.id}
          id={`${id}-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${item.id}`}
          className="vac-tab-panel"
          hidden={view !== item.id}
          tabIndex={0}
        >
          {view === item.id && item.id === "calendar" && (
            <VacationCalendar
              rows={filtered}
              month={month}
              selectedDate={selectedDate}
              onMonth={changeMonth}
              onDate={setSelectedDate}
              onOpen={open}
              onRequest={() => request()}
            />
          )}
          {view === item.id && item.id === "requests" && (
            <div className="vac-requests-surface">
              <div className="vac-request-toolbar">
                <div>
                  <h2>Solicitudes</h2>
                  <p>
                    Revise las pendientes; consulte las decisiones anteriores en
                    Historial.
                  </p>
                </div>
                <div className="vac-request-controls">
                  <label className="vac-query">
                    <Search size={16} />
                    <input
                      aria-label="Buscar solicitudes"
                      placeholder="Persona o motivo…"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(0);
                      }}
                    />
                  </label>
                  <select
                    aria-label="Mostrar solicitudes"
                    value={scope}
                    onChange={(e) => {
                      setScope(e.target.value as RequestScope);
                      setPage(0);
                    }}
                  >
                    <option value="pending">
                      Por aprobar (
                      {filtered.filter((v) => v.status === "pendiente").length})
                    </option>
                    <option value="approved">
                      Aprobadas (
                      {filtered.filter((v) => v.status === "aprobado").length})
                    </option>
                    <option value="history">Historial</option>
                    <option value="all">Todas</option>
                  </select>
                </div>
              </div>
              <p className="vac-result-count" role="status">
                {requests.length}{" "}
                {requests.length === 1 ? "solicitud" : "solicitudes"}
                {query && (
                  <button className="text-action" onClick={() => setQuery("")}>
                    Limpiar búsqueda
                  </button>
                )}
              </p>
              {!requests.length ? (
                <div className="vac-empty">
                  <ClipboardList size={30} />
                  <h3>
                    {query
                      ? "Sin coincidencias"
                      : scope === "pending"
                        ? "No hay solicitudes por aprobar"
                        : scope === "history"
                          ? "Todavía no hay historial"
                          : "No hay solicitudes en esta vista"}
                  </h3>
                  <p>
                    {query
                      ? "Pruebe con otro nombre o motivo."
                      : scope === "pending"
                        ? "Las nuevas solicitudes aparecerán aquí para su revisión."
                        : "Ajuste el filtro o registre una nueva solicitud."}
                  </p>
                  {scope === "pending" && !query && (
                    <button
                      className="text-action"
                      onClick={() => setScope("history")}
                    >
                      Consultar historial
                      <ArrowUpRight size={15} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="vac-request-list">
                  {requests
                    .slice(currentPage * 8, (currentPage + 1) * 8)
                    .map((v) => (
                      <button
                        key={v.id}
                        className="vac-request-row"
                        onClick={() => open(v)}
                      >
                        <span className="vac-person-avatar">
                          {initials(v.employeeName)}
                        </span>
                        <span className="vac-request-person">
                          <strong>{v.employeeName}</strong>
                          <small>{dateRange(v)}</small>
                        </span>
                        <span className="vac-request-days">
                          <strong>{v.daysTaken}</strong>
                          <small>días</small>
                        </span>
                        <VacationStatus status={v.status} />
                        <span className="vac-request-open">
                          {v.status === "pendiente" ? "Revisar" : "Ver detalle"}
                          <ArrowUpRight size={15} />
                        </span>
                      </button>
                    ))}
                </div>
              )}
              {pages > 1 && (
                <div className="pagination">
                  <span>
                    Página {currentPage + 1} de {pages}
                  </span>
                  <div>
                    <button
                      disabled={!currentPage}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      Anterior
                    </button>
                    <button
                      disabled={currentPage + 1 >= pages}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {view === item.id && item.id === "balances" && (
            <div className="vac-balance-surface">
              <div className="vac-section-title">
                <h2>Saldo por persona</h2>
                <p>
                  Los días disponibles ya consideran las vacaciones aprobadas.
                </p>
              </div>
              <div className="vac-balance-grid">
                {employees.map((e) => {
                  const balance = vacationBalance(e);
                  return (
                    <article className="vac-balance-card" key={e.id}>
                      <header>
                        <span className="vac-person-avatar">
                          {initials(e.name)}
                        </span>
                        <div>
                          <h3>{e.name}</h3>
                          <p>{e.roleTitle}</p>
                        </div>
                      </header>
                      <div className="vac-available">
                        <strong>{balance.available}</strong>
                        <span>días disponibles</span>
                      </div>
                      <dl>
                        <div>
                          <dt>Disfrutados</dt>
                          <dd>{balance.taken}</dd>
                        </div>
                        <div>
                          <dt>Reservados</dt>
                          <dd>{balance.reserved}</dd>
                        </div>
                        <div>
                          <dt>Configurados</dt>
                          <dd>{balance.total}</dd>
                        </div>
                      </dl>
                      <button
                        className="text-action"
                        disabled={
                          e.status === "inactivo" || balance.available === 0
                        }
                        onClick={() => request(e.id)}
                      >
                        Solicitar vacaciones
                        <ArrowUpRight size={15} />
                      </button>
                    </article>
                  );
                })}
              </div>
              <details className="vac-explanation">
                <summary>¿Cómo se calcula el saldo?</summary>
                <p>
                  Disponibles = días configurados − disfrutados − reservados.
                  Aprobar reserva días; cancelar los libera. Se descuentan como
                  disfrutados solo al cerrar la solicitud. Los totales son
                  parámetros de la demo y se ajustan en la ficha del empleado.
                </p>
              </details>
            </div>
          )}
        </section>
      ))}
      {create && (
        <VacationRequest
          initialEmployeeId={create.employeeId}
          initialDate={create.date}
          state={s}
          run={run}
          onClose={() => setCreate(null)}
          onSaved={() => {
            setEmployeeId("");
            setView("requests");
            setScope("pending");
            setQuery("");
            setPage(0);
            setNotice(
              "Solicitud registrada. Ya está disponible para revisión.",
            );
          }}
        />
      )}
      {detail && (
        <Dialog
          title="Solicitud de vacaciones"
          onClose={() => {
            setDetailId("");
            setError("");
          }}
        >
          <div className="vac-detail-heading">
            <span className="vac-person-avatar">
              {initials(detail.employeeName)}
            </span>
            <div>
              <h3>{detail.employeeName}</h3>
              <p>{dateRange(detail)}</p>
            </div>
            <VacationStatus status={detail.status} />
          </div>
          <div className="vac-detail-days">
            <strong>{detail.daysTaken}</strong> días laborables
          </div>
          <p className="form-hint">
            {detail.scheduledDays
              ? "Conteo guardado con el horario de la persona al registrar la solicitud."
              : "Registro histórico: se conserva el intervalo y conteo originales."}
          </p>
          {detail.notes && (
            <div className="vac-detail-note">
              <strong>Notas de la solicitud</strong>
              <p>{detail.notes}</p>
            </div>
          )}
          {detail.resolutionReason && (
            <div className="vac-detail-note">
              <strong>Última decisión</strong>
              <p>{detail.resolutionReason}</p>
              {detail.resolvedBy && <small>{detail.resolvedBy}</small>}
            </div>
          )}
          {!decision ? (
            <div className="form-actions">
              {availableActions(detail, today()).map((action) => (
                <button
                  key={action}
                  className={`button ${["rechazado", "cancelado"].includes(action) ? "danger" : "primary"}`}
                  onClick={() => {
                    setDecision(action);
                    setReason("");
                    setError("");
                  }}
                >
                  {action === "aprobado" && <Check size={16} />}{" "}
                  {vacationActions[action]}
                </button>
              ))}
              {!availableActions(detail, today()).length && (
                <button
                  className="button secondary"
                  onClick={() => setDetailId("")}
                >
                  Cerrar detalle
                </button>
              )}
            </div>
          ) : (
            <form
              className="demo-form vac-decision-form"
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  run({
                    kind: "resolveVacation",
                    employeeId: detail.employeeId,
                    id: detail.id,
                    status: decision,
                    reason,
                  });
                  setNotice(
                    decision === "aprobado"
                      ? `Solicitud aprobada: ${detail.daysTaken} días reservados.`
                      : decision === "cancelado"
                        ? "Solicitud cancelada. Los días reservados se liberaron."
                        : decision === "rechazado"
                          ? "Solicitud rechazada. El motivo quedó registrado."
                          : "Vacaciones marcadas como disfrutadas. El saldo fue actualizado.",
                  );
                  setDetailId("");
                  setDecision(undefined);
                  setError("");
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              <h3>{vacationActions[decision]} solicitud</h3>
              <label>
                Motivo de la decisión *
                <textarea
                  key={decision}
                  autoFocus
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <div className="form-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setDecision(undefined)}
                >
                  Volver
                </button>
                <button
                  className={`button ${["rechazado", "cancelado"].includes(decision) ? "danger" : "primary"}`}
                >
                  Confirmar{" "}
                  {decision === "aprobado"
                    ? "aprobación"
                    : decision === "rechazado"
                      ? "rechazo"
                      : decision === "cancelado"
                        ? "cancelación"
                        : "cierre"}
                </button>
              </div>
            </form>
          )}
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
        </Dialog>
      )}
    </section>
  );
}
