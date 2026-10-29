import { useState } from 'react';

const buttonStyles = {
  primary: 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-blue-500',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500',
  subtle: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-blue-500'
};

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm'
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

export function Card({ className = '', children }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, children, className = '', hint }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      {label && <span className="block text-xs font-bold text-slate-600">{label}</span>}
      {children}
      {hint && <span className="block text-xs leading-5 text-slate-400">{hint}</span>}
    </label>
  );
}

const controlClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100';

export function Input({ className = '', ...props }) {
  return <input className={`${controlClass} ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return <select className={`${controlClass} ${className}`} {...props}>{children}</select>;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${controlClass} min-h-24 resize-y ${className}`} {...props} />;
}

export function Badge({ children, color = 'slate' }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
    purple: 'bg-violet-50 text-violet-700'
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${colors[color]}`}>{children}</span>;
}

export function EmptyState({ icon = '✦', title, description }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center">
      <span className="mb-3 grid size-11 place-items-center rounded-2xl bg-blue-50 text-xl text-blue-700">{icon}</span>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      {description && <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{description}</p>}
    </div>
  );
}

export function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          <button type="button" aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);
  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
      onCancel();
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" disabled={busy} onClick={confirm}>{busy ? 'Deleting…' : 'Delete'}</Button>
      </div>
    </Modal>
  );
}

export function LoadingScreen({ message = 'Loading dashboard…' }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
        <span className="size-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        {message}
      </div>
    </div>
  );
}
