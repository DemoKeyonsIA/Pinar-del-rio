import { useEffect, useRef, useState, useId, type ReactNode } from "react";
import { Search, ArrowUpDown, FileSearch, Download } from "lucide-react";

export interface Column<T> {
  key: string;
  title: string;
  value: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  numeric?: boolean;
}
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  actions,
  searchPlaceholder = "Buscar registros…",
  empty = "Todavía no hay registros",
  filters,
  onExport,
  caption = "Registros",
}: {
  rows: T[];
  columns: Column<T>[];
  actions?: (row: T) => ReactNode;
  searchPlaceholder?: string;
  empty?: string;
  filters?: ReactNode;
  onExport?: (rows: T[]) => void;
  caption?: string;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [overflow, setOverflow] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("");
  const [direction, setDirection] = useState(1);
  const [page, setPage] = useState(0);
  const filtered = rows.filter((r) =>
    columns.some((c) =>
      String(c.value(r)).toLowerCase().includes(query.toLowerCase()),
    ),
  );
  const column = columns.find((c) => c.key === sort);
  if (column)
    filtered.sort((a, b) => {
      const x = column.value(a),
        y = column.value(b);
      return (
        (typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y), "es")) * direction
      );
    });
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const p = Math.min(page, pages - 1);
  useEffect(() => {
    const container = tableRef.current;
    if (!container) return;
    const update = () =>
      setOverflow(container.scrollWidth > container.clientWidth + 1);
    const observer = new ResizeObserver(update);
    observer.observe(container);
    const table = container.querySelector("table");
    if (table) observer.observe(table);
    update();
    return () => observer.disconnect();
  }, [filtered.length, columns.length]);
  return (
    <div className="data-table-panel">
      <div className="filter-bar">
        <label className="search-field">
          <Search size={18} />
          <input
            ref={searchRef}
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </label>
        {filters}
        {onExport && (
          <button
            className="button secondary"
            onClick={() => onExport(filtered)}
            disabled={!filtered.length}
          >
            <Download size={16} /> Exportar resultados
          </button>
        )}
        {query && (
          <button
            className="text-action"
            onClick={() => {
              setQuery("");
              setPage(0);
              searchRef.current?.focus();
            }}
          >
            Limpiar búsqueda
          </button>
        )}
        <span className="result-count" role="status">
          {filtered.length} registros
        </span>
      </div>
      {!filtered.length ? (
        <div className="empty-state">
          <FileSearch />
          <h3>{query ? "No encontramos coincidencias" : empty}</h3>
          <p>
            {query
              ? "Pruebe con otra búsqueda o ajuste los filtros."
              : "Los nuevos registros aparecerán aquí."}
          </p>
        </div>
      ) : (
        <div
          className="table-scroll"
          ref={tableRef}
          tabIndex={0}
          role="region"
          aria-label={caption}
          aria-describedby={hintId}
        >
          <p className={overflow ? "table-scroll-hint" : "sr-only"} id={hintId}>
            Si la tabla supera el ancho disponible, use las flechas izquierda y
            derecha para desplazarla.
          </p>
          <table>
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    scope="col"
                    key={c.key}
                    className={c.numeric ? "numeric" : ""}
                    aria-sort={
                      sort === c.key
                        ? direction === 1
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                  >
                    <button
                      aria-label={`Ordenar por ${c.title}${sort === c.key ? (direction === 1 ? ", orden actual ascendente" : ", orden actual descendente") : ""}`}
                      onClick={() => {
                        setSort(c.key);
                        setDirection(sort === c.key ? -direction : 1);
                        setPage(0);
                      }}
                    >
                      {c.title}
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                ))}
                {actions && <th scope="col">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(p * 10, (p + 1) * 10).map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.numeric ? "numeric" : ""}>
                      {c.render ? c.render(r) : c.value(r)}
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <div
                        className="row-actions"
                        role="group"
                        aria-label={`Acciones de ${columns[0]?.value(r) || r.id}`}
                      >
                        {actions(r)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="pagination">
        <span>
          Página {p + 1} de {pages}
        </span>
        <div>
          <button
            disabled={!p}
            onClick={() => {
              setPage(p - 1);
              tableRef.current?.focus();
            }}
          >
            Anterior
          </button>
          <button
            disabled={p + 1 >= pages}
            onClick={() => {
              setPage(p + 1);
              tableRef.current?.focus();
            }}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

const labels: Record<string, string> = {
  pending_validation: "Por validar",
  reported: "Reportado",
  applied: "Aplicado",
  rejected: "Rechazado",
  validated: "Validado",
  paid: "Pagada",
  pending: "Pendiente",
  overdue: "Vencida",
  nuevo: "Nuevo",
  en_proceso: "En proceso",
  cotizando: "Cotizando",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
  active: "Publicado",
  draft: "Borrador",
  scheduled: "Programado",
  expired: "Archivado",
  pendiente: "Calculada",
  procesando: "Aprobada",
  pagado: "Pagada (histórico)",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  up_to_date: "Al día",
  late_30: "En mora",
  late_60: "En mora",
  late_90: "En mora",
  late_90_plus: "En mora",
};
export function Badge({ value }: { value: string }) {
  const negative = ["rejected", "Rechazado", "cancelled", "overdue"].includes(
    value,
  );
  const success = [
    "applied",
    "paid",
    "resuelto",
    "cerrado",
    "active",
    "Aprobado",
    "confirmed",
    "up_to_date",
  ].includes(value);
  return (
    <span
      className={`badge ${negative ? "negative" : success ? "success" : ["pending_validation", "Pendiente", "En Revisión", "pending", "pendiente"].includes(value) ? "review" : "neutral"}`}
    >
      {labels[value] || value}
    </span>
  );
}
