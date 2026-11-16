import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { initialState } from "../src/domain/demo";
import {
  ReceiptDocument,
  PayslipDocument,
} from "../src/components/admin/FinancialTemplates";

test("un movimiento pendiente se identifica como reporte y escapa el contenido del usuario", () => {
  const state = initialState();
  const payment = {
    ...state.payments[0],
    status: "pending_validation" as const,
    payerName: "<script>prueba</script>",
  };
  const markup = renderToStaticMarkup(
    createElement(ReceiptDocument, { payment }),
  );
  assert.match(markup, /Reporte de movimiento/);
  assert.match(markup, /Por validar/);
  assert.match(markup, /SIN VALIDEZ FISCAL NI BANCARIA/);
  assert.ok(!markup.includes("<script>"));
  assert.match(markup, /&lt;script&gt;/);
});
test("la boleta usa la identidad guardada y no muestra importes de cero negativos", () => {
  const state = initialState();
  const employee = state.employees[0];
  const slip = {
    ...employee.payslips[0],
    employeeName: "Persona original del cálculo",
    employeeIdentification: "DEMO-123",
    employeeRoleTitle: "Puesto original",
    unworkedDaysDeduction: 0,
    otherDeductions: 0,
  };
  const markup = renderToStaticMarkup(
    createElement(PayslipDocument, {
      employee: { ...employee, name: "Nombre posterior" },
      slip,
    }),
  );
  assert.match(markup, /Persona original del cálculo/);
  assert.match(markup, /DEMO-123/);
  assert.ok(!markup.includes("Nombre posterior"));
  assert.ok(!markup.includes("-₡0"));
  assert.match(markup, /NO ACREDITA PAGO EFECTIVO/);
});
