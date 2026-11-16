import React, { useState } from 'react';
import { UserProfile, Employee, EmployeePayslip, WorkCertificateRequest } from '../../types';
import {
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
  User,
  Briefcase,
  AlertCircle,
  Building,
  Check,
  ChevronRight,
  ExternalLink,
  Palmtree,
  Award,
  Send,
} from 'lucide-react';

interface EmployeePortalProps {
  currentUser: UserProfile;
  employee: Employee;
  onNavigateHome: () => void;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({
  currentUser,
  employee,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'payslips' | 'vacations' | 'certificates' | 'profile'>('schedule');
  const [selectedPayslip, setSelectedPayslip] = useState<EmployeePayslip | null>(
    employee.payslips[0] || null
  );
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  // Vacation Request State
  const [vacationStartDate, setVacationStartDate] = useState('');
  const [vacationEndDate, setVacationEndDate] = useState('');
  const [vacationDaysRequested, setVacationDaysRequested] = useState(7);
  const [vacationNotes, setVacationNotes] = useState('');
  const [vacationSuccess, setVacationSuccess] = useState(false);

  // Certificate Request State
  const [certificateRecipient, setCertificateRecipient] = useState('A quien interese');
  const [certificatePurpose, setCertificatePurpose] = useState('Trámite Bancario / Solicitud de Crédito');
  const [generatedCertificate, setGeneratedCertificate] = useState<WorkCertificateRequest | null>(null);

  const handleCheckInToggle = () => {
    if (!checkedIn) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
      setCheckedIn(true);
      setCheckInTime(timeStr);
    } else {
      setCheckedIn(false);
      setCheckInTime(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const cert: WorkCertificateRequest = {
      id: `CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId: employee.id,
      employeeName: employee.name,
      requestDate: new Date().toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' }),
      recipient: certificateRecipient.trim() || 'A quien interese',
      purpose: certificatePurpose.trim() || 'Trámites Personales',
      includeGrossSalary: true,
      includeNetSalary: true,
      status: 'emitida',
    };
    setGeneratedCertificate(cert);
  };

  const handleRequestVacation = (e: React.FormEvent) => {
    e.preventDefault();
    setVacationSuccess(true);
    setTimeout(() => setVacationSuccess(false), 4000);
  };

  const vacationTotal = employee.vacationDaysTotal || 42;
  const vacationTaken = employee.vacationDaysTaken || 28;
  const vacationRemaining = Math.max(0, vacationTotal - vacationTaken);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white py-8 border-b border-emerald-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-lime-400 text-emerald-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                {employee.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {employee.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 text-lime-300 font-bold text-xs border border-emerald-700">
                    {employee.role}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
                  {employee.roleTitle} • Cédula {employee.idNumber} • Asegurado CCSS {employee.ccssInsuranceNumber}
                </p>
              </div>
            </div>

            {/* Quick Check-in Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCheckInToggle}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  checkedIn
                    ? 'bg-lime-400 text-emerald-950 hover:bg-lime-300'
                    : 'bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {checkedIn ? `Turno Marcado (${checkInTime})` : 'Marcar Entrada de Turno'}
                </span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-emerald-800/80 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-3 px-3 font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'schedule'
                  ? 'text-lime-300 border-b-2 border-lime-400'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Mi Horario y Turnos</span>
            </button>

            <button
              onClick={() => setActiveTab('payslips')}
              className={`pb-3 px-3 font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'payslips'
                  ? 'text-lime-300 border-b-2 border-lime-400'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Colillas de Pago & CCSS</span>
            </button>

            <button
              onClick={() => setActiveTab('vacations')}
              className={`pb-3 px-3 font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'vacations'
                  ? 'text-lime-300 border-b-2 border-lime-400'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Palmtree className="w-4 h-4" />
              <span>Mis Vacaciones ({vacationRemaining} días)</span>
            </button>

            <button
              onClick={() => setActiveTab('certificates')}
              className={`pb-3 px-3 font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'certificates'
                  ? 'text-lime-300 border-b-2 border-lime-400'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Comprobantes de Trabajo</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-3 font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'profile'
                  ? 'text-lime-300 border-b-2 border-lime-400'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Datos Laborales & IBAN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================= */}
        {/* TAB 1: MI HORARIO Y TURNOS ASIGNADOS                      */}
        {/* ========================================================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Esquema de Turno Activo
                </span>
                <h2 className="text-lg font-black text-slate-900">
                  {employee.schedule.shiftName}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Jornada ordinaria: <span className="font-bold text-slate-700">{employee.schedule.hoursWeekly} horas semanales</span> • Días libres: <span className="font-bold text-emerald-800">{employee.schedule.daysOff.join(', ')}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl text-xs text-emerald-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Puesto cubierto bajo rol oficial asignado por la Administración.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {[
                { day: 'Lunes', shift: employee.schedule.monday },
                { day: 'Martes', shift: employee.schedule.tuesday },
                { day: 'Miércoles', shift: employee.schedule.wednesday },
                { day: 'Jueves', shift: employee.schedule.thursday },
                { day: 'Viernes', shift: employee.schedule.friday },
                { day: 'Sábado', shift: employee.schedule.saturday },
                { day: 'Domingo', shift: employee.schedule.sunday },
              ].map((item, idx) => {
                const isOff = item.shift.toLowerCase().includes('libre');
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isOff
                        ? 'bg-slate-50 border-slate-200 text-slate-400'
                        : 'bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-black uppercase text-slate-800">
                        {item.day}
                      </span>
                      {isOff ? (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-200/80 px-1.5 py-0.5 rounded">
                          Libre
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Turno
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <p
                        className={`text-xs font-bold leading-snug ${
                          isOff ? 'text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {item.shift}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {employee.schedule.notes && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Instrucciones Operativas del Turno:</span>
                  <p className="mt-0.5 text-amber-800">{employee.schedule.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: COLILLAS DE PAGO & CCSS                            */}
        {/* ========================================================= */}
        {activeTab === 'payslips' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center justify-between">
                  <span>Comprobantes de Pago Oficiales</span>
                  <span className="text-[10px] text-slate-400 font-normal">Planilla CCSS</span>
                </h3>

                <div className="space-y-2.5">
                  {employee.payslips.map((slip) => {
                    const isSelected = selectedPayslip?.id === slip.id;
                    return (
                      <button
                        key={slip.id}
                        onClick={() => setSelectedPayslip(slip)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">
                              {slip.period}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Pagado
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Fecha de depósito: {slip.paymentDate}
                          </p>
                          <p className="text-xs font-mono font-bold text-emerald-900 mt-1">
                            Neto: ₡{slip.netSalary.toLocaleString('es-CR')}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              {selectedPayslip ? (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md print:border-none print:shadow-none">
                  <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-mono font-extrabold text-emerald-800 uppercase tracking-widest block">
                        COMPROBANTE OFICIAL DE PAGO DE SALARIO
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                        Residencial Pinar del Río
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Cédula Jurídica 3-002-897451 • Belén, Heredia
                      </p>
                    </div>

                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir / PDF</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-b border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">FUNCIONARIO</span>
                      <span className="font-bold text-slate-900">{employee.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">CÉDULA DE IDENTIDAD</span>
                      <span className="font-mono text-slate-800">{employee.idNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">ASEGURADO CCSS</span>
                      <span className="font-mono text-slate-800">{employee.ccssInsuranceNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">PUESTO</span>
                      <span className="text-slate-800 font-medium">{employee.roleTitle}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">PERIODO</span>
                      <span className="font-bold text-slate-900">{selectedPayslip.period}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">CUENTA IBAN</span>
                      <span className="font-mono text-[10px] text-slate-700 truncate block">{employee.iban}</span>
                    </div>
                  </div>

                  <div className="py-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between py-1">
                      <span className="font-bold text-slate-800">Salario Ordinario Devengado (Bruto)</span>
                      <span className="font-mono font-bold text-slate-900">
                        ₡{selectedPayslip.grossSalary.toLocaleString('es-CR')}
                      </span>
                    </div>

                    <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-red-900 font-bold">
                        <span>Deducción Cargas Obreras CCSS (9.84%)</span>
                        <span className="font-mono">-₡{selectedPayslip.workerCCSSDeduction.toLocaleString('es-CR')}</span>
                      </div>
                      <p className="text-[10px] text-red-700/80">
                        • Seguro de Enfermedad y Maternidad (SEM): 5.50%<br />
                        • Régimen de Invalidez, Vejez y Muerte (IVM): 4.17%<br />
                        • Aporte Banco Popular: 1.00%
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Aporte Patronal Reportado a la CCSS (No deducible del salario):
                      </span>
                      <div className="flex items-center justify-between font-mono text-slate-700">
                        <span>Cargas Sociales Patronales (26.67% CCSS + INS)</span>
                        <span>₡{selectedPayslip.employerCCSSContribution.toLocaleString('es-CR')}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm sm:text-base">
                      <span className="font-black text-slate-900">SALARIO NETO DEPOSITADO</span>
                      <span className="font-mono font-black text-emerald-800 text-lg sm:text-xl">
                        ₡{selectedPayslip.netSalary.toLocaleString('es-CR')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                    <div>
                      <span>Lote SICERE CCSS: {selectedPayslip.ccssSicereBatchId}</span>
                      <span className="block text-[9px] text-slate-400">Ref. Depósito: {selectedPayslip.bankReference}</span>
                    </div>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Comprobante validado conforme a Ley</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500">
                  Selecciona una colilla de pago para ver su detalle oficial.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SISTEMA DE VACACIONES (LEY COSTARRICENSE)           */}
        {/* ========================================================= */}
        {activeTab === 'vacations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  DÍAS ACUMULADOS POR LEY
                </span>
                <p className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {vacationTotal} días
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  1 día por cada mes laborado (Código de Trabajo)
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  DÍAS YA DISFRUTADOS
                </span>
                <p className="text-2xl font-black text-slate-600 font-mono mt-1">
                  {vacationTaken} días
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Periodos gozados aprobados por administración
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-emerald-300 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  SALDO DE VACACIONES DISPONIBLES
                </span>
                <p className="text-3xl font-black text-emerald-800 font-mono mt-1">
                  {vacationRemaining} días
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Disponibles para solicitar y gozar
                </p>
              </div>
            </div>

            {/* Request Vacation Form */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900">
                Solicitar Periodo de Vacaciones
              </h3>

              {vacationSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tu solicitud de vacaciones ha sido enviada a la Administración General para su aprobación formal.</span>
                </div>
              )}

              <form onSubmit={handleRequestVacation} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    required
                    value={vacationStartDate}
                    onChange={(e) => setVacationStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha de Finalización</label>
                  <input
                    type="date"
                    required
                    value={vacationEndDate}
                    onChange={(e) => setVacationEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Días Hábiles Solicitados</label>
                  <input
                    type="number"
                    min="1"
                    max={vacationRemaining}
                    value={vacationDaysRequested}
                    onChange={(e) => setVacationDaysRequested(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Observaciones / Relevo</label>
                  <input
                    type="text"
                    value={vacationNotes}
                    onChange={(e) => setVacationNotes(e.target.value)}
                    placeholder="Ej: Relevo coordinado con el guarda de turno diurno..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Solicitud a Administración</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Vacation History */}
            {employee.vacationHistory && employee.vacationHistory.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
                <h4 className="font-extrabold text-slate-900">Historial de Periodos Disfrutados</h4>
                <div className="space-y-2">
                  {employee.vacationHistory.map((v) => (
                    <div key={v.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{v.startDate} al {v.endDate}</span>
                        <p className="text-[11px] text-slate-500">{v.notes || 'Periodo regular'}</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {v.daysTaken} días gozados
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: COMPROBANTES Y CONSTANCIAS DE TRABAJO              */}
        {/* ========================================================= */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Generador Automático de Constancias Salariales & de Trabajo
                </h3>
                <p className="text-xs text-slate-500">
                  Los empleados pueden solicitar constancias oficiales membretadas para trámites bancarios, visas o alquileres, generadas inmediatamente por el sistema.
                </p>
              </div>

              <form onSubmit={handleGenerateCertificate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destinatario de la Constancia</label>
                  <input
                    type="text"
                    value={certificateRecipient}
                    onChange={(e) => setCertificateRecipient(e.target.value)}
                    placeholder="Ej: A quien interese, Banco Nacional, Embajada..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Propósito / Trámite</label>
                  <input
                    type="text"
                    value={certificatePurpose}
                    onChange={(e) => setCertificatePurpose(e.target.value)}
                    placeholder="Ej: Solicitud de Crédito Personal, Arrendamiento..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                    required
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <Award className="w-4 h-4 text-lime-400" />
                    <span>Generar Constancia Oficial Membretada</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Official Letter Preview */}
            {generatedCertificate && (
              <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg max-w-3xl mx-auto space-y-6 print:border-none print:shadow-none font-serif text-xs sm:text-sm text-slate-800 leading-relaxed">
                <div className="flex justify-between items-start pb-4 border-b border-slate-200 font-sans">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Asociación Administradora Residencial Pinar del Río
                    </h2>
                    <p className="text-xs text-slate-500">
                      Cédula Jurídica N.º 3-002-897451 • Belén, Heredia, Costa Rica
                    </p>
                    <p className="text-[10px] text-emerald-800 font-mono mt-0.5">
                      Código de Certificación: {generatedCertificate.id}
                    </p>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 font-sans cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir / Descargar PDF</span>
                  </button>
                </div>

                <div className="text-center py-2 font-sans">
                  <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
                    CONSTANCIA DE TRABAJO Y SALARIO
                  </h3>
                </div>

                <div className="space-y-4">
                  <p>
                    A QUIEN CORRESPONDA:<br />
                    <strong>{generatedCertificate.recipient.toUpperCase()}</strong>
                  </p>

                  <p>
                    Por medio de la presente, la <strong>Asociación Administradora de Residencial Pinar del Río</strong>, cédula jurídica <strong>3-002-897451</strong>, hace constar que el señor(a) <strong>{employee.name}</strong>, portador(a) de la cédula de identidad número <strong>{employee.idNumber}</strong> y número de asegurado ante la CCSS <strong>{employee.ccssInsuranceNumber}</strong>, labora para nuestra institución bajo contrato por tiempo indeterminado desde el día <strong>{employee.hireDate}</strong>.
                  </p>

                  <p>
                    Actualmente se desempeña en el puesto de <strong>{employee.roleTitle}</strong>, devengando un salario ordinario bruto mensual de <strong>₡{employee.baseSalary.toLocaleString('es-CR')}</strong> ({employee.baseSalary.toLocaleString()} colones costarricenses), con un salario neto mensual aproximado de <strong>₡{Math.round(employee.baseSalary * 0.9016).toLocaleString('es-CR')}</strong> una vez deducidas las cargas sociales de ley ante la Caja Costarricense de Seguro Social.
                  </p>

                  <p>
                    El señor(a) {employee.name} se encuentra al día con todas sus obligaciones laborales y goza de intachable récord disciplinario y ético dentro de nuestra comunidad.
                  </p>

                  <p>
                    Se extiende la presente constancia a solicitud de la parte interesada para fines de <em>{generatedCertificate.purpose}</em>, en Belén de Heredia, a los {new Date().getDate()} días del mes de {new Date().toLocaleDateString('es-CR', { month: 'long' })} de {new Date().getFullYear()}.
                  </p>
                </div>

                <div className="pt-12 flex justify-between items-end font-sans">
                  <div className="text-center">
                    <div className="w-48 border-b border-slate-900 mx-auto mb-1" />
                    <p className="font-bold text-xs text-slate-900">Licda. Sofía Morales</p>
                    <p className="text-[10px] text-slate-500">Administradora General</p>
                    <p className="text-[9px] text-slate-400">Residencial Pinar del Río</p>
                  </div>

                  <div className="text-right text-[10px] text-slate-400 font-mono">
                    <div className="border border-slate-200 p-2 rounded-xl text-center">
                      <ShieldCheck className="w-6 h-6 text-emerald-700 mx-auto" />
                      <span>Firma Digital Verificada</span>
                      <span className="block text-[8px]">Ley N.º 8454</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: DATOS LABORALES & CUENTA IBAN                      */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Ficha Laboral & Datos de Pago
              </h3>
              <p className="text-xs text-slate-500">
                Datos contractuales registrados ante la CCSS y la Administración.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">PUESTO LABORAL</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{employee.roleTitle}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">SALARIO BASE BRUTO</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                  ₡{employee.baseSalary.toLocaleString('es-CR')} mensuales
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">N° ASEGURADO CCSS</span>
                <span className="font-mono text-slate-800 text-xs mt-0.5 block">{employee.ccssInsuranceNumber}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">FECHA DE INGRESO</span>
                <span className="text-slate-800 text-xs mt-0.5 block">{employee.hireDate}</span>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold block uppercase">
                  CUENTA BANCARIA DE DEPÓSITO DE SALARIO
                </span>
                <span className="font-mono text-slate-900 font-bold text-sm mt-0.5 block select-all">
                  {employee.iban}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Entidad: {employee.bankName || 'Banco Nacional de Costa Rica'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>
                Para solicitar cambios en tu horario, vacaciones o constancias salariales, comunícate con la Administración General (+506 2293-4500).
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
