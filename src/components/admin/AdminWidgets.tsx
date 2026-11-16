import { useState, type ReactNode } from "react";
import { ArrowUpRight, ArrowRight, Check } from "lucide-react";
import type { Unit, PaymentRecord, Invoice } from "../../types";
import {
  money,
  today,
  uid,
  PAYROLL_RATES,
  type DemoState,
  type Command,
  type Entity,
} from "../../domain/demo";
import { download } from "../../domain/useDemo";
import { Dialog } from "../common/Dialog";
import { ReceiptPrintButton } from "./FinancialDocuments";
export function Metric({
  label,
  value,
  note,
  icon,
  onClick,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="metric-card" onClick={onClick}>
      <span className="metric-label">
        {label}
        {icon}
      </span>
      <strong>{value}</strong>
      <span className="metric-note">
        {note}
        <ArrowUpRight size={15} />
      </span>
    </button>
  );
}
export function PageHeading({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{action}</div>
    </div>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[][];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <nav className="module-tabs" aria-label="Secciones del módulo">
      {items.map(([id, label]) => (
        <button
          key={id}
          className={value === id ? "active" : ""}
          aria-current={value === id ? "page" : undefined}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

export function CashForm({
  state,
  run,
  onClose,
}: {
  state: DemoState;
  run: (c: Command) => DemoState;
  onClose: () => void;
}) {
  const [unitId, setUnit] = useState("");
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [date, setDate] = useState(today());
  const [method, setMethod] = useState<PaymentRecord["method"]>("cash");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [receipt, setReceipt] = useState<PaymentRecord>();
  const unit = state.units.find((u) => u.id === unitId);
  const [query, setQuery] = useState("");
  return (
    <Dialog
      title={receipt ? "Recibo registrado" : "Registrar recibo"}
      onClose={onClose}
    >
      <form
        className="demo-form"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          if (!preview) {
            setPreview(true);
            return;
          }
          try {
            if (!unit) throw new Error("Seleccione una filial.");
            const value: PaymentRecord = {
              id: uid(),
              receiptNumber: `REC-${uid().slice(0, 8).toUpperCase()}`,
              unitId: unit.id,
              unitNumber: unit.number,
              payerName: unit.ownerName,
              payerEmail: unit.ownerEmail,
              amount: Number(amount),
              method,
              reference: ref.trim(),
              date,
              concept: "Cuota condominal",
              status: "applied",
            };
            run({ kind: "cash", value });
            setReceipt(value);
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        {receipt ? (
          <>
            <div className="success-message" role="status">
              <Check size={20} /> El recibo fue aplicado y registrado.
            </div>
            <div className="receipt-preview">
              <span className="eyebrow">RECIBO DE DEMOSTRACIÓN</span>
              <h2>{receipt.receiptNumber}</h2>
              <p>
                {receipt.unitNumber} · {receipt.payerName}
              </p>
              <strong>{money(receipt.amount)}</strong>
              <p>
                {receipt.reference} · {receipt.date}
              </p>
            </div>
            <div className="form-actions">
              <ReceiptPrintButton
                payment={receipt}
                run={run}
                className="button secondary"
              />
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  run({
                    kind: "record",
                    module: "Tesorería",
                    action: "Descargar recibo",
                    entityId: receipt.id,
                    summary: `Descarga ${receipt.receiptNumber}`,
                  });
                  download(`${receipt.receiptNumber}.json`, receipt);
                }}
              >
                Descargar recibo
              </button>
              <button
                type="button"
                className="button primary"
                onClick={onClose}
              >
                Listo
              </button>
            </div>
          </>
        ) : preview ? (
          <>
            <div className="receipt-preview">
              <span className="eyebrow">REVISAR ANTES DE APLICAR</span>
              <h2>{unit?.number}</h2>
              <p>{unit?.ownerName}</p>
              <strong>{money(Number(amount))}</strong>
              <p>
                {ref} · {date} · {method}
              </p>
              <p>
                Saldo después:{" "}
                {money((unit?.currentBalance || 0) - Number(amount))}
              </p>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="button secondary"
                onClick={() => setPreview(false)}
              >
                Corregir datos
              </button>
              <button className="button primary">Confirmar recibo</button>
            </div>
          </>
        ) : (
          <>
            <label>
              Buscar filial o propietario
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setUnit("");
                }}
                placeholder="Nombre o número de filial"
              />
            </label>
            <label>
              Filial *
              <select
                required
                value={unitId}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="">Seleccione una filial</option>
                {state.units
                  .filter((u) =>
                    `${u.number} ${u.ownerName}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.number} · {u.ownerName}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Monto (₡) *
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label>
              Referencia bancaria o de caja *
              <input
                required
                value={ref}
                onChange={(e) => setRef(e.target.value)}
              />
            </label>
            <div className="form-grid">
              <label>
                Fecha *
                <input
                  type="date"
                  required
                  max={today()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                Medio
                <select
                  value={method}
                  onChange={(e) =>
                    setMethod(e.target.value as PaymentRecord["method"])
                  }
                >
                  <option value="cash">Efectivo</option>
                  <option value="sinpe">SINPE</option>
                  <option value="transfer">Transferencia</option>
                  <option value="card">Tarjeta</option>
                </select>
              </label>
            </div>
            <button className="button primary">
              Revisar recibo <ArrowRight size={17} />
            </button>
          </>
        )}
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Dialog>
  );
}
export function QuotaForm({
  state,
  run,
  onClose,
}: {
  state: DemoState;
  run: (c: Command) => DemoState;
  onClose: () => void;
}) {
  const [unitId, setUnit] = useState("");
  const [amount, setAmount] = useState("85000");
  const [percent, setPercent] = useState("");
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const affected = state.units.filter((u) => !unitId || u.id === unitId);
  const next = (u: Unit) =>
    percent !== ""
      ? Math.round(u.monthlyQuota * (1 + Number(percent) / 100))
      : Number(amount);
  return (
    <Dialog title="Actualizar cuotas" onClose={onClose}>
      <form
        className="demo-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!review) {
            setReview(true);
            return;
          }
          try {
            run({
              kind: "quota",
              unitId: unitId || undefined,
              amount: Number(amount),
              percent: percent === "" ? undefined : Number(percent),
            });
            onClose();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        {!review ? (
          <>
            <label>
              Alcance
              <select value={unitId} onChange={(e) => setUnit(e.target.value)}>
                <option value="">Todas las filiales</option>
                {state.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.number}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nueva cuota (₡)
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label>
              Ajuste porcentual opcional
              <input
                type="number"
                step="any"
                min="-99"
                placeholder="Vacío para usar monto fijo"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
              />
            </label>
            <p className="form-hint">
              Se actualiza la cuota de referencia. No se crean cargos
              retroactivos.
            </p>
            <button className="button primary">
              Revisar {affected.length} filiales
            </button>
          </>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Filial</th>
                    <th>Antes</th>
                    <th>Después</th>
                  </tr>
                </thead>
                <tbody>
                  {affected.map((u) => (
                    <tr key={u.id}>
                      <td>{u.number}</td>
                      <td>{money(u.monthlyQuota)}</td>
                      <td>{money(next(u))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="button secondary"
                onClick={() => setReview(false)}
              >
                Corregir
              </button>
              <button className="button primary">Aplicar actualización</button>
            </div>
          </>
        )}
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Dialog>
  );
}
export function PayrollForm({
  run,
  onClose,
}: {
  run: (c: Command) => DemoState;
  onClose: () => void;
}) {
  const [period, setPeriod] = useState(
    new Intl.DateTimeFormat("es-CR", {
      month: "long",
      year: "numeric",
      timeZone: "America/Costa_Rica",
    }).format(new Date()),
  );
  const [error, setError] = useState("");
  return (
    <Dialog title="Calcular planilla" onClose={onClose}>
      <form
        className="demo-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            run({ kind: "payroll", period });
            onClose();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <p>
          Se generarán boletas pendientes para los empleados activos. No se
          realizan pagos ni envíos externos.
        </p>
        <label>
          Período *
          <input
            required
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </label>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary">Calcular y generar boletas</button>
      </form>
    </Dialog>
  );
}
export function RecordDetail({
  value,
}: {
  value: Entity | PaymentRecord | Invoice;
}) {
  const labels: Record<string, string> = {
    id: "Identificador",
    number: "Filial",
    ownerName: "Propietario",
    ownerPhone: "Teléfono",
    ownerEmail: "Correo",
    section: "Sector",
    currentBalance: "Saldo",
    monthlyQuota: "Cuota mensual",
    title: "Título",
    description: "Descripción",
    name: "Nombre",
    roleTitle: "Puesto",
    baseSalary: "Salario base",
    amount: "Monto",
    reference: "Referencia",
    date: "Fecha",
    unitNumber: "Filial",
    payerName: "Persona",
    status: "Estado",
    total: "Total",
    paidAmount: "Abonado",
    content: "Contenido",
    summary: "Resumen",
    boardApproval: "Decisión de junta",
    boardActaNumber: "Acta",
    assignedVendor: "Responsable",
    priority: "Prioridad",
    cost: "Costo",
    createdAt: "Fecha de creación",
    hireDate: "Ingreso",
    startTime: "Inicio",
    endTime: "Fin",
    hoursWeekly: "Horas semanales",
  };
  return (
    <dl className="record-detail">
      {Object.entries(value)
        .filter(
          ([k, v]) =>
            labels[k] && v !== undefined && v !== "" && typeof v !== "object",
        )
        .map(([k, v]) => (
          <div key={k}>
            <dt>{labels[k]}</dt>
            <dd>
              {[
                "amount",
                "total",
                "paidAmount",
                "currentBalance",
                "monthlyQuota",
                "baseSalary",
                "cost",
              ].includes(k)
                ? money(Number(v))
                : String(v)}
            </dd>
          </div>
        ))}
    </dl>
  );
}
export function PaymentProof({ url }: { url?: string }) {
  if (
    !url ||
    (!url.startsWith("data:image/") &&
      !url.startsWith("data:application/pdf") &&
      url !== "/demo-receipt.svg")
  )
    return (
      <p className="form-hint">
        Este registro no tiene un comprobante adjunto disponible.
      </p>
    );
  return (
    <div className="payment-proof">
      <h3>Comprobante adjunto</h3>
      {url.startsWith("data:application/pdf") ? (
        <iframe title="Comprobante PDF" src={url} />
      ) : (
        <img src={url} alt="Comprobante adjunto al pago" />
      )}
    </div>
  );
}
export function Cashflow({ state }: { state: DemoState }) {
  const [months, setMonths] = useState(3);
  const [collection, setCollection] = useState(85);
  const revenue =
    (state.units.reduce((n, u) => n + u.monthlyQuota, 0) * collection) / 100;
  const payroll = state.employees
    .filter((e) => e.status === "activo")
    .reduce((n, e) => n + e.baseSalary * (1 + PAYROLL_RATES.employer), 0);
  return (
    <section className="content-card">
      <span className="eyebrow">ESCENARIO EXPLORATORIO</span>
      <h2>Proyección de caja</h2>
      <p>
        Estimación con cuotas actuales y costo salarial. No incluye otros gastos
        ni representa saldo bancario.
      </p>
      <div className="form-grid demo-form">
        <label>
          Meses
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          >
            {[1, 3, 6, 12].map((n) => (
              <option key={n} value={n}>
                {n} meses
              </option>
            ))}
          </select>
        </label>
        <label>
          Recaudación esperada: {collection} %
          <input
            type="range"
            min="0"
            max="100"
            value={collection}
            onChange={(e) => setCollection(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="projection-grid">
        {[
          ["Ingreso estimado", revenue * months],
          ["Costo salarial estimado", payroll * months],
          ["Diferencia proyectada", (revenue - payroll) * months],
        ].map(([label, n]) => (
          <div key={String(label)}>
            <span>{label}</span>
            <strong>{money(Number(n))}</strong>
          </div>
        ))}
      </div>
      <p className="form-hint">
        Modelo: cuotas × recaudación esperada − salarios activos y cargas del
        escenario, multiplicado por meses.
      </p>
    </section>
  );
}
