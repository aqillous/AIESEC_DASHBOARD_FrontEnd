import { useState } from 'react';
import { Badge, Button, Card, Field, Select, Textarea } from '../../components/ui/index.jsx';
import { ViewTitle } from '../../components/shared/dashboard-primitives.jsx';

export function StudioPage() {
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [goal, setGoal] = useState("apply");
  const [results, setResults] = useState({ hashtags: [], cta: [], emojis: [] });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  async function run(tool, body) {
    if (tool !== "cta" && !text.trim()) {
      setError("Add some information about the post first.");
      return;
    }
    setBusy(tool);
    setError("");
    try {
      const suggestions = await window.dashboardApi.studioRequest(tool, body);
      setResults((current) => ({ ...current, [tool]: suggestions }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  }
  const liveTools = [
    {
      id: "hashtags",
      title: "Hashtag generator",
      description: "Get AIESEC tags tailored to your post and platform.",
      button: "Generate hashtags",
    },
    {
      id: "cta",
      title: "Call-to-action",
      description: "Choose a goal to get practical CTA suggestions.",
      button: "Generate CTA",
    },
    {
      id: "emojis",
      title: "Emoji suggestions",
      description: "Get suggested emojis based on your post text.",
      button: "Suggest emojis",
    },
  ];
  return (
    <div>
      <ViewTitle
        title="Content Studio"
        description="Prepare social content with deterministic suggestion tools."
      />
      <Card className="mb-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Platform">
            <Select
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
            >
              {PLATFORMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Goal">
            <Select
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            >
              {[
                ["apply", "Apply"],
                ["learn", "Learn"],
                ["follow", "Follow"],
                ["share", "Share"],
                ["register", "Register"],
                ["deadline", "Deadline"],
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field className="sm:col-span-2" label="Tell us about this post">
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Applications for Global Volunteer are open…"
            />
          </Field>
        </div>
      </Card>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {liveTools.map((tool) => (
          <Card key={tool.id} className="flex flex-col">
            <Badge color="green">Backend tool</Badge>
            <h2 className="mt-3 font-extrabold capitalize text-slate-900">
              {tool.title}
            </h2>
            <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">
              {tool.description}
            </p>
            <Button
              className="mt-4 self-start"
              disabled={!!busy}
              onClick={() =>
                run(
                  tool.id,
                  tool.id === "cta"
                    ? { goal }
                    : tool.id === "hashtags"
                      ? { text, platform }
                      : { text },
                )
              }
            >
              {busy === tool.id ? "Generating…" : tool.button}
            </Button>
            <div className="mt-4 space-y-2">
              {(results[tool.id] || []).map((result, index) => (
                <p
                  key={`${index}-${result}`}
                  className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  {result}
                </p>
              ))}
            </div>
          </Card>
        ))}
        {[
          "Caption generator",
          "Rewrite caption",
          "Translate caption",
          "Tone change",
        ].map((title) => (
          <Card key={title}>
            <Badge color="amber">AI service not connected</Badge>
            <h2 className="mt-3 font-extrabold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              This feature remains a placeholder until a separate AI service is
              provided.
            </p>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() =>
                setError(
                  "This tool needs an AI model connected — ask to have it wired up.",
                )
              }
            >
              Unavailable
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
