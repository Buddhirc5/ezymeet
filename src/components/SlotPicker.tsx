import { dayLabel, fmtTime, fromDateKey, upcomingDates, type Slot, type SlotRef } from '../data/slots'

interface Props {
  slotsFor: (dateKey: string) => Slot[]
  value: SlotRef | null
  onChange: (v: SlotRef | null) => void
}

export default function SlotPicker({ slotsFor, value, onChange }: Props) {
  const dates = upcomingDates()
  const dateKey = value?.dateKey ?? dates.find((d) => slotsFor(d).some((s) => s.available)) ?? dates[0]
  const slots = slotsFor(dateKey)
  const free = slots.filter((s) => s.available)

  const pickDate = (d: string) => {
    const first = slotsFor(d).find((s) => s.available)
    onChange(first ? { dateKey: d, slot: first } : { dateKey: d, slot: { time: '', minutes: -1, available: false, wait: 0 } })
  }

  return (
    <>
      <div className="dates">
        {dates.map((d) => {
          const closed = slotsFor(d).length === 0
          return (
            <button key={d} className={d === dateKey ? 'on' : ''} disabled={closed} onClick={() => pickDate(d)}>
              <small>{dayLabel(d) === 'Today' ? 'Today' : fromDateKey(d).toLocaleDateString('en-GB', { weekday: 'short' })}</small>
              <b>{fromDateKey(d).getDate()}</b>
            </button>
          )
        })}
      </div>

      <p className="group-label" style={{ marginTop: 26 }}>Available times</p>
      {free.length === 0 ? (
        <p className="empty">No free times on this day.</p>
      ) : (
        <div className="slots">
          {free.map((s) => (
            <button
              key={s.time}
              className={value?.dateKey === dateKey && value.slot.time === s.time ? 'on' : ''}
              onClick={() => onChange({ dateKey, slot: s })}
            >
              {fmtTime(s.time)}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
