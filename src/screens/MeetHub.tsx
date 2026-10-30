import { useMemo, useState } from 'react'
import { Building2, CalendarDays, ChevronRight, Clock, Search, Video } from 'lucide-react'
import { useApp } from '../store'
import { ScreenHeader, Stepper } from '../components/ui'
import { BRANCH_SERVICES, SERVICE_CATEGORIES, VIRTUAL_TOPICS, type BranchService } from '../data/services'
import { liveAdvisors } from '../data/slots'
import logo from '../assets/ezy-logo.png'
import kycImg from '../assets/video-kyc.jpg'
import advisorImg from '../assets/advisor.jpg'

export default function MeetHub({ tab: initialTab = 'branch' }: { tab?: 'branch' | 'virtual' }) {
  const { push } = useApp()
  const [tab, setTab] = useState(initialTab)

  return (
    <div className="view">
      <ScreenHeader
        title="EZY Meet"
        right={
          <button className="icon-btn" aria-label="My appointments" onClick={() => push({ name: 'appointments' })}>
            <CalendarDays size={22} />
          </button>
        }
      />
      <div className="meet-hero">
        <div className="meet-hero__brand">
          <img src={logo} alt="Pan Asia EZY" />
          <div>
            <b>Your Branch. Your Time.</b>
            <span>Book a branch visit or meet an advisor online</span>
          </div>
        </div>
      </div>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'branch'} className={tab === 'branch' ? 'on' : ''} onClick={() => setTab('branch')}>
          <Building2 size={17} /> Branch Visit
        </button>
        <button role="tab" aria-selected={tab === 'virtual'} className={tab === 'virtual' ? 'on' : ''} onClick={() => setTab('virtual')}>
          <Video size={17} /> Virtual Advisory
        </button>
      </div>
      <div className="view__scroll" key={tab}>{tab === 'branch' ? <BranchServices /> : <Virtual />}</div>
    </div>
  )
}

function BranchServices() {
  const { push } = useApp()
  const [q, setQ] = useState('')
  const pick = (s: BranchService) => push({ name: 'branch', serviceId: s.id })

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return t ? BRANCH_SERVICES.filter((s) => `${s.name} ${s.desc} ${s.category}`.toLowerCase().includes(t)) : BRANCH_SERVICES
  }, [q])

  return (
    <>
      <div style={{ background: '#fff' }}><Stepper step={1} /></div>
      <div className="pad" style={{ paddingTop: 16, paddingBottom: 28 }}>
        <h2 className="h2">What do you need?</h2>
        <p className="hint">Pick a service — we'll find the best branch and time for you.</p>

        <label className="search" style={{ marginTop: 14 }}>
          <Search size={18} />
          <input placeholder="Search e.g. pay order, cheque, FD" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>

        {!q && (
          <>
            <div className="section-title">Popular</div>
            <div className="popular">
              {BRANCH_SERVICES.filter((s) => s.popular).slice(0, 3).map((s) => (
                <button key={s.id} onClick={() => pick(s)}>
                  <span className="tile"><s.icon size={24} strokeWidth={1.7} /></span>
                  {s.name}
                  <small><Clock size={11} /> ~{s.tat} min</small>
                </button>
              ))}
            </div>
          </>
        )}

        {SERVICE_CATEGORIES.map((cat) => {
          const items = filtered.filter((s) => s.category === cat)
          if (!items.length) return null
          return (
            <div key={cat}>
              <div className="section-title">{cat}</div>
              <div className="list">
                {items.map((s) => (
                  <button key={s.id} className="row" onClick={() => pick(s)}>
                    <span className="tile"><s.icon size={21} strokeWidth={1.7} /></span>
                    <span className="row__txt">
                      <b>{s.name}</b>
                      <span>{s.desc}</span>
                    </span>
                    <span className="tat"><Clock size={11} /> {s.tat}m</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
        {!filtered.length && <p className="empty">No services match “{q}”.</p>}
      </div>
    </>
  )
}

function Virtual() {
  const { push } = useApp()
  const live = liveAdvisors()

  return (
    <div className="pad" style={{ paddingBottom: 28 }}>
      <div className="v-hero">
        <img src={kycImg} alt="" />
        <div className="v-hero__txt">
          <b>Meet an advisor face-to-face, from anywhere</b>
          <span>Video KYC, loan and investment advice — no branch visit needed.</span>
        </div>
      </div>

      <section className="card live">
        <div className="live__faces">
          <img src={advisorImg} alt="" />
          <i>RK</i>
          <i>+1</i>
        </div>
        <div className="live__txt">
          <b>Talk to an advisor now</b>
          <span>
            <span className="live__dot" /> {live.online} online · ~{live.wait} min wait
          </span>
        </div>
        <button className="btn btn--sm" onClick={() => push({ name: 'call', topicId: 'card-support' })}>
          <Video size={15} /> Call
        </button>
      </section>

      <div className="section-title">Schedule a video call</div>
      <div className="list">
        {VIRTUAL_TOPICS.map((t) => (
          <button key={t.id} className="row" onClick={() => push({ name: 'vbook', topicId: t.id })}>
            <span className="tile" style={t.id === 'video-kyc' ? { background: 'var(--navy)', color: '#fff' } : undefined}>
              <t.icon size={21} strokeWidth={1.7} />
            </span>
            <span className="row__txt">
              <b>{t.name}</b>
              <span>{t.desc}</span>
            </span>
            <ChevronRight size={18} className="chev" />
          </button>
        ))}
      </div>
    </div>
  )
}
