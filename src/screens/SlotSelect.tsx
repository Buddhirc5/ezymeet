import { useMemo, useState } from 'react'
import { useApp } from '../store'
import { ScreenHeader } from '../components/ui'
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

  // Smart alternative: another nearby branch that is at least an hour sooner
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
      <ScreenHeader title={`${branch.name} Branch`} />
      <div className="view__scroll">
        <div className="body">
          <p className="context">
            <b>{service.name}</b> · {distanceKm(location, branch).toFixed(1)} km away
          </p>

          {faster && (
            <div className="suggest">
              <span style={{ flex: 1 }}>
                <b>{faster.branch.name}</b> is free sooner — {whenLabel(faster.next!.dateKey, faster.next!.slot.time)}, ~{faster.next!.slot.wait} min wait.
              </span>
              <button onClick={() => replace({ name: 'slot', serviceId, branchId: faster.branch.id, rescheduleId })}>Switch</button>
            </div>
          )}

          <SlotPicker slotsFor={slotsFor} value={value} onChange={setValue} />
          {ready && <p className="slot-meta">Expected wait at {whenLabel(value.dateKey, value.slot.time)}: ~{value.slot.wait} min</p>}
        </div>
      </div>
      <div className="view__footer">
        <button
          className="btn"
          disabled={!ready}
          onClick={() => value && setDraft({ kind: 'branch', serviceId, branchId, dateKey: value.dateKey, slot: value.slot })}
        >
          Next
        </button>
      </div>
      <ReviewSheet draft={draft} onClose={() => setDraft(null)} rescheduleId={rescheduleId} />
    </div>
  )
}
