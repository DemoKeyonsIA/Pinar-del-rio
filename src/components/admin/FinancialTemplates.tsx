import type { Employee, EmployeePayslip, PaymentRecord } from "../../types";
import { money } from "../../domain/demo";

function DocumentHeader({ type, id }: { type: string; id: string }) {
  return (
    <header className="document-header">
      <div>
        <strong>PINAR DEL RÍO</strong>
        <span>Administración residencial</span>
      </div>
      <div>
        <span>{type}</span>
        <strong>{id}</strong>
      </div>
    </header>
  );
}
export function ReceiptDocument({ payment: p }: { payment: PaymentRecord }) {
  const status = {
    applied: "Aplicado",
    rejected: "Rechazado",
    pending_validation: "Por validar",
    reported: "Reportado",
    validated: "Validado",
  };
  const methods = {
    cash: "Efectivo",
    sinpe: "SINPE Móvil",
    transfer: "Transferencia",
    card: "Tarjeta",
  };
  return (
    <article className="financial-document">
      <DocumentHeader
        type={
          p.status === "applied" ? "Recibo de caja" : "Reporte de movimiento"
        }
        id={p.receiptNumber || p.id}
      />
      <div className="document-demo">
        DEMOSTRACIÓN · SIN VALIDEZ FISCAL NI BANCARIA
      </div>
      <h1>
        {p.status === "applied" ? "Recibo de pago" : "Movimiento reportado"}
      </h1>
      <dl className="document-details">
        <div>
          <dt>Filial</dt>
          <dd>{p.unitNumber}</dd>
        </div>
        <div>
          <dt>Persona</dt>
          <dd>{p.payerName}</dd>
        </div>
        <div>
          <dt>Fecha del movimiento</dt>
          <dd>{p.date}</dd>
        </div>
        <div>
          <dt>Medio</dt>
          <dd>{methods[p.method]}</dd>
        </div>
        <div>
          <dt>Referencia</dt>
          <dd>{p.reference}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{status[p.status]}</dd>
        </div>
      </dl>
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th className="numeric">Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{p.concept}</td>
            <td className="numeric">{money(p.amount)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th>Total del movimiento</th>
            <th className="numeric">{money(p.amount)}</th>
          </tr>
        </tfoot>
      </table>
      {p.validatedBy && (
        <p className="document-note">
          Registrado / revisado por {p.validatedBy}
          {p.validatedAt ? ` · ${p.validatedAt}` : ""}.
        </p>
      )}
      {p.rejectionReason && (
        <p className="document-note">Motivo: {p.rejectionReason}</p>
      )}
      <footer>
        Documento generado con los datos de la demo. No acredita una
        transferencia real ni sustituye un comprobante fiscal.
      </footer>
    </article>
  );
}
export function PayslipDocument({
  employee: e,
  slip: p,
}: {
  employee: Employee;
  slip: EmployeePayslip;
}) {
  const subtotal = p.subtotal ?? p.grossSalary + (p.overtimeAmount || 0);
  const worked = subtotal - (p.unworkedDaysDeduction || 0);
  return (
    <article className="financial-document">
      <DocumentHeader type="Boleta de salario" id={p.id} />
      <div className="document-demo">
        DEMOSTRACIÓN · NO ACREDITA PAGO EFECTIVO
      </div>
      <h1>Detalle de remuneración</h1>
      <dl className="document-details">
        <div>
          <dt>Persona</dt>
          <dd>{p.employeeName || e.name}</dd>
        </div>
        <div>
          <dt>Identificación</dt>
          <dd>{p.employeeIdentification || e.idNumber}</dd>
        </div>
        <div>
          <dt>Puesto</dt>
          <dd>{p.employeeRoleTitle || e.roleTitle}</dd>
        </div>
        <div>
          <dt>Período</dt>
          <dd>{p.period}</dd>
        </div>
        <div>
          <dt>Fecha de cálculo / registro</dt>
          <dd>{p.paymentDate}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>
            {p.status === "pagado"
              ? "Pagado en el escenario histórico"
              : "Pendiente de pago"}
          </dd>
        </div>
      </dl>
      <table>
        <thead>
          <tr>
            <th>Detalle del cálculo</th>
            <th className="numeric">Monto</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Salario base", p.grossSalary],
            ["Extras", p.overtimeAmount || 0],
            [
              "Rebajo por días no laborados",
              p.unworkedDaysDeduction ? -p.unworkedDaysDeduction : 0,
            ],
            ["Base calculada", worked],
            ["Deducción obrera", -p.workerCCSSDeduction],
            ["Otras deducciones", p.otherDeductions ? -p.otherDeductions : 0],
          ].map(([label, amount]) => (
            <tr key={String(label)}>
              <td>{label}</td>
              <td className="numeric">{money(Number(amount))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>Neto calculado</th>
            <th className="numeric">{money(p.netSalary)}</th>
          </tr>
        </tfoot>
      </table>
      <p className="document-note">
        Carga patronal del escenario: {money(p.employerCCSSContribution)}. No se
        descuenta del neto de la persona.
      </p>
      {p.observations && (
        <p className="document-note">Observaciones: {p.observations}</p>
      )}
      <footer>
        Parámetros de demostración. Generar o aprobar esta boleta no ejecuta
        pagos ni envíos a terceros.
      </footer>
    </article>
  );
}
