import { useEffect, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, History, House, LayoutGrid, QrCode, Wallet, X } from 'lucide-react'
import { useApp } from '../store'
import { busyness } from '../data/slots'
import type { Branch } from '../data/branches'

/** App-style header: back · small centred title · close. */
export function ScreenHeader({ title, onBack, close = true }: { title: string; onBack?: () => void; close?: boolean }) {
  const { back, reset } = useApp()
  return (
    <header className="screen-header">
      <button className="icon-btn" aria-label="Back" onClick={onBack ?? back}>
        <ChevronLeft size={26} strokeWidth={1.8} />
      </button>
      <h1>{title}</h1>
      {close ? (
        <button className="icon-btn" aria-label="Close" onClick={() => reset({ name: 'home' })}>
          <X size={24} strokeWidth={1.8} />
        </button>
      ) : (
        <span />
      )}
    </header>
  )
}

/** Grey rounded row used across the app: title, optional description, chevron. */
export function NavRow({
  title,
  desc,
  right,
  onClick,
  className = '',
}: {
  title: ReactNode
  desc?: ReactNode
  right?: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button className={`nav-row ${className}`} onClick={onClick}>
      <span className="nav-row__txt">
        <b>{title}</b>
        {desc && <span>{desc}</span>}
      </span>
      {right ?? <ChevronRight size={18} strokeWidth={1.8} className="nav-row__chev" />}
    </button>
  )
}

export function Tabs<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="tabs" role="tablist">
      {options.map(([v, label]) => (
        <button key={v} role="tab" aria-selected={v === value} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  )
}

export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return (
    <div className={`sheet-layer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="sheet-backdrop" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet__grabber" />
        <h2 className="sheet__title">{title}</h2>
        {children}
      </section>
    </div>
  )
}

/** Plain-text crowd level with a small status dot. */
export function Crowd({ branch }: { branch: Branch }) {
  const level = busyness(branch)
  return <span className={`crowd crowd--${level.toLowerCase()}`}>{level === 'Busy' ? 'Busy' : level === 'Low' ? 'Quiet' : 'Moderate'}</span>
}

export function BottomNav({ active = 'home' }: { active?: 'home' | 'menu' }) {
  const { reset, toast } = useApp()
  const soon = () => toast('Not part of the EZY Meet prototype')
  const items = [
    { id: 'home', label: 'Home', icon: House, go: () => reset({ name: 'home' }) },
    { id: 'wallet', label: 'My Wallet', icon: Wallet, go: soon },
    { id: 'qr', label: 'QR Pay', icon: QrCode, go: soon },
    { id: 'activity', label: 'Activity', icon: History, go: soon },
    { id: 'menu', label: 'Menu', icon: LayoutGrid, go: () => reset({ name: 'menu' }) },
  ]
  return (
    <nav className="bottom-nav">
      {items.map(({ id, label, icon: Icon, go }) => (
        <button key={id} className={id === active ? 'is-active' : ''} onClick={go}>
          <Icon size={23} strokeWidth={1.7} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

export function Toast() {
  const { toastMsg } = useApp()
  return <div className={`toast ${toastMsg ? 'is-visible' : ''}`} role="status">{toastMsg}</div>
}

export function StatusBar({ dark }: { dark?: boolean }) {
  const now = new Date()
  const time = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`
  return (
    <div className={`status-bar ${dark ? 'is-dark' : ''}`} aria-hidden>
      <span className="status-bar__time">{time}</span>
      <span className="status-bar__island" />
      <span className="status-bar__icons">
        <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <span style={{ fontSize: 14 }}>4G</span>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="16" height="9" rx="2" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" opacity=".4" /></svg>
      </span>
    </div>
  )
}
