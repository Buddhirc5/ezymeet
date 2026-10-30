import { BottomSheet } from './ui'
import { useApp } from '../store'
import { getBranch } from '../data/branches'
import { getService } from '../data/services'
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
  const { book, reset, toast } = useApp()
  const service = draft ? getService(draft.serviceId) : undefined
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
          <div className="details">
            <div><span>{branch ? 'Service' : 'Call'}</span><b>{service?.name}</b></div>
            <div><span>{branch ? 'Branch' : 'Mode'}</span><b>{branch ? branch.name : 'Video call'}</b></div>
            <div><span>When</span><b>{whenLabel(draft.dateKey, draft.slot.time)}</b></div>
            {branch ? (
              <div><span>Expected wait</span><b>{draft.slot.wait} min</b></div>
            ) : (
              <div><span>Duration</span><b>~{service?.tat} min</b></div>
            )}
            {draft.docs && <div><span>Documents</span><b>{draft.docs.length ? `${draft.docs.length} uploaded` : 'Share on the call'}</b></div>}
          </div>

          <p className="bring">
            {branch && service ? <>Bring: <b>{service.docs.join(', ')}</b></> : 'We will send a secure link. Join from the EZY app at your time.'}
          </p>

          <p className="terms">
            By confirming, I agree to{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); toast('Terms and Conditions') }}>Terms and Conditions</a>
          </p>
          <button className="btn" onClick={confirm}>Confirm</button>
        </>
      )}
    </BottomSheet>
  )
}
