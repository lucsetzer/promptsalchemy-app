<template>
  <div class="app-shell">
    <!-- Skip to main content for keyboard/screen reader users -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <aside class="sidebar" aria-label="Main navigation">
      <div class="sidebar-logo">
        <div class="wordmark" aria-label="Prompts Alchemy">
          Prompts Alchemy
        </div>
        <div class="tagline">Transform ideas into perfect prompts</div>
      </div>

      <nav aria-label="Primary">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }" aria-label="Templates" :aria-current="$route.path === '/' ? 'page' : undefined">
          <span class="nav-icon" aria-hidden="true">✦</span> Templates
        </router-link>
        <router-link to="/library" class="nav-link" :class="{ active: $route.path === '/library' }" aria-label="My Library" :aria-current="$route.path === '/library' ? 'page' : undefined">
          <span class="nav-icon" aria-hidden="true">◈</span> My Library
        </router-link>
        <router-link to="/settings" class="nav-link" :class="{ active: $route.path === '/settings' }" aria-label="Settings" :aria-current="$route.path === '/settings' ? 'page' : undefined">
          <span class="nav-icon" aria-hidden="true">⚙</span> Settings
        </router-link>
      </nav>

      <div class="sidebar-footer" aria-label="API status">
      <div style="margin-bottom: 0.4rem; color: var(--text-dim);">
        <i class="fa-solid fa-circle-dot" aria-hidden="true"></i>
          {{ { deepseek: 'DeepSeek', claude: 'Claude', openai: 'OpenAI', gemini: 'Gemini' }[store.provider] || 'DeepSeek' }}
        </div>
        <div v-if="store.isPro" style="color: var(--gold);" role="status">
          <i class="fa-solid fa-star" aria-hidden="true"></i> Alchemist
        </div>
        <div v-else-if="store.apiKey" style="color: var(--gold-dim);" role="status">
          Key configured ✓
        </div>
        <div v-else style="color: var(--ember);" role="alert">
          Apprentice — 3 free generations
        </div>
      </div>
    </aside>

    <main id="main-content" class="main-content" tabindex="-1">
      <router-view />
    </main>

    <transition name="notif">
      <div
        v-if="store.notification"
        class="notification"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ store.notification.msg }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  // Handle Stripe success redirect
  if (route.query.upgrade === 'success') {
    await store.checkProStatus()
    store.notify('Welcome to Alchemist! ✦ Unlimited access unlocked.')
    // Clean up URL
    router.replace({ query: {} })
  } else {
    // Check pro status on every load
    await store.checkProStatus()
  }
})
</script>

<style>
.notif-enter-active, .notif-leave-active { transition: all 0.3s ease; }
.notif-enter-from, .notif-leave-to { opacity: 0; transform: translateY(10px); }
</style>

<style>
.notif-enter-active, .notif-leave-active { transition: all 0.3s ease; }
.notif-enter-from, .notif-leave-to { opacity: 0; transform: translateY(10px); }
</style>