import { CalendarPlus, Check, Copy, Crown, Navigation, Phone, Video } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useApp } from '../store'
import { addToCalendar } from '../calendar'
import { directionsUrl, getBranch } from '../data/branches'
import { getService, getTopic } from '../data/services'
import { longDate, fmtTime } from '../data/slots'
import wordmark from '../assets/pab-wordmark.png'

export default function Confirmation({ apptId, rescheduled }: { apptId: string; rescheduled?: boolean }) {
  const { appointments, reset, push, toast } = useApp()
  const a = appointments.find((x) => x.id === apptId)
  if (!a) return null
  const branch = a.branchId ? getBranch(a.branchId) : undefined
  const service = getService(a.serviceId)
  const topic = getTopic(a.serviceId)
  const meetLink = `ezy://meet/${a.ref.toLowerCase()}`

  return (
    <div className="view">
      <div className="view__scroll" style={{ paddingTop: 'var(--sat)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0' }}>
          <img src={wordmark} alt="Pan Asia Bank" style={{ height: 28 }} />
        </div>
        <div className="done">
          <div className="done__check"><Check size={44} strokeWidth={3} /></div>
          <h2>{rescheduled ? 'Appointment rescheduled!' : 'Your appointment is confirmed!'}</h2>
          <p>We've sent the details by SMS and email.</p>
        </div>

        <section className="ticket">
          <div className="ticket__top">
            <div className="ticket__qr"><QRCodeSVG value={`EZYMEET:${a.ref}`} size={86} fgColor="#1b1a5e" /></div>
            <div className="ticket__ref">
              <small>Reference</small>
              <b>{a.ref}</b>
              <span>{a.kind === 'branch' ? 'Show this QR at the branch entrance or token machine.' : 'Use this reference if you call us.'}</span>
            </div>
          </div>
          <div className="ticket__cut" />
          <div className="kv">
            <div><span>{a.kind === 'branch' ? 'Service' : 'Call type'}</span><b>{service?.name ?? topic?.name}</b></div>
            {branch ? <div><span>Branch</span><b>{branch.name} Branch</b></div> : <div><span>Mode</span><b>Secure video call</b></div>}
            <div><span>Date</span><b>{longDate(a.dateKey)}</b></div>
            <div><span>Time</span><b>{fmtTime(a.time)}</b></div>
            {a.wait !== undefined && <div><span>Expected wait</span><b>{a.wait} min</b></div>}
          </div>
        </section>

        {a.kind === 'branch' ? (
          <div className="priority">
            <span className="priority__icon"><Crown size={22} /></span>
            <div>
              <b>Priority Service</b>
              <span>Skip the queue — our staff will serve you at your confirmed time.</span>
            </div>
          </div>
        ) : (
          <div className="priority" style={{ background: 'linear-gradient(135deg,#eeedfd,#e3e1fb)' }}>
            <span className="priority__icon" style={{ color: 'var(--navy)' }}><Video size={22} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b>Meeting link</b>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--navy)' }}>{meetLink}</span>
            </div>
            <button
              className="icon-btn"
              aria-label="Copy link"
              onClick={() => {
                navigator.clipboard?.writeText(meetLink).catch(() => {})
                toast('Meeting link copied')
              }}
            >
              <Copy size={18} />
            </button>
          </div>
        )}

        <div className="actions3">
          <button onClick={() => addToCalendar(a)}><CalendarPlus size={20} /> Add to Calendar</button>
          {branch ? (
            <a href={directionsUrl(branch)} target="_blank" rel="noreferrer"><Navigation size={20} /> Directions</a>
          ) : (
            <button onClick={() => push({ name: 'call', topicId: a.serviceId, apptId: a.id })}><Video size={20} /> Join Call</button>
          )}
          <a href={`tel:${(branch?.phone ?? '011 2 565 565').replace(/\s/g, '')}`}><Phone size={20} /> Call {branch ? 'Branch' : 'Us'}</a>
        </div>
        <div style={{ height: 20 }} />
      </div>
      <div className="view__footer">
        <button className="btn" onClick={() => reset({ name: 'home' })}>Done</button>
        <button className="link" style={{ display: 'block', margin: '12px auto 0' }} onClick={() => reset({ name: 'appointments' })}>
          View my appointments
        </button>
      </div>
    </div>
  )
}
