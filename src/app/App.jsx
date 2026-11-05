import { useCallback, useEffect, useState } from 'react';
import { ConfirmDialog, LoadingScreen } from '../components/ui/index.jsx';
import { pageTitles, DashboardPage } from './dashboardPages.jsx';
import { useDashboardData } from '../hooks/useDashboardData.js';
import AppShell from '../layout/AppShell.jsx';
import SignInPage from '../pages/SignInPage.jsx';
import { startGoogleLogin } from '../services/dashboardApi.js';

const ACTIVE_PAGE_KEY = 'aiesec_dashboard_active_page';
const SCROLL_POSITION_KEY = 'aiesec_dashboard_scroll_position';

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

function getStoredPage() {
  const page = window.sessionStorage.getItem(ACTIVE_PAGE_KEY);
  return Object.prototype.hasOwnProperty.call(pageTitles, page) ? page : 'overview';
}

function Toast({ message }) {
  if (!message) return null;
  return <div role="status" className="fixed bottom-5 right-5 z-40 max-w-md rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl">{message}</div>;
}

export default function App() {
  const [activePage, setActivePage] = useState(getStoredPage);
  const [toast, setToast] = useState('');
  const [confirmMessage, setConfirmMessage] = useState(null);
  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(window.dashboardToastTimer);
    window.dashboardToastTimer = window.setTimeout(() => setToast(''), 4500);
  }, []);
  const {
    user,
    data,
    loading,
    error,
    setError,
    save,
    createMember,
    updateMember,
    deleteMember,
    signOut
  } = useDashboardData(notify);

  const navigateToPage = useCallback((page) => {
    setActivePage(page);
    window.sessionStorage.setItem(ACTIVE_PAGE_KEY, page);
    window.sessionStorage.setItem(SCROLL_POSITION_KEY, '0');
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    function saveScrollPosition() {
      window.sessionStorage.setItem(SCROLL_POSITION_KEY, String(window.scrollY));
    }
    window.addEventListener('pagehide', saveScrollPosition);
    return () => window.removeEventListener('pagehide', saveScrollPosition);
  }, []);

  useEffect(() => {
    if (!user || loading) return undefined;
    const savedPosition = window.sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (savedPosition === null) return undefined;
    const position = Number(savedPosition);
    if (!Number.isFinite(position) || position < 0) {
      window.sessionStorage.removeItem(SCROLL_POSITION_KEY);
      return undefined;
    }

    let secondFrame;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const maxPosition = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, Math.min(position, Math.max(0, maxPosition)));
        window.sessionStorage.removeItem(SCROLL_POSITION_KEY);
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) window.cancelAnimationFrame(secondFrame);
    };
  }, [user, loading]);

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
        onNavigate={navigateToPage}
        onSignOut={signOut}
        error={error}
        onDismissError={() => setError('')}
      >
        <DashboardPage
          page={activePage}
          data={data}
          save={save}
          createMember={createMember}
          updateMember={updateMember}
          deleteMember={deleteMember}
          isAdmin={isAdmin}
          confirm={confirm}
          onNavigate={navigateToPage}
        />
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
