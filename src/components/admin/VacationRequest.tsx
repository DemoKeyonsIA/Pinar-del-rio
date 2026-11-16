import { useState } from "react";
import { vacationDays, vacationBalance } from "../../domain/personnel";
import { today, type Command, type DemoState } from "../../domain/demo";
import { Dialog } from "../common/Dialog";

export function VacationRequest({
  state,
  run,
  onClose,
  initialEmployeeId = "",
  initialDate = today(),
  onSaved,
}: {
  state: DemoState;
  run: (c: Command) => DemoState;
  onClose: () => void;
  initialEmployeeId?: string;
  initialDate?: string;
  onSaved: () => void;
}) {
  const [id, setId] = useState(initialEmployeeId),
    [start, setStart] = useState(initialDate),
    [end, setEnd] = useState(initialDate),
    [notes, setNotes] = useState(""),
    [error, setError] = useState("");
  const employee = state.employees.find((e) => e.id === id);
  let estimate = "Seleccione una persona para contar los días.";
  if (employee) {
    try {
      estimate = `${vacationDays(employee, start, end)} días laborables · ${vacationBalance(employee).available} disponibles`;
    } catch (e) {
      estimate = (e as Error).message;
    }
  }
  return (
    <Dialog title="Registrar solicitud de vacaciones" onClose={onClose}>
      <form
        className="demo-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            run({
              kind: "vacation",
              employeeId: id,
              startDate: start,
              endDate: end,
              notes,
            });
            onSaved();
            onClose();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <label>
          Persona *
          <select required value={id} onChange={(e) => setId(e.target.value)}>
            <option value="">Seleccione una persona</option>
            {state.employees
              .filter((e) => e.status !== "inactivo")
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
          </select>
        </label>
        <div className="form-grid">
          <label>
            Desde *
            <input
              required
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            Hasta *
            <input
              required
              type="date"
              min={start}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>
        <p className="schedule-total" role="status">
          {estimate}
        </p>
        <p className="form-hint">
          El saldo se reserva únicamente después de aprobar la solicitud.
        </p>
        <details className="vac-request-explanation">
          <summary>Cómo se cuentan los días</summary>
          <p className="form-hint">
            El conteo usa el horario actual, sin descontar feriados
            automáticamente. El saldo se configura en la ficha del empleado;
            esta demo no calcula derechos laborales.
          </p>
        </details>
        <label>
          Notas
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary">Guardar solicitud pendiente</button>
      </form>
    </Dialog>
  );
}
