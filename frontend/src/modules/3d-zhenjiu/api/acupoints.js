const DEFAULT_BASE = import.meta.env.VITE_API_BASE_URL || '/api/acupoints'

function resolveBase(override) {
  if (override && String(override).trim()) {
    return String(override).replace(/\/$/, '')
  }
  return DEFAULT_BASE.replace(/\/$/, '')
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || '请求失败')
  }

  return data
}

export function fetchAcupoints(baseOverride) {
  return request(resolveBase(baseOverride))
}

export function createAcupoint(payload, baseOverride) {
  return request(resolveBase(baseOverride), {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAcupoint(id, payload, baseOverride) {
  return request(`${resolveBase(baseOverride)}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAcupoint(id, baseOverride) {
  return request(`${resolveBase(baseOverride)}/${id}`, {
    method: 'DELETE',
  })
}
