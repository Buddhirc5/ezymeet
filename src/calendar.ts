import type { Appointment } from './store'
import { getBranch } from './data/branches'
import { getService } from './data/services'

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/** Download an .ics file — on iPhone Safari this opens "Add to Calendar". */
export function addToCalendar(a: Appointment) {
  const start = new Date(`${a.dateKey}T${a.time}:00`)
  const mins = getService(a.serviceId)?.tat ?? 30
  const end = new Date(start.getTime() + Math.max(mins, 30) * 60000)
  const branch = a.branchId ? getBranch(a.branchId) : undefined
  const title = a.kind === 'branch' ? `Pan Asia Bank – ${getService(a.serviceId)?.name}` : `Pan Asia EZY Meet – ${getService(a.serviceId)?.name} (video call)`
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pan Asia Bank//EZY Meet//EN',
    'BEGIN:VEVENT',
    `UID:${a.id}@ezymeet`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${branch ? `${branch.name} Branch\\, ${branch.address.replace(/,/g, '\\,')}` : 'Pan Asia EZY app – video call'}`,
    `DESCRIPTION:Reference ${a.ref}. Show your EZY Meet QR code for priority service.`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:EZY Meet appointment in 30 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `ezy-meet-${a.ref}.ics`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
