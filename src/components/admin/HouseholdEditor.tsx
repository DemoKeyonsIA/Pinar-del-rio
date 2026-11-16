import { useState } from "react";
import type { ResidentMember, Unit } from "../../types";
import { uid, type Command, type DemoState } from "../../domain/demo";

export function HouseholdEditor({
  unit,
  run,
}: {
  unit: Unit;
  run: (c: Command) => DemoState;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] =
    useState<ResidentMember["relationship"]>("Familiar");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const save = (residents: ResidentMember[]) => {
    try {
      run({ kind: "save", collection: "units", value: { ...unit, residents } });
      setError("");
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  };
  return (
    <section className="household-editor">
      <div className="section-heading">
        <h3>Personas de la filial</h3>
        <button
          className="button secondary"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Cancelar" : "Agregar residente"}
        </button>
      </div>
      {(unit.residents || []).map((r) => (
        <div className="resident-item" key={r.id}>
          <div>
            <strong>{r.name}</strong>
            <p>
              {r.relationship}
              {r.phone ? ` · ${r.phone}` : ""}
            </p>
          </div>
          <button
            className="text-action negative-text"
            onClick={() => {
              if (
                window.confirm(
                  `¿Eliminar a ${r.name} de la ficha? La acción quedará registrada.`,
                )
              )
                save((unit.residents || []).filter((x) => x.id !== r.id));
            }}
          >
            Retirar
          </button>
        </div>
      ))}
      {!unit.residents?.length && (
        <p className="form-hint">
          Todavía no se agregaron residentes a la ficha.
        </p>
      )}
      {editing && (
        <form
          className="demo-form"
          onSubmit={(e) => {
            e.preventDefault();
            const resident: ResidentMember = {
              id: uid(),
              name: name.trim(),
              phone,
              email: "",
              relationship,
              residencyDuration: "",
              dogsCount: 0,
              childrenCount: 0,
            };
            if (save([...(unit.residents || []), resident])) {
              setName("");
              setPhone("");
              setEditing(false);
            }
          }}
        >
          <label>
            Nombre completo *
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Relación
            <select
              value={relationship}
              onChange={(e) =>
                setRelationship(
                  e.target.value as ResidentMember["relationship"],
                )
              }
            >
              {[
                "Propietario Principal",
                "Cónyuge / Pareja",
                "Hijo(a)",
                "Familiar",
                "Inquilino / Arrendatario",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Teléfono
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <button className="button primary">Agregar a la ficha</button>
        </form>
      )}
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
