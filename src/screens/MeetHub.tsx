import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { upcomingAppointments, useApp } from '../store'
import { NavRow, ScreenHeader, Tabs } from '../components/ui'
import { IN_APP, SERVICE_CATEGORIES, getService, servicesFor, type Mode, type Service } from '../data/services'
import { liveAdvisors } from '../data/slots'

const matches = (q: string, ...text: string[]) => text.join(' ').toLowerCase().includes(q)

export default function MeetHub({ tab: initialTab = 'branch' }: { tab?: 'branch' | 'virtual' }) {
  const { appointments, push } = useApp()
  const [tab, setTab] = useState<'branch' | 'virtual'>(initialTab)
  const count = upcomingAppointments(appointments).length

  return (
    <div className="view">
      <ScreenHeader title="EZY Meet" />
      <Tabs value={tab} onChange={setTab} options={[['branch', 'Visit Branch'], ['virtual', 'Video Call']]} />
      <div className="view__scroll" key={tab}>
        <div className="body">
          {count > 0 && (
            <NavRow className="nav-row--accent" title="My Appointments" desc={`${count} upcoming`} onClick={() => push({ name: 'appointments' })} />
          )}
          {tab === 'branch' ? <ServiceList mode="branch" /> : <VideoServices />}
        </div>
      </div>
    </div>
  )
}

/** Searchable, grouped list of services for one channel. */
function ServiceList({ mode }: { mode: Mode }) {
  const { push, toast } = useApp()
  const [q, setQ] = useState('')
  const t = q.trim().toLowerCase()

  const services = useMemo(
    () => servicesFor(mode).filter((s) => s.id !== 'video-kyc' && (!t || matches(t, s.name, s.desc))),
    [mode, t],
  )
  const inApp = mode === 'branch' ? IN_APP.filter((s) => !t || matches(t, s.name)) : []

  const open = (s: Service) =>
    mode === 'branch' ? push({ name: 'branch', serviceId: s.id }) : push({ name: 'vbook', topicId: s.id })

  return (
    <>
      <label className="field" style={{ margin: '4px 0 6px' }}>
        <small>What do you need?</small>
        <input placeholder="Search e.g. pay order, TT, locker" value={q} onChange={(e) => setQ(e.target.value)} />
        <Search size={18} strokeWidth={1.7} color="#8a8a8a" />
      </label>

      {SERVICE_CATEGORIES.map((cat) => {
        const items = services.filter((s) => s.category === cat)
        if (!items.length) return null
        return (
          <div key={cat}>
            <p className="group-label" style={{ marginTop: 26 }}>{cat}</p>
            {items.map((s) => (
              <NavRow
                key={s.id}
                title={s.name}
                desc={`${s.desc} · ~${s.tat} min${mode === 'branch' && s.modes.includes('video') ? ' · also by video' : ''}`}
                onClick={() => open(s)}
              />
            ))}
          </div>
        )
      })}

      {inApp.length > 0 && (
        <>
          <p className="group-label" style={{ marginTop: 30 }}>No visit needed — do it in the EZY app</p>
          {inApp.map((s) => (
            <NavRow key={s.name} title={s.name} desc={s.where} right={<span className="in-app">In app</span>} onClick={() => toast(`Opens ${s.where}`)} />
          ))}
        </>
      )}

      {!services.length && !inApp.length && <p className="empty">No services match “{q}”.</p>}
    </>
  )
}

function VideoServices() {
  const { push } = useApp()
  const live = liveAdvisors()
  const kyc = getService('video-kyc')!

  return (
    <>
      <div className="live" style={{ marginTop: 4, marginBottom: 12 }}>
        <div>
          <b>Talk to an advisor now</b>
          <span>{live.online} advisors online · ~{live.wait} min</span>
        </div>
        <button className="btn btn--sm" onClick={() => push({ name: 'call', topicId: 'live' })}>Call</button>
      </div>
      <NavRow title={kyc.name} desc={`${kyc.desc} · ~${kyc.tat} min`} onClick={() => push({ name: 'vbook', topicId: kyc.id })} />
      <div style={{ height: 14 }} />
      <ServiceList mode="video" />
    </>
  )
}
