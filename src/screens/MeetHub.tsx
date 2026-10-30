import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { upcomingAppointments, useApp } from '../store'
import { NavRow, ScreenHeader, Tabs } from '../components/ui'
import { BRANCH_SERVICES, SERVICE_CATEGORIES, VIRTUAL_TOPICS } from '../data/services'
import { liveAdvisors } from '../data/slots'

type Tab = 'branch' | 'virtual'

export default function MeetHub({ tab: initialTab = 'branch' }: { tab?: Tab }) {
  const { appointments, push } = useApp()
  const [tab, setTab] = useState<Tab>(initialTab)
  const count = upcomingAppointments(appointments).length

  return (
    <div className="view">
      <ScreenHeader title="EZY Meet" />
      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          ['branch', 'Visit Branch'],
          ['virtual', 'Video Call'],
        ]}
      />
      <div className="view__scroll" key={tab}>
        <div className="body">
          {count > 0 && (
            <NavRow
              className="nav-row--accent"
              title="My Appointments"
              desc={`${count} upcoming`}
              onClick={() => push({ name: 'appointments' })}
            />
          )}
          {tab === 'branch' ? <BranchServices /> : <Virtual />}
        </div>
      </div>
    </div>
  )
}

function BranchServices() {
  const { push } = useApp()
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return t ? BRANCH_SERVICES.filter((s) => `${s.name} ${s.desc} ${s.category}`.toLowerCase().includes(t)) : BRANCH_SERVICES
  }, [q])

  return (
    <>
      <label className="field" style={{ margin: '4px 0 6px' }}>
        <small>What do you need?</small>
        <input placeholder="Search a service" value={q} onChange={(e) => setQ(e.target.value)} />
        <Search size={18} strokeWidth={1.7} color="#8a8a8a" />
      </label>

      {SERVICE_CATEGORIES.map((cat) => {
        const items = filtered.filter((s) => s.category === cat)
        if (!items.length) return null
        return (
          <div key={cat}>
            <p className="group-label" style={{ marginTop: 26 }}>{cat}</p>
            {items.map((s) => (
              <NavRow key={s.id} title={s.name} desc={`${s.desc} · ~${s.tat} min`} onClick={() => push({ name: 'branch', serviceId: s.id })} />
            ))}
          </div>
        )
      })}
      {!filtered.length && <p className="empty">No services match “{q}”.</p>}
    </>
  )
}

function Virtual() {
  const { push } = useApp()
  const live = liveAdvisors()

  return (
    <>
      <div className="live" style={{ marginTop: 4 }}>
        <div>
          <b>Talk to an advisor now</b>
          <span>{live.online} advisors online · ~{live.wait} min</span>
        </div>
        <button className="btn btn--sm" onClick={() => push({ name: 'call', topicId: 'card-support' })}>Call</button>
      </div>

      <p className="group-label">Schedule a video call</p>
      {VIRTUAL_TOPICS.map((t) => (
        <NavRow key={t.id} title={t.name} desc={t.desc} onClick={() => push({ name: 'vbook', topicId: t.id })} />
      ))}
    </>
  )
}
