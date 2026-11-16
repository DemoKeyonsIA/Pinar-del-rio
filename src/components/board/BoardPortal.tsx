import { useState } from "react";
import type { UserProfile } from "../../types";
import { money, type Command, type DemoState } from "../../domain/demo";
import { AuditView } from "../admin/AuditView";
import { Dialog } from "../common/Dialog";

export function BoardPortal({
  state,
  user,
  run,
  onExport,
}: {
  state: DemoState;
  user: UserProfile;
  run: (c: Command) => DemoState;
  onExport: () => void;
}) {
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const [acta, setActa] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("requests");
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-emerald-900 text-white rounded-2xl p-8">
        <p className="text-emerald-200 text-sm">
          Modo demostración · {user.name}
        </p>
        <h1 className="text-2xl font-bold mt-2">Junta directiva</h1>
        <p className="mt-2">
          Supervisión, acuerdos y decisiones de la comunidad.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          [
            "Saldo pendiente",
            money(
              state.units.reduce(
                (n, u) => n + Math.max(0, u.currentBalance),
                0,
              ),
            ),
          ],
          [
            "Solicitudes por revisar",
            state.tickets.filter((t) =>
              ["Pendiente", "En Revisión"].includes(t.boardApproval || ""),
            ).length,
          ],
          ["Eventos registrados", state.audit.length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-white border border-slate-200 p-6 rounded-xl"
          >
            <p>{label}</p>
            <strong className="block text-2xl mt-2">{value}</strong>
          </div>
        ))}
      </div>
      <nav className="flex gap-3">
        <button className="button secondary" onClick={() => setTab("requests")}>
          Solicitudes y acuerdos
        </button>
        <button className="button secondary" onClick={() => setTab("audit")}>
          Actividad y trazabilidad
        </button>
      </nav>
      {tab === "audit" ? (
        <AuditView events={state.audit} onExport={onExport} />
      ) : (
        <section className="bg-white p-6 border border-slate-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">
            Solicitudes de mantenimiento
          </h2>
          {state.tickets.map((t) => (
            <article
              key={t.id}
              className="py-5 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between"
            >
              <div>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="text-sm text-slate-600">
                  {t.location} · {money(t.cost || t.costEstimated || 0)} ·{" "}
                  {t.boardApproval || "Pendiente"}
                </p>
                {t.boardActaNumber && (
                  <p className="text-sm">Acta: {t.boardActaNumber}</p>
                )}
              </div>
              <button
                className="button secondary"
                onClick={() => {
                  setSelected(t.id);
                  setReason("");
                  setActa("");
                  setError("");
                }}
              >
                Revisar solicitud
              </button>
            </article>
          ))}
        </section>
      )}
      {selected && (
        <Dialog
          title="Decisión de junta directiva"
          onClose={() => setSelected("")}
        >
          <p>{state.tickets.find((t) => t.id === selected)?.description}</p>
          <form className="demo-form" onSubmit={(e) => e.preventDefault()}>
            <label>
              Referencia de acta
              <input
                required
                value={acta}
                onChange={(e) => setActa(e.target.value)}
              />
            </label>
            <label>
              Motivo
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            {error && <p role="alert">{error}</p>}
            <div className="form-actions">
              {[false, true].map((approved) => (
                <button
                  type="button"
                  key={String(approved)}
                  className={`button ${approved ? "primary" : "danger"}`}
                  onClick={() => {
                    try {
                      run({
                        kind: "boardDecision",
                        id: selected,
                        approved,
                        reason,
                        acta,
                      });
                      setSelected("");
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  {approved ? "Aprobar" : "Rechazar"}
                </button>
              ))}
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
