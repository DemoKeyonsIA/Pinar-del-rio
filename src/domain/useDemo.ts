import { useRef, useState } from "react";
import type { UserProfile } from "../types";
import {
  execute,
  initialState,
  loadState,
  STORAGE_KEY,
  type Command,
  type DemoState,
} from "./demo";

export function useDemo() {
  const [startup] = useState(() => {
    try {
      return { state: loadState(), error: "" };
    } catch (e) {
      return { state: initialState(), error: String(e) };
    }
  });
  const [state, setState] = useState(startup.state);
  const current = useRef(state);
  const [error, setError] = useState(startup.error);
  const commit = (next: DemoState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      current.current = next;
      setState(next);
      setError("");
      return true;
    } catch {
      setError(
        "No se pudo guardar la operación. El almacenamiento local puede estar lleno o bloqueado. Los datos anteriores se conservaron.",
      );
      return false;
    }
  };
  const run = (actor: UserProfile | null, command: Command) => {
    const next = execute(current.current, actor, command);
    const last = next.audit.at(-1);
    if (!commit(next)) throw new Error("No se pudo guardar la operación.");
    if (last?.outcome !== "success") {
      setError(last?.reason || "Operación bloqueada.");
      throw new Error(last?.reason);
    }
    return next;
  };
  return {
    state,
    error,
    clearError: () => setError(""),
    run,
    reset: (actor: UserProfile | null) => {
      if (actor?.role !== "admin") {
        setError("Solo la administradora puede restablecer el escenario.");
        return false;
      }
      return commit(
        execute(initialState(), actor, {
          kind: "record",
          module: "Demo",
          action: "Restablecer escenario",
          entityId: current.current.sessionId,
          summary: `Nueva sesión; escenario anterior ${current.current.sessionId}. Historial previo reemplazado mediante confirmación.`,
        }),
      );
    },
  };
}

export function download(name: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
