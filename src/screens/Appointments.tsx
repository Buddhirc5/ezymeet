import { useState } from 'react'
import { CalendarClock, CalendarPlus, CalendarX, Clock, MapPin, Navigation, Plus, RefreshCw, Video } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { upcomingAppointments, useApp, type Appointment } from '../store'
import { BottomSheet, ScreenHeader } from '../components/ui'
import { addToCalendar } from '../calendar'
import { directionsUrl, getBranch } from '../data/branches'
import { getService, getTopic } from '../data/services'
import { whenLabel } from '../data/slots'

export default function Appointments() {
  const { appointments, push, cancel, toast } = useApp()
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming')
  const [toCancel, setToCancel] = useState<Appointment | null>(null)
  const [qrFor, setQrFor] = useState<Appointment | null>(null)

  const upcoming = upcomingAppointments(appointments)
  const history = appointments.filter((a) => !upcoming.includes(a))
  const list = tab === 'upcoming' ? upcoming : history

  const reschedule = (a: Appointment) =>
    a.kind === 'branch'
      ? push({ name: 'slot', serviceId: a.serviceId, branchId: a.branchId!, rescheduleId: a.id })
      : push({ name: 'vbook', topicId: a.serviceId, rescheduleId: a.id })

  return (
    <div className="view">
      <ScreenHeader
        title="My Appointments"
        right={
          <button className="icon-btn" aria-label="New appointment" onClick={() => push({ name: 'meet' })}>
            <Plus size={22} />
          </button>
        }
      />
      <div className="tabs">
        <button className={tab === 'upcoming' ? 'on' : ''} onClick={() => setTab('upcoming')}>Upcoming ({upcoming.length})</button>
        <button className={tab === 'history' ? 'on' : ''} onClick={() => setTab('history')}>History</button>
      </div>
      <div className="view__scroll">
        <div className="pad" style={{ paddingTop: 16, paddingBottom: 28 }}>
          {list.length === 0 && (
            <div className="empty" style={{ paddingTop: 60 }}>
              <div className="meet-card__art" style={{ margin: '0 auto 14px' }}><CalendarClock size={34} /></div>
              {tab === 'upcoming' ? 'No upcoming appointments.' : 'No past appointments yet.'}
              {tab === 'upcoming' && (
                <button className="btn" style={{ marginTop: 18 }} onClick={() => push({ name: 'meet' })}>Book an Appointment</button>
              )}
            </div>
          )}
          {list.map((a) => {
            const branch = a.branchId ? getBranch(a.branchId) : undefined
            const svc = getService(a.serviceId) ?? getTopic(a.serviceId)
            const Icon = svc?.icon ?? CalendarClock
            const isUpcoming = upcoming.includes(a)
            const status = a.status === 'cancelled' ? 'cancelled' : isUpcoming ? 'upcoming' : 'past'
            return (
              <section key={a.id} className="card appt">
                <div className="appt__top">
                  <span className="tile"><Icon size={21} /></span>
                  <div>
                    <b>{svc?.name}</b>
                    <span>{branch ? `${branch.name} Branch` : 'Video call'} · {a.ref}</span>
                  </div>
                  <span className={`status status--${status}`}>{status[0].toUpperCase() + status.slice(1)}</span>
                </div>
                <div className="appt__when">
                  <span className="pill"><Clock size={13} /> {whenLabel(a.dateKey, a.time)}</span>
                  {branch ? <span className="pill"><MapPin size={13} /> {branch.name}</span> : <span className="pill"><Video size={13} /> Online</span>}
                  {isUpcoming && branch && <span className="prio" style={{ alignSelf: 'center' }}>Priority Service</span>}
                </div>
                {isUpcoming && (
                  <>
                    <div className="appt__btns">
                      {branch ? (
                        <button className="btn" onClick={() => setQrFor(a)}>Show QR</button>
                      ) : (
                        <button className="btn" onClick={() => push({ name: 'call', topicId: a.serviceId, apptId: a.id })}><Video size={15} /> Join</button>
                      )}
                      <button className="btn btn--soft" onClick={() => reschedule(a)}><RefreshCw size={14} /> Reschedule</button>
                    </div>
                    <div className="appt__btns">
                      {branch && (
                        <a className="btn btn--soft" href={directionsUrl(branch)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                          <Navigation size={14} /> Directions
                        </a>
                      )}
                      <button className="btn btn--soft" onClick={() => addToCalendar(a)}><CalendarPlus size={14} /> Calendar</button>
                      <button className="btn btn--soft" style={{ color: 'var(--red)' }} onClick={() => setToCancel(a)}><CalendarX size={14} /> Cancel</button>
                    </div>
                  </>
                )}
              </section>
            )
          })}
        </div>
      </div>

      <BottomSheet open={!!toCancel} onClose={() => setToCancel(null)} title="Cancel appointment?">
        {toCancel && (
          <>
            <p className="hint" style={{ marginBottom: 16 }}>
              Your {whenLabel(toCancel.dateKey, toCancel.time)} slot will be released for other customers.
            </p>
            <div className="btn-row">
              <button className="btn btn--soft" onClick={() => setToCancel(null)}>Keep it</button>
              <button
                className="btn btn--red"
                onClick={() => {
                  cancel(toCancel.id)
                  setToCancel(null)
                  toast('Appointment cancelled')
                }}
              >
                Yes, cancel
              </button>
            </div>
          </>
        )}
      </BottomSheet>

      <BottomSheet open={!!qrFor} onClose={() => setQrFor(null)} title="Scan at the branch">
        {qrFor && (
          <div style={{ textAlign: 'center', paddingBottom: 8 }}>
            <div className="ticket__qr" style={{ display: 'inline-block', padding: 12 }}>
              <QRCodeSVG value={`EZYMEET:${qrFor.ref}`} size={200} fgColor="#1b1a5e" />
            </div>
            <p style={{ marginTop: 12, fontWeight: 700, color: 'var(--navy)', letterSpacing: 1 }}>{qrFor.ref}</p>
            <p className="hint">{whenLabel(qrFor.dateKey, qrFor.time)} · {getBranch(qrFor.branchId!)?.name} Branch</p>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
