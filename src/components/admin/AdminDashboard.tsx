import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  UserProfile,
  Unit,
  PaymentRecord,
  MaintenanceTicket,
  NewsAnnouncement,
  Reservation,
  Employee,
  PayrollRun,
  PaymentAgreement,
  BoardApprovalStatus,
  IncidentResult,
  TicketStatus,
  TicketPriority,
  ResidentMember,
  ShiftDefinition,
  EmployeePayslip,
} from "../../types";
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Send,
  Users,
  Search,
  Check,
  Shield,
  Eye,
  Bell,
  Wrench,
  Building,
  CreditCard,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Download,
  Printer,
  Sparkles,
  Tag,
  Image as ImageIcon,
  Video,
  ExternalLink,
  ShieldCheck,
  Landmark,
  Briefcase,
  AlertCircle,
  Sliders,
  Filter,
  CheckSquare,
  Home,
  UserPlus,
  Dog,
  Baby,
  Car,
  Calculator,
  Palmtree,
  CalendarRange,
  BarChart3,
  Archive,
  RefreshCw,
  Award,
  FileSpreadsheet,
  Receipt,
  MessageCircle,
  Share2,
  Heart,
  Upload,
  Gift,
  Star,
} from "lucide-react";
import { PinarPayrollManager } from "./PinarPayrollManager";

interface AdminDashboardProps {
  currentUser: UserProfile;
  units: Unit[];
  payments: PaymentRecord[];
  tickets: MaintenanceTicket[];
  news: NewsAnnouncement[];
  reservations: Reservation[];
  employees: Employee[];
  payrollRuns: PayrollRun[];
  shifts: ShiftDefinition[];
  onValidatePayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string, reason: string) => void;
  onUpdateTicket: (ticket: MaintenanceTicket) => void;
  onCreateTicket: (ticket: Omit<MaintenanceTicket, "id" | "createdAt">) => void;
  onDeleteTicket: (ticketId: string) => void;
  onPublishNews: (newsItem: Omit<NewsAnnouncement, "id" | "date">) => void;
  onUpdateNews: (newsItem: NewsAnnouncement) => void;
  onDeleteNews: (newsId: string) => void;
  onUpdatePaymentAgreement: (
    unitId: string,
    agreement: PaymentAgreement | undefined,
  ) => void;
  onCreateUnit: (unit: Omit<Unit, "id">) => void;
  onUpdateUnit: (unit: Unit) => void;
  onAddResidentToUnit: (
    unitId: string,
    resident: Omit<ResidentMember, "id">,
  ) => void;
  onRemoveResidentFromUnit: (unitId: string, residentId: string) => void;
  onCreateEmployee: (employee: Omit<Employee, "id" | "payslips">) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onProcessPayroll: (period: string) => void;
  onCreateShift: (shift: Omit<ShiftDefinition, "id">) => void;
  onUpdateShift?: (shift: ShiftDefinition) => void;
  onDeleteShift: (shiftId: string) => void;
  onApplyMonthlyQuota?: (
    mode: "all" | "unit",
    amount: number,
    unitId?: string,
    deltaPercent?: number,
  ) => void;
  onRecordCashReceipt?: (receipt: Omit<PaymentRecord, "id" | "status">) => void;
  onUpdateUnitHousehold?: (
    unitId: string,
    updatedData: {
      ownerPhone?: string;
      ownerEmail?: string;
      emergencyPhone?: string;
      emergencyContactName?: string;
      hasChildren?: boolean;
      hasPets?: boolean;
      residents?: ResidentMember[];
    },
  ) => void;
  onBatchImport?: (
    type: "units" | "payments" | "employees",
    data: any[],
  ) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  units = [],
  payments = [],
  tickets = [],
  news = [],
  reservations = [],
  employees = [],
  payrollRuns = [],
  shifts = [],
  onValidatePayment,
  onRejectPayment,
  onUpdateTicket,
  onCreateTicket,
  onDeleteTicket,
  onPublishNews,
  onUpdateNews,
  onDeleteNews,
  onUpdatePaymentAgreement,
  onCreateUnit,
  onUpdateUnit,
  onAddResidentToUnit,
  onRemoveResidentFromUnit,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onProcessPayroll,
  onCreateShift,
  onUpdateShift,
  onDeleteShift,
  onApplyMonthlyQuota,
  onRecordCashReceipt,
  onUpdateUnitHousehold,
  onBatchImport,
}) => {
  // Navigation Sidebar State
  const [activeTab, setActiveTab] = useState<
    | "collection_payments"
    | "units_residents"
    | "tickets"
    | "announcements"
    | "payroll"
    | "schedules"
    | "cashflow_projections"
  >("collection_payments");

  // Subtab for merged Collection & Payments (renamed to Tesorería & Gestión de Cobros)
  const [collectionSubTab, setCollectionSubTab] = useState<
    "receivables" | "cash_register" | "payments" | "excel_import" | "summary"
  >("receivables");

  // Subtab for Announcements (Blog Manager, Schedule, Analytics, Editor)
  const [newsSubTab, setNewsSubTab] = useState<
    "manager" | "editor" | "schedule" | "analytics"
  >("manager");

  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [rejectModalPayment, setRejectModalPayment] =
    useState<PaymentRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Payment Agreement Modal State
  const [agreementModalUnit, setAgreementModalUnit] = useState<Unit | null>(
    null,
  );
  const [agreedAmount, setAgreedAmount] = useState<number>(0);
  const [installmentsCount, setInstallmentsCount] = useState<number>(6);
  const [agreementNotes, setAgreementNotes] = useState<string>("");
  const [agreementActa, setAgreementActa] = useState<string>("Acta JD-2026-20");

  // Gestor de Cuotas Condominales (Por Filial o Masiva para Todos los Condóminos)
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaApplyMode, setQuotaApplyMode] = useState<"all" | "unit">("all");
  const [quotaSelectedUnitId, setQuotaSelectedUnitId] = useState<string>(
    units[0]?.id || "",
  );
  const [quotaAmount, setQuotaAmount] = useState<number>(85000);
  const [quotaDeltaPercent, setQuotaDeltaPercent] = useState<number>(0);
  const [quotaSuccessMessage, setQuotaSuccessMessage] = useState<string | null>(
    null,
  );

  // Caja Rápida & Libro de Recibos de Caseta (2026 INGRESOS EGRESOS)
  const [isCashReceiptModalOpen, setIsCashReceiptModalOpen] = useState(false);
  const [cashReceiptUnitId, setCashReceiptUnitId] = useState<string>(
    units[0]?.id || "",
  );
  const [cashReceiptPayerName, setCashReceiptPayerName] = useState<string>(
    units[0]?.ownerName || "",
  );
  const [cashReceiptAmount, setCashReceiptAmount] = useState<number>(
    units[0]?.monthlyQuota || 85000,
  );
  const [cashReceiptMonth, setCashReceiptMonth] =
    useState<string>("Octubre 2026");
  const [cashReceiptOfficer, setCashReceiptOfficer] = useState<string>(
    "Don Rodrigo Alvarado (Oficial Caseta)",
  );
  const [cashReceiptBooth, setCashReceiptBooth] = useState<string>(
    "Caseta Principal #1",
  );
  const [cashReceiptMethod, setCashReceiptMethod] = useState<
    "cash" | "sinpe" | "transfer"
  >("cash");
  const [lastIssuedReceipt, setLastIssuedReceipt] =
    useState<PaymentRecord | null>(null);

  // Boletas de Pago Oficiales (2026- BOLETAS DE PAGO PLANILLA MENSUAL)
  const [selectedBoletaPayslip, setSelectedBoletaPayslip] =
    useState<EmployeePayslip | null>(null);
  const [selectedBoletaEmployee, setSelectedBoletaEmployee] =
    useState<Employee | null>(null);

  // Importador Universal de Excel (.xlsx)
  const [excelImportType, setExcelImportType] = useState<
    "payroll" | "cash_register" | "units"
  >("payroll");
  const [excelPreviewRows, setExcelPreviewRows] = useState<any[]>([]);
  const [excelFileName, setExcelFileName] = useState<string>("");
  const [excelImportSuccess, setExcelImportSuccess] = useState<string | null>(
    null,
  );

  // Unit & Resident Modals
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitForm, setUnitForm] = useState({
    number: "",
    section: "Sector Los Pinos",
    ownerName: "",
    ownerPhone: "+506 ",
    ownerEmail: "",
    emergencyPhone: "+506 ",
    emergencyContactName: "",
    residencyDuration: "1 año",
    areaM2: 180,
    participationPercentage: 2.0,
    monthlyQuota: 85000,
    currentBalance: 0,
    hasChildren: false,
    childrenCount: 0,
    childrenDetails: "",
    hasPets: false,
    dogsCount: 0,
    dogsDetails: "",
    catsCount: 0,
    catsDetails: "",
    vehiclesCount: 1,
    vehiclesPlates: "",
    unitResidentsList: [] as ResidentMember[],
  });

  // Temporary state for adding a resident inline during unit creation/edition
  const [inlineResidentName, setInlineResidentName] = useState("");
  const [inlineResidentPhone, setInlineResidentPhone] = useState("+506 ");
  const [inlineResidentRel, setInlineResidentRel] = useState<
    | "Propietario Principal"
    | "Cónyuge / Pareja"
    | "Hijo(a)"
    | "Familiar"
    | "Inquilino / Arrendatario"
  >("Cónyuge / Pareja");

  const [residentModalUnit, setResidentModalUnit] = useState<Unit | null>(null);
  const [residentForm, setResidentForm] = useState<Omit<ResidentMember, "id">>({
    name: "",
    phone: "+506 ",
    email: "",
    relationship: "Propietario Principal",
    residencyDuration: "1 año",
    dogsCount: 0,
    dogsDetails: "",
    catsCount: 0,
    catsDetails: "",
    childrenCount: 0,
    childrenDetails: "",
    vehiclesCount: 1,
    vehiclesPlates: "",
    notes: "",
  });

  // Ticket CRUD Modal State
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(
    null,
  );
  const [ticketForm, setTicketForm] = useState<{
    title: string;
    category: string;
    description: string;
    location: string;
    priority: TicketPriority;
    status: TicketStatus;
    unitNumber: string;
    residentName: string;
    slaTargetHours: number;
    assignedVendor: string;
    date: string;
    cost: number;
    motive: string;
    boardApproval: BoardApprovalStatus;
    boardActaNumber: string;
    result: IncidentResult;
    createPublicNotice: boolean; // CHECKBOX para comunicado público
  }>({
    title: "",
    category: "Mantenimiento General",
    description: "",
    location: "",
    priority: "media",
    status: "nuevo",
    unitNumber: "Administración",
    residentName: currentUser.name,
    slaTargetHours: 48,
    assignedVendor: "",
    date: new Date().toISOString().split("T")[0],
    cost: 0,
    motive: "",
    boardApproval: "Pendiente",
    boardActaNumber: "",
    result: "En Proceso",
    createPublicNotice: true,
  });

  // Blog Editor & Management State
  const [editingNews, setEditingNews] = useState<NewsAnnouncement | null>(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsCategory, setNewsCategory] = useState<
    "comunicado" | "mantenimiento" | "evento" | "asamblea"
  >("comunicado");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImage, setNewsImage] = useState(
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
  );
  const [newsPhotos, setNewsPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
  ]);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState("");
  const [newsUrgent, setNewsUrgent] = useState(false);
  const [newsTags, setNewsTags] = useState<string[]>(["Comunidad", "Oficial"]);
  const [tagInput, setTagInput] = useState("");
  const [newsVideoUrl, setNewsVideoUrl] = useState("");
  const [publishScheduleDate, setPublishScheduleDate] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [unpublishDate, setUnpublishDate] = useState("2026-12-31T23:59");
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Employee CRUD Modal State
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState<{
    name: string;
    idNumber: string;
    role:
      | "Seguridad"
      | "Mantenimiento"
      | "Jardinería"
      | "Limpieza"
      | "Administración";
    roleTitle: string;
    baseSalary: number;
    ccssInsuranceNumber: string;
    iban: string;
    bankName: string;
    hireDate: string;
    email: string;
    phone: string;
    status: "activo" | "vacaciones" | "incapacitado" | "inactivo";
  }>({
    name: "",
    idNumber: "",
    role: "Seguridad",
    roleTitle: "",
    baseSalary: 420000,
    ccssInsuranceNumber: "",
    iban: "CR",
    bankName: "Banco Nacional de Costa Rica (BNCR)",
    hireDate: new Date().toISOString().split("T")[0],
    email: "",
    phone: "",
    status: "activo",
  });

  // Shift Modal State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftDefinition | null>(
    null,
  );
  const [shiftForm, setShiftForm] = useState<{
    name: string;
    startTime: string;
    endTime: string;
    hoursWeekly: number;
    category: "Seguridad" | "Mantenimiento" | "Limpieza" | "General";
    description: string;
  }>({
    name: "",
    startTime: "06:00",
    endTime: "18:00",
    hoursWeekly: 48,
    category: "Seguridad",
    description: "",
  });

  // Employee Schedule Editor Modal
  const [scheduleModalEmployee, setScheduleModalEmployee] =
    useState<Employee | null>(null);
  const [employeeScheduleDraft, setEmployeeScheduleDraft] = useState<{
    shiftName: string;
    hoursWeekly: number;
    daysOff: string[];
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    notes?: string;
  }>({
    shiftName: "",
    hoursWeekly: 48,
    daysOff: ["Domingo"],
    monday: "07:00 - 16:00",
    tuesday: "07:00 - 16:00",
    wednesday: "07:00 - 16:00",
    thursday: "07:00 - 16:00",
    friday: "07:00 - 16:00",
    saturday: "07:00 - 11:00",
    sunday: "Libre",
    notes: "",
  });

  // Liquidation Simulator Modal (Código de Trabajo de Costa Rica)
  const [liquidationModalEmployee, setLiquidationModalEmployee] =
    useState<Employee | null>(null);
  const [liquidationType, setLiquidationType] = useState<
    "con_responsabilidad" | "sin_responsabilidad" | "renuncia"
  >("con_responsabilidad");
  const [vacationPendingDays, setVacationPendingDays] = useState<number>(14);

  // Financial Simulator Parameters
  const [simQuotaDeltaPercent, setSimQuotaDeltaPercent] = useState<number>(0);
  const [simSalaryDeltaPercent, setSimSalaryDeltaPercent] = useState<number>(0);
  const [simArrearsRatePercent, setSimArrearsRatePercent] = useState<number>(8);
  const [simExtraMaintenance, setSimExtraMaintenance] = useState<number>(0);

  // Financial Calculations
  const totalMonthlyTarget = units.reduce((acc, u) => acc + u.monthlyQuota, 0);
  const totalOverdue = units.reduce((acc, u) => acc + u.currentBalance, 0);
  const appliedPaymentsTotal = payments
    .filter((p) => p.status === "applied")
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingPayments = payments.filter(
    (p) => p.status === "reported" || p.status === "pending_validation",
  );

  const openTickets = tickets.filter(
    (t) => t.status !== "resuelto" && t.status !== "cerrado",
  );
  const currentTotalGrossPayroll = employees.reduce(
    (acc, e) => acc + e.baseSalary,
    0,
  );
  const currentEmployerCCSS = Math.round(currentTotalGrossPayroll * 0.2667);
  const currentWorkerDeductions = Math.round(currentTotalGrossPayroll * 0.0984);

  // Handlers for Tickets
  const handleOpenTicketModal = (ticket?: MaintenanceTicket) => {
    if (ticket) {
      setEditingTicket(ticket);
      setTicketForm({
        title: ticket.title,
        category: ticket.category,
        description: ticket.description,
        location: ticket.location,
        priority: ticket.priority,
        status: ticket.status,
        unitNumber: ticket.unitNumber,
        residentName: ticket.residentName,
        slaTargetHours: ticket.slaTargetHours || 48,
        assignedVendor: ticket.assignedVendor || "",
        date: ticket.date || new Date().toISOString().split("T")[0],
        cost: ticket.cost || 0,
        motive: ticket.motive || "",
        boardApproval: ticket.boardApproval || "Pendiente",
        boardActaNumber: ticket.boardActaNumber || "",
        result: ticket.result || "En Proceso",
        createPublicNotice: false,
      });
    } else {
      setEditingTicket(null);
      setTicketForm({
        title: "",
        category: "Mantenimiento General",
        description: "",
        location: "",
        priority: "media",
        status: "nuevo",
        unitNumber: "Administración",
        residentName: currentUser.name,
        slaTargetHours: 48,
        assignedVendor: "",
        date: new Date().toISOString().split("T")[0],
        cost: 0,
        motive: "",
        boardApproval: "Pendiente",
        boardActaNumber: "",
        result: "En Proceso",
        createPublicNotice: true,
      });
    }
    setIsTicketModalOpen(true);
  };

  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.title) return;

    if (editingTicket) {
      onUpdateTicket({
        ...editingTicket,
        ...ticketForm,
      });
    } else {
      onCreateTicket({
        ...ticketForm,
        publicNoticeCreated: ticketForm.createPublicNotice,
      });

      // AUTO PUBLIC NOTICE CHECKBOX
      if (ticketForm.createPublicNotice) {
        onPublishNews({
          title: `Aviso de Mantenimiento: ${ticketForm.title}`,
          category: "mantenimiento",
          author: "Administración General",
          summary: `Se realizará labor de mantenimiento en ${ticketForm.location}. Motivo: ${ticketForm.motive || ticketForm.description}. Costo aprobado: ₡${ticketForm.cost.toLocaleString("es-CR")}.`,
          content: `Estimados condóminos: Les informamos que en fecha ${ticketForm.date} se estará realizando la intervención técnica correspondiente a: "${ticketForm.title}". Ubicación: ${ticketForm.location}. Motivo técnico: ${ticketForm.motive || ticketForm.description}. Estado de aprobación: ${ticketForm.boardApproval}. Agradecemos su comprensión.`,
          urgent:
            ticketForm.priority === "urgente" || ticketForm.priority === "alta",
          image:
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
          readTime: "2 min lectura",
          tags: [
            "Mantenimiento",
            "Obras",
            ticketForm.category.replace(/\s+/g, ""),
          ],
          status: "active",
          viewsCount: 1,
          reachPercentage: 5,
        });
      }
    }
    setIsTicketModalOpen(false);
  };

  // Handlers for Units
  const handleOpenUnitModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({
        number: unit.number,
        section: unit.section,
        ownerName: unit.ownerName,
        ownerPhone: unit.ownerPhone,
        ownerEmail: unit.ownerEmail,
        emergencyPhone: unit.emergencyPhone || "+506 ",
        emergencyContactName: unit.emergencyContactName || "",
        residencyDuration: unit.residents?.[0]?.residencyDuration || "1 año",
        areaM2: unit.areaM2,
        participationPercentage: unit.participationPercentage,
        monthlyQuota: unit.monthlyQuota,
        currentBalance: unit.currentBalance,
        hasChildren:
          unit.hasChildren ??
          (unit.residents?.some((r) => r.childrenCount > 0) || false),
        childrenCount:
          unit.residents?.reduce((acc, r) => acc + (r.childrenCount || 0), 0) ||
          0,
        childrenDetails:
          unit.residents?.find((r) => r.childrenDetails)?.childrenDetails || "",
        hasPets:
          unit.hasPets ??
          (unit.residents?.some(
            (r) => r.dogsCount > 0 || (r.catsCount || 0) > 0,
          ) ||
            false),
        dogsCount:
          unit.residents?.reduce((acc, r) => acc + (r.dogsCount || 0), 0) || 0,
        dogsDetails:
          unit.residents?.find((r) => r.dogsDetails)?.dogsDetails || "",
        catsCount:
          unit.residents?.reduce((acc, r) => acc + (r.catsCount || 0), 0) || 0,
        catsDetails:
          unit.residents?.find((r) => r.catsDetails)?.catsDetails || "",
        vehiclesCount:
          unit.residents?.reduce((acc, r) => acc + (r.vehiclesCount || 0), 0) ||
          1,
        vehiclesPlates:
          unit.residents?.find((r) => r.vehiclesPlates)?.vehiclesPlates || "",
        unitResidentsList: unit.residents ? [...unit.residents] : [],
      });
    } else {
      setEditingUnit(null);
      setUnitForm({
        number: `Filial #${units.length + 1 < 10 ? "0" : ""}${units.length + 1}`,
        section: "Sector Los Pinos",
        ownerName: "",
        ownerPhone: "+506 ",
        ownerEmail: "",
        emergencyPhone: "+506 ",
        emergencyContactName: "",
        residencyDuration: "1 año",
        areaM2: 180,
        participationPercentage: 2.1,
        monthlyQuota: 85000,
        currentBalance: 0,
        hasChildren: false,
        childrenCount: 0,
        childrenDetails: "",
        hasPets: false,
        dogsCount: 0,
        dogsDetails: "",
        catsCount: 0,
        catsDetails: "",
        vehiclesCount: 1,
        vehiclesPlates: "",
        unitResidentsList: [],
      });
    }
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.number || !unitForm.ownerName) return;

    // Ensure at least the main resident exists in the list
    let finalResidents = [...unitForm.unitResidentsList];
    if (finalResidents.length === 0) {
      finalResidents.push({
        id: `res-${Date.now()}-1`,
        name: unitForm.ownerName,
        phone: unitForm.ownerPhone,
        email: unitForm.ownerEmail,
        relationship: "Propietario Principal",
        residencyDuration: unitForm.residencyDuration,
        childrenCount: unitForm.childrenCount,
        childrenDetails: unitForm.childrenDetails,
        dogsCount: unitForm.dogsCount,
        dogsDetails: unitForm.dogsDetails,
        catsCount: unitForm.catsCount,
        catsDetails: unitForm.catsDetails,
        vehiclesCount: unitForm.vehiclesCount,
        vehiclesPlates: unitForm.vehiclesPlates,
      });
    }

    if (editingUnit) {
      onUpdateUnit({
        ...editingUnit,
        number: unitForm.number,
        section: unitForm.section,
        ownerName: unitForm.ownerName,
        ownerPhone: unitForm.ownerPhone,
        ownerEmail: unitForm.ownerEmail,
        emergencyPhone: unitForm.emergencyPhone,
        emergencyContactName: unitForm.emergencyContactName,
        areaM2: unitForm.areaM2,
        participationPercentage: unitForm.participationPercentage,
        monthlyQuota: unitForm.monthlyQuota,
        currentBalance: unitForm.currentBalance,
        hasChildren: unitForm.hasChildren,
        hasPets: unitForm.hasPets,
        residents: finalResidents,
      });
    } else {
      onCreateUnit({
        number: unitForm.number,
        section: unitForm.section,
        ownerName: unitForm.ownerName,
        ownerPhone: unitForm.ownerPhone,
        ownerEmail: unitForm.ownerEmail,
        emergencyPhone: unitForm.emergencyPhone,
        emergencyContactName: unitForm.emergencyContactName,
        areaM2: unitForm.areaM2,
        participationPercentage: unitForm.participationPercentage,
        monthlyQuota: unitForm.monthlyQuota,
        currentBalance: unitForm.currentBalance,
        arrearsStatus: "up_to_date",
        overdueMonths: [],
        hasChildren: unitForm.hasChildren,
        hasPets: unitForm.hasPets,
        residents: finalResidents,
      });
    }
    setIsUnitModalOpen(false);
  };

  // Handler: Generate and Download Excel Template for the 3 client files
  const handleDownloadExcelTemplate = (
    type: "payroll" | "cash_register" | "units",
  ) => {
    const wb = XLSX.utils.book_new();
    if (type === "payroll") {
      const rows = [
        ["ASOCIACIÓN PRO MEJORAS RESIDENCIAL PINAR DEL RÍO"],
        ["Cédula Jurídica: 3-002-342377"],
        ["PLANILLA SALARIOS MENSUALES - OCTUBRE 2026"],
        [],
        [
          "EMPLEADO",
          "SALARIO BRUTO",
          "EXTRAS",
          "SUBTOTAL",
          "DIAS NO",
          "C.C.S.S.",
          "DEDUCCIONES",
          "SALARIO NETO",
          "OBSERVACIONES",
        ],
        [
          "Don Rodrigo Alvarado Quirós",
          425000,
          25000,
          450000,
          0,
          44280,
          0,
          405720,
          "Guardia Caseta 24/7",
        ],
        [
          "Esteban Mora Picado",
          460000,
          0,
          460000,
          0,
          45264,
          0,
          414736,
          "Mantenimiento y Piscinas",
        ],
        [
          "Patricia Solano Hernández",
          380000,
          15000,
          395000,
          0,
          38868,
          0,
          356132,
          "Limpieza Casa Club",
        ],
        [
          "Juan Carlos Jiménez Vargas",
          440000,
          30000,
          470000,
          0,
          46248,
          0,
          423752,
          "Guarda Nocturno",
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "OCTUBRE");
      XLSX.writeFile(wb, "2026- PLANILLA SALARIOS MENSUALES.xlsx");
    } else if (type === "cash_register") {
      const rows = [
        ["ASOCIACIÓN PRO MEJORAS RESIDENCIAL PINAR DEL RÍO"],
        ["2026 INGRESOS EGRESOS - LIBRO DE CAJA Y RECIBOS"],
        ["Mes: OCTUBRE 2026"],
        [],
        [
          "#",
          "NOMBRE",
          "RECIBO",
          "LOTE",
          "MONTO",
          "MES CANCELADO",
          "FECHA DE PAGO",
          "OFICIAL QUE RECIBIO EL PAGO",
          "CASETA #",
        ],
        [
          1,
          "Carlos Vargas Murillo",
          "REC-2026-0042",
          "Lote 14",
          85000,
          "Octubre 2026",
          "2026-10-02",
          "Don Rodrigo Alvarado",
          "Caseta Principal #1",
        ],
        [
          2,
          "Marielos Mora Solís",
          "REC-2026-0043",
          "Lote 27",
          95000,
          "Octubre 2026",
          "2026-10-03",
          "Juan Carlos Jiménez",
          "Caseta Norte #2",
        ],
        [
          3,
          "Javier Brenes Castillo",
          "REC-2026-0044",
          "Lote 32",
          90000,
          "Octubre 2026",
          "2026-10-04",
          "Don Rodrigo Alvarado",
          "Caseta Principal #1",
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "ENERO");
      XLSX.writeFile(wb, "2026 INGRESOS EGRESOS o1-RuthlePC.xlsx");
    } else {
      const rows = [
        [
          "FILIAL",
          "SECTOR",
          "PROPIETARIO",
          "TELEFONO",
          "CORREO",
          "CUOTA",
          "SALDO",
          "TIEMPO_RESIDENCIA",
          "HIJOS",
          "DETALLE_HIJOS",
          "PERROS",
          "DETALLE_PERROS",
          "GATOS",
          "PLACAS",
        ],
        [
          "Filial #01",
          "Sector Los Pinos",
          "Ana Lucrecia Monge",
          "+506 8812-3456",
          "amonge@ejemplo.cr",
          85000,
          0,
          "4 años",
          2,
          "Lucas (6), Sofía (10)",
          1,
          "Golden Retriever",
          0,
          "SBN-992",
        ],
        [
          "Filial #02",
          "Sector Los Pinos",
          "Roberto Fernández Arias",
          "+506 8765-4321",
          "rfernandez@ejemplo.cr",
          85000,
          0,
          "2 años",
          0,
          "",
          1,
          "Poodle",
          1,
          "BHF-102",
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "FILIALES");
      XLSX.writeFile(wb, "2026- FILIALES Y RESIDENTES.xlsx");
    }
  };

  // Handler: Parse Uploaded Excel File (.xlsx / .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Find header row (starts at row with EMPLEADO or # or FILIAL or NOMBRE)
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(10, data.length); i++) {
          const rowStr = (data[i] || []).join(" ").toUpperCase();
          if (
            rowStr.includes("EMPLEADO") ||
            rowStr.includes("RECIBO") ||
            rowStr.includes("FILIAL") ||
            rowStr.includes("LOTE") ||
            rowStr.includes("NOMBRE")
          ) {
            headerRowIndex = i;
            break;
          }
        }

        const headers = data[headerRowIndex] || [];
        const rows = data
          .slice(headerRowIndex + 1)
          .filter((r) => r.length > 0 && r.some(Boolean));

        const parsedRows = rows.map((r) => {
          const obj: any = {};
          headers.forEach((h: any, idx: number) => {
            if (h) obj[String(h).trim()] = r[idx];
          });
          return obj;
        });

        setExcelPreviewRows(parsedRows);
      } catch (err) {
        alert(
          "Error al leer el archivo Excel. Asegúrate de que sea un archivo .xlsx, .xls o .csv válido.",
        );
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handler: Confirm Import to Database
  const handleConfirmExcelImport = () => {
    if (excelPreviewRows.length === 0) return;

    if (excelImportType === "payroll") {
      const newEmployees: Employee[] = excelPreviewRows.map((row, idx) => {
        const name = row["EMPLEADO"] || row["Nombre"] || `Empleado ${idx + 1}`;
        const baseSalary =
          Number(row["SALARIO BRUTO"]) || Number(row["Salario"]) || 400000;
        const extras = Number(row["EXTRAS"]) || 0;
        const subtotal = Number(row["SUBTOTAL"]) || baseSalary + extras;
        const diasNo = Number(row["DIAS NO"]) || 0;
        const ccss = Number(row["C.C.S.S."]) || Math.round(subtotal * 0.0984);
        const deducciones = Number(row["DEDUCCIONES"]) || 0;
        const netSalary =
          Number(row["SALARIO NETO"]) || subtotal - ccss - deducciones;
        const obs = row["OBSERVACIONES"] || "";

        const empId = `emp-import-${Date.now()}-${idx}`;
        return {
          id: empId,
          name,
          idNumber: `1-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`,
          role: "Seguridad" as const,
          roleTitle: "Funcionario en Planilla",
          baseSalary,
          ccssInsuranceNumber: `11${Math.floor(100000000 + Math.random() * 900000000)}`,
          iban: `CR${Math.floor(10 + Math.random() * 89)}0151000${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          bankName: "Banco Nacional de Costa Rica (BNCR)",
          hireDate: "2024-01-01",
          status: "activo" as const,
          email: `${name.toLowerCase().replace(/\s+/g, ".")}@pinardelrio.cr`,
          phone: "+506 8800-0000",
          vacationDaysTotal: 14,
          vacationDaysTaken: 0,
          schedule: {
            shiftName: "Turno Diurno Ordinario",
            hoursWeekly: 48,
            daysOff: ["Domingo"],
            monday: "07:00 - 16:00",
            tuesday: "07:00 - 16:00",
            wednesday: "07:00 - 16:00",
            thursday: "07:00 - 16:00",
            friday: "07:00 - 16:00",
            saturday: "07:00 - 11:00",
            sunday: "Libre",
          },
          payslips: [
            {
              id: `COL-2026-OCT-${idx + 1}`,
              employeeId: empId,
              period: "Octubre 2026",
              dateRange: "Planilla del 01 al 31 de Octubre 2026",
              entityName: "ASOCIACIÓN PRO MEJORAS RESIDENCIAL PINAR DEL RÍO",
              legalId: "3-002-342377",
              paymentDate: new Date().toISOString().split("T")[0],
              grossSalary: baseSalary,
              overtimeHours: extras > 0 ? Math.round(extras / 3000) : 0,
              overtimeAmount: extras,
              subtotal,
              unworkedDays: diasNo,
              unworkedDaysDeduction: diasNo * Math.round(baseSalary / 30),
              workerCCSSDeduction: ccss,
              otherDeductions: deducciones,
              netSalary,
              observations: obs,
              employerCCSSContribution: Math.round(subtotal * 0.2667),
              status: "pagado" as const,
              ccssSicereBatchId: `SICERE-IMP-${Date.now()}`,
              bankReference: `BNCR-PLAN-${Math.floor(100000 + Math.random() * 900000)}`,
            },
          ],
        };
      });

      if (onBatchImport) {
        onBatchImport("employees", newEmployees);
      }
    } else if (excelImportType === "cash_register") {
      const newPayments: PaymentRecord[] = excelPreviewRows.map((row, idx) => {
        const consecutivo = Number(row["#"]) || idx + 1;
        const name = row["NOMBRE"] || "Residente";
        const recibo =
          row["RECIBO"] || `REC-2026-${String(consecutivo).padStart(4, "0")}`;
        const lote = row["LOTE"] || `Lote ${idx + 1}`;
        const monto = Number(row["MONTO"]) || 85000;
        const mesCancelado = row["MES CANCELADO"] || "Octubre 2026";
        const fechaPago =
          row["FECHA DE PAGO"] || new Date().toISOString().split("T")[0];
        const oficial =
          row["OFICIAL QUE RECIBIO EL PAGO"] || "Don Rodrigo Alvarado";
        const caseta = row["CASETA #"] || "Caseta Principal #1";

        return {
          id: `PAY-IMP-${Date.now()}-${idx}`,
          consecutiveIndex: consecutivo,
          receiptNumber: recibo,
          unitId: `unit-${lote.replace(/\D/g, "") || idx + 1}`,
          unitNumber: lote.includes("Filial")
            ? lote
            : `Filial #${lote.replace(/\D/g, "") || idx + 1}`,
          lote,
          payerName: name,
          payerEmail: `${name.toLowerCase().replace(/\s+/g, "")}@ejemplo.cr`,
          amount: monto,
          method: "cash" as const,
          reference: recibo,
          date: fechaPago,
          concept: `Cancelación Cuota ${mesCancelado}`,
          quotaMonth: mesCancelado,
          officerName: oficial,
          boothNumber: caseta,
          status: "applied" as const,
          validatedAt: fechaPago,
          validatedBy: oficial,
        };
      });

      if (onBatchImport) {
        onBatchImport("payments", newPayments);
      }
    } else {
      const newUnits: Unit[] = excelPreviewRows.map((row, idx) => {
        const filial = row["FILIAL"] || row["Filial"] || `Filial #${idx + 10}`;
        const owner = row["PROPIETARIO"] || row["Propietario"] || "Propietario";
        const phone = row["TELEFONO"] || "+506 8800-0000";
        const email = row["CORREO"] || "correo@ejemplo.cr";
        const cuota = Number(row["CUOTA"]) || 85000;
        const saldo = Number(row["SALDO"]) || 0;
        const residencyDuration = row["TIEMPO_RESIDENCIA"] || "2 años";
        const hijosCount = Number(row["HIJOS"]) || 0;
        const hijosDetalle = row["DETALLE_HIJOS"] || "";
        const perrosCount = Number(row["PERROS"]) || 0;
        const perrosDetalle = row["DETALLE_PERROS"] || "";
        const gatosCount = Number(row["GATOS"]) || 0;
        const placas = row["PLACAS"] || "";

        return {
          id: `unit-imp-${Date.now()}-${idx}`,
          number: filial,
          section: row["SECTOR"] || "Sector Los Pinos",
          ownerName: owner,
          ownerPhone: phone,
          ownerEmail: email,
          areaM2: 180,
          participationPercentage: 2.1,
          monthlyQuota: cuota,
          currentBalance: saldo,
          arrearsStatus:
            saldo > 0 ? ("late_30" as const) : ("up_to_date" as const),
          hasChildren: hijosCount > 0,
          hasPets: perrosCount > 0 || gatosCount > 0,
          residents: [
            {
              id: `res-imp-${idx}-1`,
              name: owner,
              phone,
              email,
              relationship: "Propietario Principal" as const,
              residencyDuration,
              childrenCount: hijosCount,
              childrenDetails: hijosDetalle,
              dogsCount: perrosCount,
              dogsDetails: perrosDetalle,
              catsCount: gatosCount,
              vehiclesCount: placas ? 1 : 0,
              vehiclesPlates: placas,
            },
          ],
        };
      });

      if (onBatchImport) {
        onBatchImport("units", newUnits);
      }
    }

    setExcelImportSuccess(
      `¡Se importaron ${excelPreviewRows.length} registros con éxito en la base de datos!`,
    );
    setExcelPreviewRows([]);
    setExcelFileName("");
    setTimeout(() => setExcelImportSuccess(null), 5000);
  };

  const handleSaveResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentModalUnit || !residentForm.name) return;

    onAddResidentToUnit(residentModalUnit.id, residentForm);
    setResidentModalUnit(null);
    setResidentForm({
      name: "",
      phone: "+506 ",
      email: "",
      relationship: "Propietario Principal",
      residencyDuration: "1 año",
      dogsCount: 0,
      dogsDetails: "",
      childrenCount: 0,
      vehiclesCount: 1,
      vehiclesPlates: "",
      notes: "",
    });
  };

  // Handlers for Payment Agreements
  const handleOpenAgreementModal = (unit: Unit) => {
    setAgreementModalUnit(unit);
    setAgreedAmount(unit.currentBalance);
    setInstallmentsCount(
      unit.paymentAgreement ? unit.paymentAgreement.installmentsCount : 6,
    );
    setAgreementNotes(
      unit.paymentAgreement
        ? unit.paymentAgreement.notes
        : "Arreglo de pago por cuotas vencidas.",
    );
    setAgreementActa(
      unit.paymentAgreement?.boardApprovalActa || "Acta JD-2026-20",
    );
  };

  const handleSaveAgreement = () => {
    if (!agreementModalUnit) return;
    const monthlyAmount = Math.round(agreedAmount / (installmentsCount || 1));
    const newAgreement: PaymentAgreement = {
      id:
        agreementModalUnit.paymentAgreement?.id ||
        `AP-2026-${Math.floor(100 + Math.random() * 900)}`,
      active: true,
      totalAgreedAmount: agreedAmount,
      installmentsCount: installmentsCount,
      installmentsPaid:
        agreementModalUnit.paymentAgreement?.installmentsPaid || 0,
      monthlyInstallmentAmount: monthlyAmount,
      startDate: new Date().toISOString().split("T")[0],
      nextDueDate: "2026-11-05",
      notes: agreementNotes,
      boardApprovalActa: agreementActa,
      status: "al_dia",
    };
    onUpdatePaymentAgreement(agreementModalUnit.id, newAgreement);
    setAgreementModalUnit(null);
  };

  // Blog Publishing & Editing
  const handleEditNews = (item: NewsAnnouncement) => {
    setEditingNews(item);
    setNewsTitle(item.title);
    setNewsCategory(item.category);
    setNewsSummary(item.summary);
    setNewsContent(item.content);
    const photosList =
      item.photos && item.photos.length > 0
        ? item.photos
        : item.image
          ? [item.image]
          : [];
    setNewsPhotos(photosList);
    setNewsImage(item.image || photosList[0] || "");
    setNewsUrgent(!!item.urgent);
    setNewsTags(item.tags || ["Comunidad"]);
    setNewsVideoUrl(item.videoUrl || "");
    setPublishScheduleDate(
      item.publishScheduleDate || new Date().toISOString().slice(0, 16),
    );
    setUnpublishDate(item.unpublishDate || "2026-12-31T23:59");
    setNewsSubTab("editor");
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsSummary) return;

    const validatedPhotos = newsPhotos.slice(0, 10);
    const primaryImage =
      newsImage ||
      validatedPhotos[0] ||
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80";

    if (editingNews) {
      onUpdateNews({
        ...editingNews,
        title: newsTitle,
        category: newsCategory,
        summary: newsSummary,
        content: newsContent || newsSummary,
        urgent: newsUrgent,
        image: primaryImage,
        photos: validatedPhotos,
        tags: newsTags,
        videoUrl: newsVideoUrl,
        publishScheduleDate,
        unpublishDate,
      });
      setEditingNews(null);
    } else {
      onPublishNews({
        title: newsTitle,
        category: newsCategory,
        author: currentUser.name || "Administración General",
        summary: newsSummary,
        content: newsContent || newsSummary,
        urgent: newsUrgent,
        image: primaryImage,
        photos: validatedPhotos,
        readTime: "3 min lectura",
        tags: newsTags,
        videoUrl: newsVideoUrl,
        status: "active",
        publishScheduleDate,
        unpublishDate,
        viewsCount: 1,
        reachPercentage: 10,
      });
    }

    setPublishSuccess(true);
    setNewsTitle("");
    setNewsSummary("");
    setNewsContent("");
    setNewsVideoUrl("");
    setNewsPhotos([]);
    setNewsSubTab("manager");
    setTimeout(() => setPublishSuccess(false), 3000);
  };

  // SICERE File Export Simulation
  const handleExportSICERE = () => {
    const sicereContent = `SICERE|CCSS|PATRONO:3-002-897451|PINAR_DEL_RIO|PERIODO:2026-09
${employees
  .map(
    (e) =>
      `EMP|${e.idNumber}|${e.ccssInsuranceNumber}|${e.name}|${e.baseSalary}|IBAN:${e.iban}|BANCO:${e.bankName || "BNCR"}|PATR:${Math.round(
        e.baseSalary * 0.2667,
      )}|OBR:${Math.round(e.baseSalary * 0.0984)}`,
  )
  .join("\n")}
FIN|TOTAL_BRUTO:${currentTotalGrossPayroll}|TOTAL_EMPLEADOS:${employees.length}`;

    const blob = new Blob([sicereContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SICERE_CCSS_3002897451_2026_09.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Liquidation Calculations (Código de Trabajo Costa Rica)
  const calculateLiquidation = (emp: Employee) => {
    const dailySalary = emp.baseSalary / 30;
    const monthsWorked = 24; // Estimado según fecha
    const preavisoDays = liquidationType === "con_responsabilidad" ? 30 : 0;
    const preavisoAmount = Math.round(preavisoDays * dailySalary);

    // Cesantía (aprox 20 días por año)
    const cesantiaDays = liquidationType === "con_responsabilidad" ? 40 : 0;
    const cesantiaAmount = Math.round(cesantiaDays * dailySalary);

    // Vacaciones no gozadas
    const vacationAmount = Math.round(vacationPendingDays * dailySalary);

    // Aguinaldo proporcional (ej: 10 meses / 12)
    const aguinaldoAmount = Math.round((emp.baseSalary * 10) / 12);

    const totalLiquidation =
      preavisoAmount + cesantiaAmount + vacationAmount + aguinaldoAmount;

    return {
      dailySalary: Math.round(dailySalary),
      preavisoDays,
      preavisoAmount,
      cesantiaDays,
      cesantiaAmount,
      vacationPendingDays,
      vacationAmount,
      aguinaldoAmount,
      totalLiquidation,
    };
  };

  const filteredUnits = units.filter(
    (u) =>
      u.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.section.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white px-6 py-6 border-b border-emerald-800 shadow-md">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-400 text-emerald-950 flex items-center justify-center font-black text-xl shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Panel de Administración • Pinar del Río
                </h1>
                <span className="bg-lime-400/20 text-lime-300 border border-lime-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Gestión Condominal Ley 7933
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Sesión:{" "}
                <span className="font-semibold text-white">
                  {currentUser.name}
                </span>{" "}
                ({currentUser.roleTitle})
              </p>
            </div>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-emerald-950/70 border border-emerald-700/60 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-300" />
              <span>
                <strong className="text-white">{units.length}</strong> Filiales
                registradas
              </span>
            </div>
            <div className="bg-emerald-950/70 border border-emerald-700/60 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                <strong className="text-white">{pendingPayments.length}</strong>{" "}
                Pagos por conciliar
              </span>
            </div>
            <div className="bg-emerald-950/70 border border-emerald-700/60 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <Wrench className="w-4 h-4 text-lime-400" />
              <span>
                <strong className="text-white">{openTickets.length}</strong>{" "}
                Incidentes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Menu + Content Stage */}
      <div className="max-w-[1440px] mx-auto w-full flex-1 flex flex-col lg:flex-row p-4 sm:p-6 gap-6">
        {/* ========================================================= */}
        {/* MENÚ LATERAL DE NAVEGACIÓN (SIDEBAR)                      */}
        {/* ========================================================= */}
        <aside className="lg:w-72 shrink-0 space-y-4">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-md space-y-1.5 sticky top-24">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1 block">
              Módulos Principales
            </span>

            {/* Item 1: Gestión de Filiales & Residentes */}
            <button
              onClick={() => setActiveTab("units_residents")}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "units_residents"
                  ? "bg-emerald-800 text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-emerald-400" />
                <span>Gestión de Filiales & Residentes</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === "units_residents"
                    ? "bg-emerald-950 text-lime-300"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {units.length}
              </span>
            </button>

            {/* Item 2: Tesorería, Caja & Recaudación */}
            <button
              onClick={() => setActiveTab("collection_payments")}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "collection_payments"
                  ? "bg-emerald-800 text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Tesorería, Caja & Recaudación</span>
              </div>
              {pendingPayments.length > 0 && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full animate-pulse">
                  {pendingPayments.length}
                </span>
              )}
            </button>

            {/* Item 3: Control de Incidentes & Mantenimiento */}
            <button
              onClick={() => setActiveTab("tickets")}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "tickets"
                  ? "bg-emerald-800 text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <span>Incidentes & Mantenimiento</span>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {tickets.length}
              </span>
            </button>

            {/* Item 4: Publicar Comunicado (Blog, Cronograma & Analytics) */}
            <button
              onClick={() => setActiveTab("announcements")}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "announcements"
                  ? "bg-emerald-800 text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Comunicados (Blog & Analytics)</span>
              </div>
              <span className="text-[10px] font-bold bg-lime-100 text-lime-800 px-1.5 py-0.5 rounded">
                {news.length}
              </span>
            </button>

            {/* Item 5: Flujo de Caja & Simulador Financiero */}
            <button
              onClick={() => setActiveTab("cashflow_projections")}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "cashflow_projections"
                  ? "bg-emerald-800 text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Flujo de Caja & Simulador</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Simulador
              </span>
            </button>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                Recursos Humanos & CCSS
              </span>

              {/* Item 6: Planilla, Vacaciones & Liquidaciones */}
              <button
                onClick={() => setActiveTab("payroll")}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "payroll"
                    ? "bg-emerald-800 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Landmark className="w-4 h-4 text-emerald-400" />
                  <span>Planilla, Vacaciones & Liquidación</span>
                </div>
                <span className="text-[9px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                  CCSS
                </span>
              </button>

              {/* Item 7: Gestor de Horarios & Turnos */}
              <button
                onClick={() => setActiveTab("schedules")}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "schedules"
                    ? "bg-emerald-800 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Horarios, Turnos & Comprobantes</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {employees.length}
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA ACTIVA                  */}
        {/* ========================================================= */}
        <main className="flex-1 space-y-6">
          {/* ========================================================= */}
          {/* TAB 1: GESTIÓN DE FILIALES & RESIDENTES                   */}
          {/* ========================================================= */}
          {activeTab === "units_residents" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Padrón de Filiales & Censo de Residentes
                    </h3>
                    <p className="text-xs text-slate-500">
                      Control de fincas filiales, propietarios, tiempo de
                      residencia, hijos, mascotas y vehículos registrados.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setQuotaApplyMode("all");
                        setQuotaAmount(85000);
                        setQuotaDeltaPercent(0);
                        setIsQuotaModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                    >
                      <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                      <span>⚙️ Cuota Mensual: Filial o Masiva</span>
                    </button>
                    <button
                      onClick={() => handleOpenUnitModal()}
                      className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Crear Nueva Filial</span>
                    </button>
                  </div>
                </div>

                {/* Units and Residents Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {units.map((unit) => {
                    const residentsList = unit.residents || [];
                    const totalDogs = residentsList.reduce(
                      (acc, r) => acc + (r.dogsCount || 0),
                      0,
                    );
                    const totalChildren = residentsList.reduce(
                      (acc, r) => acc + (r.childrenCount || 0),
                      0,
                    );
                    const totalVehicles = residentsList.reduce(
                      (acc, r) => acc + (r.vehiclesCount || 0),
                      0,
                    );

                    return (
                      <div
                        key={unit.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-emerald-300 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-black text-slate-900">
                                {unit.number}
                              </h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {unit.section}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Propietario Registral:{" "}
                              <span className="font-bold text-slate-800">
                                {unit.ownerName}
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {unit.ownerPhone} • {unit.ownerEmail}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-slate-900 block">
                              ₡{unit.monthlyQuota.toLocaleString("es-CR")}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Cuota condominal
                            </span>
                          </div>
                        </div>

                        {/* Quick Census Indicators */}
                        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 text-[11px] font-bold text-slate-700 border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Dog className="w-3.5 h-3.5 text-amber-600" />
                            <span>
                              {totalDogs} {totalDogs === 1 ? "Perro" : "Perros"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Baby className="w-3.5 h-3.5 text-sky-600" />
                            <span>
                              {totalChildren}{" "}
                              {totalChildren === 1 ? "Hijo" : "Hijos"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-slate-600" />
                            <span>
                              {totalVehicles}{" "}
                              {totalVehicles === 1 ? "Vehículo" : "Vehículos"}
                            </span>
                          </div>
                        </div>

                        {/* Residents List */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-slate-800">
                              Residentes Habitantes ({residentsList.length})
                            </span>
                            <button
                              onClick={() => {
                                setResidentModalUnit(unit);
                                setResidentForm({
                                  name: "",
                                  phone: "+506 ",
                                  email: "",
                                  relationship: "Inquilino / Arrendatario",
                                  residencyDuration: "6 meses",
                                  dogsCount: 0,
                                  dogsDetails: "",
                                  childrenCount: 0,
                                  vehiclesCount: 1,
                                  vehiclesPlates: "",
                                  notes: "",
                                });
                              }}
                              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>+ Agregar Residente</span>
                            </button>
                          </div>

                          {residentsList.length > 0 ? (
                            <div className="space-y-1.5">
                              {residentsList.map((res) => (
                                <div
                                  key={res.id}
                                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900">
                                        {res.name}
                                      </span>
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                                        {res.relationship}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                      Vive aquí desde:{" "}
                                      <strong className="text-slate-700">
                                        {res.residencyDuration}
                                      </strong>{" "}
                                      • Tel: {res.phone}
                                    </p>
                                    {(res.dogsDetails ||
                                      res.vehiclesPlates) && (
                                      <p className="text-[10px] text-slate-400 mt-0.5">
                                        {res.dogsDetails
                                          ? `🐕 ${res.dogsDetails}`
                                          : ""}{" "}
                                        {res.vehiclesPlates
                                          ? `🚗 Placas: ${res.vehiclesPlates}`
                                          : ""}
                                      </p>
                                    )}
                                  </div>

                                  <button
                                    onClick={() =>
                                      onRemoveResidentFromUnit(unit.id, res.id)
                                    }
                                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                    title="Remover residente"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">
                              No hay residentes adicionales registrados en esta
                              filial.
                            </p>
                          )}
                        </div>

                        {/* Unit Action Bar */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-slate-400">
                            Área: {unit.areaM2} m² (
                            {unit.participationPercentage}%)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setQuotaApplyMode("unit");
                                setQuotaSelectedUnitId(unit.id);
                                setQuotaAmount(unit.monthlyQuota);
                                setIsQuotaModalOpen(true);
                              }}
                              className="text-emerald-800 hover:underline font-bold text-[11px] cursor-pointer"
                            >
                              Ajustar Cuota
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              onClick={() => handleOpenUnitModal(unit)}
                              className="text-slate-700 hover:text-emerald-800 hover:underline font-semibold text-[11px] cursor-pointer"
                            >
                              Editar Filial
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MERGED: COBRANZA, PAGOS & CONCILIACIÓN             */}
          {/* ========================================================= */}
          {activeTab === "collection_payments" && (
            <div className="space-y-6">
              {/* Merged Navigation Subtabs */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setCollectionSubTab("receivables")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      collectionSubTab === "receivables"
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Cartera & Cuentas por Cobrar
                  </button>
                  <button
                    onClick={() => setCollectionSubTab("cash_register")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      collectionSubTab === "cash_register"
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Libro de Caja & Recibos de Caseta</span>
                  </button>
                  <button
                    onClick={() => setCollectionSubTab("payments")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      collectionSubTab === "payments"
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>Conciliación de Pagos & SINPE</span>
                    {pendingPayments.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-emerald-950 font-black">
                        {pendingPayments.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setCollectionSubTab("excel_import")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      collectionSubTab === "excel_import"
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Importador de Excels (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => setCollectionSubTab("summary")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      collectionSubTab === "summary"
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Resumen Financiero
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setQuotaApplyMode("all");
                      setQuotaAmount(85000);
                      setQuotaDeltaPercent(0);
                      setIsQuotaModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                    title="Configurar cuota mensual por filial o masivamente"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ajustar Cuotas</span>
                  </button>

                  <button
                    onClick={() => {
                      const firstUnit = units[0];
                      if (firstUnit) {
                        setCashReceiptUnitId(firstUnit.id);
                        setCashReceiptPayerName(firstUnit.ownerName);
                        setCashReceiptAmount(firstUnit.monthlyQuota);
                      }
                      setIsCashReceiptModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Cobro en Caseta</span>
                  </button>
                </div>
              </div>

              {/* Subtab 1: Receivables */}
              {collectionSubTab === "receivables" && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Cuentas por Cobrar, Meses Atrasados & Arreglos de Pago
                      </h3>
                      <p className="text-xs text-slate-500">
                        Identificación exacta de meses vencidos y convenios de
                        pago autorizados por Junta Directiva.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar filial o propietario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3.5 pl-5">Filial & Propietario</th>
                          <th className="p-3.5">Saldo Pendiente</th>
                          <th className="p-3.5">Meses de Atraso</th>
                          <th className="p-3.5">Arreglo de Pago</th>
                          <th className="p-3.5">Último Pago</th>
                          <th className="p-3.5 pr-5 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUnits.map((u) => {
                          const hasDebt = u.currentBalance > 0;
                          const hasAgreement = !!u.paymentAgreement?.active;
                          return (
                            <tr
                              key={u.id}
                              className="hover:bg-slate-50/60 transition-colors"
                            >
                              <td className="p-3.5 pl-5">
                                <span className="font-extrabold text-slate-900 block text-sm">
                                  {u.number}
                                </span>
                                <span className="text-slate-600 block">
                                  {u.ownerName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {u.section}
                                </span>
                              </td>

                              <td className="p-3.5 font-mono">
                                {hasDebt ? (
                                  <span className="font-extrabold text-rose-700 text-sm block">
                                    ₡{u.currentBalance.toLocaleString("es-CR")}
                                  </span>
                                ) : (
                                  <span className="font-bold text-emerald-700">
                                    ₡0 (Al Día)
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">
                                  Cuota: ₡
                                  {u.monthlyQuota.toLocaleString("es-CR")}
                                </span>
                              </td>

                              <td className="p-3.5">
                                {u.overdueMonths &&
                                u.overdueMonths.length > 0 ? (
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap gap-1">
                                      {u.overdueMonths.map((m, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200"
                                        >
                                          {m}
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-[10px] text-rose-600 font-semibold block">
                                      {u.overdueMonths.length}{" "}
                                      {u.overdueMonths.length === 1
                                        ? "mes"
                                        : "meses"}{" "}
                                      en mora
                                    </span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Al Día</span>
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5">
                                {hasAgreement ? (
                                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                                      <span>Arreglo Vigente</span>
                                    </div>
                                    <p className="text-[11px] text-emerald-800 mt-0.5">
                                      Cuota{" "}
                                      <strong>
                                        {u.paymentAgreement?.installmentsPaid}/
                                        {u.paymentAgreement?.installmentsCount}
                                      </strong>{" "}
                                      (+₡
                                      {u.paymentAgreement?.monthlyInstallmentAmount.toLocaleString(
                                        "es-CR",
                                      )}
                                      /mes)
                                    </p>
                                    <p className="text-[10px] text-emerald-600 font-mono">
                                      {u.paymentAgreement?.boardApprovalActa}
                                    </p>
                                  </div>
                                ) : hasDebt ? (
                                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-semibold block text-center">
                                    Sin Arreglo
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">
                                    —
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                                {u.lastPaymentDate || "Sin registro"}
                              </td>

                              <td className="p-3.5 pr-5 text-right">
                                <button
                                  onClick={() => handleOpenAgreementModal(u)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-800 hover:text-white text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                                >
                                  {hasAgreement
                                    ? "Modificar Arreglo"
                                    : "Hacer Arreglo"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subtab 2: Payments & Reconciliation */}
              {collectionSubTab === "payments" && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Pagos Realizados & Conciliación Bancaria
                    </h3>
                    <p className="text-xs text-slate-500">
                      Detalle de quién pagó, para cuál cuota aplicó el pago y
                      conciliación contra estados de cuenta bancarios.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3.5 pl-5">Quién Pagó & Filial</th>
                          <th className="p-3.5">Cuota Aplicada</th>
                          <th className="p-3.5">Monto</th>
                          <th className="p-3.5">Medio & Referencia</th>
                          <th className="p-3.5">Fecha</th>
                          <th className="p-3.5">Estado</th>
                          <th className="p-3.5 pr-5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map((p) => (
                          <tr
                            key={p.id}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="p-3.5 pl-5">
                              <span className="font-extrabold text-slate-900 block text-sm">
                                {p.payerName}
                              </span>
                              <span className="text-emerald-800 font-bold text-[11px]">
                                {p.unitNumber}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-bold text-[11px] border border-emerald-200">
                                {p.quotaMonth || p.concept}
                              </span>
                            </td>

                            <td className="p-3.5 font-mono font-black text-slate-900 text-sm">
                              ₡{p.amount.toLocaleString("es-CR")}
                            </td>

                            <td className="p-3.5">
                              <span className="font-semibold text-slate-800 uppercase text-[11px] block">
                                {p.method === "sinpe"
                                  ? "SINPE Móvil"
                                  : p.bankName || "Transferencia"}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 select-all">
                                {p.reference}
                              </span>
                            </td>

                            <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                              {p.date}
                            </td>

                            <td className="p-3.5">
                              {p.status === "applied" ||
                              p.status === "validated" ? (
                                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Conciliado</span>
                                </span>
                              ) : p.status === "rejected" ? (
                                <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                                  <XCircle className="w-3 h-3" />
                                  <span>Rechazado</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-bold text-[10px] animate-pulse">
                                  <Clock className="w-3 h-3" />
                                  <span>Pendiente</span>
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 pr-5 text-right space-x-1.5">
                              {p.status === "pending_validation" ||
                              p.status === "reported" ? (
                                <>
                                  <button
                                    onClick={() => onValidatePayment(p.id)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs cursor-pointer shadow-xs"
                                  >
                                    Validar
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectModalPayment(p);
                                      setRejectionReason("");
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs cursor-pointer"
                                  >
                                    Rechazar
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {p.validatedBy
                                    ? `Validó: ${p.validatedBy.split(" ")[0]}`
                                    : "Completado"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subtab: Libro de Caja & Control de Recibos de Caseta (2026 INGRESOS EGRESOS o1-RuthlePC.xlsx) */}
              {collectionSubTab === "cash_register" && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-[10px]">
                          2026 INGRESOS EGRESOS o1-RuthlePC.xlsx
                        </span>
                        <span className="text-xs text-slate-400">
                          • Libro de Caja Oficial
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        Control de Recibos Cancelados en Efectivo & Caseta
                      </h3>
                      <p className="text-xs text-slate-500">
                        Registro cronológico por Oficial y Puesto de Caseta con
                        consecutivo interno y recibo digital inmediato.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          handleDownloadExcelTemplate("cash_register")
                        }
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                        title="Descargar estructura idéntica al archivo Excel del cliente"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Descargar Plantilla Excel</span>
                      </button>

                      <button
                        onClick={() => {
                          const firstUnit = units[0];
                          if (firstUnit) {
                            setCashReceiptUnitId(firstUnit.id);
                            setCashReceiptPayerName(firstUnit.ownerName);
                            setCashReceiptAmount(firstUnit.monthlyQuota);
                          }
                          setIsCashReceiptModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>+ Emitir Recibo de Caseta</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Cash Register Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                          Total Recaudado en Caseta
                        </span>
                        <span className="font-mono text-lg font-black text-emerald-950">
                          ₡
                          {payments
                            .filter((p) => p.status === "applied")
                            .reduce((acc, p) => acc + p.amount, 0)
                            .toLocaleString("es-CR")}
                        </span>
                      </div>
                      <Landmark className="w-6 h-6 text-emerald-700" />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-sky-800 uppercase block">
                          Recibos Emitidos en el Período
                        </span>
                        <span className="font-mono text-lg font-black text-sky-950">
                          {payments.length} comprobantes
                        </span>
                      </div>
                      <Receipt className="w-6 h-6 text-sky-700" />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase block">
                          Puestos de Cobro Activos
                        </span>
                        <span className="font-bold text-slate-900">
                          Caseta #1 (Principal) & #2 (Norte)
                        </span>
                      </div>
                      <ShieldCheck className="w-6 h-6 text-slate-600" />
                    </div>
                  </div>

                  {/* Cash Register Table matching exact Excel columns */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                        <tr>
                          <th className="p-3 pl-4"># (Consecutivo)</th>
                          <th className="p-3">NOMBRE (Condómino)</th>
                          <th className="p-3">RECIBO #</th>
                          <th className="p-3">LOTE / FILIAL</th>
                          <th className="p-3">MONTO (₡)</th>
                          <th className="p-3">MES CANCELADO</th>
                          <th className="p-3">FECHA DE PAGO</th>
                          <th className="p-3">OFICIAL QUE RECIBIÓ</th>
                          <th className="p-3">CASETA #</th>
                          <th className="p-3 pr-4 text-right">
                            Recibo Digital
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map((p, idx) => {
                          const consecutivo = p.consecutiveIndex || idx + 1;
                          const reciboNum =
                            p.receiptNumber ||
                            `REC-2026-${String(consecutivo).padStart(4, "0")}`;
                          const lote = p.lote || p.unitNumber;
                          const mesCancelado = p.quotaMonth || "Octubre 2026";
                          const oficial =
                            p.officerName || "Don Rodrigo Alvarado";
                          const caseta = p.boothNumber || "Caseta Principal #1";

                          return (
                            <tr
                              key={p.id}
                              className="hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="p-3 pl-4 font-mono font-bold text-slate-500">
                                #{consecutivo}
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">
                                  {p.payerName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {p.payerEmail}
                                </span>
                              </td>
                              <td className="p-3 font-mono font-extrabold text-emerald-800">
                                {reciboNum}
                              </td>
                              <td className="p-3 font-bold text-slate-800">
                                {lote}
                              </td>
                              <td className="p-3 font-mono font-black text-slate-950 text-sm">
                                ₡{p.amount.toLocaleString("es-CR")}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                                  {mesCancelado}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-600">
                                {p.date}
                              </td>
                              <td className="p-3 text-slate-700 font-medium">
                                {oficial}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                  {caseta}
                                </span>
                              </td>
                              <td className="p-3 pr-4 text-right">
                                <button
                                  onClick={() => setLastIssuedReceipt(p)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                                >
                                  Ver Comprobante
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subtab: Importador Universal de Libros Excel (.xlsx) */}
              {collectionSubTab === "excel_import" && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                      <h3 className="text-base font-black text-slate-900">
                        Centro de Importación de Libros Excel (.xlsx / .csv)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Carga directamente los Excels utilizados en la
                      administración para poblar y actualizar la base de datos
                      viva sin digitar a mano.
                    </p>
                  </div>

                  {/* 3 Client Excels Cards Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Excel 1: Planilla Salarios Mensuales */}
                    <div
                      onClick={() => {
                        setExcelImportType("payroll");
                        setExcelPreviewRows([]);
                        setExcelFileName("");
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                        excelImportType === "payroll"
                          ? "border-emerald-700 bg-emerald-50/40 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          1. Motor de Nómina
                        </span>
                        <h4 className="font-black text-sm text-slate-900 mt-2">
                          2026- PLANILLA SALARIOS MENSUALES .xlsx
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Hojas mensuales (ENERO, FEBRERO...), cálculos de horas
                          extras, aguinaldos y deducciones C.C.S.S. a partir de
                          la fila 7.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadExcelTemplate("payroll");
                        }}
                        className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1 pt-2 border-t border-slate-100"
                      >
                        <Download className="w-3 h-3" />
                        <span>Descargar Formato de Muestra</span>
                      </button>
                    </div>

                    {/* Excel 2: Ingresos y Egresos / Libro de Caja */}
                    <div
                      onClick={() => {
                        setExcelImportType("cash_register");
                        setExcelPreviewRows([]);
                        setExcelFileName("");
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                        excelImportType === "cash_register"
                          ? "border-emerald-700 bg-emerald-50/40 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                          2. Libro de Caja
                        </span>
                        <h4 className="font-black text-sm text-slate-900 mt-2">
                          2026 INGRESOS EGRESOS o1-RuthlePC.xlsx
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Control de recibos cancelados en caseta: consecutivo,
                          nombre, recibo, lote, monto, mes cancelado, fecha,
                          oficial y caseta.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadExcelTemplate("cash_register");
                        }}
                        className="text-[11px] font-bold text-sky-800 hover:underline flex items-center gap-1 pt-2 border-t border-slate-100"
                      >
                        <Download className="w-3 h-3" />
                        <span>Descargar Formato de Muestra</span>
                      </button>
                    </div>

                    {/* Excel 3: Padrón de Filiales y Residentes */}
                    <div
                      onClick={() => {
                        setExcelImportType("units");
                        setExcelPreviewRows([]);
                        setExcelFileName("");
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                        excelImportType === "units"
                          ? "border-emerald-700 bg-emerald-50/40 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                          3. Censo de Filiales
                        </span>
                        <h4 className="font-black text-sm text-slate-900 mt-2">
                          2026- FILIALES Y RESIDENTES .xlsx
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Padrón de fincas filiales con contactos de emergencia,
                          hijos, mascotas (perros/gatos), vehículos y cuotas.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadExcelTemplate("units");
                        }}
                        className="text-[11px] font-bold text-purple-800 hover:underline flex items-center gap-1 pt-2 border-t border-slate-100"
                      >
                        <Download className="w-3 h-3" />
                        <span>Descargar Formato de Muestra</span>
                      </button>
                    </div>
                  </div>

                  {/* File Upload Drop Area */}
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-3">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-700 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Selecciona o arrastra el archivo Excel (.xlsx, .xls o
                        .csv)
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        El motor inteligente auto-detecta la fila de inicio
                        (fila 5 o 7) y asocia las columnas relacionalmente.
                      </p>
                    </div>

                    <input
                      type="file"
                      id="excelFileInput"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="excelFileInput"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {excelFileName
                          ? `Archivo: ${excelFileName}`
                          : "Seleccionar Archivo Excel"}
                      </span>
                    </label>
                  </div>

                  {/* Preview of Parsed Rows */}
                  {excelPreviewRows.length > 0 && (
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">
                            Previsualización de Registros Detectados (
                            {excelPreviewRows.length} filas)
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Revisa los datos mapeados antes de confirmar la
                            carga a la base de datos viva.
                          </p>
                        </div>

                        <button
                          onClick={handleConfirmExcelImport}
                          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4 text-lime-300" />
                          <span>Confirmar e Importar a Base de Datos</span>
                        </button>
                      </div>

                      <div className="max-h-72 overflow-y-auto overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                            <tr>
                              {Object.keys(excelPreviewRows[0] || {}).map(
                                (col) => (
                                  <th
                                    key={col}
                                    className="p-2.5 pl-3 whitespace-nowrap"
                                  >
                                    {col}
                                  </th>
                                ),
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-800 bg-white">
                            {excelPreviewRows.slice(0, 15).map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                {Object.values(row).map((val: any, cidx) => (
                                  <td
                                    key={cidx}
                                    className="p-2.5 pl-3 whitespace-nowrap"
                                  >
                                    {String(val ?? "—")}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {excelPreviewRows.length > 15 && (
                        <p className="text-[10px] text-slate-400 italic text-right">
                          Mostrando las primeras 15 filas de{" "}
                          {excelPreviewRows.length} en total.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Subtab 3: Unified Summary */}
              {collectionSubTab === "summary" && (
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-slate-900">
                    Resumen Financiero Unificado de Cobranza & Cartera
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] font-bold uppercase text-emerald-800">
                        TOTAL FACTURADO MES
                      </span>
                      <p className="text-xl font-mono font-black text-emerald-950 mt-1">
                        ₡{totalMonthlyTarget.toLocaleString("es-CR")}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                      <span className="text-[10px] font-bold uppercase text-sky-800">
                        TOTAL RECAUDADO
                      </span>
                      <p className="text-xl font-mono font-black text-sky-950 mt-1">
                        ₡{appliedPaymentsTotal.toLocaleString("es-CR")}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                      <span className="text-[10px] font-bold uppercase text-rose-800">
                        TOTAL CARTERA EN MORA
                      </span>
                      <p className="text-xl font-mono font-black text-rose-950 mt-1">
                        ₡{totalOverdue.toLocaleString("es-CR")}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                      <span className="text-[10px] font-bold uppercase text-purple-800">
                        EN ARREGLOS DE PAGO
                      </span>
                      <p className="text-xl font-mono font-black text-purple-950 mt-1">
                        ₡
                        {units
                          .filter((u) => u.paymentAgreement?.active)
                          .reduce(
                            (acc, u) =>
                              acc +
                              (u.paymentAgreement?.totalAgreedAmount || 0),
                            0,
                          )
                          .toLocaleString("es-CR")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CONTROL DE INCIDENTES & MANTENIMIENTO (CRUD)       */}
          {/* ========================================================= */}
          {activeTab === "tickets" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Control Integral de Incidentes & Mantenimiento
                    </h3>
                    <p className="text-xs text-slate-500">
                      Gestión de incidentes con costos, motivos, aprobación de
                      junta directiva y opción de comunicado público.
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenTicketModal()}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Incidente / Mantenimiento</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 pl-5">Fecha & Título</th>
                        <th className="p-3.5">Motivo / Justificación</th>
                        <th className="p-3.5">Costo (₡)</th>
                        <th className="p-3.5">Aprobación Junta</th>
                        <th className="p-3.5">Resultado</th>
                        <th className="p-3.5">Comunicado Público</th>
                        <th className="p-3.5 pr-5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tickets.map((t) => (
                        <tr
                          key={t.id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="p-3.5 pl-5">
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {t.date || t.createdAt} • {t.category}
                            </span>
                            <span className="font-extrabold text-slate-900 text-sm block">
                              {t.title}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {t.location} •{" "}
                              {t.assignedVendor || "Sin proveedor asignado"}
                            </span>
                          </td>

                          <td className="p-3.5 max-w-xs">
                            <p className="text-slate-700 text-xs line-clamp-2">
                              {t.motive || t.description}
                            </p>
                          </td>

                          <td className="p-3.5 font-mono font-black text-slate-900 text-sm">
                            ₡
                            {(t.cost || t.costEstimated || 0).toLocaleString(
                              "es-CR",
                            )}
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold block w-fit ${
                                t.boardApproval === "Aprobado"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : t.boardApproval === "Rechazado"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {t.boardApproval || "Pendiente"}
                            </span>
                            {t.boardActaNumber && (
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                {t.boardActaNumber}
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                              {t.result || "En Proceso"}
                            </span>
                          </td>

                          <td className="p-3.5">
                            {t.publicNoticeCreated ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Publicado</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Interno
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 pr-5 text-right space-x-1">
                            <button
                              onClick={() => handleOpenTicketModal(t)}
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              title="Modificar incidente"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTicket(t.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="Quitar / Eliminar incidente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: COMUNICADOS (BLOG, CRONOGRAMA & ANALYTICS)         */}
          {/* ========================================================= */}
          {activeTab === "announcements" && (
            <div className="space-y-6">
              {/* Announcements Subtabs */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewsSubTab("manager")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      newsSubTab === "manager"
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Gestor de Comunicados ({news.length})
                  </button>

                  <button
                    onClick={() => {
                      setEditingNews(null);
                      setNewsTitle("");
                      setNewsSummary("");
                      setNewsContent("");
                      setNewsSubTab("editor");
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      newsSubTab === "editor"
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {editingNews
                      ? "Editar Comunicado"
                      : "+ Redactar Comunicado"}
                  </button>

                  <button
                    onClick={() => setNewsSubTab("schedule")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      newsSubTab === "schedule"
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <CalendarRange className="w-3.5 h-3.5 text-lime-400" />
                    <span>Cronograma Automático</span>
                  </button>

                  <button
                    onClick={() => setNewsSubTab("analytics")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      newsSubTab === "analytics"
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Análisis de Visualizaciones</span>
                  </button>
                </div>
              </div>

              {/* Subtab 1: Manager List */}
              {newsSubTab === "manager" && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Comunicados Oficiales Activos & Programados
                      </h3>
                      <p className="text-xs text-slate-500">
                        Control de publicaciones visibles para los residentes en
                        el carrusel y en el blog.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingNews(null);
                        setNewsSubTab("editor");
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                    >
                      + Redactar Nuevo
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {news.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="flex gap-4 items-start">
                          <img
                            src={
                              item.image ||
                              "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80"
                            }
                            alt={item.title}
                            className="w-20 h-16 rounded-xl object-cover shrink-0 bg-slate-900 shadow-2xs"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                                {item.category}
                              </span>
                              {item.urgent && (
                                <span className="text-[9px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                                  URGENTE
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.date}
                              </span>
                            </div>
                            <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {item.summary}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
                              <span>👁️ {item.viewsCount || 85} vistas</span>
                              <span>
                                📈 {item.reachPercentage || 74}% alcance
                                filiales
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEditNews(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => onDeleteNews(item.id)}
                            className="p-1.5 rounded-xl hover:bg-rose-100 text-rose-600 cursor-pointer"
                            title="Eliminar comunicado"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 2: Editor */}
              {newsSubTab === "editor" && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {editingNews
                        ? "Modificar Comunicado"
                        : "Redactar Nuevo Comunicado Tipo Blog"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Publicación con soporte de tags, videos, fotos y
                      programación de fechas.
                    </p>
                  </div>

                  <form onSubmit={handleSaveNews} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">
                          Título
                        </label>
                        <input
                          type="text"
                          required
                          value={newsTitle}
                          onChange={(e) => setNewsTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Categoría
                        </label>
                        <select
                          value={newsCategory}
                          onChange={(e) =>
                            setNewsCategory(e.target.value as any)
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        >
                          <option value="comunicado">Comunicado General</option>
                          <option value="mantenimiento">Mantenimiento</option>
                          <option value="asamblea">Asamblea</option>
                          <option value="evento">Evento</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Resumen para Carrusel
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={newsSummary}
                        onChange={(e) => setNewsSummary(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    {/* Bloque de Imágenes del Blog (Permite 1 a 10 imágenes) */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-emerald-700" />
                            <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                              Galería de Imágenes del Comunicado
                            </label>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Sube o añade de 1 a 10 imágenes para ilustrar el
                            blog (máximo 10 por publicación).
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                            newsPhotos.length >= 10
                              ? "bg-rose-100 text-rose-800"
                              : newsPhotos.length > 0
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {newsPhotos.length} / 10 imágenes
                        </span>
                      </div>

                      {/* Input de URL & Input de Archivo */}
                      {newsPhotos.length < 10 ? (
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="url"
                              placeholder="Pegar enlace de imagen (https://...)"
                              value={newPhotoUrlInput}
                              onChange={(e) =>
                                setNewPhotoUrlInput(e.target.value)
                              }
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!newPhotoUrlInput.trim()) return;
                                if (newsPhotos.length >= 10) return;
                                setNewsPhotos([
                                  ...newsPhotos,
                                  newPhotoUrlInput.trim(),
                                ]);
                                if (!newsImage)
                                  setNewsImage(newPhotoUrlInput.trim());
                                setNewPhotoUrlInput("");
                              }}
                              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shrink-0 cursor-pointer"
                            >
                              + Añadir URL
                            </button>

                            <label className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs shrink-0 cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Subir Archivo(s)</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (!files || files.length === 0) return;
                                  const availableSlots = 10 - newsPhotos.length;
                                  const filesToProcess = Array.from(
                                    files,
                                  ).slice(0, availableSlots);

                                  filesToProcess.forEach((file) => {
                                    const reader = new FileReader();
                                    reader.onload = (uploadEvent) => {
                                      const base64Str = uploadEvent.target
                                        ?.result as string;
                                      if (base64Str) {
                                        setNewsPhotos((prev) => {
                                          if (prev.length >= 10) return prev;
                                          const nextArr = [...prev, base64Str];
                                          if (!newsImage)
                                            setNewsImage(base64Str);
                                          return nextArr;
                                        });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>
                            Límite de 10 imágenes alcanzado para este
                            comunicado.
                          </span>
                        </div>
                      )}

                      {/* Rejilla de Miniaturas */}
                      {newsPhotos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                          {newsPhotos.map((photoUrl, pIdx) => {
                            const isCover =
                              (newsImage || newsPhotos[0]) === photoUrl;
                            return (
                              <div
                                key={pIdx}
                                className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                                  isCover
                                    ? "border-emerald-600 shadow-md ring-2 ring-emerald-300"
                                    : "border-slate-200"
                                }`}
                              >
                                <img
                                  src={photoUrl}
                                  alt={`Foto ${pIdx + 1}`}
                                  className="w-full h-24 object-cover bg-slate-900"
                                />

                                <div className="absolute top-1 left-1">
                                  <span className="px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] font-bold">
                                    #{pIdx + 1}
                                  </span>
                                </div>

                                {isCover && (
                                  <div className="absolute bottom-1 left-1 bg-emerald-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-current text-lime-300" />
                                    <span>Portada</span>
                                  </div>
                                )}

                                <div className="absolute top-1 right-1 flex gap-1">
                                  {!isCover && (
                                    <button
                                      type="button"
                                      onClick={() => setNewsImage(photoUrl)}
                                      className="p-1 rounded bg-white/90 hover:bg-white text-emerald-800 font-bold text-[10px] cursor-pointer shadow-xs"
                                      title="Establecer como foto principal"
                                    >
                                      <Star className="w-3 h-3 text-emerald-700" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextPhotos = newsPhotos.filter(
                                        (_, i) => i !== pIdx,
                                      );
                                      setNewsPhotos(nextPhotos);
                                      if (newsImage === photoUrl) {
                                        setNewsImage(nextPhotos[0] || "");
                                      }
                                    }}
                                    className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
                                    title="Quitar imagen"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Enlace de Video (Opcional - YouTube/Vimeo/MP4)
                        </label>
                        <input
                          type="url"
                          value={newsVideoUrl}
                          onChange={(e) => setNewsVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Tags / Etiquetas
                        </label>
                        <input
                          type="text"
                          value={newsTags.join(", ")}
                          onChange={(e) =>
                            setNewsTags(
                              e.target.value.split(",").map((s) => s.trim()),
                            )
                          }
                          placeholder="Comunidad, Seguridad, Asamblea"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Activar Publicación Automática
                        </label>
                        <input
                          type="datetime-local"
                          value={publishScheduleDate}
                          onChange={(e) =>
                            setPublishScheduleDate(e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Desactivar Automáticamente
                        </label>
                        <input
                          type="datetime-local"
                          value={unpublishDate}
                          onChange={(e) => setUnpublishDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Cuerpo Completo (Formato Blog)
                      </label>
                      <textarea
                        rows={6}
                        value={newsContent}
                        onChange={(e) => setNewsContent(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 font-serif leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="urgentCheck"
                        checked={newsUrgent}
                        onChange={(e) => setNewsUrgent(e.target.checked)}
                      />
                      <label
                        htmlFor="urgentCheck"
                        className="font-bold text-slate-800"
                      >
                        Marcar como Comunicado Urgente
                      </label>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setNewsSubTab("manager")}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer"
                      >
                        {editingNews
                          ? "Guardar Cambios"
                          : "Publicar Comunicado"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Subtab 3: Cronograma */}
              {newsSubTab === "schedule" && (
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="text-base font-black text-slate-900">
                    Cronograma de Activación & Desactivación Automática
                  </h3>
                  <p className="text-slate-500">
                    El sistema activa y expira los comunicados según las fechas
                    programadas sin requerir intervención manual.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {news.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <span className="font-extrabold text-slate-900">
                            {item.title}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Categoría: {item.category} • Urgente:{" "}
                            {item.urgent ? "Sí" : "No"}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] font-mono">
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase">
                              ACTIVACIÓN
                            </span>
                            <span className="text-emerald-800 font-bold">
                              {item.publishScheduleDate || "Inmediata"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase">
                              EXPIRACIÓN
                            </span>
                            <span className="text-slate-600">
                              {item.unpublishDate || "Sin expiración"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 4: Analytics */}
              {newsSubTab === "analytics" && (
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="text-base font-black text-slate-900">
                    Análisis de Visualizaciones & Alcance de Lectura
                  </h3>
                  <p className="text-slate-500">
                    Métricas de cuántas personas y qué porcentaje de filiales
                    del condominio han leído cada comunicado oficial.
                  </p>

                  <div className="space-y-4 pt-2">
                    {news.map((item) => {
                      const views = item.viewsCount || 112;
                      const reach = item.reachPercentage || 82;
                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-900">{item.title}</span>
                            <span className="text-emerald-800 font-mono">
                              {views} lecturas registradas
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-500">
                              <span>Alcance de la comunidad</span>
                              <span className="font-bold text-slate-800">
                                {reach}% de las filiales
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${reach}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: PLANILLA, VACACIONES & LIQUIDACIONES               */}
          {/* ========================================================= */}
          {activeTab === "payroll" && (
            <div className="space-y-6">
              {/* Motor Oficial de Planilla Quincenal, CAL EXTRAS & Aguinaldos (Réplica Exacta de los Excels de la Administradora) */}
              <PinarPayrollManager
                employees={employees}
                onOpenBoleta={(emp, slip) => {
                  setSelectedBoletaEmployee(emp);
                  setSelectedBoletaPayslip(slip);
                }}
                onOpenLiquidation={(emp) => setLiquidationModalEmployee(emp)}
              />

              {/* CCSS Official Connection Panel */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Conexión CCSS - SICERE & Planilla Legal
                      </h3>
                      <p className="text-xs text-slate-500">
                        Cálculo automático de retenciones de ley, exportación
                        oficial y sistema de vacaciones.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleDownloadExcelTemplate("payroll")}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                      title="Descargar estructura de nómina en Excel"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Descargar Plantilla Nómina (.xlsx)</span>
                    </button>

                    <button
                      onClick={handleExportSICERE}
                      className="px-3.5 py-2 rounded-xl bg-sky-800 hover:bg-sky-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar Archivo SICERE (CCSS)</span>
                    </button>

                    <button
                      onClick={() => onProcessPayroll("Octubre 2026")}
                      className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                      <span>Procesar Planilla & Crear Colillas</span>
                    </button>
                  </div>
                </div>

                {/* Employees and Vacations List */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 pl-5">Funcionario & Cédula</th>
                        <th className="p-3.5">Cuenta IBAN de Depósito</th>
                        <th className="p-3.5">Salario Bruto</th>
                        <th className="p-3.5">Neto a Pagar</th>
                        <th className="p-3.5">Vacaciones Saldo</th>
                        <th className="p-3.5 pr-5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employees.map((emp) => {
                        const workerDeduction = Math.round(
                          emp.baseSalary * 0.0984,
                        );
                        const netSalary = emp.baseSalary - workerDeduction;
                        const vacationRem =
                          (emp.vacationDaysTotal || 42) -
                          (emp.vacationDaysTaken || 28);
                        return (
                          <tr
                            key={emp.id}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="p-3.5 pl-5">
                              <span className="font-extrabold text-slate-900 block text-sm">
                                {emp.name}
                              </span>
                              <span className="text-slate-500 font-mono text-[11px]">
                                Cédula: {emp.idNumber} • {emp.roleTitle}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="font-mono text-slate-800 text-[11px] block select-all">
                                {emp.iban}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {emp.bankName || "BNCR"}
                              </span>
                            </td>

                            <td className="p-3.5 font-mono font-bold text-slate-900">
                              ₡{emp.baseSalary.toLocaleString("es-CR")}
                            </td>

                            <td className="p-3.5 font-mono font-black text-emerald-800 text-sm">
                              ₡{netSalary.toLocaleString("es-CR")}
                            </td>

                            <td className="p-3.5">
                              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold font-mono text-xs border border-emerald-200">
                                {vacationRem} días disponibles
                              </span>
                            </td>

                            <td className="p-3.5 pr-5 text-right space-x-1">
                              <button
                                onClick={() => {
                                  const latestSlip = emp.payslips?.[0] || {
                                    id: `COL-2026-OCT-${emp.id}`,
                                    employeeId: emp.id,
                                    period: "Octubre 2026",
                                    dateRange:
                                      "Planilla del 01 al 31 de Octubre 2026",
                                    entityName:
                                      "ASOCIACIÓN PRO MEJORAS RESIDENCIAL PINAR DEL RÍO",
                                    legalId: "3-002-342377",
                                    paymentDate: new Date()
                                      .toISOString()
                                      .split("T")[0],
                                    grossSalary: emp.baseSalary,
                                    overtimeHours: 0,
                                    overtimeAmount: 0,
                                    subtotal: emp.baseSalary,
                                    unworkedDays: 0,
                                    unworkedDaysDeduction: 0,
                                    workerCCSSDeduction: Math.round(
                                      emp.baseSalary * 0.0984,
                                    ),
                                    otherDeductions: 0,
                                    netSalary:
                                      emp.baseSalary -
                                      Math.round(emp.baseSalary * 0.0984),
                                    employerCCSSContribution: Math.round(
                                      emp.baseSalary * 0.2667,
                                    ),
                                    status: "pagado" as const,
                                    ccssSicereBatchId: "SICERE-2026-OCT",
                                    bankReference: `BNCR-PLAN-${emp.idNumber.replace(/\D/g, "")}`,
                                  };
                                  setSelectedBoletaEmployee(emp);
                                  setSelectedBoletaPayslip(latestSlip);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs cursor-pointer border border-emerald-200"
                                title="Ver / Imprimir Boleta de Pago Oficial (2026- BOLETAS DE PAGO PLANILLA MENSUAL)"
                              >
                                <Receipt className="w-3.5 h-3.5 inline mr-1" />
                                <span>Boleta</span>
                              </button>

                              <button
                                onClick={() => setLiquidationModalEmployee(emp)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                                title="Calcular liquidación laboral"
                              >
                                <Calculator className="w-3.5 h-3.5 inline mr-1" />
                                <span>Liquidación</span>
                              </button>

                              <button
                                onClick={() => {
                                  setEditingEmployee(emp);
                                  setEmployeeForm({
                                    name: emp.name,
                                    idNumber: emp.idNumber,
                                    role: emp.role,
                                    roleTitle: emp.roleTitle,
                                    baseSalary: emp.baseSalary,
                                    ccssInsuranceNumber:
                                      emp.ccssInsuranceNumber,
                                    iban: emp.iban,
                                    bankName:
                                      emp.bankName ||
                                      "Banco Nacional de Costa Rica (BNCR)",
                                    hireDate: emp.hireDate,
                                    email: emp.email,
                                    phone: emp.phone,
                                    status: emp.status,
                                  });
                                  setIsEmployeeModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: GESTOR DE HORARIOS & TURNOS                        */}
          {/* ========================================================= */}
          {activeTab === "schedules" && (
            <div className="space-y-6">
              {/* Shifts Manager */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Catálogo de Turnos & Esquemas Operativos
                    </h3>
                    <p className="text-xs text-slate-500">
                      Crea, edita o elimina esquemas de turnos aplicables al
                      personal de vigilancia, jardinería y mantenimiento.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingShift(null);
                      setShiftForm({
                        name: "",
                        startTime: "06:00",
                        endTime: "18:00",
                        hoursWeekly: 48,
                        category: "Seguridad",
                        description: "",
                      });
                      setIsShiftModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crear Nuevo Turno</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {shifts.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2 hover:border-emerald-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-slate-900 leading-tight">
                            {s.name}
                          </span>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => {
                                setEditingShift(s);
                                setShiftForm({
                                  name: s.name,
                                  startTime: s.startTime,
                                  endTime: s.endTime,
                                  hoursWeekly: s.hoursWeekly,
                                  category: s.category,
                                  description: s.description,
                                });
                                setIsShiftModalOpen(true);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Modificar turno"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteShift(s.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Eliminar turno"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="font-mono text-emerald-800 font-bold mt-1">
                          {s.startTime} a {s.endTime} ({s.hoursWeekly}h/sem)
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {s.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 w-fit">
                        {s.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employees Assigned Schedules */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-900">
                  Horarios Asignados por Funcionario (Edición Lunes a Domingo)
                </h3>

                <div className="space-y-4">
                  {employees.map((emp) => (
                    <div
                      key={emp.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900">
                              {emp.name}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              {emp.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {emp.schedule.shiftName} •{" "}
                            {emp.schedule.hoursWeekly}h semanales • Libres:{" "}
                            {emp.schedule.daysOff.join(", ")}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setScheduleModalEmployee(emp);
                            setEmployeeScheduleDraft({ ...emp.schedule });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Modificar Horario Semanal
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-xs">
                        {[
                          { day: "Lun", shift: emp.schedule.monday },
                          { day: "Mar", shift: emp.schedule.tuesday },
                          { day: "Mié", shift: emp.schedule.wednesday },
                          { day: "Jue", shift: emp.schedule.thursday },
                          { day: "Vie", shift: emp.schedule.friday },
                          { day: "Sáb", shift: emp.schedule.saturday },
                          { day: "Dom", shift: emp.schedule.sunday },
                        ].map((d, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white border border-slate-200"
                          >
                            <span className="font-extrabold text-slate-500 uppercase text-[10px] block">
                              {d.day}
                            </span>
                            <span className="font-bold text-[11px] text-slate-900 mt-1 block truncate">
                              {d.shift}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: FLUJO DE CAJA & SIMULADOR FINANCIERO               */}
          {/* ========================================================= */}
          {activeTab === "cashflow_projections" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/80 space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-lime-400" />
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                      Simulador Financiero & Proyecciones de Costos
                    </h3>
                  </div>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Modifica los parámetros para proyectar: ¿Qué pasaría si
                    subimos el salario de un puesto, la cuota condominal o
                    incurrimos en obras?
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs bg-slate-950/60 p-5 rounded-2xl border border-emerald-800/50">
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-emerald-200">
                        Ajuste Cuota Condominal:
                      </span>
                      <span className="font-mono text-lime-300 font-black">
                        {simQuotaDeltaPercent > 0
                          ? `+${simQuotaDeltaPercent}%`
                          : `${simQuotaDeltaPercent}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-10"
                      max="30"
                      step="5"
                      value={simQuotaDeltaPercent}
                      onChange={(e) =>
                        setSimQuotaDeltaPercent(Number(e.target.value))
                      }
                      className="w-full accent-lime-400 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-emerald-200">
                        Aumento Salarial Planilla:
                      </span>
                      <span className="font-mono text-lime-300 font-black">
                        +{simSalaryDeltaPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      step="5"
                      value={simSalaryDeltaPercent}
                      onChange={(e) =>
                        setSimSalaryDeltaPercent(Number(e.target.value))
                      }
                      className="w-full accent-lime-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL: CREAR / EDITAR FILIAL (COMPLETO CON CENSO & HIJOS) */}
      {/* ========================================================= */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingUnit
                    ? "Modificar Finca Filial"
                    : "Registrar Nueva Finca Filial"}
                </h3>
                <p className="text-xs text-slate-500">
                  Ingresa los datos registrales, cuota, puntos de contacto,
                  convivencia (hijos/mascotas) y habitantes.
                </p>
              </div>
              <button
                onClick={() => setIsUnitModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-5 text-xs">
              {/* Bloque 1: Propiedad & Cuota */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                  1. Datos de la Finca Filial & Cuota
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Número de Filial
                    </label>
                    <input
                      type="text"
                      required
                      value={unitForm.number}
                      onChange={(e) =>
                        setUnitForm({ ...unitForm, number: e.target.value })
                      }
                      placeholder="Filial #35"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Sector / Etapa
                    </label>
                    <select
                      value={unitForm.section}
                      onChange={(e) =>
                        setUnitForm({ ...unitForm, section: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Sector Los Pinos">Sector Los Pinos</option>
                      <option value="Sector El Manantial">
                        Sector El Manantial
                      </option>
                      <option value="Sector Las Colinas">
                        Sector Las Colinas
                      </option>
                      <option value="Sector El Río">Sector El Río</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Área (m²)
                    </label>
                    <input
                      type="number"
                      value={unitForm.areaM2}
                      onChange={(e) =>
                        setUnitForm({
                          ...unitForm,
                          areaM2: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Cuota Condominal Mensual (₡)
                    </label>
                    <input
                      type="number"
                      required
                      value={unitForm.monthlyQuota}
                      onChange={(e) =>
                        setUnitForm({
                          ...unitForm,
                          monthlyQuota: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-emerald-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 2: Puntos de Contacto del Condómino */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                  2. Puntos de Contacto del Propietario / Titular
                </span>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nombre Completo del Propietario
                  </label>
                  <input
                    type="text"
                    required
                    value={unitForm.ownerName}
                    onChange={(e) =>
                      setUnitForm({ ...unitForm, ownerName: e.target.value })
                    }
                    placeholder="Ej: Carlos Vargas Murillo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Teléfono Móvil
                    </label>
                    <input
                      type="text"
                      required
                      value={unitForm.ownerPhone}
                      onChange={(e) =>
                        setUnitForm({ ...unitForm, ownerPhone: e.target.value })
                      }
                      placeholder="+506 8800-0000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={unitForm.ownerEmail}
                      onChange={(e) =>
                        setUnitForm({ ...unitForm, ownerEmail: e.target.value })
                      }
                      placeholder="usuario@ejemplo.cr"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Antigüedad / Residencia
                    </label>
                    <input
                      type="text"
                      value={unitForm.residencyDuration}
                      onChange={(e) =>
                        setUnitForm({
                          ...unitForm,
                          residencyDuration: e.target.value,
                        })
                      }
                      placeholder="Ej: 2 años y 6 meses"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* Contacto de Emergencia */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="font-bold text-[11px] text-slate-600 block mb-1">
                    Contacto de Emergencia 24/7 (Para Caseta y Administración)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={unitForm.emergencyContactName}
                        onChange={(e) =>
                          setUnitForm({
                            ...unitForm,
                            emergencyContactName: e.target.value,
                          })
                        }
                        placeholder="Nombre contacto emergencia (Familiar / Pareja)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={unitForm.emergencyPhone}
                        onChange={(e) =>
                          setUnitForm({
                            ...unitForm,
                            emergencyPhone: e.target.value,
                          })
                        }
                        placeholder="Teléfono emergencia (+506)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Censo de Convivencia: Hijos, Mascotas & Vehículos */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                  3. Convivencia: Hijos, Mascotas & Vehículos
                </span>

                {/* Hijos */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Baby className="w-4 h-4 text-sky-600" />
                      <label
                        htmlFor="unitHasChildren"
                        className="font-bold text-slate-800 cursor-pointer"
                      >
                        ¿Habitan hijos o menores de edad en la finca filial?
                      </label>
                    </div>
                    <input
                      type="checkbox"
                      id="unitHasChildren"
                      checked={unitForm.hasChildren}
                      onChange={(e) =>
                        setUnitForm({
                          ...unitForm,
                          hasChildren: e.target.checked,
                        })
                      }
                      className="rounded text-emerald-800 cursor-pointer"
                    />
                  </div>

                  {unitForm.hasChildren && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Cantidad de Hijos
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={unitForm.childrenCount || 1}
                          onChange={(e) =>
                            setUnitForm({
                              ...unitForm,
                              childrenCount: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono font-bold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">
                          Nombres y Edades de los Hijos
                        </label>
                        <input
                          type="text"
                          value={unitForm.childrenDetails}
                          onChange={(e) =>
                            setUnitForm({
                              ...unitForm,
                              childrenDetails: e.target.value,
                            })
                          }
                          placeholder="Ej: Lucas (6 años), Sofía (10 años)"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mascotas */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dog className="w-4 h-4 text-amber-600" />
                      <label
                        htmlFor="unitHasPets"
                        className="font-bold text-slate-800 cursor-pointer"
                      >
                        ¿Tienen mascotas en la finca filial?
                      </label>
                    </div>
                    <input
                      type="checkbox"
                      id="unitHasPets"
                      checked={unitForm.hasPets}
                      onChange={(e) =>
                        setUnitForm({ ...unitForm, hasPets: e.target.checked })
                      }
                      className="rounded text-emerald-800 cursor-pointer"
                    />
                  </div>

                  {unitForm.hasPets && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Perros (Cantidad)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={unitForm.dogsCount}
                            onChange={(e) =>
                              setUnitForm({
                                ...unitForm,
                                dogsCount: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">
                            Detalle de Perros (Razas / Nombres)
                          </label>
                          <input
                            type="text"
                            value={unitForm.dogsDetails}
                            onChange={(e) =>
                              setUnitForm({
                                ...unitForm,
                                dogsDetails: e.target.value,
                              })
                            }
                            placeholder="Ej: 1 Golden Retriever (Max)"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Gatos (Cantidad)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={unitForm.catsCount}
                            onChange={(e) =>
                              setUnitForm({
                                ...unitForm,
                                catsCount: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">
                            Detalle de Gatos
                          </label>
                          <input
                            type="text"
                            value={unitForm.catsDetails}
                            onChange={(e) =>
                              setUnitForm({
                                ...unitForm,
                                catsDetails: e.target.value,
                              })
                            }
                            placeholder="Ej: 1 gato persa blanco"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vehículos */}
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Vehículos (Cantidad)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={unitForm.vehiclesCount}
                        onChange={(e) =>
                          setUnitForm({
                            ...unitForm,
                            vehiclesCount: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">
                        Placas de Vehículos (Acceso Aguja)
                      </label>
                      <input
                        type="text"
                        value={unitForm.vehiclesPlates}
                        onChange={(e) =>
                          setUnitForm({
                            ...unitForm,
                            vehiclesPlates: e.target.value,
                          })
                        }
                        placeholder="Ej: BCX-102, GHM-998"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloque 4: Residentes Habitantes en la Filial */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                    4. Residentes que Habitan la Filial (
                    {unitForm.unitResidentsList.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Se asociarán automáticamente a la filial
                  </span>
                </div>

                {/* List of current residents in this unit form */}
                {unitForm.unitResidentsList.length > 0 ? (
                  <div className="space-y-2">
                    {unitForm.unitResidentsList.map((res, rIndex) => (
                      <div
                        key={res.id || rIndex}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {res.name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              {res.relationship}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Tel:{" "}
                            <strong className="text-slate-700">
                              {res.phone}
                            </strong>{" "}
                            • Vive aquí: {res.residencyDuration || "1 año"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUnitForm({
                              ...unitForm,
                              unitResidentsList:
                                unitForm.unitResidentsList.filter(
                                  (_, i) => i !== rIndex,
                                ),
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Eliminar de la lista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic p-2 bg-white rounded-xl border border-dashed border-slate-200">
                    Si no agregas personas aquí, el Propietario (
                    {unitForm.ownerName || "Titular"}) se registrará como
                    habitante principal por defecto.
                  </p>
                )}

                {/* Mini Form to Add Another Resident to this unit */}
                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <span className="font-bold text-[11px] text-slate-700 block">
                    + Agregar otro habitante a la finca filial:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre del residente"
                      value={inlineResidentName}
                      onChange={(e) => setInlineResidentName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                    <select
                      value={inlineResidentRel}
                      onChange={(e) =>
                        setInlineResidentRel(e.target.value as any)
                      }
                      className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                    >
                      <option value="Cónyuge / Pareja">Cónyuge / Pareja</option>
                      <option value="Hijo(a)">Hijo(a)</option>
                      <option value="Familiar">Familiar</option>
                      <option value="Inquilino / Arrendatario">
                        Inquilino / Arrendatario
                      </option>
                      <option value="Propietario Principal">
                        Propietario Principal
                      </option>
                    </select>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Teléfono"
                        value={inlineResidentPhone}
                        onChange={(e) => setInlineResidentPhone(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!inlineResidentName.trim()) return;
                          const newR: ResidentMember = {
                            id: `res-draft-${Date.now()}`,
                            name: inlineResidentName.trim(),
                            phone: inlineResidentPhone || "+506 ",
                            email: "",
                            relationship: inlineResidentRel,
                            residencyDuration:
                              unitForm.residencyDuration || "1 año",
                            childrenCount: 0,
                            dogsCount: 0,
                          };
                          setUnitForm({
                            ...unitForm,
                            unitResidentsList: [
                              ...unitForm.unitResidentsList,
                              newR,
                            ],
                          });
                          setInlineResidentName("");
                          setInlineResidentPhone("+506 ");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shrink-0 cursor-pointer"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer shadow-sm text-xs"
                >
                  {editingUnit
                    ? "Guardar Cambios de Filial"
                    : "Crear Finca Filial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: AGREGAR RESIDENTE A FILIAL (CENSO COMPLETO)        */}
      {/* ========================================================= */}
      {residentModalUnit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Agregar Residente a {residentModalUnit.number}
                </h3>
                <p className="text-xs text-slate-500">
                  Censo del habitante: tiempo de residencia, perros, hijos y
                  vehículos.
                </p>
              </div>
              <button
                onClick={() => setResidentModalUnit(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveResident} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre Completo del Residente
                </label>
                <input
                  type="text"
                  required
                  value={residentForm.name}
                  onChange={(e) =>
                    setResidentForm({ ...residentForm, name: e.target.value })
                  }
                  placeholder="Ej: Gabriela Castro Fernández"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    required
                    value={residentForm.phone}
                    onChange={(e) =>
                      setResidentForm({
                        ...residentForm,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={residentForm.email}
                    onChange={(e) =>
                      setResidentForm({
                        ...residentForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Relación / Ocupación
                  </label>
                  <select
                    value={residentForm.relationship}
                    onChange={(e) =>
                      setResidentForm({
                        ...residentForm,
                        relationship: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Propietario Principal">
                      Propietario Principal
                    </option>
                    <option value="Cónyuge / Pareja">Cónyuge / Pareja</option>
                    <option value="Hijo(a)">Hijo(a)</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Inquilino / Arrendatario">
                      Inquilino / Arrendatario
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tiempo de Vivir en Residencial
                  </label>
                  <input
                    type="text"
                    required
                    value={residentForm.residencyDuration}
                    onChange={(e) =>
                      setResidentForm({
                        ...residentForm,
                        residencyDuration: e.target.value,
                      })
                    }
                    placeholder="Ej: 2 años y 4 meses"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cantidad de Perros / Mascotas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={residentForm.dogsCount}
                    onChange={(e) =>
                      setResidentForm({
                        ...residentForm,
                        dogsCount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cantidad de Hijos / Menores
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={residentForm.childrenCount}
                    onChange={(e) =>
                      setResidentForm({
                        ...residentForm,
                        childrenCount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Detalle de Mascotas (Nombres / Razas)
                </label>
                <input
                  type="text"
                  value={residentForm.dogsDetails || ""}
                  onChange={(e) =>
                    setResidentForm({
                      ...residentForm,
                      dogsDetails: e.target.value,
                    })
                  }
                  placeholder="Ej: 1 Golden Retriever (Max) y 1 gato siamés"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Vehículos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={residentForm.vehiclesCount || 1}
                    onChange={(e) =>
                      setResidentForm({
                        ...residentForm,
                        vehiclesCount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Placas de Vehículos
                  </label>
                  <input
                    type="text"
                    value={residentForm.vehiclesPlates || ""}
                    onChange={(e) =>
                      setResidentForm({
                        ...residentForm,
                        vehiclesPlates: e.target.value,
                      })
                    }
                    placeholder="BCX-102, GHM-998"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResidentModalUnit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer"
                >
                  Registrar Residente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INCIDENTE / MANTENIMIENTO (CON CHECKBOX COMUNICADO) */}
      {/* ========================================================= */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingTicket
                  ? "Modificar Incidente"
                  : "Agregar Incidente / Mantenimiento"}
              </h3>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Título del Incidente / Trabajo
                </label>
                <input
                  type="text"
                  required
                  value={ticketForm.title}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={ticketForm.date}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Costo (₡ Colones)
                  </label>
                  <input
                    type="number"
                    required
                    value={ticketForm.cost}
                    onChange={(e) =>
                      setTicketForm({
                        ...ticketForm,
                        cost: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivo / Justificación Técnica
                </label>
                <textarea
                  rows={2}
                  required
                  value={ticketForm.motive}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, motive: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Aprobación Junta Directiva
                  </label>
                  <select
                    value={ticketForm.boardApproval}
                    onChange={(e) =>
                      setTicketForm({
                        ...ticketForm,
                        boardApproval: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Aprobado">Aprobado</option>
                    <option value="En Revisión">En Revisión</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="No Requiere">No Requiere</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Resultado de la Intervención
                  </label>
                  <select
                    value={ticketForm.result}
                    onChange={(e) =>
                      setTicketForm({
                        ...ticketForm,
                        result: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Exitoso">Exitoso</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Pendiente Inspección">
                      Pendiente Inspección
                    </option>
                    <option value="Con Observaciones">Con Observaciones</option>
                    <option value="En Garantía">En Garantía</option>
                  </select>
                </div>
              </div>

              {/* CHECKBOX SOLICITADO: Comunicado Público Automático */}
              <div className="p-3 rounded-xl bg-lime-50/70 border border-lime-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="publicNoticeCheckbox"
                  checked={ticketForm.createPublicNotice}
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      createPublicNotice: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded text-emerald-800"
                />
                <label
                  htmlFor="publicNoticeCheckbox"
                  className="font-bold text-slate-900 cursor-pointer"
                >
                  Publicar automáticamente un comunicado público oficial en el
                  Blog y Carrusel sobre este incidente/mantenimiento
                  <span className="block font-normal text-[11px] text-slate-500 mt-0.5">
                    Notificará a todos los condóminos con los detalles técnicos,
                    fecha y costo sin necesidad de redactarlo por separado.
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer"
                >
                  {editingTicket ? "Guardar Cambios" : "Registrar Incidente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: FUNCIONARIO (CON CUENTA IBAN DE DEPÓSITO)          */}
      {/* ========================================================= */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingEmployee
                  ? "Modificar Funcionario"
                  : "Agregar Funcionario a Planilla"}
              </h3>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingEmployee) {
                  onUpdateEmployee({
                    ...editingEmployee,
                    ...employeeForm,
                  });
                } else {
                  onCreateEmployee({
                    ...employeeForm,
                    schedule: {
                      shiftName: "Turno Diurno Ordinario",
                      hoursWeekly: 48,
                      daysOff: ["Domingo"],
                      monday: "07:00 - 16:00",
                      tuesday: "07:00 - 16:00",
                      wednesday: "07:00 - 16:00",
                      thursday: "07:00 - 16:00",
                      friday: "07:00 - 16:00",
                      saturday: "07:00 - 11:00",
                      sunday: "Libre",
                    },
                    vacationDaysTotal: 14,
                    vacationDaysTaken: 0,
                  });
                }
                setIsEmployeeModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={employeeForm.name}
                  onChange={(e) =>
                    setEmployeeForm({ ...employeeForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cédula de Identidad
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeForm.idNumber}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        idNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    N° Asegurado CCSS
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeForm.ccssInsuranceNumber}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        ccssInsuranceNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Puesto
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeForm.roleTitle}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        roleTitle: e.target.value,
                      })
                    }
                    placeholder="Guarda Caseta Principal"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Salario Bruto (₡ Mensual)
                  </label>
                  <input
                    type="number"
                    required
                    value={employeeForm.baseSalary}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        baseSalary: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              {/* CAMPO OBLIGATORIO: Cuenta Bancaria de Depósito */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-900 block uppercase text-[10px]">
                  Cuenta Bancaria para Depósito de Salario
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5 text-[10px]">
                      Cuenta IBAN
                    </label>
                    <input
                      type="text"
                      required
                      value={employeeForm.iban}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          iban: e.target.value,
                        })
                      }
                      placeholder="CR77015108020014552233"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5 text-[10px]">
                      Entidad Bancaria
                    </label>
                    <select
                      value={employeeForm.bankName}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          bankName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    >
                      <option value="Banco Nacional de Costa Rica (BNCR)">
                        Banco Nacional (BNCR)
                      </option>
                      <option value="BAC Credomatic">BAC Credomatic</option>
                      <option value="Banco de Costa Rica (BCR)">
                        Banco de Costa Rica (BCR)
                      </option>
                      <option value="Banco Popular">Banco Popular</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer"
                >
                  {editingEmployee
                    ? "Guardar Funcionario"
                    : "Agregar Funcionario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CALCULADORA DE LIQUIDACIÓN LABORAL (COSTA RICA)    */}
      {/* ========================================================= */}
      {liquidationModalEmployee &&
        (() => {
          const calc = calculateLiquidation(liquidationModalEmployee);
          return (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
                <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Cálculo de Liquidación Laboral •{" "}
                      {liquidationModalEmployee.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Conforme al Código de Trabajo de Costa Rica (Arts. 28, 29,
                      153).
                    </p>
                  </div>
                  <button
                    onClick={() => setLiquidationModalEmployee(null)}
                    className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tipo de Causal de Salida
                    </label>
                    <select
                      value={liquidationType}
                      onChange={(e) =>
                        setLiquidationType(e.target.value as any)
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                    >
                      <option value="con_responsabilidad">
                        Despido con Responsabilidad Patronal (Cesantía +
                        Preaviso)
                      </option>
                      <option value="sin_responsabilidad">
                        Despido sin Responsabilidad Patronal (Falta Grave)
                      </option>
                      <option value="renuncia">
                        Renuncia Voluntaria del Trabajador
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Salario Mensual Bruto
                      </label>
                      <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold">
                        ₡
                        {liquidationModalEmployee.baseSalary.toLocaleString(
                          "es-CR",
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Salario Diario Promedio
                      </label>
                      <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-emerald-800">
                        ₡{calc.dailySalary.toLocaleString("es-CR")}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Días de Vacaciones Pendientes
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={vacationPendingDays}
                      onChange={(e) =>
                        setVacationPendingDays(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    />
                  </div>

                  {/* Rubros de Liquidación */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span>Preaviso ({calc.preavisoDays} días):</span>
                      <span className="font-mono font-bold">
                        ₡{calc.preavisoAmount.toLocaleString("es-CR")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        Auxilio de Cesantía ({calc.cesantiaDays} días):
                      </span>
                      <span className="font-mono font-bold">
                        ₡{calc.cesantiaAmount.toLocaleString("es-CR")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        Vacaciones no gozadas ({calc.vacationPendingDays} días):
                      </span>
                      <span className="font-mono font-bold">
                        ₡{calc.vacationAmount.toLocaleString("es-CR")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aguinaldo proporcional:</span>
                      <span className="font-mono font-bold">
                        ₡{calc.aguinaldoAmount.toLocaleString("es-CR")}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                      <span>TOTAL LIQUIDACIÓN A PAGAR:</span>
                      <span className="font-mono text-emerald-800">
                        ₡{calc.totalLiquidation.toLocaleString("es-CR")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Finiquito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLiquidationModalEmployee(null)}
                    className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ========================================================= */}
      {/* MODAL: CREAR / MODIFICAR TURNO O ESQUEMA                  */}
      {/* ========================================================= */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingShift
                  ? "Modificar Esquema de Turno"
                  : "Crear Nuevo Esquema de Turno"}
              </h3>
              <button
                onClick={() => {
                  setIsShiftModalOpen(false);
                  setEditingShift(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!shiftForm.name) return;
                if (editingShift && onUpdateShift) {
                  onUpdateShift({
                    ...editingShift,
                    ...shiftForm,
                  });
                } else {
                  onCreateShift(shiftForm);
                }
                setIsShiftModalOpen(false);
                setEditingShift(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre del Turno
                </label>
                <input
                  type="text"
                  required
                  value={shiftForm.name}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, name: e.target.value })
                  }
                  placeholder="Turno Especial Fin de Semana"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    required
                    value={shiftForm.startTime}
                    onChange={(e) =>
                      setShiftForm({ ...shiftForm, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    required
                    value={shiftForm.endTime}
                    onChange={(e) =>
                      setShiftForm({ ...shiftForm, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Horas Semanales
                  </label>
                  <input
                    type="number"
                    value={shiftForm.hoursWeekly}
                    onChange={(e) =>
                      setShiftForm({
                        ...shiftForm,
                        hoursWeekly: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={shiftForm.category}
                    onChange={(e) =>
                      setShiftForm({
                        ...shiftForm,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Seguridad">Seguridad</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Descripción / Cobertura
                </label>
                <input
                  type="text"
                  value={shiftForm.description}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, description: e.target.value })
                  }
                  placeholder="Cobertura especial de caseta principal..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsShiftModalOpen(false);
                    setEditingShift(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer"
                >
                  {editingShift ? "Guardar Cambios" : "Crear Turno"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: MODIFICAR HORARIO SEMANAL DE FUNCIONARIO           */}
      {/* ========================================================= */}
      {scheduleModalEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Editar Horario Semanal • {scheduleModalEmployee.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Ajusta los turnos diarios y días libres del funcionario.
                </p>
              </div>
              <button
                onClick={() => setScheduleModalEmployee(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateEmployee({
                  ...scheduleModalEmployee,
                  schedule: {
                    ...employeeScheduleDraft,
                  },
                });
                setScheduleModalEmployee(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre del Esquema
                </label>
                <input
                  type="text"
                  required
                  value={employeeScheduleDraft.shiftName}
                  onChange={(e) =>
                    setEmployeeScheduleDraft({
                      ...employeeScheduleDraft,
                      shiftName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                {[
                  { key: "monday", label: "Lunes" },
                  { key: "tuesday", label: "Martes" },
                  { key: "wednesday", label: "Miércoles" },
                  { key: "thursday", label: "Jueves" },
                  { key: "friday", label: "Viernes" },
                  { key: "saturday", label: "Sábado" },
                  { key: "sunday", label: "Domingo" },
                ].map((d) => (
                  <div key={d.key}>
                    <label className="block font-bold text-slate-700 mb-1">
                      {d.label}
                    </label>
                    <input
                      type="text"
                      value={(employeeScheduleDraft as any)[d.key]}
                      onChange={(e) =>
                        setEmployeeScheduleDraft({
                          ...employeeScheduleDraft,
                          [d.key]: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[11px]"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Notas / Relevos
                </label>
                <input
                  type="text"
                  value={employeeScheduleDraft.notes || ""}
                  onChange={(e) =>
                    setEmployeeScheduleDraft({
                      ...employeeScheduleDraft,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalEmployee(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer"
                >
                  Guardar Horario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ARREGLO DE PAGO FORMALIZADO                        */}
      {/* ========================================================= */}
      {agreementModalUnit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Arreglo de Pago • {agreementModalUnit.number}
                </h3>
                <p className="text-xs text-slate-500">
                  Condómino:{" "}
                  <span className="font-semibold text-slate-800">
                    {agreementModalUnit.ownerName}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setAgreementModalUnit(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Monto Total a Diferir (₡)
                </label>
                <input
                  type="number"
                  value={agreedAmount}
                  onChange={(e) => setAgreedAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Plazo (Meses)
                  </label>
                  <select
                    value={installmentsCount}
                    onChange={(e) =>
                      setInstallmentsCount(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="3">3 Meses</option>
                    <option value="6">6 Meses</option>
                    <option value="12">12 Meses</option>
                    <option value="18">18 Meses</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cuota Adicional Mensual
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-emerald-800">
                    ₡
                    {Math.round(
                      agreedAmount / (installmentsCount || 1),
                    ).toLocaleString("es-CR")}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Acta de Junta Directiva que Aprueba
                </label>
                <input
                  type="text"
                  value={agreementActa}
                  onChange={(e) => setAgreementActa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Notas y Condiciones del Convenio
                </label>
                <textarea
                  rows={2}
                  value={agreementNotes}
                  onChange={(e) => setAgreementNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAgreementModalUnit(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAgreement}
                className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer"
              >
                Formalizar Arreglo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RECHAZAR PAGO                                      */}
      {/* ========================================================= */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Rechazar Comprobante de Pago
            </h3>
            <p className="text-xs text-slate-600">
              Indica la razón por la cual no es posible conciliar el pago de{" "}
              {rejectModalPayment.payerName} ({rejectModalPayment.unitNumber}).
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ej: El número de referencia no coincide con el depósito en cuenta BNCR..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalPayment(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (rejectModalPayment) {
                    onRejectPayment(
                      rejectModalPayment.id,
                      rejectionReason || "Comprobante no válido",
                    );
                    setRejectModalPayment(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* MODAL: CONFIGURAR CUOTAS (POR FILIAL O MASIVA PARA TODOS) */}
      {/* ========================================================= */}
      {isQuotaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Ajuste de Cuota Condominal Mensual
                </h3>
                <p className="text-xs text-slate-500">
                  Aplica cuotas a una finca filial específica o masivamente para
                  todos los condóminos.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsQuotaModalOpen(false);
                  setQuotaSuccessMessage(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            {quotaSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{quotaSuccessMessage}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Mode Selector */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 font-bold">
                <button
                  type="button"
                  onClick={() => setQuotaApplyMode("unit")}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                    quotaApplyMode === "unit"
                      ? "bg-white text-emerald-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Filial Específica
                </button>
                <button
                  type="button"
                  onClick={() => setQuotaApplyMode("all")}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                    quotaApplyMode === "all"
                      ? "bg-white text-emerald-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Todas las Filiales ({units.length})
                </button>
              </div>

              {/* Mode: Single Unit */}
              {quotaApplyMode === "unit" && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Selecciona la Finca Filial
                    </label>
                    <select
                      value={quotaSelectedUnitId}
                      onChange={(e) => {
                        setQuotaSelectedUnitId(e.target.value);
                        const sel = units.find((u) => u.id === e.target.value);
                        if (sel) setQuotaAmount(sel.monthlyQuota);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-xs"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.number} — {u.ownerName} (Actual: ₡
                          {u.monthlyQuota.toLocaleString("es-CR")})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nueva Cuota Mensual para esta Filial (₡)
                    </label>
                    <input
                      type="number"
                      value={quotaAmount}
                      onChange={(e) => setQuotaAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-emerald-900 bg-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Mode: Mass All Units */}
              {quotaApplyMode === "all" && (
                <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="font-bold text-emerald-900 block">
                    Actualización Masiva para Todas las Filiales
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Monto Fijo Uniforme (₡)
                      </label>
                      <input
                        type="number"
                        value={quotaAmount}
                        onChange={(e) => {
                          setQuotaAmount(Number(e.target.value));
                          setQuotaDeltaPercent(0);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-emerald-900 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        O Ajuste Porcentual (%)
                      </label>
                      <input
                        type="number"
                        value={quotaDeltaPercent}
                        onChange={(e) => {
                          setQuotaDeltaPercent(Number(e.target.value));
                        }}
                        placeholder="Ej: 5 para +5%"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-emerald-200 text-[11px] text-slate-600">
                    <p>
                      Impacto estimado: Ingreso total mensual proyectado de{" "}
                      <strong className="text-emerald-900 font-mono font-black">
                        ₡
                        {(quotaDeltaPercent
                          ? Math.round(
                              totalMonthlyTarget *
                                (1 + quotaDeltaPercent / 100),
                            )
                          : quotaAmount * units.length
                        ).toLocaleString("es-CR")}
                      </strong>{" "}
                      para {units.length} filiales.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuotaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onApplyMonthlyQuota) {
                      onApplyMonthlyQuota(
                        quotaApplyMode,
                        quotaAmount,
                        quotaApplyMode === "unit"
                          ? quotaSelectedUnitId
                          : undefined,
                        quotaDeltaPercent > 0 ? quotaDeltaPercent : undefined,
                      );
                      setQuotaSuccessMessage(
                        "¡Cuota(s) mensual(es) actualizada(s) satisfactoriamente!",
                      );
                      setTimeout(() => {
                        setQuotaSuccessMessage(null);
                        setIsQuotaModalOpen(false);
                      }, 2000);
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer shadow-xs"
                >
                  {quotaApplyMode === "unit"
                    ? "Actualizar Cuota de Filial"
                    : "Aplicar a Todas las Filiales"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: COBRO EN CASETA (2026 INGRESOS EGRESOS)             */}
      {/* ========================================================= */}
      {isCashReceiptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    2026 INGRESOS EGRESOS
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Registrar Cobro en Caseta & Emitir Recibo
                </h3>
                <p className="text-xs text-slate-500">
                  Alimentación en tiempo real del Libro de Caja sin necesidad de
                  tabular papel a fin de mes.
                </p>
              </div>
              <button
                onClick={() => setIsCashReceiptModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const selUnit =
                  units.find((u) => u.id === cashReceiptUnitId) || units[0];
                const consecutivo = payments.length + 1;
                const reciboNum = `REC-2026-${String(consecutivo).padStart(4, "0")}`;

                const newReceipt: Omit<PaymentRecord, "id" | "status"> = {
                  consecutiveIndex: consecutivo,
                  receiptNumber: reciboNum,
                  unitId: selUnit.id,
                  unitNumber: selUnit.number,
                  lote: selUnit.number.replace("Filial", "Lote"),
                  payerName: cashReceiptPayerName || selUnit.ownerName,
                  payerEmail: selUnit.ownerEmail,
                  amount: cashReceiptAmount,
                  method: cashReceiptMethod,
                  reference: reciboNum,
                  date: new Date().toISOString().split("T")[0],
                  concept: `Cancelación Cuota ${cashReceiptMonth}`,
                  quotaMonth: cashReceiptMonth,
                  officerName: cashReceiptOfficer,
                  boothNumber: cashReceiptBooth,
                };

                if (onRecordCashReceipt) {
                  onRecordCashReceipt(newReceipt);
                }

                setLastIssuedReceipt({
                  ...newReceipt,
                  id: `PAY-REC-${Date.now()}`,
                  status: "applied",
                });

                setIsCashReceiptModalOpen(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Finca Filial / Lote que Cancela
                </label>
                <select
                  value={cashReceiptUnitId}
                  onChange={(e) => {
                    setCashReceiptUnitId(e.target.value);
                    const sel = units.find((u) => u.id === e.target.value);
                    if (sel) {
                      setCashReceiptPayerName(sel.ownerName);
                      setCashReceiptAmount(
                        sel.currentBalance > 0
                          ? sel.currentBalance
                          : sel.monthlyQuota,
                      );
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.number} — {u.ownerName}{" "}
                      {u.currentBalance > 0
                        ? `(Saldo: ₡${u.currentBalance.toLocaleString("es-CR")})`
                        : "(Al Día)"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nombre de Quien Paga
                  </label>
                  <input
                    type="text"
                    required
                    value={cashReceiptPayerName}
                    onChange={(e) => setCashReceiptPayerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Monto Cobrado (₡)
                  </label>
                  <input
                    type="number"
                    required
                    value={cashReceiptAmount}
                    onChange={(e) =>
                      setCashReceiptAmount(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-emerald-900 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mes Cancelado
                  </label>
                  <select
                    value={cashReceiptMonth}
                    onChange={(e) => setCashReceiptMonth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Octubre 2026">Octubre 2026</option>
                    <option value="Noviembre 2026">Noviembre 2026</option>
                    <option value="Diciembre 2026">Diciembre 2026</option>
                    <option value="Septiembre 2026">Septiembre 2026</option>
                    <option value="Agosto 2026">Agosto 2026</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Medio de Pago
                  </label>
                  <select
                    value={cashReceiptMethod}
                    onChange={(e) =>
                      setCashReceiptMethod(e.target.value as any)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="cash">Efectivo en Caseta</option>
                    <option value="sinpe">SINPE Móvil Caseta</option>
                    <option value="transfer">Transferencia In Situ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Oficial Receptor
                  </label>
                  <input
                    type="text"
                    required
                    value={cashReceiptOfficer}
                    onChange={(e) => setCashReceiptOfficer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Puesto de Cobro
                  </label>
                  <select
                    value={cashReceiptBooth}
                    onChange={(e) => setCashReceiptBooth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Caseta Principal #1">
                      Caseta Principal #1
                    </option>
                    <option value="Caseta Norte #2">Caseta Norte #2</option>
                    <option value="Administración General">
                      Administración General
                    </option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCashReceiptModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-lime-300" />
                  <span>Cobrar & Generar Recibo Digital</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RECIBO OFICIAL DIGITAL DE CASETA                   */}
      {/* ========================================================= */}
      {lastIssuedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="text-center pb-3 border-b border-slate-100 space-y-1">
              <span className="text-[10px] font-black tracking-widest uppercase text-emerald-800 block">
                COMPROBANTE OFICIAL DE INGRESO
              </span>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                ASOCIACIÓN PRO MEJORAS RESIDENCIAL PINAR DEL RÍO
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Cédula Jurídica: 3-002-342377
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Recibo N°:</span>
                <span className="font-mono font-black text-emerald-900 text-sm">
                  {lastIssuedReceipt.receiptNumber || lastIssuedReceipt.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">
                  Finca Filial / Lote:
                </span>
                <span className="font-bold text-slate-900">
                  {lastIssuedReceipt.unitNumber} (
                  {lastIssuedReceipt.lote || "Lote"})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Pagador:</span>
                <span className="font-bold text-slate-900">
                  {lastIssuedReceipt.payerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">
                  Concepto / Mes:
                </span>
                <span className="font-bold text-slate-900">
                  {lastIssuedReceipt.concept}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-emerald-200/60">
                <span className="text-slate-700 font-extrabold">
                  Monto Cancelado:
                </span>
                <span className="font-mono font-black text-emerald-950 text-base">
                  ₡{lastIssuedReceipt.amount.toLocaleString("es-CR")}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Fecha: {lastIssuedReceipt.date}</span>
                <span>
                  {lastIssuedReceipt.boothNumber || "Caseta Principal #1"}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono text-center pt-1">
                Atendido por:{" "}
                {lastIssuedReceipt.officerName || "Oficial en Caseta"}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `*RESIDENCIAL PINAR DEL RÍO - RECIBO DE PAGO*\nRecibo: ${
                    lastIssuedReceipt.receiptNumber || lastIssuedReceipt.id
                  }\nFilial: ${lastIssuedReceipt.unitNumber}\nPagador: ${
                    lastIssuedReceipt.payerName
                  }\nMonto: ₡${lastIssuedReceipt.amount.toLocaleString(
                    "es-CR",
                  )}\nMes: ${lastIssuedReceipt.quotaMonth || lastIssuedReceipt.concept}\nFecha: ${
                    lastIssuedReceipt.date
                  }\nRecibido en: ${lastIssuedReceipt.boothNumber || "Caseta"}`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => setLastIssuedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer ml-auto"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BOLETA OFICIAL DE PAGO PLANILLA (2026- BOLETAS)    */}
      {/* ========================================================= */}
      {selectedBoletaPayslip && selectedBoletaEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
            {/* Header matching exact 2026- BOLETAS DE PAGO PLANILLA MENSUAL.xlsx format */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-800 block">
                  BOLETA DE PAGO MENSUAL • PLANILLA OFICIAL
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  ASOCIACIÓN PRO MEJORAS RESIDENCIAL PINAR DEL RÍO
                </h3>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  Cédula Jurídica: <strong>3-002-342377</strong> • Tel: +506
                  2200-0000
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Período:{" "}
                  <strong className="text-slate-800">
                    {selectedBoletaPayslip.dateRange ||
                      `Planilla ${selectedBoletaPayslip.period}`}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedBoletaPayslip(null);
                  setSelectedBoletaEmployee(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Employee Information Block */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                  FUNCIONARIO
                </span>
                <span className="font-extrabold text-slate-900 block text-sm">
                  {selectedBoletaEmployee.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Cédula: {selectedBoletaEmployee.idNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                  PUESTO / CARGO
                </span>
                <span className="font-bold text-slate-800 block">
                  {selectedBoletaEmployee.roleTitle}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  CCSS Asegurado: {selectedBoletaEmployee.ccssInsuranceNumber}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                  CUENTA IBAN DE DEPÓSITO
                </span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {selectedBoletaEmployee.iban} (
                  {selectedBoletaEmployee.bankName || "BNCR"})
                </span>
              </div>
            </div>

            {/* Earnings and Deductions Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Devengos (Ingresos) */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                <span className="font-black text-emerald-900 block uppercase text-[10px]">
                  INGRESOS & DEVENGOS
                </span>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-600">Salario Bruto Base:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₡{selectedBoletaPayslip.grossSalary.toLocaleString("es-CR")}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-600">
                    Horas Extras ({selectedBoletaPayslip.overtimeHours || 0}h):
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    ₡
                    {(selectedBoletaPayslip.overtimeAmount || 0).toLocaleString(
                      "es-CR",
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 font-bold text-emerald-950">
                  <span>SUBTOTAL DEVENGADO:</span>
                  <span className="font-mono font-black">
                    ₡
                    {(
                      selectedBoletaPayslip.subtotal ||
                      selectedBoletaPayslip.grossSalary
                    ).toLocaleString("es-CR")}
                  </span>
                </div>
              </div>

              {/* Deducciones de Ley */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
                <span className="font-black text-rose-900 block uppercase text-[10px]">
                  DEDUCCIONES DE LEY & OTROS
                </span>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-600">
                    C.C.S.S. Obrera (9.84%):
                  </span>
                  <span className="font-mono font-bold text-rose-800">
                    -₡
                    {selectedBoletaPayslip.workerCCSSDeduction.toLocaleString(
                      "es-CR",
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-600">
                    Días No Laborados ({selectedBoletaPayslip.unworkedDays || 0}{" "}
                    d):
                  </span>
                  <span className="font-mono font-bold text-rose-800">
                    -₡
                    {(
                      selectedBoletaPayslip.unworkedDaysDeduction || 0
                    ).toLocaleString("es-CR")}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 font-bold text-rose-950">
                  <span>TOTAL DEDUCCIONES:</span>
                  <span className="font-mono font-black">
                    -₡
                    {(
                      selectedBoletaPayslip.workerCCSSDeduction +
                      (selectedBoletaPayslip.unworkedDaysDeduction || 0) +
                      (selectedBoletaPayslip.otherDeductions || 0)
                    ).toLocaleString("es-CR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Net Salary */}
            <div className="p-4 rounded-2xl bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  SALARIO NETO A PAGAR
                </span>
                <span className="text-xs text-emerald-100">
                  Transferido a cuenta bancaria oficial
                </span>
              </div>
              <span className="font-mono text-2xl font-black text-lime-300 tabular-nums">
                ₡{selectedBoletaPayslip.netSalary.toLocaleString("es-CR")}
              </span>
            </div>

            {/* Legal Cargas Patronales note */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
              <span className="font-bold text-slate-700 block">
                Cargas Patronales Cubiertas por la Asociación (26.67%):
              </span>
              <p className="mt-0.5">
                La asociación aportó ₡
                {selectedBoletaPayslip.employerCCSSContribution.toLocaleString(
                  "es-CR",
                )}{" "}
                a la CCSS (SEM, IVM, Banco Popular, FCL, ROP e INS) en
                cumplimiento estricto de las leyes laborales de Costa Rica.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Imprimir Boleta PDF</span>
              </button>

              <a
                href={`https://wa.me/${selectedBoletaEmployee.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `*BOLETA DE PAGO - RESIDENCIAL PINAR DEL RÍO*\nEstimado/a ${selectedBoletaEmployee.name},\nSe adjunta detalle de pago de planilla:\n*Período:* ${selectedBoletaPayslip.period}\n*Salario Bruto:* ₡${selectedBoletaPayslip.grossSalary.toLocaleString("es-CR")}\n*Deducción CCSS (9.84%):* -₡${selectedBoletaPayslip.workerCCSSDeduction.toLocaleString("es-CR")}\n*SALARIO NETO:* ₡${selectedBoletaPayslip.netSalary.toLocaleString("es-CR")}\n*Cuenta de depósito:* ${selectedBoletaEmployee.iban}`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setSelectedBoletaPayslip(null);
                  setSelectedBoletaEmployee(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold cursor-pointer ml-auto"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
