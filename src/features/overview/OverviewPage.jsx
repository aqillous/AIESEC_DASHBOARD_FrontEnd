import { Button, Card, EmptyState } from '../../components/ui/index.jsx';
import { PLATFORMS, PlatformBadge, StatusBadge, StatCard, ViewTitle } from '../../components/shared/dashboard-primitives.jsx';

export function OverviewPage({ data, onNavigate }) {
  const today = new Date().toISOString().slice(0, 10);
  const followers = Object.values(data.analytics).reduce(
    (sum, item) => sum + Number(item.followers || 0),
    0,
  );
  const scheduled = data.posts.filter(
    (post) => post.status === "scheduled",
  ).length;
  const activeCampaigns = data.campaigns.filter(
    (campaign) => campaign.status === "active",
  ).length;
  const openTasks = data.tasks.filter((task) => task.status !== "done");
  const upcoming = [...data.posts]
    .filter((post) => post.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const channelCount = new Set(data.posts.map((post) => post.platform)).size;
  return (
    <div>
      <ViewTitle
        title="Overview"
        description="All of AIESEC Azerbaijan's channels, in one place."
      >
        <Button onClick={() => onNavigate("calendar")}>＋ New post</Button>
      </ViewTitle>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total posts"
          value={data.posts.length}
          note="Across all channels"
          icon="▤"
        />
        <StatCard
          title="Scheduled"
          value={scheduled}
          note="Ready to publish"
          icon="◷"
        />
        <StatCard
          title="Followers"
          value={followers.toLocaleString()}
          note="Combined channels"
          icon="◉"
        />
        <StatCard
          title="Active campaigns"
          value={activeCampaigns}
          note="Currently running"
          icon="◎"
        />
        <StatCard
          title="Open tasks"
          value={openTasks.length}
          note={`${data.tasks.length - openTasks.length} completed`}
          icon="✓"
        />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900">
                Upcoming content
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                The next posts in your calendar
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate("calendar")}
            >
              Open calendar
            </Button>
          </div>
          {upcoming.length ? (
            <div className="divide-y divide-slate-100">
              {upcoming.map((post) => (
                <div key={post.id} className="flex items-center gap-3 py-3">
                  <PlatformBadge platform={post.platform} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {post.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {dateLabel(post.date)}
                      {post.assignee ? ` · ${post.assignee}` : ""}
                    </p>
                  </div>
                  <StatusBadge>{post.status}</StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="▦"
              title="No upcoming posts"
              description="Create a post in the content calendar to see it here."
            />
          )}
        </Card>
        <Card>
          <div className="mb-4">
            <h2 className="font-extrabold text-slate-900">Channel overview</h2>
            <p className="mt-1 text-xs text-slate-500">
              {channelCount} {channelCount === 1 ? "channel" : "channels"} with
              planned content
            </p>
          </div>
          <div className="space-y-4">
            {PLATFORMS.map((platform) => {
              const count = data.posts.filter(
                (post) => post.platform === platform.id,
              ).length;
              const size = data.posts.length
                ? Math.max(4, (count / data.posts.length) * 100)
                : 0;
              return (
                <div key={platform.id}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {platform.label}
                    </span>
                    <span className="text-slate-500">{count} posts</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${size}%`,
                        backgroundColor: platform.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Open tasks
            </p>
            {openTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 py-2 text-xs"
              >
                <span className="truncate font-semibold text-slate-700">
                  {task.title}
                </span>
                <StatusBadge>{task.priority}</StatusBadge>
              </div>
            ))}
            {openTasks.length === 0 && (
              <p className="text-xs text-slate-500">Everything is done.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
