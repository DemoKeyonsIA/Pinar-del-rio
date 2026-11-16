import { useState } from "react";
import type { Employee } from "../../types";
import {
  WEEK,
  weekFromSchedule,
  dayDuration,
  type WeekHours,
} from "../../domain/personnel";
import type { Command, DemoState } from "../../domain/demo";
import { Dialog } from "../common/Dialog";

export function ScheduleEditor({
  employee,
  run,
  onClose,
}: {
  employee: Employee;
  run: (c: Command) => DemoState;
  onClose: () => void;
}) {
  const [week, setWeek] = useState<WeekHours>(() =>
    weekFromSchedule(employee.schedule),
  );
  const [name, setName] = useState(employee.schedule.shiftName);
  const [notes, setNotes] = useState(employee.schedule.notes || "");
  const [error, setError] = useState("");
  const total = WEEK.reduce((n, [key]) => {
    try {
      return n + dayDuration(week[key]);
    } catch {
      return n;
    }
  }, 0);
  return (
    <Dialog title={`Horario · ${employee.name}`} onClose={onClose} wide>
      <form
        className="demo-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            run({
              kind: "schedule",
              employeeId: employee.id,
              name,
              week,
              notes,
            });
            onClose();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <label>
          Nombre del horario *
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <p className="form-hint">
          Configure cada día. Si la hora final es anterior a la inicial, el
          turno termina al día siguiente. Las horas son de presencia; no se
          deducen pausas automáticamente.
        </p>
        <div className="weekly-schedule">
          {WEEK.map(([key, label]) => (
            <div className="schedule-day" key={key}>
              <strong>{label}</strong>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  aria-label={`${label} libre`}
                  checked={week[key].off}
                  onChange={(e) =>
                    setWeek({
                      ...week,
                      [key]: { ...week[key], off: e.target.checked },
                    })
                  }
                />
                Libre
              </label>
              <label>
                Entrada
                <input
                  type="time"
                  aria-label={`Entrada ${label}`}
                  required={!week[key].off}
                  disabled={week[key].off}
                  value={week[key].start}
                  onChange={(e) =>
                    setWeek({
                      ...week,
                      [key]: { ...week[key], start: e.target.value },
                    })
                  }
                />
              </label>
              <label>
                Salida
                <input
                  type="time"
                  aria-label={`Salida ${label}`}
                  required={!week[key].off}
                  disabled={week[key].off}
                  value={week[key].end}
                  onChange={(e) =>
                    setWeek({
                      ...week,
                      [key]: { ...week[key], end: e.target.value },
                    })
                  }
                />
              </label>
            </div>
          ))}
        </div>
        <div className="schedule-total" role="status">
          Total semanal <strong>{Number(total.toFixed(2))} horas</strong>
        </div>
        <label>
          Notas
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary">Guardar horario</button>
        </div>
      </form>
    </Dialog>
  );
}
