import { useState } from 'react'
import {
  ArrowLeftRight,
  Bell,
  CalendarCheck2,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Ellipsis,
  Eye,
  EyeOff,
  Gem,
  Heart,
  Landmark,
  Mail,
  PiggyBank,
  Receipt,
  Settings2,
  Share2,
  Smartphone,
  TrafficCone,
  Video,
} from 'lucide-react'
import { upcomingAppointments, useApp } from '../store'
import { BottomNav } from '../components/ui'
import { getBranch } from '../data/branches'
import { getService, getTopic } from '../data/services'
import { whenLabel } from '../data/slots'
import logo from '../assets/ezy-logo.png'

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
    { label: 'EZY Meet', icon: CalendarClock, meet: true },
    { label: 'Open FD', icon: PiggyBank },
    { label: 'Service Requests', icon: ClipboardList },
  ]

  return (
    <div className="view">
      <div className="view__scroll">
        <div className="home-head">
          <div className="profile">
            <div className="avatar">S<i /></div>
            <div className="profile__name">
              <b>Hi, Sandeepa</b>
              <span>Privilege Club</span>
            </div>
            <div className="profile__icons">
              <button aria-label="Favourites" onClick={soon}><Heart size={21} /></button>
              <button aria-label="Notifications" onClick={soon}><Bell size={21} /><span className="dot" /></button>
              <button aria-label="Messages" onClick={soon}><Mail size={21} /><span className="dot" /></button>
            </div>
          </div>
          <div className="chips">
            {['Dashboard', 'Accounts', 'Term Deposits', 'Cards', 'Loans'].map((c, i) => (
              <button key={c} className={i === 0 ? 'on' : ''} onClick={i ? soon : undefined}>{c}</button>
            ))}
          </div>
        </div>

        <div className="balance">
          <div className="balance__top">
            <span>Available Balance</span>
            <ChevronDown size={18} />
          </div>
          <div className="balance__amt">
            {hidden ? 'LKR ••••••••' : 'LKR 248,750.00'}
            <button aria-label="Toggle balance" onClick={() => setHidden((h) => !h)} style={{ color: '#fff' }}>
              {hidden ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
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
          {/* EZY Meet widget */}
          <section className="card meet-card">
            <div className="meet-card__head">
              <div className="meet-card__title">
                <img src={logo} alt="" /> EZY Meet <span className="new-badge">NEW</span>
              </div>
              <button className="link" onClick={() => push({ name: 'appointments' })}>View All</button>
            </div>
            {next ? (
              <button className="appt-mini" onClick={() => push({ name: 'appointments' })}>
                <span className="appt-mini__icon">{next.kind === 'virtual' ? <Video size={20} /> : <CalendarCheck2 size={20} />}</span>
                <span className="appt-mini__txt">
                  <b>{whenLabel(next.dateKey, next.time)}</b>
                  <span>
                    {next.kind === 'virtual'
                      ? `${getTopic(next.serviceId)?.name} · Video call`
                      : `${getBranch(next.branchId!)?.name} Branch · ${getService(next.serviceId)?.name}`}
                  </span>
                </span>
                <span className="prio">Priority Service</span>
              </button>
            ) : (
              <div className="meet-card__cta">
                <p>
                  <b>Skip the queue</b>
                  Book a branch visit or a video call with an advisor in a few taps.
                </p>
                <div className="meet-card__art"><CalendarClock size={34} /></div>
              </div>
            )}
            <div className="meet-card__actions">
              <button className="btn" onClick={openMeet}><CalendarClock size={16} /> Book a Visit</button>
              <button className="btn btn--ghost" onClick={() => push({ name: 'meet', tab: 'virtual' })}><Video size={16} /> Video Call</button>
            </div>
          </section>

          <section className="card grid4">
            {services.map(({ label, icon: Icon, meet }) => (
              <button key={label} className={meet ? 'hl' : ''} onClick={meet ? openMeet : soon}>
                <span className="tile"><Icon size={24} strokeWidth={1.7} /></span>
                {meet && <span className="new-badge">NEW</span>}
                {label}
              </button>
            ))}
          </section>

          <section className="card quickpay">
            <div className="quickpay__head">Quick Pay <Settings2 size={18} color="#8a8aa0" /></div>
            <div className="quickpay__row">
              {['Amma', 'Dialog', 'CEB', 'Water'].map((n) => (
                <div key={n}><i>{n.slice(0, 2).toUpperCase()}</i>{n}</div>
              ))}
              <div><i><Ellipsis size={18} /></i>More</div>
            </div>
          </section>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
