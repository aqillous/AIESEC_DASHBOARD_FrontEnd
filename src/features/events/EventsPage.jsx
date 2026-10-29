import { useState } from 'react';
import RecordForm from '../../components/forms/RecordForm.jsx';
import { Badge, Button, Card, EmptyState, Input } from '../../components/ui/index.jsx';
import { dateLabel, id, ViewTitle } from '../../components/shared/dashboard-primitives.jsx';



export function EventsPage({ events, save, confirm }) {
  const [editing, setEditing] = useState(null);
  const [promo, setPromo] = useState([]);
  function open(event = null) {
    setEditing(event || {});
    setPromo(event?.promo || []);
  }
  const fields = [
    {
      name: "title",
      label: "Event name",
      required: true,
      full: true,
      placeholder: "e.g. GCDP Info Session",
    },
    {
      name: "dateMode",
      label: "Date type",
      defaultValue: "single",
      options: [
        ["single", "Single day"],
        ["range", "Date range"],
      ],
    },
    {
      name: "date",
      label: "Event date",
      type: "date",
      show: (form) => form.dateMode !== "range",
    },
    {
      name: "start",
      label: "Start date",
      type: "date",
      show: (form) => form.dateMode === "range",
    },
    {
      name: "end",
      label: "End date",
      type: "date",
      show: (form) => form.dateMode === "range",
    },
    { name: "location", label: "Location", placeholder: "Baku, Azerbaijan" },
    {
      name: "desc",
      label: "Description",
      full: true,
      multiline: true,
      placeholder: "Event details…",
    },
  ];
  async function submit(form) {
    if (form.dateMode === "range" && (!form.start || !form.end))
      throw new Error("Pick a start and end date.");
    const event = {
      ...form,
      id: editing.id || id("event"),
      promo,
      created: editing.created || Date.now(),
    };
    await save(
      "events",
      editing.id
        ? events.map((item) => (item.id === event.id ? event : item))
        : [...events, event],
    );
  }
  async function remove(event) {
    if (await confirm(`Delete “${event.title}”?`))
      await save(
        "events",
        events.filter((item) => item.id !== event.id),
      );
  }
  return (
    <div>
      <ViewTitle
        title="Events"
        description="Plan event dates and the promotion timeline leading up to them."
      >
        <Button onClick={() => open()}>＋ Add event</Button>
      </ViewTitle>
      <div className="space-y-3">
        {events.length ? (
          events
            .slice()
            .sort((a, b) =>
              (a.start || a.date || "").localeCompare(b.start || b.date || ""),
            )
            .map((event) => (
              <Card key={event.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-extrabold text-slate-900">
                      {event.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {event.dateMode === "range"
                        ? `${dateLabel(event.start)} – ${dateLabel(event.end)}`
                        : dateLabel(event.date)}
                      {event.location && ` · ${event.location}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => open(event)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="subtle"
                      className="text-rose-600"
                      onClick={() => remove(event)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {event.desc && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {event.desc}
                  </p>
                )}
                {event.promo?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.promo.map((phase) => (
                      <Badge key={phase.id} color="blue">
                        {phase.label}: {dateLabel(phase.start)} –{" "}
                        {dateLabel(phase.end)}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))
        ) : (
          <EmptyState
            icon="▤"
            title="No events yet"
            description="Add an event to plan its dates and promotional phases."
          />
        )}
      </div>
      {editing && (
        <RecordForm
          key={editing.id || "new"}
          title={editing.id ? "Edit event" : "Add event"}
          initial={{ ...editing, dateMode: editing.dateMode || "single" }}
          fields={fields}
          onSave={submit}
          onClose={() => setEditing(null)}
        >
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-bold text-slate-600">
              Promotion timeline
            </p>
            {promo.map((phase) => (
              <div
                key={phase.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs"
              >
                <span className="font-semibold text-slate-700">
                  {phase.label} · {dateLabel(phase.start)} –{" "}
                  {dateLabel(phase.end)}
                </span>
                <button
                  type="button"
                  className="text-rose-600"
                  onClick={() =>
                    setPromo((current) =>
                      current.filter((item) => item.id !== phase.id),
                    )
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <PromoPhase
              onAdd={(phase) => setPromo((current) => [...current, phase])}
            />
          </div>
        </RecordForm>
      )}
    </div>
  );
}

function PromoPhase({ onAdd }) {
  const [label, setLabel] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  function add(event) {
    event.preventDefault();
    if (!label.trim() || !start || !end) return;
    onAdd({ id: id("phase"), label: label.trim(), start, end });
    setLabel("");
    setStart("");
    setEnd("");
  }
  return (
    <div className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
      <Input
        aria-label="Promotion phase label"
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="Teaser phase"
      />
      <Input
        aria-label="Promotion start date"
        type="date"
        value={start}
        onChange={(event) => setStart(event.target.value)}
      />
      <Input
        aria-label="Promotion end date"
        type="date"
        value={end}
        onChange={(event) => setEnd(event.target.value)}
      />
      <Button type="button" variant="secondary" onClick={add}>
        Add phase
      </Button>
    </div>
  );
}
