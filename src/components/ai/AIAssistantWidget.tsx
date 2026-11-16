import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Unit } from '../../types';
import { CONDO_BANK_INFO } from '../../data/mockData';
import {
  Sparkles,
  X,
  Send,
  MessageSquare,
  Bot,
  User,
  CreditCard,
  Calendar,
  FileText,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface AIAssistantWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  currentUser?: UserProfile | null;
  currentUnit?: Unit;
  onNavigateToResident: (tab?: string) => void;
  initialPrompt?: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  quickAction?: {
    label: string;
    tab: string;
  };
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  isOpen,
  onToggle,
  currentUser,
  currentUnit,
  onNavigateToResident,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: currentUser
        ? `¡Hola ${currentUser.name.split(' ')[0]}! Soy tu Asistente Inteligente de Residencial Pinar del Río. Estoy aquí para resolver tus dudas sobre el estado de tu filial (${currentUnit?.number || ''}), cuotas condominales, SINPE Móvil, reservas de amenidades o el reglamento de convivencia. ¿En qué te puedo colaborar hoy?`
        : `¡Hola! Soy el Asistente Inteligente de Residencial Pinar del Río. Puedo ayudarte con información sobre pagos de cuotas por SINPE Móvil, números de cuenta IBAN, amenidades, eventos y el reglamento de convivencia del residencial. ¿En qué te puedo orientar hoy?`,
      time: 'Ahora',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const consumedPrompt = useRef<string | undefined>(undefined);
  useEffect(() => () => pendingTimers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (initialPrompt && isOpen && consumedPrompt.current !== initialPrompt) {
      consumedPrompt.current = initialPrompt;
      handleUserQuery(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickQuestions = [
    '¿Cuánto debo de cuota?',
    '¿Cómo pago por SINPE Móvil?',
    '¿Horarios y reglas de la piscina?',
    '¿Cómo reservo el Rancho BBQ?',
    '¿Qué dice el reglamento sobre mascotas?',
    '¿Cómo reporto una avería?',
  ];

  const handleUserQuery = (query: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const timer = setTimeout(() => {
      const lower = query.toLowerCase();
      let responseText = '';
      let quickAction: { label: string; tab: string } | undefined;

      if (lower.includes('debo') || lower.includes('saldo') || lower.includes('cuota') || lower.includes('vence') || lower.includes('monto')) {
        if (currentUnit) {
          if (currentUnit.currentBalance > 0) {
            responseText = `Para la Finca ${currentUnit.number} tienes un saldo pendiente de ₡${currentUnit.currentBalance.toLocaleString('es-CR')} correspondiente a la cuota del mes. Recuerda que la fecha límite es el día 05 de cada mes para evitar recargos. Puedes reportar tu pago por SINPE Móvil (${CONDO_BANK_INFO.sinpePhone}) ahora mismo.`;
            quickAction = { label: 'Reportar pago en línea', tab: 'pay' };
          } else {
            responseText = `¡Excelente noticia! La Finca ${currentUnit.number} se encuentra totalmente AL DÍA con un saldo de ₡0. Tu cuota mensual regular es de ₡${currentUnit.monthlyQuota.toLocaleString('es-CR')}.`;
            quickAction = { label: 'Ver facturas y recibos', tab: 'invoices' };
          }
        } else {
          responseText = `Las cuotas condominales de mantenimiento en Residencial Pinar del Río oscilan entre ₡78.000 y ₡92.000 mensuales según el metraje de la finca filial. Para consultar el saldo exacto y descargar tus facturas oficiales, inicia sesión con tu número de filial en el botón superior de "Iniciar Sesión".`;
        }
      } else if (lower.includes('sinpe') || lower.includes('banco') || lower.includes('cuenta') || lower.includes('transferencia') || lower.includes('iban')) {
        responseText = `Los canales oficiales autorizados de Pinar del Río son:\n\n• SINPE Móvil Institucional: ${CONDO_BANK_INFO.sinpePhone} a nombre de "${CONDO_BANK_INFO.sinpeOwner}" (Cédula ${CONDO_BANK_INFO.legalId}).\n• Banco Nacional: IBAN ${CONDO_BANK_INFO.accounts[0].iban}\n• BAC Credomatic: IBAN ${CONDO_BANK_INFO.accounts[1].iban}\n\nUna vez realizado el depósito, solo adjuntas el comprobante en el portal para generar tu código transaccional PAY-2026-XXXXXX.`;
        quickAction = { label: 'Ir al formulario de pago', tab: 'pay' };
      } else if (lower.includes('piscina') || lower.includes('alberca')) {
        responseText = `La Piscina Semiolímpica está abierta de martes a domingo de 06:00 a 22:00 horas (los lunes cierra por tratamiento químico y mantenimiento de filtros). Se exige uso obligatorio de ducha antes del ingreso, no se admiten mascotas en el perímetro húmedo ni envases de vidrio.`;
        quickAction = { label: 'Ver amenidades', tab: 'reservations' };
      } else if (lower.includes('rancho') || lower.includes('bbq') || lower.includes('casa club') || lower.includes('reserva')) {
        responseText = `Puedes reservar el Rancho BBQ Los Pinos o la Casa Club Principal directamente desde la pestaña de Reservas. El Rancho cuenta con aforo para 25 personas y se solicita un depósito de limpieza de ₡15.000 reembolsable al entregar el área en orden.`;
        quickAction = { label: 'Agendar una reserva', tab: 'reservations' };
      } else if (lower.includes('mascota') || lower.includes('perro') || lower.includes('ruido') || lower.includes('reglamento')) {
        responseText = `Conforme al Reglamento Interno (Art. 15): Las mascotas deben pasear siempre con correa en todas las zonas comunes y sus propietarios deben recoger las heces inmediatamente. Asimismo, el horario de silencio rige de 22:00 a 06:00 horas todos los días.`;
      } else if (lower.includes('fuga') || lower.includes('avería') || lower.includes('lámpara') || lower.includes('reporte') || lower.includes('ticket')) {
        responseText = `Para reportar cualquier daño en áreas verdes, bombas de agua o alumbrado eléctrico, puedes abrir un ticket de mantenimiento. El equipo técnico cuenta con un SLA de respuesta en menos de 24 horas y resolución en 48-72 horas.`;
        quickAction = { label: 'Abrir reporte técnico', tab: 'tickets' };
      } else {
        responseText = `Con gusto te asisto. Puedes consultarme sobre tus cuotas condominales, cómo pagar por SINPE Móvil al ${CONDO_BANK_INFO.sinpePhone}, reservas del Rancho BBQ o piscina, y reglas de convivencia de Residencial Pinar del Río.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickAction,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 450);
    pendingTimers.current.push(timer);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const q = inputText.trim();
    setInputText('');
    handleUserQuery(q);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 no-print">
        <button
          onClick={onToggle}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-emerald-700/60"
          aria-label="Abrir asistente de IA"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-lime-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-lime-400 ring-2 ring-emerald-900" />
          </div>
          
          <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
            <span className="text-xs font-bold tracking-tight">Asistente IA</span>
            <span className="text-[10px] text-emerald-300">Pinar del Río</span>
          </div>

          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        </button>
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[580px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200 no-print">
          {/* Header */}
          <div className="bg-emerald-900 text-white p-4 flex items-center justify-between border-b border-emerald-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 border border-emerald-700 flex items-center justify-center text-lime-400 font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs flex items-center gap-1.5">
                  <span>Asistente Pinar del Río</span>
                  <span className="text-[9px] bg-lime-400 text-emerald-950 font-extrabold px-1.5 py-0.2 rounded-full">
                    EN VIVO
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-200">
                  {currentUser && currentUnit
                    ? `Contexto: ${currentUnit.number} (${currentUser.name.split(' ')[0]})`
                    : 'Atención a visitantes y condóminos'}
                </p>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
              aria-label="Cerrar chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleUserQuery(q)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-600 hover:text-emerald-800 whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-800 text-lime-400 flex items-center justify-center shrink-0 text-xs mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 shadow-2xs whitespace-pre-line leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-800 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Contextual Quick Action Button */}
                  {m.quickAction && (
                    <button
                      onClick={() => {
                        onNavigateToResident(m.quickAction?.tab);
                        onToggle();
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded-lg border border-sky-200 text-[11px] transition-colors cursor-pointer"
                    >
                      <span>{m.quickAction.label}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}

                  <span
                    className={`block text-[9px] mt-1 text-right font-mono ${
                      m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-slate-400">
                <div className="w-6 h-6 rounded-lg bg-emerald-800 text-lime-400 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span className="italic">El asistente está consultando la información...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pregunta sobre cuotas, SINPE, amenidades..."
              className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
