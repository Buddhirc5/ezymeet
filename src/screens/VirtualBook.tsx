import { useState } from 'react'
import { CheckCircle2, Upload, Video } from 'lucide-react'
import { ScreenHeader } from '../components/ui'
import SlotPicker from '../components/SlotPicker'
import ReviewSheet, { type Draft } from '../components/ReviewSheet'
import { getTopic, KYC_DOCUMENTS } from '../data/services'
import { earliest, virtualSlots, whenLabel, type SlotRef } from '../data/slots'

export default function VirtualBook({ topicId, rescheduleId }: { topicId: string; rescheduleId?: string }) {
  const topic = getTopic(topicId)!
  const [value, setValue] = useState<SlotRef | null>(() => earliest(virtualSlots))
  const [files, setFiles] = useState<Record<string, { name: string; url: string }>>({})
  const [draft, setDraft] = useState<Draft | null>(null)
  const ready = value && value.slot.available
  const uploaded = Object.keys(files).length

  return (
    <div className="view">
      <ScreenHeader title={topic.id === 'video-kyc' ? 'Book Video KYC' : 'Book Video Call'} />
      <div className="view__scroll">
        <div className="pad" style={{ paddingBottom: 24 }}>
          <div className="selected-svc">
            <span className="tile" style={{ background: 'var(--navy)', color: '#fff' }}><topic.icon size={19} /></span>
            <div>
              <b>{topic.name}</b>
              <span><Video size={11} style={{ verticalAlign: -1 }} /> Secure video call · ~{topic.duration} min</span>
            </div>
          </div>

          <div className="section-title">Select date & time</div>
          <SlotPicker slotsFor={virtualSlots} value={value} onChange={setValue} />

          {topic.needsDocs && (
            <>
              <div className="section-title">Upload documents ({uploaded}/{KYC_DOCUMENTS.length})</div>
              <p className="hint" style={{ marginTop: -4, marginBottom: 10 }}>Upload now to save time on the call, or share them during the call.</p>
              <div className="uploads">
                {KYC_DOCUMENTS.map((d) => {
                  const f = files[d.id]
                  return (
                    <label key={d.id} className={`upload ${f ? 'ok' : ''}`}>
                      {f && <img className="preview" src={f.url} alt="" />}
                      {f ? <CheckCircle2 size={22} /> : <Upload size={20} color="var(--icon)" />}
                      <span>{d.label}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        capture={d.id === 'selfie' ? 'user' : 'environment'}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setFiles((m) => ({ ...m, [d.id]: { name: file.name, url: URL.createObjectURL(file) } }))
                        }}
                      />
                    </label>
                  )
                })}
              </div>
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
          {ready ? `Book · ${whenLabel(value.dateKey, value.slot.time)}` : 'Select a time slot'}
        </button>
      </div>
      <ReviewSheet draft={draft} onClose={() => setDraft(null)} rescheduleId={rescheduleId} />
    </div>
  )
}
