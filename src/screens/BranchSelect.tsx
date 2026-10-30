import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useApp } from '../store'
import { Crowd, NavRow, ScreenHeader } from '../components/ui'
import ReviewSheet, { type Draft } from '../components/ReviewSheet'
import { getService } from '../data/services'
import { rankBranches, whenLabel } from '../data/slots'

export default function BranchSelect({ serviceId, rescheduleId }: { serviceId: string; rescheduleId?: string }) {
  const { push, location, locate } = useApp()
  const service = getService(serviceId)!
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState<Draft | null>(null)

  useEffect(() => {
    if (location.source === 'default') locate()
  }, [location.source, locate])

  const { recommended: reco, nearest, byDistance } = useMemo(() => rankBranches(location), [location])
  const others = useMemo(() => {
    const t = q.trim().toLowerCase()
    const pool = byDistance.filter((o) => o.branch.id !== reco.branch.id)
    return t ? pool.filter((o) => `${o.branch.name} ${o.branch.address}`.toLowerCase().includes(t)) : pool.slice(0, 6)
  }, [q, byDistance, reco])

  const openSlots = (branchId: string) => push({ name: 'slot', serviceId, branchId, rescheduleId })

  return (
    <div className="view">
      <ScreenHeader title={service.name} />
      <div className="view__scroll">
        <div className="body">
          <p className="context">
            Showing branches near <b>{location.source === 'device' ? 'your location' : location.label}</b> · ~{service.tat} min service
            {location.source === 'default' && <> · <button onClick={locate}>Use my location</button></>}
          </p>

          {reco.next && (
            <section className="reco">
              <p className="reco__label">Recommended for you</p>
              <div className="reco__name">
                <b>{reco.branch.name}</b>
                <Crowd branch={reco.branch} />
              </div>
              <p className="reco__addr">{reco.branch.address}</p>
              <div className="facts">
                <div><small>Earliest</small><span>{whenLabel(reco.next.dateKey, reco.next.slot.time).replace(', ', ' ')}</span></div>
                <div><small>Wait</small><span>{reco.next.slot.wait} min</span></div>
                <div><small>Distance</small><span>{reco.distance.toFixed(1)} km</span></div>
              </div>
              <button
                className="btn"
                onClick={() => setDraft({ kind: 'branch', serviceId, branchId: reco.branch.id, dateKey: reco.next!.dateKey, slot: reco.next!.slot })}
              >
                Book {whenLabel(reco.next.dateKey, reco.next.slot.time)}
              </button>
              <button className="text-btn" onClick={() => openSlots(reco.branch.id)}>Choose another time</button>
            </section>
          )}

          {nearest.branch.id !== reco.branch.id && nearest.next && (
            <p className="note">
              <b>{nearest.branch.name}</b> is closest but busier — about {nearest.next.slot.wait} min wait at {whenLabel(nearest.next.dateKey, nearest.next.slot.time)}.
            </p>
          )}

          <p className="group-label" style={{ marginTop: 30 }}>Other branches</p>
          <label className="field" style={{ marginBottom: 12 }}>
            <input placeholder="Search 88 branches" value={q} onChange={(e) => setQ(e.target.value)} />
            <Search size={18} strokeWidth={1.7} color="#8a8a8a" />
          </label>
          {others.map((o) => (
            <NavRow
              key={o.branch.id}
              title={o.branch.name}
              desc={
                <>
                  {o.distance.toFixed(1)} km · {o.next ? whenLabel(o.next.dateKey, o.next.slot.time) : 'No slots this week'} · <Crowd branch={o.branch} />
                </>
              }
              onClick={() => openSlots(o.branch.id)}
            />
          ))}
          {!others.length && <p className="empty">No branches match “{q}”.</p>}
        </div>
      </div>
      <ReviewSheet draft={draft} onClose={() => setDraft(null)} rescheduleId={rescheduleId} />
    </div>
  )
}
