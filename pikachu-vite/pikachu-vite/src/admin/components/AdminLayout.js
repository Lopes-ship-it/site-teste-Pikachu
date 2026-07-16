import { renderSidebar } from './Sidebar.js'
import { renderHeader } from './Header.js'
import { renderDashboard } from '../pages/Dashboard.js'
import { renderPriceTable } from './PriceTable.js'
import { renderPlanEditor } from './PlanEditor.js'
import { renderWinnerEditor } from './WinnerEditor.js'

const VIEWS = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral do site', render: renderDashboard },
  prices: { title: 'Tabela de Preços', subtitle: 'Serviços e combos exibidos no site', render: (root) => renderPriceTable(root) },
  plans: { title: 'Planos', subtitle: 'Assinaturas exibidas no carrossel do site', render: (root) => renderPlanEditor(root) },
  winners: { title: 'Ganhadores do Sorteio', subtitle: 'Pódio mensal exibido no site', render: (root) => renderWinnerEditor(root) }
}

export function renderAdminLayout(root, { user, initialView = 'dashboard' }) {
  let currentView = initialView
  let currentContentRoot = null

  root.innerHTML = `
    <aside class="admin-sidebar" id="adminSidebar"></aside>
    <div class="admin-main">
      <header class="admin-header" id="adminHeader"></header>
      <main class="admin-content" id="adminContent"></main>
    </div>
    <div class="sidebar-scrim" id="sidebarScrim"></div>
  `

  const sidebarEl = root.querySelector('#adminSidebar')
  const headerEl = root.querySelector('#adminHeader')
  const contentEl = root.querySelector('#adminContent')
  const scrimEl = root.querySelector('#sidebarScrim')

  function navigate(view) {
    if (currentContentRoot?._cleanup) currentContentRoot._cleanup()
    currentView = view
    sidebarEl.querySelectorAll('.sidebar-link[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === view))
    headerEl.querySelector('h1').textContent = VIEWS[view].title
    const subEl = headerEl.querySelector('p')
    if (subEl) subEl.textContent = VIEWS[view].subtitle
    contentEl.innerHTML = ''
    contentEl.scrollTop = 0
    VIEWS[view].render(contentEl, { user })
    currentContentRoot = contentEl
    root.classList.remove('sidebar-open')
  }

  renderSidebar(sidebarEl, { active: currentView, onNavigate: navigate })
  renderHeader(headerEl, { title: VIEWS[currentView].title, subtitle: VIEWS[currentView].subtitle, user })

  headerEl.querySelector('#mobileSidebarToggle').addEventListener('click', () => {
    root.classList.toggle('sidebar-open')
  })
  scrimEl.addEventListener('click', () => root.classList.remove('sidebar-open'))

  VIEWS[currentView].render(contentEl, { user })
  currentContentRoot = contentEl
}
