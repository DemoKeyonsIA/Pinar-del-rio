import { ReceiptDocument, PayslipDocument } from "./FinancialTemplates";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Printer, FileText } from "lucide-react";
import type { Employee, PaymentRecord } from "../../types";
import type { Command, DemoState } from "../../domain/demo";
import { Dialog } from "../common/Dialog";
import "../../personnel.css";

export function PrintPreview({
  title,
  children,
  onClose,
  run,
  entityId,
  module,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  run: (c: Command) => DemoState;
  entityId: string;
  module: string;
}) {
  const [error, setError] = useState("");
  return createPortal(
    <Dialog title={title} onClose={onClose} wide>
      <div className="print-toolbar">
        <p>
          Revise el documento. En el diálogo del navegador puede imprimir o
          guardar como PDF.
        </p>
        <button
          className="button primary"
          onClick={() => {
            try {
              run({
                kind: "record",
                module,
                action: "Abrir impresión",
                entityId,
                summary: `Se abrió el diálogo de impresión de ${title}. El resultado físico no se verifica.`,
              });
              window.print();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <Printer size={17} />
          Imprimir / guardar PDF
        </button>
      </div>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      <div className="print-document">{children}</div>
    </Dialog>,
    document.body,
  );
}
export function ReceiptPrintButton({
  payment,
  run,
  className = "text-action",
}: {
  payment: PaymentRecord;
  run: (c: Command) => DemoState;
  className?: string;
}) {
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          try {
            run({
              kind: "record",
              module: "Tesorería",
              action: "Consultar recibo imprimible",
              entityId: payment.id,
              summary: `Vista previa de ${payment.receiptNumber || payment.reference}`,
            });
            setOpen(true);
            setError("");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <FileText size={15} />
        Ver recibo
      </button>
      {error && <span role="alert">{error}</span>}
      {open && (
        <PrintPreview
          title="Recibo imprimible"
          module="Tesorería"
          entityId={payment.id}
          run={run}
          onClose={() => setOpen(false)}
        >
          <ReceiptDocument payment={payment} />
        </PrintPreview>
      )}
    </>
  );
}
export function PayrollPrintButton({
  period,
  employees,
  run,
}: {
  period: string;
  employees: Employee[];
  run: (c: Command) => DemoState;
}) {
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const slips = employees.flatMap((employee) =>
    employee.payslips
      .filter((p) => p.period === period)
      .map((slip) => ({ employee, slip })),
  );
  return (
    <>
      <button
        type="button"
        className="text-action"
        disabled={!slips.length}
        title={
          !slips.length
            ? "Este período histórico no tiene boletas asociadas"
            : undefined
        }
        onClick={() => {
          try {
            run({
              kind: "record",
              module: "Personal",
              action: "Consultar boletas imprimibles",
              entityId: period,
              summary: `${slips.length} boletas · ${period}`,
            });
            setOpen(true);
            setError("");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <FileText size={15} />
        Ver boletas
      </button>
      {error && <span role="alert">{error}</span>}
      {open && (
        <PrintPreview
          title={`Boletas · ${period}`}
          module="Personal"
          entityId={period}
          run={run}
          onClose={() => setOpen(false)}
        >
          {slips.map(({ employee, slip }) => (
            <PayslipDocument key={slip.id} employee={employee} slip={slip} />
          ))}
        </PrintPreview>
      )}
    </>
  );
}
