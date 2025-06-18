<template>
  <div class="explore-agents-container">
    <div class="explore-header">
      <div class="header-content">
        <h1>Explore Agents</h1>
        <p>Discover AI agents from the Azion Marketplace</p>
      </div>
    </div>

    <div class="marketplace-content">
      <div class="filters-section">
        <div class="filter-controls">
          <InputText 
            v-model="searchQuery" 
            placeholder="Search agents..."
            class="search-input"
          />
          <Dropdown 
            v-model="categoryFilter" 
            :options="categoryOptions" 
            optionLabel="label"
            optionValue="value"
            placeholder="Filter by category"
          />
          <Dropdown 
            v-model="sortBy" 
            :options="sortOptions" 
            optionLabel="label"
            optionValue="value"
            placeholder="Sort by"
          />
        </div>
      </div>

      <div class="agents-grid">
        <Card 
          v-for="agent in filteredAgents" 
          :key="agent.id"
          class="marketplace-agent-card"
        >
          <template #header>
            <div class="agent-image">
              <img :src="agent.image" :alt="agent.name" />
            </div>
          </template>

          <template #content>
            <div class="agent-info">
              <div class="agent-header">
                <h3>{{ agent.name }}</h3>
                <div class="agent-meta">
                  <Tag :value="agent.category" class="category-tag" />
                  <div class="rating">
                    <i class="pi pi-star-fill"></i>
                    <span>{{ agent.rating }}</span>
                    <small>({{ agent.reviews }})</small>
                  </div>
                </div>
              </div>
              
              <p class="description">{{ agent.description }}</p>
              
              <div class="agent-features">
                <div class="feature-list">
                  <span 
                    v-for="feature in agent.features.slice(0, 3)" 
                    :key="feature"
                    class="feature-item"
                  >
                    {{ feature }}
                  </span>
                  <span v-if="agent.features.length > 3" class="more-features">
                    +{{ agent.features.length - 3 }} more
                  </span>
                </div>
              </div>

              <div class="agent-stats">
                <div class="stat">
                  <i class="pi pi-download"></i>
                  <span>{{ agent.downloads }}</span>
                </div>
                <div class="stat">
                  <i class="pi pi-users"></i>
                  <span>{{ agent.activeUsers }}</span>
                </div>
                <div class="stat">
                  <i class="pi pi-calendar"></i>
                  <span>{{ formatDate(agent.lastUpdated) }}</span>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="agent-actions">
              <Button 
                label="View Details" 
                class="p-button-outlined"
                @click="viewAgentDetails(agent)"
              />
              <Button 
                label="Install" 
                @click="installAgent(agent)"
                :disabled="agent.installed"
              >
                <template v-if="agent.installed">
                  <i class="pi pi-check"></i>
                  Installed
                </template>
              </Button>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { format } from 'date-fns'

// Reactive data
const searchQuery = ref('')
const categoryFilter = ref('')
const sortBy = ref('popular')

const categoryOptions = [
  { label: 'All Categories', value: '' },
  { label: 'Customer Support', value: 'customer-support' },
  { label: 'Development', value: 'development' },
  { label: 'Content Creation', value: 'content' },
  { label: 'Data Analysis', value: 'data' },
  { label: 'Marketing', value: 'marketing' }
]

const sortOptions = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Recently Updated', value: 'updated' },
  { label: 'Most Downloads', value: 'downloads' }
]

// Mock marketplace agents
const marketplaceAgents = ref([
  {
    id: '1',
    name: 'Customer Support Pro',
    description: 'Advanced customer support agent with multilingual capabilities and sentiment analysis',
    category: 'customer-support',
    rating: 4.8,
    reviews: 156,
    downloads: '2.3k',
    activeUsers: '890',
    lastUpdated: new Date('2024-06-15'),
    image: 'https://via.placeholder.com/300x200/007bff/ffffff?text=Customer+Support',
    features: ['Multilingual', 'Sentiment Analysis', 'Ticket Routing', 'Knowledge Base', 'Live Chat'],
    installed: false,
    price: 'Free'
  },
  {
    id: '2',
    name: 'Code Review Assistant',
    description: 'AI-powered code review agent that analyzes code quality, security, and best practices',
    category: 'development',
    rating: 4.9,
    reviews: 89,
    downloads: '1.8k',
    activeUsers: '445',
    lastUpdated: new Date('2024-06-17'),
    image: 'https://via.placeholder.com/300x200/28a745/ffffff?text=Code+Review',
    features: ['Security Analysis', 'Best Practices', 'Performance Tips', 'Documentation', 'Multi-language'],
    installed: true,
    price: '$29/month'
  },
  {
    id: '3',
    name: 'Content Creator',
    description: 'Generate high-quality content for blogs, social media, and marketing campaigns',
    category: 'content',
    rating: 4.7,
    reviews: 234,
    downloads: '3.1k',
    activeUsers: '1.2k',
    lastUpdated: new Date('2024-06-12'),
    image: 'https://via.placeholder.com/300x200/dc3545/ffffff?text=Content+Creator',
    features: ['Blog Posts', 'Social Media', 'SEO Optimization', 'Multiple Formats', 'Brand Voice'],
    installed: false,
    price: '$19/month'
  },
  {
    id: '4',
    name: 'Data Analyst Pro',
    description: 'Analyze datasets, generate insights, and create visualizations automatically',
    category: 'data',
    rating: 4.6,
    reviews: 67,
    downloads: '945',
    activeUsers: '312',
    lastUpdated: new Date('2024-06-14'),
    image: 'https://via.placeholder.com/300x200/6f42c1/ffffff?text=Data+Analyst',
    features: ['Data Visualization', 'Statistical Analysis', 'Report Generation', 'Trend Detection', 'Export Options'],
    installed: false,
    price: '$39/month'
  },
  {
    id: '5',
    name: 'Marketing Optimizer',
    description: 'Optimize marketing campaigns, analyze performance, and suggest improvements',
    category: 'marketing',
    rating: 4.5,
    reviews: 123,
    downloads: '1.5k',
    activeUsers: '678',
    lastUpdated: new Date('2024-06-11'),
    image: 'https://via.placeholder.com/300x200/fd7e14/ffffff?text=Marketing+Optimizer',
    features: ['Campaign Analysis', 'A/B Testing', 'ROI Tracking', 'Audience Insights', 'Recommendations'],
    installed: false,
    price: '$49/month'
  },
  {
    id: '6',
    name: 'Legal Document Assistant',
    description: 'Review legal documents, extract key information, and ensure compliance',
    category: 'legal',
    rating: 4.9,
    reviews: 45,
    downloads: '567',
    activeUsers: '189',
    lastUpdated: new Date('2024-06-16'),
    image: 'https://via.placeholder.com/300x200/6c757d/ffffff?text=Legal+Assistant',
    features: ['Document Review', 'Compliance Check', 'Key Extraction', 'Risk Assessment', 'Templates'],
    installed: false,
    price: '$99/month'
  }
])

// Computed properties
const filteredAgents = computed(() => {
  let filtered = marketplaceAgents.value

  if (searchQuery.value) {
    filtered = filtered.filter(agent => 
      agent.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      agent.features.some(feature => feature.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(agent => agent.category === categoryFilter.value)
  }

  // Sort agents
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'rating':
        return b.rating - a.rating
      case 'updated':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      case 'downloads':
        return parseInt(b.downloads.replace('k', '000').replace('.', '')) - parseInt(a.downloads.replace('k', '000').replace('.', ''))
      case 'popular':
      default:
        return parseInt(b.activeUsers.replace('k', '000').replace('.', '')) - parseInt(a.activeUsers.replace('k', '000').replace('.', ''))
    }
  })

  return filtered
})

// Methods
const viewAgentDetails = (agent: any) => {
  console.log('View agent details:', agent)
}

const installAgent = (agent: any) => {
  if (confirm(`Install "${agent.name}" agent?`)) {
    agent.installed = true
    console.log('Installing agent:', agent)
  }
}

const formatDate = (date: Date) => {
  return format(date, 'MMM dd, yyyy')
}
</script>

<style scoped>
.explore-agents-container {
  padding: 2rem;
  background-color: #000000;
  min-height: 100vh;
}

.explore-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333333;
}

.header-content h1 {
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.header-content p {
  color: #888888;
  margin: 0;
}

.filters-section {
  margin-bottom: 2rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.marketplace-agent-card {
  background-color: #111111;
  border: 1px solid #333333;
  transition: all 0.2s ease;
}

.marketplace-agent-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.agent-image {
  height: 200px;
  overflow: hidden;
}

.agent-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.agent-info {
  padding: 1rem;
}

.agent-header {
  margin-bottom: 1rem;
}

.agent-header h3 {
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.agent-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-tag {
  font-size: 0.8rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #ffc107;
  font-size: 0.9rem;
}

.rating i {
  color: #ffc107;
}

.rating span {
  color: #ffffff;
  font-weight: 500;
}

.rating small {
  color: #888888;
}

.description {
  color: #cccccc;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.agent-features {
  margin-bottom: 1rem;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-item {
  background-color: #1a1a1a;
  color: #cccccc;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid #333333;
}

.more-features {
  background-color: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.agent-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333333;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #888888;
  font-size: 0.8rem;
}

.stat i {
  color: #007bff;
}

.agent-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #333333;
}

.agent-actions .p-button {
  flex: 1;
}

/* Responsive design */
@media (max-width: 768px) {
  .agents-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .agent-actions {
    flex-direction: column;
  }
}
</style>
