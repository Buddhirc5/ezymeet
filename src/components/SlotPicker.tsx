import { dayLabel, fmtTime, fromDateKey, upcomingDates, type Slot, type SlotRef } from '../data/slots'

interface Props {
  slotsFor: (dateKey: string) => Slot[]
  value: SlotRef | null
  onChange: (v: SlotRef | null) => void
  showWait?: boolean
}

const PERIODS: [string, number, number][] = [
  ['Morning', 0, 12 * 60],
  ['Afternoon', 12 * 60, 17 * 60],
  ['Evening', 17 * 60, 24 * 60],
]

export default function SlotPicker({ slotsFor, value, onChange, showWait }: Props) {
  const dates = upcomingDates()
  const dateKey = value?.dateKey ?? dates.find((d) => slotsFor(d).some((s) => s.available)) ?? dates[0]
  const slots = slotsFor(dateKey)

  const pickDate = (d: string) => {
    const first = slotsFor(d).find((s) => s.available)
    onChange(first ? { dateKey: d, slot: first } : { dateKey: d, slot: { time: '', minutes: -1, available: false, wait: 0 } })
  }

  return (
    <>
      <div className="dates">
        {dates.map((d) => {
          const day = slotsFor(d)
          const closed = day.length === 0
          return (
            <button key={d} className={d === dateKey ? 'on' : ''} disabled={closed} onClick={() => pickDate(d)}>
              <small>{dayLabel(d)}</small>
              <b>{fromDateKey(d).getDate()}</b>
              <small>{closed ? 'Closed' : fromDateKey(d).toLocaleDateString('en-GB', { month: 'short' })}</small>
            </button>
          )
        })}
      </div>

      {slots.filter((s) => s.available).length === 0 ? (
        <p className="empty">No free slots on this day. Try another date.</p>
      ) : (
        PERIODS.map(([label, from, to]) => {
          const items = slots.filter((s) => s.minutes >= from && s.minutes < to)
          if (!items.length) return null
          return (
            <div key={label}>
              <div className="section-title">{label}</div>
              <div className="slots">
                {items.map((s) => (
                  <button
                    key={s.time}
                    disabled={!s.available}
                    className={value?.dateKey === dateKey && value.slot.time === s.time ? 'on' : ''}
                    onClick={() => onChange({ dateKey, slot: s })}
                  >
                    <b>{fmtTime(s.time)}</b>
                    <small>{s.available ? (showWait ? `~${s.wait} min wait` : 'Available') : 'Booked'}</small>
                  </button>
                ))}
              </div>
            </div>
          )
        })
      )}
    </>
  )
}
