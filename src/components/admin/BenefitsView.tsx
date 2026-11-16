import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import {
  benefitMonths,
  calculateBenefit,
  type BenefitInput,
  type BenefitRecord,
  type BenefitResult,
} from "../../domain/benefits";
import {
  money,
  today,
  stamp,
  type Command,
  type DemoState,
} from "../../domain/demo";
import { Dialog } from "../common/Dialog";
import { PrintPreview } from "./FinancialDocuments";
import { DataTable } from "./DataTable";
import "../../benefits.css";

const titles = { aguinaldo: "Aguinaldo", liquidacion: "Liquidación" };
const reasons = {
  renuncia: "Renuncia",
  sin_responsabilidad: "Despido sin responsabilidad patronal",
  con_responsabilidad: "Despido con responsabilidad patronal",
};
const monthName = (m: string) =>
  new Intl.DateTimeFormat("es-CR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(m + "-01T12:00:00Z"));
const source = "https://www.mtss.go.cr/tramites-servicios/calculadoras.html";
type Run = (c: Command) => DemoState;

function Breakdown({
  result,
  type,
}: {
  result: BenefitResult;
  type?: BenefitInput["type"];
}) {
  return (
    <dl className="benefit-breakdown">
      {[
        ["Aguinaldo · salarios brutos ÷ 12", result.aguinaldo],
        ["Vacaciones pendientes", result.vacations],
        ["Preaviso por indemnizar", result.notice],
        ["Auxilio de cesantía", result.severance],
        ["Total estimado", result.total],
      ]
        .filter(
          ([label]) =>
            type !== "aguinaldo" ||
            String(label).startsWith("Aguinaldo") ||
            label === "Total estimado",
        )
        .map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{money(Number(value))}</dd>
          </div>
        ))}
    </dl>
  );
}

function BenefitDocument({ record: r }: { record: BenefitRecord }) {
  return (
    <article className="financial-document">
      <header className="document-header">
        <strong>PINAR DEL RÍO</strong>
        <span>
          {titles[r.input.type]} · {r.id}
        </span>
      </header>
      <p className="document-demo">
        DEMO · ESTIMACIÓN · NO ES COMPROBANTE DE PAGO
      </p>
      <h1>{titles[r.input.type]}</h1>
      <h2>{r.employeeName}</h2>
      <p>
        {r.employeeIdentification} · {r.employeeRole}
      </p>
      <p>
        Estado: {r.status} · {r.input.startDate} a {r.input.endDate}
      </p>
      {r.input.type === "liquidacion" && <p>{reasons[r.input.reason]}</p>}
      <Breakdown result={r.result} type={r.input.type} />
      <h2>Salarios brutos declarados</h2>
      <table>
        <thead>
          <tr>
            <th>Mes</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          {benefitMonths(r.input.endDate).map((m, i) => (
            <tr key={m}>
              <td>{monthName(m)}</td>
              <td>{money(r.input.salaries[i])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {r.input.type === "liquidacion" && (
        <p>
          Promedio mensual últimos seis meses o fracción:{" "}
          {money(r.input.averageMonthly)}. Base diaria de vacaciones:{" "}
          {money(r.input.vacationDaily)}. Días: vacaciones{" "}
          {r.input.vacationDays}, preaviso {r.input.noticeDays}, cesantía{" "}
          {r.input.severanceDays}.
        </p>
      )}
      <h2>Base y observaciones</h2>
      <p>{r.input.notes}</p>
      <p>
        Guardado por {r.createdBy} · {stamp(r.createdAt)}
      </p>
      {r.resolvedAt && (
        <p>
          {r.status} por {r.resolvedBy} · {stamp(r.resolvedAt)} ·{" "}
          {r.resolutionReason}
        </p>
      )}
      <p>
        Contratos indefinidos del sector privado, pago mensual. Datos declarados
        y revisados; no aplica automáticamente otros regímenes, deducciones,
        aportes de asociaciones ni pagos anteriores. Confirmar conserva el
        cálculo; no paga ni termina la relación laboral.
      </p>
      <p>Referencia: {source}</p>
    </article>
  );
}

export function BenefitsView({ state, run }: { state: DemoState; run: Run }) {
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState("");
  const [printing, setPrinting] = useState(false);
  const [decision, setDecision] = useState<"confirmado" | "anulado" | "">("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const record = state.benefits?.find((r) => r.id === selected);
  const inspect = (r: BenefitRecord) => {
    try {
      run({
        kind: "record",
        module: "Personal",
        action: "Consultar prestaciones",
        entityId: r.id,
        summary: `${titles[r.input.type]} · ${r.employeeName}`,
      });
      setSelected(r.id);
      setDecision("");
      setReason("");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <section className="benefits-view">
      <div className="list-heading">
        <div>
          <h2>Aguinaldo y liquidación</h2>
          <p>Prepare el cálculo, revise el desglose y conserve su historial.</p>
        </div>
        <button className="button primary" onClick={() => setCreating(true)}>
          <Plus size={17} /> Nuevo cálculo
        </button>
      </div>
      <p className="benefit-context">
        Estimaciones para contratos indefinidos con pago mensual. Confirmar un
        cálculo no ejecuta pagos ni modifica vacaciones o el estado del
        empleado.
      </p>
      {error && (
        <p role="alert" className="inline-error">
          {error}
        </p>
      )}
      <DataTable
        caption="Aguinaldo y liquidación"
        rows={state.benefits || []}
        searchPlaceholder="Persona, tipo o estado…"
        columns={[
          { key: "name", title: "Persona", value: (r) => r.employeeName },
          { key: "type", title: "Cálculo", value: (r) => titles[r.input.type] },
          {
            key: "date",
            title: "Fecha de corte",
            value: (r) => r.input.endDate,
          },
          {
            key: "total",
            title: "Total estimado",
            value: (r) => r.result.total,
            numeric: true,
            render: (r) => money(r.result.total),
          },
          {
            key: "status",
            title: "Estado",
            value: (r) => r.status,
            render: (r) => (
              <span
                className={`pill ${r.status === "anulado" ? "negative" : r.status === "confirmado" ? "success" : "review"}`}
              >
                {r.status}
              </span>
            ),
          },
        ]}
        actions={(r) => (
          <button className="text-action" onClick={() => inspect(r)}>
            Ver detalle
          </button>
        )}
      />
      {creating && (
        <BenefitEditor
          state={state}
          run={run}
          onClose={() => setCreating(false)}
          onSaved={(r) => {
            setSelected(r.id);
            setDecision("");
          }}
        />
      )}
      {record && !printing && (
        <Dialog
          title={`${titles[record.input.type]} · ${record.employeeName}`}
          onClose={() => setSelected("")}
          wide
        >
          <p>
            {record.input.startDate} a {record.input.endDate} ·{" "}
            <strong>{record.status}</strong>
          </p>
          <Breakdown result={record.result} type={record.input.type} />
          <p>{record.input.notes}</p>
          <p className="muted">
            Guardado por {record.createdBy} · {stamp(record.createdAt)}
          </p>
          {record.resolvedAt && (
            <p>
              {record.resolvedBy} · {record.resolutionReason}
            </p>
          )}
          <details>
            <summary>Ver salarios y parámetros guardados</summary>
            <BenefitDocument record={record} />
          </details>
          {error && (
            <p role="alert" className="inline-error">
              {error}
            </p>
          )}
          {decision ? (
            <form
              className="demo-form"
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  run({
                    kind: "resolveBenefit",
                    id: record.id,
                    status: decision,
                    reason,
                  });
                  setDecision("");
                  setReason("");
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              <label>
                Motivo de la decisión *
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <div className="form-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setDecision("")}
                >
                  Volver
                </button>
                <button
                  className={`button ${decision === "anulado" ? "danger" : "primary"}`}
                >
                  {decision === "anulado"
                    ? "Anular cálculo"
                    : "Confirmar revisión"}
                </button>
              </div>
            </form>
          ) : (
            <div className="form-actions benefit-actions">
              <button
                className="button secondary"
                onClick={() => {
                  try {
                    run({
                      kind: "record",
                      module: "Personal",
                      action: "Consultar documento de prestaciones",
                      entityId: record.id,
                      summary: titles[record.input.type],
                    });
                    setPrinting(true);
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Documento / PDF
              </button>
              {record.status !== "anulado" && (
                <button
                  className="button danger"
                  onClick={() => {
                    setDecision("anulado");
                    setReason("");
                  }}
                >
                  Anular
                </button>
              )}
              {record.status === "calculado" && (
                <button
                  className="button primary"
                  onClick={() => {
                    setDecision("confirmado");
                    setReason("");
                  }}
                >
                  Confirmar cálculo
                </button>
              )}
            </div>
          )}
        </Dialog>
      )}
      {record && printing && (
        <PrintPreview
          title={titles[record.input.type]}
          entityId={record.id}
          module="Personal"
          run={run}
          onClose={() => setPrinting(false)}
        >
          <BenefitDocument record={record} />
        </PrintPreview>
      )}
    </section>
  );
}

function BenefitEditor({
  state,
  run,
  onClose,
  onSaved,
}: {
  state: DemoState;
  run: Run;
  onClose: () => void;
  onSaved: (r: BenefitRecord) => void;
}) {
  const year = Number(today().slice(0, 4));
  const [input, setInput] = useState<BenefitInput>({
    type: "aguinaldo",
    employeeId: "",
    startDate: `${year - 1}-12-01`,
    endDate: `${year}-11-30`,
    salaries: Array(12).fill(0),
    reason: "renuncia",
    averageMonthly: 0,
    vacationDaily: 0,
    vacationDays: 0,
    noticeDays: 0,
    severanceDays: 0,
    notes: "",
  });
  const [review, setReview] = useState<BenefitResult | null>(null);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    formRef.current?.closest(".demo-dialog-body")?.scrollTo(0, 0);
    formRef.current?.closest("dialog")?.scrollTo(0, 0);
  }, [Boolean(review)]);
  const update = (patch: Partial<BenefitInput>) => {
    setInput({ ...input, ...patch });
    setReview(null);
    setChecked(false);
    setError("");
  };
  const months = benefitMonths(input.endDate || today());
  const employee = state.employees.find((e) => e.id === input.employeeId);
  const number = (
    key:
      | "averageMonthly"
      | "vacationDaily"
      | "vacationDays"
      | "noticeDays"
      | "severanceDays",
    label: string,
    max = 1e10,
  ) => (
    <label>
      {label} *
      <input
        required
        type="number"
        min="0"
        max={max}
        step="0.01"
        value={input[key]}
        onChange={(e) => update({ [key]: e.target.valueAsNumber })}
      />
    </label>
  );
  return createPortal(
    <Dialog
      title={review ? "Revise el cálculo" : "Nuevo cálculo de prestaciones"}
      onClose={onClose}
      wide
    >
      <form
        ref={formRef}
        className="demo-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            if (!employee) throw new Error("Seleccione una persona.");
            if (!review) {
              setReview(calculateBenefit(input));
              setError("");
            } else {
              if (!checked) throw new Error("Confirme que revisó los datos.");
              const next = run({ kind: "benefit", input });
              onSaved(next.benefits![0]);
              onClose();
            }
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        {review ? (
          <>
            <h3>
              {titles[input.type]} · {employee?.name}
            </h3>
            <p>
              {input.startDate} a {input.endDate}
            </p>
            <Breakdown result={review} type={input.type} />
            <p>
              Salarios brutos declarados: {money(review.salaryTotal)}. El
              aguinaldo se divide entre 12, incluso en períodos parciales.
            </p>
            <p>{input.notes}</p>
            <label className="benefit-check">
              <input
                type="checkbox"
                required
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />{" "}
              Revisé salarios, días y bases. Guardar no realiza un pago.
            </label>
          </>
        ) : (
          <>
            <div className="form-grid">
              <label>
                Tipo de cálculo
                <select
                  value={input.type}
                  onChange={(e) => {
                    const type = e.target.value as BenefitInput["type"];
                    update({
                      type,
                      startDate:
                        type === "aguinaldo" ? `${year - 1}-12-01` : today(),
                      endDate: type === "aguinaldo" ? `${year}-11-30` : today(),
                      salaries: Array(12).fill(0),
                      averageMonthly: 0,
                      vacationDaily: 0,
                      vacationDays: 0,
                      noticeDays: 0,
                      severanceDays: 0,
                    });
                  }}
                >
                  <option value="aguinaldo">Aguinaldo anual</option>
                  <option value="liquidacion">Liquidación</option>
                </select>
              </label>
              <label>
                Persona *
                <select
                  required
                  value={input.employeeId}
                  onChange={(e) =>
                    update({
                      employeeId: e.target.value,
                      salaries: Array(12).fill(0),
                      averageMonthly: 0,
                      vacationDaily: 0,
                      vacationDays: 0,
                      noticeDays: 0,
                      severanceDays: 0,
                      notes: "",
                    })
                  }
                >
                  <option value="">Seleccione una persona</option>
                  {state.employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {input.type === "aguinaldo"
                  ? "Inicio del período trabajado"
                  : "Inicio de la relación laboral"}{" "}
                *
                <input
                  required
                  type="date"
                  value={input.startDate}
                  onChange={(e) => update({ startDate: e.target.value })}
                />
              </label>
              <label>
                {input.type === "aguinaldo"
                  ? "Cierre del aguinaldo (30 de noviembre)"
                  : "Último día de la relación"}{" "}
                *
                <input
                  required
                  type="date"
                  value={input.endDate}
                  onChange={(e) => {
                    const endDate = e.target.value;
                    if (endDate)
                      update({ endDate, salaries: Array(12).fill(0) });
                  }}
                />
              </label>
            </div>
            <h3>Salarios brutos · diciembre a noviembre</h3>
            <p>
              Incluya salario ordinario y extraordinario efectivamente devengado
              hasta el corte. Use cero en meses sin ingreso. La demo no dispone
              de un historial salarial completo; no se sustituye por el salario
              base actual.
            </p>
            <div className="benefit-months">
              {months.map((m, i) => (
                <label key={m}>
                  {monthName(m)}
                  <input
                    aria-label={`Salario bruto ${monthName(m)}`}
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={input.salaries[i]}
                    onChange={(e) =>
                      update({
                        salaries: input.salaries.map((n, j) =>
                          i === j ? e.target.valueAsNumber : n,
                        ),
                      })
                    }
                  />
                </label>
              ))}
            </div>
            {input.type === "liquidacion" && (
              <>
                <h3>Parámetros de liquidación</h3>
                <label>
                  Motivo de salida
                  <select
                    value={input.reason}
                    onChange={(e) =>
                      update({
                        reason: e.target.value as BenefitInput["reason"],
                        noticeDays: 0,
                        severanceDays: 0,
                      })
                    }
                  >
                    {Object.entries(reasons).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="form-grid">
                  {number(
                    "vacationDays",
                    "Días de vacaciones por compensar",
                    1000,
                  )}
                  {number(
                    "vacationDaily",
                    "Base diaria revisada de vacaciones (₡)",
                  )}
                </div>
                <p>
                  Revise el saldo y los días de descanso pagados que
                  correspondan. La base debe considerar salarios ordinarios y
                  extraordinarios de las últimas 50 semanas; no se toma
                  automáticamente el saldo del calendario.
                </p>
                {input.reason === "con_responsabilidad" && (
                  <>
                    <div className="form-grid">
                      {number(
                        "averageMonthly",
                        "Promedio mensual últimos 6 meses o fracción (₡)",
                      )}
                      {number(
                        "noticeDays",
                        "Días de preaviso por indemnizar",
                        30,
                      )}
                      {number(
                        "severanceDays",
                        "Días totales de cesantía revisados",
                        176,
                      )}
                    </div>
                    <p>
                      Ingrese días revisados según antigüedad y artículo 29, con
                      máximo de 8 años indemnizables. Preaviso trabajado: 0 días
                      por indemnizar. No se usa una aproximación de 20 días por
                      año.
                    </p>
                  </>
                )}
              </>
            )}
            <label>
              Fuente de datos y observaciones *
              <textarea
                required
                rows={3}
                value={input.notes}
                onChange={(e) => update({ notes: e.target.value })}
                placeholder="Planillas consultadas, base salarial y fundamento de los días ingresados…"
              />
            </label>
            <p>
              <a href={source} target="_blank" rel="noreferrer">
                Consultar calculadoras y orientación del MTSS ↗
              </a>
            </p>
          </>
        )}
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => (review ? setReview(null) : onClose())}
          >
            {review ? "Editar datos" : "Cancelar"}
          </button>
          <button className="button primary">
            {review ? "Guardar cálculo" : "Revisar desglose"}
          </button>
        </div>
      </form>
    </Dialog>,
    document.body,
  );
}
