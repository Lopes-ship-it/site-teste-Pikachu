import { logout } from '../../services/auth.js'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: iconGrid() },
  { id: 'prices', label: 'Tabela de Preços', icon: iconTag() },
  { id: 'plans', label: 'Planos', icon: iconLayers() },
  { id: 'winners', label: 'Ganhadores do Sorteio', icon: iconTrophy() }
]

export function renderSidebar(root, { active, onNavigate }) {
  root.innerHTML = `
    <div class="sidebar-brand">
      <img src="/img/logo.png" alt="Pikachu">
      <span>Admin</span>
    </div>
    <nav class="sidebar-nav">
      ${NAV_ITEMS.map(item => `
        <button type="button" class="sidebar-link ${active === item.id ? 'active' : ''}" data-view="${item.id}">
          ${item.icon}<span>${item.label}</span>
        </button>
      `).join('')}
    </nav>
    <button type="button" class="sidebar-link sidebar-logout" data-action="logout">
      ${iconLogout()}<span>Logout</span>
    </button>
  `

  root.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => onNavigate(btn.dataset.view))
  })
  root.querySelector('[data-action="logout"]').addEventListener('click', async () => {
    await logout()
  })
}

function iconGrid() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>`
}
function iconTag() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.5 12.5 12.6 20.4a2 2 0 0 1-2.8 0l-6.2-6.2a2 2 0 0 1 0-2.8L11.5 3.5H19a1.5 1.5 0 0 1 1.5 1.5v7.5Z"/><circle cx="15.5" cy="8.5" r="1.3"/></svg>`
}
function iconLayers() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></svg>`
}
function iconTrophy() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4h8v6a4 4 0 0 1-8 0V4Z"/><path d="M8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4"/><path d="M10 17h4M12 14v3M9 21h6"/></svg>`
}
function iconLogout() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>`
}
