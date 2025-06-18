import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/chat'
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
    },
    {
      path: '/prompts',
      name: 'prompts',
      component: () => import('../views/PromptsView.vue'),
    },
    {
      path: '/prompts/:id',
      name: 'prompt-detail',
      component: () => import('../views/PromptDetailView.vue'),
    },
    {
      path: '/autorag',
      name: 'autorag',
      component: () => import('../views/AutoRAGView.vue'),
    },
    {
      path: '/autorag/:id',
      name: 'autorag-detail',
      component: () => import('../views/AutoRAGDetailView.vue'),
    },
    {
      path: '/agent-builder',
      name: 'agent-builder',
      component: () => import('../views/AgentBuilderView.vue'),
    },
    {
      path: '/agent-builder/:id',
      name: 'agent-detail',
      component: () => import('../views/AgentDetailView.vue'),
    },
    {
      path: '/prompt-optimizer',
      name: 'prompt-optimizer',
      component: () => import('../views/PromptOptimizerView.vue'),
    },
    {
      path: '/benchmarks',
      name: 'benchmarks',
      component: () => import('../views/BenchmarksView.vue'),
    },
    {
      path: '/explore-agents',
      name: 'explore-agents',
      component: () => import('../views/ExploreAgentsView.vue'),
    },
    {
      path: '/activity-history',
      name: 'activity-history',
      component: () => import('../views/ActivityHistoryView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
  ],
})

export default router
