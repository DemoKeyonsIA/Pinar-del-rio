export type BenefitKind = "aguinaldo" | "liquidacion";
export interface BenefitInput {
  type: BenefitKind;
  employeeId: string;
  startDate: string;
  endDate: string;
  salaries: number[];
  reason: "renuncia" | "sin_responsabilidad" | "con_responsabilidad";
  averageMonthly: number;
  vacationDaily: number;
  vacationDays: number;
  noticeDays: number;
  severanceDays: number;
  notes: string;
}
export interface BenefitResult {
  salaryTotal: number;
  aguinaldo: number;
  vacations: number;
  notice: number;
  severance: number;
  total: number;
}
export interface BenefitRecord {
  id: string;
  input: BenefitInput;
  result: BenefitResult;
  employeeName: string;
  employeeIdentification: string;
  employeeRole: string;
  createdAt: string;
  createdBy: string;
  status: "calculado" | "confirmado" | "anulado";
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionReason?: string;
}
const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function benefitMonths(endDate: string) {
  if (!validDate(endDate)) throw new Error("Indique una fecha final válida.");
  const end = new Date(endDate + "T12:00:00Z");
  const year = end.getUTCFullYear() - (end.getUTCMonth() === 11 ? 0 : 1);
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(Date.UTC(year, 11 + i, 1));
    return date.toISOString().slice(0, 7);
  });
}
export function calculateBenefit(input: BenefitInput): BenefitResult {
  if (
    !["aguinaldo", "liquidacion"].includes(input.type) ||
    !["renuncia", "sin_responsabilidad", "con_responsabilidad"].includes(
      input.reason,
    )
  )
    throw new Error("Tipo o motivo de cálculo inválido.");
  if (
    !validDate(input.startDate) ||
    !validDate(input.endDate) ||
    input.startDate > input.endDate
  )
    throw new Error("Revise las fechas del cálculo.");
  const months = benefitMonths(input.endDate);
  const cycleStart = months[0] + "-01";
  if (
    input.type === "aguinaldo" &&
    (input.startDate < cycleStart || !input.endDate.endsWith("-11-30"))
  )
    throw new Error(
      "El aguinaldo anual debe cerrar el 30 de noviembre y comenzar dentro de su ciclo.",
    );
  if (
    input.salaries.length !== 12 ||
    input.salaries.some((n) => !Number.isFinite(n) || n < 0 || n > 1e10)
  )
    throw new Error(
      "Complete los doce salarios brutos; use cero en meses sin ingreso.",
    );
  input.salaries.forEach((n, i) => {
    if (
      n > 0 &&
      (months[i] < input.startDate.slice(0, 7) ||
        months[i] > input.endDate.slice(0, 7))
    )
      throw new Error("Hay salarios fuera del período trabajado.");
  });
  const fields = [
    input.averageMonthly,
    input.vacationDaily,
    input.vacationDays,
    input.noticeDays,
    input.severanceDays,
  ];
  if (
    fields.some((n) => !Number.isFinite(n) || n < 0 || n > 1e10) ||
    input.noticeDays > 30 ||
    input.severanceDays > 176 ||
    input.vacationDays > 1000
  )
    throw new Error("Revise las bases salariales y los días de indemnización.");
  if (!input.notes.trim())
    throw new Error(
      "Documente el origen de los salarios y parámetros revisados.",
    );
  const salaryTotal = round(input.salaries.reduce((a, b) => a + b, 0));
  const aguinaldo = round(salaryTotal / 12);
  const settlement = input.type === "liquidacion";
  const employer = settlement && input.reason === "con_responsabilidad";
  if (
    (!employer && (input.noticeDays || input.severanceDays)) ||
    (!settlement && fields.some(Boolean))
  )
    throw new Error(
      "Estos rubros no corresponden al tipo o motivo seleccionado.",
    );
  if (
    employer &&
    (input.noticeDays || input.severanceDays) &&
    !input.averageMonthly
  )
    throw new Error(
      "Indique el salario promedio de los últimos seis meses o fracción menor.",
    );
  if (settlement && input.vacationDays && !input.vacationDaily)
    throw new Error("Indique la base diaria revisada para las vacaciones.");
  const vacations = settlement
    ? round(input.vacationDays * input.vacationDaily)
    : 0;
  const notice = employer
    ? round((input.averageMonthly / 30) * input.noticeDays)
    : 0;
  const severance = employer
    ? round((input.averageMonthly / 30) * input.severanceDays)
    : 0;
  return {
    salaryTotal,
    aguinaldo,
    vacations,
    notice,
    severance,
    total: round(aguinaldo + vacations + notice + severance),
  };
}
