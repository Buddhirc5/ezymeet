import { useState } from 'react'
import {
  ArrowLeftRight,
  Bell,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Eye,
  EyeOff,
  Gem,
  Heart,
  Landmark,
  Mail,
  PiggyBank,
  Receipt,
  Share2,
  Smartphone,
  TrafficCone,
} from 'lucide-react'
import { upcomingAppointments, useApp } from '../store'
import { BottomNav, NavRow } from '../components/ui'
import { getBranch } from '../data/branches'
import { getService } from '../data/services'
import { whenLabel } from '../data/slots'

export default function Home() {
  const { push, toast, appointments } = useApp()
  const [hidden, setHidden] = useState(false)
  const next = upcomingAppointments(appointments)[0]
  const soon = () => toast('Not part of the EZY Meet prototype')
  const openMeet = () => push({ name: 'meet' })

  const services = [
    { label: 'Card Payments', icon: CreditCard },
    { label: 'Traffic Fines', icon: TrafficCone },
    { label: 'Gov Pay', icon: Landmark },
    { label: 'Mobile Reloads', icon: Smartphone },
    { label: 'Pawning Services', icon: Gem },
    { label: 'EZY Meet', icon: CalendarClock, go: openMeet },
    { label: 'Open FD', icon: PiggyBank },
    { label: 'Service Requests', icon: ClipboardList },
  ]

  return (
    <div className="view home">
      <div className="view__scroll">
        <div className="home-head">
          <div className="profile">
            <div className="avatar">S<i /></div>
            <div className="profile__name">
              <b>Hi, Sandeepa</b>
              <span>Privilege Club</span>
            </div>
            <div className="profile__icons">
              <button aria-label="Favourites" onClick={soon}><Heart size={22} strokeWidth={1.7} /></button>
              <button aria-label="Notifications" onClick={soon}><Bell size={22} strokeWidth={1.7} /><span className="dot" /></button>
              <button aria-label="Messages" onClick={soon}><Mail size={22} strokeWidth={1.7} /></button>
            </div>
          </div>
          <div className="chips">
            {['Dashboard', 'Accounts', 'Term Deposits', 'Cards', 'Loans'].map((c, i) => (
              <button key={c} className={i === 0 ? 'on' : ''} onClick={i ? soon : undefined}>{c}</button>
            ))}
          </div>
        </div>

        <div className="balance">
          <div className="balance__top"><span>Available Balance</span><ChevronDown size={18} /></div>
          <div className="balance__amt">
            {hidden ? 'LKR ••••••••' : 'LKR 248,750.00'}
            <button aria-label="Toggle balance" onClick={() => setHidden((h) => !h)}>{hidden ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
          <div className="balance__acct">CHAMPION SAVER</div>
          <div className="balance__acct-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>2103014013897 <Share2 size={14} /></span>
            <span className="more">More Details</span>
          </div>
          <div className="balance__btns">
            <button onClick={soon}><ArrowLeftRight size={17} /> Transfer Funds</button>
            <button onClick={soon}><Receipt size={17} /> Pay a Bill</button>
          </div>
        </div>

        <div className="home-body">
          {/* EZY Meet widget — one tap to the next step */}
          <section className="card meet-widget">
            <div className="meet-widget__head">
              <b>EZY Meet</b>
              {next && <button onClick={() => push({ name: 'appointments' })}>View All</button>}
            </div>
            {next ? (
              <NavRow
                onClick={() => push({ name: 'appointments' })}
                title={whenLabel(next.dateKey, next.time)}
                desc={next.kind === 'virtual' ? `${getService(next.serviceId)?.name} · Video call` : `${getBranch(next.branchId!)?.name} Branch · ${getService(next.serviceId)?.name}`}
                right={next.kind === 'branch' ? <span className="tag">Priority Service</span> : undefined}
              />
            ) : (
              <NavRow onClick={openMeet} title="Book a branch visit" desc="Pick a service, we'll find the fastest branch" />
            )}
          </section>

          <section className="card grid4">
            {services.map(({ label, icon: Icon, go }) => (
              <button key={label} onClick={go ?? soon}>
                <span className="tile"><Icon size={24} strokeWidth={1.6} /></span>
                {label}
              </button>
            ))}
          </section>

          <section className="card quickpay">
            <div className="quickpay__head">Quick Pay</div>
            <div className="quickpay__row">
              {['Amma', 'Dialog', 'CEB', 'Water'].map((n) => (
                <div key={n}><i>{n.slice(0, 2).toUpperCase()}</i>{n}</div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
