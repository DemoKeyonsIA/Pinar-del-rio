import { OverviewView } from "./OverviewView";
import { TreasuryView } from "./TreasuryView";
import { UnitsView } from "./UnitsView";
import { MaintenanceView } from "./MaintenanceView";
import { PeopleView } from "./PeopleView";
import { CommunicationsView } from "./CommunicationsView";
import {
  CashForm,
  QuotaForm,
  PayrollForm,
  RecordDetail,
  PaymentProof,
} from "./AdminWidgets";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Landmark,
  Building2,
  Wrench,
  Users,
  Megaphone,
  Upload,
  History,
  ChevronDown,
  LogOut,
  RotateCcw,
  Menu,
  X,
  CircleHelp,
} from "lucide-react";
import type {
  Employee,
  Invoice,
  PaymentRecord,
  Unit,
  UserProfile,
} from "../../types";
import {
  today,
  type Collection,
  type Command,
  type DemoState,
  type Entity,
} from "../../domain/demo";
import { download } from "../../domain/useDemo";
import { PinarLogo } from "../common/PinarLogo";
import { Dialog } from "../common/Dialog";
import { AuditView } from "./AuditView";
import { DataTable } from "./DataTable";
import { RecordEditor } from "./RecordEditor";
import { HouseholdEditor } from "./HouseholdEditor";
const ImportView = lazy(() =>
  import("./ImportView").then((m) => ({ default: m.ImportView })),
);
import { AdminAgent } from "../ai/AdminAgent";

type Tab =
  | "overview"
  | "treasury"
  | "units"
  | "maintenance"
  | "people"
  | "communications"
  | "imports"
  | "audit";
const navigation = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard },
  { id: "treasury", label: "Tesorería", icon: Landmark },
  { id: "units", label: "Filiales y residentes", icon: Building2 },
  { id: "maintenance", label: "Mantenimiento", icon: Wrench },
  { id: "people", label: "Personal", icon: Users },
  { id: "communications", label: "Comunicaciones", icon: Megaphone },
  { id: "imports", label: "Importaciones", icon: Upload },
  { id: "audit", label: "Actividad y trazabilidad", icon: History },
] as const;
interface Props {
  state: DemoState;
  user: UserProfile;
  run: (c: Command) => DemoState;
  onSwitch: () => void;
  onLogout: () => void;
  onReset: () => void;
}
export function AdminWorkspace({
  state: s,
  user,
  run,
  onSwitch,
  onLogout,
  onReset,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [mobile, setMobile] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const focusContent = useRef(false);
  useEffect(() => {
    if (focusContent.current && !mobile) {
      contentRef.current?.focus();
      focusContent.current = false;
    }
  }, [tab, mobile]);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    sidebarRef.current
      ?.querySelector<HTMLButtonElement>(".mobile-close")
      ?.focus();
    return () => previous?.focus();
  }, [mobile]);
  const [sub, setSub] = useState("payments");
  const [filter, setFilter] = useState("");
  const [editor, setEditor] = useState<{
    collection: Collection;
    value?: Entity;
  }>();
  const [detail, setDetail] = useState<{
    title: string;
    id: string;
    value: Entity | PaymentRecord | Invoice;
  }>();
  const [modal, setModal] = useState<
    "cash" | "quota" | "payroll" | "reset" | "help" | null
  >(null);
  const [confirmation, setConfirmation] = useState<{
    title: string;
    message: string;
    command: Command;
    reason?: boolean;
  }>();
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const pending = s.payments.filter((p) =>
    ["reported", "pending_validation"].includes(p.status),
  );
  const open = s.tickets.filter(
    (t) => !["resuelto", "cerrado"].includes(t.status),
  );
  const navigate = (id: string) => {
    if (navigation.some((n) => n.id === id)) {
      focusContent.current = true;
      setTab(id as Tab);
      setFilter("");
      setSub("payments");
      setMobile(false);
      window.scrollTo(0, 0);
    }
  };
  const perform = (
    c: Command,
    message = "Operación guardada y registrada.",
  ) => {
    try {
      const result = run(c);
      setSuccess(message);
      setLocalError("");
      return result;
    } catch (e) {
      setLocalError((e as Error).message);
      return undefined;
    }
  };
  const ask = (
    title: string,
    message: string,
    command: Command,
    needsReason = false,
  ) => {
    setReason("");
    setLocalError("");
    setConfirmation({ title, message, command, reason: needsReason });
  };
  const exportRows = async (name: string, rows: object[]) => {
    const XLSX = await import("xlsx");
    const result = perform(
      {
        kind: "record",
        module: navigation.find((n) => n.id === tab)?.label || "Datos",
        action: "Exportar",
        entityId: tab,
        summary: `${rows.length} registros exportados · filtro ${filter || "todos"}`,
      },
      "Archivo exportado.",
    );
    if (!result) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "DATOS");
    XLSX.writeFile(wb, `pinar-${name}-${today()}.xlsx`);
  };
  const inspect = (value: Entity | PaymentRecord | Invoice, title: string) => {
    if (
      perform(
        {
          kind: "record",
          module: navigation.find((n) => n.id === tab)?.label || "Datos",
          action: "Consultar detalle",
          entityId: value.id,
          summary: `Consulta de ${title}`,
        },
        "",
      )
    )
      setDetail({ title, id: value.id, value });
  };
  const collectionActions = (collection: Collection, row: Entity) => (
    <>
      <button
        className="text-action"
        onClick={() =>
          inspect(
            row,
            "name" in row
              ? row.name
              : "title" in row
                ? row.title
                : (row as Unit).number,
          )
        }
      >
        Detalle
      </button>
      <button
        className="text-action"
        onClick={() => setEditor({ collection, value: row })}
      >
        Editar
      </button>
      <button
        className="text-action negative-text"
        onClick={() =>
          ask(
            "Eliminar registro",
            "Esta acción elimina el registro y conserva su trazabilidad. Los registros financieros relacionados impedirán la eliminación.",
            { kind: "delete", collection, id: row.id },
          )
        }
      >
        Eliminar
      </button>
    </>
  );
  const exportAudit = (rows: typeof s.audit) => {
    if (
      perform(
        {
          kind: "record",
          module: "Actividad",
          action: "Exportar bitácora",
          entityId: "audit",
          summary: `Exportación filtrada de ${rows.length} eventos`,
        },
        "Bitácora exportada.",
      )
    )
      download(`pinar-actividad-${today()}.json`, rows);
  };
  const month = new Intl.DateTimeFormat("es-CR", {
    month: "long",
    year: "numeric",
    timeZone: "America/Costa_Rica",
  }).format(new Date());
  const moduleProps = {
    s,
    user,
    run,
    sub,
    setSub,
    filter,
    setFilter,
    setEditor,
    setModal,
    inspect,
    ask,
    collectionActions,
    exportRows,
    navigate,
    month,
  };
  return (
    <div className="admin-shell">
      <a
        className="admin-skip-link"
        href="#admin-content"
        onClick={(e) => {
          e.preventDefault();
          contentRef.current?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <aside
        id="admin-navigation"
        ref={sidebarRef}
        className={`admin-sidebar ${mobile ? "is-open" : ""}`}
        role={mobile ? "dialog" : undefined}
        aria-modal={mobile || undefined}
        aria-label="Navegación administrativa"
        onKeyDown={(e) => {
          if (!mobile) return;
          if (e.key === "Escape") setMobile(false);
          if (e.key === "Tab") {
            const nodes =
              sidebarRef.current?.querySelectorAll<HTMLButtonElement>("button");
            if (!nodes?.length) return;
            const first = nodes[0],
              last = nodes[nodes.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="sidebar-brand">
          <PinarLogo size="sm" />
          <button
            className="mobile-close"
            aria-label="Cerrar menú"
            onClick={() => setMobile(false)}
          >
            <X size={20} />
          </button>
        </div>
        <button className="community-switch" onClick={onSwitch}>
          <span className="community-icon">
            <Building2 size={20} />
          </span>
          <span>
            <strong>Pinar del Río</strong>
            <small>Administración residencial</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <span className="nav-caption">SU ESPACIO DE TRABAJO</span>
        <nav aria-label="Administración">
          {navigation.map((n) => (
            <button
              key={n.id}
              aria-current={tab === n.id ? "page" : undefined}
              className={tab === n.id ? "active" : ""}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
              {n.id === "treasury" && pending.length > 0 && (
                <span className="nav-count">{pending.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-note">
            <span className="demo-dot" />
            <strong>Modo demostración</strong>
            <p>
              Explore con libertad. Los cambios se guardan en este navegador.
            </p>
          </div>
          <button onClick={() => setModal("help")}>
            <CircleHelp size={18} /> Ayuda con la demo
          </button>
          <button onClick={() => setModal("reset")}>
            <RotateCcw size={18} /> Restablecer escenario
          </button>
          <div className="sidebar-signature">
            Tecnología con sentido<span>KEYONS</span>
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-scrim"
          tabIndex={-1}
          aria-hidden="true"
          aria-label="Cerrar navegación"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="admin-stage" inert={mobile}>
        <header className="admin-topbar">
          <div className="breadcrumb">
            <button
              className="mobile-open"
              aria-label="Abrir menú"
              aria-expanded={mobile}
              aria-controls="admin-navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={22} />
            </button>
            <span>Administración</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{navigation.find((n) => n.id === tab)?.label}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-pill">
              <span /> Demo interactiva
            </span>
            <button className="profile-button" onClick={onSwitch}>
              <span className="avatar">SM</span>
              <span>
                <strong>{user.name}</strong>
                <small>Administradora</small>
              </span>
              <ChevronDown size={15} />
            </button>
            <button
              className="logout-button"
              title="Salir"
              aria-label="Salir de la demo"
              onClick={onLogout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <div
          className="admin-content"
          id="admin-content"
          ref={contentRef}
          tabIndex={-1}
          role="region"
          aria-label={`Contenido: ${navigation.find((n) => n.id === tab)?.label}`}
        >
          {(success || localError) && (
            <div
              className={localError ? "inline-error" : "success-message"}
              role={localError ? "alert" : "status"}
            >
              {localError || success}
              <button
                aria-label="Cerrar mensaje"
                onClick={() => {
                  setSuccess("");
                  setLocalError("");
                }}
              >
                <X size={17} />
              </button>
            </div>
          )}
          {tab === "overview" && <OverviewView {...moduleProps} />}
          {tab === "treasury" && <TreasuryView {...moduleProps} />}
          {tab === "units" && <UnitsView {...moduleProps} />}
          {tab === "maintenance" && <MaintenanceView {...moduleProps} />}
          {tab === "people" && <PeopleView {...moduleProps} />}
          {tab === "communications" && <CommunicationsView {...moduleProps} />}
          {tab === "imports" && (
            <Suspense fallback={<p role="status">Preparando importador…</p>}>
              <ImportView state={s} user={user} run={run} />
            </Suspense>
          )}
          {tab === "audit" && (
            <AuditView primary events={s.audit} onExport={exportAudit} />
          )}
          <footer className="admin-footer">
            <span>Pinar del Río · Cada detalle cuenta.</span>
            <span>
              <span className="saved-dot" /> Datos guardados en este navegador
            </span>
          </footer>
        </div>
      </div>
      <div inert={mobile}>
        <AdminAgent
          key={`${user.id}-${s.sessionId}`}
          state={s}
          user={user}
          navigate={navigate}
          onQuery={() =>
            !!perform(
              {
                kind: "record",
                module: "Agente",
                action: "Consultar agente",
                entityId: tab,
                summary:
                  "Consulta de orientación con los datos de la demo; no se almacena el texto de la conversación.",
                origin: "agent",
              },
              "",
            )
          }
        />
      </div>
      {editor && (
        <RecordEditor
          key={editor.value?.id || editor.collection}
          collection={editor.collection}
          value={editor.value}
          user={user}
          run={run}
          onClose={() => setEditor(undefined)}
        />
      )}
      {detail && (
        <Dialog title={detail.title} onClose={() => setDetail(undefined)} wide>
          <RecordDetail
            value={
              [
                ...s.units,
                ...s.tickets,
                ...s.news,
                ...s.employees,
                ...s.shifts,
                ...s.payments,
                ...s.invoices,
              ].find((v) => v.id === detail.id) || detail.value
            }
          />
          {s.units.some((u) => u.id === detail.id) && (
            <HouseholdEditor
              unit={s.units.find((u) => u.id === detail.id)!}
              run={run}
            />
          )}
          {"amount" in detail.value && (
            <PaymentProof url={detail.value.receiptProofUrl} />
          )}
          <h3 className="detail-history-title">Historia de este registro</h3>
          <AuditView events={s.audit} entityId={detail.id} />
          {"amount" in detail.value && detail.value.receiptProofUrl && (
            <a
              className="button secondary"
              href={detail.value.receiptProofUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                run({
                  kind: "record",
                  module: "Tesorería",
                  action: "Consultar comprobante",
                  entityId: detail.id,
                  summary: "Comprobante consultado",
                })
              }
            >
              Abrir comprobante
            </a>
          )}
        </Dialog>
      )}
      {confirmation && (
        <Dialog
          title={confirmation.title}
          onClose={() => {
            setConfirmation(undefined);
            setLocalError("");
          }}
        >
          <p className="dialog-intro">{confirmation.message}</p>
          {confirmation.command.kind === "applyPayment" && (
            <PaymentProof
              url={
                s.payments.find(
                  (p) =>
                    p.id ===
                    ("id" in confirmation.command
                      ? confirmation.command.id
                      : ""),
                )?.receiptProofUrl
              }
            />
          )}
          {confirmation.reason && (
            <label className="field-label">
              Motivo obligatorio
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </label>
          )}
          {localError && (
            <p className="inline-error" role="alert">
              {localError}
            </p>
          )}
          <div className="form-actions">
            <button
              className="button secondary"
              onClick={() => setConfirmation(undefined)}
            >
              Cancelar
            </button>
            <button
              className={`button ${confirmation.command.kind === "delete" || confirmation.command.kind.includes("reject") || confirmation.command.kind.includes("reverse") ? "danger" : "primary"}`}
              disabled={confirmation.reason && !reason.trim()}
              onClick={() => {
                const command = confirmation.command;
                if ("reason" in command) command.reason = reason;
                if (perform(command)) setConfirmation(undefined);
              }}
            >
              Confirmar
            </button>
          </div>
        </Dialog>
      )}
      {modal === "cash" && (
        <CashForm state={s} run={run} onClose={() => setModal(null)} />
      )}
      {modal === "quota" && (
        <QuotaForm state={s} run={run} onClose={() => setModal(null)} />
      )}
      {modal === "payroll" && (
        <PayrollForm run={run} onClose={() => setModal(null)} />
      )}
      {modal === "reset" && (
        <Dialog title="Restablecer la demo" onClose={() => setModal(null)}>
          <p className="dialog-intro">
            Se reemplazarán los cambios y el historial local por el escenario
            inicial. Puede descargar una copia de la actividad antes de
            continuar.
          </p>
          <div className="form-actions">
            <button
              className="button secondary"
              onClick={() => exportAudit(s.audit)}
            >
              Exportar historial
            </button>
            <button
              className="button danger"
              onClick={() => {
                onReset();
                setModal(null);
                setTab("overview");
              }}
            >
              Restablecer escenario
            </button>
          </div>
        </Dialog>
      )}
      {modal === "help" && (
        <Dialog title="Una demo para explorar" onClose={() => setModal(null)}>
          <div className="help-content">
            <p>
              Empiece en Resumen y abra un pago pendiente. Valídelo y consulte
              el movimiento en Actividad y trazabilidad.
            </p>
            <p>
              Use el selector de perfil para entrar como condómino o junta
              directiva. Cada acción conserva su autor.
            </p>
            <p>
              Los datos se conservan en este navegador. No se envían correos, no
              se transfieren fondos y el agente responde mediante reglas.
            </p>
            <p>
              Las fechas históricas del escenario conviven con las operaciones
              nuevas. Los indicadores del mes usan la fecha actual de Costa
              Rica.
            </p>
            <p>
              La bitácora local demuestra el flujo de auditoría; no es un
              registro resistente a manipulaciones.
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
}
