import { BRANCHES, getBranch, type Branch } from '../data/branches'
import { servicesFor } from '../data/services'
import { rand, toDateKey, upcomingDates } from '../data/slots'
import type { Appointment } from '../store'

export type Status = 'booked' | 'arrived' | 'serving' | 'served' | 'no-show' | 'cancelled'

export interface Booking {
  id: string
  ref: string
  name: string
  mobile: string
  serviceId: string
  kind: 'branch' | 'virtual'
  branchId?: string
  dateKey: string
  time: string
  status: Status
  source: 'app' | 'demo'
  docs?: string[]
}

const NAMES = [
  'Nimesha Perera', 'Kasun Fernando', 'Dilani Jayasinghe', 'Ruwan Silva', 'Tharindu Wickramasinghe', 'Ayesha Rahman',
  'Pradeep Kumar', 'Sachini Gunawardena', 'Mohamed Rizwan', 'Chamari Herath', 'Lahiru Bandara', 'Fathima Nazeer',
  'Suresh Rajendran', 'Ishara Dissanayake', 'Nadeesha Karunaratne', 'Gayan Rathnayake', 'Hasini Abeysekara', 'Dinesh Peiris',
]

const APP_KEY = 'ezymeet.appointments.v2'
const PORTAL_KEY = 'ezymeet.portal.v1'

interface PortalState {
  statuses: Record<string, Status>
  blocked: Record<string, true>
  counters: Record<string, number>
}

export function loadPortal(): PortalState {
  try {
    const raw = localStorage.getItem(PORTAL_KEY)
    if (raw) return { statuses: {}, blocked: {}, counters: {}, ...JSON.parse(raw) }
  } catch {
    /* storage unavailable */
  }
  return { statuses: {}, blocked: {}, counters: {} }
}

export function savePortal(s: PortalState) {
  try {
    localStorage.setItem(PORTAL_KEY, JSON.stringify(s))
  } catch {
    /* storage unavailable */
  }
}

export const slotKey = (branchId: string, dateKey: string, time: string) => `${branchId}|${dateKey}|${time}`

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))

/** Branch opening slots for a day (Mon–Fri 9:00–15:30, Sat 9:00–12:30, Sun closed). */
export function daySlots(dateKey: string) {
  const dow = new Date(`${dateKey}T00:00`).getDay()
  if (dow === 0) return []
  const end = dow === 6 ? 12 * 60 + 30 : 15 * 60 + 30
  const out: string[] = []
  for (let m = 9 * 60; m < end; m += 30) out.push(hhmm(m))
  return out
}

/** Default status for a demo booking based on the time of day. */
function defaultStatus(seed: string, dateKey: string, time: string, now: Date): Status {
  const today = toDateKey(now)
  if (dateKey > today) return 'booked'
  if (dateKey < today) return rand(`${seed}ns`) < 0.08 ? 'no-show' : 'served'
  const diff = now.getHours() * 60 + now.getMinutes() - minutes(time)
  if (diff > 40) return rand(`${seed}ns`) < 0.1 ? 'no-show' : 'served'
  if (diff > 15) return 'serving'
  if (diff > -20) return 'arrived'
  return 'booked'
}

function demoBranchBookings(branch: Branch, dateKey: string, now: Date): Booking[] {
  const services = servicesFor('branch')
  const out: Booking[] = []
  for (const time of daySlots(dateKey)) {
    // A slot the customer app shows as taken is full (3 bookings); open slots may already hold 0–2
    const full = rand(`${branch.id}|${dateKey}|${time}`) <= branch.load * 0.85
    const r = rand(`${branch.id}c${dateKey}${time}`)
    const count = full ? 3 : r < 0.3 ? 0 : r < 0.75 ? 1 : 2
    for (let i = 0; i < count; i++) {
      const seed = `${branch.id}|${dateKey}|${time}|${i}`
      const svc = services.at(Math.floor(rand(`${seed}s`) * services.length))!
      out.push({
        id: `demo-${seed}`,
        ref: `EZM-${Math.floor(rand(`${seed}r`) * 0xffffff).toString(36).toUpperCase().padStart(5, '0').slice(0, 6)}`,
        name: NAMES.at(Math.floor(rand(`${seed}n`) * NAMES.length))!,
        mobile: `07${Math.floor(rand(`${seed}m`) * 9)} ••• ${String(Math.floor(rand(`${seed}k`) * 9000) + 1000)}`,
        serviceId: svc.id,
        kind: 'branch',
        branchId: branch.id,
        dateKey,
        time,
        status: defaultStatus(seed, dateKey, time, now),
        source: 'demo',
      })
    }
  }
  return out
}

function demoVideoBookings(dateKey: string, now: Date): Booking[] {
  const services = servicesFor('video')
  const out: Booking[] = []
  const dow = new Date(`${dateKey}T00:00`).getDay()
  if (dow === 0) return out
  for (let m = 8 * 60; m < 20 * 60; m += 30) {
    const time = hhmm(m)
    const seed = `video|${dateKey}|${time}`
    if (rand(seed) > 0.4) continue
    const svc = services.at(Math.floor(rand(`${seed}s`) * services.length))!
    out.push({
      id: `demo-${seed}`,
      ref: `EZM-${Math.floor(rand(`${seed}r`) * 0xffffff).toString(36).toUpperCase().padStart(5, '0').slice(0, 6)}`,
      name: NAMES.at(Math.floor(rand(`${seed}n`) * NAMES.length))!,
      mobile: `07${Math.floor(rand(`${seed}m`) * 9)} ••• ${String(Math.floor(rand(`${seed}k`) * 9000) + 1000)}`,
      serviceId: svc.id,
      kind: 'virtual',
      dateKey,
      time,
      status: defaultStatus(seed, dateKey, time, now),
      source: 'demo',
      docs: svc.needsDocs ? ['National ID (Front)', 'National ID (Back)'] : undefined,
    })
  }
  return out
}

/** Bookings made in the customer app on this device (same origin, so the same storage). */
function appBookings(): Booking[] {
  try {
    const list = JSON.parse(localStorage.getItem(APP_KEY) ?? '[]') as Appointment[]
    return list.map((a) => ({
      id: a.id,
      ref: a.ref,
      name: 'Sandeepa',
      mobile: '077 ••• 4521',
      serviceId: a.serviceId,
      kind: a.kind,
      branchId: a.branchId,
      dateKey: a.dateKey,
      time: a.time,
      status: a.status === 'cancelled' ? 'cancelled' : 'booked',
      source: 'app' as const,
      docs: a.docs,
    }))
  } catch {
    return []
  }
}

export function bookingsFor(opts: { branchId?: string; kind: 'branch' | 'virtual'; dates: string[]; statuses: Record<string, Status> }, now = new Date()) {
  const branch = opts.branchId ? getBranch(opts.branchId) : undefined
  const demo = opts.dates.flatMap((d) => (opts.kind === 'branch' && branch ? demoBranchBookings(branch, d, now) : opts.kind === 'virtual' ? demoVideoBookings(d, now) : []))
  const real = appBookings().filter((b) => b.kind === opts.kind && opts.dates.includes(b.dateKey) && (opts.kind === 'virtual' || b.branchId === opts.branchId))
  return [...real, ...demo]
    .map((b) => ({ ...b, status: opts.statuses[b.id] ?? b.status }))
    .sort((a, b) => `${a.dateKey}${a.time}`.localeCompare(`${b.dateKey}${b.time}`))
}

export const weekDates = () => upcomingDates()
export { BRANCHES }
