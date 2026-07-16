export function renderHeader(root, { title, subtitle, user }) {
  root.innerHTML = `
    <button type="button" class="mobile-sidebar-toggle" id="mobileSidebarToggle" aria-label="Abrir menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    <div>
      <h1>${title}</h1>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>
    <div class="header-user">
      <span class="header-user-dot"></span>
      <span>${user || 'Administrador'}</span>
    </div>
  `
}
