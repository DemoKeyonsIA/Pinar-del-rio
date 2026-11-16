import type { ReactNode } from "react";
import type { Invoice, PaymentRecord, UserProfile } from "../../types";
import type { Collection, Command, DemoState, Entity } from "../../domain/demo";

export interface WorkspaceModuleProps {
  s: DemoState;
  user: UserProfile;
  run: (command: Command) => DemoState;
  sub: string;
  setSub: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  setEditor: (value: { collection: Collection; value?: Entity }) => void;
  setModal: (
    value: "cash" | "quota" | "payroll" | "reset" | "help" | null,
  ) => void;
  inspect: (value: Entity | PaymentRecord | Invoice, title: string) => void;
  ask: (
    title: string,
    message: string,
    command: Command,
    needsReason?: boolean,
  ) => void;
  collectionActions: (collection: Collection, row: Entity) => ReactNode;
  exportRows: (name: string, rows: object[]) => Promise<void>;
  navigate: (value: string) => void;
  month: string;
}
