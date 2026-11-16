import type { WorkspaceModuleProps } from "./WorkspaceModuleProps";

import { Plus } from "lucide-react";
import { Badge, DataTable } from "./DataTable";
import { AuditView } from "./AuditView";
import { PageHeading, Tabs } from "./AdminWidgets";
import { AdManager, AdRates } from "../advertising/AdManager";
export function CommunicationsView({
  s,
  filter,
  setFilter,
  setEditor,
  collectionActions,
  sub,
  setSub,
  user,
  run,
}: WorkspaceModuleProps) {
  return (
    <>
      <PageHeading
        kicker="UNA COMUNIDAD INFORMADA"
        title="Comunicaciones"
        description="Prepare, revise y publique con intención."
        action={
          sub !== "ads" &&
          sub !== "ad-rates" && (
            <button
              className="button primary"
              onClick={() => setEditor({ collection: "news" })}
            >
              <Plus size={17} /> Crear comunicado
            </button>
          )
        }
      />
      <Tabs
        items={[
          ["payments", "Comunicados"],
          ["ads", "Anuncios"],
          ["ad-rates", "Tarifas y reglas"],
        ]}
        value={sub}
        onChange={setSub}
      />
      {sub === "ads" ? (
        <AdManager state={s} user={user} run={run} />
      ) : sub === "ad-rates" ? (
        <AdRates state={s} run={run} />
      ) : (
        <DataTable
          caption="Comunicados"
          rows={s.news.filter(
            (n) => !filter || (n.status || "active") === filter,
          )}
          searchPlaceholder="Título, categoría o autor…"
          filters={
            <select
              aria-label="Estado de publicación"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="active">Publicado</option>
              <option value="draft">Borrador</option>
              <option value="scheduled">Programado</option>
              <option value="expired">Archivado</option>
            </select>
          }
          columns={[
            { key: "title", title: "Comunicado", value: (n) => n.title },
            {
              key: "category",
              title: "Categoría",
              value: (n) => n.category,
            },
            { key: "author", title: "Autor", value: (n) => n.author },
            {
              key: "date",
              title: "Fecha",
              value: (n) => n.publishScheduleDate || n.date,
            },
            {
              key: "state",
              title: "Estado",
              value: (n) => n.status || "active",
              render: (n) => <Badge value={n.status || "active"} />,
            },
          ]}
          actions={(n) => collectionActions("news", n)}
        />
      )}
    </>
  );
}
