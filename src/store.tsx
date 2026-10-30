import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_LOCATION } from './data/branches'

export type Route =
  | { name: 'login' }
  | { name: 'home' }
  | { name: 'meet'; tab?: 'branch' | 'virtual' }
  | { name: 'branch'; serviceId: string; rescheduleId?: string }
  | { name: 'slot'; serviceId: string; branchId: string; rescheduleId?: string }
  | { name: 'vbook'; topicId: string; rescheduleId?: string }
  | { name: 'done'; apptId: string; rescheduled?: boolean }
  | { name: 'appointments' }
  | { name: 'call'; topicId: string; apptId?: string }

export interface Appointment {
  id: string
  ref: string
  kind: 'branch' | 'virtual'
  serviceId: string // branch service id or virtual topic id
  branchId?: string
  dateKey: string
  time: string
  wait?: number
  status: 'upcoming' | 'cancelled'
  docs?: string[]
  createdAt: number
}

export interface UserLocation {
  lat: number
  lng: number
  label: string
  source: 'device' | 'default'
}

interface AppState {
  route: Route
  canGoBack: boolean
  push: (r: Route) => void
  back: () => void
  replace: (r: Route) => void
  reset: (r: Route) => void
  appointments: Appointment[]
  book: (a: Omit<Appointment, 'id' | 'ref' | 'status' | 'createdAt'>, rescheduleId?: string) => Appointment
  cancel: (id: string) => void
  location: UserLocation
  locate: () => void
  toast: (msg: string) => void
  toastMsg: string | null
}

const Ctx = createContext<AppState | null>(null)
const STORAGE_KEY = 'ezymeet.appointments.v1'

function load(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Appointment[]) : []
  } catch {
    return []
  }
}

const makeRef = () => `EZM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

export function AppProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ name: 'login' }])
  const [appointments, setAppointments] = useState<Appointment[]>(load)
  const [location, setLocation] = useState<UserLocation>({ ...DEFAULT_LOCATION, source: 'default' })
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments))
    } catch {
      /* storage unavailable — keep in memory */
    }
  }, [appointments])

  const push = useCallback((r: Route) => setStack((s) => [...s, r]), [])
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), [])
  const replace = useCallback((r: Route) => setStack((s) => [...s.slice(0, -1), r]), [])
  const reset = useCallback((r: Route) => setStack(r.name === 'home' ? [r] : [{ name: 'home' }, r]), [])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    window.setTimeout(() => setToastMsg((m) => (m === msg ? null : m)), 2400)
  }, [])

  const book: AppState['book'] = useCallback((a, rescheduleId) => {
    const existing = rescheduleId ? appointments.find((x) => x.id === rescheduleId) : undefined
    const appt: Appointment = {
      ...a,
      id: existing?.id ?? crypto.randomUUID(),
      ref: existing?.ref ?? makeRef(),
      status: 'upcoming',
      createdAt: Date.now(),
    }
    setAppointments((list) => [appt, ...list.filter((x) => x.id !== appt.id)])
    return appt
  }, [appointments])

  const cancel = useCallback((id: string) => {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a)))
  }, [])

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Current location', source: 'device' }),
      () => setLocation((l) => l),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
    )
  }, [])

  const value = useMemo<AppState>(
    () => ({
      route: stack[stack.length - 1],
      canGoBack: stack.length > 1,
      push,
      back,
      replace,
      reset,
      appointments,
      book,
      cancel,
      location,
      locate,
      toast,
      toastMsg,
    }),
    [stack, push, back, replace, reset, appointments, book, cancel, location, locate, toast, toastMsg],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside AppProvider')
  return v
}

/** Upcoming (not cancelled, not in the past) appointments, soonest first. */
export function upcomingAppointments(list: Appointment[], now = new Date()) {
  return list
    .filter((a) => a.status === 'upcoming' && new Date(`${a.dateKey}T${a.time}`) >= new Date(now.getTime() - 60 * 60000))
    .sort((a, b) => `${a.dateKey}${a.time}`.localeCompare(`${b.dateKey}${b.time}`))
}
