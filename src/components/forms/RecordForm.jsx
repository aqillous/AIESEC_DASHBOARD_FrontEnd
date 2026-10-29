import { useState } from 'react';
import { Button, Field, Input, Modal, Select, Textarea } from '../ui/index.jsx';

function RecordForm({
  title,
  fields,
  initial,
  onSave,
  onClose,
  submitLabel,
  children,
}) {
  const [form, setForm] = useState(initial || {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    const required = fields.find(
      (field) =>
        (!field.show || field.show(form)) &&
        field.required &&
        !String(form[field.name] || "").trim(),
    );
    if (required) {
      setError(`${required.label} is required.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={title} onClose={onClose} wide>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        {fields
          .filter((field) => !field.show || field.show(form))
          .map((field) => (
            <Field
              key={field.name}
              label={field.label}
              className={field.full ? "sm:col-span-2" : ""}
            >
              {" "}
              {field.options ? (
                <Select
                  value={form[field.name] ?? field.defaultValue ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, [field.name]: event.target.value })
                  }
                >
                  {field.options.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              ) : field.multiline ? (
                <Textarea
                  value={form[field.name] ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, [field.name]: event.target.value })
                  }
                  placeholder={field.placeholder}
                />
              ) : (
                <Input
                  type={field.type || "text"}
                  value={
                    Array.isArray(form[field.name])
                      ? form[field.name].join(", ")
                      : (form[field.name] ?? "")
                  }
                  onChange={(event) =>
                    setForm({ ...form, [field.name]: event.target.value })
                  }
                  placeholder={field.placeholder}
                />
              )}
            </Field>
          ))}
        {children}
        {error && (
          <p
            role="alert"
            className="sm:col-span-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={busy}>
            {busy ? "Saving…" : submitLabel || "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default RecordForm;
