import { BRANCHES, distanceKm, type Branch } from './branches'

export interface Slot {
  time: string // "HH:MM"
  minutes: number // minutes from midnight
  available: boolean
  /** Expected waiting time at the branch for this slot, in minutes */
  wait: number
}

export interface SlotRef {
  dateKey: string
  slot: Slot
}

const DAYS_AHEAD = 7

// ---------- date helpers ----------

export const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const fromDateKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function upcomingDates(now = new Date()) {
  return Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    return toDateKey(d)
  })
}

export function dayLabel(key: string, now = new Date()) {
  const today = toDateKey(now)
  const tomorrow = toDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
  if (key === today) return 'Today'
  if (key === tomorrow) return 'Tomorrow'
  return fromDateKey(key).toLocaleDateString('en-GB', { weekday: 'short' })
}

export const shortDate = (key: string) =>
  fromDateKey(key).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

export const longDate = (key: string) =>
  fromDateKey(key).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function fmtTime(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

export const whenLabel = (dateKey: string, time: string) => {
  const d = dayLabel(dateKey)
  return `${d === 'Today' || d === 'Tomorrow' ? d : `${d}, ${shortDate(dateKey)}`}, ${fmtTime(time)}`
}

// ---------- deterministic pseudo-random ----------

export function rand(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return ((h ^= h >>> 16) >>> 0) / 4294967296
}

// ---------- slot generation ----------

function hoursFor(dateKey: string, weekday: [number, number], saturday: [number, number] | null) {
  const dow = fromDateKey(dateKey).getDay()
  if (dow === 0) return null // Sunday closed
  if (dow === 6) return saturday
  return weekday
}

function buildSlots(
  seed: string,
  load: number,
  dateKey: string,
  range: [number, number] | null,
  step: number,
  now: Date,
): Slot[] {
  if (!range) return []
  const isToday = dateKey === toDateKey(now)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const out: Slot[] = []
  for (let m = range[0]; m < range[1]; m += step) {
    const time = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    const r = rand(`${seed}|${dateKey}|${time}`)
    // Busier branches have fewer free slots, more so earlier in the week
    const available = r > load * 0.85 && !(isToday && m < nowMin + 30)
    const wait = Math.max(2, Math.round(3 + load * 22 + rand(`${seed}w${dateKey}${time}`) * 6))
    out.push({ time, minutes: m, available, wait })
  }
  return out
}

/** Slots a branch has blocked in the branch portal (shared browser storage on this device). */
function blockedSlots(): Record<string, true> {
  try {
    return JSON.parse(localStorage.getItem('ezymeet.portal.v1') ?? '{}').blocked ?? {}
  } catch {
    return {}
  }
}

export function branchSlots(branch: Branch, dateKey: string, now = new Date()) {
  // Mon–Fri 9:00–15:30, Sat 9:00–12:30, Sun closed
  const blocked = blockedSlots()
  return buildSlots(branch.id, branch.load, dateKey, hoursFor(dateKey, [9 * 60, 15 * 60 + 30], [9 * 60, 12 * 60 + 30]), 30, now).map((sl) => (blocked[`${branch.id}|${dateKey}|${sl.time}`] ? { ...sl, available: false } : sl))
}

export function virtualSlots(dateKey: string, now = new Date()) {
  // Virtual advisory desk: Mon–Sat 8:00–20:00
  return buildSlots('virtual', 0.45, dateKey, hoursFor(dateKey, [8 * 60, 20 * 60], [8 * 60, 20 * 60]), 30, now)
}

export function isBranchOpenOn(dateKey: string) {
  return fromDateKey(dateKey).getDay() !== 0
}

export function earliest(slotsFor: (dateKey: string) => Slot[], now = new Date()): SlotRef | null {
  for (const dateKey of upcomingDates(now)) {
    const slot = slotsFor(dateKey).find((s) => s.available)
    if (slot) return { dateKey, slot }
  }
  return null
}

/** Advisors available for an instant video call. Always on in the prototype so the demo works at any hour. */
export function liveAdvisors() {
  return { online: 3, wait: 2 }
}

// ---------- smart recommendation ----------

export interface BranchOption {
  branch: Branch
  distance: number
  next: SlotRef | null
  score: number
}

export type Busyness = 'Low' | 'Moderate' | 'Busy'
export const busyness = (b: Branch): Busyness => (b.load < 0.4 ? 'Low' : b.load < 0.7 ? 'Moderate' : 'Busy')

/**
 * Rank branches near the customer. Score blends how soon the earliest slot is,
 * the distance and the expected waiting time — lower is better.
 */
export function rankBranches(loc: { lat: number; lng: number }, now = new Date()) {
  const options: BranchOption[] = BRANCHES.map((branch) => {
    const distance = distanceKm(loc, branch)
    const next = earliest((d) => branchSlots(branch, d, now), now)
    let score = Infinity
    if (next) {
      const days = Math.round((+fromDateKey(next.dateKey) - +fromDateKey(toDateKey(now))) / 86400000)
      const hoursUntil = days * 24 + (next.slot.minutes - (now.getHours() * 60 + now.getMinutes())) / 60
      score = Math.max(0, hoursUntil) * 1.2 + distance * 2.5 + next.slot.wait * 0.6
    }
    return { branch, distance, next, score }
  })
  const byDistance = [...options].sort((a, b) => a.distance - b.distance)
  const nearby = byDistance.filter((o) => o.distance <= 15)
  const pool = nearby.length >= 3 ? nearby : byDistance.slice(0, 5)
  const recommended = [...pool].sort((a, b) => a.score - b.score)[0]
  return { recommended, nearest: byDistance[0], byDistance }
}
