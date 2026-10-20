import type { ReactNode, SVGProps } from 'react';

/** One shared outlined SVG vocabulary. No Unicode glyphs as UI icons. */
export type IconName =
  | 'dashboard' | 'components' | 'editorial' | 'organizations' | 'services'
  | 'storage' | 'activity' | 'settings' | 'chevron-left' | 'chevron-right'
  | 'search' | 'bell' | 'user' | 'plus' | 'check' | 'arrow-right'
  | 'moon' | 'sun' | 'monitor' | 'trash' | 'filter' | 'more'
  | 'folder' | 'chart' | 'users' | 'sparkles' | 'alert' | 'x'
  | 'help' | 'list' | 'edit' | 'external' | 'menu' | 'shield' | 'globe' | 'log-out' | 'calendar' | 'clock'
  | 'undo' | 'download' | 'align-left' | 'align-center' | 'align-right' | 'align-justify' | 'format-bold' | 'format-italic' | 'format-underline' | 'highlight';

const artwork: Record<IconName, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  components: <><rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><path d="m17.5 13 4 4-4 4-4-4z"/></>,
  editorial: <><path d="M4 4h12l4 4v12H4z"/><path d="M16 4v4h4M8 12h8M8 16h8M8 8h4"/></>,
  organizations: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2M14 7h2M9 11h2M14 11h2M9 21v-5h6v5"/></>,
  services: <><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></>,
  storage: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h2"/></>,
  activity: <><path d="M3 12h4l3-7 4 14 3-7h4"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M9.6 2.8 10.1 5a7.5 7.5 0 0 1 3.8 0l.5-2.2 3 1.7-.7 2.2a7.4 7.4 0 0 1 1.9 3.3l2.3.5v3.4l-2.3.5a7.4 7.4 0 0 1-1.9 3.3l.7 2.2-3 1.7-.5-2.2a7.5 7.5 0 0 1-3.8 0l-.5 2.2-3-1.7.7-2.2a7.4 7.4 0 0 1-1.9-3.3L3 13.9v-3.4l2.3-.5a7.4 7.4 0 0 1 1.9-3.3l-.7-2.2z"/></>,
  'chevron-left': <path d="m15 18-6-6 6-6"/>,
  'chevron-right': <path d="m9 18 6-6-6-6"/>,
  search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  check: <path d="m5 12 5 5L20 7"/>,
  'arrow-right': <path d="M4 12h16m-7-7 7 7-7 7"/>,
  moon: <path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5z"/>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></>,
  monitor: <><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8m-4-4v4"/></>,
  trash: <><path d="M4 7h16M9 4h6M6 7l1 14h10l1-14M10 11v6M14 11v6"/></>,
  filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>,
  more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  folder: <path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10H3z"/>,
  chart: <><path d="M4 20V11h4v9M10 20V4h4v16M16 20v-7h4v7M2 20h20"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 4c2 1 3 2.5 3 5"/></>,
  sparkles: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8zM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"/></>,
  alert: <><path d="m12 3 10 18H2z"/><path d="M12 9v5m0 3h.01"/></>,
  x: <path d="M18 6 6 18M6 6l12 12"/>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2.3-2.5 4v1m0 3h.01"/></>,
  list: <><path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01"/></>,
  edit: <><path d="m4 16 0 4 4-1 12-12-3-3zM15 6l3 3"/></>,
  external: <><path d="M13 5h6v6M19 5l-9 9"/><path d="M19 14v5H5V5h5"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  shield: <><path d="M12 2 4 5v6c0 5 3 8 8 11 5-3 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M8 14h3M8 18h3"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  undo: <><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-2"/></>,
  download: <><path d="M12 3v13m-5-5 5 5 5-5"/><path d="M4 17v4h16v-4"/></>,
  'align-left': <path d="M4 6h16M4 10h11M4 14h16M4 18h10"/>,
  'align-center': <path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>,
  'align-right': <path d="M4 6h16M9 10h11M4 14h16M10 18h10"/>,
  'align-justify': <path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>,
  'format-bold': <><path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z"/></>,
  'format-italic': <path d="M14 4H9m6 16H7M13 4 9 20"/>,
  'format-underline': <><path d="M6 4v7a6 6 0 0 0 12 0V4M4 21h16"/></>,
  highlight: <><path d="m5 16 10-10 4 4-10 10H5zM13 8l4 4M3 22h18"/></>,
  'log-out': <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M13 7l5 5-5 5M18 12H9"/></>,
};

export function Icon({ name, size = 18, title, ...props }: Omit<SVGProps<SVGSVGElement>,'children'> & {name: IconName; size?: number; title?: string}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} {...props}>
    {title && <title>{title}</title>}
    {artwork[name]}
  </svg>;
}
