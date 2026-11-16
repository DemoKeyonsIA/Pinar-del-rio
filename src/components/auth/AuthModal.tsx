import { Building2, ShieldCheck, ArrowRight, Briefcase } from "lucide-react";
import { INITIAL_USERS } from "../../data/mockData";
import type { UserProfile } from "../../types";
import { Dialog } from "../common/Dialog";

interface Props {
  isOpen: boolean;
  currentUser?: UserProfile | null;
  onSelectUser: (user: UserProfile) => void;
  onLogout?: () => void;
  onClose: () => void;
}
export function AuthModal({
  isOpen,
  currentUser,
  onSelectUser,
  onLogout,
  onClose,
}: Props) {
  if (!isOpen) return null;
  const roles = [
    {
      role: "resident",
      name: "Condómino",
      text: "Su filial, sus pagos y la vida en comunidad.",
      icon: Building2,
    },
    {
      role: "admin",
      name: "Administradora",
      text: "La operación del residencial, en un solo lugar.",
      icon: ShieldCheck,
    },
  ];
  return (
    <Dialog title="Explore Pinar del Río" onClose={onClose}>
      <p className="dialog-intro">
        Elija una perspectiva. Esta demo utiliza perfiles y operaciones
        simuladas; no necesita contraseña.
      </p>
      <div className="role-options">
        {roles.map((r) => {
          const user = INITIAL_USERS.find((u) => u.role === r.role)!;
          return (
            <button
              key={r.role}
              className="role-option"
              onClick={() => {
                onSelectUser(user);
                onClose();
              }}
            >
              <r.icon size={24} />
              <span>
                <strong>{r.name}</strong>
                <small>{r.text}</small>
                <small>
                  {user.name}
                  {currentUser?.id === user.id ? " · Perfil actual" : ""}
                </small>
              </span>
              <ArrowRight size={20} />
            </button>
          );
        })}
      </div>
      <details className="extra-profiles">
        <summary>Otros perfiles de demostración</summary>
        {INITIAL_USERS.filter(
          (u) =>
            u.role !== "board" &&
            (u.id !== INITIAL_USERS.find((x) => x.role === u.role)?.id ||
              u.role === "employee"),
        ).map((u) => (
          <button
            key={u.id}
            onClick={() => {
              onSelectUser(u);
              onClose();
            }}
          >
            <Briefcase size={16} />
            {u.name} · {u.roleTitle}
          </button>
        ))}
      </details>
      {currentUser && (
        <button
          className="button secondary"
          onClick={() => {
            onLogout?.();
            onClose();
          }}
        >
          Salir de la demo
        </button>
      )}
    </Dialog>
  );
}
