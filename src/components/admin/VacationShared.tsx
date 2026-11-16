import type { EmployeeVacationRecord } from "../../types";
import { vacationLabels } from "../../domain/vacationView";

export function VacationStatus({
  status,
}: {
  status: EmployeeVacationRecord["status"];
}) {
  return (
    <span
      className={`badge ${status === "pendiente" ? "review" : ["rechazado", "cancelado"].includes(status) ? "negative" : "success"}`}
    >
      {vacationLabels[status]}
    </span>
  );
}
