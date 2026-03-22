<template>
  <div style="width: calc(100vw - 220px - 6rem);">
    <div class="page-header">
      <h1>Settings</h1>
      <p>Configure your API keys and preferences.</p>
    </div>

    <div style="max-width: 540px; display: flex; flex-direction: column; gap: 1.25rem;">

      <!-- Provider -->
      <div class="card">
        <h3 class="font-display" style="font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 1.25rem;">AI Provider</h3>
        <div class="grid-2" style="gap: 0.75rem;">
          <button
            class="btn w-full"
            style="justify-content: center;"
            :class="store.provider === 'deepseek' ? 'btn-primary' : 'btn-ghost'"
            @click="store.setProvider('deepseek')"
          >
            ◈ DeepSeek
          </button>
          <button
            class="btn w-full"
            style="justify-content: center;"
            :class="store.provider === 'claude' ? 'btn-primary' : 'btn-ghost'"
            @click="store.setProvider('claude')"
          >
            ◆ Claude
          </button>
          <button
            class="btn w-full"
            style="justify-content: center;"
            :class="store.provider === 'openai' ? 'btn-primary' : 'btn-ghost'"
            @click="store.setProvider('openai')"
          >
            ⬡ OpenAI
          </button>
          <button
            class="btn w-full"
            style="justify-content: center;"
            :class="store.provider === 'gemini' ? 'btn-primary' : 'btn-ghost'"
            @click="store.setProvider('gemini')"
          >
            ✦ Gemini
          </button>
        </div>
        <p class="text-dim text-sm" style="margin-top: 0.75rem;">
          <span v-if="store.provider === 'deepseek'">DeepSeek — great performance at very low cost.</span>
          <span v-else-if="store.provider === 'claude'">Claude — Anthropic's models, excellent for nuanced prompts.</span>
          <span v-else-if="store.provider === 'openai'">GPT-4o — OpenAI's flagship, widely recognized.</span>
          <span v-else-if="store.provider === 'gemini'">Gemini 1.5 Flash — Google's fast, capable model.</span>
        </p>
      </div>

      <!-- API Key -->
      <div class="card">
        <h3 class="font-display" style="font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 1.25rem;">
          {{ { deepseek: 'DeepSeek', claude: 'Anthropic', openai: 'OpenAI', gemini: 'Google' }[store.provider] }} API Key
        </h3>
        <div class="form-group">
          <label class="form-label">Your API Key (BYOK)</label>
          <div class="flex gap-1">
            <input
              v-model="keyInput"
              :type="showKey ? 'text' : 'password'"
              class="form-input"
              :placeholder="store.provider === 'deepseek' ? 'sk-...' : 'sk-ant-...'"
              style="font-family: var(--font-mono); font-size: 0.82rem;"
            />
            <button class="btn btn-ghost" @click="showKey = !showKey" style="flex-shrink: 0;">
              {{ showKey ? '◉ Hide' : '○ Show' }}
            </button>
          </div>
        </div>
        <div class="flex gap-1">
          <button class="btn btn-primary" @click="save">Save Key</button>
          <button v-if="store.apiKey" class="btn btn-danger" @click="clear">Clear</button>
        </div>
        <p class="text-mute text-xs" style="margin-top: 0.75rem;">
          Your key is stored only in your browser's localStorage. It is never sent to our servers.
        </p>
      </div>

      <!-- Status -->
      <div class="card" :class="store.apiKey ? 'card-gold' : ''">
        <div class="flex items-center gap-2">
          <span style="font-size: 1.5rem;">{{ store.apiKey ? '✦' : '○' }}</span>
          <div>
            <div class="font-display text-sm" style="color: var(--text);">
              {{ store.apiKey ? 'Ready to transmute' : 'API key required' }}
            </div>
            <div class="text-dim text-xs">
              {{ store.apiKey
                ? `${store.provider} key configured · ${masked}`
                : 'Add an API key above to start generating prompts' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Links -->
      <div class="card">
        <h3 class="font-display" style="font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 1rem;">Get an API Key</h3>
        <div class="flex flex-col gap-1">
          <a href="https://platform.deepseek.com" target="_blank" class="btn btn-ghost" style="justify-content: flex-start;">
            ↗ DeepSeek Platform
          </a>
          <a href="https://console.anthropic.com" target="_blank" class="btn btn-ghost" style="justify-content: flex-start;">
            ↗ Anthropic Console
          </a>
          <a href="https://platform.openai.com" target="_blank" class="btn btn-ghost" style="justify-content: flex-start;">
            ↗ OpenAI Platform
          </a>
          <a href="https://aistudio.google.com" target="_blank" class="btn btn-ghost" style="justify-content: flex-start;">
            ↗ Google AI Studio
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const keyInput = ref(store.apiKey)
const showKey = ref(false)

const masked = computed(() => {
  const k = store.apiKey
  if (!k) return ''
  return k.slice(0, 6) + '···' + k.slice(-4)
})

function save() {
  store.setApiKey(keyInput.value.trim())
  store.notify('API key saved ✦')
}

function clear() {
  store.setApiKey('')
  keyInput.value = ''
  store.notify('API key cleared', 'info')
}
</script>