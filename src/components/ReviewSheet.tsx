import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { BottomSheet } from './ui'
import { useApp } from '../store'
import { getBranch } from '../data/branches'
import { getService, getTopic } from '../data/services'
import { whenLabel, type Slot } from '../data/slots'

export interface Draft {
  kind: 'branch' | 'virtual'
  serviceId: string
  branchId?: string
  dateKey: string
  slot: Slot
  docs?: string[]
}

export default function ReviewSheet({ draft, onClose, rescheduleId }: { draft: Draft | null; onClose: () => void; rescheduleId?: string }) {
  const { book, reset } = useApp()
  const service = draft?.kind === 'branch' ? getService(draft.serviceId) : undefined
  const topic = draft?.kind === 'virtual' ? getTopic(draft.serviceId) : undefined
  const branch = draft?.branchId ? getBranch(draft.branchId) : undefined

  const confirm = () => {
    if (!draft) return
    const appt = book(
      {
        kind: draft.kind,
        serviceId: draft.serviceId,
        branchId: draft.branchId,
        dateKey: draft.dateKey,
        time: draft.slot.time,
        wait: draft.kind === 'branch' ? draft.slot.wait : undefined,
        docs: draft.docs,
      },
      rescheduleId,
    )
    onClose()
    reset({ name: 'done', apptId: appt.id, rescheduled: !!rescheduleId })
  }

  return (
    <BottomSheet open={!!draft} onClose={onClose} title={rescheduleId ? 'Confirm new time' : 'Confirm appointment'}>
      {draft && (
        <>
          <div className="kv">
            <div><span>{draft.kind === 'branch' ? 'Service' : 'Call type'}</span><b>{service?.name ?? topic?.name}</b></div>
            {branch ? (
              <div><span>Branch</span><b>{branch.name} Branch</b></div>
            ) : (
              <div><span>Mode</span><b>Secure video call</b></div>
            )}
            <div><span>Date & time</span><b>{whenLabel(draft.dateKey, draft.slot.time)}</b></div>
            {draft.kind === 'branch' ? (
              <>
                <div><span>Est. service time</span><b>~{service?.tat} min</b></div>
                <div><span>Expected wait</span><b>{draft.slot.wait} min</b></div>
              </>
            ) : (
              <div><span>Duration</span><b>~{topic?.duration} min</b></div>
            )}
            {draft.docs && <div><span>Documents</span><b>{draft.docs.length} uploaded</b></div>}
          </div>

          {service && (
            <div className="docs">
              <h3>Please bring</h3>
              <ul>
                {service.docs.map((d) => (
                  <li key={d}><CheckCircle2 size={15} /> {d}</li>
                ))}
              </ul>
            </div>
          )}

          <button className="btn" onClick={confirm}>{rescheduleId ? 'Confirm Reschedule' : 'Confirm Appointment'}</button>
          <p className="notice">
            <ShieldCheck size={15} style={{ flex: 'none' }} />
            {draft.kind === 'branch'
              ? 'Show your QR code at the branch for priority service. You can reschedule or cancel anytime.'
              : 'You will get a secure meeting link. Join from this app at your scheduled time.'}
          </p>
        </>
      )}
    </BottomSheet>
  )
}
