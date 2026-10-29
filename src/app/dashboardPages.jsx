import { AnalyticsPage } from '../features/analytics/AnalyticsPage.jsx';
import { CampaignsPage } from '../features/campaigns/CampaignsPage.jsx';
import { ComingSoonPage } from '../features/coming-soon/ComingSoonPage.jsx';
import { CalendarPage } from '../features/content-calendar/CalendarPage.jsx';
import { StudioPage } from '../features/content-studio/StudioPage.jsx';
import { EventsPage } from '../features/events/EventsPage.jsx';
import { IdeasPage } from '../features/ideas/IdeasPage.jsx';
import { OverviewPage } from '../features/overview/OverviewPage.jsx';
import { TeamTasksPage } from '../features/team/TeamTasksPage.jsx';

export const pageTitles = {
  overview: 'Overview',
  calendar: 'Content Calendar',
  studio: 'Content Studio',
  events: 'Events',
  campaigns: 'Campaigns',
  team: 'Team Workspace',
  'analytics-overview': 'Analytics Overview',
  'analytics-instagram': 'Instagram Analytics',
  'analytics-facebook': 'Facebook Analytics',
  'analytics-linkedin': 'LinkedIn Analytics',
  'analytics-tiktok': 'TikTok Analytics',
  'analytics-youtube': 'YouTube Analytics',
  kpis: 'KPIs Tracking',
  branding: 'Branding',
  ideas: 'Idea Bank'
};

export function DashboardPage({ page, data, save, isAdmin, confirm, onNavigate }) {
  if (page === 'calendar') return <CalendarPage posts={data.posts} team={data.team} save={save} confirm={confirm} />;
  if (page === 'studio') return <StudioPage />;
  if (page === 'events') return <EventsPage events={data.events} save={save} confirm={confirm} />;
  if (page === 'campaigns') return <CampaignsPage campaigns={data.campaigns} save={save} confirm={confirm} />;
  if (page === 'team') return <TeamTasksPage team={data.team} tasks={data.tasks} save={save} isAdmin={isAdmin} confirm={confirm} />;
  if (page === 'analytics-overview') return <AnalyticsPage analytics={data.analytics} extra={data.analytics_extra} save={save} />;
  if (page.startsWith('analytics-')) return <AnalyticsPage analytics={data.analytics} extra={data.analytics_extra} save={save} platform={page.slice('analytics-'.length)} />;
  if (page === 'ideas') return <IdeasPage ideas={data.ideas} save={save} />;
  if (page === 'kpis' || page === 'branding') return <ComingSoonPage branding={page === 'branding'} />;
  return <OverviewPage data={data} onNavigate={onNavigate} />;
}
