import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Clock,
  Printer,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  Share2,
  Receipt,
  Sparkles,
  Award,
  Gift,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { Employee, EmployeePayslip } from "../../types";

interface PinarPayrollManagerProps {
  employees: Employee[];
  onOpenBoleta?: (employee: Employee, payslip: EmployeePayslip) => void;
  onOpenLiquidation?: (employee: Employee) => void;
}

// 10 Colaboradores reales extraídos exactamente del Excel de la Administradora
export interface PinarEmployeePayrollRow {
  id: string;
  number: number;
  name: string;
  idNumber: string;
  role: string;
  iban: string;
  bank: "BCO POPULAR" | "EFECTIVO";
  baseSalaryMonthly: number;
  baseSalaryQuincenal: number;
  extrasFeriadosQ1: number;
  subtotal1Q1: number;
  diasNoLaboradosQ1: number;
  subtotal2Q1: number;
  ccssRate: number; // 10.83%
  ccssAmountQ1: number;
  deduccionesPrestamosQ1: number;
  netSalaryQ1: number;
  observationsQ1: string;
  // Q2 values
  extrasFeriadosQ2: number;
  ccssAmountQ2: number;
  netSalaryQ2: number;
  observationsQ2: string;
}

export const PINAR_INITIAL_PAYROLL: PinarEmployeePayrollRow[] = [
  {
    id: "pinar-emp-1",
    number: 1,
    name: "HERVIN JOSE VEGA HURTADO",
    idNumber: "1-1456-0789",
    role: "Oficial de Seguridad",
    iban: "CR22016100003322114455",
    bank: "BCO POPULAR",
    baseSalaryMonthly: 405710.71,
    baseSalaryQuincenal: 202855.36,
    extrasFeriadosQ1: 32843.24,
    subtotal1Q1: 235698.6,
    diasNoLaboradosQ1: 0.0,
    subtotal2Q1: 235698.6,
    ccssRate: 10.83,
    ccssAmountQ1: 25526.16,
    deduccionesPrestamosQ1: 0.0,
    netSalaryQ1: 210172.44,
    observationsQ1: "se pagan extras",
    extrasFeriadosQ2: 0.0,
    ccssAmountQ2: 21969.23,
    netSalaryQ2: 180886.12,
    observationsQ2: "se pagan extras",
  },
  {
    id: "pinar-emp-2",
    number: 2,
    name: "SERGIO TRAÑA CRUZ",
    idNumber: "5-0321-0899",
    role: "Oficial de Seguridad",
    iban: "CR33016100004455667788",
    bank: "BCO POPULAR",
    baseSalaryMonthly: 405710.71,
    baseSalaryQuincenal: 202855.36,
    extrasFeriadosQ1: 0.0,
    subtotal1Q1: 202855.36,
    diasNoLaboradosQ1: 0.0,
    subtotal2Q1: 202855.36,
    ccssRate: 10.83,
    ccssAmountQ1: 21969.23,
    deduccionesPrestamosQ1: 0.0,
    netSalaryQ1: 180886.12,
    observationsQ1: "se pagan extras",
    extrasFeriadosQ2: 0.0,
    ccssAmountQ2: 21969.23,
    netSalaryQ2: 180886.12,
    observationsQ2: "se pagan extras",
  },
  {
    id: "pinar-emp-3",
    number: 3,
    name: "LUIS GABRIEL GONZALEZ",
    idNumber: "1-1678-0123",
    role: "Oficial de Seguridad",
    iban: "CR44016100005566778899",
    bank: "EFECTIVO",
    baseSalaryMonthly: 405710.71,
    baseSalaryQuincenal: 202855.36,
    extrasFeriadosQ1: 32843.24,
    subtotal1Q1: 235698.6,
    diasNoLaboradosQ1: 0.0,
    subtotal2Q1: 235698.6,
    ccssRate: 0.0, // Exento temporal en efectivo
    ccssAmountQ1: 0.0,
    deduccionesPrestamosQ1: 0.0,
    netSalaryQ1: 235698.6,
    observationsQ1: "se pagan extras",
    extrasFeriadosQ2: 0.0,
    ccssAmountQ2: 0.0,
    netSalaryQ2: 202855.36,
    observationsQ2: "depositar a Alex",
  },
  {
    id: "pinar-emp-4",
    number: 4,
    name: "HECTOR CANALES GRANADOS",
    idNumber: "1-0899-0455",
    role: "Oficial de Seguridad",
    iban: "CR55016100006677889900",
    bank: "BCO POPULAR",
    baseSalaryMonthly: 405710.71,
    baseSalaryQuincenal: 202855.36,
    extrasFeriadosQ1: 64720.47,
    subtotal1Q1: 267575.83,
    diasNoLaboradosQ1: 0.0,
    subtotal2Q1: 267575.83,
    ccssRate: 10.83,
    ccssAmountQ1: 28978.46,
    deduccionesPrestamosQ1: 0.0,
    netSalaryQ1: 238597.36,
    observationsQ1: "se pagan extras",
    extrasFeriadosQ2: 0.0,
    ccssAmountQ2: 21969.23,
    netSalaryQ2: 180886.12,
    observationsQ2: "se pagan extras",
  },
  {
    id: "pinar-emp-5",
    number: 5,
    name: "WILMER ANTONIO BRAVO GALEANO",
    idNumber: "1-1234-0567",
    role: "Oficial de Seguridad",
    iban: "CR66016100007788990011",
    bank: "BCO POPULAR",
    baseSalaryMonthly: 405710.71,
    baseSalaryQuincenal: 202855.36,
    extrasFeriadosQ1: 37673.09,
    subtotal1Q1: 240528.45,
    diasNoLaboradosQ1: 0.0,
    subtotal2Q1: 240528.45,
    ccssRate: 10.83,
    ccssAmountQ1: 26049.23,
    deduccionesPrestamosQ1: 0.0,
    netSalaryQ1: 214479.21,
    observationsQ1: "se pagan extras",
    extrasFeriadosQ2: 0.0,
    ccssAmountQ2: 21969.23,
    netSalaryQ2: 180886.12,
    observationsQ2: "se pagan extras",
  },
  {
    id: "pinar-emp-6",
    number: 6,
    name: "LESTER EDEN BETANCO CRUZ",
    idNumber: "1-1345-0678",
    role: "Oficial de Seguridad",
    iban: "CR77016100008899001122",
    bank: "BCO POPULAR",
    baseSalaryMonthly: 405710.71,
    baseSalaryQuincenal: 202855.36,
    extrasFeriadosQ1: 64720.47,
    subtotal1Q1: 267575.83,
    diasNoLaboradosQ1: 0.0,
    subtotal2Q1: 267575.83,
    ccssRate: 10.83,
    ccssAmountQ1: 28978.46,
    deduccionesPrestamosQ1: 0.0,
    netSalaryQ1: 238597.36,
    observationsQ1: "se pagan extras",
    extrasFeriadosQ2: 0.0,
    ccssAmountQ2: 21969.23,
    netSalaryQ2: 180886.12,
    observationsQ2: "se pagan extras",
  },
  {
    id: "pinar-emp-7",
    number: 7,
    name: "JOSE SAUL CONTRERAS SANDOVAL",
    idNumber: "1-1567-0890",
    role: "Oficial de Seguridad",
    iban: "CR88016100009900112233",
    bank: "BCO POPULAR",
    baseSalaryMonthly: 405710.71,
    baseSalaryQuincenal: 202855.36,
    extrasFeriadosQ1: 103359.66,
    subtotal1Q1: 306215.02,
    diasNoLaboradosQ1: 0.0,
    subtotal2Q1: 306215.02,
    ccssRate: 10.83,
    ccssAmountQ1: 33163.09,
    deduccionesPrestamosQ1: 0.0,
    netSalaryQ1: 273051.93,
    observationsQ1: "se pagan extras",
    extrasFeriadosQ2: 0.0,
    ccssAmountQ2: 21969.23,
    netSalaryQ2: 180886.12,
    observationsQ2: "se pagan extras",
  },
  {
    id: "pinar-emp-8",
    number: 8,
    name: "ALEX PALMA SANDOVAL",
    idNumber: "1-0789-0234",
    role: "Supervisor de Seguridad",
    iban: "CR99016100001122334455",
    bank: "BCO POPULAR",
    baseSalaryMonthly: 405710.71,
    baseSalaryQuincenal: 202855.36,
    extrasFeriadosQ1: 74380.35,
    subtotal1Q1: 277235.71,
    diasNoLaboradosQ1: 0.0,
    subtotal2Q1: 277235.71,
    ccssRate: 10.83,
    ccssAmountQ1: 30024.63,
    deduccionesPrestamosQ1: 0.0,
    netSalaryQ1: 247211.08,
    observationsQ1: "se pagan extras",
    extrasFeriadosQ2: 0.0,
    ccssAmountQ2: 21969.23,
    netSalaryQ2: 180886.12,
    observationsQ2: "se pagan extras",
  },
  {
    id: "pinar-emp-9",
    number: 9,
    name: "JUAN GARCIA LOPEZ",
    idNumber: "1-0678-0345",
    role: "Oficial de Seguridad",
    iban: "CR11016100002233445566",
    bank: "BCO POPULAR",
    baseSalaryMonthly: 405711.71,
    baseSalaryQuincenal: 202855.86,
    extrasFeriadosQ1: 74380.35,
    subtotal1Q1: 277236.21,
    diasNoLaboradosQ1: 0.0,
    subtotal2Q1: 277236.21,
    ccssRate: 10.83,
    ccssAmountQ1: 30024.68,
    deduccionesPrestamosQ1: 0.0,
    netSalaryQ1: 247211.52,
    observationsQ1: "se pagan extras",
    extrasFeriadosQ2: 0.0,
    ccssAmountQ2: 21969.29,
    netSalaryQ2: 180886.57,
    observationsQ2: "se pagan extras",
  },
  {
    id: "pinar-emp-10",
    number: 10,
    name: "RUTH LOPEZ ELIZONDO",
    idNumber: "1-0567-0891",
    role: "Administradora General",
    iban: "CR00016100003344556677",
    bank: "BCO POPULAR",
    baseSalaryMonthly: 480000.0,
    baseSalaryQuincenal: 240000.0,
    extrasFeriadosQ1: 0.0,
    subtotal1Q1: 240000.0,
    diasNoLaboradosQ1: 0.0,
    subtotal2Q1: 240000.0,
    ccssRate: 0.0,
    ccssAmountQ1: 0.0,
    deduccionesPrestamosQ1: 0.0,
    netSalaryQ1: 240000.0,
    observationsQ1: "",
    extrasFeriadosQ2: 0.0,
    ccssAmountQ2: 0.0,
    netSalaryQ2: 240000.0,
    observationsQ2: "",
  },
];

// Matriz Diaria del 1 al 15 de Octubre (CAL EXTRAS - Imagen 2)
// Días: 1(J), 2(V), 3(S), 4(D), 5(L), 6(K), 7(M), 8(J), 9(V), 10(S), 11(D), 12(L), 13(M), 14(M), 15(J)
export interface DailyExtrasRow {
  name: string;
  days: number[]; // 15 días
  total: number;
}

export const INITIAL_DAILY_EXTRAS: DailyExtrasRow[] = [
  {
    name: "HERVIN JOSE VEGA HURTADO",
    days: [0, 0, 16421.62, 0, 0, 0, 0, 0, 0, 16421.62, 0, 0, 0, 0, 0],
    total: 32843.24,
  },
  {
    name: "SERGIO TRAÑA CRUZ",
    days: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    total: 0.0,
  },
  {
    name: "LUIS GABRIEL GONZALEZ",
    days: [0, 0, 16421.62, 0, 0, 0, 0, 0, 0, 16421.62, 0, 0, 0, 0, 0],
    total: 32843.24,
  },
  {
    name: "HECTOR CANALES GRANADOS",
    days: [
      2897.93, 2897.93, 0, 16421.62, 2897.93, 2897.93, 2897.93, 2897.93,
      2897.93, 0, 16421.62, 2897.93, 2897.93, 2897.93, 2897.93,
    ],
    total: 64720.47,
  },
  {
    name: "WILMER ANTONIO BRAVO GALEANO",
    days: [
      2897.93, 0, 2897.93, 2897.93, 2897.93, 2897.93, 2897.93, 2897.93, 0,
      2897.93, 2897.93, 2897.93, 2897.93, 2897.93, 2897.93,
    ],
    total: 37673.09,
  },
  {
    name: "LESTER EDEN BETANCO CRUZ",
    days: [
      2897.93, 2897.93, 0, 16421.62, 2897.93, 2897.93, 2897.93, 2897.93,
      2897.93, 0, 16421.62, 2897.93, 0, 2897.93, 2897.93,
    ],
    total: 64720.47,
  },
  {
    name: "JOSE SAUL CONTRERAS SANDOVAL",
    days: [
      0, 16421.62, 6761.85, 6761.85, 6761.85, 6761.85, 0, 0, 16421.62, 6761.85,
      6761.85, 6761.85, 6761.85, 6761.85, 6761.85,
    ],
    total: 103359.66,
  },
  {
    name: "ALEX PALMA SANDOVAL",
    days: [
      6761.85, 6761.85, 6761.85, 6761.85, 0, 0, 6761.85, 6761.85, 6761.85,
      6761.85, 6761.85, 0, 6761.85, 6761.85, 6761.85,
    ],
    total: 74380.35,
  },
  {
    name: "JUAN GARCIA LOPEZ",
    days: [
      6761.85, 6761.85, 0, 0, 6761.85, 6761.85, 6761.85, 6761.85, 6761.85, 0, 0,
      6761.85, 6761.85, 6761.85, 6761.85,
    ],
    total: 74380.35,
  },
  {
    name: "RUTH LOPEZ ELIZONDO",
    days: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    total: 0.0,
  },
];

// Meses para cálculo de aguinaldo oficial (12 meses: Diciembre a Noviembre)
export const AGUINALDO_MONTHS = [
  "Diciembre 2025",
  "Enero 2026",
  "Febrero 2026",
  "Marzo 2026",
  "Abril 2026",
  "Mayo 2026",
  "Junio 2026",
  "Julio 2026",
  "Agosto 2026",
  "Setiembre 2026",
  "Octubre 2026",
  "Noviembre 2026",
];

export const PinarPayrollManager: React.FC<PinarPayrollManagerProps> = ({
  employees,
  onOpenBoleta,
  onOpenLiquidation,
}) => {
  const toEmployeeObj = (row: PinarEmployeePayrollRow): Employee => {
    const existing = employees.find((e) => e.name === row.name);
    if (existing) return existing;
    return {
      id: row.id,
      name: row.name,
      idNumber: row.idNumber,
      role: (row.name.includes("RUTH") ? "Administración" : "Seguridad") as any,
      roleTitle: row.role,
      baseSalary: row.baseSalaryMonthly,
      ccssInsuranceNumber: "1109820341",
      iban: row.iban,
      bankName:
        row.bank === "BCO POPULAR" ? "Banco Popular de Costa Rica" : "Efectivo",
      hireDate: "2023-01-15",
      email: "oficial@pinardelrio.cr",
      phone: "+506 8800-0000",
      status: "activo",
      schedule: {
        shiftName: "Rol Rotativo Pinar del Río",
        hoursWeekly: 48,
        daysOff: ["Domingo"],
        monday: "Turno según rol",
        tuesday: "Turno según rol",
        wednesday: "Turno según rol",
        thursday: "Turno según rol",
        friday: "Turno según rol",
        saturday: "Turno según rol",
        sunday: "Libre",
      },
      payslips: [],
    };
  };

  // Pestañas réplica exacta del Libro de Planilla de la Administradora
  const [payrollSheet, setPayrollSheet] = useState<
    | "q1"
    | "daily_extras"
    | "q2"
    | "monthly_summary"
    | "cal_extras"
    | "aguinaldos"
  >("q1");

  // Estado reactivo de las filas de planilla
  const [payrollRows, setPayrollRows] = useState<PinarEmployeePayrollRow[]>(
    PINAR_INITIAL_PAYROLL,
  );
  const [dailyExtras, setDailyExtras] =
    useState<DailyExtrasRow[]>(INITIAL_DAILY_EXTRAS);

  // Totales Q1
  const totalBaseMonthly = payrollRows.reduce(
    (a, r) => a + r.baseSalaryMonthly,
    0,
  );
  const totalBaseQ1 = payrollRows.reduce(
    (a, r) => a + r.baseSalaryQuincenal,
    0,
  );
  const totalExtrasQ1 = payrollRows.reduce((a, r) => a + r.extrasFeriadosQ1, 0);
  const totalSubtotal1Q1 = payrollRows.reduce((a, r) => a + r.subtotal1Q1, 0);
  const totalDiasNoLaboradosQ1 = payrollRows.reduce(
    (a, r) => a + r.diasNoLaboradosQ1,
    0,
  );
  const totalSubtotal2Q1 = payrollRows.reduce((a, r) => a + r.subtotal2Q1, 0);
  const totalCCSSQ1 = payrollRows.reduce((a, r) => a + r.ccssAmountQ1, 0);
  const totalPrestamosQ1 = payrollRows.reduce(
    (a, r) => a + r.deduccionesPrestamosQ1,
    0,
  );
  const totalNetSalaryQ1 = payrollRows.reduce((a, r) => a + r.netSalaryQ1, 0);

  // Totales de desembolso Q1 (Cajas Amarillas de la Imagen 1)
  const totalPlanillaDispersar = totalNetSalaryQ1;
  const totalDepositoPopularQ1 = payrollRows
    .filter((r) => r.bank === "BCO POPULAR")
    .reduce((a, r) => a + r.netSalaryQ1, 0);
  const totalEfectivoQ1 = payrollRows
    .filter((r) => r.bank === "EFECTIVO")
    .reduce((a, r) => a + r.netSalaryQ1, 0);

  // Totales Q2
  const totalNetSalaryQ2 = payrollRows.reduce((a, r) => a + r.netSalaryQ2, 0);
  const totalCCSSQ2 = payrollRows.reduce((a, r) => a + r.ccssAmountQ2, 0);

  // Totales Mensuales Consolidados (Imágenes 6 y 7)
  const totalBrutoMensual = payrollRows.reduce(
    (a, r) => a + (r.subtotal1Q1 + r.baseSalaryQuincenal + r.extrasFeriadosQ2),
    0,
  );
  const totalNetoMensual = totalNetSalaryQ1 + totalNetSalaryQ2;

  // Días de la quincena 1 (letras y fechas exactas de la Imagen 2)
  const daysHeader = [
    { num: 1, letter: "J" },
    { num: 2, letter: "V" },
    { num: 3, letter: "S" },
    { num: 4, letter: "D" },
    { num: 5, letter: "L" },
    { num: 6, letter: "K" },
    { num: 7, letter: "M" },
    { num: 8, letter: "J" },
    { num: 9, letter: "V" },
    { num: 10, letter: "S" },
    { num: 11, letter: "D" },
    { num: 12, letter: "L" },
    { num: 13, letter: "M" },
    { num: 14, letter: "M" },
    { num: 15, letter: "J" },
  ];

  // Cálculo de totales por día en la matriz CAL EXTRAS
  const dailyTotals = Array(15)
    .fill(0)
    .map((_, dayIndex) =>
      dailyExtras.reduce((sum, row) => sum + (row.days[dayIndex] || 0), 0),
    );

  // Exportar la vista actual a Excel exacto
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Hoja Q1
    const q1Data = payrollRows.map((r) => ({
      "#": r.number,
      EMPLEADO: r.name,
      "SALARIO BRUTO MENSUAL": r.baseSalaryMonthly,
      "SALARIO BRUTO QUINCENAL": r.baseSalaryQuincenal,
      "EXTRAS FERIADOS": r.extrasFeriadosQ1,
      "SUBTOTAL 1": r.subtotal1Q1,
      "DIAS NO LABORADOS": r.diasNoLaboradosQ1,
      "SUBTOTAL 2": r.subtotal2Q1,
      "C.C.S.S. 10.83%": r.ccssAmountQ1,
      PRESTAMOS: r.deduccionesPrestamosQ1,
      "SALARIO NETO QUINCENAL": r.netSalaryQ1,
      OBSERVACIONES: r.observationsQ1,
      "BANCO / PAGO": r.bank,
    }));
    const wsQ1 = XLSX.utils.json_to_sheet(q1Data);
    XLSX.utils.book_append_sheet(wb, wsQ1, "PRIMERA QUINCENA OCTUBRE");

    // Hoja Matriz Extras
    const extrasData = dailyExtras.map((r) => {
      const rowObj: any = { NOMBRE: r.name };
      daysHeader.forEach((d, idx) => {
        rowObj[`Día ${d.num} (${d.letter})`] = r.days[idx];
      });
      rowObj["TOTAL EXTRAS"] = r.total;
      return rowObj;
    });
    const wsExtras = XLSX.utils.json_to_sheet(extrasData);
    XLSX.utils.book_append_sheet(wb, wsExtras, "CAL EXTRAS 1-15");

    // Hoja Q2
    const q2Data = payrollRows.map((r) => ({
      "#": r.number,
      EMPLEADO: r.name,
      "SALARIO BRUTO MENSUAL": r.baseSalaryMonthly,
      "SALARIO BRUTO QUINCENAL": r.baseSalaryQuincenal,
      "EXTRAS FERIADOS": r.extrasFeriadosQ2,
      SUBTOTAL: r.baseSalaryQuincenal + r.extrasFeriadosQ2,
      "C.C.S.S. 10.83%": r.ccssAmountQ2,
      "SALARIO NETO": r.netSalaryQ2,
      OBSERVACIONES: r.observationsQ2,
      BANCO: r.bank,
    }));
    const wsQ2 = XLSX.utils.json_to_sheet(q2Data);
    XLSX.utils.book_append_sheet(wb, wsQ2, "SEGUNDA QUINCENA OCTUBRE");

    // Hoja Aguinaldos
    const aguinaldoData = payrollRows.map((r) => {
      // Promedio con extras
      const totalDevengado =
        (r.baseSalaryMonthly + (r.extrasFeriadosQ1 + r.extrasFeriadosQ2)) * 12;
      return {
        EMPLEADO: r.name,
        "SALARIO BASE MENSUAL": r.baseSalaryMonthly,
        "TOTAL ANUAL DEVENGADO": totalDevengado,
        "AGUINALDO (TOTAL / 12)": totalDevengado / 12,
        "PROVISIÓN MENSUAL (8.33%)": totalDevengado / 12 / 12,
        "FECHA PAGO": "Antes del 20 de Diciembre",
        BANCO: r.bank,
      };
    });
    const wsAguinaldo = XLSX.utils.json_to_sheet(aguinaldoData);
    XLSX.utils.book_append_sheet(wb, wsAguinaldo, "AGUINALDOS 2026");

    XLSX.writeFile(wb, "2026-PLANILLA-SALARIOS-MENSUALES-PINAR-DEL-RIO.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Barra de Encabezado Superior con Identidad Oficial */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-800 text-white font-mono font-black text-[11px] tracking-wider uppercase">
              ASOCIACIÓN PINAR DEL RÍO
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Cédula Jurídica: 3-002-342377 • Motor de Planilla & Nómina 2026
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            2026- PLANILLA SALARIOS MENSUALES .xlsx
          </h2>
          <p className="text-xs text-slate-500">
            Cálculo relacional quincenal, horas extras/feriados, deducciones
            C.C.S.S. (10.83%), aguinaldos y boletas de pago.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
            title="Descargar libro Excel completo con las mismas hojas y fórmulas"
          >
            <Download className="w-4 h-4 text-lime-300" />
            <span>Descargar Libro Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimir Hoja</span>
          </button>
        </div>
      </div>

      {/* Selector de Hojas del Excel (Navegación tipo pestañas del libro) */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-1 text-xs font-bold border border-slate-200">
        <button
          onClick={() => setPayrollSheet("q1")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            payrollSheet === "q1"
              ? "bg-emerald-800 text-white shadow-xs"
              : "text-slate-700 hover:bg-white/80"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-lime-400" />
          <span>I Quincena (1 al 15 Oct)</span>
        </button>

        <button
          onClick={() => setPayrollSheet("daily_extras")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            payrollSheet === "daily_extras"
              ? "bg-emerald-800 text-white shadow-xs"
              : "text-slate-700 hover:bg-white/80"
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Calendario Diario de Extras (CAL EXTRAS)</span>
        </button>

        <button
          onClick={() => setPayrollSheet("q2")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            payrollSheet === "q2"
              ? "bg-emerald-800 text-white shadow-xs"
              : "text-slate-700 hover:bg-white/80"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-sky-400" />
          <span>II Quincena (16 al 31 Oct)</span>
        </button>

        <button
          onClick={() => setPayrollSheet("monthly_summary")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            payrollSheet === "monthly_summary"
              ? "bg-emerald-800 text-white shadow-xs"
              : "text-slate-700 hover:bg-white/80"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span>Consolidado Mensual & Depósitos</span>
        </button>

        <button
          onClick={() => setPayrollSheet("cal_extras")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            payrollSheet === "cal_extras"
              ? "bg-emerald-800 text-white shadow-xs"
              : "text-slate-700 hover:bg-white/80"
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Tarifas, Turnos & Feriados</span>
        </button>

        <button
          onClick={() => setPayrollSheet("aguinaldos")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            payrollSheet === "aguinaldos"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-amber-900 hover:bg-amber-50"
          }`}
        >
          <Gift className="w-4 h-4 text-amber-300" />
          <span>🎄 Cálculo de Aguinaldos (12 Meses)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* HOJA 1: PRIMERA QUINCENA (1 AL 15 OCTUBRE 2026) - IMAGEN 1                */}
      {/* ========================================================================= */}
      {payrollSheet === "q1" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
            {/* Header del Archivo Excel */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block">
                PERIODO 1 • PRIMERA QUINCENA DEL 1 AL 15 DE OCTUBRE 2026
              </span>
              <h3 className="text-sm font-black text-slate-900">
                ASOCIACION PRO MEJORAS RESIDENCIAL PINAR DEL RIO
              </h3>
            </div>

            {/* Tabla Estructura Idéntica a Imagen 1 */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-300 text-center">
                  <tr>
                    <th className="p-2 border-r border-slate-200">#</th>
                    <th className="p-2 text-left border-r border-slate-200 min-w-[200px]">
                      EMPLEADO
                    </th>
                    <th className="p-2 border-r border-slate-200">
                      SALARIO BRUTO
                      <br />
                      MENSUAL
                    </th>
                    <th className="p-2 border-r border-slate-200">
                      SALARIO BRUTO
                      <br />
                      QUINCENAL
                    </th>
                    <th className="p-2 border-r border-slate-200 bg-amber-50 text-amber-950 font-black">
                      EXTRAS
                      <br />
                      FERIADOS (+)
                    </th>
                    <th className="p-2 border-r border-slate-200 font-bold">
                      SUBTOTAL (=)
                    </th>
                    <th className="p-2 border-r border-slate-200 text-rose-800">
                      DIAS NO
                      <br />
                      LABORADOS (-)
                    </th>
                    <th className="p-2 border-r border-slate-200 font-bold">
                      SUBTOTAL (=)
                    </th>
                    <th className="p-2 border-r border-slate-200 bg-rose-50 text-rose-900 font-black">
                      C.C.S.S.
                      <br />
                      10.83% (-)
                    </th>
                    <th className="p-2 border-r border-slate-200 text-rose-800">
                      DEDUCCIONES
                      <br />
                      PRESTAMOS (-)
                    </th>
                    <th className="p-2 border-r border-slate-200 bg-sky-100 text-sky-950 font-black">
                      SALARIO NETO
                      <br />
                      QUINCENAL (=)
                    </th>
                    <th className="p-2 border-r border-slate-200">
                      OBSERVACIONES
                    </th>
                    <th className="p-2 border-r border-slate-200">
                      Nº ck / BANCO
                    </th>
                    <th className="p-2 pr-4 text-right">BOLETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                  {payrollRows.map((row, idx) => {
                    // Colores por empleado idénticos al Excel
                    const isBlue = idx === 0 || idx === 1 || idx === 2;
                    const isPink = idx === 3 || idx === 4 || idx === 5;
                    const isGreen = idx === 6 || idx === 7 || idx === 8;
                    const isAdminPink = idx === 9;

                    const rowBgClass = isBlue
                      ? "bg-sky-50/50 hover:bg-sky-100/60"
                      : isPink
                        ? "bg-purple-50/50 hover:bg-purple-100/60"
                        : isGreen
                          ? "bg-emerald-50/50 hover:bg-emerald-100/60"
                          : "bg-rose-50/50 hover:bg-rose-100/60";

                    return (
                      <tr
                        key={row.id}
                        className={`${rowBgClass} transition-colors`}
                      >
                        <td className="p-2 text-center font-bold text-slate-600 border-r border-slate-200">
                          {row.number}
                        </td>
                        <td className="p-2 text-left font-sans font-bold text-slate-900 border-r border-slate-200">
                          {row.name}
                        </td>
                        <td className="p-2 text-right border-r border-slate-200">
                          ₡
                          {row.baseSalaryMonthly.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-2 text-right border-r border-slate-200">
                          ₡
                          {row.baseSalaryQuincenal.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-2 text-right font-black text-amber-950 bg-amber-50/80 border-r border-slate-200">
                          ₡
                          {row.extrasFeriadosQ1.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-2 text-right font-bold border-r border-slate-200">
                          ₡
                          {row.subtotal1Q1.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-2 text-right text-rose-700 border-r border-slate-200">
                          ₡
                          {row.diasNoLaboradosQ1.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-2 text-right font-bold border-r border-slate-200 bg-amber-100/60">
                          ₡
                          {row.subtotal2Q1.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-2 text-right font-bold text-rose-900 border-r border-slate-200">
                          ₡
                          {row.ccssAmountQ1.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-2 text-right text-rose-700 border-r border-slate-200">
                          ₡
                          {row.deduccionesPrestamosQ1.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-2 text-right font-black text-sky-950 bg-sky-200/80 text-xs border-r border-slate-200">
                          ₡
                          {row.netSalaryQ1.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-2 font-sans text-slate-600 text-[10px] border-r border-slate-200">
                          {row.observationsQ1}
                        </td>
                        <td className="p-2 text-center border-r border-slate-200">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.bank === "BCO POPULAR"
                                ? "bg-sky-200 text-sky-900"
                                : "bg-emerald-200 text-emerald-950"
                            }`}
                          >
                            {row.bank}
                          </span>
                        </td>
                        <td className="p-2 pr-3 text-right">
                          <button
                            onClick={() => {
                              const empObj = toEmployeeObj(row);
                              const payslipObj: EmployeePayslip = {
                                id: `COL-2026-Q1-${row.id}`,
                                employeeId: empObj.id,
                                period: "Primera Quincena Octubre 2026",
                                dateRange:
                                  "Planilla del 01 al 15 de Octubre 2026",
                                entityName:
                                  "ASOCIACIÓN PRO MEJORAS RESIDENCIAL PINAR DEL RÍO",
                                legalId: "3-002-342377",
                                paymentDate: "2026-10-15",
                                grossSalary: row.baseSalaryQuincenal,
                                overtimeHours: Math.round(
                                  row.extrasFeriadosQ1 / 2897.93,
                                ),
                                overtimeAmount: row.extrasFeriadosQ1,
                                subtotal: row.subtotal1Q1,
                                unworkedDays: 0,
                                unworkedDaysDeduction: row.diasNoLaboradosQ1,
                                workerCCSSDeduction: row.ccssAmountQ1,
                                otherDeductions: row.deduccionesPrestamosQ1,
                                netSalary: row.netSalaryQ1,
                                employerCCSSContribution: Math.round(
                                  row.subtotal1Q1 * 0.2667,
                                ),
                                status: "pagado",
                                ccssSicereBatchId: "SICERE-2026-OCT-Q1",
                                bankReference: `BCO-POP-${row.idNumber.replace(/\D/g, "")}`,
                              };
                              if (onOpenBoleta)
                                onOpenBoleta(empObj, payslipObj);
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-800 text-white font-bold hover:bg-emerald-900 cursor-pointer text-[10px]"
                            title="Generar Boleta Oficial 2026"
                          >
                            Boleta
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Fila de TOTALES Idéntica a Imagen 1 */}
                  <tr className="bg-amber-200/90 font-black text-slate-950 border-t-2 border-slate-400">
                    <td
                      colSpan={2}
                      className="p-2.5 text-left font-sans text-xs"
                    >
                      TOTALES
                    </td>
                    <td className="p-2.5 text-right">
                      ₡
                      {totalBaseMonthly.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2.5 text-right">
                      ₡
                      {totalBaseQ1.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2.5 text-right text-amber-950">
                      ₡
                      {totalExtrasQ1.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2.5 text-right">
                      ₡
                      {totalSubtotal1Q1.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2.5 text-right">
                      ₡
                      {totalDiasNoLaboradosQ1.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2.5 text-right">
                      ₡
                      {totalSubtotal2Q1.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2.5 text-right text-rose-950">
                      ₡
                      {totalCCSSQ1.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2.5 text-right">
                      ₡
                      {totalPrestamosQ1.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2.5 text-right text-sm text-sky-950">
                      ₡
                      {totalNetSalaryQ1.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      colSpan={3}
                      className="p-2.5 text-center font-sans text-[10px]"
                    >
                      10 Colaboradores
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tarjetas Amarillas de Desembolso al Pie (Imagen 1) */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-sky-100 border border-sky-300 font-mono">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900 block font-sans">
                  Planilla (Retenciones CCSS)
                </span>
                <span className="text-lg font-black text-sky-950 mt-1 block">
                  ₡944,914.66
                </span>
                <span className="text-[10px] text-sky-700 font-sans">
                  Provisión cargas sociales
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-100 border border-purple-300 font-mono">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block font-sans">
                  Depósito (Banco Popular)
                </span>
                <span className="text-lg font-black text-purple-950 mt-1 block">
                  ₡
                  {totalDepositoPopularQ1.toLocaleString("es-CR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="text-[10px] text-purple-700 font-sans">
                  9 Colaboradores con cuenta
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-100 border border-amber-300 font-mono">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block font-sans">
                  Efectivo (Sobre de Pago)
                </span>
                <span className="text-lg font-black text-amber-950 mt-1 block">
                  ₡
                  {totalEfectivoQ1.toLocaleString("es-CR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="text-[10px] text-amber-700 font-sans">
                  1 Colaborador en efectivo
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 font-mono">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block font-sans">
                  TOTAL A PAGAR (Q1)
                </span>
                <span className="text-lg font-black text-emerald-950 mt-1 block">
                  ₡
                  {totalNetSalaryQ1.toLocaleString("es-CR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="text-[10px] text-emerald-700 font-sans">
                  Salarios netos del 1 al 15
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HOJA 2: MATRIZ DIARIA DE TURNOS & EXTRAS (1 AL 15 OCT) - IMAGEN 2         */}
      {/* ========================================================================= */}
      {payrollSheet === "daily_extras" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase px-2 py-0.5 rounded bg-amber-100">
                HOJA CAL EXTRAS • DÍAS 1 AL 15
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                PRIMER QUINCENA OCTUBRE 2026 — Desglose Diario por Turno y
                Feriados
              </h3>
              <p className="text-xs text-slate-500">
                Los montos corresponden a horas extras calculadas (₡2,897.93
                mixto, ₡6,761.85 feriado ordinario, ₡16,421.62 turno feriado).
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className="w-3.5 h-3.5 rounded bg-amber-300 inline-block border border-amber-400" />
                <span>Turno / Feriado pagado</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className="w-3.5 h-3.5 rounded bg-orange-200 inline-block border border-orange-300" />
                <span>Día libre</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-300 text-center">
                <tr>
                  <th className="p-2.5 text-left border-r border-slate-200 min-w-[200px]">
                    NOMBRE
                  </th>
                  {daysHeader.map((d) => (
                    <th
                      key={d.num}
                      className="p-2 border-r border-slate-200 min-w-[55px]"
                    >
                      <span className="block text-[10px] text-slate-500">
                        {d.num}
                      </span>
                      <span className="block font-black text-slate-900">
                        {d.letter}
                      </span>
                    </th>
                  ))}
                  <th className="p-2.5 bg-amber-100 text-amber-950 font-black">
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[10px]">
                {dailyExtras.map((row, rIdx) => {
                  return (
                    <tr
                      key={rIdx}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-2 text-left font-sans font-bold text-slate-900 border-r border-slate-200">
                        {row.name}
                      </td>
                      {row.days.map((val, dIdx) => {
                        const isFeriadoOrExtra = val > 0;
                        const isLibre =
                          val === 0 &&
                          (dIdx === 2 ||
                            dIdx === 3 ||
                            dIdx === 9 ||
                            dIdx === 10);
                        const cellBg = isFeriadoOrExtra
                          ? "bg-amber-100 font-bold text-amber-950"
                          : isLibre
                            ? "bg-orange-100/70 text-orange-900"
                            : "text-slate-400";

                        return (
                          <td
                            key={dIdx}
                            className={`p-1.5 text-center border-r border-slate-200 ${cellBg}`}
                          >
                            {val > 0
                              ? `₡${Math.round(val).toLocaleString("es-CR")}`
                              : "₡0"}
                          </td>
                        );
                      })}
                      <td className="p-2 text-right font-black text-amber-950 bg-amber-200/90 font-mono text-[11px]">
                        ₡
                        {row.total.toLocaleString("es-CR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}

                {/* Fila de Totales Diarios al Pie (Idéntica a Imagen 2) */}
                <tr className="bg-amber-200 font-black text-slate-950 border-t-2 border-slate-400">
                  <td className="p-2.5 font-sans text-xs">TOTALES POR DÍA</td>
                  {dailyTotals.map((tot, idx) => (
                    <td
                      key={idx}
                      className="p-1.5 text-center text-[10px] border-r border-slate-300"
                    >
                      ₡{Math.round(tot).toLocaleString("es-CR")}
                    </td>
                  ))}
                  <td className="p-2.5 text-right text-xs bg-amber-300 text-slate-950 font-black">
                    ₡
                    {totalExtrasQ1.toLocaleString("es-CR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HOJA 3: SEGUNDA QUINCENA (16 AL 31 OCTUBRE 2026) - IMAGEN 5               */}
      {/* ========================================================================= */}
      {payrollSheet === "q2" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block">
              PERIODO 2 • SEGUNDA QUINCENA DEL 16 AL 31 DE OCTUBRE 2026
            </span>
            <h3 className="text-sm font-black text-slate-900">
              ASOCIACION PRO MEJORAS RESIDENCIAL PINAR DEL RIO
            </h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-300 text-center">
                <tr>
                  <th className="p-2 border-r border-slate-200">#</th>
                  <th className="p-2 text-left border-r border-slate-200 min-w-[200px]">
                    EMPLEADO
                  </th>
                  <th className="p-2 border-r border-slate-200">
                    SALARIO BRUTO
                    <br />
                    MENSUAL
                  </th>
                  <th className="p-2 border-r border-slate-200">
                    SALARIO BRUTO
                    <br />
                    QUINCENAL
                  </th>
                  <th className="p-2 border-r border-slate-200">
                    EXTRAS FERIADOS
                  </th>
                  <th className="p-2 border-r border-slate-200 font-bold">
                    SUBTOTAL (=)
                  </th>
                  <th className="p-2 border-r border-slate-200 text-rose-800">
                    C.C.S.S. 10.83% (-)
                  </th>
                  <th className="p-2 border-r border-slate-200 bg-sky-100 text-sky-950 font-black">
                    SALARIO NETO QUINCENAL (=)
                  </th>
                  <th className="p-2 border-r border-slate-200">
                    OBSERVACIONES
                  </th>
                  <th className="p-2 border-r border-slate-200">
                    Nº ck / BANCO
                  </th>
                  <th className="p-2 pr-4 text-right">BOLETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                {payrollRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-2 text-center font-bold text-slate-600 border-r border-slate-200">
                      {row.number}
                    </td>
                    <td className="p-2 text-left font-sans font-bold text-slate-900 border-r border-slate-200">
                      {row.name}
                    </td>
                    <td className="p-2 text-right border-r border-slate-200">
                      ₡
                      {row.baseSalaryMonthly.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-right border-r border-slate-200">
                      ₡
                      {row.baseSalaryQuincenal.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-right text-slate-400 border-r border-slate-200">
                      ₡
                      {row.extrasFeriadosQ2.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-right font-bold border-r border-slate-200">
                      ₡
                      {row.baseSalaryQuincenal.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-right text-rose-900 border-r border-slate-200">
                      ₡
                      {row.ccssAmountQ2.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-right font-black text-sky-950 bg-sky-100/60 border-r border-slate-200">
                      ₡
                      {row.netSalaryQ2.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 font-sans text-slate-500 text-[10px] border-r border-slate-200">
                      {row.observationsQ2}
                    </td>
                    <td className="p-2 text-center border-r border-slate-200">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                        {row.bank}
                      </span>
                    </td>
                    <td className="p-2 pr-3 text-right">
                      <button
                        onClick={() => {
                          const empObj = toEmployeeObj(row);
                          const payslipObj: EmployeePayslip = {
                            id: `COL-2026-Q2-${row.id}`,
                            employeeId: empObj.id,
                            period: "Segunda Quincena Octubre 2026",
                            dateRange: "Planilla del 16 al 31 de Octubre 2026",
                            entityName:
                              "ASOCIACIÓN PRO MEJORAS RESIDENCIAL PINAR DEL RÍO",
                            legalId: "3-002-342377",
                            paymentDate: "2026-10-31",
                            grossSalary: row.baseSalaryQuincenal,
                            overtimeHours: 0,
                            overtimeAmount: 0,
                            subtotal: row.baseSalaryQuincenal,
                            unworkedDays: 0,
                            unworkedDaysDeduction: 0,
                            workerCCSSDeduction: row.ccssAmountQ2,
                            otherDeductions: 0,
                            netSalary: row.netSalaryQ2,
                            employerCCSSContribution: Math.round(
                              row.baseSalaryQuincenal * 0.2667,
                            ),
                            status: "pagado",
                            ccssSicereBatchId: "SICERE-2026-OCT-Q2",
                            bankReference: `BCO-POP-${row.idNumber.replace(/\D/g, "")}`,
                          };
                          if (onOpenBoleta) onOpenBoleta(empObj, payslipObj);
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-800 text-white font-bold hover:bg-emerald-900 cursor-pointer text-[10px]"
                      >
                        Boleta
                      </button>
                    </td>
                  </tr>
                ))}

                <tr className="bg-amber-200 font-black text-slate-950 border-t-2 border-slate-400">
                  <td colSpan={2} className="p-2.5 text-left font-sans text-xs">
                    TOTALES Q2
                  </td>
                  <td className="p-2.5 text-right">
                    ₡
                    {totalBaseMonthly.toLocaleString("es-CR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-2.5 text-right">
                    ₡
                    {totalBaseQ1.toLocaleString("es-CR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-2.5 text-right">₡0.00</td>
                  <td className="p-2.5 text-right">
                    ₡
                    {totalBaseQ1.toLocaleString("es-CR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-2.5 text-right text-rose-950">
                    ₡
                    {totalCCSSQ2.toLocaleString("es-CR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-2.5 text-right text-sm text-sky-950">
                    ₡
                    {totalNetSalaryQ2.toLocaleString("es-CR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td
                    colSpan={3}
                    className="p-2.5 text-center font-sans text-[10px]"
                  >
                    Total Segunda Quincena
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HOJA 4: CONSOLIDADO MENSUAL & LISTAS DE DEPÓSITO - IMÁGENES 6 Y 7         */}
      {/* ========================================================================= */}
      {payrollSheet === "monthly_summary" && (
        <div className="space-y-6">
          {/* Tarjetas Superiores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Total Salario Bruto Mensual
              </span>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">
                ₡
                {totalBrutoMensual.toLocaleString("es-CR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Planilla completa con extras
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Total Salario Neto Mensual
              </span>
              <p className="text-2xl font-black font-mono text-emerald-950 mt-1">
                ₡
                {totalNetoMensual.toLocaleString("es-CR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Q1: ₡{totalNetSalaryQ1.toLocaleString("es-CR")} + Q2: ₡
                {totalNetSalaryQ2.toLocaleString("es-CR")}
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Total Retención CCSS (10.83%)
              </span>
              <p className="text-2xl font-black font-mono text-rose-900 mt-1">
                ₡
                {(totalCCSSQ1 + totalCCSSQ2).toLocaleString("es-CR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Aportes obreros a transferir a CCSS
              </span>
            </div>
          </div>

          {/* Tabla 1: Planilla Salario Bruto Octubre 2026 (Imagen 6) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                ASOCIACION PINAR DEL RIO • PLANILLA SALARIO BRUTO OCTUBRE 2026
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Imagen 6 del Excel
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-300">
                  <tr>
                    <th className="p-3 text-left font-sans">NOMBRE</th>
                    <th className="p-3 text-right">SALARIO BASE MENSUAL</th>
                    <th className="p-3 text-right">BRUTO I QUINCENA</th>
                    <th className="p-3 text-right">
                      SALARIO BRUTO II QUINCENA
                    </th>
                    <th className="p-3 text-right bg-amber-50 text-amber-950 font-black">
                      TOTAL SALARIO BRUTO
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payrollRows.map((r) => {
                    const brutoQ1 = r.subtotal1Q1;
                    const brutoQ2 = r.baseSalaryQuincenal + r.extrasFeriadosQ2;
                    const totalBruto = brutoQ1 + brutoQ2;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-3 text-left font-sans font-bold text-slate-900">
                          {r.name}
                        </td>
                        <td className="p-3 text-right">
                          ₡
                          {r.baseSalaryMonthly.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3 text-right">
                          ₡
                          {brutoQ1.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3 text-right">
                          ₡
                          {brutoQ2.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3 text-right font-black text-amber-950 bg-amber-50">
                          ₡
                          {totalBruto.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-amber-200 font-black text-slate-950 border-t-2 border-slate-400">
                    <td className="p-3 font-sans">TOTAL PLANILLA DEPOSITOS</td>
                    <td className="p-3 text-right">
                      ₡
                      {totalBaseMonthly.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-3 text-right">
                      ₡
                      {totalSubtotal1Q1.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-3 text-right">
                      ₡
                      {totalBaseQ1.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-3 text-right text-sm">
                      ₡
                      {totalBrutoMensual.toLocaleString("es-CR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla 2: Planilla Salario Neto Octubre 2026 & Listas de Depósito (Imagen 7) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista Depósito Quincena 1 */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">
                    SALARIO 1 QUINCENA OCTUBRE 2026
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Lista para dispersión de cheques y transferencias Banco
                    Popular
                  </p>
                </div>
                <CreditCard className="w-4 h-4 text-emerald-700" />
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 text-left font-sans">EMPLEADO</th>
                      <th className="p-2 text-right">SALARIO NETO Q1</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payrollRows.map((r) => (
                      <tr key={r.id}>
                        <td className="p-2 font-sans font-medium text-slate-800 text-[11px]">
                          {r.name}
                        </td>
                        <td className="p-2 text-right font-black text-slate-900">
                          ₡
                          {r.netSalaryQ1.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-amber-200 font-black text-slate-950">
                      <td className="p-2 font-sans">
                        TOTAL PLANILLA DEPOSITOS Q1
                      </td>
                      <td className="p-2 text-right">
                        ₡
                        {totalNetSalaryQ1.toLocaleString("es-CR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lista Depósito Quincena 2 */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">
                    SALARIO 2 QUINCENA OCTUBRE 2026
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Lista para dispersión de cheques y transferencias Banco
                    Popular
                  </p>
                </div>
                <CreditCard className="w-4 h-4 text-sky-700" />
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 text-left font-sans">EMPLEADO</th>
                      <th className="p-2 text-right">SALARIO NETO Q2</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payrollRows.map((r) => (
                      <tr key={r.id}>
                        <td className="p-2 font-sans font-medium text-slate-800 text-[11px]">
                          {r.name}
                        </td>
                        <td className="p-2 text-right font-black text-slate-900">
                          ₡
                          {r.netSalaryQ2.toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-amber-200 font-black text-slate-950">
                      <td className="p-2 font-sans">
                        TOTAL PLANILLA DEPOSITOS Q2
                      </td>
                      <td className="p-2 text-right">
                        ₡
                        {totalNetSalaryQ2.toLocaleString("es-CR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HOJA 5: PARAMETRIZACIÓN TARIFAS, TURNOS & FERIADOS - IMÁGENES 3, 4 Y 5   */}
      {/* ========================================================================= */}
      {payrollSheet === "cal_extras" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
                CAL EXTRAS • PARAMETRIZACIÓN LEGAL 2026
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-1">
              Fórmulas y Tarifas de Jornadas, Horas Extras y Feriados
            </h3>
            <p className="text-xs text-slate-500">
              Modelado matemático con recargos de ley en Costa Rica (Diurno 8h,
              Mixto 7h + 12.5%, Nocturno 6h + 25%).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Turno Diurno */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-black text-xs uppercase text-slate-900 block">
                JORNADA DIURNA (8 HORAS)
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">
                    Salario Base Mensual:
                  </span>
                  <span className="font-bold">₡405,710.71</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">
                    Salario Diario (/30):
                  </span>
                  <span>₡13,523.69</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">
                    Hora Ordinaria (/8):
                  </span>
                  <span>₡1,690.46</span>
                </div>
                <div className="flex justify-between font-bold text-amber-900">
                  <span className="font-sans">Hora Extra (1.5×):</span>
                  <span>₡2,535.69</span>
                </div>
                <div className="flex justify-between font-black text-slate-950 pt-1 border-t border-slate-200">
                  <span className="font-sans">Costo Turno Ordinario:</span>
                  <span>₡13,523.69</span>
                </div>
              </div>
            </div>

            {/* Turno Mixto */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
              <span className="font-black text-xs uppercase text-amber-950 block">
                JORNADA MIXTA (7 HORAS)
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">
                    Salario Base Mensual:
                  </span>
                  <span className="font-bold">₡405,710.71</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">
                    Salario Diario (/30):
                  </span>
                  <span>₡13,523.69</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">
                    Hora Ordinaria (/7):
                  </span>
                  <span>₡1,931.96</span>
                </div>
                <div className="flex justify-between font-bold text-amber-900">
                  <span className="font-sans">Hora Extra (1.5×):</span>
                  <span>₡2,897.93</span>
                </div>
                <div className="flex justify-between font-black text-amber-950 pt-1 border-t border-amber-200">
                  <span className="font-sans">Día con Ord. y Extras:</span>
                  <span>₡16,421.62</span>
                </div>
              </div>
            </div>

            {/* Turno Nocturno */}
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2">
              <span className="font-black text-xs uppercase text-purple-950 block">
                JORNADA NOCTURNA (6 HORAS)
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">
                    Salario Base Mensual:
                  </span>
                  <span className="font-bold">₡405,710.71</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">
                    Salario Diario (/30):
                  </span>
                  <span>₡13,523.69</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">
                    Hora Ordinaria (/6):
                  </span>
                  <span>₡2,253.95</span>
                </div>
                <div className="flex justify-between font-bold text-purple-900">
                  <span className="font-sans">Hora Extra (1.5×):</span>
                  <span>₡3,380.92</span>
                </div>
                <div className="flex justify-between font-black text-purple-950 pt-1 border-t border-purple-200">
                  <span className="font-sans">Día con Ord. y Extras:</span>
                  <span>₡20,285.54</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Feriados Trabajados con Recargos (Imágenes 4 y 5) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-black text-xs uppercase text-slate-900 block">
              CÁLCULO OFICIAL DE FERIADOS TRABAJADOS (PAGO DOBLE CON RECARGOS)
            </span>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-sans">Turno</th>
                    <th className="p-3">Salario Diario Base</th>
                    <th className="p-3">Pago Adicional por Feriado</th>
                    <th className="p-3 font-sans">Explicación Legal</th>
                    <th className="p-3 text-right bg-amber-100 text-amber-950 font-black">
                      Feriado Doble Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-sans font-bold text-slate-900">
                      Diurno
                    </td>
                    <td className="p-3">₡13,523.69</td>
                    <td className="p-3">₡13,523.69</td>
                    <td className="p-3 font-sans text-slate-600">
                      Se paga un día más (doble)
                    </td>
                    <td className="p-3 text-right font-black text-amber-950 bg-amber-50">
                      ₡27,047.38
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-bold text-slate-900">
                      Mixto
                    </td>
                    <td className="p-3">₡15,204.15 (recargo 12.5%)</td>
                    <td className="p-3">₡15,204.15</td>
                    <td className="p-3 font-sans text-slate-600">
                      Se paga un día más con recargo mixto (1.125)
                    </td>
                    <td className="p-3 text-right font-black text-amber-950 bg-amber-50">
                      ₡30,558.30
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-bold text-slate-900">
                      Nocturno
                    </td>
                    <td className="p-3">₡16,904.61 (recargo 25%)</td>
                    <td className="p-3">₡16,904.61</td>
                    <td className="p-3 font-sans text-slate-600">
                      Se paga un día más con recargo nocturno (1.25)
                    </td>
                    <td className="p-3 text-right font-black text-amber-950 bg-amber-50">
                      ₡33,809.23
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HOJA 6: CÁLCULO DE AGUINALDOS (DÉCIMO TERCER MES - LEY COSTA RICA)        */}
      {/* ========================================================================= */}
      {payrollSheet === "aguinaldos" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white font-mono font-black text-[11px] tracking-wider uppercase">
                  LEY N.º 2412 • COSTA RICA
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Período: 01 de Diciembre 2025 al 30 de Noviembre 2026
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                🎄 Cálculo Oficial de Aguinaldo (Décimo Tercer Mes)
              </h3>
              <p className="text-xs text-slate-500">
                Suma total de los salarios ordinarios y extraordinarios
                devengados en los 12 meses dividida entre 12. Exento de cargas
                sociales (CCSS) y de impuesto de renta.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const wb = XLSX.utils.book_new();
                  const aguinaldoData = payrollRows.map((r) => {
                    const totalDevengado =
                      (r.baseSalaryMonthly +
                        (r.extrasFeriadosQ1 + r.extrasFeriadosQ2)) *
                      12;
                    return {
                      "#": r.number,
                      COLABORADOR: r.name,
                      CÉDULA: r.idNumber,
                      PUESTO: r.role,
                      "SALARIO BASE": r.baseSalaryMonthly,
                      "DEVENGADO 12 MESES": totalDevengado,
                      "MONTO AGUINALDO (DEVENGADO / 12)": totalDevengado / 12,
                      "PROVISIÓN MENSUAL (8.33%)": totalDevengado / 12 / 12,
                      "FECHA MÁXIMA DE PAGO": "20 de Diciembre",
                      "FORMA DE PAGO": r.bank,
                      "CUENTA IBAN": r.iban,
                    };
                  });
                  const ws = XLSX.utils.json_to_sheet(aguinaldoData);
                  XLSX.utils.book_append_sheet(
                    wb,
                    ws,
                    "AGUINALDOS PINAR DEL RIO",
                  );
                  XLSX.writeFile(
                    wb,
                    "2026-PLANILLA-AGUINALDOS-PINAR-DEL-RIO.xlsx",
                  );
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Planilla de Aguinaldos (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Tarjetas de Provisión */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-bold uppercase text-amber-900 block font-sans">
                TOTAL A PAGAR EN AGUINALDOS
              </span>
              <p className="text-xl font-black text-amber-950 mt-1">
                ₡
                {payrollRows
                  .reduce(
                    (acc, r) =>
                      acc +
                      ((r.baseSalaryMonthly +
                        (r.extrasFeriadosQ1 + r.extrasFeriadosQ2)) *
                        12) /
                        12,
                    0,
                  )
                  .toLocaleString("es-CR", { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-amber-700 font-sans">
                10 Colaboradores cubiertos
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-emerald-900 block font-sans">
                PROVISIÓN MENSUAL ASOCIACIÓN (8.33%)
              </span>
              <p className="text-xl font-black text-emerald-950 mt-1">
                ₡
                {payrollRows
                  .reduce(
                    (acc, r) =>
                      acc +
                      ((r.baseSalaryMonthly +
                        (r.extrasFeriadosQ1 + r.extrasFeriadosQ2)) *
                        12) /
                        12 /
                        12,
                    0,
                  )
                  .toLocaleString("es-CR", { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-emerald-700 font-sans">
                Carga financiera mensual
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
              <span className="text-[10px] font-bold uppercase text-sky-900 block font-sans">
                FECHA LÍMITE DE PAGO LEGAL
              </span>
              <p className="text-base font-black text-sky-950 mt-1 font-sans">
                20 de Diciembre 2026
              </p>
              <span className="text-[10px] text-sky-700 font-sans">
                Obligatorio por ley del MTSS
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-700 block font-sans">
                RETENCIÓN CCSS / RENTA
              </span>
              <p className="text-xl font-black text-emerald-700 mt-1">
                ₡0.00 (Exento 100%)
              </p>
              <span className="text-[10px] text-slate-500 font-sans">
                Sin deducciones de ningún tipo
              </span>
            </div>
          </div>

          {/* Tabla de Aguinaldos con Desglose Anual */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-300">
                <tr>
                  <th className="p-3 border-r border-slate-200 text-center">
                    #
                  </th>
                  <th className="p-3 font-sans border-r border-slate-200 min-w-[200px]">
                    COLABORADOR
                  </th>
                  <th className="p-3 border-r border-slate-200">
                    SALARIO BASE
                    <br />
                    MENSUAL
                  </th>
                  <th className="p-3 border-r border-slate-200">
                    DEVENGADO
                    <br />
                    ANUAL ESTIMADO
                  </th>
                  <th className="p-3 border-r border-slate-200 bg-amber-100 text-amber-950 font-black">
                    AGUINALDO A PAGAR
                    <br />
                    (= TOTAL / 12)
                  </th>
                  <th className="p-3 border-r border-slate-200">
                    PROVISIÓN
                    <br />
                    MENSUAL (8.33%)
                  </th>
                  <th className="p-3 border-r border-slate-200">BANCO</th>
                  <th className="p-3 pr-4 text-right">COMPROBANTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {payrollRows.map((r) => {
                  const totalAnualDevengado =
                    (r.baseSalaryMonthly +
                      (r.extrasFeriadosQ1 + r.extrasFeriadosQ2)) *
                    12;
                  const montoAguinaldo = totalAnualDevengado / 12;
                  const provisionMensual = montoAguinaldo / 12;

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-3 text-center font-bold text-slate-600 border-r border-slate-200">
                        {r.number}
                      </td>
                      <td className="p-3 text-left font-sans font-bold text-slate-900 border-r border-slate-200">
                        {r.name}
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {r.role} • Céd: {r.idNumber}
                        </span>
                      </td>
                      <td className="p-3 text-right border-r border-slate-200">
                        ₡
                        {r.baseSalaryMonthly.toLocaleString("es-CR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3 text-right border-r border-slate-200 text-slate-700">
                        ₡
                        {totalAnualDevengado.toLocaleString("es-CR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3 text-right font-black text-amber-950 bg-amber-100/70 border-r border-slate-200 text-xs">
                        ₡
                        {montoAguinaldo.toLocaleString("es-CR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3 text-right border-r border-slate-200 text-slate-600">
                        ₡
                        {provisionMensual.toLocaleString("es-CR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3 text-center border-r border-slate-200">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {r.bank}
                        </span>
                      </td>
                      <td className="p-3 pr-3 text-right">
                        <button
                          onClick={() => {
                            const empObj = toEmployeeObj(r);
                            const payslipObj: EmployeePayslip = {
                              id: `AGUINALDO-2026-${r.id}`,
                              employeeId: empObj.id,
                              period: "Aguinaldo Legal Período 2026",
                              dateRange:
                                "01 de Diciembre 2025 al 30 de Noviembre 2026",
                              entityName:
                                "ASOCIACIÓN PRO MEJORAS RESIDENCIAL PINAR DEL RÍO",
                              legalId: "3-002-342377",
                              paymentDate: "2026-12-15",
                              grossSalary: montoAguinaldo,
                              overtimeHours: 0,
                              overtimeAmount: 0,
                              subtotal: montoAguinaldo,
                              unworkedDays: 0,
                              unworkedDaysDeduction: 0,
                              workerCCSSDeduction: 0,
                              otherDeductions: 0,
                              netSalary: montoAguinaldo,
                              employerCCSSContribution: 0,
                              status: "pagado",
                              ccssSicereBatchId: "AGUINALDO-EXENTO-LEY-2412",
                              bankReference: `AGUIN-${r.idNumber.replace(/\D/g, "")}`,
                            };
                            if (onOpenBoleta) onOpenBoleta(empObj, payslipObj);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Boleta Aguinaldo
                        </button>
                      </td>
                    </tr>
                  );
                })}

                <tr className="bg-amber-200 font-black text-slate-950 border-t-2 border-slate-400">
                  <td colSpan={2} className="p-3 font-sans">
                    TOTAL PLANILLA AGUINALDOS
                  </td>
                  <td className="p-3 text-right">
                    ₡
                    {totalBaseMonthly.toLocaleString("es-CR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-3 text-right">
                    ₡
                    {payrollRows
                      .reduce(
                        (acc, r) =>
                          acc +
                          (r.baseSalaryMonthly +
                            (r.extrasFeriadosQ1 + r.extrasFeriadosQ2)) *
                            12,
                        0,
                      )
                      .toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right text-sm text-amber-950 font-black">
                    ₡
                    {payrollRows
                      .reduce(
                        (acc, r) =>
                          acc +
                          ((r.baseSalaryMonthly +
                            (r.extrasFeriadosQ1 + r.extrasFeriadosQ2)) *
                            12) /
                            12,
                        0,
                      )
                      .toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right">
                    ₡
                    {payrollRows
                      .reduce(
                        (acc, r) =>
                          acc +
                          ((r.baseSalaryMonthly +
                            (r.extrasFeriadosQ1 + r.extrasFeriadosQ2)) *
                            12) /
                            12 /
                            12,
                        0,
                      )
                      .toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    colSpan={2}
                    className="p-3 text-center font-sans text-[10px]"
                  >
                    100% Exento de Cargas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
