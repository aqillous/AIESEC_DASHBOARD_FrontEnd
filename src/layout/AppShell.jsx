import Sidebar from './Sidebar.jsx';
import { Button } from '../components/ui/index.jsx';

export default function AppShell({
  activePage,
  pageTitle,
  user,
  children,
  onNavigate,
  onSignOut,
  error,
  onDismissError
}) {
  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <Sidebar active={activePage} user={user} onNavigate={onNavigate} onSignOut={onSignOut} />
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 font-black text-blue-700">A</span>
            <div>
              <p className="text-sm font-extrabold text-slate-900">{pageTitle}</p>
              <p className="text-[10px] font-medium text-slate-400">AIESEC Azerbaijan · Social Media</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-xs font-semibold text-slate-500 sm:block">{user.displayName || user.email}</span>
            <button type="button" className="grid size-9 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white lg:hidden" title="Sign out" onClick={onSignOut}>{(user.displayName || user.email || 'A')[0].toUpperCase()}</button>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {error && <div role="alert" className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><span>{error}</span><Button variant="subtle" size="sm" onClick={onDismissError}>Dismiss</Button></div>}
          {children}
        </main>
      </div>
    </div>
  );
}
