type P = { className?: string };
const base = "w-full h-full";

export function Scales({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
      <path d="M12 3v18" /><path d="M7 21h10" /><path d="M5 7h14" />
      <path d="M5 7 2 14h6L5 7Z" /><path d="M19 7l-3 7h6l-3-7Z" />
      <path d="M2 14a3 3 0 0 0 6 0" /><path d="M16 14a3 3 0 0 0 6 0" />
      <circle cx="12" cy="4.5" r="1.4" />
    </svg>
  );
}
export function Home({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></svg>);
}
export function Books({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H10v18H5.5A1.5 1.5 0 0 1 4 19.5Z" /><path d="M14 3h4.5A1.5 1.5 0 0 1 20 4.5v15a1.5 1.5 0 0 1-1.5 1.5H14Z" /><path d="M10 8h4M10 13h4" /></svg>);
}
export function Upload({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><path d="M12 16V4" /><path d="m7.5 8.5 4.5-4.5 4.5 4.5" /><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" /></svg>);
}
export function Chart({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></svg>);
}
export function Gear({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3" /></svg>);
}
export function Flame({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><path d="M12 22c3.9 0 6.5-2.6 6.5-6 0-4.2-4-6.3-4.6-10.4C13.3 7.4 11.6 8.6 11 11c-1-.8-1.4-2-1.3-3.4C7.6 9.2 5.5 11.6 5.5 16c0 3.4 2.6 6 6.5 6Z" /></svg>);
}
export function Check({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><path d="m4.5 12.5 5 5 10-11" /></svg>);
}
export function Cross({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>);
}
export function Arrow({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><path d="M5 12h13" /><path d="m12.5 5.5 6.5 6.5-6.5 6.5" /></svg>);
}
export function Chevron({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><path d="m8 5 7 7-7 7" /></svg>);
}
export function Cards({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><rect x="3" y="6" width="13" height="14" rx="2" /><path d="M8 3h10a2 2 0 0 1 2 2v11" /></svg>);
}
export function Quill({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><path d="M20 4c-8 1-12 5-13.5 9.5L4 20" /><path d="M6.5 13.5c4-.5 7-2.5 8.5-6" /><path d="M4 20h6" /></svg>);
}
export function Target({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>);
}
export function Grid({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></svg>);
}
export function Camera({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v10A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5Z" /><circle cx="12" cy="13" r="3.5" /></svg>);
}
export function Sitemap({ className }: P) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true"><circle cx="4.5" cy="12" r="2.3" /><circle cx="18" cy="5" r="2.3" /><circle cx="18" cy="12" r="2.3" /><circle cx="18" cy="19" r="2.3" /><path d="M6.6 12h3M12 12h3.7M9.6 12 15.8 6.6M9.6 12l6.2 5.4" /></svg>);
}
