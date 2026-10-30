import { Check } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useApp } from '../store'
import { NavRow } from '../components/ui'
import { addToCalendar } from '../calendar'
import { directionsUrl, getBranch } from '../data/branches'
import { getService } from '../data/services'
import { longDate, fmtTime } from '../data/slots'

export default function Confirmation({ apptId, rescheduled }: { apptId: string; rescheduled?: boolean }) {
  const { appointments, reset, push } = useApp()
  const a = appointments.find((x) => x.id === apptId)
  if (!a) return null
  const branch = a.branchId ? getBranch(a.branchId) : undefined

  return (
    <div className="view">
      <div className="view__scroll" style={{ paddingTop: 'calc(var(--sat) + 16px)' }}>
        <div className="body">
          <div className="done-head">
            <div className="done-head__check"><Check size={30} strokeWidth={2.6} /></div>
            <h2>{rescheduled ? 'Appointment rescheduled' : 'Appointment confirmed'}</h2>
            <p>{longDate(a.dateKey)} · {fmtTime(a.time)}</p>
          </div>

          <div className="pass">
            <QRCodeSVG value={`EZYMEET:${a.ref}`} size={84} fgColor="#14136b" />
            <div>
              <small>Reference</small>
              <b>{a.ref}</b>
              <span>{branch ? 'Scan at the branch entrance.' : 'Join from the EZY app at your time.'}</span>
            </div>
          </div>

          <div className="details">
            <div><span>{branch ? 'Service' : 'Call'}</span><b>{getService(a.serviceId)?.name}</b></div>
            <div><span>{branch ? 'Branch' : 'Mode'}</span><b>{branch ? branch.name : 'Video call'}</b></div>
            {a.wait !== undefined && <div><span>Expected wait</span><b>{a.wait} min</b></div>}
          </div>
          {branch && <p className="priority-line"><b>Priority Service</b> — you'll be served at your time, no queue.</p>}

          <div style={{ marginTop: 24 }}>
            <NavRow title="Add to Calendar" onClick={() => addToCalendar(a)} />
            {branch ? (
              <NavRow title="Get Directions" desc={branch.address} onClick={() => window.open(directionsUrl(branch), '_blank')} />
            ) : (
              <NavRow title="Join Call" desc="Opens when your advisor is ready" onClick={() => push({ name: 'call', topicId: a.serviceId, apptId: a.id })} />
            )}
          </div>
        </div>
      </div>
      <div className="view__footer">
        <button className="btn" onClick={() => reset({ name: 'home' })}>Done</button>
      </div>
    </div>
  )
}
