import type { WorkspaceModuleProps } from "./WorkspaceModuleProps";
import { money, PAYROLL_RATES } from "../../domain/demo";
import { Plus } from "lucide-react";
import { Badge, DataTable } from "./DataTable";
import { AuditView } from "./AuditView";
import { PageHeading, Tabs } from "./AdminWidgets";
import { useState } from "react";
import { ScheduleEditor } from "./ScheduleEditor";
import { VacationView } from "./VacationView";
import { PayrollPrintButton } from "./FinancialDocuments";
import { BenefitsView } from "./BenefitsView";
export function PeopleView({
  s,
  sub,
  setSub,
  filter,
  setEditor,
  setModal,
  ask,
  collectionActions,
  exportRows,
  run,
}: WorkspaceModuleProps) {
  const [scheduleId, setScheduleId] = useState("");
  return (
    <>
      <PageHeading
        kicker="EL EQUIPO DETRÁS DE CADA DÍA"
        title={sub === "vacations" ? "Vacaciones y disponibilidad" : "Personal"}
        description={
          sub === "vacations"
            ? "Planifique descansos y resuelva solicitudes del equipo."
            : "Empleados, períodos y turnos desde una sola fuente."
        }
        action={
          sub === "payments" && (
            <button
              className="button primary"
              onClick={() => setEditor({ collection: "employees" })}
            >
              <Plus size={17} /> Crear empleado
            </button>
          )
        }
      />
      <Tabs
        items={[
          ["payments", "Empleados"],
          ["payroll", "Planilla"],
          ["shifts", "Turnos"],
          ["vacations", "Vacaciones"],
          ["benefits", "Aguinaldo y liquidación"],
        ]}
        value={sub}
        onChange={setSub}
      />
      {sub === "payments" && (
        <DataTable
          caption="Registros de personal"
          rows={s.employees}
          searchPlaceholder="Nombre, identificación o puesto…"
          columns={[
            { key: "name", title: "Empleado", value: (e) => e.name },
            { key: "role", title: "Puesto", value: (e) => e.roleTitle },
            {
              key: "salary",
              title: "Salario base",
              value: (e) => e.baseSalary,
              numeric: true,
              render: (e) => money(e.baseSalary),
            },
            { key: "status", title: "Estado", value: (e) => e.status },
          ]}
          actions={(e) => (
            <>
              {collectionActions("employees", e)}
              <button
                className="text-action"
                onClick={() => setScheduleId(e.id)}
              >
                Horario por día
              </button>
            </>
          )}
        />
      )}
      {sub === "payroll" && (
        <>
          <div className="content-card payroll-notice">
            <p>
              <strong>Parámetros del escenario</strong> · Deducción obrera{" "}
              {(PAYROLL_RATES.worker * 100).toFixed(2)} % · Carga patronal{" "}
              {(PAYROLL_RATES.employer * 100).toFixed(2)} %.
            </p>
            <small>
              Valores de demostración. Calcular o aprobar no ejecuta
              transferencias ni genera un envío SICERE.
            </small>
            <button
              className="button primary"
              onClick={() => setModal("payroll")}
            >
              Calcular período
            </button>
          </div>
          <DataTable
            caption="Registros de personal"
            rows={s.payrollRuns}
            columns={[
              {
                key: "period",
                title: "Período",
                value: (r) => r.period,
              },
              {
                key: "count",
                title: "Empleados",
                value: (r) => r.employeesCount,
              },
              {
                key: "gross",
                title: "Bruto",
                value: (r) => r.totalGross,
                numeric: true,
                render: (r) => money(r.totalGross),
              },
              {
                key: "net",
                title: "Neto calculado",
                value: (r) => r.totalNetPaid,
                numeric: true,
                render: (r) => money(r.totalNetPaid),
              },
              {
                key: "status",
                title: "Estado",
                value: (r) => r.status,
                render: (r) => <Badge value={r.status} />,
              },
            ]}
            actions={(r) => (
              <>
                <PayrollPrintButton
                  period={r.period}
                  employees={s.employees}
                  run={run}
                />
                {r.status === "pendiente" && (
                  <button
                    className="text-action"
                    onClick={() =>
                      ask(
                        "Aprobar cálculo",
                        `${r.period} · ${money(r.totalNetPaid)}. Confirme que revisó las boletas. Esta acción no paga salarios.`,
                        { kind: "approvePayroll", id: r.id },
                      )
                    }
                  >
                    Aprobar cálculo
                  </button>
                )}
                <button
                  className="text-action"
                  onClick={() =>
                    exportRows(
                      `boletas-${r.period}`,
                      s.employees.flatMap((e) =>
                        e.payslips
                          .filter((p) => p.period === r.period)
                          .map((p) => ({
                            Empleado: e.name,
                            Periodo: p.period,
                            Bruto: p.grossSalary,
                            Deduccion: p.workerCCSSDeduction,
                            Neto: p.netSalary,
                            Estado: p.status,
                          })),
                      ),
                    )
                  }
                >
                  Exportar boletas
                </button>
              </>
            )}
          />
        </>
      )}
      {sub === "shifts" && (
        <>
          <div className="list-heading">
            <h2>Turnos disponibles</h2>
            <button
              className="button secondary"
              onClick={() => setEditor({ collection: "shifts" })}
            >
              <Plus size={17} /> Crear turno
            </button>
          </div>
          <DataTable
            caption="Registros de personal"
            rows={s.shifts}
            columns={[
              { key: "name", title: "Turno", value: (t) => t.name },
              {
                key: "start",
                title: "Inicio",
                value: (t) => t.startTime,
              },
              { key: "end", title: "Fin", value: (t) => t.endTime },
              {
                key: "hours",
                title: "Horas semanales",
                value: (t) => t.hoursWeekly,
              },
              {
                key: "category",
                title: "Área",
                value: (t) => t.category,
              },
            ]}
            actions={(t) => collectionActions("shifts", t)}
          />
        </>
      )}
      {sub === "vacations" && <VacationView state={s} run={run} />}
      {sub === "benefits" && <BenefitsView state={s} run={run} />}
      {scheduleId && s.employees.find((e) => e.id === scheduleId) && (
        <ScheduleEditor
          employee={s.employees.find((e) => e.id === scheduleId)!}
          run={run}
          onClose={() => setScheduleId("")}
        />
      )}
    </>
  );
}
