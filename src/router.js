import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import BuilderView from './views/BuilderView.vue'
import LibraryView from './views/LibraryView.vue'
import SettingsView from './views/SettingsView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/build/:templateId', component: BuilderView },
    { path: '/library', component: LibraryView },
    { path: '/settings', component: SettingsView },
  ]
})