// Helpers de interface do painel: toasts, modal de confirmação e overlay de carregamento.

let toastContainer = null
function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.className = 'toast-container'
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

export function showToast(message, type = 'success') {
  const container = getToastContainer()
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`
  container.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add('show'))
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 250)
  }, 3200)
}

export function confirmModal(message, { title = 'Confirmar ação', confirmLabel = 'Excluir', danger = true } = {}) {
  return new Promise(resolve => {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'
    overlay.innerHTML = `
      <div class="modal-box">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="modal-actions">
          <button type="button" class="btn-ghost" data-action="cancel">Cancelar</button>
          <button type="button" class="btn-solid ${danger ? 'btn-danger' : ''}" data-action="confirm">${confirmLabel}</button>
        </div>
      </div>`
    document.body.appendChild(overlay)
    requestAnimationFrame(() => overlay.classList.add('show'))

    function close(result) {
      overlay.classList.remove('show')
      setTimeout(() => overlay.remove(), 200)
      resolve(result)
    }
    overlay.addEventListener('click', e => {
      if (e.target === overlay) close(false)
      const action = e.target.dataset.action
      if (action === 'cancel') close(false)
      if (action === 'confirm') close(true)
    })
  })
}

let loadingOverlay = null
export function setLoading(active, label = 'Salvando...') {
  if (active) {
    if (!loadingOverlay) {
      loadingOverlay = document.createElement('div')
      loadingOverlay.className = 'loading-overlay'
      loadingOverlay.innerHTML = `<div class="loading-box"><span class="spinner"></span><span>${label}</span></div>`
      document.body.appendChild(loadingOverlay)
    }
    loadingOverlay.querySelector('span:last-child').textContent = label
    requestAnimationFrame(() => loadingOverlay.classList.add('show'))
  } else if (loadingOverlay) {
    loadingOverlay.classList.remove('show')
    setTimeout(() => { loadingOverlay?.remove(); loadingOverlay = null }, 200)
  }
}

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
