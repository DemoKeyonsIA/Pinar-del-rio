import { useState } from "react";
import { Dialog } from "../common/Dialog";
import {
  today,
  uid,
  type Collection,
  type Command,
  type DemoState,
  type Entity,
} from "../../domain/demo";
import type {
  Employee,
  MaintenanceTicket,
  NewsAnnouncement,
  ShiftDefinition,
  Unit,
  UserProfile,
} from "../../types";

interface Field {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
  min?: number;
  step?: string;
}
export const schemas: Record<Collection, Field[]> = {
  units: [
    { key: "number", label: "Filial", required: true },
    { key: "ownerName", label: "Propietario", required: true },
    { key: "section", label: "Sector", required: true },
    { key: "ownerPhone", label: "Teléfono" },
    { key: "ownerEmail", label: "Correo", type: "email" },
    {
      key: "monthlyQuota",
      label: "Cuota mensual (₡)",
      type: "number",
      min: 1,
      required: true,
    },
    {
      key: "currentBalance",
      label: "Saldo inicial (₡)",
      type: "number",
      required: true,
    },
    { key: "areaM2", label: "Área (m²)", type: "number", min: 1 },
    { key: "emergencyContactName", label: "Contacto de emergencia" },
    { key: "emergencyPhone", label: "Teléfono de emergencia" },
  ],
  tickets: [
    { key: "title", label: "Título", required: true },
    {
      key: "description",
      label: "Descripción",
      type: "textarea",
      required: true,
    },
    { key: "location", label: "Ubicación", required: true },
    {
      key: "category",
      label: "Categoría",
      options: [
        "Mantenimiento General",
        "Electricidad",
        "Fontanería",
        "Áreas verdes",
        "Seguridad",
      ],
    },
    {
      key: "priority",
      label: "Prioridad",
      options: ["baja", "media", "alta", "urgente"],
    },
    {
      key: "status",
      label: "Estado",
      options: ["nuevo", "en_proceso", "cotizando", "resuelto", "cerrado"],
    },
    { key: "assignedVendor", label: "Responsable o proveedor" },
    { key: "cost", label: "Costo previsto (₡)", type: "number", min: 0 },
    { key: "date", label: "Fecha prevista", type: "date" },
    { key: "motive", label: "Motivo técnico", type: "textarea" },
  ],
  news: [
    { key: "title", label: "Título", required: true },
    { key: "summary", label: "Resumen", type: "textarea", required: true },
    { key: "content", label: "Contenido", type: "textarea", required: true },
    {
      key: "category",
      label: "Categoría",
      options: ["comunicado", "mantenimiento", "evento", "asamblea"],
    },
    {
      key: "status",
      label: "Estado",
      options: ["draft", "active", "scheduled", "expired"],
    },
    { key: "publishScheduleDate", label: "Fecha programada", type: "date" },
    { key: "image", label: "URL de imagen", type: "url" },
  ],
  employees: [
    { key: "name", label: "Nombre", required: true },
    { key: "idNumber", label: "Identificación", required: true },
    {
      key: "role",
      label: "Área",
      options: [
        "Seguridad",
        "Mantenimiento",
        "Jardinería",
        "Limpieza",
        "Administración",
      ],
    },
    { key: "roleTitle", label: "Puesto", required: true },
    {
      key: "baseSalary",
      label: "Salario base mensual (₡)",
      type: "number",
      min: 1,
      step: "0.01",
      required: true,
    },
    {
      key: "status",
      label: "Estado",
      options: ["activo", "vacaciones", "incapacitado", "inactivo"],
    },
    {
      key: "hireDate",
      label: "Fecha de ingreso",
      type: "date",
      required: true,
    },
    { key: "email", label: "Correo", type: "email" },
    { key: "phone", label: "Teléfono" },
    { key: "iban", label: "IBAN" },
    { key: "bankName", label: "Banco" },
    {
      key: "payrollExtras",
      label: "Extras del período (₡)",
      type: "number",
      min: 0,
      step: "0.01",
    },
    {
      key: "payrollDeductions",
      label: "Otras deducciones (₡)",
      type: "number",
      min: 0,
      step: "0.01",
    },
    {
      key: "unworkedDays",
      label: "Días no laborados del período",
      type: "number",
      min: 0,
    },
    {
      key: "vacationDaysTotal",
      label: "Días de vacaciones configurados (total)",
      type: "number",
      min: 0,
    },
    {
      key: "vacationDaysTaken",
      label: "Días de vacaciones utilizados",
      type: "number",
      min: 0,
    },
  ],
  shifts: [
    { key: "name", label: "Nombre del turno", required: true },
    { key: "startTime", label: "Inicio", type: "time", required: true },
    { key: "endTime", label: "Fin", type: "time", required: true },
    {
      key: "hoursWeekly",
      label: "Horas semanales",
      type: "number",
      min: 1,
      required: true,
    },
    {
      key: "category",
      label: "Área",
      options: ["Seguridad", "Mantenimiento", "Limpieza", "General"],
    },
    { key: "description", label: "Descripción", type: "textarea" },
  ],
};
export function defaultEntity(
  collection: Collection,
  user: UserProfile,
): Entity {
  const base = { id: uid() };
  if (collection === "units")
    return {
      ...base,
      number: "",
      ownerName: "",
      ownerPhone: "",
      ownerEmail: "",
      section: "Sector Los Pinos",
      monthlyQuota: 85000,
      currentBalance: 0,
      areaM2: 180,
      participationPercentage: 0,
      arrearsStatus: "up_to_date",
      residents: [],
    } as Unit;
  if (collection === "tickets")
    return {
      ...base,
      title: "",
      description: "",
      location: "",
      category: "Mantenimiento General",
      priority: "media",
      status: "nuevo",
      unitNumber: "Áreas comunes",
      residentName: user.name,
      createdAt: today(),
      boardApproval: "Pendiente",
      cost: 0,
    } as MaintenanceTicket;
  if (collection === "news")
    return {
      ...base,
      title: "",
      summary: "",
      content: "",
      category: "comunicado",
      status: "draft",
      date: today(),
      author: user.name,
    } as NewsAnnouncement;
  if (collection === "shifts")
    return {
      ...base,
      name: "",
      startTime: "07:00",
      endTime: "15:00",
      hoursWeekly: 40,
      category: "General",
      description: "",
    } as ShiftDefinition;
  return {
    ...base,
    name: "",
    idNumber: "",
    role: "Seguridad",
    roleTitle: "",
    baseSalary: 0,
    status: "activo",
    hireDate: today(),
    email: "",
    phone: "",
    iban: "",
    bankName: "",
    ccssInsuranceNumber: "",
    payslips: [],
    vacationDaysTotal: 0,
    vacationDaysTaken: 0,
    schedule: {
      shiftName: "Sin asignar",
      hoursWeekly: 0,
      daysOff: [],
      monday: "Sin asignar",
      tuesday: "Sin asignar",
      wednesday: "Sin asignar",
      thursday: "Sin asignar",
      friday: "Sin asignar",
      saturday: "Libre",
      sunday: "Libre",
    },
  } as Employee;
}
const fieldLabels: Record<string, string> = {
  draft: "Borrador",
  active: "Publicado",
  scheduled: "Programado",
  expired: "Archivado",
  nuevo: "Nuevo",
  en_proceso: "En proceso",
  cotizando: "Cotizando",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};
export function RecordEditor({
  collection,
  value,
  user,
  run,
  onClose,
}: {
  collection: Collection;
  value?: Entity;
  user: UserProfile;
  run: (c: Command) => DemoState;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>(() => ({
    ...(value || defaultEntity(collection, user)),
  }));
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const names = {
    units: "filial",
    tickets: "incidencia",
    news: "comunicado",
    employees: "empleado",
    shifts: "turno",
  };
  return (
    <Dialog
      title={`${value ? "Editar" : "Crear"} ${names[collection]}`}
      onClose={onClose}
      wide
    >
      <form
        className="demo-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            run({
              kind: "save",
              collection,
              value: draft as unknown as Entity,
            });
            onClose();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <p className="form-hint">
          Los campos con * son obligatorios. Los cambios quedarán registrados a
          nombre de {user.name}.
        </p>
        <div className="form-grid">
          {schemas[collection].map((f) => (
            <label
              key={f.key}
              className={f.type === "textarea" ? "full-width" : ""}
            >
              {f.label}
              {f.required ? " *" : ""}
              {f.options ? (
                <select
                  value={String(draft[f.key] || "")}
                  onChange={(e) =>
                    setDraft({ ...draft, [f.key]: e.target.value })
                  }
                >
                  {f.options.map((o) => (
                    <option key={o} value={o}>
                      {fieldLabels[o] || o}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  required={f.required}
                  rows={f.key === "content" ? 6 : 3}
                  value={String(draft[f.key] || "")}
                  onChange={(e) =>
                    setDraft({ ...draft, [f.key]: e.target.value })
                  }
                />
              ) : (
                <input
                  required={f.required}
                  type={f.type || "text"}
                  min={f.min}
                  step={f.step || "any"}
                  value={String(draft[f.key] ?? "")}
                  disabled={
                    (collection === "employees" &&
                      f.key === "vacationDaysTaken") ||
                    (collection === "units" &&
                      !!value &&
                      f.key === "currentBalance")
                  }
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      [f.key]:
                        f.type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              )}
            </label>
          ))}
        </div>
        {collection === "units" && value && (
          <p className="form-hint">
            El saldo se modifica mediante pagos y movimientos; no se reemplaza
            desde la ficha.
          </p>
        )}
        {collection === "employees" && (
          <p className="form-hint">
            El horario diario y las vacaciones disfrutadas se gestionan desde
            las acciones del módulo Personal. Guardar esta ficha conserva su
            historial.
          </p>
        )}
        {collection === "news" && (
          <>
            <button
              type="button"
              className="button secondary"
              onClick={() => setPreview(!preview)}
            >
              {preview ? "Ocultar" : "Ver"} vista previa
            </button>
            {preview && (
              <article className="notice-preview">
                <span className="eyebrow">VISTA PREVIA · NO PUBLICADO</span>
                <h2>{String(draft.title || "Título")}</h2>
                <p>{String(draft.summary || "")}</p>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {String(draft.content || "")}
                </div>
              </article>
            )}
          </>
        )}
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary">
            Guardar {names[collection]}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
