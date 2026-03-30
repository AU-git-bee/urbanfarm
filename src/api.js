export const getToken  = () => localStorage.getItem('uf_token')
export const setToken  = (t) => localStorage.setItem('uf_token', t)
export const clearToken = () => localStorage.removeItem('uf_token')

export async function api(path, options = {}) {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}
