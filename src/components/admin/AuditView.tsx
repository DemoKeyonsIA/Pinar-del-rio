import { useId, useMemo, useState } from "react";
import { ArrowDownToLine, Search, History } from "lucide-react";
import { stamp, type AuditEvent } from "../../domain/demo";

export function AuditView({
  events,
  onExport,
  entityId,
  compact = false,
  primary = false,
}: {
  events: AuditEvent[];
  onExport?: (rows: AuditEvent[]) => void;
  entityId?: string;
  compact?: boolean;
  primary?: boolean;
}) {
  const detailPrefix = useId();
  const Heading = primary ? "h1" : "h2";
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [module, setModule] = useState("");
  const [outcome, setOutcome] = useState("");
  const [date, setDate] = useState("");
  const [expanded, setExpanded] = useState("");
  const roles: Record<string, string> = {
    admin: "Administradora",
    resident: "Condómino",
    board: "Junta directiva",
    employee: "Empleado",
    visitor: "Visitante",
    system: "Sistema",
  };
  const rows = useMemo(
    () =>
      [...events].reverse().filter(
        (e) =>
          (!entityId ||
            e.entityId === entityId ||
            e.changes.some((c) => c.field.includes(entityId))) &&
          (!query ||
            `${e.actorName} ${e.summary} ${e.entityId} ${e.action}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (!role || e.role === role) &&
          (!module || e.module === module) &&
          (!outcome || e.outcome === outcome) &&
          (!date ||
            new Intl.DateTimeFormat("en-CA", {
              timeZone: "America/Costa_Rica",
            }).format(new Date(e.at)) === date),
      ),
    [events, entityId, query, role, module, outcome, date],
  );
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / 12));
  const currentPage = Math.min(page, pages - 1);
  return (
    <section className="audit-view">
      {!compact && (
        <div className="section-heading">
          <div>
            <span className="eyebrow">HISTORIAL DE LA DEMO</span>
            <Heading>Actividad y trazabilidad</Heading>
            <p>Cada acción conserva su autor, contexto y resultado.</p>
          </div>
          {onExport && (
            <button className="button secondary" onClick={() => onExport(rows)}>
              <ArrowDownToLine size={17} /> Exportar resultado
            </button>
          )}
        </div>
      )}
      {!compact && (
        <div className="filter-bar">
          <label className="search-field">
            <Search size={18} />
            <input
              aria-label="Buscar actividad"
              placeholder="Usuario, filial o referencia…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
            />
          </label>
          <select
            aria-label="Filtrar por rol"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todos los roles</option>
            {Object.entries(roles).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por módulo"
            value={module}
            onChange={(e) => {
              setModule(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todos los módulos</option>
            {[...new Set(events.map((e) => e.module))].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select
            aria-label="Filtrar por resultado"
            value={outcome}
            onChange={(e) => {
              setOutcome(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todos los resultados</option>
            <option value="success">Completado</option>
            <option value="blocked">Bloqueado</option>
            <option value="error">Error</option>
          </select>
          <input
            type="date"
            aria-label="Fecha de actividad"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(0);
            }}
          />
          {(query || role || module || outcome || date) && (
            <button
              className="button ghost"
              onClick={() => {
                setQuery("");
                setRole("");
                setModule("");
                setOutcome("");
                setDate("");
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
      {!rows.length ? (
        <div className="empty-state">
          <History />
          <h3>
            {events.length
              ? "No hay actividad para estos filtros"
              : "La historia comienza aquí"}
          </h3>
          <p>Las operaciones realizadas aparecerán con su autor y resultado.</p>
        </div>
      ) : (
        <div className="activity-list">
          {rows
            .slice(
              compact ? 0 : currentPage * 12,
              compact ? 5 : (currentPage + 1) * 12,
            )
            .map((e) => (
              <article key={e.id} className="activity-item">
                <div
                  className={`activity-dot ${e.outcome !== "success" ? "negative" : ""}`}
                />
                <div className="activity-content">
                  <div className="activity-title">
                    <strong>{e.action}</strong>
                    <span
                      className={`badge ${e.outcome === "success" ? "success" : "negative"}`}
                    >
                      {e.outcome === "success" ? "Completado" : "Bloqueado"}
                    </span>
                  </div>
                  <p>{e.summary}</p>
                  <div className="activity-meta">
                    {e.actorName} · {roles[e.role] || e.role} · {stamp(e.at)}
                  </div>
                  {!compact && (
                    <>
                      <button
                        className="text-action"
                        aria-expanded={expanded === e.id}
                        aria-controls={`${detailPrefix}-${e.id}`}
                        aria-label={`${expanded === e.id ? "Ocultar detalle" : "Ver detalle de cambios"}: ${e.action} · ${e.actorName} · ${stamp(e.at)}`}
                        onClick={() =>
                          setExpanded(expanded === e.id ? "" : e.id)
                        }
                      >
                        {" "}
                        {expanded === e.id
                          ? "Ocultar detalle"
                          : "Ver detalle de cambios"}
                      </button>
                      {expanded === e.id && (
                        <div
                          className="audit-detail"
                          id={`${detailPrefix}-${e.id}`}
                        >
                          <p>
                            Registro: {e.entityId || "Sesión"} · Operación:{" "}
                            {e.operationId}
                          </p>
                          {e.reason && <p>Motivo: {e.reason}</p>}
                          {e.changes.length ? (
                            <div
                              className="table-scroll"
                              role="region"
                              aria-label="Cambios del evento"
                              tabIndex={0}
                            >
                              <table>
                                <caption className="sr-only">
                                  Valores anteriores y posteriores a la acción
                                </caption>
                                <thead>
                                  <tr>
                                    <th>Campo</th>
                                    <th>Antes</th>
                                    <th>Después</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {e.changes.map((c) => (
                                    <tr key={c.field}>
                                      <td>{c.field}</td>
                                      <td>{c.before}</td>
                                      <td>{c.after}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p>Sin modificaciones de campos.</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </article>
            ))}
        </div>
      )}
      {!compact && (
        <div className="pagination">
          <span>
            {rows.length} eventos · página {currentPage + 1} de {pages}
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
    </section>
  );
}
