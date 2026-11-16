import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  X,
} from "lucide-react";
import { dateValue } from "../../domain/personnel";
import { today } from "../../domain/demo";
import {
  adjacentMonth,
  calendarDates,
  dateRange,
  initials,
  itemsOnDate,
  monthItems,
  shortDate,
  type VacationItem,
} from "../../domain/vacationView";
import { VacationStatus } from "./VacationShared";

interface Props {
  rows: VacationItem[];
  month: string;
  selectedDate: string;
  onMonth: (month: string) => void;
  onDate: (date: string) => void;
  onOpen: (item: VacationItem) => void;
  onRequest: () => void;
}
export function VacationCalendar({
  rows,
  month,
  selectedDate,
  onMonth,
  onDate,
  onOpen,
  onRequest,
}: Props) {
  const [focusDate, setFocusDate] = useState(selectedDate || `${month}-01`),
    [chooseMonth, setChooseMonth] = useState(false);
  const refs = useRef(new Map<string, HTMLButtonElement>()),
    pendingFocus = useRef(false);
  const activeFocus = focusDate.startsWith(month) ? focusDate : `${month}-01`;
  useEffect(() => {
    if (pendingFocus.current) {
      refs.current.get(focusDate)?.focus();
      pendingFocus.current = false;
    }
  }, [month, focusDate]);
  const dates = calendarDates(month),
    entries = selectedDate
      ? itemsOnDate(rows, selectedDate)
      : monthItems(rows, month);
  const heading = new Intl.DateTimeFormat("es-CR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateValue(`${month}-01`));
  const select = (date: string, focus = true) => {
    pendingFocus.current = focus;
    setFocusDate(date);
    if (!date.startsWith(month)) onMonth(date.slice(0, 7));
    onDate(date);
  };
  const move = (key: string, date: string) => {
    const d = dateValue(date);
    const deltas: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -(d.getUTCDay() + 6) % 7,
      End: 6 - ((d.getUTCDay() + 6) % 7),
    };
    if (key in deltas) d.setUTCDate(d.getUTCDate() + deltas[key]);
    else if (key === "PageUp" || key === "PageDown") {
      const day = d.getUTCDate();
      d.setUTCDate(1);
      d.setUTCMonth(d.getUTCMonth() + (key === "PageUp" ? -1 : 1));
      d.setUTCDate(
        Math.min(
          day,
          new Date(
            Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
          ).getUTCDate(),
        ),
      );
    } else return false;
    const result = d.toISOString().slice(0, 10);
    if (result < "2000-01-01" || result > "2100-12-31") return true;
    select(result);
    return true;
  };
  return (
    <div className="vac-calendar-layout">
      <section
        className="vac-calendar-surface"
        aria-label="Calendario del equipo"
      >
        <div className="vac-calendar-header">
          <div>
            <button
              className="vac-month-title"
              onClick={() => setChooseMonth(!chooseMonth)}
              aria-expanded={chooseMonth}
            >
              {heading}
              <ChevronDown size={15} />
            </button>
            {chooseMonth && (
              <label className="vac-month-picker">
                Elegir mes
                <input
                  autoFocus
                  type="month"
                  min="2000-01"
                  max="2100-12"
                  value={month}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (
                      /^\d{4}-\d{2}$/.test(value) &&
                      value >= "2000-01" &&
                      value <= "2100-12"
                    ) {
                      onMonth(value);
                      setChooseMonth(false);
                    }
                  }}
                />
              </label>
            )}
          </div>
          <div className="vac-month-controls">
            <button
              aria-label="Mes anterior"
              disabled={month <= "2000-01"}
              onClick={() => onMonth(adjacentMonth(month, -1))}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="vac-today-button"
              onClick={() => {
                onMonth(today().slice(0, 7));
                onDate(today());
                setFocusDate(today());
              }}
            >
              Hoy
            </button>
            <button
              aria-label="Mes siguiente"
              disabled={month >= "2100-12"}
              onClick={() => onMonth(adjacentMonth(month, 1))}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <table
          className="vac-calendar-grid"
          role="grid"
          aria-label={`Calendario de vacaciones · ${heading}`}
        >
          <thead>
            <tr>
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                <th key={d} scope="col">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, week) => (
              <tr key={week}>
                {dates.slice(week * 7, week * 7 + 7).map((date) => {
                  const dayEntries = itemsOnDate(rows, date);
                  const outside = !date.startsWith(month);
                  return (
                    <td
                      key={date}
                      role="gridcell"
                      aria-selected={date === selectedDate}
                    >
                      <button
                        ref={(node) => {
                          if (node) refs.current.set(date, node);
                          else refs.current.delete(date);
                        }}
                        tabIndex={date === activeFocus ? 0 : -1}
                        className={`vac-day ${outside ? "outside" : ""} ${selectedDate === date ? "selected" : ""}`}
                        aria-label={`${new Intl.DateTimeFormat("es-CR", { dateStyle: "full", timeZone: "UTC" }).format(dateValue(date))} · ${dayEntries.length} ${dayEntries.length === 1 ? "persona" : "personas"} con vacaciones`}
                        aria-current={date === today() ? "date" : undefined}
                        onClick={() => select(date)}
                        onKeyDown={(e) => {
                          if (move(e.key, date)) e.preventDefault();
                        }}
                      >
                        <time
                          dateTime={date}
                          className={date === today() ? "today" : ""}
                        >
                          {Number(date.slice(-2))}
                        </time>
                        <span className="vac-day-entries">
                          {dayEntries.slice(0, 2).map((v) => (
                            <span
                              key={v.id}
                              className={`vac-day-entry ${v.status === "pendiente" ? "pending" : ""}`}
                            >
                              <span />
                              {v.employeeName.split(" ")[0]}{" "}
                              {v.employeeName.split(" ")[1]?.[0]}.
                            </span>
                          ))}
                          {dayEntries.length > 2 && (
                            <span className="vac-day-more">
                              +{dayEntries.length - 2} más
                            </span>
                          )}
                        </span>
                        {!!dayEntries.length && (
                          <span className="vac-mobile-day-count">
                            {dayEntries.length}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="vac-calendar-legend">
          <span>
            <i />
            Aprobadas / disfrutadas
          </span>
          <span>
            <i className="pending" />
            Por aprobar
          </span>
          <span className="vac-keyboard-hint">
            Use las flechas para recorrer los días
          </span>
        </div>
      </section>
      <aside className="vac-agenda" aria-live="polite">
        <header>
          <span className="eyebrow">DISPONIBILIDAD DEL EQUIPO</span>
          <div>
            <h3>{selectedDate ? shortDate(selectedDate) : "En este mes"}</h3>
            {selectedDate && (
              <button
                aria-label="Ver todo el mes"
                title="Ver todo el mes"
                onClick={() => onDate("")}
              >
                <X size={17} />
              </button>
            )}
          </div>
          <p>
            {entries.length}{" "}
            {entries.length === 1 ? "solicitud" : "solicitudes"}{" "}
            {selectedDate ? "en esta fecha" : "en el calendario"}
          </p>
        </header>
        {!entries.length ? (
          <div className="vac-empty">
            <CalendarDays size={28} />
            <h3>
              {selectedDate
                ? "Sin ausencias este día"
                : "Un mes sin ausencias previstas"}
            </h3>
            <p>
              {selectedDate
                ? "El equipo no tiene vacaciones registradas en esta fecha."
                : "Las solicitudes pendientes y aprobadas aparecerán aquí."}
            </p>
            {selectedDate ? (
              <button className="text-action" onClick={() => onDate("")}>
                Ver todo el mes
              </button>
            ) : (
              <button className="text-action" onClick={onRequest}>
                Registrar una solicitud
                <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="vac-agenda-list">
            {entries.map((v) => (
              <button
                key={v.id}
                className="vac-agenda-item"
                onClick={() => onOpen(v)}
              >
                <span className="vac-person-avatar">
                  {initials(v.employeeName)}
                </span>
                <span>
                  <strong>{v.employeeName}</strong>
                  <small>{dateRange(v)}</small>
                  <VacationStatus status={v.status} />
                </span>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
        )}
        {selectedDate && (
          <button className="vac-clear-date" onClick={() => onDate("")}>
            Volver al resumen del mes
          </button>
        )}
      </aside>
    </div>
  );
}
