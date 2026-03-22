<template>
  <div style="width: calc(100vw - 220px - 6rem);">
    <!-- Back -->
    <router-link to="/" class="btn btn-ghost mb-2" style="margin-bottom: 1.5rem; display: inline-flex;" aria-label="Back to Formulary">
      <span aria-hidden="true">←</span> Back to Formulary
    </router-link>

    <div v-if="!template" style="color: var(--text-dim); padding: 4rem; text-align: center;">
      Loading...
    </div>

    <div v-else class="builder-layout">
      <!-- LEFT: Form -->
      <div class="builder-form">
        <div class="page-header">
          <div class="flex items-center gap-2 mb-1">
            <span style="font-size: 2rem;" aria-hidden="true">{{ template.icon }}</span>
            <div>
              <h1>{{ template.name }}</h1>
              <p>{{ template.description }}</p>
            </div>
          </div>
        </div>

        <!-- Techniques -->
        <div class="flex gap-1 mb-2" style="flex-wrap: wrap; margin-bottom: 1.5rem;">
          <span v-for="tech in template.techniques" :key="tech" class="technique-tag">
            <span aria-hidden="true">✦</span> {{ tech }}
          </span>
        </div>

        <div v-if="!store.apiKey" class="no-key-banner">
          ⚠️ No API key configured. <router-link to="/settings" style="color: var(--gold);">Add one in Settings</router-link> to generate prompts.
        </div>

        <!-- Fields -->
        <div
          v-for="field in template.fields"
          :key="field.key"
          class="form-group"
        >
          <label :for="`field-${field.key}`" class="form-label">{{ field.label }}</label>

          <textarea
            v-if="field.type === 'textarea'"
            :id="`field-${field.key}`"
            v-model="formData[field.key]"
            class="form-textarea"
            :placeholder="field.placeholder"
            :aria-label="field.label"
          />
          <select
            v-else-if="field.type === 'select'"
            :id="`field-${field.key}`"
            v-model="formData[field.key]"
            class="form-select"
            :aria-label="field.label"
          >
            <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>
          <input
            v-else
            :id="`field-${field.key}`"
            v-model="formData[field.key]"
            class="form-input"
            :placeholder="field.placeholder"
            :aria-label="field.label"
          />
        </div>

        <!-- Usage indicator (Apprentice tier) -->
        <div v-if="!store.apiKey && !store.isPro" class="usage-indicator">
          <span class="font-display" style="font-size: 0.65rem; letter-spacing: 0.08em; color: var(--text-dim);">
            APPRENTICE
          </span>
          <div class="usage-dots">
            <span
              v-for="n in 3"
              :key="n"
              class="usage-dot"
              :class="{ used: n <= store.freeUsage }"
            />
          </div>
          <span style="font-size: 0.72rem; color: var(--text-dim);">
            {{ 3 - store.freeUsage }} free generation{{ 3 - store.freeUsage !== 1 ? 's' : '' }} left
          </span>
        </div>

        <button
          class="btn btn-primary w-full mt-2"
          style="justify-content: center; padding: 0.9rem; font-size: 0.8rem;"
          :disabled="generating || (!store.apiKey && !store.isPro && store.freeUsage >= 3)"
          @click="generate"
        >
          <span v-if="generating">
            <span class="spinner" aria-hidden="true"><i class="fa-solid fa-bolt" aria-hidden="true"></i></span> Transmuting...
          </span>
          <span v-else>✦ Generate Prompt</span>
        </button>
      </div>

      <!-- RIGHT: Output -->
      <div class="builder-output" style="width: calc(100vw - 220px - 420px - 9rem); min-width: 0;">
        <div class="output-header">
          <h2 class="font-display text-sm" style="letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim);">
            Generated Prompt
          </h2>
          <div class="flex gap-1" v-if="generatedPrompt">
          <button class="btn btn-ghost" style="font-size: 0.62rem;" @click="copyPrompt" :aria-label="copied ? 'Copied to clipboard' : 'Copy prompt to clipboard'">
            <span aria-hidden="true">{{ copied ? '✓' : '⧉' }}</span> {{ copied ? 'Copied' : 'Copy' }}
          </button>

          <!-- Export dropdown -->
          <div class="export-wrap" style="position: relative;">
            <button class="btn btn-ghost" style="font-size: 0.62rem;" @click="showExportMenu = !showExportMenu" aria-label="Export prompt">
              <span aria-hidden="true">↓</span> Export
            </button>
            <div v-if="showExportMenu" class="export-menu" role="menu">
              <button @click="exportPrompt('txt')" role="menuitem">Plain Text (.txt)</button>
              <button @click="exportPrompt('md')" role="menuitem">Markdown (.md)</button>
              <button @click="exportPrompt('json')" role="menuitem">JSON (.json)</button>
            </div>
          </div>

          <button class="btn btn-secondary" style="font-size: 0.62rem;" @click="showSaveModal = true" aria-label="Save prompt to library">
            <span aria-hidden="true">◈</span> Save
          </button>
        </div>
        </div>

        <div
          class="prompt-output"
          :class="{ empty: !generatedPrompt && !generating }"
          aria-live="polite"
          aria-label="Generated prompt output"
          :aria-busy="generating"
          style="width: 100%;"
        >
          <span v-if="!generatedPrompt && !generating" class="empty-state">
            Fill in the fields and click Generate to transmute your ideas into a powerful prompt...
          </span>
          <span v-else>{{ generatedPrompt }}<span v-if="generating" class="cursor" aria-hidden="true"></span></span>
        </div>

        <!-- Chat interface -->
        <div v-if="generatedPrompt" class="test-section">
          <div class="output-header" style="margin-bottom: 1rem;">
            <h2 class="font-display text-sm" style="letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim);">
              ▶ Live Chat Test
            </h2>
            <button
              class="btn btn-ghost"
              style="font-size: 0.62rem;"
              @click="clearChat"
              aria-label="Clear chat history"
            >
              ✕ Clear
            </button>
          </div>

          <!-- Message thread -->
          <div
            class="chat-thread"
            ref="chatThread"
            role="log"
            aria-label="Chat conversation"
            aria-live="polite"
          >
            <div v-if="chatMessages.length === 0" class="chat-empty">
              Your prompt is loaded as the system instruction. Send a message to test it.
            </div>

            <div
              v-for="(msg, i) in chatMessages"
              :key="i"
              class="chat-message"
              :class="msg.role === 'user' ? 'chat-user' : 'chat-assistant'"
            >
              <div class="chat-role">
                {{ msg.role === 'user' ? 'You' : 'AI' }}
              </div>
              <div class="chat-bubble">
                {{ msg.content }}<span v-if="testing && i === chatMessages.length - 1 && msg.role === 'assistant'" class="cursor" aria-hidden="true"></span>
              </div>
            </div>
          </div>

          <!-- Chat input -->
          <div class="chat-input-row">
            <textarea
              v-model="chatInput"
              class="form-textarea chat-input"
              placeholder="Send a message to test your prompt..."
              rows="2"
              aria-label="Chat message input"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.enter.shift.exact="chatInput += '\n'"
            />
            <button
              class="btn btn-primary chat-send"
              :disabled="testing || !chatInput.trim()"
              @click="sendMessage"
              aria-label="Send message"
            >
              <span v-if="testing" aria-hidden="true">⟳</span>
              <span v-else aria-hidden="true">↑</span>
            </button>
          </div>
          <p class="text-xs text-mute" style="margin-top: 0.4rem;">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>

    <!-- Save modal -->
    <div v-if="showSaveModal" class="modal-overlay" @click.self="showSaveModal = false" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal">
        <h2 id="modal-title" class="font-display" style="font-size: 1rem; margin-bottom: 1.25rem; color: var(--gold);">Save to Library</h2>
        <div class="form-group">
          <label for="save-title" class="form-label">Title</label>
          <input id="save-title" v-model="saveTitle" class="form-input" placeholder="Give this prompt a name..." />
        </div>
        <div class="form-group">
          <label for="save-tags" class="form-label">Tags (comma-separated)</label>
          <input id="save-tags" v-model="saveTags" class="form-input" placeholder="e.g. marketing, landing page, high-priority" />
        </div>
        <div class="flex gap-1" style="margin-top: 1.5rem;">
          <button class="btn btn-primary" @click="savePrompt"><span aria-hidden="true">◈</span> Save to Library</button>
          <button class="btn btn-ghost" @click="showSaveModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Limit reached modal -->
    <div v-if="showLimitModal" class="modal-overlay" @click.self="showLimitModal = false" role="dialog" aria-modal="true" aria-labelledby="limit-modal-title">
      <div class="modal" style="text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 1rem;" aria-hidden="true">⚗️</div>
        <h2 id="limit-modal-title" class="font-display" style="font-size: 1rem; margin-bottom: 0.75rem; color: var(--gold);">
          Apprentice Limit Reached
        </h2>
        <p style="color: var(--text-dim); font-size: 0.95rem; margin-bottom: 1.5rem;">
          You've used your 3 free generations. Add your own API key to continue as an <strong style="color: var(--gold);">Alchemist</strong>.
        </p>
        <div class="flex gap-1" style="justify-content: center;">
          <button class="btn btn-primary" @click="store.createCheckout()">
            ✦ Become an Alchemist — $9/mo
          </button>
          <router-link to="/settings" class="btn btn-secondary" @click="showLimitModal = false">
            Add API Key
          </router-link>
          <button class="btn btn-ghost" @click="showLimitModal = false">Maybe Later</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'

const route = useRoute()
const store = useAppStore()

const template = ref(null)
const formData = reactive({})
const generatedPrompt = ref('')
const generating = ref(false)
const copied = ref(false)
const showSaveModal = ref(false)
const showLimitModal = ref(false)
const saveTitle = ref('')
const saveTags = ref('')
const showExportMenu = ref(false)

// Chat state
const chatMessages = ref([])
const chatInput = ref('')
const chatThread = ref(null)
const testing = ref(false)

function clearChat() {
  chatMessages.value = []
  chatInput.value = ''
}

async function scrollToBottom() {
  await nextTick()
  if (chatThread.value) {
    chatThread.value.scrollTop = chatThread.value.scrollHeight
  }
}

async function sendMessage() {
  const content = chatInput.value.trim()
  if (!content || testing.value) return

  chatMessages.value.push({ role: 'user', content })
  chatInput.value = ''
  testing.value = true

  chatMessages.value.push({ role: 'assistant', content: '' })
  await scrollToBottom()

  const history = chatMessages.value
    .slice(0, -1)
    .map(m => ({ role: m.role, content: m.content }))

  const res = await fetch('https://backend-sparkling-snowflake-9703.fly.dev/test-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: generatedPrompt.value,
      api_key: store.apiKey,
      provider: store.provider,
      test_input: content,
      history,
    })
  })

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  const lastIdx = chatMessages.value.length - 1

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    for (const line of text.split('\n')) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const { text: chunk } = JSON.parse(line.slice(6))
          chatMessages.value[lastIdx].content += chunk
          await scrollToBottom()
        } catch {}
      }
    }
  }
  testing.value = false
}

async function generate() {
  generating.value = true
  generatedPrompt.value = ''

  const res = await fetch('https://backend-sparkling-snowflake-9703.fly.dev/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: route.params.templateId,
      fields: { ...formData },
      api_key: store.apiKey,
      provider: store.provider,
      session_id: store.sessionId,
    })
  })

  if (res.status === 429) {
    showLimitModal.value = true
    generating.value = false
    return
  }

  if (!store.apiKey && !store.isPro) store.incrementFreeUsage()

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    for (const line of text.split('\n')) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const { text: chunk } = JSON.parse(line.slice(6))
          generatedPrompt.value += chunk
        } catch {}
      }
    }
  }
  generating.value = false
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    showSaveModal.value = false
    showLimitModal.value = false
    showExportMenu.value = false
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  
  const isFormula = route.query.type === 'formula'
  const endpoint = isFormula
    ? `https://backend-sparkling-snowflake-9703.fly.dev/formulas/${route.params.templateId}`
    : `https://backend-sparkling-snowflake-9703.fly.dev/templates/${route.params.templateId}`

  const res = await fetch(endpoint)
  template.value = await res.json()
  for (const f of template.value.fields) {
    formData[f.key] = f.type === 'select' ? f.options[0] : ''
  }

  // Close export menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.export-wrap')) {
      showExportMenu.value = false
    }
  })
})

onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

async function copyPrompt() {
  await navigator.clipboard.writeText(generatedPrompt.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

async function savePrompt() {
  await store.saveToLibrary({
    title: saveTitle.value || template.value.name,
    category: template.value.category,
    template_id: template.value.id,
    prompt_text: generatedPrompt.value,
    tags: saveTags.value.split(',').map(t => t.trim()).filter(Boolean),
  })
  showSaveModal.value = false
  saveTitle.value = ''
  saveTags.value = ''
}

function exportPrompt(format) {
  const name = template.value?.name || 'prompt'
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  let content, filename, type

  if (format === 'txt') {
    content = generatedPrompt.value
    filename = `${slug}.txt`
    type = 'text/plain'
  } else if (format === 'md') {
    content = `# ${name}\n\n`
    content += `**Category:** ${template.value?.category}\n`
    content += `**Techniques:** ${template.value?.techniques?.join(', ')}\n\n`
    content += `---\n\n`
    content += generatedPrompt.value
    filename = `${slug}.md`
    type = 'text/markdown'
  } else if (format === 'json') {
    content = JSON.stringify({
      title: name,
      category: template.value?.category,
      techniques: template.value?.techniques,
      prompt: generatedPrompt.value,
      exported_at: new Date().toISOString(),
    }, null, 2)
    filename = `${slug}.json`
    type = 'application/json'
  }

  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  showExportMenu.value = false
}
</script>

<style scoped>
.builder-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 2rem;
  align-items: start;
}

.export-wrap { position: relative; }

.export-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  overflow: hidden;
  z-index: 50;
  min-width: 160px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

.export-menu button {
  display: block;
  width: 100%;
  padding: 0.6rem 1rem;
  background: none;
  border: none;
  color: var(--text-dim);
  font-family: var(--font-body);
  font-size: 0.88rem;
  text-align: left;
  cursor: pointer;
  transition: var(--transition);
}

.export-menu button:hover {
  background: var(--surface2);
  color: var(--text);
}

.usage-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 1rem;
}

.usage-dots {
  display: flex;
  gap: 0.3rem;
}

.usage-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gold);
  transition: var(--transition);
}

.usage-dot.used {
  background: var(--border2);
}

.builder-form {
  position: sticky;
  top: 2rem;
}

.output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.prompt-output.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border-style: dashed;
}

.empty-state {
  color: var(--text-mute);
  font-family: var(--font-body);
  font-style: italic;
  text-align: center;
  line-height: 1.6;
  font-size: 0.95rem;
}

.test-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.no-key-banner {
  background: rgba(224,92,42,0.08);
  border: 1px solid var(--ember-dim);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: var(--text-dim);
  margin-bottom: 1.5rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--gold-dim);
  border-radius: var(--radius);
  padding: 2rem;
  width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}

.spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Chat */
.chat-thread {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 0.75rem;
  scroll-behavior: smooth;
}

.chat-empty {
  color: var(--text-mute);
  font-style: italic;
  font-size: 0.9rem;
  text-align: center;
  margin: auto;
}

.chat-message {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-width: 85%;
}

.chat-user { align-self: flex-end; align-items: flex-end; }
.chat-assistant { align-self: flex-start; align-items: flex-start; }

.chat-role {
  font-family: var(--font-display);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-mute);
}

.chat-bubble {
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-user .chat-bubble {
  background: var(--gold-glow);
  border: 1px solid var(--gold-dim);
  color: var(--text);
}

.chat-assistant .chat-bubble {
  background: var(--surface);
  border: 1px solid var(--border2);
  color: var(--text);
}

.chat-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  min-height: 60px;
  max-height: 120px;
  resize: none;
}

.chat-send {
  flex-shrink: 0;
  height: 60px;
  width: 48px;
  justify-content: center;
  font-size: 1.1rem;
  padding: 0;
}
</style>