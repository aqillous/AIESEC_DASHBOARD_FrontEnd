const navigation = [
  { section: 'Workspace', items: [{ id: 'overview', label: 'Overview', icon: '◆' }, { id: 'calendar', label: 'Content Calendar', icon: '▦' }, { id: 'studio', label: 'Content Studio', icon: '✎' }] },
  { section: 'Planning', items: [{ id: 'events', label: 'Events', icon: '▤' }, { id: 'campaigns', label: 'Campaigns', icon: '◎' }] },
  { section: 'Team', items: [{ id: 'team', label: 'Team Workspace', icon: '◉' }] },
  { section: 'Analytics', items: [{ id: 'analytics-overview', label: 'Overview', icon: '▲' }, { id: 'analytics-instagram', label: 'Instagram', icon: '◎' }, { id: 'analytics-facebook', label: 'Facebook', icon: 'f' }, { id: 'analytics-linkedin', label: 'LinkedIn', icon: 'in' }, { id: 'analytics-tiktok', label: 'TikTok', icon: '♪' }, { id: 'analytics-youtube', label: 'YouTube', icon: '▶' }, { id: 'kpis', label: 'KPIs Tracking', icon: '◈', soon: true }] },
  { section: 'Resources', items: [{ id: 'branding', label: 'Branding', icon: '✦', soon: true }, { id: 'ideas', label: 'Idea Bank', icon: '✧' }] }
];

export default function Sidebar({ active, user, onNavigate, onSignOut }) {
  const initials = (user?.displayName || user?.email || 'A').slice(0, 1).toUpperCase();
  return (
    <aside className="flex w-full shrink-0 flex-col bg-[#081b36] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <img className="h-9 w-10 object-contain" src="https://aiesec-logos.s3.eu-west-1.amazonaws.com/White-Blue-Logo.png" alt="AIESEC" />
        <div><p className="text-sm font-extrabold tracking-wide">AIESEC</p><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-blue-200">Azerbaijan</p></div>
      </div>
      <nav className="grid max-h-56 grid-cols-2 gap-1 overflow-y-auto px-3 py-3 sm:grid-cols-3 lg:block lg:max-h-none lg:flex-1 lg:space-y-5 lg:px-3 lg:py-5">
        {navigation.map((group) => (
          <div key={group.section}>
            <p className="hidden px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-blue-200/60 lg:block">{group.section}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button key={item.id} type="button" onClick={() => onNavigate(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${active === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30' : 'text-blue-100/75 hover:bg-white/10 hover:text-white'}`}>
                  <span className="grid w-5 shrink-0 place-items-center text-sm">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.soon && <span className="rounded bg-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-wide text-blue-100">Soon</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="hidden border-t border-white/10 p-4 lg:block">
        <p className="mb-3 text-[10px] leading-4 text-blue-100/55">Dashboard data is shared with the team and saved to the server.</p>
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-500 text-sm font-extrabold">{initials}</span>
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white/85">{user?.displayName || user?.email || 'AIESEC user'}</span>
          <button type="button" title="Sign out" onClick={onSignOut} className="rounded-lg px-2 py-1.5 text-lg text-blue-100/70 hover:bg-white/10 hover:text-white">⏻</button>
        </div>
      </div>
    </aside>
  );
}
