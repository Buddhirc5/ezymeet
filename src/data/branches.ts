export interface Branch {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  /** 0 (quiet) .. 1 (very busy) — drives slot availability and waiting time */
  load: number
  phone: string
}

// Demo branch network (subset of the 88 branches) with approximate locations.
export const BRANCHES: Branch[] = [
  { id: 'nugegoda', name: 'Nugegoda', address: 'No. 165, High Level Road, Nugegoda', lat: 6.8721, lng: 79.889, load: 0.9, phone: '011 2 852 852' },
  { id: 'maharagama', name: 'Maharagama', address: 'No. 236, High Level Road, Maharagama', lat: 6.848, lng: 79.9265, load: 0.2, phone: '011 2 850 260' },
  { id: 'kottawa', name: 'Kottawa', address: 'No. 12, Horana Road, Kottawa', lat: 6.8412, lng: 79.965, load: 0.35, phone: '011 2 782 400' },
  { id: 'kohuwala', name: 'Kohuwala', address: 'No. 48, Sunethradevi Road, Kohuwala', lat: 6.8667, lng: 79.8833, load: 0.55, phone: '011 2 821 140' },
  { id: 'wellawatte', name: 'Wellawatte', address: 'No. 340, Galle Road, Wellawatte', lat: 6.8747, lng: 79.8606, load: 0.75, phone: '011 2 360 360' },
  { id: 'bambalapitiya', name: 'Bambalapitiya', address: 'No. 450, Galle Road, Colombo 03', lat: 6.8887, lng: 79.8565, load: 0.7, phone: '011 2 565 565' },
  { id: 'borella', name: 'Borella', address: 'No. 82, D.S. Senanayake Mw, Borella', lat: 6.9147, lng: 79.877, load: 0.6, phone: '011 2 694 694' },
  { id: 'rajagiriya', name: 'Rajagiriya', address: 'No. 512, Kotte Road, Rajagiriya', lat: 6.909, lng: 79.895, load: 0.45, phone: '011 2 887 887' },
  { id: 'battaramulla', name: 'Battaramulla', address: 'No. 101, Pannipitiya Road, Battaramulla', lat: 6.902, lng: 79.918, load: 0.4, phone: '011 2 868 868' },
  { id: 'dehiwala', name: 'Dehiwala', address: 'No. 155, Galle Road, Dehiwala', lat: 6.8511, lng: 79.8659, load: 0.5, phone: '011 2 733 733' },
  { id: 'mount-lavinia', name: 'Mount Lavinia', address: 'No. 18, Hotel Road, Mount Lavinia', lat: 6.839, lng: 79.865, load: 0.3, phone: '011 2 717 717' },
  { id: 'piliyandala', name: 'Piliyandala', address: 'No. 60, Horana Road, Piliyandala', lat: 6.8018, lng: 79.9227, load: 0.25, phone: '011 2 614 614' },
  { id: 'moratuwa', name: 'Moratuwa', address: 'No. 422, Galle Road, Moratuwa', lat: 6.773, lng: 79.8816, load: 0.4, phone: '011 2 647 647' },
  { id: 'homagama', name: 'Homagama', address: 'No. 77, High Level Road, Homagama', lat: 6.8441, lng: 80.0026, load: 0.3, phone: '011 2 893 893' },
  { id: 'malabe', name: 'Malabe', address: 'No. 905, Kaduwela Road, Malabe', lat: 6.9061, lng: 79.958, load: 0.35, phone: '011 2 744 744' },
  { id: 'kiribathgoda', name: 'Kiribathgoda', address: 'No. 120, Kandy Road, Kiribathgoda', lat: 6.978, lng: 79.928, load: 0.65, phone: '011 2 911 911' },
  { id: 'wattala', name: 'Wattala', address: 'No. 230, Negombo Road, Wattala', lat: 6.989, lng: 79.892, load: 0.5, phone: '011 2 939 939' },
  { id: 'negombo', name: 'Negombo', address: 'No. 45, Main Street, Negombo', lat: 7.2083, lng: 79.8358, load: 0.45, phone: '031 2 222 222' },
  { id: 'panadura', name: 'Panadura', address: 'No. 380, Galle Road, Panadura', lat: 6.713, lng: 79.904, load: 0.35, phone: '038 2 233 233' },
  { id: 'kandy', name: 'Kandy', address: 'No. 25, Dalada Veediya, Kandy', lat: 7.2936, lng: 80.6386, load: 0.6, phone: '081 2 204 204' },
  { id: 'kurunegala', name: 'Kurunegala', address: 'No. 61, Colombo Road, Kurunegala', lat: 7.4867, lng: 80.3647, load: 0.4, phone: '037 2 222 333' },
  { id: 'galle', name: 'Galle', address: 'No. 14, Wakwella Road, Galle', lat: 6.0535, lng: 80.221, load: 0.4, phone: '091 2 246 246' },
]

/** Fallback location when the device location is unavailable (Nugegoda). */
export const DEFAULT_LOCATION = { lat: 6.8649, lng: 79.8997, label: 'Nugegoda' }

export const getBranch = (id: string) => BRANCHES.find((b) => b.id === id)

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const directionsUrl = (b: Branch) =>
  `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`
