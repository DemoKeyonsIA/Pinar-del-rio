import { useRef, useState } from "react";
import { CalendarDays, Car, Plus, ShieldCheck, UserRound } from "lucide-react";
import type { Unit, ApprovedVisit } from "../../types";
import { today, stamp, type Command, type DemoState } from "../../domain/demo";
import "../../resident-visits.css";

export function ApprovedVisits({
  unit,
  run,
}: {
  unit: Unit;
  run: (command: Command) => DemoState;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(today());
  const [plate, setPlate] = useState("");
  const [notes, setNotes] = useState("");
  const [revoking, setRevoking] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const addButton = useRef<HTMLButtonElement>(null);
  const nameField = useRef<HTMLInputElement>(null);
  const visits = [...(unit.approvedVisits || [])].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || a.name.localeCompare(b.name, "es"),
  );
  const active = visits.filter(
    (v) => v.status === "approved" && v.date >= today(),
  );
  const history = visits
    .filter((v) => v.status === "revoked" || v.date < today())
    .reverse();
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("es-CR", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(new Date(value + "T12:00:00Z"));
  const cancelAdd = () => {
    setAdding(false);
    setError("");
    addButton.current?.focus();
  };
  const card = (visit: ApprovedVisit, archived = false) => (
    <li className="visit-card" key={visit.id}>
      <div className="visit-card-top">
        <div className="visit-person">
          <UserRound size={21} aria-hidden="true" />
          <h4>{visit.name}</h4>
        </div>
        <span
          className={`visit-badge ${visit.status === "revoked" ? "revoked" : archived ? "past" : ""}`}
        >
          {visit.status === "revoked"
            ? "Revocada"
            : archived
              ? "Finalizada"
              : "Aprobada"}
        </span>
      </div>
      <p className="visit-date">
        <CalendarDays size={17} aria-hidden="true" />
        <time dateTime={visit.date}>{formatDate(visit.date)}</time>
      </p>
      {visit.plate && (
        <p className="visit-date">
          <Car size={17} aria-hidden="true" />
          Placa: {visit.plate}
        </p>
      )}
      {visit.notes && <p className="visit-notes">{visit.notes}</p>}
      <p className="visit-meta">
        Aprobada por {visit.approvedBy} · {stamp(visit.approvedAt)}
      </p>
      {visit.revokedAt && (
        <p className="visit-meta">
          Revocada por {visit.revokedBy} · {stamp(visit.revokedAt)}
          <br />
          Motivo: {visit.revocationReason}
        </p>
      )}
      {!archived &&
        (revoking === visit.id ? (
          <form
            className="visit-form visit-revoke"
            onSubmit={(e) => {
              e.preventDefault();
              try {
                run({
                  kind: "revokeVisit",
                  unitId: unit.id,
                  id: visit.id,
                  reason,
                });
                setRevoking("");
                setReason("");
                setError("");
                setMessage(`La autorización de ${visit.name} fue revocada.`);
                addButton.current?.focus();
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <label>
              Motivo para revocar *
              <textarea
                autoFocus
                required
                maxLength={240}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <div className="visit-actions">
              <button
                type="button"
                onClick={() => {
                  setRevoking("");
                  setError("");
                }}
              >
                Cancelar
              </button>
              <button className="visit-danger">Confirmar revocación</button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="visit-revoke-button"
            onClick={() => {
              setRevoking(visit.id);
              setReason("");
              setError("");
              setMessage("");
            }}
          >
            Revocar autorización
            <span className="sr-only"> de {visit.name}</span>
          </button>
        ))}
    </li>
  );
  return (
    <section
      className="resident-visits"
      aria-labelledby="approved-visits-title"
    >
      <header className="visit-heading">
        <div>
          <span className="visit-kicker">
            <ShieldCheck size={18} aria-hidden="true" />
            Acceso a su filial
          </span>
          <h3 id="approved-visits-title">Visitas aprobadas</h3>
          <p>
            Autorice visitas para una fecha y consulte quién las aprobó. Las
            acciones se guardan en la bitácora de su filial.
          </p>
        </div>
        <button
          ref={addButton}
          type="button"
          className="visit-primary"
          aria-expanded={adding}
          aria-controls="approve-visit-form"
          onClick={() => {
            setAdding(!adding);
            setRevoking("");
            setError("");
            setMessage("");
          }}
        >
          <Plus size={18} aria-hidden="true" />
          {adding ? "Cerrar formulario" : "Autorizar visita"}
        </button>
      </header>
      {message && (
        <p className="visit-success" role="status">
          {message}
        </p>
      )}
      {adding && (
        <form
          className="visit-form"
          id="approve-visit-form"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              run({
                kind: "approveVisit",
                unitId: unit.id,
                name,
                date,
                plate,
                notes,
              });
              setAdding(false);
              setName("");
              setPlate("");
              setNotes("");
              setError("");
              setMessage(
                `Visita de ${name.trim()} aprobada para el ${formatDate(date)}.`,
              );
              addButton.current?.focus();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <div className="visit-fields">
            <label>
              Nombre de la visita *
              <input
                ref={nameField}
                autoFocus
                required
                minLength={2}
                maxLength={100}
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Fecha de visita *
              <input
                type="date"
                required
                min={today()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              Placa del vehículo (opcional)
              <input
                maxLength={20}
                autoCapitalize="characters"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
              />
            </label>
            <label>
              Notas (opcional)
              <textarea
                rows={2}
                maxLength={240}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Por ejemplo, visita familiar o servicio técnico"
              />
            </label>
          </div>
          <p className="visit-meta">
            La autorización corresponde a la fecha indicada. Esta demo no envía
            avisos a la caseta.
          </p>
          <div className="visit-actions">
            <button type="button" onClick={cancelAdd}>
              Cancelar
            </button>
            <button className="visit-primary">Aprobar visita</button>
          </div>
        </form>
      )}
      {error && (
        <p className="visit-error" role="alert">
          {error}
        </p>
      )}
      <p className="visit-count" role="status">
        {active.length}{" "}
        {active.length === 1 ? "visita aprobada" : "visitas aprobadas"} para hoy
        o próximas fechas
      </p>
      {active.length ? (
        <ul className="visit-list">{active.map((v) => card(v))}</ul>
      ) : (
        <div className="visit-empty">
          <ShieldCheck size={28} aria-hidden="true" />
          <p>No hay visitas aprobadas para próximas fechas.</p>
          <span>
            Al autorizar una visita, aparecerá aquí con su fecha y placa, si la
            indica.
          </span>
        </div>
      )}
      {history.length > 0 && (
        <details className="visit-history">
          <summary>Historial de visitas ({history.length})</summary>
          <ul className="visit-list">{history.map((v) => card(v, true))}</ul>
        </details>
      )}
    </section>
  );
}
