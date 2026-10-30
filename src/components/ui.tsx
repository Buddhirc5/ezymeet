import { useEffect, type ReactNode } from 'react'
import { ChevronLeft, History, House, LayoutGrid, QrCode, Wallet, X } from 'lucide-react'
import { useApp } from '../store'
import { busyness, type Busyness } from '../data/slots'
import type { Branch } from '../data/branches'

export function ScreenHeader({ title, right, onBack }: { title: string; right?: ReactNode; onBack?: () => void }) {
  const { back } = useApp()
  return (
    <header className="screen-header">
      <button className="icon-btn" aria-label="Back" onClick={onBack ?? back}>
        <ChevronLeft size={24} />
      </button>
      <h1>{title}</h1>
      <div className="screen-header__right">{right}</div>
    </header>
  )
}

const STEPS = ['Service', 'Branch', 'Time', 'Confirm']

export function Stepper({ step }: { step: number }) {
  return (
    <div className="stepper" aria-label={`Step ${step} of ${STEPS.length}`}>
      {STEPS.map((label, i) => (
        <div key={label} className={`stepper__item ${i + 1 < step ? 'is-done' : ''} ${i + 1 === step ? 'is-active' : ''}`}>
          <span className="stepper__dot">{i + 1}</span>
          <span className="stepper__label">{label}</span>
        </div>
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
        <div className="sheet__head">
          <h2>{title}</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

export function BusyChip({ branch }: { branch: Branch }) {
  const level: Busyness = busyness(branch)
  return <span className={`busy busy--${level.toLowerCase()}`}>{level === 'Busy' ? 'Busy now' : `${level} crowd`}</span>
}

export function BottomNav() {
  const { toast } = useApp()
  const soon = () => toast('Not part of the EZY Meet prototype')
  return (
    <nav className="bottom-nav">
      <button className="is-active">
        <House size={22} />
        <span>Home</span>
      </button>
      <button onClick={soon}>
        <Wallet size={22} />
        <span>My Wallet</span>
      </button>
      <button onClick={soon}>
        <QrCode size={22} />
        <span>QR Pay</span>
      </button>
      <button onClick={soon}>
        <History size={22} />
        <span>Activity</span>
      </button>
      <button onClick={soon}>
        <LayoutGrid size={22} />
        <span>Menu</span>
      </button>
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
        <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.2-1.3A10.3 10.3 0 0 0 8 .7C5.2.7 2.7 1.8.8 3.6L2 4.9a8.5 8.5 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.6 6.6 0 0 0 8 4.3c-1.8 0-3.4.7-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3Zm0 3.6c-.6 0-1.1.2-1.5.6L8 11.8l1.5-1.5c-.4-.4-.9-.6-1.5-.6Z" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="20" height="9" rx="2" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" opacity=".4" /></svg>
      </span>
    </div>
  )
}
