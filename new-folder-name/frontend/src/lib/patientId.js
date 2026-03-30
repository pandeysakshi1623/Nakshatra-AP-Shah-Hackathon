/**
 * Patient ID generation — unique, human-readable, collision-resistant.
 * Format: RE-XXXX-YYYY  (RE = RecoverEase, XXXX = 4 random alphanum, YYYY = timestamp suffix)
 */
export function generatePatientId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars (0,O,1,I)
  const rand = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const ts = Date.now().toString(36).slice(-4).toUpperCase()
  return `RE-${rand}-${ts}`
}

export function formatPatientId(id) {
  return id?.toUpperCase().trim()
}
