import type { SVGProps } from 'react';

/** Минималистичные иконки без внешней библиотеки. */
type Props = SVGProps<SVGSVGElement> & { size?: number };
function Svg({ children, size = 24, ...rest }: Props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {children}
  </svg>;
}
export function ArrowRight(p: Props) { return <Svg {...p}><path d="M5 12h14m-6-6 6 6-6 6"/></Svg>; }
export function ArrowUp(p: Props) { return <Svg {...p}><path d="M12 19V5m-6 6 6-6 6 6"/></Svg>; }
export function Check(p: Props) { return <Svg {...p}><path d="m4 12 5 5L20 6"/></Svg>; }
export function Eye(p: Props) { return <Svg {...p}><path d="M2 12s3.7-6.5 10-6.5S22 12 22 12s-3.7 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.7"/></Svg>; }
export function EyeOff(p: Props) { return <Svg {...p}><path d="M4 4 20 20M9.5 5.8A12 12 0 0 1 12 5.5c6.3 0 10 6.5 10 6.5a16 16 0 0 1-3 3.6M6.1 7.2C3.5 9 2 12 2 12s3.7 6.5 10 6.5c1.4 0 2.7-.3 3.8-.8"/></Svg>; }
export function Hash(p: Props) { return <Svg {...p}><path d="M5 9h14M4 15h14M11 3 7 21M17 3l-4 18"/></Svg>; }
export function Info(p: Props) { return <Svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></Svg>; }
export function LoaderCircle(p: Props) { return <Svg {...p}><path d="M21 12a9 9 0 1 1-9-9"/></Svg>; }
export function LockKeyhole(p: Props) { return <Svg {...p}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></Svg>; }
export function LogOut(p: Props) { return <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m4 14 5-5-5-5m5 5H9"/></Svg>; }
export function MessageCircle(p: Props) { return <Svg {...p}><path d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-3.8-.8L3 21l1.8-4.7a9 9 0 0 1-.8-3.8A8.5 8.5 0 0 1 12.5 4 8.5 8.5 0 0 1 20 11.5Z"/><path d="M8.5 12h7"/></Svg>; }
export function Radio(p: Props) { return <Svg {...p}><circle cx="12" cy="12" r="2"/><path d="M16.5 7.5a6.4 6.4 0 0 1 0 9m-9-9a6.4 6.4 0 0 0 0 9M20 4a11 11 0 0 1 0 16M4 4a11 11 0 0 0 0 16"/></Svg>; }
export function RefreshCw(p: Props) { return <Svg {...p}><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.4 9A7 7 0 0 1 18 7l2 5M4 12l2 5a7 7 0 0 0 12-2"/></Svg>; }
export function ShieldCheck(p: Props) { return <Svg {...p}><path d="M12 22s8-4.2 8-10V5l-8-3-8 3v7c0 5.8 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></Svg>; }
export function UsersRound(p: Props) { return <Svg {...p}><circle cx="9" cy="8" r="3"/><path d="M3 19v-2a6 6 0 0 1 12 0v2H3M17 6a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 4"/></Svg>; }
export function Wifi(p: Props) { return <Svg {...p}><path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0m-4 4h.01"/></Svg>; }
export function WifiOff(p: Props) { return <Svg {...p}><path d="M2 2 22 22M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 4-2m8 2a11 11 0 0 1 2 0M8 16a6 6 0 0 1 4-1m0 5h.01"/></Svg>; }
