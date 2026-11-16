import type { WorkspaceModuleProps } from "./WorkspaceModuleProps";

import { Plus } from "lucide-react";
import { Badge, DataTable } from "./DataTable";
import { AuditView } from "./AuditView";
import { PageHeading, Tabs } from "./AdminWidgets";
export function MaintenanceView({
  s,
  sub,
  setSub,
  filter,
  setFilter,
  setEditor,
  collectionActions,
}: WorkspaceModuleProps) {
  return (
    <>
      <PageHeading
        kicker="CUIDAR LO QUE COMPARTIMOS"
        title="Mantenimiento"
        description="Del primer reporte a la solución, sin perder el contexto."
        action={
          <button
            className="button primary"
            onClick={() => setEditor({ collection: "tickets" })}
          >
            <Plus size={17} /> Crear incidencia
          </button>
        }
      />
      <Tabs
        items={[
          ["payments", "Incidencias"],
          ["reservations", "Reservas"],
        ]}
        value={sub}
        onChange={setSub}
      />
      {sub === "reservations" ? (
        <DataTable
          caption="Mantenimiento y reservas"
          rows={s.reservations}
          columns={[
            {
              key: "amenity",
              title: "Amenidad",
              value: (r) => r.amenityName,
            },
            {
              key: "unit",
              title: "Filial",
              value: (r) => r.unitNumber,
            },
            { key: "date", title: "Fecha", value: (r) => r.date },
            { key: "slot", title: "Horario", value: (r) => r.timeSlot },
            {
              key: "status",
              title: "Estado",
              value: (r) => r.status,
              render: (r) => <Badge value={r.status} />,
            },
          ]}
        />
      ) : (
        <DataTable
          caption="Mantenimiento y reservas"
          rows={s.tickets.filter((t) => !filter || t.status === filter)}
          searchPlaceholder="Incidencia, ubicación o responsable…"
          filters={
            <select
              aria-label="Estado de incidencia"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {["nuevo", "en_proceso", "cotizando", "resuelto", "cerrado"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
          }
          columns={[
            {
              key: "title",
              title: "Incidencia",
              value: (t) => t.title,
              render: (t) => (
                <>
                  <strong>{t.title}</strong>
                  <small className="cell-secondary">
                    {t.location} · {t.createdAt}
                  </small>
                </>
              ),
            },
            {
              key: "priority",
              title: "Prioridad",
              value: (t) => t.priority,
            },
            {
              key: "assignee",
              title: "Responsable",
              value: (t) => t.assignedVendor || "Sin asignar",
            },
            {
              key: "state",
              title: "Estado",
              value: (t) => t.status,
              render: (t) => <Badge value={t.status} />,
            },
            {
              key: "board",
              title: "Junta",
              value: (t) => t.boardApproval || "Pendiente",
              render: (t) => <Badge value={t.boardApproval || "Pendiente"} />,
            },
          ]}
          actions={(t) => collectionActions("tickets", t)}
        />
      )}
    </>
  );
}
