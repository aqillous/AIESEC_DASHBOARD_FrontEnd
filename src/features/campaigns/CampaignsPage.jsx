import { useState } from 'react';
import RecordForm from '../../components/forms/RecordForm.jsx';
import { Badge, Button, Card, EmptyState, Field, Input } from '../../components/ui/index.jsx';
import { dateLabel, id, PLATFORMS, StatusBadge, ViewTitle } from '../../components/shared/dashboard-primitives.jsx';

export function CampaignsPage({ campaigns, save, confirm }) {
  const [editing, setEditing] = useState(null);
  const fields = [
    { name: "name", label: "Campaign name", required: true, full: true },
    { name: "start", label: "Start date", type: "date" },
    { name: "end", label: "End date", type: "date" },
    { name: "cond", label: "Conditions / offer", full: true },
    { name: "goal", label: "Goal", full: true },
    { name: "platforms", label: "Platforms (comma separated)", full: true },
    {
      name: "status",
      label: "Status",
      defaultValue: "planning",
      options: [
        ["planning", "Planning"],
        ["active", "Active"],
        ["completed", "Completed"],
      ],
    },
  ];
  async function submit(form) {
    const campaign = {
      ...form,
      platforms: Array.isArray(form.platforms)
        ? form.platforms
        : String(form.platforms || "")
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .filter((item) =>
              PLATFORMS.some((platform) => platform.id === item),
            ),
      id: editing.id || id("campaign"),
      created: editing.created || Date.now(),
    };
    await save(
      "campaigns",
      editing.id
        ? campaigns.map((item) => (item.id === campaign.id ? campaign : item))
        : [...campaigns, campaign],
    );
  }
  async function remove(campaign) {
    if (await confirm(`Delete “${campaign.name}”?`))
      await save(
        "campaigns",
        campaigns.filter((item) => item.id !== campaign.id),
      );
  }
  return (
    <div>
      <ViewTitle
        title="Campaigns"
        description="Manage campaign platforms, dates, status and goals."
      >
        <Button onClick={() => setEditing({})}>＋ Add campaign</Button>
      </ViewTitle>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.length ? (
          campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-extrabold text-slate-900">
                    {campaign.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {dateLabel(campaign.start)} – {dateLabel(campaign.end)}
                  </p>
                </div>
                <StatusBadge>{campaign.status}</StatusBadge>
              </div>
              {campaign.cond && (
                <p className="mt-4 rounded-lg bg-blue-50 p-3 text-xs font-semibold text-blue-800">
                  {campaign.cond}
                </p>
              )}
              {campaign.goal && (
                <p className="mt-3 text-xs text-slate-600">
                  Goal: {campaign.goal}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(campaign.platforms || []).map((platform) => (
                  <Badge key={platform}>{platformName(platform)}</Badge>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditing(campaign)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="subtle"
                  className="text-rose-600"
                  onClick={() => remove(campaign)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="◎"
            title="No campaigns yet"
            description="Add a campaign to organize goals and timing."
          />
        )}
      </div>
      {editing && (
        <RecordForm
          key={editing.id || "new"}
          title={editing.id ? "Edit campaign" : "Add campaign"}
          initial={{ ...editing, platforms: editing.platforms || [] }}
          fields={fields}
          onSave={submit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
