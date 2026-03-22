<template>
  <div style="width: calc(100vw - 220px - 6rem);">
    <div class="page-header">
      <h1>Prompt Library</h1>
      <p>Your saved prompts, organized and ready to use.</p>
    </div>

    <!-- Filters -->
    <div class="flex items-center justify-between mb-2" style="margin-bottom: 1.5rem;">
      <div class="flex gap-1">
        <button class="btn" :class="filter === 'all' ? 'btn-secondary' : 'btn-ghost'" style="font-size: 0.65rem;" @click="filter = 'all'">All</button>
        <button class="btn" :class="filter === 'favorites' ? 'btn-secondary' : 'btn-ghost'" style="font-size: 0.65rem;" @click="filter = 'favorites'">★ Favorites</button>
      </div>
      <input v-model="search" class="form-input" placeholder="Search prompts..." style="width: 240px; padding: 0.4rem 0.8rem;" />
    </div>

    <div v-if="store.library.length === 0" class="empty-library">
      <div style="font-size: 3rem; margin-bottom: 1rem;">◈</div>
      <div class="font-display" style="font-size: 0.9rem; letter-spacing: 0.1em; color: var(--text-dim);">Your library is empty</div>
      <p style="color: var(--text-mute); margin-top: 0.5rem; font-size: 0.9rem;">Generate a prompt and save it to build your collection.</p>
      <router-link to="/" class="btn btn-secondary" style="margin-top: 1.5rem;">✦ Browse Templates</router-link>
    </div>

    <div v-else class="library-list">
      <div
        v-for="prompt in filtered"
        :key="prompt.id"
        class="library-item"
      >
        <div class="lib-header">
          <div>
            <div class="flex items-center gap-1">
              <h3 class="lib-title">{{ prompt.title }}</h3>
              <button class="fav-btn" @click="store.toggleFavorite(prompt.id, prompt.is_favorite)">
                {{ prompt.is_favorite ? '★' : '☆' }}
              </button>
            </div>
            <div class="flex gap-1 mt-1" style="flex-wrap: wrap;">
              <span class="badge badge-mute">{{ prompt.category }}</span>
              <span v-for="tag in prompt.tags" :key="tag" class="badge badge-gold">{{ tag }}</span>
            </div>
          </div>
          <div class="flex gap-1">
            <button class="btn btn-ghost" style="font-size: 0.62rem;" @click="copy(prompt)">
              {{ copiedId === prompt.id ? '✓ Copied' : '⧉ Copy' }}
            </button>
            <button class="btn btn-danger" style="font-size: 0.62rem;" @click="store.deleteFromLibrary(prompt.id)">
              ✕
            </button>
          </div>
        </div>

        <div class="lib-preview" :class="{ expanded: expandedId === prompt.id }" @click="toggle(prompt.id)">
          {{ prompt.prompt_text }}
        </div>

        <div class="lib-footer">
          <span class="text-mute text-xs">{{ formatDate(prompt.created_at) }}</span>
          <button class="text-xs" style="background: none; border: none; color: var(--text-dim); cursor: pointer;" @click="toggle(prompt.id)">
            {{ expandedId === prompt.id ? 'Collapse ↑' : 'Expand ↓' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const filter = ref('all')
const search = ref('')
const expandedId = ref(null)
const copiedId = ref(null)

onMounted(() => store.fetchLibrary())

const filtered = computed(() => {
  let list = store.library
  if (filter.value === 'favorites') list = list.filter(p => p.is_favorite)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.prompt_text.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  return list
})

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id
}

async function copy(prompt) {
  await navigator.clipboard.writeText(prompt.prompt_text)
  copiedId.value = prompt.id
  setTimeout(() => copiedId.value = null, 2000)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.empty-library {
  text-align: center;
  padding: 6rem 2rem;
  color: var(--text-dim);
}

.library-list { display: flex; flex-direction: column; gap: 0.75rem; }

.library-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  transition: border-color var(--transition);
}

.library-item:hover { border-color: var(--border2); }

.lib-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.lib-title {
  font-family: var(--font-display);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  color: var(--text);
}

.fav-btn {
  background: none;
  border: none;
  color: var(--gold-dim);
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
  transition: color var(--transition);
}

.fav-btn:hover { color: var(--gold); }

.lib-preview {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-dim);
  line-height: 1.6;
  max-height: 60px;
  overflow: hidden;
  cursor: pointer;
  transition: max-height 0.3s ease;
  white-space: pre-wrap;
}

.lib-preview.expanded { max-height: 600px; }

.lib-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}
</style>