<template>
  <div class="layout-wrapper">
    <!-- Top Navigation -->
    <div class="layout-topbar">
      <div class="layout-topbar-logo">
        <img src="/azion-logo.svg" alt="Azion" height="40" />
        <span class="layout-topbar-logo-text">AI Studio</span>
      </div>
      <div class="layout-topbar-menu">
        <Button icon="pi pi-user" class="p-button-rounded p-button-text" />
        <Button icon="pi pi-cog" class="p-button-rounded p-button-text" />
      </div>
    </div>

    <!-- Sidebar -->
    <div class="layout-sidebar">
      <div class="layout-menu">
        <ul class="layout-menu-list">
          <li class="layout-menuitem">
            <router-link to="/chat" class="layout-menuitem-link">
              <i class="pi pi-comments"></i>
              <span>Chat</span>
            </router-link>
          </li>
          <li class="layout-menuitem">
            <router-link to="/prompts" class="layout-menuitem-link">
              <i class="pi pi-file-edit"></i>
              <span>Prompts</span>
            </router-link>
          </li>
          <li class="layout-menuitem">
            <router-link to="/autorag" class="layout-menuitem-link">
              <i class="pi pi-database"></i>
              <span>AutoRAG</span>
            </router-link>
          </li>
          <li class="layout-menuitem">
            <router-link to="/agent-builder" class="layout-menuitem-link">
              <i class="pi pi-cog"></i>
              <span>Agent Builder</span>
            </router-link>
          </li>
          <li class="layout-menuitem">
            <a href="#" class="layout-menuitem-link">
              <i class="pi pi-search"></i>
              <span>Explore Agents</span>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Main Content -->
    <div class="layout-main-container">
      <div class="layout-main">
        <router-view />
      </div>
    </div>

    <Toast />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
}

.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 1000;
}

.layout-topbar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.layout-topbar-logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #495057;
}

.layout-topbar-menu {
  display: flex;
  gap: 0.5rem;
}

.layout-sidebar {
  position: fixed;
  top: 70px;
  left: 0;
  width: 250px;
  height: calc(100vh - 70px);
  background: #ffffff;
  border-right: 1px solid #e9ecef;
  overflow-y: auto;
  z-index: 999;
}

.layout-menu {
  padding: 1rem 0;
}

.layout-menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.layout-menuitem {
  margin: 0;
}

.layout-menuitem-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #6c757d;
  text-decoration: none;
  transition: all 0.2s;
}

.layout-menuitem-link:hover,
.layout-menuitem-link.router-link-active {
  background: #e3f2fd;
  color: #1976d2;
}

.layout-main-container {
  margin-top: 70px;
  margin-left: 250px;
  min-height: calc(100vh - 70px);
}

.layout-main {
  padding: 2rem;
}

@media (max-width: 768px) {
  .layout-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .layout-main-container {
    margin-left: 0;
  }
}
</style>

