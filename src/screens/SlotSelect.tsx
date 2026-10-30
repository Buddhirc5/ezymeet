import { useMemo, useState } from 'react'
import { MapPin, Zap } from 'lucide-react'
import { useApp } from '../store'
import { BusyChip, ScreenHeader, Stepper } from '../components/ui'
import SlotPicker from '../components/SlotPicker'
import ReviewSheet, { type Draft } from '../components/ReviewSheet'
import { distanceKm, getBranch } from '../data/branches'
import { getService } from '../data/services'
import { branchSlots, earliest, fromDateKey, rankBranches, whenLabel, type SlotRef } from '../data/slots'

const at = (r: SlotRef) => +fromDateKey(r.dateKey) + r.slot.minutes * 60000

export default function SlotSelect({ serviceId, branchId, rescheduleId }: { serviceId: string; branchId: string; rescheduleId?: string }) {
  const { location, replace } = useApp()
  const branch = getBranch(branchId)!
  const service = getService(serviceId)!
  const slotsFor = (d: string) => branchSlots(branch, d)
  const [value, setValue] = useState<SlotRef | null>(() => earliest(slotsFor))
  const [draft, setDraft] = useState<Draft | null>(null)

  // Smart alternative: a different nearby branch that is at least an hour sooner
  const faster = useMemo(() => {
    const mine = earliest(slotsFor)
    const { recommended } = rankBranches(location)
    if (!recommended.next || recommended.branch.id === branchId) return null
    if (mine && at(recommended.next) > at(mine) - 60 * 60000) return null
    return recommended
  }, [branchId, location])

  const ready = value && value.slot.available

  return (
    <div className="view">
      <ScreenHeader title="Select Date & Time" />
      <div style={{ background: '#fff' }}><Stepper step={3} /></div>
      <div className="view__scroll">
        <div className="pad" style={{ paddingBottom: 24 }}>
          <div className="selected-svc">
            <span className="tile"><MapPin size={19} /></span>
            <div>
              <b>{branch.name} Branch</b>
              <span>{service.name} · {distanceKm(location, branch).toFixed(1)} km</span>
            </div>
            <BusyChip branch={branch} />
          </div>

          {faster && (
            <div className="faster">
              <span className="faster__icon"><Zap size={18} /></span>
              <div>
                <b>Faster at {faster.branch.name}</b>
                {whenLabel(faster.next!.dateKey, faster.next!.slot.time)} · ~{faster.next!.slot.wait} min wait · {faster.distance.toFixed(1)} km
              </div>
              <button className="btn btn--sm" onClick={() => replace({ name: 'slot', serviceId, branchId: faster.branch.id, rescheduleId })}>Switch</button>
            </div>
          )}

          <div className="section-title">Available dates</div>
          <SlotPicker slotsFor={slotsFor} value={value} onChange={setValue} showWait />
        </div>
      </div>
      <div className="view__footer">
        <button
          className="btn"
          disabled={!ready}
          onClick={() => value && setDraft({ kind: 'branch', serviceId, branchId, dateKey: value.dateKey, slot: value.slot })}
        >
          {ready ? `Continue · ${whenLabel(value.dateKey, value.slot.time)}` : 'Select a time slot'}
        </button>
      </div>
      <ReviewSheet draft={draft} onClose={() => setDraft(null)} rescheduleId={rescheduleId} />
    </div>
  )
}
