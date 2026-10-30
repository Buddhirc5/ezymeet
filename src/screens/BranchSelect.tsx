import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ChevronRight, Clock, LocateFixed, MapPin, Search, Sparkles, Timer, Zap } from 'lucide-react'
import { useApp } from '../store'
import { BusyChip, ScreenHeader, Stepper } from '../components/ui'
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

  const { recommended, nearest, byDistance } = useMemo(() => rankBranches(location), [location])
  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return t ? byDistance.filter((o) => `${o.branch.name} ${o.branch.address}`.toLowerCase().includes(t)) : byDistance.slice(0, 8)
  }, [q, byDistance])

  const nearestIsSlow = nearest.branch.id !== recommended.branch.id && nearest.next

  return (
    <div className="view">
      <ScreenHeader title="Select Branch" />
      <div style={{ background: '#fff' }}><Stepper step={2} /></div>
      <div className="view__scroll">
        <div className="pad" style={{ paddingBottom: 28 }}>
          <div className="selected-svc">
            <span className="tile"><service.icon size={19} /></span>
            <div>
              <b>{service.name}</b>
              <span>Estimated service time ~{service.tat} min</span>
            </div>
          </div>

          <div className="loc">
            <MapPin size={14} /> Near <b>{location.label}</b>
            <button onClick={locate}><LocateFixed size={14} /> Use my location</button>
          </div>

          {recommended.next && (
            <section className="reco">
              <div className="reco__ribbon"><Sparkles size={14} /> Smart recommendation for you</div>
              <div className="reco__body">
                <div className="reco__name">
                  <div>
                    <b>{recommended.branch.name}</b>
                    <span>{recommended.branch.address}</span>
                  </div>
                  <BusyChip branch={recommended.branch} />
                </div>
                <div className="stats">
                  <div><small>Earliest slot</small><b>{whenLabel(recommended.next.dateKey, recommended.next.slot.time).replace(', ', ' ')}</b></div>
                  <div><small>Expected wait</small><b>{recommended.next.slot.wait} min</b></div>
                  <div><small>Distance</small><b>{recommended.distance.toFixed(1)} km</b></div>
                </div>
                <div className="reco__why">
                  <span><Zap size={12} /> Earliest available</span>
                  <span><Timer size={12} /> Short wait</span>
                  {recommended.distance < 5 && <span><MapPin size={12} /> Close by</span>}
                </div>
                <div className="btn-row">
                  <button
                    className="btn"
                    onClick={() =>
                      setDraft({ kind: 'branch', serviceId, branchId: recommended.branch.id, dateKey: recommended.next!.dateKey, slot: recommended.next!.slot })
                    }
                  >
                    Book {whenLabel(recommended.next.dateKey, recommended.next.slot.time)}
                  </button>
                </div>
                <button
                  className="link"
                  style={{ display: 'block', margin: '12px auto 0' }}
                  onClick={() => push({ name: 'slot', serviceId, branchId: recommended.branch.id, rescheduleId })}
                >
                  See other times
                </button>
              </div>
            </section>
          )}

          {nearestIsSlow && (
            <div className="compare">
              <AlertCircle size={18} />
              <span>
                Your nearest branch, <b>{nearest.branch.name}</b>, is busy — next slot {whenLabel(nearest.next!.dateKey, nearest.next!.slot.time)} with ~{nearest.next!.slot.wait} min wait.
              </span>
            </div>
          )}

          <div className="section-title">Other branches near you</div>
          <label className="search" style={{ marginBottom: 10 }}>
            <Search size={18} />
            <input placeholder="Search branch (88 branches)" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="list">
            {list.map((o) => (
              <button key={o.branch.id} className="row" onClick={() => push({ name: 'slot', serviceId, branchId: o.branch.id, rescheduleId })}>
                <span className="row__txt">
                  <b>{o.branch.name}</b>
                  <span>{o.branch.address}</span>
                  <span className="branch-row__meta">
                    <BusyChip branch={o.branch} />
                    {o.next && <em><Clock size={11} style={{ verticalAlign: -1 }} /> {whenLabel(o.next.dateKey, o.next.slot.time)}</em>}
                  </span>
                </span>
                <span className="km">{o.distance.toFixed(1)} km</span>
                <ChevronRight size={18} className="chev" />
              </button>
            ))}
            {!list.length && <p className="empty">No branches match “{q}”.</p>}
          </div>
        </div>
      </div>
      <ReviewSheet draft={draft} onClose={() => setDraft(null)} rescheduleId={rescheduleId} />
    </div>
  )
}
