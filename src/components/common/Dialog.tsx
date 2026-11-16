import { useEffect, useRef, useId, type ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus();
      else document.getElementById("admin-content")?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Tab" || e.defaultPrevented) return;
        const nodes = [
          ...e.currentTarget.querySelectorAll<HTMLElement>(
            "button, a[href], input, select, textarea, summary, [tabindex]",
          ),
        ].filter(
          (node) =>
            node.tabIndex >= 0 &&
            !node.matches(":disabled") &&
            node.getClientRects().length > 0 &&
            !node.closest("[inert]"),
        );
        const first = nodes[0],
          last = nodes.at(-1);
        if (!first || !last) {
          e.preventDefault();
          return;
        }
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === e.currentTarget)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
      className={`demo-dialog ${wide ? "demo-dialog-wide" : ""}`}
      aria-labelledby={titleId}
      aria-modal="true"
    >
      <header>
        <h2 id={titleId}>{title}</h2>
        <button type="button" onClick={onClose} aria-label="Cerrar diálogo">
          <X size={20} />
        </button>
      </header>
      <div className="demo-dialog-body">{children}</div>
    </dialog>
  );
}
