export type UserRole = 'resident' | 'admin' | 'board' | 'employee';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  unitId?: string;
  unitNumber?: string;
  phone: string;
  avatar?: string;
  employeeId?: string; // Si es un funcionario
}

export type PaymentMethod = 'sinpe' | 'transfer' | 'card' | 'cash';
export type PaymentStatus = 'reported' | 'pending_validation' | 'validated' | 'applied' | 'rejected';

export interface PaymentRecord {
  id: string; // PAY-2026-XXXXXX
  receiptNumber?: string; // Consecutivo de recibo (ej: REC-2026-0084)
  consecutiveIndex?: number; // Consecutivo numérico para libro de caja (#)
  unitId: string;
  unitNumber: string; // Filial
  lote?: string; // Número de lote (ej: "Lote 14")
  payerName: string; // Nombre del propietario o residente
  payerEmail: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  phone?: string;
  bankName?: string;
  date: string;
  concept: string;
  quotaMonth?: string; // Mes cancelado (ej: "Septiembre 2026")
  officerName?: string; // Oficial que recibió el pago en caseta
  boothNumber?: string; // Caseta donde se recibió el pago (ej: "Caseta Principal #1")
  receiptProofUrl?: string;
  status: PaymentStatus;
  rejectionReason?: string;
  validatedAt?: string;
  validatedBy?: string;
}

export interface InvoiceItem {
  concept: string;
  amount: number;
}

export interface Invoice {
  paidAmount?: number;
  allocations?: { paymentId: string; amount: number }[];
  id: string; // FAC-2026-09014
  unitId: string;
  unitNumber: string;
  ownerName: string;
  ownerIdNumber: string;
  month: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  reserveFund: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  paidWithPayId?: string;
  payId?: string;
}

export type ArrearsStatus = 'up_to_date' | 'late_30' | 'late_60' | 'late_90' | 'late_90_plus';

export interface PaymentAgreement {
  id: string;
  active: boolean;
  totalAgreedAmount: number;
  installmentsCount: number;
  installmentsPaid: number;
  monthlyInstallmentAmount: number;
  startDate: string;
  nextDueDate: string;
  notes: string;
  boardApprovalActa?: string;
  status: 'vigente' | 'al_dia' | 'incumplido' | 'finalizado';
}

export interface ResidentMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: 'Propietario Principal' | 'Cónyuge / Pareja' | 'Hijo(a)' | 'Familiar' | 'Inquilino / Arrendatario';
  residencyDuration: string; // ej: "3 años y 2 meses", o fecha desde que habita
  dogsCount: number;
  dogsDetails?: string; // nombres, razas
  catsCount?: number;
  catsDetails?: string; // nombres, razas
  childrenCount: number;
  childrenDetails?: string; // nombres y edades de los hijos
  vehiclesCount?: number;
  vehiclesPlates?: string;
  notes?: string;
}

export interface ApprovedVisit {
  id: string;
  name: string;
  date: string;
  plate: string;
  notes: string;
  status: 'approved' | 'revoked';
  approvedAt: string;
  approvedBy: string;
  approvedById: string;
  revokedAt?: string;
  revokedBy?: string;
  revocationReason?: string;
}

export interface Unit {
  id: string;
  number: string;
  section: string; // Torre / Etapa / Sector
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  emergencyPhone?: string;
  emergencyContactName?: string;
  areaM2: number;
  participationPercentage: number;
  monthlyQuota: number;
  currentBalance: number;
  arrearsStatus: ArrearsStatus;
  lastPaymentDate?: string;
  overdueMonths?: string[]; // Lista explícita de meses con atraso
  paymentAgreement?: PaymentAgreement; // Arreglo de pago formalizado
  residents?: ResidentMember[]; // Residentes registrados en la filial
  hasChildren?: boolean;
  hasPets?: boolean;
  approvedVisits?: ApprovedVisit[];
}

export interface Amenity {
  id: string;
  name: string;
  tagline: string;
  description: string;
  capacity: number;
  schedule: string;
  rules: string[];
  image: string;
  reservationSlots: string[];
  depositAmount?: number;
}

export interface Reservation {
  id: string;
  amenityId: string;
  amenityName: string;
  unitNumber: string;
  residentName: string;
  date: string;
  timeSlot: string;
  guestsCount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export type TicketPriority = 'baja' | 'media' | 'alta' | 'urgente';
export type TicketStatus = 'nuevo' | 'en_proceso' | 'cotizando' | 'resuelto' | 'cerrado';
export type BoardApprovalStatus = 'Aprobado' | 'En Revisión' | 'Pendiente' | 'Rechazado' | 'No Requiere';
export type IncidentResult = 'Exitoso' | 'En Proceso' | 'Pendiente Inspección' | 'Con Observaciones' | 'En Garantía';

export interface MaintenanceTicket {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  priority: TicketPriority;
  status: TicketStatus;
  unitNumber: string;
  residentName: string;
  createdAt: string;
  slaTargetHours?: number;
  assignedVendor?: string;
  costEstimated?: number;
  // Campos de gestión de mantenimiento:
  date?: string; // Fecha de ejecución/programación
  cost?: number; // Costo real o cotizado en colones
  motive?: string; // Motivo / Justificación técnica
  boardApproval?: BoardApprovalStatus; // Aprobación de Junta Directiva
  boardActaNumber?: string; // Número de acta o sesión de junta
  result?: IncidentResult; // Resultado del mantenimiento/incidente
  publicNoticeCreated?: boolean; // Si se publicó como comunicado público
}

export interface NewsAnnouncement {
  id: string;
  title: string;
  category: 'mantenimiento' | 'comunicado' | 'evento' | 'asamblea';
  date: string;
  author: string;
  summary: string;
  content: string;
  urgent?: boolean;
  image?: string;
  readTime?: string;
  tags?: string[];
  photos?: string[];
  videoUrl?: string;
  // Campos del gestor editorial con cronograma y métricas:
  status?: 'active' | 'scheduled' | 'expired' | 'draft';
  publishScheduleDate?: string; // Fecha programada para activar
  unpublishDate?: string; // Fecha programada para desactivar automáticamente
  viewsCount?: number; // Visualizaciones acumuladas
  reachPercentage?: number; // % de alcance de filiales
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  dayBadge: string;
  monthBadge: string;
  time: string;
  location: string;
  description: string;
  category: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'payment' | 'news' | 'maintenance' | 'reservation';
}

// ==========================================
// MÓDULO DE PLANILLA & HORARIOS (CCSS / CAJA)
// ==========================================

export interface ShiftDefinition {
  id: string;
  name: string; // ej: "Turno Diurno 06:00 - 18:00 (4x3)"
  startTime: string;
  endTime: string;
  hoursWeekly: number;
  category: 'Seguridad' | 'Mantenimiento' | 'Limpieza' | 'General';
  description: string;
}

export interface EmployeeSchedule {
  shiftName: string; // ej: "Turno Mañana (06:00 - 14:00)"
  hoursWeekly: number; // 48
  daysOff: string[];
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  notes?: string;
}

export interface EmployeePayslip {
  employeeName?: string;
  employeeIdentification?: string;
  employeeRoleTitle?: string;
  id: string; // COL-2026-XXXX
  employeeId: string;
  period: string; // ej: "Septiembre 2026"
  paymentDate: string;
  dateRange?: string; // Ej: "Planilla del 2026-09-01 al 2026-09-30"
  entityName?: string; // "ASOCIACIÓN PRO MEJORAS RESIDENCIAL PINAR DEL RÍO"
  legalId?: string; // "3-002-342377"
  grossSalary: number; // Salario bruto base
  overtimeHours?: number; // EXTRAS (Horas extra trabajadas)
  overtimeAmount?: number; // Monto horas extras
  subtotal?: number; // SUBTOTAL (Salario bruto + extras)
  unworkedDays?: number; // DIAS NO (Días no laborados)
  unworkedDaysDeduction?: number; // Rebajo por días no laborados
  workerCCSSDeduction: number; // C.C.S.S. 9.84% Cargas Obreras (parametrizable)
  otherDeductions: number; // DEDUCCIONES (Otras deducciones)
  netSalary: number; // SALARIO NETO a pagar
  observations?: string; // OBSERVACIONES
  employerCCSSContribution: number; // 26.67% Cargas Patronales CCSS + INS
  status: 'pagado' | 'pendiente';
  ccssSicereBatchId: string; // Referencia SICERE de la CCSS
  bankReference: string;
}

export interface EmployeeVacationRecord {
  id: string;
  startDate: string;
  endDate: string;
  daysTaken: number;
  status: 'aprobado' | 'pendiente' | 'disfrutado' | 'rechazado' | 'cancelado';
  scheduledDays?: string[];
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionReason?: string;
  notes?: string;
}

export interface WorkCertificateRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  requestDate: string;
  recipient: string; // "A quien interese", "Banco Nacional", "Embajada de EE.UU."
  purpose: string; // "Trámite de Crédito", "Visa", "Alquiler"
  includeGrossSalary: boolean;
  includeNetSalary: boolean;
  status: 'emitida' | 'pendiente';
}

export interface Employee {
  payrollExtras?: number;
  payrollDeductions?: number;
  unworkedDays?: number;
  id: string;
  name: string;
  idNumber: string; // Cédula CR ej: 1-1402-0891
  role: 'Seguridad' | 'Mantenimiento' | 'Jardinería' | 'Limpieza' | 'Administración';
  roleTitle: string; // Guarda Caseta Principal 24/7
  baseSalary: number; // Salario bruto mensual en colones
  ccssInsuranceNumber: string; // Número asegurado CCSS
  iban: string; // Cuenta IBAN Colones para pago donde se deposita el salario
  bankName?: string; // Banco seleccionado
  hireDate: string;
  status: 'activo' | 'vacaciones' | 'incapacitado' | 'inactivo';
  email: string;
  phone: string;
  schedule: EmployeeSchedule;
  payslips: EmployeePayslip[];
  vacationDaysTotal?: number; // Días de vacaciones acumulados por ley
  vacationDaysTaken?: number; // Días disfrutados
  vacationHistory?: EmployeeVacationRecord[];
}

export interface PayrollRun {
  id: string;
  period: string;
  runDate: string;
  totalGross: number;
  totalWorkerDeductions: number; // Retención CCSS Obrera
  totalNetPaid: number; // Salarios netos transferidos
  totalEmployerCCSS: number; // Cargas patronales a la CCSS
  status: 'pagado' | 'procesando' | 'pendiente';
  sicereExportGenerated: boolean;
  sicereBatchId: string;
  employeesCount: number;
}
