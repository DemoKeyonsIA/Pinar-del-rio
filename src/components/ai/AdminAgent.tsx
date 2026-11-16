import { useEffect, useRef, useState } from "react";
import { ArrowUp, X, ArrowUpRight, RotateCcw } from "lucide-react";
import { money, type DemoState } from "../../domain/demo";
import type { UserProfile } from "../../types";

export function AgentSymbol() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill="#5979B5" />
      <path
        d="M50 30 54.4 45.6 70 50 54.4 54.4 50 70 45.6 54.4 30 50 45.6 45.6Z"
        fill="#F4F4FF"
      />
      <circle
        cx="87"
        cy="13"
        r="9"
        fill="#CFD2F3"
        stroke="#10122A"
        strokeWidth="3"
      />
    </svg>
  );
}
interface Message {
  id: string;
  who: "agent" | "user";
  text: string;
  target?: string;
}
export function AdminAgent({
  state,
  user,
  navigate,
  onQuery,
}: {
  state: DemoState;
  user: UserProfile;
  navigate: (target: string) => void;
  onQuery: () => boolean;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const end = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const launch = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    end.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "nearest",
    });
  }, [messages, typing]);
  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);
  const close = () => {
    setOpen(false);
    launch.current?.focus();
  };
  const send = (text: string) => {
    if (!text.trim() || typing) return;
    if (!onQuery()) return;
    setInput("");
    setMessages((m) => [...m, { id: crypto.randomUUID(), who: "user", text }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      const q = text.toLowerCase();
      let response =
        "Puedo ayudarle a revisar pagos, consultar pendientes, entender los indicadores o localizar el historial de una operación.";
      let target = "";
      if (/pago|cobr|saldo|recaud|tesorer/.test(q)) {
        const pending = state.payments.filter((p) =>
          ["reported", "pending_validation"].includes(p.status),
        );
        response = `Hay ${pending.length} pagos por validar por ${money(pending.reduce((n, p) => n + p.amount, 0))}. El saldo pendiente de las filiales es ${money(state.units.reduce((n, u) => n + Math.max(0, u.currentBalance), 0))}. Abra Tesorería para revisar comprobantes antes de confirmar.`;
        target = "treasury";
      } else if (/inciden|manten|aver/.test(q)) {
        const open = state.tickets.filter(
          (t) => !["resuelto", "cerrado"].includes(t.status),
        );
        response = `Hay ${open.length} incidencias abiertas; ${open.filter((t) => ["alta", "urgente"].includes(t.priority)).length} tienen prioridad alta o urgente. Puede revisar responsables e historial en Mantenimiento.`;
        target = "maintenance";
      } else if (/histori|traza|quién|quien|actividad/.test(q)) {
        response = `La bitácora contiene ${state.audit.length} eventos. Cada operación conserva su usuario, fecha, resultado y cambios. Puede filtrar por usuario o registro.`;
        target = "audit";
      } else if (/planilla|salario|personal/.test(q)) {
        response = `Hay ${state.employees.filter((e) => e.status === "activo").length} empleados activos y ${state.payrollRuns.length} períodos registrados. Los cálculos de esta demo no realizan transferencias bancarias.`;
        target = "people";
      } else if (/import|excel/.test(q)) {
        response =
          "Seleccione el tipo de archivo, revise la vista previa y corrija los errores antes de confirmar. Los pagos se concilian mediante la misma operación que los recibos y los duplicados se omiten.";
        target = "imports";
      }
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), who: "agent", text: response, target },
      ]);
      setTyping(false);
    }, 380);
  };
  return (
    <div className="admin-agent">
      <button
        ref={launch}
        className="agent-launcher"
        aria-label={open ? "Cerrar chat con Estela" : "Abrir chat con Estela"}
        title="Estela"
        aria-expanded={open}
        aria-controls="admin-agent-panel"
        onClick={() => (open ? close() : setOpen(true))}
      >
        <AgentSymbol />
      </button>
      {open && (
        <section
          ref={panel}
          id="admin-agent-panel"
          className="agent-panel"
          role="dialog"
          aria-label="Chat con Estela"
          aria-describedby="agent-keyboard-help"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
        >
          <header>
            <div className="agent-avatar">
              <AgentSymbol />
            </div>
            <div>
              <strong>Estela</strong>
              <small>Asistente de demostración</small>
            </div>
            <button aria-label="Cerrar conversación" onClick={close}>
              <X size={20} />
            </button>
          </header>
          <div
            className="agent-messages"
            role="log"
            aria-label="Mensajes de la conversación"
            aria-live="polite"
            aria-atomic="false"
            aria-relevant="additions text"
          >
            {!messages.length && (
              <div className="agent-welcome">
                <span className="eyebrow">UN POCO MÁS DE CLARIDAD</span>
                <h3>¿Qué revisamos hoy?</h3>
                <p>
                  Hola, {user.name.replace("Licda. ", "").split(" ")[0]}. Puedo
                  orientarle con los datos actuales del residencial.
                </p>
                <div className="agent-suggestions">
                  {[
                    "¿Qué pagos están pendientes?",
                    "Revisar mantenimiento",
                    "Consultar trazabilidad",
                  ].map((q) => (
                    <button key={q} onClick={() => send(q)}>
                      {q}
                      <ArrowUpRight size={16} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`agent-message ${m.who}`}>
                <span>{m.who === "agent" ? "Estela" : "Usted"}</span>
                <p>{m.text}</p>
                {m.target && (
                  <button
                    className="text-action"
                    onClick={() => {
                      navigate(m.target!);
                      close();
                    }}
                  >
                    Abrir módulo <ArrowUpRight size={15} />
                  </button>
                )}
              </div>
            ))}
            {typing && (
              <div className="agent-thinking" role="status">
                Consultando los datos de la demo…
              </div>
            )}
            <div ref={end} />
          </div>
          {messages.length > 0 && (
            <button
              className="agent-clear"
              onClick={() => {
                clearTimeout(timer.current);
                setTyping(false);
                setMessages([]);
              }}
            >
              <RotateCcw size={13} /> Nueva conversación
            </button>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <span className="sr-only" id="agent-keyboard-help">
              Enter envía el mensaje; Mayús y Enter agrega una línea. Escape
              cierra el chat. Puede usar Tab para salir al panel.
            </span>
            <label className="sr-only" htmlFor="agent-input">
              Mensaje para el agente
            </label>
            <textarea
              id="agent-input"
              ref={field}
              rows={1}
              placeholder="Pregunte sobre su operación…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <button
              aria-label="Enviar mensaje"
              disabled={!input.trim() || typing}
            >
              <ArrowUp size={20} />
            </button>
          </form>
          <footer>
            Respuestas basadas en reglas · Sin acciones automáticas
          </footer>
        </section>
      )}
    </div>
  );
}
