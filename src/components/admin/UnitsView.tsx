import type { WorkspaceModuleProps } from "./WorkspaceModuleProps";
import { money } from "../../domain/demo";
import { Plus } from "lucide-react";
import { DataTable } from "./DataTable";
import { AuditView } from "./AuditView";
import { PageHeading } from "./AdminWidgets";
export function UnitsView({
  s,
  setEditor,
  collectionActions,
}: WorkspaceModuleProps) {
  return (
    <>
      <PageHeading
        kicker="PERSONAS Y ESPACIOS"
        title="Filiales y residentes"
        description="La información de cada hogar, organizada y al día."
        action={
          <button
            className="button primary"
            onClick={() => setEditor({ collection: "units" })}
          >
            <Plus size={17} /> Crear filial
          </button>
        }
      />
      <DataTable
        caption="Filiales y residentes"
        rows={s.units}
        searchPlaceholder="Filial, propietario o sector…"
        columns={[
          {
            key: "unit",
            title: "Filial",
            value: (u) => u.number,
            render: (u) => <strong>{u.number}</strong>,
          },
          {
            key: "owner",
            title: "Propietario",
            value: (u) => u.ownerName,
          },
          { key: "sector", title: "Sector", value: (u) => u.section },
          {
            key: "residents",
            title: "Residentes",
            value: (u) => u.residents?.length || 0,
          },
          {
            key: "balance",
            title: "Saldo",
            value: (u) => u.currentBalance,
            numeric: true,
            render: (u) => money(u.currentBalance),
          },
        ]}
        actions={(u) => collectionActions("units", u)}
      />
    </>
  );
}
