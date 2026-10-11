import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({ children, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
  return <button className={`button button--${variant}`} {...props}>{children}</button>;
}

export function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return <article className="metric-card"><div className="metric-card__top"><span>{label}</span><span className="metric-card__icon" aria-hidden="true">{icon}</span></div><strong>{value}</strong><span className="metric-card__detail">{detail}</span></article>;
}

export function StatusPill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' }) {
  return <span className={`status status--${tone}`}>{children}</span>;
}
