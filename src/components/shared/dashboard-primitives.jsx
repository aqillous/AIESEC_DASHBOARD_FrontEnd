import { Badge, Card, PageHeader } from '../ui/index.jsx';

export const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "#cf367a" },
  { id: "tiktok", label: "TikTok", color: "#111827" },
  { id: "linkedin", label: "LinkedIn", color: "#1263a3" },
  { id: "youtube", label: "YouTube", color: "#e22d2d" },
  { id: "facebook", label: "Facebook", color: "#2764c5" },
];

export const platformName = (id) =>
  PLATFORMS.find((platform) => platform.id === id)?.label || id;

export const dateLabel = (value) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No date";

export const id = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function PlatformBadge({ platform }) {
  const entry = PLATFORMS.find((item) => item.id === platform);
  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-xl text-[10px] font-black text-white"
      style={{ backgroundColor: entry?.color || "#64748b" }}
    >
      {entry?.label.slice(0, 2).toUpperCase() || "SM"}
    </span>
  );
}

export function StatusBadge({ children }) {
  const color =
    {
      published: "green",
      approved: "green",
      done: "green",
      active: "green",
      scheduled: "blue",
      doing: "blue",
      pending: "amber",
      planning: "amber",
      rejected: "red",
      high: "red",
      medium: "amber",
      low: "slate",
    }[String(children).toLowerCase()] || "slate";
  return <Badge color={color}>{children}</Badge>;
}

export function StatCard({ title, value, note, icon }) {
  return (
    <Card className="flex items-start gap-4 p-4 sm:p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-lg text-blue-700">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
          {value}
        </p>
        {note && <p className="mt-1 text-[11px] text-slate-400">{note}</p>}
      </div>
    </Card>
  );
}

export function ViewTitle({ title, description, children }) {
  return (
    <PageHeader title={title} description={description} action={children} />
  );
}
