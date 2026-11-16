import React, { useState } from 'react';
import { today } from '../../domain/demo';
import type { Command, DemoState } from '../../domain/demo';
import { ApprovedVisits } from './ApprovedVisits';
const AdManager = React.lazy(() => import('../advertising/AdManager').then(module => ({ default: module.AdManager })));
import {
  UserProfile,
  Unit,
  Invoice,
  PaymentRecord,
  Amenity,
  Reservation,
  MaintenanceTicket,
  ResidentMember,
} from '../../types';
import { CONDO_BANK_INFO } from '../../data/mockData';
import {
  CreditCard,
  FileText,
  Calendar,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Copy,
  Upload,
  Clock,
  Send,
  Users,
  ShieldCheck,
  Check,
  Download,
  PlusCircle,
  Sparkles,
  Dog,
  Baby,
  Car,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit2,
  Heart,
  Home,
} from 'lucide-react';

interface ResidentPortalProps {
  currentUser: UserProfile;
  currentUnit: Unit;
  invoices: Invoice[];
  payments: PaymentRecord[];
  amenities: Amenity[];
  reservations: Reservation[];
  tickets: MaintenanceTicket[];
  initialTab?: 'overview' | 'pay' | 'invoices' | 'reservations' | 'tickets' | 'household';
  onOpenInvoice: (invoice: Invoice) => void;
  onSubmitPayment: (newPayment: Omit<PaymentRecord, 'id' | 'status' | 'date'>) => void;
  onCreateReservation: (newReservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => void;
  onCreateTicket: (newTicket: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'status' | 'slaTargetHours'>) => void;
  onOpenAiAssistant: (initialPrompt?: string) => void;
  onManageVisit: (command: Command) => DemoState;
  advertisingState: DemoState;
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
    }
  ) => void;
}

export const ResidentPortal: React.FC<ResidentPortalProps> = ({
  currentUser,
  currentUnit,
  invoices,
  payments,
  amenities,
  reservations,
  tickets,
  initialTab = 'overview',
  onOpenInvoice,
  onSubmitPayment,
  onCreateReservation,
  onCreateTicket,
  onOpenAiAssistant,
  onUpdateUnitHousehold,
  onManageVisit,
  advertisingState,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pay' | 'invoices' | 'reservations' | 'tickets' | 'household'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Household & Convivencia State
  const [householdOwnerPhone, setHouseholdOwnerPhone] = useState(currentUnit.ownerPhone || currentUser.phone);
  const [householdOwnerEmail, setHouseholdOwnerEmail] = useState(currentUnit.ownerEmail || currentUser.email);
  const [emergencyPhone, setEmergencyPhone] = useState(currentUnit.emergencyPhone || '+506 8888-0011');
  const [emergencyContactName, setEmergencyContactName] = useState(currentUnit.emergencyContactName || 'Contacto Familiar Inmediato');
  const [hasChildren, setHasChildren] = useState(currentUnit.hasChildren ?? (currentUnit.residents?.some((r) => r.childrenCount > 0) || false));
  const [childrenCount, setChildrenCount] = useState(currentUnit.residents?.reduce((acc, r) => acc + (r.childrenCount || 0), 0) || 0);
  const [childrenDetails, setChildrenDetails] = useState(currentUnit.residents?.find((r) => r.childrenDetails)?.childrenDetails || '');
  const [hasPets, setHasPets] = useState(currentUnit.hasPets ?? (currentUnit.residents?.some((r) => r.dogsCount > 0 || (r.catsCount || 0) > 0) || false));
  const [dogsCount, setDogsCount] = useState(currentUnit.residents?.reduce((acc, r) => acc + (r.dogsCount || 0), 0) || 0);
  const [dogsDetails, setDogsDetails] = useState(currentUnit.residents?.find((r) => r.dogsDetails)?.dogsDetails || '');
  const [catsCount, setCatsCount] = useState(currentUnit.residents?.reduce((acc, r) => acc + (r.catsCount || 0), 0) || 0);
  const [catsDetails, setCatsDetails] = useState(currentUnit.residents?.find((r) => r.catsDetails)?.catsDetails || '');
  const [vehiclesPlates, setVehiclesPlates] = useState(currentUnit.residents?.find((r) => r.vehiclesPlates)?.vehiclesPlates || 'SBN-992');
  const [vehiclesCount, setVehiclesCount] = useState(currentUnit.residents?.reduce((acc, r) => acc + (r.vehiclesCount || 0), 0) || 1);
  const [residencyDuration, setResidencyDuration] = useState(currentUnit.residents?.[0]?.residencyDuration || '2 años y 4 meses');
  const [unitResidents, setUnitResidents] = useState<ResidentMember[]>(currentUnit.residents || []);
  const [householdSuccessMessage, setHouseholdSuccessMessage] = useState<string | null>(null);
  const [householdTab, setHouseholdTab] = useState<'family' | 'visits'>('family');
  const [adRequestKey, setAdRequestKey] = useState(0);
  const householdTabsId = React.useId();
  const householdTabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  // New Resident Modal inside Resident Portal
  const [isAddResidentModalOpen, setIsAddResidentModalOpen] = useState(false);
  const [newResidentForm, setNewResidentForm] = useState<Omit<ResidentMember, 'id'>>({
    name: '',
    phone: '+506 ',
    email: '',
    relationship: 'Cónyuge / Pareja',
    residencyDuration: '1 año',
    dogsCount: 0,
    dogsDetails: '',
    catsCount: 0,
    catsDetails: '',
    childrenCount: 0,
    childrenDetails: '',
    vehiclesCount: 1,
    vehiclesPlates: '',
  });

  // Payment form state
  const [payAmount, setPayAmount] = useState(currentUnit.currentBalance > 0 ? currentUnit.currentBalance.toString() : currentUnit.monthlyQuota.toString());
  const [payMethod, setPayMethod] = useState<'sinpe' | 'transfer'>('sinpe');
  const [payReference, setPayReference] = useState('');
  const [payPhone, setPayPhone] = useState(currentUser.phone.replace('+506 ', ''));
  const [payBank, setPayBank] = useState('Banco Nacional (BNCR)');
  const [payConcept, setPayConcept] = useState(`Cuota Mantenimiento Octubre 2026 - ${currentUnit.number}`);
  const [payProofFile, setPayProofFile] = useState<string>('');
  const [payProofName, setPayProofName] = useState('Sin archivo adjunto');
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  // Reservation form state
  const [selectedAmenityId, setSelectedAmenityId] = useState<string>(amenities[0]?.id || '');
  const [resDate, setResDate] = useState(today());
  const [resSlot, setResSlot] = useState(amenities[0]?.reservationSlots[0] || '');
  const [resGuests, setResGuests] = useState(6);
  const [resNotes, setResNotes] = useState('');
  const [resSuccessMessage, setResSuccessMessage] = useState<string | null>(null);

  // Ticket form state
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Electricidad y Alumbrado');
  const [ticketPriority, setTicketPriority] = useState<'baja' | 'media' | 'alta' | 'urgente'>('media');
  const [ticketLocation, setTicketLocation] = useState(`Cerca de ${currentUnit.number}`);
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSuccessMessage, setTicketSuccessMessage] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payReference) {
      alert('Por favor indica el número de comprobante o referencia bancaria.');
      return;
    }

    const numAmount = Number(payAmount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) { alert('Indique un monto válido mayor que cero.'); return; }
    try { onSubmitPayment({
      unitId: currentUnit.id,
      unitNumber: currentUnit.number,
      payerName: currentUser.name,
      payerEmail: currentUser.email,
      amount: numAmount,
      method: payMethod,
      reference: payReference,
      phone: payPhone,
      bankName: payMethod === 'transfer' ? payBank : undefined,
      concept: payConcept,
      receiptProofUrl: payProofFile,
    }); } catch { return; }

    setPaymentSuccessMessage(`¡Pago reportado con éxito! Se ha generado tu identificador transaccional oficial.`);
    setPayReference('');
    setTimeout(() => {
      setPaymentSuccessMessage(null);
      setActiveTab('invoices');
    }, 2800);
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amenity = amenities.find((a) => a.id === selectedAmenityId);
    if (!amenity) return;

    try { onCreateReservation({
      amenityId: amenity.id,
      amenityName: amenity.name,
      unitNumber: currentUnit.number,
      residentName: currentUser.name,
      date: resDate,
      timeSlot: resSlot,
      guestsCount: resGuests,
      notes: resNotes,
    }); } catch { return; }

    setResSuccessMessage(`¡Reserva para ${amenity.name} registrada exitosamente!`);
    setTimeout(() => setResSuccessMessage(null), 3500);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDesc) return;

    try { onCreateTicket({
      title: ticketTitle,
      category: ticketCategory,
      description: ticketDesc,
      location: ticketLocation,
      priority: ticketPriority,
      unitNumber: currentUnit.number,
      residentName: currentUser.name,
    }); } catch { return; }

    setTicketSuccessMessage('¡Reporte generado! Nuestro equipo técnico responderá en un plazo máximo de 24 horas.');
    setTicketTitle('');
    setTicketDesc('');
    setTimeout(() => setTicketSuccessMessage(null), 3500);
  };

  const unitInvoices = invoices.filter((i) => i.unitId === currentUnit.id);
  const unitPayments = payments.filter((p) => p.unitId === currentUnit.id);
  const unitReservations = reservations.filter((r) => r.unitNumber === currentUnit.number);
  const unitTickets = tickets.filter((t) => t.unitNumber === currentUnit.number);

  const isUpToDate = currentUnit.currentBalance <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Resident Welcome Banner */}
      <div className="bg-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-8 border border-emerald-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Portal Privado del Condómino • {currentUnit.number}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Buenos días, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
              Bienvenido a tu centro de autoservicio de Residencial Pinar del Río. Consulta tu estado de cuenta, realiza pagos en línea con SINPE Móvil y reserva tus amenidades.
            </p>
          </div>

          {/* Balance card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 min-w-64 text-right">
            <span className="text-[11px] font-semibold text-emerald-200 block uppercase tracking-wider">
              Estado de Cuenta
            </span>
            <div className="mt-1 flex items-baseline justify-end gap-1">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
                ₡{currentUnit.currentBalance.toLocaleString('es-CR')}
              </span>
            </div>
            
            <div className="mt-2 flex items-center justify-end gap-1.5 text-xs">
              {isUpToDate ? (
                <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold bg-emerald-800/80 px-2 py-0.5 rounded-full text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Al día
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-300 font-semibold bg-amber-900/60 px-2 py-0.5 rounded-full text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  Cuota pendiente (Vence el 05)
                </span>
              )}
            </div>

            <button
              onClick={() => setActiveTab('pay')}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pagar cuota por SINPE</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs within Resident Portal */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-emerald-800/80 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            Resumen General
          </button>
          <button
            onClick={() => setActiveTab('pay')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pay'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pagar Cuota</span>
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'invoices'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Facturas & Recibos ({unitInvoices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reservations'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reservar Amenidades ({unitReservations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tickets'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Averías & Solicitudes ({unitTickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('household')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'household'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Mi Familia & Convivencia</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Quick status cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Filial Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tu Finca Filial
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{currentUnit.number}</h3>
              <p className="text-xs text-slate-500">{currentUnit.section}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Área Privativa:</span>
                  <span className="font-semibold text-slate-800">{currentUnit.areaM2} m²</span>
                </div>
                <div className="flex justify-between">
                  <span>Porcentaje Copropiedad:</span>
                  <span className="font-semibold text-slate-800">{currentUnit.participationPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cuota Mensual Base:</span>
                  <span className="font-mono font-semibold text-slate-800 tabular-nums">
                    ₡{currentUnit.monthlyQuota.toLocaleString('es-CR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Recent Payment / Next Due */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Obligación Condominal
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Cuota Octubre 2026</h3>
              <p className="text-xs text-slate-500">Fecha de corte: 05 de Octubre</p>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Monto Total:</span>
                  <span className="font-mono font-bold text-emerald-800 tabular-nums">
                    ₡{currentUnit.monthlyQuota.toLocaleString('es-CR')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Medio preferido:</span>
                  <span className="font-semibold text-sky-700">SINPE Móvil</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Teléfono receptor:</span>
                  <span className="font-mono font-bold text-slate-800">{CONDO_BANK_INFO.sinpePhone}</span>
                </div>
              </div>
            </div>

            {/* Card 3: AI Assistant shortcut */}
            <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-2xl p-6 border border-emerald-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Asistente Pinar del Río</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  ¿Dudas sobre cuotas, piscina o reglamentos?
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Consulta a nuestro agente inteligente en cualquier momento para obtener respuestas instantáneas sobre el residencial.
                </p>
              </div>

              <button
                onClick={() => onOpenAiAssistant('¿Cuál es mi estado de cuenta y cómo pago por SINPE Móvil?')}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preguntar al Asistente IA</span>
              </button>
            </div>
          </div>

          {/* Active Reservations & Invoices Teaser */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Invoices list */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Últimos Comprobantes de Cuota</span>
                </h3>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  Ver todos →
                </button>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {unitInvoices.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{inv.month}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {inv.id} • Vence: {inv.dueDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                        ₡{inv.total.toLocaleString('es-CR')}
                      </span>
                      <button
                        onClick={() => onOpenInvoice(inv)}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Descargar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Reservations */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Tus Reservas de Amenidades</span>
                </h3>
                <button
                  onClick={() => setActiveTab('reservations')}
                  className="text-xs font-semibold text-sky-700 hover:text-sky-900 cursor-pointer"
                >
                  Nueva reserva →
                </button>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {unitReservations.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No tienes reservas activas para esta semana.
                  </p>
                ) : (
                  unitReservations.map((res) => (
                    <div key={res.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{res.amenityName}</p>
                        <p className="text-[11px] text-slate-500">
                          {res.date} • Horario: {res.timeSlot}
                        </p>
                      </div>

                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Confirmada ({res.guestsCount} pers.)
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAY / REPORTE DE PAGOS */}
      {activeTab === 'pay' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Official Condo Banking Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cuentas Oficiales de Pinar del Río</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Canales Autorizados de Pago
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {CONDO_BANK_INFO.legalEntity} • Cédula Jurídica: {CONDO_BANK_INFO.legalId}
                </p>

                {/* SINPE Card */}
                <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        SINPE Móvil Institucional (24/7)
                      </span>
                      <p className="font-mono text-xl font-black text-emerald-950 mt-0.5">
                        {CONDO_BANK_INFO.sinpePhone}
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        Titular: {CONDO_BANK_INFO.sinpeOwner}
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard('88887462', 'sinpe')}
                      className="p-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                      title="Copiar número SINPE"
                    >
                      {copiedText === 'sinpe' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">Copiar</span>
                    </button>
                  </div>
                </div>

                {/* Bank Accounts */}
                <div className="mt-4 space-y-3">
                  {CONDO_BANK_INFO.accounts.map((acc, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{acc.bank}</span>
                        <button
                          onClick={() => copyToClipboard(acc.iban, `iban-${idx}`)}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedText === `iban-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>Copiar IBAN</span>
                        </button>
                      </div>
                      <p className="font-mono text-[11px] text-slate-600 mt-1 select-all break-all">
                        {acc.iban}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{acc.accountType}</p>
                    </div>
                  ))}
                </div>

                {/* Important notice */}
                <div className="mt-4 text-[11px] text-slate-500 bg-amber-50/80 p-3 rounded-xl border border-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Todo pago realizado mediante SINPE o transferencia debe ser reportado mediante este formulario para asignar tu código transaccional único <strong>PAY-2026-XXXXXX</strong>.
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Payment Report Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
                <h3 className="text-lg font-bold text-slate-900">
                  Reportar Pago de Cuota Condominal
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Completa los datos del comprobante para actualizar el saldo de {currentUnit.number}.
                </p>

                {paymentSuccessMessage && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="font-semibold">{paymentSuccessMessage}</p>
                  </div>
                )}

                <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4">
                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Método de Pago Utilizado
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPayMethod('sinpe')}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          payMethod === 'sinpe'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>SINPE Móvil</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMethod('transfer')}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          payMethod === 'transfer'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <FileText className="w-4 h-4 text-sky-600" />
                        <span>Transferencia Bancaria</span>
                      </button>
                    </div>
                  </div>

                  {/* Amount and concept */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Monto Cancelado (₡ Colones)
                      </label>
                      <input
                        type="number"
                        required
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Concepto / Mes
                      </label>
                      <input
                        type="text"
                        required
                        value={payConcept}
                        onChange={(e) => setPayConcept(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Reference & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {payMethod === 'sinpe' ? 'Número de Comprobante SINPE' : 'Referencia Bancaria'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={payMethod === 'sinpe' ? 'ej. 84920193' : 'ej. TR-9081293'}
                        value={payReference}
                        onChange={(e) => setPayReference(e.target.value)}
                        className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>

                    {payMethod === 'sinpe' ? (
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Teléfono Emisor del SINPE
                        </label>
                        <input
                          type="tel"
                          required
                          value={payPhone}
                          onChange={(e) => setPayPhone(e.target.value)}
                          placeholder="8877-3322"
                          className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Banco de Origen
                        </label>
                        <select
                          value={payBank}
                          onChange={(e) => setPayBank(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        >
                          <option value="Banco Nacional (BNCR)">Banco Nacional (BNCR)</option>
                          <option value="BAC Credomatic">BAC Credomatic</option>
                          <option value="Banco de Costa Rica (BCR)">Banco de Costa Rica (BCR)</option>
                          <option value="Banco Popular">Banco Popular</option>
                          <option value="Scotiabank">Scotiabank</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Proof Attachment */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Comprobante Digital (Captura o PDF)
                    </label>
                    <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
                      <Upload className="w-6 h-6 text-slate-400 mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        {payProofName}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {payProofFile ? 'Comprobante listo para revisión administrativa' : 'Imagen o PDF · Máximo 2 MB · Guardado solo en este navegador'}
                      </p>
                      <input type="file" aria-label="Adjuntar comprobante" accept="image/png,image/jpeg,application/pdf" className="mt-3 text-xs max-w-full" onChange={e=>{
                        const file=e.target.files?.[0];if(!file)return;
                        if(file.size>2*1024*1024||!['image/png','image/jpeg','application/pdf'].includes(file.type)){alert('Seleccione una imagen PNG/JPG o PDF de hasta 2 MB.');e.target.value='';return;}
                        const reader=new FileReader();reader.onload=()=>{setPayProofFile(String(reader.result));setPayProofName(file.name);};reader.onerror=()=>alert('No se pudo leer el comprobante.');reader.readAsDataURL(file);
                      }}/>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Reporte y Generar Código Transaccional</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FACTURAS & RECIBOS */}
      {activeTab === 'invoices' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Estados de Cuenta & Facturación Oficial
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Documentos y certificaciones para la Finca Filial {currentUnit.number}.
                </p>
              </div>

              <button
                onClick={() => {
                  if (unitInvoices[0]) onOpenInvoice(unitInvoices[0]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Certificación de Cuotas al Día</span>
              </button>
            </div>

            {/* Invoices List */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Comprobante</th>
                    <th className="py-3 px-4">Período</th>
                    <th className="py-3 px-4">Vencimiento</th>
                    <th className="py-3 px-4 text-right">Monto</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unitInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {inv.id}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{inv.month}</td>
                      <td className="py-3 px-4 text-slate-500">{inv.dueDate}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ₡{inv.total.toLocaleString('es-CR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {inv.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Pagado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenInvoice(inv)}
                          className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Ver / Descargar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payments History */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-3">
                Historial de Pagos Transaccionales (Código PAY)
              </h4>
              <div className="space-y-2">
                {unitPayments.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{p.id}</span>
                        <span className="text-[10px] text-slate-500">• {p.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {p.concept} — {p.method === 'sinpe' ? 'SINPE Móvil' : 'Transferencia'} (Ref: {p.reference})
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-bold text-emerald-800 tabular-nums">
                        ₡{p.amount.toLocaleString('es-CR')}
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                        {p.status === 'applied' ? 'Aplicado' : 'En validación'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESERVAS DE AMENIDADES */}
      {activeTab === 'reservations' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Amenities Grid */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Amenidades Disponibles en Pinar del Río
              </h3>
              <button type="button" className="ad-entry-button" onClick={() => setAdRequestKey(n => n + 1)}>Solicitar anuncio</button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenities.map((amenity) => {
                  const isSelected = selectedAmenityId === amenity.id;
                  return (
                    <div
                      key={amenity.id}
                      onClick={() => {
                        setSelectedAmenityId(amenity.id);
                        setResSlot(amenity.reservationSlots[0] || '');
                      }}
                      className={`rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/30 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900">{amenity.name}</h4>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              Seleccionada
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {amenity.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Aforo Máximo:</span>
                          <span className="font-semibold text-slate-800">{amenity.capacity} personas</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Horario:</span>
                          <span className="font-semibold text-slate-800">{amenity.schedule.split(':')[0]}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Reservations */}
              <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-3">
                  Tus Reservas Agendadas
                </h4>
                {unitReservations.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No tienes reservas agendadas actualmente.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {unitReservations.map((res) => (
                      <div key={res.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{res.amenityName}</p>
                          <p className="text-[11px] text-slate-500">
                            Fecha: {res.date} • Horario: {res.timeSlot} • {res.guestsCount} invitados
                          </p>
                          {res.notes && <p className="text-[10px] text-slate-400 italic">"{res.notes}"</p>}
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Confirmada
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reservation Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
                <h3 className="text-base font-bold text-slate-900">
                  Agendar Espacio Comunitario
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reserva para la Finca Filial {currentUnit.number}.
                </p>

                {resSuccessMessage && (
                  <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{resSuccessMessage}</span>
                  </div>
                )}

                <form onSubmit={handleReservationSubmit} className="mt-5 space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Espacio a Reservar
                    </label>
                    <select
                      value={selectedAmenityId}
                      onChange={(e) => {
                        setSelectedAmenityId(e.target.value);
                        const a = amenities.find((item) => item.id === e.target.value);
                        if (a) setResSlot(a.reservationSlots[0] || '');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      {amenities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Fecha del Evento
                    </label>
                    <input
                      type="date"
                      required
                      value={resDate}
                      onChange={(e) => setResDate(e.target.value)}
                      min={today()}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Horario / Turno Disponible
                    </label>
                    <select
                      value={resSlot}
                      onChange={(e) => setResSlot(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      {amenities
                        .find((a) => a.id === selectedAmenityId)
                        ?.reservationSlots.map((slot, idx) => (
                          <option key={idx} value={slot}>
                            {slot}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Número Estimado de Asistentes
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={amenities.find((a) => a.id === selectedAmenityId)?.capacity || 30}
                      value={resGuests}
                      onChange={(e) => setResGuests(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Motivo / Notas adicionales (opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={resNotes}
                      onChange={(e) => setResNotes(e.target.value)}
                      placeholder="ej. Celebración de cumpleaños familiar..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Confirmar Reserva
                  </button>
                </form>
              </div>
            </div>
        </div>
          <React.Suspense fallback={<p role="status">Preparando anuncios…</p>}><AdManager state={advertisingState} user={currentUser} run={onManageVisit} requestKey={adRequestKey} /></React.Suspense>
        </div>
      )}

      {/* TAB 5: TICKETS & MANTENIMIENTO */}
      {activeTab === 'tickets' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Tickets list */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Historial de Solicitudes & Reportes Técnicos
              </h3>

              <div className="space-y-3">
                {unitTickets.map((tck) => (
                  <div key={tck.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">{tck.id}</span>
                          <span className="text-[10px] text-slate-400">• {tck.createdAt}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 mt-1">{tck.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{tck.description}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                          tck.priority === 'urgente' || tck.priority === 'alta'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tck.priority}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Ubicación: {tck.location}</span>
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        Estado: {tck.status === 'en_proceso' ? 'En proceso' : 'Nuevo'} (SLA {tck.slaTargetHours}h)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Ticket Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
                <h3 className="text-base font-bold text-slate-900">
                  Reportar Avería o Solicitud
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atención directa con trazabilidad para la filial {currentUnit.number}.
                </p>

                {ticketSuccessMessage && (
                  <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{ticketSuccessMessage}</span>
                  </div>
                )}

                <form onSubmit={handleTicketSubmit} className="mt-5 space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Título Breve del Problema
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Alumbrado sin funcionar cerca de la acera"
                      value={ticketTitle}
                      onChange={(e) => setTicketTitle(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="Electricidad y Alumbrado">Electricidad y Alumbrado</option>
                      <option value="Fontanería & Riego">Fontanería & Riego</option>
                      <option value="Zonas Verdes & Jardines">Zonas Verdes & Jardines</option>
                      <option value="Portón & Seguridad">Portón & Seguridad</option>
                      <option value="Piscina & Recreación">Piscina & Recreación</option>
                      <option value="Consulta Administrativa">Consulta Administrativa</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Prioridad
                      </label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={ticketLocation}
                        onChange={(e) => setTicketLocation(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Descripción Detallada
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Detalla lo observado para que el técnico acuda con el material necesario..."
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Crear Reporte Técnico
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MI FAMILIA & CONVIVENCIA (PUNTOS DE CONTACTO, HIJOS, MASCOTAS, VEHÍCULOS) */}
      {activeTab === 'household' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {householdSuccessMessage && householdTab === 'family' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{householdSuccessMessage}</span>
              </div>
              <button onClick={() => setHouseholdSuccessMessage(null)} className="text-emerald-700 font-bold">×</button>
            </div>
          )}

          {/* Top Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                <Home className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Mi familia y convivencia • {currentUnit.number}
                </h3>
                <p className="text-xs text-slate-500">
                  {currentUnit.section} • Consulte los datos de su hogar y gestione las visitas autorizadas para su filial.
                </p>
              </div>
            </div>
          </div>

          <div className="household-tabs" role="tablist" aria-label="Familia y visitas">
            {([['family', 'Condóminos'], ['visits', 'Visitas aprobadas']] as const).map(([id, label], index) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`${householdTabsId}-${id}-tab`}
                aria-controls={`${householdTabsId}-${id}-panel`}
                aria-selected={householdTab === id}
                tabIndex={householdTab === id ? 0 : -1}
                ref={node => { householdTabRefs.current[index] = node; }}
                onClick={() => setHouseholdTab(id)}
                onKeyDown={event => {
                  const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : ['ArrowLeft', 'ArrowRight'].includes(event.key) ? 1 - index : null;
                  if (next === null) return;
                  event.preventDefault();
                  setHouseholdTab(next === 0 ? 'family' : 'visits');
                  householdTabRefs.current[next]?.focus();
                }}
              >{label}</button>
            ))}
          </div>

          <div className="household-tab-panel" role="tabpanel" id={`${householdTabsId}-visits-panel`} aria-labelledby={`${householdTabsId}-visits-tab`} hidden={householdTab !== 'visits'}>
            <ApprovedVisits unit={currentUnit} run={onManageVisit} />
          </div>

          <div className="household-tab-panel space-y-6" role="tabpanel" id={`${householdTabsId}-family-panel`} aria-labelledby={`${householdTabsId}-family-tab`} hidden={householdTab !== 'family'}>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateUnitHousehold) {
                onUpdateUnitHousehold(currentUnit.id, {
                  ownerPhone: householdOwnerPhone,
                  ownerEmail: householdOwnerEmail,
                  emergencyPhone,
                  emergencyContactName,
                  hasChildren,
                  hasPets,
                  residents: unitResidents,
                });
              }
              setHouseholdSuccessMessage('¡Información de tu filial actualizada correctamente!');
              setTimeout(() => setHouseholdSuccessMessage(null), 4000);
            }}
            className="space-y-6 text-xs"
          >
            {/* Bloque 1: Puntos de Contacto Oficiales */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Phone className="w-4 h-4 text-emerald-700" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  Puntos de Contacto del Condómino
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono Principal (Móvil)</label>
                  <input
                    type="text"
                    required
                    value={householdOwnerPhone}
                    onChange={(e) => setHouseholdOwnerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Para llamadas de caseta y avisos SINPE</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correo Electrónico Oficial</label>
                  <input
                    type="email"
                    required
                    value={householdOwnerEmail}
                    onChange={(e) => setHouseholdOwnerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Recepción de recibos, facturas y comunicados</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tiempo de Residencia</label>
                  <input
                    type="text"
                    value={residencyDuration}
                    onChange={(e) => setResidencyDuration(e.target.value)}
                    placeholder="Ej: 3 años y 2 meses"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Antigüedad habitando en el condominio</span>
                </div>
              </div>

              {/* Contacto de Emergencia */}
              <div className="pt-2 border-t border-slate-100">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 block mb-2">
                  Contacto para Casos de Emergencia (24/7)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nombre del Contacto de Emergencia</label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="Familiar cercano o representante"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Teléfono de Emergencia</label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+506 8888-0000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bloque 2: Hijos y Convivencia Familiar */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-sky-700" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Menores de Edad & Hijos en el Hogar
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasChildrenCheckbox"
                    checked={hasChildren}
                    onChange={(e) => setHasChildren(e.target.checked)}
                    className="rounded text-emerald-800"
                  />
                  <label htmlFor="hasChildrenCheckbox" className="font-bold text-slate-800 cursor-pointer">
                    ¿Habitan hijos o menores en esta filial?
                  </label>
                </div>
              </div>

              {hasChildren ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cantidad de Hijos</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Nombres y Edades de los Hijos</label>
                    <input
                      type="text"
                      value={childrenDetails}
                      onChange={(e) => setChildrenDetails(e.target.value)}
                      placeholder="Ej: Sofía (8 años), Mateo (4 años)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Para censos comunitarios, eventos infantiles y protocolos de seguridad</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic text-[11px]">
                  No se han registrado menores de edad habitando en esta unidad.
                </p>
              )}
            </div>

            {/* Bloque 3: Mascotas (Perros y Gatos) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Dog className="w-4 h-4 text-amber-700" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Mascotas en la Filial (Registro Canino & Felino)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasPetsCheckbox"
                    checked={hasPets}
                    onChange={(e) => setHasPets(e.target.checked)}
                    className="rounded text-emerald-800"
                  />
                  <label htmlFor="hasPetsCheckbox" className="font-bold text-slate-800 cursor-pointer">
                    ¿Tienen mascotas en la filial?
                  </label>
                </div>
              </div>

              {hasPets ? (
                <div className="space-y-4 pt-1">
                  {/* Perros */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <Dog className="w-4 h-4 text-amber-800" />
                      <span className="font-extrabold text-slate-900">Perros</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Cantidad de Perros</label>
                        <input
                          type="number"
                          min="0"
                          value={dogsCount}
                          onChange={(e) => setDogsCount(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">Razas y Nombres de los Perros</label>
                        <input
                          type="text"
                          value={dogsDetails}
                          onChange={(e) => setDogsDetails(e.target.value)}
                          placeholder="Ej: Golden Retriever llamado Toby, Beagle llamada Luna"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gatos */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-600" />
                      <span className="font-extrabold text-slate-900">Gatos</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Cantidad de Gatos</label>
                        <input
                          type="number"
                          min="0"
                          value={catsCount}
                          onChange={(e) => setCatsCount(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">Nombres y Detalles de los Gatos</label>
                        <input
                          type="text"
                          value={catsDetails}
                          onChange={(e) => setCatsDetails(e.target.value)}
                          placeholder="Ej: Gato persa llamado Misi, Gato común llamado Oreo"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic text-[11px]">
                  No se han registrado mascotas en esta unidad habitacional.
                </p>
              )}
            </div>

            {/* Bloque 4: Vehículos y Placas para Acceso en Aguja */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Car className="w-4 h-4 text-indigo-700" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  Vehículos Autorizados & Placas para Caseta de Seguridad
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cantidad de Vehículos</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={vehiclesCount}
                    onChange={(e) => setVehiclesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Número de Placas Autorizadas</label>
                  <input
                    type="text"
                    value={vehiclesPlates}
                    onChange={(e) => setVehiclesPlates(e.target.value)}
                    placeholder="Ej: SBN-992, JBC-110, QWE-889"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono uppercase"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Los oficiales de seguridad en caseta consultan estas placas para permitir el ingreso fluido sin demora.
                  </span>
                </div>
              </div>
            </div>

            {/* Bloque 5: Miembros del Hogar / Residentes Registrados */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-800" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Residentes Registrados en esta Filial ({unitResidents.length})
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddResidentModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Familiar o Residente</span>
                </button>
              </div>

              {unitResidents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unitResidents.map((res) => (
                    <div
                      key={res.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2 hover:border-emerald-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-xs">{res.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            {res.relationship}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Tel: <span className="font-mono text-slate-700">{res.phone}</span> • Email: <span className="text-slate-700">{res.email}</span>
                        </p>
                        {res.residencyDuration && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Habita desde hace: {res.residencyDuration}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                        <span>Vehículo: {res.vehiclesPlates || 'N/A'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = unitResidents.filter((r) => r.id !== res.id);
                            setUnitResidents(updated);
                          }}
                          className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-xs py-2">
                  No hay residentes adicionales registrados. Puedes agregar a tu pareja, hijos o inquilinos.
                </p>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Información de mi Filial</span>
              </button>
            </div>
          </form>

          {/* Modal para Agregar Residente en Resident Portal */}
          {isAddResidentModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900">
                    Agregar Residente a {currentUnit.number}
                  </h3>
                  <button
                    onClick={() => setIsAddResidentModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                  >
                    ×
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newResidentForm.name) return;
                    const newRes: ResidentMember = {
                      ...newResidentForm,
                      id: `res-${Date.now()}`,
                    };
                    setUnitResidents([...unitResidents, newRes]);
                    setIsAddResidentModalOpen(false);
                    setNewResidentForm({
                      name: '',
                      phone: '+506 ',
                      email: '',
                      relationship: 'Cónyuge / Pareja',
                      residencyDuration: '1 año',
                      dogsCount: 0,
                      dogsDetails: '',
                      catsCount: 0,
                      catsDetails: '',
                      childrenCount: 0,
                      childrenDetails: '',
                      vehiclesCount: 1,
                      vehiclesPlates: '',
                    });
                  }}
                  className="space-y-3 text-xs"
                >
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={newResidentForm.name}
                      onChange={(e) => setNewResidentForm({ ...newResidentForm, name: e.target.value })}
                      placeholder="Ej: Gabriela Castro Salazar"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Parentesco</label>
                      <select
                        value={newResidentForm.relationship}
                        onChange={(e) => setNewResidentForm({ ...newResidentForm, relationship: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="Propietario Principal">Propietario Principal</option>
                        <option value="Cónyuge / Pareja">Cónyuge / Pareja</option>
                        <option value="Hijo(a)">Hijo(a)</option>
                        <option value="Familiar">Familiar</option>
                        <option value="Inquilino / Arrendatario">Inquilino / Arrendatario</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Teléfono Móvil</label>
                      <input
                        type="text"
                        value={newResidentForm.phone}
                        onChange={(e) => setNewResidentForm({ ...newResidentForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={newResidentForm.email}
                      onChange={(e) => setNewResidentForm({ ...newResidentForm, email: e.target.value })}
                      placeholder="correo@ejemplo.cr"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddResidentModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer"
                    >
                      Registrar en mi Filial
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

