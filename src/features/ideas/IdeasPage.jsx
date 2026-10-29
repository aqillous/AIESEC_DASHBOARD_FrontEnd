import { useState } from 'react';
import { Button, Card, EmptyState, Input } from '../../components/ui/index.jsx';
import { id, ViewTitle } from '../../components/shared/dashboard-primitives.jsx';

export function IdeasPage({ ideas, save }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  async function addIdea(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setError("");
    try {
      await save("ideas", [
        { id: id("idea"), text: text.trim(), votes: 0 },
        ...ideas,
      ]);
      setText("");
    } catch (saveError) {
      setError(saveError.message);
    }
  }
  async function vote(idea, delta) {
    await save(
      "ideas",
      ideas.map((item) =>
        item.id === idea.id
          ? { ...item, votes: Math.max(0, Number(item.votes || 0) + delta) }
          : item,
      ),
    );
  }
  async function remove(idea) {
    await save(
      "ideas",
      ideas.filter((item) => item.id !== idea.id),
    );
  }
  return (
    <div>
      <ViewTitle
        title="Idea Bank"
        description="Share content ideas and vote for the ones you want to bring to life."
      />
      <Card className="mb-4">
        <form onSubmit={addIdea} className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Write a new idea…"
          />
          <Button>Add idea</Button>
        </form>
        {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {ideas.length ? (
          ideas
            .slice()
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .map((idea) => (
              <Card key={idea.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center rounded-xl bg-blue-50 px-2 py-2">
                  <button
                    type="button"
                    aria-label="Upvote"
                    className="text-blue-700"
                    onClick={() => vote(idea, 1)}
                  >
                    ▲
                  </button>
                  <b className="py-1 text-sm text-slate-900">
                    {idea.votes || 0}
                  </b>
                  <button
                    type="button"
                    aria-label="Downvote"
                    className="text-blue-700"
                    onClick={() => vote(idea, -1)}
                  >
                    ▼
                  </button>
                </div>
                <p className="flex-1 pt-1 text-sm leading-6 text-slate-700">
                  {idea.text}
                </p>
                <Button
                  size="sm"
                  variant="subtle"
                  className="text-rose-600"
                  onClick={() => remove(idea)}
                >
                  ×
                </Button>
              </Card>
            ))
        ) : (
          <EmptyState
            icon="✧"
            title="No ideas yet"
            description="Add an idea to get the conversation started."
          />
        )}
      </div>
    </div>
  );
}
