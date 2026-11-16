import type { WorkspaceModuleProps } from "./WorkspaceModuleProps";
import { money } from "../../domain/demo";
import { Plus, SlidersHorizontal, Download } from "lucide-react";
import { Badge, DataTable } from "./DataTable";
import { AuditView } from "./AuditView";
import { PageHeading, Tabs, Cashflow } from "./AdminWidgets";
import { ReceiptPrintButton } from "./FinancialDocuments";
export function TreasuryView({
  s,
  sub,
  setSub,
  filter,
  setFilter,
  setModal,
  inspect,
  ask,
  exportRows,
  month,
  run,
}: WorkspaceModuleProps) {
  const pending = s.payments.filter((p) =>
    ["reported", "pending_validation"].includes(p.status),
  );
  return (
    <>
      <PageHeading
        kicker="CUENTAS CLARAS"
        title="Tesorería"
        description="Cada movimiento, con su respaldo y su historia."
        action={
          <>
            <button
              className="button secondary"
              onClick={() => setModal("quota")}
            >
              <SlidersHorizontal size={17} /> Cuotas
            </button>
            <button className="button primary" onClick={() => setModal("cash")}>
              <Plus size={17} /> Registrar recibo
            </button>
          </>
        }
      />
      <Tabs
        items={[
          ["payments", "Pagos y comprobantes"],
          ["receivables", "Cuentas por cobrar"],
          ["invoices", "Facturas"],
          ["cashflow", "Flujo de caja"],
        ]}
        value={sub}
        onChange={(v) => {
          setSub(v);
          setFilter("");
        }}
      />
      {sub === "payments" && (
        <>
          <div className="list-heading">
            <div>
              <h2>Pagos y comprobantes</h2>
              <p>{pending.length} movimientos requieren validación.</p>
            </div>
            <button
              className="button secondary"
              onClick={() =>
                exportRows(
                  "pagos",
                  s.payments
                    .filter(
                      (p) =>
                        !filter ||
                        (filter === "pending_validation"
                          ? ["pending_validation", "reported"].includes(
                              p.status,
                            )
                          : p.status === filter),
                    )
                    .map((p) => ({
                      Filial: p.unitNumber,
                      Monto: p.amount,
                      Referencia: p.reference,
                      Fecha: p.date,
                      Estado: p.status,
                      Medio: p.method,
                    })),
                )
              }
            >
              <Download size={16} /> Exportar filtro
            </button>
          </div>
          <DataTable
            caption="Movimientos de tesorería"
            onExport={(rows) => {
              void exportRows(
                "pagos",
                rows.map((p) => ({
                  Filial: p.unitNumber,
                  Monto: p.amount,
                  Referencia: p.reference,
                  Fecha: p.date,
                  Estado: p.status,
                  Medio: p.method,
                })),
              );
            }}
            rows={s.payments.filter(
              (p) =>
                !filter ||
                (filter === "pending_validation"
                  ? ["pending_validation", "reported"].includes(p.status)
                  : p.status === filter),
            )}
            searchPlaceholder="Filial, persona o referencia…"
            filters={
              <select
                aria-label="Estado de pago"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="pending_validation">Por validar</option>
                <option value="applied">Aplicados</option>
                <option value="rejected">Rechazados</option>
              </select>
            }
            columns={[
              {
                key: "unit",
                title: "Filial / Persona",
                value: (p) => `${p.unitNumber} ${p.payerName}`,
                render: (p) => (
                  <>
                    <strong>{p.unitNumber}</strong>
                    <small className="cell-secondary">{p.payerName}</small>
                  </>
                ),
              },
              {
                key: "ref",
                title: "Referencia",
                value: (p) => p.reference,
              },
              { key: "date", title: "Fecha", value: (p) => p.date },
              {
                key: "amount",
                title: "Monto",
                value: (p) => p.amount,
                numeric: true,
                render: (p) => money(p.amount),
              },
              {
                key: "status",
                title: "Estado",
                value: (p) => p.status,
                render: (p) => <Badge value={p.status} />,
              },
            ]}
            actions={(p) => (
              <>
                <ReceiptPrintButton payment={p} run={run} />
                <button
                  className="text-action"
                  onClick={() => inspect(p, `Pago · ${p.unitNumber}`)}
                >
                  Detalle
                </button>
                {["reported", "pending_validation"].includes(p.status) ? (
                  <>
                    <button
                      className="text-action"
                      onClick={() =>
                        ask(
                          "Validar pago",
                          `${p.unitNumber} · ${money(p.amount)}. El saldo pasará de ${money(s.units.find((u) => u.id === p.unitId)?.currentBalance || 0)} a ${money((s.units.find((u) => u.id === p.unitId)?.currentBalance || 0) - p.amount)}. Revise el comprobante antes de confirmar.`,
                          { kind: "applyPayment", id: p.id },
                        )
                      }
                    >
                      Validar
                    </button>
                    <button
                      className="text-action negative-text"
                      onClick={() =>
                        ask(
                          "Rechazar pago",
                          "Indique el motivo. El saldo no se modificará.",
                          {
                            kind: "rejectPayment",
                            id: p.id,
                            reason: "",
                          },
                          true,
                        )
                      }
                    >
                      Rechazar
                    </button>
                  </>
                ) : (
                  p.status === "applied" && (
                    <button
                      className="text-action negative-text"
                      onClick={() =>
                        ask(
                          "Revertir pago",
                          `${money(p.amount)} volverán al saldo de ${p.unitNumber}. El pago y su historial se conservarán.`,
                          {
                            kind: "reversePayment",
                            id: p.id,
                            reason: "",
                          },
                          true,
                        )
                      }
                    >
                      Revertir
                    </button>
                  )
                )}
              </>
            )}
          />
        </>
      )}
      {sub === "receivables" && (
        <DataTable
          caption="Movimientos de tesorería"
          rows={s.units}
          searchPlaceholder="Buscar filial o propietario…"
          columns={[
            { key: "number", title: "Filial", value: (u) => u.number },
            {
              key: "owner",
              title: "Propietario",
              value: (u) => u.ownerName,
            },
            {
              key: "quota",
              title: "Cuota mensual",
              value: (u) => u.monthlyQuota,
              numeric: true,
              render: (u) => money(u.monthlyQuota),
            },
            {
              key: "balance",
              title: "Saldo",
              value: (u) => u.currentBalance,
              numeric: true,
              render: (u) => (
                <>
                  <strong>{money(u.currentBalance)}</strong>
                  {u.currentBalance < 0 && (
                    <small className="cell-secondary">Crédito a favor</small>
                  )}
                </>
              ),
            },
            {
              key: "status",
              title: "Estado",
              value: (u) => (u.currentBalance <= 0 ? "Al día" : "Pendiente"),
              render: (u) => (
                <Badge
                  value={u.currentBalance <= 0 ? "up_to_date" : "pending"}
                />
              ),
            },
          ]}
          actions={(u) => (
            <button
              className="text-action"
              onClick={() => inspect(u, u.number)}
            >
              Ver ficha
            </button>
          )}
        />
      )}
      {sub === "invoices" && (
        <DataTable
          caption="Movimientos de tesorería"
          rows={s.invoices}
          searchPlaceholder="Factura, filial o período…"
          columns={[
            { key: "id", title: "Factura", value: (i) => i.id },
            {
              key: "unit",
              title: "Filial",
              value: (i) => i.unitNumber,
            },
            { key: "month", title: "Período", value: (i) => i.month },
            {
              key: "total",
              title: "Total",
              value: (i) => i.total,
              numeric: true,
              render: (i) => money(i.total),
            },
            {
              key: "paid",
              title: "Abonado",
              value: (i) => (i.status === "paid" ? i.total : i.paidAmount || 0),
              numeric: true,
              render: (i) =>
                money(i.status === "paid" ? i.total : i.paidAmount || 0),
            },
            {
              key: "status",
              title: "Estado",
              value: (i) => i.status,
              render: (i) => <Badge value={i.status} />,
            },
          ]}
          actions={(i) => (
            <button
              className="text-action"
              onClick={() => inspect(i, `Factura ${i.id}`)}
            >
              Detalle
            </button>
          )}
        />
      )}
      {sub === "cashflow" && <Cashflow state={s} />}
    </>
  );
}
