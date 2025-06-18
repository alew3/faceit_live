<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2 class="logo">
        <i class="pi pi-bolt"></i>
        Azion AI Studio
      </h2>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-section">
        <h3 class="nav-section-title">AI Products</h3>
        
        <RouterLink to="/chat" class="nav-item" :class="{ active: $route.path === '/chat' }">
          <i class="pi pi-comments"></i>
          <span>Chat</span>
        </RouterLink>
        
        <RouterLink to="/prompts" class="nav-item" :class="{ active: $route.path.startsWith('/prompts') }">
          <i class="pi pi-file-edit"></i>
          <span>Prompts</span>
        </RouterLink>
        
        <RouterLink to="/autorag" class="nav-item" :class="{ active: $route.path.startsWith('/autorag') }">
          <i class="pi pi-database"></i>
          <span>AutoRAG</span>
        </RouterLink>
        
        <RouterLink to="/agent-builder" class="nav-item" :class="{ active: $route.path.startsWith('/agent-builder') }">
          <i class="pi pi-cog"></i>
          <span>Agent Builder</span>
        </RouterLink>
      </div>
      
      <div class="nav-section">
        <h3 class="nav-section-title">Tools</h3>
        
        <RouterLink to="/prompt-optimizer" class="nav-item" :class="{ active: $route.path === '/prompt-optimizer' }">
          <i class="pi pi-chart-line"></i>
          <span>AI Prompt Optimizer</span>
        </RouterLink>
        
        <RouterLink to="/benchmarks" class="nav-item" :class="{ active: $route.path === '/benchmarks' }">
          <i class="pi pi-chart-bar"></i>
          <span>Benchmarks</span>
        </RouterLink>
      </div>
      
      <div class="nav-section">
        <h3 class="nav-section-title">Marketplace</h3>
        
        <RouterLink to="/explore-agents" class="nav-item" :class="{ active: $route.path === '/explore-agents' }">
          <i class="pi pi-search"></i>
          <span>Explore Agents</span>
        </RouterLink>
      </div>
      
      <div class="nav-section">
        <h3 class="nav-section-title">Management</h3>
        
        <RouterLink to="/activity-history" class="nav-item" :class="{ active: $route.path === '/activity-history' }">
          <i class="pi pi-history"></i>
          <span>Activity History</span>
        </RouterLink>
        
        <RouterLink to="/settings" class="nav-item" :class="{ active: $route.path === '/settings' }">
          <i class="pi pi-cog"></i>
          <span>Settings</span>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.sidebar {
  width: 280px;
  background-color: #111111;
  border-right: 1px solid #333333;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #333333;
}

.logo {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo i {
  color: #007bff;
  font-size: 1.8rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-section-title {
  color: #888888;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 1rem;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #cccccc;
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  font-weight: 400;
}

.nav-item:hover {
  background-color: #1a1a1a;
  color: #ffffff;
  border-left-color: #007bff;
}

.nav-item.active {
  background-color: #1a1a1a;
  color: #ffffff;
  border-left-color: #007bff;
  font-weight: 500;
}

.nav-item i {
  font-size: 1.1rem;
  width: 1.2rem;
  text-align: center;
}

.nav-item span {
  font-size: 0.9rem;
}

/* Custom scrollbar for sidebar */
.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: #111111;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #333333;
  border-radius: 2px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #444444;
}
</style>

