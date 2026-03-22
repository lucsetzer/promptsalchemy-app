<template>
  <div style="width: calc(100vw - 220px - 6rem);">
    <div class="page-header">
      <h1>The Formulary</h1>
      <p>Select a proven formula or template. Fill in the details. Transmute your ideas into production-ready prompts.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" style="color: var(--text-dim); text-align: center; padding: 4rem;">
      <div style="font-size: 2rem; margin-bottom: 1rem; animation: spin 2s linear infinite; display: inline-block;">⚗️</div>
      <div class="font-display text-sm" style="letter-spacing: 0.1em;">Loading formulary...</div>
    </div>

    <div v-else>
      <!-- Formulas section -->
      <div class="section-header">
        <div>
          <h2 class="section-title">⚗️ Prompt Formulas</h2>
          <p class="section-desc">Raw prompt engineering frameworks. Fill in the blanks, get a production-ready prompt.</p>
        </div>
      </div>

      <div class="template-grid" style="margin-bottom: 3rem;">
        <router-link
          v-for="f in formulas"
          :key="f.id"
          :to="`/build/${f.id}?type=formula`"
          class="template-card formula-card"
        >
          <div class="template-icon">{{ f.icon }}</div>
          <div class="template-body">
            <div class="flex items-center justify-between mb-1">
              <h3 class="template-name">{{ f.name }}</h3>
              <span class="badge badge-ember" style="font-size: 0.58rem;">Formula</span>
            </div>
            <p class="template-desc">{{ f.description }}</p>
            <div class="flex gap-1 mt-2" style="flex-wrap: wrap; margin-top: 0.75rem;">
              <span v-for="tech in f.techniques" :key="tech" class="technique-tag">{{ tech }}</span>
            </div>
          </div>
          <div class="template-arrow">→</div>
        </router-link>
      </div>

      <!-- Divider -->
      <hr class="divider" style="margin-bottom: 2rem;" />

      <!-- Templates section -->
      <div class="section-header" style="margin-bottom: 1.5rem;">
        <div>
          <h2 class="section-title">✦ Use-Case Templates</h2>
          <p class="section-desc">Pre-built prompts for specific tasks. Best practices baked in.</p>
        </div>

        <!-- Category filter -->
        <div class="flex gap-1" style="flex-wrap: wrap;">
          <button
            v-for="cat in categories"
            :key="cat"
            class="btn"
            :class="activeCategory === cat ? 'btn-secondary' : 'btn-ghost'"
            style="font-size: 0.65rem;"
            @click="activeCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <div class="template-grid">
        <router-link
          v-for="t in filteredTemplates"
          :key="t.id"
          :to="`/build/${t.id}`"
          class="template-card"
        >
          <div class="template-icon">{{ t.icon }}</div>
          <div class="template-body">
            <div class="flex items-center justify-between mb-1">
              <h3 class="template-name">{{ t.name }}</h3>
              <span class="badge badge-mute" style="font-size: 0.58rem;">{{ t.category }}</span>
            </div>
            <p class="template-desc">{{ t.description }}</p>
            <div class="flex gap-1 mt-2" style="flex-wrap: wrap; margin-top: 0.75rem;">
              <span v-for="tech in t.techniques" :key="tech" class="technique-tag">{{ tech }}</span>
            </div>
          </div>
          <div class="template-arrow">→</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const templates = ref([])
const formulas = ref([])
const loading = ref(true)
const activeCategory = ref('All')

const categories = computed(() => {
  return ['All', ...new Set(templates.value.map(t => t.category))]
})

const filteredTemplates = computed(() => {
  if (activeCategory.value === 'All') return templates.value
  return templates.value.filter(t => t.category === activeCategory.value)
})

onMounted(async () => {
  try {
    const [tRes, fRes] = await Promise.all([
      fetch('https://backend-sparkling-snowflake-9703.fly.dev/templates'),
      fetch('https://backend-sparkling-snowflake-9703.fly.dev/formulas'),
    ])
    templates.value = await tRes.json()
    formulas.value = await fRes.json()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.section-title {
  font-family: var(--font-display);
  font-size: 1rem;
  letter-spacing: 0.06em;
  color: var(--text);
  margin-bottom: 0.25rem;
}

.section-desc {
  font-size: 0.88rem;
  color: var(--text-dim);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
}

.template-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
}

.template-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 60%, var(--gold-glow));
  opacity: 0;
  transition: opacity var(--transition);
}

.formula-card::before {
  background: linear-gradient(135deg, transparent 60%, rgba(224,92,42,0.08));
}

.template-card:hover {
  border-color: var(--gold-dim);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
}

.formula-card:hover {
  border-color: var(--ember-dim);
}

.template-card:hover::before { opacity: 1; }

.template-icon {
  font-size: 2rem;
  flex-shrink: 0;
  filter: drop-shadow(0 0 8px rgba(201,168,76,0.3));
}

.template-body { flex: 1; min-width: 0; }

.template-name {
  font-family: var(--font-display);
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  color: var(--text);
}

.template-desc {
  font-size: 0.88rem;
  color: var(--text-dim);
  margin-top: 0.3rem;
  line-height: 1.4;
}

.template-arrow {
  color: var(--gold-dim);
  font-size: 1.2rem;
  align-self: center;
  transition: transform var(--transition);
  flex-shrink: 0;
}

.template-card:hover .template-arrow {
  transform: translateX(4px);
  color: var(--gold);
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>