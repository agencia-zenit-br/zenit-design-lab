import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export function Button({ children, variant = 'primary', size = 'standard', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'compact' | 'standard' | 'prominent' }) {
  return <button type="button" className={`button button--${variant} button--${size} ${className}`.trim()} {...props}>{children}</button>;
}

export function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: IconName }) {
  return <article className="metric-card">
    <div className="metric-card__top"><span>{label}</span><span className="metric-card__icon"><Icon name={icon} size={17}/></span></div>
    <strong>{value}</strong><span className="metric-card__detail">{detail}</span>
  </article>;
}

export function StatusPill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  return <span className={`status status--${tone}`}>{children}</span>;
}
