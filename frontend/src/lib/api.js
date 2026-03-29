/**
 * Thin API client — all backend calls go through here.
 * Handles backend-offline gracefully with a clear error message.
 */

const BASE = '/api'

async function request(method, path, body) {
  const token = localStorage.getItem('re-token')

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (networkErr) {
    // fetch() itself failed — backend is not reachable at all
    throw new Error('BACKEND_OFFLINE')
  }

  // Guard: if the response is not JSON (e.g. Vite proxy returned an HTML error page)
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error('BACKEND_OFFLINE')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  signup:        (payload)    => request('POST', '/auth/signup', payload),
  login:         (payload)    => request('POST', '/auth/login',  payload),
  me:            ()           => request('GET',  '/auth/me'),
  savePatient:   (payload)    => request('POST', '/patients', payload),
  searchPatient: (patientId)  => request('GET',  `/patients/search?patientId=${encodeURIComponent(patientId)}`),
  getPatient:    (id)         => request('GET',  `/patients/${id}`),
  logSymptom:    (payload)    => request('POST', '/symptoms', payload),
  getSymptoms:   (patientId)  => request('GET',  `/symptoms/${patientId}`),
}

export const isOfflineError = (err) => err?.message === 'BACKEND_OFFLINE'
