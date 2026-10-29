import { useState } from 'react';
import { Badge, Button, Card, Field, Input, Select, Textarea } from '../../components/ui/index.jsx';
import { PLATFORMS, platformName, StatCard, StatusBadge, ViewTitle } from '../../components/shared/dashboard-primitives.jsx';

const metricConfig = {
  instagram: [
    { key: "reach", label: "Reach" },
    { key: "impressions", label: "Impressions" },
  ],
  facebook: [
    { key: "pageReach", label: "Page reach" },
    { key: "engagement", label: "Engagement" },
    { key: "shares", label: "Shares" },
    { key: "linkClicks", label: "Link clicks" },
  ],
  linkedin: [
    { key: "engagement", label: "Engagement" },
    { key: "ctr", label: "CTR (%)" },
    { key: "employeeAdvocacy", label: "Employee advocacy" },
  ],
  tiktok: [
    { key: "videoViews", label: "Video views" },
    { key: "completionRate", label: "Completion rate (%)" },
    { key: "avgWatchTime", label: "Average watch time (sec)" },
  ],
  youtube: [
    { key: "watchTime", label: "Watch time (hrs)" },
    { key: "audienceRetention", label: "Audience retention (%)" },
    { key: "ctr", label: "CTR (%)" },
  ],
};

export function AnalyticsPage({ analytics, extra, save, platform }) {
  const [selected, setSelected] = useState("all");
  const [extraDraft, setExtraDraft] = useState(null);
  const [extraError, setExtraError] = useState("");
  const totalFollowers = Object.values(analytics).reduce(
    (sum, metric) => sum + Number(metric.followers || 0),
    0,
  );
  const totalEngagement = Object.values(analytics).reduce(
    (sum, metric) =>
      sum + Number(metric.likes || 0) + Number(metric.comments || 0),
    0,
  );
  const averageGrowth =
    Object.values(analytics).reduce(
      (sum, metric) =>
        sum +
        (Number(metric.prevFollowers)
          ? ((Number(metric.followers || 0) - Number(metric.prevFollowers)) /
              Number(metric.prevFollowers)) *
            100
          : 0),
      0,
    ) / Math.max(1, Object.keys(analytics).length);
  async function updateCore(key, value) {
    await save("analytics", {
      ...analytics,
      [platform]: {
        ...analytics[platform],
        [key]: key === "label" ? value : Math.max(0, Number(value) || 0),
      },
    });
  }
  async function updateExtra(key, value) {
    await save("analytics_extra", {
      ...extra,
      [platform]: { ...(extra[platform] || {}), [key]: value },
    });
  }
  if (!platform) {
    const platforms =
      selected === "all" ? PLATFORMS.map((item) => item.id) : [selected];
    const totals = platforms.reduce(
      (sum, name) => {
        const item = analytics[name] || {};
        return {
          views: sum.views + Number(item.views || 0),
          likes: sum.likes + Number(item.likes || 0),
          comments: sum.comments + Number(item.comments || 0),
          clicks: sum.clicks + Number(item.clicks || 0),
        };
      },
      { views: 0, likes: 0, comments: 0, clicks: 0 },
    );
    return (
      <div>
        <ViewTitle
          title="Analytics Overview"
          description="Shared metrics across every channel—followers, engagement and reach at a glance."
        />
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <StatCard
            title="Total followers"
            value={totalFollowers.toLocaleString()}
            icon="◉"
          />
          <StatCard
            title="Average growth"
            value={`${averageGrowth >= 0 ? "+" : ""}${averageGrowth.toFixed(1)}%`}
            icon="↗"
          />
          <StatCard
            title="Engagements"
            value={totalEngagement.toLocaleString()}
            icon="♡"
          />
        </div>
        <Card>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-slate-900">
                Engagement funnel
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Compare audience activity by channel.
              </p>
            </div>
            <Select
              className="w-44"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
            >
              <option value="all">All platforms</option>
              {PLATFORMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-4">
            {Object.entries(totals).map(([label, count]) => (
              <div
                key={label}
                className="grid grid-cols-[90px_1fr_80px] items-center gap-3 text-xs"
              >
                <span className="font-semibold capitalize text-slate-600">
                  {label}
                </span>
                <div className="h-5 overflow-hidden rounded-md bg-slate-100">
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-blue-900 to-blue-500"
                    style={{
                      width: `${Math.max(3, totals.views ? (count / totals.views) * 100 : 3)}%`,
                    }}
                  />
                </div>
                <b className="text-right text-slate-800">
                  {count.toLocaleString()}
                </b>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }
  const name = platformName(platform);
  const current = analytics[platform] || {};
  const previous = Number(current.prevFollowers || 0);
  const growth = previous
    ? ((Number(current.followers || 0) - previous) / previous) * 100
    : 0;
  return (
    <div>
      <ViewTitle
        title={`${name} Analytics`}
        description="Track core performance and platform-specific KPIs."
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Followers"
          value={Number(current.followers || 0).toLocaleString()}
          icon="◉"
        />
        <StatCard
          title="Growth vs last period"
          value={`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`}
          icon="↗"
        />
        <StatCard
          title="New followers"
          value={(Number(current.followers || 0) - previous).toLocaleString()}
          icon="＋"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-extrabold text-slate-900">Core metrics</h2>
          <div className="divide-y divide-slate-100">
            {[
              ["followers", "Followers"],
              ["prevFollowers", "Followers (last period)"],
              ["views", "Views"],
              ["likes", "Likes"],
              ["comments", "Comments"],
              ["clicks", "Clicks"],
            ].map(([key, label]) => (
              <Field
                key={key}
                label={label}
                className="grid grid-cols-[1fr_140px] items-center gap-3 py-2"
              >
                <Input
                  type="number"
                  min="0"
                  value={current[key] || 0}
                  onChange={(event) => updateCore(key, event.target.value)}
                />
              </Field>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 font-extrabold text-slate-900">Platform KPIs</h2>
          <div className="space-y-3">
            {(metricConfig[platform] || []).map((metric) => (
              <Field key={metric.key} label={metric.label}>
                <Input
                  type="number"
                  min="0"
                  value={(extra[platform] || {})[metric.key] || 0}
                  onChange={(event) =>
                    updateExtra(
                      metric.key,
                      Math.max(0, Number(event.target.value) || 0),
                    )
                  }
                />
              </Field>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-slate-900">
              Additional KPI groups
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Extra platform-specific values, grouped data and tables.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setExtraDraft(JSON.stringify(extra[platform] || {}, null, 2));
              setExtraError("");
            }}
          >
            Edit JSON
          </Button>
        </div>
        {extraDraft !== null && (
          <div className="mt-4 space-y-3">
            <Textarea
              className="min-h-52 font-mono text-xs"
              value={extraDraft}
              onChange={(event) => setExtraDraft(event.target.value)}
            />
            {extraError && (
              <p role="alert" className="text-sm text-rose-700">
                {extraError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setExtraDraft(null)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const parsed = JSON.parse(extraDraft);
                    if (
                      !parsed ||
                      Array.isArray(parsed) ||
                      typeof parsed !== "object"
                    )
                      throw new Error("Enter a JSON object.");
                    await updateExtraObject(parsed);
                    setExtraDraft(null);
                  } catch (error) {
                    setExtraError(error.message);
                  }
                }}
              >
                Save KPIs
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
  async function updateExtraObject(value) {
    await save("analytics_extra", { ...extra, [platform]: value });
  }
}
