import { useState } from 'react';
import { Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select, Textarea } from '../../components/ui/index.jsx';
import { dateLabel, id, platformName, PLATFORMS, PlatformBadge, StatusBadge, ViewTitle } from '../../components/shared/dashboard-primitives.jsx';

function PostForm({ post, team, onClose, onSave }) {
  const isEditing = Boolean(post?.id);
  const [form, setForm] = useState(() => ({
    platform: "instagram",
    title: "",
    caption: "",
    date: "",
    assignee: "",
    status: "draft",
    ...post,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Enter a post title.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave({
        ...form,
        title: (form.title || "").trim(),
        caption: (form.caption || "").trim(),
        id: post?.id || id("post"),
        created: post?.created || Date.now(),
      });
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={isEditing ? "Edit post" : "Create a post"}
      onClose={onClose}
      wide
    >
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Platform">
          <Select
            value={form.platform}
            onChange={(e) => set("platform", e.target.value)}
          >
            {PLATFORMS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </Select>
        </Field>
        <Field label="Title" className="sm:col-span-2">
          <Input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Global Volunteer applications are open"
          />
        </Field>
        <Field label="Caption" className="sm:col-span-2">
          <Textarea
            value={form.caption}
            onChange={(e) => set("caption", e.target.value)}
            placeholder="Write the post caption…"
          />
        </Field>
        <Field label="Date">
          <Input
            type="date"
            value={form.date || ""}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>
        <Field label="Assigned to">
          <Select
            value={form.assignee || ""}
            onChange={(e) => set("assignee", e.target.value)}
          >
            <option value="">Unassigned</option>
            {team.map((member) => (
              <option key={member.id} value={member.name}>
                {member.name}
              </option>
            ))}
          </Select>
        </Field>
        {error && (
          <p className="sm:col-span-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={busy}>{busy ? "Saving…" : "Save post"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function PostCard({ post, onEdit, onDelete, onApproval, onComment }) {
  const [comment, setComment] = useState("");
  async function submitComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    await onComment(post, comment.trim());
    setComment("");
  }
  return (
    <Card className="flex gap-3 p-4 sm:p-5">
      <PlatformBadge platform={post.platform} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-extrabold text-slate-900">{post.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{platformName(post.platform)}</Badge>
              <Badge>{dateLabel(post.date)}</Badge>
              <StatusBadge>{post.status}</StatusBadge>
              <StatusBadge>{post.approval || "pending"}</StatusBadge>
              {post.assignee && <Badge color="purple">{post.assignee}</Badge>}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="subtle" size="sm" onClick={() => onEdit(post)}>
              Edit
            </Button>
            <Button
              variant="subtle"
              size="sm"
              className="text-rose-600"
              onClick={() => onDelete(post)}
            >
              Delete
            </Button>
          </div>
        </div>
        {post.caption && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {post.caption}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onApproval(post, "approved")}
          >
            ✓ Approve
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onApproval(post, "rejected")}
          >
            Reject
          </Button>
          <span className="ml-auto text-xs text-slate-500">
            {(post.comments || []).length} comments
          </span>
        </div>
        {(post.comments || []).map((entry) => (
          <p
            key={entry.id}
            className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"
          >
            <b>{entry.author}:</b> {entry.text}
          </p>
        ))}
        <form onSubmit={submitComment} className="mt-3 flex gap-2">
          <Input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add a comment…"
            aria-label="Add a comment"
          />
          <Button variant="secondary" size="sm">
            Comment
          </Button>
        </form>
      </div>
    </Card>
  );
}

export function CalendarPage({ posts, team, save, confirm }) {
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [month, setMonth] = useState(() => new Date());
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;
  const visible = posts
    .filter((post) => filter === "all" || post.status === filter)
    .slice()
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  async function savePost(post) {
    const next = editing?.id
      ? posts.map((item) => (item.id === post.id ? { ...item, ...post } : item))
      : [post, ...posts];
    await save("posts", next);
  }
  async function deletePost(post) {
    if (await confirm(`Delete “${post.title}”?`))
      await save(
        "posts",
        posts.filter((item) => item.id !== post.id),
      );
  }
  return (
    <div>
      <ViewTitle
        title="Content Calendar"
        description="Plan, review and manage posts across your social channels."
      >
        <Button onClick={() => setEditing({})}>＋ New post</Button>
      </ViewTitle>
      <Card className="mb-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
            >
              ‹
            </Button>
            <h2 className="min-w-36 text-center font-extrabold text-slate-900">
              {month.toLocaleDateString("en", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            >
              ›
            </Button>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMonth(new Date())}
          >
            Today
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-400">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span className="py-2" key={day}>
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset + days }, (_, index) => {
            const day = index - offset + 1;
            const date =
              day > 0
                ? `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : "";
            const matching = posts.filter((post) => post.date === date);
            return (
              <button
                key={index}
                type="button"
                onClick={() =>
                  day > 0 &&
                  setEditing({ date, platform: "instagram", status: "draft" })
                }
                className={`min-h-16 rounded-lg p-1.5 text-left text-xs transition sm:min-h-20 ${day > 0 ? "bg-slate-50 text-slate-700 hover:bg-blue-50" : "pointer-events-none"}`}
              >
                <span className="font-semibold">{day > 0 ? day : ""}</span>
                {matching.slice(0, 2).map((post) => (
                  <span
                    key={post.id}
                    title={post.title}
                    className="mt-1 block truncate rounded bg-blue-600 px-1 py-0.5 text-[9px] font-semibold text-white"
                  >
                    {post.title}
                  </span>
                ))}
              </button>
            );
          })}
        </div>
      </Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-extrabold text-slate-900">
          All posts{" "}
          <span className="ml-1 text-sm font-medium text-slate-400">
            {posts.length}
          </span>
        </h2>
        <Select
          className="w-40"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </Select>
      </div>
      <div className="space-y-3">
        {visible.length ? (
          visible.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={setEditing}
              onDelete={deletePost}
              onApproval={(item, approval) =>
                save(
                  "posts",
                  posts.map((entry) =>
                    entry.id === item.id ? { ...entry, approval } : entry,
                  ),
                )
              }
              onComment={(item, text) =>
                save(
                  "posts",
                  posts.map((entry) =>
                    entry.id === item.id
                      ? {
                          ...entry,
                          comments: [
                            ...(entry.comments || []),
                            {
                              id: id("comment"),
                              author: "You",
                              text,
                              created: Date.now(),
                            },
                          ],
                        }
                      : entry,
                  ),
                )
              }
            />
          ))
        ) : (
          <EmptyState
            icon="▤"
            title="No posts yet"
            description="Choose a day or create your first post."
          />
        )}
      </div>
      {editing && (
        <PostForm
          key={editing.id || editing.date || "new"}
          post={editing}
          team={team}
          onClose={() => setEditing(null)}
          onSave={savePost}
        />
      )}
    </div>
  );
}
