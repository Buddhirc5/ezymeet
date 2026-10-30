import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { upcomingAppointments, useApp, type Appointment } from '../store'
import { BottomSheet, NavRow, ScreenHeader, Tabs } from '../components/ui'
import { addToCalendar } from '../calendar'
import { directionsUrl, getBranch } from '../data/branches'
import { getService, getTopic } from '../data/services'
import { whenLabel } from '../data/slots'

const nameOf = (a: Appointment) => getService(a.serviceId)?.name ?? getTopic(a.serviceId)?.name ?? ''
const placeOf = (a: Appointment) => (a.branchId ? `${getBranch(a.branchId)?.name} Branch` : 'Video call')

export default function Appointments() {
  const { appointments, push, cancel, toast } = useApp()
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming')
  const [open, setOpen] = useState<Appointment | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const upcoming = upcomingAppointments(appointments)
  const history = appointments.filter((a) => !upcoming.includes(a))
  const list = tab === 'upcoming' ? upcoming : history

  const close = () => {
    setOpen(null)
    setConfirmCancel(false)
  }
  const reschedule = (a: Appointment) => {
    close()
    if (a.kind === 'branch') push({ name: 'slot', serviceId: a.serviceId, branchId: a.branchId!, rescheduleId: a.id })
    else push({ name: 'vbook', topicId: a.serviceId, rescheduleId: a.id })
  }

  return (
    <div className="view">
      <ScreenHeader title="My Appointments" />
      <Tabs value={tab} onChange={setTab} options={[['upcoming', 'Upcoming'], ['history', 'History']]} />
      <div className="view__scroll">
        <div className="body">
          {list.length === 0 && (
            <div className="empty">
              {tab === 'upcoming' ? 'No upcoming appointments.' : 'Nothing here yet.'}
              {tab === 'upcoming' && <button className="btn" style={{ marginTop: 20 }} onClick={() => push({ name: 'meet' })}>Book an Appointment</button>}
            </div>
          )}
          {list.map((a) => (
            <NavRow
              key={a.id}
              title={nameOf(a)}
              desc={`${whenLabel(a.dateKey, a.time)} · ${placeOf(a)}${a.status === 'cancelled' ? ' · Cancelled' : ''}`}
              onClick={upcoming.includes(a) ? () => setOpen(a) : undefined}
              right={upcoming.includes(a) ? undefined : <span />}
            />
          ))}
        </div>
      </div>

      <BottomSheet open={!!open} onClose={close} title={open ? nameOf(open) : ''}>
        {open && !confirmCancel && (
          <>
            {open.branchId && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 16px' }}>
                <QRCodeSVG value={`EZYMEET:${open.ref}`} size={150} fgColor="#14136b" />
              </div>
            )}
            <div className="details">
              <div><span>When</span><b>{whenLabel(open.dateKey, open.time)}</b></div>
              <div><span>{open.branchId ? 'Branch' : 'Mode'}</span><b>{placeOf(open)}</b></div>
              <div><span>Reference</span><b>{open.ref}</b></div>
            </div>
            <div className="btn-col" style={{ marginTop: 16 }}>
              {open.kind === 'virtual' && (
                <button className="btn" onClick={() => { close(); push({ name: 'call', topicId: open.serviceId, apptId: open.id }) }}>Join Call</button>
              )}
              {open.branchId && (
                <a className="btn" href={directionsUrl(getBranch(open.branchId)!)} target="_blank" rel="noreferrer">Get Directions</a>
              )}
              <div className="btn-row">
                <button className="btn btn--light" onClick={() => reschedule(open)}>Reschedule</button>
                <button className="btn btn--light" onClick={() => addToCalendar(open)}>Calendar</button>
              </div>
              <button className="btn btn--danger" onClick={() => setConfirmCancel(true)}>Cancel Appointment</button>
            </div>
          </>
        )}
        {open && confirmCancel && (
          <>
            <p className="context">Your {whenLabel(open.dateKey, open.time)} slot will be released for other customers.</p>
            <div className="btn-row">
              <button className="btn btn--light" onClick={() => setConfirmCancel(false)}>Keep</button>
              <button
                className="btn"
                style={{ background: 'var(--red)' }}
                onClick={() => {
                  cancel(open.id)
                  close()
                  toast('Appointment cancelled')
                }}
              >
                Cancel it
              </button>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  )
}
