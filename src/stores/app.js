import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const apiKey = ref(localStorage.getItem('pa_api_key') || '')
  const provider = ref(localStorage.getItem('pa_provider') || 'deepseek')
  const library = ref([])
  const notification = ref(null)
  const isPro = ref(false)
  const freeUsage = ref(parseInt(localStorage.getItem('pa_free_usage') || '0'))

  // Session ID for free tier tracking
  function generateSessionId() {
    const id = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('pa_session_id', id)
    return id
  }
  const sessionId = ref(localStorage.getItem('pa_session_id') || generateSessionId())

  function incrementFreeUsage() {
    freeUsage.value++
    localStorage.setItem('pa_free_usage', freeUsage.value)
  }

  function setApiKey(key) {
    apiKey.value = key
    localStorage.setItem('pa_api_key', key)
  }

  function setProvider(p) {
    provider.value = p
    localStorage.setItem('pa_provider', p)
  }

  function notify(msg, type = 'success') {
    notification.value = { msg, type }
    setTimeout(() => notification.value = null, 3000)
  }

  async function fetchLibrary() {
    const res = await fetch('https://backend-sparkling-snowflake-9703.fly.dev/library')
    library.value = await res.json()
  }

  async function saveToLibrary(data) {
    const res = await fetch('https://backend-sparkling-snowflake-9703.fly.dev/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) {
      await fetchLibrary()
      notify('Saved to your library ✦')
    }
  }

  async function toggleFavorite(id, current) {
    await fetch(`https://backend-sparkling-snowflake-9703.fly.dev/library/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_favorite: !current })
    })
    await fetchLibrary()
  }

  async function deleteFromLibrary(id) {
    await fetch(`https://backend-sparkling-snowflake-9703.fly.dev/library/${id}`, { method: 'DELETE' })
    await fetchLibrary()
    notify('Removed from library', 'info')
  }

  async function checkProStatus() {
    try {
      const res = await fetch(`https://backend-sparkling-snowflake-9703.fly.dev/subscription-status?session_id=${sessionId.value}`)
      const data = await res.json()
      isPro.value = data.is_pro
    } catch {
      isPro.value = false
    }
  }

  async function createCheckout() {
    try {
      const res = await fetch('https://backend-sparkling-snowflake-9703.fly.dev/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId.value })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      notify('Something went wrong. Please try again.', 'error')
    }
  }

  return {
    apiKey, provider, library, notification, isPro, freeUsage, sessionId,
    setApiKey, setProvider, notify, fetchLibrary, saveToLibrary,
    toggleFavorite, deleteFromLibrary, incrementFreeUsage,
    checkProStatus, createCheckout
  }
})