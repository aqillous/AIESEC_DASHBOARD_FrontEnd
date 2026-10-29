import { Badge, Card } from '../../components/ui/index.jsx';
import { ViewTitle } from '../../components/shared/dashboard-primitives.jsx';

export function ComingSoonPage({ branding = false }) {
  const title = branding ? "Branding" : "KPIs Tracking";
  return (
    <div>
      <ViewTitle
        title={title}
        description={
          branding
            ? "Brand assets and guidelines in one place."
            : "Set and monitor targets across the team."
        }
      />
      <Card className="grid min-h-80 place-items-center text-center">
        <div>
          <Badge color="blue">Coming soon</Badge>
          <div className="mx-auto mt-5 grid size-16 place-items-center rounded-2xl bg-blue-50 text-3xl text-blue-700">
            {branding ? "✦" : "◈"}
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-slate-900">
            {title} is on its way
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {branding
              ? "Logos, color palettes, fonts and templates for AIESEC Azerbaijan will live here."
              : "Set targets and track progress across every channel and campaign."}
          </p>
        </div>
      </Card>
    </div>
  );
}
