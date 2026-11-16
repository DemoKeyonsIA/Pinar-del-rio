import { lazy, Suspense, useState } from "react";
import type { Invoice, UserProfile } from "./types";
import { Navbar, type AppView } from "./components/common/Navbar";
import { LandingHome } from "./components/landing/LandingHome";
import { ResidentPortal } from "./components/resident/ResidentPortal";
import { InvoiceModal } from "./components/invoices/InvoiceModal";
import { AuthModal } from "./components/auth/AuthModal";
import { AIAssistantWidget } from "./components/ai/AIAssistantWidget";
import { NewsBlogView } from "./components/news/NewsBlogView";
import { EmployeePortal } from "./components/employee/EmployeePortal";
const AdminWorkspace = lazy(() =>
  import("./components/admin/AdminWorkspace").then((m) => ({
    default: m.AdminWorkspace,
  })),
);
import { useDemo, download } from "./domain/useDemo";
import { today, uid, type Command } from "./domain/demo";
import "./admin.css";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { AuditView } from "./components/admin/AuditView";
import { Dialog } from "./components/common/Dialog";

export default function App() {
  const demo = useDemo();
  const s = demo.state;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<AppView>("landing");
  const [auth, setAuth] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [article, setArticle] = useState<string>();
  const [residentTab, setResidentTab] = useState<
    "overview" | "pay" | "invoices" | "reservations" | "tickets"
  >("overview");
  const [ai, setAi] = useState(false);
  const [prompt, setPrompt] = useState<string>();
  const [notice, setNotice] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const unit = user ? s.units.find((u) => u.id === user.unitId) : undefined;
  const employee =
    user?.role === "employee"
      ? s.employees.find((e) => e.id === user.employeeId)
      : undefined;
  const isAdmin = user?.role === "admin" && view === "admin";
  const run = (command: Command) => demo.run(user, command);
  const selectUser = (next: UserProfile) => {
    if (next.role === "board") return;
    try {
      demo.run(next, { kind: "session", user: next, previous: user });
      setUser(next);
      setView(
        next.role === "admin"
          ? "admin"
          : next.role === "employee"
            ? "employee"
            : "resident",
      );
      setAi(false);
      setPrompt(undefined);
      setInvoice(null);
      setHistoryOpen(false);
      setNotice("");
    } catch {
      /* The global error banner explains the failure. */
    }
  };
  const logout = () => {
    try {
      run({ kind: "session", user: null, previous: user });
      setUser(null);
      setView("landing");
      setAi(false);
      setInvoice(null);
    } catch {}
  };
  const navigateResident = (tab?: string) => {
    if (!user || !unit) {
      setAuth(true);
      return;
    }
    if (
      tab &&
      ["overview", "pay", "invoices", "reservations", "tickets"].includes(tab)
    )
      setResidentTab(tab as typeof residentTab);
    setView("resident");
    window.scrollTo(0, 0);
  };
  const openAgent = (p?: string) => {
    setPrompt(p);
    setAi(true);
  };
  const recordInvoice = (inv: Invoice) => {
    run({
      kind: "record",
      module: "Facturas",
      action: "Consultar factura",
      entityId: user?.role === "resident" ? user.unitId! : inv.id,
      summary: `Consulta ${inv.id}`,
    });
    setInvoice(inv);
  };
  const exportAudit = () => {
    const snapshot = s.audit;
    run({
      kind: "record",
      module: "Actividad",
      action: "Exportar",
      entityId: "audit",
      summary: `Exportación de ${snapshot.length} eventos`,
    });
    download("pinar-actividad.json", snapshot);
  };
  return (
    <div
      className={
        isAdmin
          ? "admin-root"
          : "min-h-screen bg-slate-50 flex flex-col text-slate-900"
      }
    >
      {!isAdmin && (
        <Navbar
          currentUser={user}
          currentView={view}
          onNavigate={(v) => {
            if (
              (v === "admin" && user?.role !== "admin") ||
              (v === "employee" && user?.role !== "employee") ||
              (v === "resident" && !unit)
            ) {
              setAuth(true);
              return;
            }
            setView(v);
          }}
          onOpenAuth={() => setAuth(true)}
          notifications={[]}
          onMarkNotificationRead={() => {}}
        />
      )}
      {demo.error && (
        <div className="global-error" role="alert">
          <span>{demo.error}</span>
          <button onClick={demo.clearError}>Cerrar</button>
        </div>
      )}
      {notice && (
        <div className="global-notice" role="status">
          {notice}
          <button onClick={() => setNotice("")}>Cerrar</button>
        </div>
      )}
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="p-8" role="status">
                Preparando su espacio de trabajo…
              </div>
            }
          >
            {view === "landing" && (
              <LandingHome
                currentUser={user}
                currentUnit={unit}
                news={s.news.filter((n) => !n.status || n.status === "active")}
                events={s.events}
                amenities={s.amenities}
                onNavigateToResident={navigateResident}
                onOpenNewsBlog={(id) => {
                  setArticle(id);
                  setView("news");
                }}
                onOpenAiAssistant={openAgent}
                onOpenAuth={() => setAuth(true)}
                onPublishNews={(n) => {
                  run({
                    kind: "save",
                    collection: "news",
                    value: { ...n, id: uid(), date: today() },
                  });
                }}
              />
            )}
            {view === "news" && (
              <NewsBlogView
                news={s.news.filter((n) => !n.status || n.status === "active")}
                selectedArticleId={article}
                currentUser={user}
                onBackToHome={() => setView("landing")}
                onNavigateToResident={navigateResident}
              />
            )}
            {view === "resident" && user && unit && (
              <ResidentPortal
                key={`${user.id}-${unit.id}`}
                onManageVisit={run}
                advertisingState={s}
                currentUser={user}
                currentUnit={unit}
                invoices={s.invoices.filter((i) => i.unitId === unit.id)}
                payments={s.payments.filter((p) => p.unitId === unit.id)}
                amenities={s.amenities}
                reservations={s.reservations.filter(
                  (r) => r.unitNumber === unit.number,
                )}
                tickets={s.tickets.filter((t) => t.unitNumber === unit.number)}
                initialTab={residentTab}
                onOpenInvoice={recordInvoice}
                onSubmitPayment={(p) => {
                  run({
                    kind: "reportPayment",
                    value: {
                      ...p,
                      id: uid(),
                      date: today(),
                      status: "pending_validation",
                    },
                  });
                }}
                onCreateReservation={(r) => {
                  run({
                    kind: "reservation",
                    value: {
                      ...r,
                      id: uid(),
                      createdAt: today(),
                      status: "confirmed",
                    },
                  });
                }}
                onCreateTicket={(t) => {
                  run({
                    kind: "save",
                    collection: "tickets",
                    value: {
                      ...t,
                      id: uid(),
                      createdAt: today(),
                      status: "nuevo",
                      boardApproval: "Pendiente",
                    },
                  });
                }}
                onOpenAiAssistant={openAgent}
                onUpdateUnitHousehold={(id, data) => {
                  const u = s.units.find((u) => u.id === id);
                  if (u)
                    run({
                      kind: "save",
                      collection: "units",
                      value: { ...u, ...data },
                    });
                }}
              />
            )}
            {view === "admin" && user?.role === "admin" && (
              <AdminWorkspace
                state={s}
                user={user}
                run={run}
                onSwitch={() => setAuth(true)}
                onLogout={logout}
                onReset={() => {
                  if (demo.reset(user)) {
                    setNotice(
                      "Demo restablecida. Se inició una nueva sesión de datos.",
                    );
                  }
                }}
              />
            )}
            {view === "resident" && user?.role === "resident" && unit && (
              <div className="max-w-7xl mx-auto px-6 pb-8">
                <button
                  className="text-sm font-semibold text-emerald-800 underline underline-offset-4"
                  onClick={() => {
                    run({
                      kind: "record",
                      module: "Actividad",
                      action: "Consultar historial de filial",
                      entityId: unit.id,
                      summary: `Consulta de historial de ${unit.number}`,
                    });
                    setHistoryOpen(true);
                  }}
                >
                  Consultar actividad de mi filial
                </button>
              </div>
            )}
            {view === "employee" && user && employee && (
              <EmployeePortal
                currentUser={user}
                employee={employee}
                onNavigateHome={() => setView("landing")}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isAdmin && (
        <AIAssistantWidget
          key={user?.id || "guest"}
          isOpen={ai}
          onToggle={() => setAi(!ai)}
          currentUser={user}
          currentUnit={unit}
          onNavigateToResident={navigateResident}
          initialPrompt={prompt}
        />
      )}
      {invoice && (
        <InvoiceModal
          invoice={invoice}
          paymentRecord={s.payments.find((p) => p.id === invoice.paidWithPayId)}
          onClose={() => setInvoice(null)}
        />
      )}
      {historyOpen && user?.role === "resident" && unit && (
        <Dialog
          title={`Actividad de ${unit.number}`}
          onClose={() => setHistoryOpen(false)}
          wide
        >
          <AuditView
            events={s.audit.filter(
              (e) =>
                e.actorId === user.id ||
                [
                  unit.id,
                  ...s.payments
                    .filter((p) => p.unitId === unit.id)
                    .map((p) => p.id),
                  ...s.invoices
                    .filter((i) => i.unitId === unit.id)
                    .map((i) => i.id),
                  ...s.tickets
                    .filter((t) => t.unitNumber === unit.number)
                    .map((t) => t.id),
                  ...s.reservations
                    .filter((r) => r.unitNumber === unit.number)
                    .map((r) => r.id),
                ].includes(e.entityId),
            )}
          />
        </Dialog>
      )}
      <AuthModal
        isOpen={auth}
        currentUser={user}
        onSelectUser={selectUser}
        onLogout={logout}
        onClose={() => setAuth(false)}
      />
    </div>
  );
}
