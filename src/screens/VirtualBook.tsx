import { useState } from 'react'
import { ScreenHeader } from '../components/ui'
import SlotPicker from '../components/SlotPicker'
import ReviewSheet, { type Draft } from '../components/ReviewSheet'
import { getService, KYC_DOCUMENTS } from '../data/services'
import { earliest, virtualSlots, type SlotRef } from '../data/slots'

export default function VirtualBook({ topicId, rescheduleId }: { topicId: string; rescheduleId?: string }) {
  const topic = getService(topicId)!
  const [value, setValue] = useState<SlotRef | null>(() => earliest(virtualSlots))
  const [files, setFiles] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState<Draft | null>(null)
  const ready = value && value.slot.available

  return (
    <div className="view">
      <ScreenHeader title={topic.name} />
      <div className="view__scroll">
        <div className="body">
          <p className="context"><b>Video call</b> · ~{topic.tat} min with a Pan Asia advisor</p>
          <SlotPicker slotsFor={virtualSlots} value={value} onChange={setValue} />

          {topic.needsDocs && (
            <>
              <p className="group-label" style={{ marginTop: 30 }}>Documents (optional — saves time on the call)</p>
              {KYC_DOCUMENTS.map((d) => (
                <label key={d.id} className="nav-row upload-row">
                  <span className="nav-row__txt">
                    <b>{d.label}</b>
                    {files[d.id] && <span>{files[d.id]}</span>}
                  </span>
                  <span className={`state ${files[d.id] ? 'ok' : ''}`}>{files[d.id] ? 'Added' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    capture={d.id === 'selfie' ? 'user' : 'environment'}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setFiles((m) => ({ ...m, [d.id]: file.name }))
                    }}
                  />
                </label>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="view__footer">
        <button
          className="btn"
          disabled={!ready}
          onClick={() =>
            value &&
            setDraft({
              kind: 'virtual',
              serviceId: topicId,
              dateKey: value.dateKey,
              slot: value.slot,
              docs: topic.needsDocs ? KYC_DOCUMENTS.filter((d) => files[d.id]).map((d) => d.label) : undefined,
            })
          }
        >
          Next
        </button>
      </div>
      <ReviewSheet draft={draft} onClose={() => setDraft(null)} rescheduleId={rescheduleId} />
    </div>
  )
}
