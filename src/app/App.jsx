import { useCallback, useState } from 'react';
import { ConfirmDialog, LoadingScreen } from '../components/ui/index.jsx';
import { pageTitles, DashboardPage } from './dashboardPages.jsx';
import { useDashboardData } from '../hooks/useDashboardData.js';
import AppShell from '../layout/AppShell.jsx';
import SignInPage from '../pages/SignInPage.jsx';
import { startGoogleLogin } from '../services/dashboardApi.js';

function Toast({ message }) {
  if (!message) return null;
  return <div role="status" className="fixed bottom-5 right-5 z-40 max-w-md rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl">{message}</div>;
}

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [toast, setToast] = useState('');
  const [confirmMessage, setConfirmMessage] = useState(null);
  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(window.dashboardToastTimer);
    window.dashboardToastTimer = window.setTimeout(() => setToast(''), 4500);
  }, []);
  const { user, data, loading, error, setError, save, signOut } = useDashboardData(notify);

  function confirm(message) {
    return new Promise((resolve) => setConfirmMessage({ message, resolve }));
  }

  if (!user) return <SignInPage onLogin={startGoogleLogin} error={error} />;
  if (loading) return <LoadingScreen />;

  const isAdmin = user.is_admin === true || user.isAdmin === true || String(user.role || '').toLowerCase() === 'admin';
  return (
    <>
      <AppShell
        activePage={activePage}
        pageTitle={pageTitles[activePage] || 'Dashboard'}
        user={user}
        onNavigate={setActivePage}
        onSignOut={signOut}
        error={error}
        onDismissError={() => setError('')}
      >
        <DashboardPage page={activePage} data={data} save={save} isAdmin={isAdmin} confirm={confirm} onNavigate={setActivePage} />
      </AppShell>
      <Toast message={toast} />
      {confirmMessage && (
        <ConfirmDialog
          title="Confirm deletion"
          message={confirmMessage.message}
          onCancel={() => {
            confirmMessage.resolve(false);
            setConfirmMessage(null);
          }}
          onConfirm={async () => {
            confirmMessage.resolve(true);
          }}
        />
      )}
    </>
  );
}
