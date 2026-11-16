import { useState } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { Employee, PaymentRecord, Unit, UserProfile } from "../../types";
import {
  referenceKey,
  uid,
  type Command,
  type DemoState,
} from "../../domain/demo";
import { defaultEntity } from "./RecordEditor";

type Kind = "units" | "payments" | "employees";
const headers: Record<Kind, string[]> = {
  units: [
    "FILIAL",
    "PROPIETARIO",
    "CUOTA",
    "SALDO",
    "SECTOR",
    "TELEFONO",
    "CORREO",
  ],
  payments: ["FILIAL", "MONTO", "REFERENCIA", "FECHA", "MEDIO", "CONCEPTO"],
  employees: ["NOMBRE", "CEDULA", "SALARIO", "PUESTO", "FECHA_INGRESO"],
};
interface Preview {
  row: number;
  value: Unit | PaymentRecord | Employee;
  errors: string[];
  duplicate: boolean;
}
const normalize = (s: unknown) => String(s ?? "").trim();
function excelDate(value: unknown): string {
  if (typeof value === "number") {
    const d = XLSX.SSF.parse_date_code(value);
    return d
      ? `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`
      : "";
  }
  const s = normalize(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) ? s : "";
}
export function ImportView({
  state,
  user,
  run,
}: {
  state: DemoState;
  user: UserProfile;
  run: (c: Command) => DemoState;
}) {
  const [kind, setKind] = useState<Kind>("payments");
  const [preview, setPreview] = useState<Preview[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const parse = async (file?: File) => {
    if (!file) return;
    setError("");
    setResult("");
    setPreview([]);
    setName(file.name);
    setBusy(true);
    try {
      if (file.size > 8 * 1024 * 1024)
        throw new Error("El archivo supera el límite de 8 MB.");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      if (!sheet) throw new Error("El archivo no contiene hojas.");
      const rows = XLSX.utils
        .sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
        .map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([k, v]) => [k.trim().toUpperCase(), v]),
          ),
        );
      if (!rows.length || rows.length > 5000)
        throw new Error("Seleccione un archivo con entre 1 y 5.000 filas.");
      const seen = new Set<string>();
      setPreview(
        rows.map((r, index) => {
          const errors: string[] = [];
          let value: Unit | PaymentRecord | Employee;
          let key = "";
          let duplicate = false;
          if (kind === "payments") {
            const filial = normalize(r.FILIAL);
            const unit = state.units.find(
              (u) =>
                u.number.toLowerCase() === filial.toLowerCase() ||
                u.number.replace(/\D/g, "") ===
                  filial.replace(/^Filial\s*#?/i, "").trim(),
            );
            const amount = Number(r.MONTO),
              reference = normalize(r.REFERENCIA),
              date = excelDate(r.FECHA),
              method = normalize(r.MEDIO).toLowerCase() || "cash";
            if (!unit) errors.push("Filial no encontrada");
            if (!Number.isFinite(amount) || amount <= 0)
              errors.push("Monto inválido");
            if (!reference) errors.push("Falta referencia");
            if (!date) errors.push("Fecha inválida: use AAAA-MM-DD");
            if (!["cash", "sinpe", "transfer", "card"].includes(method))
              errors.push("Medio: cash, sinpe, transfer o card");
            value = {
              id: uid(),
              unitId: unit?.id || "",
              unitNumber: unit?.number || filial,
              payerName: unit?.ownerName || "",
              payerEmail: unit?.ownerEmail || "",
              amount,
              reference,
              date,
              method: method as PaymentRecord["method"],
              concept: normalize(r.CONCEPTO) || "Cuota condominal",
              status: "applied",
            };
            key = referenceKey(value);
            duplicate = state.payments.some((p) => referenceKey(p) === key);
          } else if (kind === "units") {
            value = {
              ...defaultEntity("units", user),
              number: normalize(r.FILIAL),
              ownerName: normalize(r.PROPIETARIO),
              monthlyQuota: Number(r.CUOTA),
              currentBalance: normalize(r.SALDO) ? Number(r.SALDO) : 0,
              section: normalize(r.SECTOR) || "Sin sector",
              ownerPhone: normalize(r.TELEFONO),
              ownerEmail: normalize(r.CORREO),
            } as Unit;
            if (!value.number || !value.ownerName)
              errors.push("Faltan filial o propietario");
            if (!Number.isFinite(value.monthlyQuota) || value.monthlyQuota <= 0)
              errors.push("Cuota inválida");
            if (!Number.isFinite(value.currentBalance))
              errors.push("Saldo inválido");
            key = value.number.toLowerCase();
            duplicate = state.units.some((u) => u.number.toLowerCase() === key);
          } else {
            value = {
              ...defaultEntity("employees", user),
              name: normalize(r.NOMBRE),
              idNumber: normalize(r.CEDULA),
              baseSalary: Number(r.SALARIO),
              roleTitle: normalize(r.PUESTO),
              hireDate: excelDate(r.FECHA_INGRESO),
            } as Employee;
            if (!value.name || !value.idNumber || !value.roleTitle)
              errors.push("Faltan nombre, cédula o puesto");
            if (!Number.isFinite(value.baseSalary) || value.baseSalary <= 0)
              errors.push("Salario inválido");
            if (!value.hireDate) errors.push("Fecha de ingreso inválida");
            key = value.idNumber;
            duplicate = state.employees.some((e) => e.idNumber === key);
          }
          duplicate = duplicate || seen.has(key);
          seen.add(key);
          return { row: index + 2, value, errors, duplicate };
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const invalid = preview.filter((p) => p.errors.length);
  const duplicates = preview.filter((p) => p.duplicate && !p.errors.length);
  const valid = preview.filter((p) => !p.errors.length && !p.duplicate);
  return (
    <section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">DATOS CON CONTEXTO</span>
          <h1>Importaciones</h1>
          <p>
            Revise antes de incorporar. Ningún monto se completa con valores
            supuestos.
          </p>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.aoa_to_sheet([headers[kind]]),
              "DATOS",
            );
            run({
              kind: "record",
              module: "Importaciones",
              action: "Descargar plantilla",
              entityId: kind,
              summary: `Plantilla de ${kind}`,
            });
            XLSX.writeFile(wb, `plantilla-${kind}.xlsx`);
          }}
        >
          Descargar plantilla
        </button>
      </div>
      <div className="import-steps">
        <span className="active">01 · Seleccionar</span>
        <span className={preview.length ? "active" : ""}>02 · Revisar</span>
        <span className={result ? "active" : ""}>03 · Incorporar</span>
      </div>
      <div className="content-card">
        <label className="field-label">
          Tipo de información
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as Kind);
              setPreview([]);
              setName("");
              setResult("");
              setError("");
            }}
          >
            <option value="payments">Pagos y recibos</option>
            <option value="units">Filiales y residentes</option>
            <option value="employees">Personal</option>
          </select>
        </label>
        <label className="upload-zone">
          <Upload size={28} />
          <strong>
            {busy ? "Leyendo archivo…" : "Seleccione un archivo Excel o CSV"}
          </strong>
          <span>XLSX, XLS o CSV · Hasta 8 MB · Primera hoja</span>
          <input
            disabled={busy}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              void parse(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        <p className="form-hint">
          Columnas: {headers[kind].join(", ")}. Fechas en AAAA-MM-DD. Use montos
          numéricos sin símbolo monetario.
        </p>
      </div>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div className="success-message" role="status">
          <CheckCircle2 size={20} />
          {result}
        </div>
      )}
      {preview.length > 0 && (
        <div className="content-card">
          <div className="section-heading">
            <div>
              <h3>
                <FileSpreadsheet size={20} /> {name}
              </h3>
              <p>
                {valid.length} nuevos · {duplicates.length} duplicados ·{" "}
                {invalid.length} con errores
              </p>
            </div>
            <button
              className="button primary"
              disabled={!!invalid.length || !valid.length}
              onClick={() => {
                try {
                  const next = run({
                    kind: "import",
                    collection: kind,
                    rows: preview
                      .filter((p) => !p.errors.length)
                      .map((p) => p.value),
                  });
                  setResult(next.audit.at(-1)!.summary);
                  setPreview([]);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Confirmar {valid.length} registros
            </button>
          </div>
          {invalid.length > 0 && (
            <p className="inline-error">
              <AlertTriangle size={18} /> Corrija las filas indicadas y vuelva a
              cargar el archivo. No se importará ninguna fila hasta resolver los
              errores.
            </p>
          )}
          <div
            className="table-scroll"
            role="region"
            aria-label="Vista previa de importación"
            tabIndex={0}
          >
            <table>
              <caption className="sr-only">
                Filas revisadas antes de importar
              </caption>
              <thead>
                <tr>
                  <th>Fila</th>
                  <th>Registro</th>
                  <th>Resultado de revisión</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 100).map((p) => (
                  <tr key={p.row}>
                    <td>{p.row}</td>
                    <td>
                      {"unitNumber" in p.value
                        ? p.value.unitNumber
                        : "number" in p.value
                          ? p.value.number
                          : p.value.name}
                    </td>
                    <td>
                      {p.errors.length ? (
                        <span className="badge negative">
                          {p.errors.join(" · ")}
                        </span>
                      ) : p.duplicate ? (
                        <span className="badge review">
                          Duplicado · se omitirá
                        </span>
                      ) : (
                        <span className="badge success">
                          Listo para importar
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.length > 100 && (
            <p className="form-hint">
              Se muestran las primeras 100 filas; se validaron las{" "}
              {preview.length}.
            </p>
          )}
        </div>
      )}
      <div className="content-card">
        <h3>Últimas incorporaciones</h3>
        {[...state.audit]
          .reverse()
          .filter(
            (e) => e.module === "Importaciones" && e.action === "Importar",
          )
          .slice(0, 5)
          .map((e) => (
            <p key={e.id} className="import-history">
              {e.summary} · {e.actorName}
            </p>
          ))}
      </div>
    </section>
  );
}
