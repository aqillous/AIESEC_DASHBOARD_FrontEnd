import { Button } from '../components/ui/index.jsx';

export default function SignInPage({ onLogin, error }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_top_right,_#e7efff,_#f8fafc_56%,_#eef3fb)] p-5">
      <section className="w-full max-w-md rounded-3xl border border-white bg-white p-8 text-center shadow-[0_24px_70px_rgba(19,32,56,.14)] sm:p-10">
        <img className="mx-auto mb-6 h-16 w-20 object-contain" src="https://aiesec-logos.s3.eu-west-1.amazonaws.com/White-Blue-Logo.png" alt="AIESEC" />
        <p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-blue-700">AIESEC Azerbaijan</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Social Media Dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Plan content, collaborate with your team and track channel performance.</p>
        {error && <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left text-sm text-rose-700">{error}</p>}
        <Button className="mt-7 w-full" size="lg" onClick={onLogin}>Continue with Google <span aria-hidden="true">→</span></Button>
        <p className="mt-5 text-xs leading-5 text-slate-400">Sign in with your authorized AIESEC Google account.</p>
      </section>
    </main>
  );
}
