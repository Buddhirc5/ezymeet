import { useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { BRANCHES, getBranch } from '../data/branches'
import { getService } from '../data/services'
import { dayLabel, fmtTime, fromDateKey, longDate, shortDate, toDateKey } from '../data/slots'
import { bookingsFor, daySlots, loadPortal, savePortal, slotKey, weekDates, type Booking, type Status } from './data'
import logo from '../assets/ezy-logo.png'

type Page = 'today' | 'checkin' | 'schedule' | 'video' | 'capacity'

const PAGES: [Page, string][] = [
  ['today', 'Today'],
  ['checkin', 'Check-in'],
  ['schedule', 'Schedule'],
  ['video', 'Video Desk'],
  ['capacity', 'Slots & Capacity'],
]

const STATUS_LABEL: Record<Status, string> = {
  booked: 'Booked',
  arrived: 'Arrived',
  serving: 'Serving',
  served: 'Served',
  'no-show': 'No-show',
  cancelled: 'Cancelled',
}

interface Session {
  branchId: string
  staff: string
}

const SESSION_KEY = 'ezymeet.portal.session'

function readSession(): Session | null {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null')
  } catch {
    return null
  }
}

export default function Portal() {
  const [session, setSession] = useState<Session | null>(readSession)
  if (!session) {
    return (
      <Login
        onLogin={(s) => {
          try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(s))
          } catch {
            /* ignore */
          }
          setSession(s)
        }}
      />
    )
  }
  return (
    <Shell
      session={session}
      onLogout={() => {
        try {
          sessionStorage.removeItem(SESSION_KEY)
        } catch {
          /* ignore */
        }
        setSession(null)
      }}
    />
  )
}

function Login({ onLogin }: { onLogin: (s: Session) => void }) {
  const [branchId, setBranchId] = useState('maharagama')
  const [staff, setStaff] = useState('PAB-1042')
  return (
    <div className="login-page">
      <form
        className="login-card"
        onSubmit={(e) => {
          e.preventDefault()
          onLogin({ branchId, staff })
        }}
      >
        <img src={logo} alt="Pan Asia EZY" />
        <h1>EZY Meet Branch Portal</h1>
        <p className="muted">Manage appointments, check-ins and slots for your branch.</p>
        <label className="field">
          <small>Branch</small>
          <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <small>Staff ID</small>
          <input value={staff} onChange={(e) => setStaff(e.target.value)} />
        </label>
        <label className="field">
          <small>Password</small>
          <input type="password" defaultValue="portal2026" />
        </label>
        <button className="btn" type="submit">Sign in</button>
        <p className="muted small">Prototype — any credentials work.</p>
      </form>
    </div>
  )
}

function Shell({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [page, setPage] = useState<Page>('today')
  const [portal, setPortal] = useState(loadPortal)
  const [now, setNow] = useState(() => new Date())
  const [toast, setToast] = useState<string | null>(null)
  const branch = getBranch(session.branchId)!

  useEffect(() => savePortal(portal), [portal])
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 30000)
    // Pick up bookings made in the customer app in another tab
    const onStorage = () => setNow(new Date())
    window.addEventListener('storage', onStorage)
    return () => {
      clearInterval(i)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2400)
  }
  const setStatus = (b: Booking, s: Status) => {
    setPortal((p) => ({ ...p, statuses: { ...p.statuses, [b.id]: s } }))
    notify(`${b.name} · ${STATUS_LABEL[s]}`)
  }
  const ctx = { branch, now, portal, setPortal, setStatus, notify }

  return (
    <div className="shell">
      <aside className="side">
        <div className="side__brand">
          <img src={logo} alt="" />
          <div>
            <b>EZY Meet</b>
            <span>Branch Portal</span>
          </div>
        </div>
        <div className="side__branch">
          <small>Branch</small>
          <b>{branch.name}</b>
        </div>
        <nav>
          {PAGES.map(([id, label]) => (
            <button key={id} className={page === id ? 'on' : ''} onClick={() => setPage(id)}>{label}</button>
          ))}
        </nav>
        <div className="side__foot">
          <span>{session.staff}</span>
          <button onClick={onLogout}>Sign out</button>
        </div>
      </aside>
      <main className="main">
        <header className="main__head">
          <h1>{PAGES.find(([id]) => id === page)?.[1]}</h1>
          <span className="muted">{longDate(toDateKey(now))} · {fmtTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)}</span>
        </header>
        {page === 'today' && <Today {...ctx} />}
        {page === 'checkin' && <CheckIn {...ctx} />}
        {page === 'schedule' && <Schedule {...ctx} />}
        {page === 'video' && <VideoDesk {...ctx} />}
        {page === 'capacity' && <Capacity {...ctx} />}
      </main>
      <div className={`toast ${toast ? 'on' : ''}`}>{toast}</div>
    </div>
  )
}

interface Ctx {
  branch: NonNullable<ReturnType<typeof getBranch>>
  now: Date
  portal: ReturnType<typeof loadPortal>
  setPortal: React.Dispatch<React.SetStateAction<ReturnType<typeof loadPortal>>>
  setStatus: (b: Booking, s: Status) => void
  notify: (m: string) => void
}

const svcName = (id: string) => getService(id)?.name ?? 'Virtual advisory'

function Pill({ status }: { status: Status }) {
  return <span className={`pill pill--${status}`}>{STATUS_LABEL[status]}</span>
}

/** The one next action for a booking, so staff move each customer along with a single click. */
function NextAction({ b, setStatus }: { b: Booking; setStatus: Ctx['setStatus'] }) {
  if (b.status === 'booked') return <button className="btn btn--sm" onClick={() => setStatus(b, 'arrived')}>Check in</button>
  if (b.status === 'arrived') return <button className="btn btn--sm" onClick={() => setStatus(b, 'serving')}>Start</button>
  if (b.status === 'serving') return <button className="btn btn--sm" onClick={() => setStatus(b, 'served')}>Complete</button>
  return <span />
}

function Today({ branch, now, portal, setStatus }: Ctx) {
  const today = toDateKey(now)
  const list = useMemo(() => bookingsFor({ branchId: branch.id, kind: 'branch', dates: [today], statuses: portal.statuses }, now), [branch.id, today, portal.statuses, now])
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'waiting' | 'done'>('all')
  const sel = list.find((b) => b.id === selected) ?? null

  const count = (s: Status) => list.filter((b) => b.status === s).length
  const active = list.filter((b) => b.status !== 'cancelled')
  const shown = list.filter((b) =>
    filter === 'all' ? true : filter === 'waiting' ? ['booked', 'arrived', 'serving'].includes(b.status) : ['served', 'no-show', 'cancelled'].includes(b.status),
  )
  // Same estimate the customer app shows for this branch
  const expectedWait = Math.round(6 + branch.load * 22)

  return (
    <div className="page">
      <section className="kpis">
        <div><small>Appointments</small><b>{active.length}</b></div>
        <div><small>Arrived / serving</small><b>{count('arrived') + count('serving')}</b></div>
        <div><small>Served</small><b>{count('served')}</b></div>
        <div><small>No-show</small><b>{count('no-show')}</b></div>
        <div><small>Expected wait</small><b>~{expectedWait} min</b></div>
      </section>

      <div className="split">
        <section className="panel">
          <div className="panel__head">
            <h2>Today's appointments</h2>
            <div className="seg">
              {(['all', 'waiting', 'done'] as const).map((f) => (
                <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f === 'waiting' ? 'Waiting' : 'Done'}</button>
              ))}
            </div>
          </div>
          {shown.length === 0 && <p className="empty">No appointments.</p>}
          <div className="rows">
            {shown.map((b) => (
              <div key={b.id} className={`row ${selected === b.id ? 'sel' : ''}`} onClick={() => setSelected(b.id)}>
                <span className="row__time">{fmtTime(b.time)}</span>
                <span className="row__main">
                  <b>{b.name}{b.source === 'app' && <em className="tag">EZY app</em>}</b>
                  <span>{svcName(b.serviceId)} · {b.ref}</span>
                </span>
                <Pill status={b.status} />
                <span onClick={(e) => e.stopPropagation()}><NextAction b={b} setStatus={setStatus} /></span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel detail">
          {sel ? (
            <>
              <div className="detail__top">
                <div>
                  <h2>{sel.name}</h2>
                  <span className="muted">{sel.mobile}</span>
                </div>
                <Pill status={sel.status} />
              </div>
              <dl className="kv">
                <div><dt>Service</dt><dd>{svcName(sel.serviceId)}</dd></div>
                <div><dt>Time</dt><dd>{fmtTime(sel.time)}</dd></div>
                <div><dt>Reference</dt><dd>{sel.ref}</dd></div>
                <div><dt>Est. service</dt><dd>~{getService(sel.serviceId)?.tat ?? 15} min</dd></div>
                <div><dt>Booked via</dt><dd>{sel.source === 'app' ? 'EZY app (this device)' : 'EZY app'}</dd></div>
              </dl>
              <p className="label">Customer was asked to bring</p>
              <p className="docs">{getService(sel.serviceId)?.docs.join(' · ')}</p>
              <div className="detail__actions">
                <NextAction b={sel} setStatus={setStatus} />
                {sel.status === 'booked' && <button className="btn btn--ghost btn--sm" onClick={() => setStatus(sel, 'no-show')}>Mark no-show</button>}
                {['served', 'no-show'].includes(sel.status) && <button className="btn btn--ghost btn--sm" onClick={() => setStatus(sel, 'booked')}>Undo</button>}
              </div>
            </>
          ) : (
            <p className="empty">Select an appointment to see the customer and what they're bringing.</p>
          )}
        </section>
      </div>
    </div>
  )
}

function CheckIn({ branch, now, portal, setStatus, notify }: Ctx) {
  const today = toDateKey(now)
  const list = useMemo(() => bookingsFor({ branchId: branch.id, kind: 'branch', dates: [today], statuses: portal.statuses }, now), [branch.id, today, portal.statuses, now])
  const [q, setQ] = useState('')
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const ref = q.trim().toUpperCase().replace(/^EZYMEET:/, '')
  const match = ref.length >= 4 ? list.find((b) => b.ref === ref || b.ref.endsWith(ref) || b.name.toUpperCase().includes(ref)) : undefined
  const token = match ? `P-${String(list.indexOf(match) + 1).padStart(3, '0')}` : ''

  useEffect(() => {
    if (!scanning) return
    let stream: MediaStream | null = null
    let stop = false
    const Detector = (window as unknown as { BarcodeDetector?: new (o: object) => { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        if (!Detector) {
          notify('QR scanning is not supported in this browser — type the reference')
          return
        }
        const det = new Detector({ formats: ['qr_code'] })
        while (!stop && videoRef.current) {
          const codes = await det.detect(videoRef.current).catch(() => [])
          if (codes[0]) {
            setQ(codes[0].rawValue)
            setScanning(false)
            break
          }
          await new Promise((r) => setTimeout(r, 300))
        }
      } catch {
        notify('Camera not available')
        setScanning(false)
      }
    })()
    return () => {
      stop = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [scanning, notify])

  return (
    <div className="page narrow">
      <section className="panel">
        <h2>Scan the customer's QR or enter the reference</h2>
        <div className="checkin-input">
          <label className="field grow">
            <small>Reference or name</small>
            <input autoFocus placeholder="EZM-…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <button className="btn btn--ghost" onClick={() => setScanning((s) => !s)}>{scanning ? 'Stop camera' : 'Scan QR'}</button>
        </div>
        {scanning && <video ref={videoRef} className="scanner" playsInline muted />}
      </section>

      {match ? (
        <section className="panel">
          <div className="detail__top">
            <div>
              <h2>{match.name}</h2>
              <span className="muted">{svcName(match.serviceId)} · {fmtTime(match.time)} · {match.ref}</span>
            </div>
            <Pill status={match.status} />
          </div>
          {match.status === 'booked' ? (
            <div className="checkin-go">
              <button className="btn" onClick={() => setStatus(match, 'arrived')}>Check in · Priority token {token}</button>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 16 }}>Already {STATUS_LABEL[match.status].toLowerCase()}. Token {token}.</p>
          )}
        </section>
      ) : (
        ref.length >= 4 && <p className="empty">No appointment today matches “{q}”.</p>
      )}

      <section className="panel">
        <h2>Next to arrive</h2>
        <div className="rows">
          {list.filter((b) => b.status === 'booked').slice(0, 5).map((b) => (
            <div key={b.id} className="row" onClick={() => setQ(b.ref)}>
              <span className="row__time">{fmtTime(b.time)}</span>
              <span className="row__main"><b>{b.name}</b><span>{svcName(b.serviceId)} · {b.ref}</span></span>
              <QRCodeSVG value={`EZYMEET:${b.ref}`} size={28} fgColor="#14136b" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Schedule({ branch, now, portal }: Ctx) {
  const dates = weekDates()
  const all = useMemo(() => bookingsFor({ branchId: branch.id, kind: 'branch', dates, statuses: portal.statuses }, now), [branch.id, dates.join(), portal.statuses, now])
  const times = daySlots(dates.find((d) => daySlots(d).length > 8) ?? dates[0])
  const [cell, setCell] = useState<{ d: string; t: string } | null>(null)
  const max = Math.max(1, ...dates.flatMap((d) => times.map((t) => all.filter((b) => b.dateKey === d && b.time === t).length)))
  const inCell = cell ? all.filter((b) => b.dateKey === cell.d && b.time === cell.t) : []

  return (
    <div className="page">
      <section className="panel">
        <div className="panel__head">
          <h2>Next 7 days</h2>
          <span className="muted">{all.filter((b) => b.status !== 'cancelled').length} appointments</span>
        </div>
        <div className="grid" style={{ gridTemplateColumns: `72px repeat(${dates.length}, 1fr)` }}>
          <span />
          {dates.map((d) => (
            <span key={d} className="grid__day"><b>{dayLabel(d)}</b> {shortDate(d)}</span>
          ))}
          {times.map((t) => (
            <Row key={t} t={t} dates={dates} all={all} max={max} blocked={portal.blocked} branchId={branch.id} cell={cell} setCell={setCell} />
          ))}
        </div>
      </section>
      {cell && (
        <section className="panel">
          <h2>{dayLabel(cell.d)} {shortDate(cell.d)} · {fmtTime(cell.t)}</h2>
          {inCell.length === 0 && <p className="empty">No appointments in this slot.</p>}
          <div className="rows">
            {inCell.map((b) => (
              <div key={b.id} className="row">
                <span className="row__main"><b>{b.name}</b><span>{svcName(b.serviceId)} · {b.ref}</span></span>
                <Pill status={b.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Row({ t, dates, all, max, blocked, branchId, cell, setCell }: {
  t: string; dates: string[]; all: Booking[]; max: number; blocked: Record<string, true>; branchId: string
  cell: { d: string; t: string } | null; setCell: (c: { d: string; t: string }) => void
}) {
  return (
    <>
      <span className="grid__time">{fmtTime(t)}</span>
      {dates.map((d) => {
        const open = daySlots(d).includes(t)
        const n = all.filter((b) => b.dateKey === d && b.time === t && b.status !== 'cancelled').length
        const isBlocked = blocked[slotKey(branchId, d, t)]
        return (
          <button
            key={d}
            disabled={!open}
            className={`grid__cell ${isBlocked ? 'blocked' : ''} ${cell?.d === d && cell.t === t ? 'sel' : ''}`}
            style={n && !isBlocked ? { background: `rgba(20,19,107,${0.08 + (0.5 * n) / max})`, color: n / max > 0.6 ? '#fff' : undefined } : undefined}
            onClick={() => setCell({ d, t })}
          >
            {!open ? '' : isBlocked ? 'Blocked' : n || ''}
          </button>
        )
      })}
    </>
  )
}

function VideoDesk({ now, portal, setStatus, notify }: Ctx) {
  const today = toDateKey(now)
  const list = useMemo(() => bookingsFor({ kind: 'virtual', dates: [today], statuses: portal.statuses }, now), [today, portal.statuses, now])
  const live = ['Kasun Fernando', 'Hasini Abeysekara', 'Mohamed Rizwan']

  return (
    <div className="page">
      <div className="split">
        <section className="panel">
          <div className="panel__head"><h2>Scheduled video calls</h2><span className="muted">{list.length} today</span></div>
          <div className="rows">
            {list.map((b) => (
              <div key={b.id} className="row">
                <span className="row__time">{fmtTime(b.time)}</span>
                <span className="row__main">
                  <b>{b.name}{b.source === 'app' && <em className="tag">EZY app</em>}</b>
                  <span>{svcName(b.serviceId)} · {b.ref}{b.docs ? ` · ${b.docs.length} docs uploaded` : ''}</span>
                </span>
                <Pill status={b.status} />
                {['booked', 'arrived'].includes(b.status) ? (
                  <button className="btn btn--sm" onClick={() => { setStatus(b, 'serving'); notify('Opening secure video room…') }}>Join</button>
                ) : b.status === 'serving' ? (
                  <button className="btn btn--sm" onClick={() => setStatus(b, 'served')}>End</button>
                ) : <span />}
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel__head"><h2>Live queue</h2><span className="muted">“Talk to an advisor now”</span></div>
          <div className="rows">
            {live.map((n, i) => (
              <div key={n} className="row">
                <span className="row__main"><b>{n}</b><span>Waiting {i * 2 + 1} min</span></span>
                <button className="btn btn--sm" onClick={() => notify(`Connecting to ${n}…`)}>Answer</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function Capacity({ branch, now, portal, setPortal, notify }: Ctx) {
  const dates = weekDates().filter((d) => daySlots(d).length)
  const [day, setDay] = useState(dates[0])
  const counters = portal.counters[branch.id] ?? 3
  const toggle = (t: string) => {
    const k = slotKey(branch.id, day, t)
    setPortal((p) => {
      const blocked = { ...p.blocked }
      if (blocked[k]) delete blocked[k]
      else blocked[k] = true
      return { ...p, blocked }
    })
  }
  const today = toDateKey(now)
  const nowMin = now.getHours() * 60 + now.getMinutes()

  return (
    <div className="page">
      <section className="panel">
        <div className="panel__head">
          <h2>EZY Meet counters</h2>
          <div className="stepper-num">
            <button onClick={() => setPortal((p) => ({ ...p, counters: { ...p.counters, [branch.id]: Math.max(0, counters - 1) } }))}>−</button>
            <b>{counters}</b>
            <button onClick={() => setPortal((p) => ({ ...p, counters: { ...p.counters, [branch.id]: Math.min(8, counters + 1) } }))}>+</button>
          </div>
        </div>
        <p className="muted">Counters serving priority appointments. Each counter takes up to 2 appointments per 30-minute slot ({counters * 2} per slot).</p>
      </section>
      <section className="panel">
        <div className="panel__head">
          <h2>Block slots</h2>
          <span className="muted">Blocked slots are hidden from customers in the EZY app</span>
        </div>
        <div className="seg seg--days">
          {dates.map((d) => (
            <button key={d} className={d === day ? 'on' : ''} onClick={() => setDay(d)}>{dayLabel(d)} {fromDateKey(d).getDate()}</button>
          ))}
        </div>
        <div className="slot-toggles">
          {daySlots(day).map((t) => {
            const blocked = !!portal.blocked[slotKey(branch.id, day, t)]
            const past = day === today && Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) < nowMin
            return (
              <button key={t} disabled={past} className={blocked ? 'blocked' : ''} onClick={() => { toggle(t); notify(`${fmtTime(t)} ${blocked ? 'reopened' : 'blocked'}`) }}>
                <b>{fmtTime(t)}</b>
                <span>{blocked ? 'Blocked' : 'Open'}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
