import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import PrimeVue from 'primevue/config'
import App from './App.vue'

// PrimeVue components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Sidebar from 'primevue/sidebar'
import Menu from 'primevue/menu'
import Menubar from 'primevue/menubar'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import FileUpload from 'primevue/fileupload'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Tree from 'primevue/tree'
import Slider from 'primevue/slider'
import InputNumber from 'primevue/inputnumber'
import ToggleButton from 'primevue/togglebutton'
import Chip from 'primevue/chip'
import Badge from 'primevue/badge'
import ProgressBar from 'primevue/progressbar'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'

// PrimeVue styles
import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

// Views
import Chat from './views/Chat.vue'
import Prompts from './views/Prompts.vue'
import AutoRAG from './views/AutoRAG.vue'
import AgentBuilder from './views/AgentBuilder.vue'

const routes = [
  { path: '/', redirect: '/chat' },
  { path: '/chat', component: Chat },
  { path: '/prompts', component: Prompts },
  { path: '/autorag', component: AutoRAG },
  { path: '/agent-builder', component: AgentBuilder }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)

app.use(router)
app.use(PrimeVue)
app.use(ToastService)

// Register PrimeVue components
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Textarea', Textarea)
app.component('Dropdown', Dropdown)
app.component('Sidebar', Sidebar)
app.component('Menu', Menu)
app.component('Menubar', Menubar)
app.component('Card', Card)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Dialog', Dialog)
app.component('FileUpload', FileUpload)
app.component('TabView', TabView)
app.component('TabPanel', TabPanel)
app.component('Tree', Tree)
app.component('Slider', Slider)
app.component('InputNumber', InputNumber)
app.component('ToggleButton', ToggleButton)
app.component('Chip', Chip)
app.component('Badge', Badge)
app.component('ProgressBar', ProgressBar)
app.component('Toast', Toast)

app.mount('#app')

