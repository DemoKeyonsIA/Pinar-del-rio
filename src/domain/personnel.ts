import type { Employee, EmployeeSchedule } from "../types";

export const WEEK = [
  ["monday", "Lunes"],
  ["tuesday", "Martes"],
  ["wednesday", "Miércoles"],
  ["thursday", "Jueves"],
  ["friday", "Viernes"],
  ["saturday", "Sábado"],
  ["sunday", "Domingo"],
] as const;
export type Weekday = (typeof WEEK)[number][0];
export interface DayHours {
  off: boolean;
  start: string;
  end: string;
}
export type WeekHours = Record<Weekday, DayHours>;

export function dateValue(date: string): Date {
  const value = new Date(`${date}T12:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(value.getTime()) ||
    value.toISOString().slice(0, 10) !== date
  )
    throw new Error("La fecha no es válida.");
  return value;
}
function minutes(time: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    throw new Error("Indique horas válidas en formato HH:MM.");
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
export function dayDuration(day: DayHours) {
  if (day.off) return 0;
  const start = minutes(day.start),
    end = minutes(day.end);
  if (start === end)
    throw new Error("La hora de inicio y fin no puede ser la misma.");
  return ((end - start + 1440) % 1440) / 60;
}
export function weekFromSchedule(schedule: EmployeeSchedule): WeekHours {
  return Object.fromEntries(
    WEEK.map(([key]) => {
      const match = schedule[key]?.match(
        /(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})/,
      );
      return [
        key,
        {
          off: !match,
          start: match?.[1] || "07:00",
          end: match?.[2] || "15:00",
        },
      ];
    }),
  ) as WeekHours;
}
export function createSchedule(
  name: string,
  week: WeekHours,
  notes = "",
): EmployeeSchedule {
  if (!name.trim()) throw new Error("Indique un nombre para el horario.");
  const hoursWeekly =
    Math.round(WEEK.reduce((n, [key]) => n + dayDuration(week[key]), 0) * 100) /
    100;
  if (!hoursWeekly) throw new Error("Asigne al menos un día de trabajo.");
  const ranges = WEEK.flatMap(([key], i) =>
    week[key].off
      ? []
      : [
          {
            start: i * 1440 + minutes(week[key].start),
            end:
              i * 1440 + minutes(week[key].start) + dayDuration(week[key]) * 60,
          },
        ],
  );
  for (let i = 0; i < ranges.length; i++) {
    const following = ranges[(i + 1) % ranges.length],
      offset = i === ranges.length - 1 ? 7 * 1440 : 0;
    if (ranges[i].end > following.start + offset)
      throw new Error(
        "Dos jornadas se superponen, incluyendo el cambio de día o de semana.",
      );
  }
  const daysOff = WEEK.filter(([key]) => week[key].off).map(
    ([, label]) => label,
  );
  return {
    shiftName: name.trim(),
    hoursWeekly,
    daysOff,
    notes,
    ...Object.fromEntries(
      WEEK.map(([key]) => [
        key,
        week[key].off ? "Libre" : `${week[key].start} - ${week[key].end}`,
      ]),
    ),
  } as EmployeeSchedule;
}
export function vacationDates(
  employee: Employee,
  startDate: string,
  endDate: string,
): string[] {
  const start = dateValue(startDate),
    end = dateValue(endDate);
  if (end < start)
    throw new Error("La fecha final debe ser igual o posterior a la inicial.");
  if ((end.getTime() - start.getTime()) / 86400000 > 366)
    throw new Error("Seleccione un intervalo de hasta un año.");
  const days: string[] = [];
  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = WEEK[(d.getUTCDay() + 6) % 7][0];
    if (/\d{2}:\d{2}/.test(employee.schedule[key] || ""))
      days.push(d.toISOString().slice(0, 10));
  }
  if (!days.length)
    throw new Error(
      "El intervalo no incluye días de trabajo del horario actual.",
    );
  return days;
}
export const vacationDays = (
  employee: Employee,
  startDate: string,
  endDate: string,
) => vacationDates(employee, startDate, endDate).length;
export function vacationBalance(employee: Employee) {
  const total = employee.vacationDaysTotal || 0,
    taken = employee.vacationDaysTaken || 0;
  const reserved = (employee.vacationHistory || [])
    .filter((v) => v.status === "aprobado")
    .reduce((n, v) => n + v.daysTaken, 0);
  return {
    total,
    taken,
    reserved,
    available: Math.max(0, total - taken - reserved),
  };
}
