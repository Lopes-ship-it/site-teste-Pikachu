import { subscribeWinners, addWinner, updateWinner, deleteWinner, uploadWinnerPhoto } from '../../services/data.js'
import { showToast, setLoading, confirmModal, escapeHtml } from '../ui.js'

let winners = []
let unsub = null
let searchTerm = ''
let sortDesc = true

export function renderWinnerEditor(root) {
  root.innerHTML = `<div class="admin-loading">Carregando ganhadores...</div>`
  if (unsub) unsub()
  unsub = subscribeWinners(data => {
    winners = data.slice()
    draw(root)
  })
}

function podiumSlot(pos) {
  return winners.find(w => Number(w.position) === pos) || null
}

function draw(root) {
  root.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-head"><h3>Pódio atual</h3></div>
      <div class="winner-podium-admin">
        ${[1, 2, 3].map(pos => {
          const w = podiumSlot(pos)
          return `
          <div class="winner-slot-card">
            <div class="winner-slot-photo">
              ${w?.photoUrl ? `<img src="${escapeHtml(w.photoUrl)}" alt="${escapeHtml(w.name || '')}">` : `<span>Top ${pos}</span>`}
            </div>
            <p>${w?.name ? escapeHtml(w.name) : 'Vazio'}</p>
            <button type="button" class="btn-ghost btn-sm" data-pos="${pos}">${w ? 'Editar' : 'Definir ganhador'}</button>
          </div>`
        }).join('')}
      </div>
    </div>

    <div class="admin-card">
      <div class="admin-card-head admin-card-head--top">
        <h3>Histórico de ganhadores</h3>
        <button type="button" class="btn-solid btn-sm" id="newWinnerBtn">+ Adicionar ganhador</button>
      </div>
      <div class="winner-filters">
        <input type="search" id="winnerSearch" placeholder="Pesquisar por nome..." value="${escapeHtml(searchTerm)}">
        <button type="button" class="btn-ghost btn-sm" id="sortBtn">Data ${sortDesc ? '↓' : '↑'}</button>
      </div>
      <div class="winner-history" id="winnerHistory"></div>
    </div>
  `

  root.querySelectorAll('[data-pos]').forEach(btn => {
    btn.addEventListener('click', () => openWinnerModal(podiumSlot(Number(btn.dataset.pos)), Number(btn.dataset.pos)))
  })
  root.querySelector('#newWinnerBtn').addEventListener('click', () => openWinnerModal(null, null))
  root.querySelector('#winnerSearch').addEventListener('input', e => {
    searchTerm = e.target.value
    drawHistory(root)
  })
  root.querySelector('#sortBtn').addEventListener('click', () => {
    sortDesc = !sortDesc
    draw(root)
  })

  drawHistory(root)
}

function drawHistory(root) {
  const wrap = root.querySelector('#winnerHistory')
  let list = winners.filter(w => w.name && w.name.toLowerCase().includes(searchTerm.toLowerCase()))
  list = list.sort((a, b) => {
    const da = a.date || ''
    const db = b.date || ''
    return sortDesc ? db.localeCompare(da) : da.localeCompare(db)
  })

  wrap.innerHTML = list.map(w => `
    <div class="winner-history-row" data-id="${w.id}">
      <div class="winner-history-photo">
        ${w.photoUrl ? `<img src="${escapeHtml(w.photoUrl)}" alt="">` : ''}
      </div>
      <div class="winner-history-info">
        <strong>${escapeHtml(w.name || '(sem nome)')}</strong>
        <span>${w.date ? formatDate(w.date) : 'sem data'} ${w.position ? `· Top ${w.position}` : ''}</span>
      </div>
      <div class="winner-history-actions">
        <button type="button" class="btn-ghost btn-sm" data-action="edit">Editar</button>
        <button type="button" class="btn-ghost btn-sm btn-danger-text" data-action="delete">Excluir</button>
      </div>
    </div>
  `).join('') || '<p class="admin-empty">Nenhum ganhador encontrado.</p>'

  wrap.querySelectorAll('.winner-history-row').forEach(rowEl => {
    const id = rowEl.dataset.id
    const w = winners.find(x => x.id === id)
    rowEl.querySelector('[data-action="edit"]').addEventListener('click', () => openWinnerModal(w, w.position || null))
    rowEl.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      const ok = await confirmModal(`Excluir "${w.name || 'este ganhador'}" permanentemente?`, { confirmLabel: 'Excluir' })
      if (!ok) return
      setLoading(true)
      try {
        await deleteWinner(id, w.photoPath)
        showToast('Ganhador excluído.', 'success')
      } catch (err) {
        showToast(err.message || 'Erro ao excluir.', 'error')
      } finally {
        setLoading(false)
      }
    })
  })
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function openWinnerModal(winner, presetPosition) {
  const isNew = !winner
  const data = winner ? { ...winner } : { name: '', date: '', position: presetPosition || '', photoUrl: '', photoPath: '' }
  let pendingFile = null

  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>${isNew ? 'Adicionar ganhador' : 'Editar ganhador'}</h3>
      <form id="winnerForm" class="admin-form">
        <div class="field">
          <span>Foto</span>
          <div class="photo-upload">
            <div class="photo-preview" id="photoPreview">
              ${data.photoUrl ? `<img src="${escapeHtml(data.photoUrl)}" alt="">` : '<span>Sem foto</span>'}
            </div>
            <label class="btn-ghost btn-sm photo-upload-btn">
              Escolher imagem
              <input type="file" accept="image/*" id="photoInput" hidden>
            </label>
          </div>
        </div>

        <label class="field">
          <span>Nome do ganhador</span>
          <input type="text" name="name" value="${escapeHtml(data.name)}" placeholder="Nome completo" required>
        </label>

        <div class="form-grid-2">
          <label class="field">
            <span>Data do sorteio</span>
            <input type="date" name="date" value="${escapeHtml(data.date || '')}">
          </label>
          <label class="field">
            <span>Posição no pódio</span>
            <select name="position">
              <option value="">Sem pódio (só histórico)</option>
              <option value="1" ${String(data.position) === '1' ? 'selected' : ''}>Top 1</option>
              <option value="2" ${String(data.position) === '2' ? 'selected' : ''}>Top 2</option>
              <option value="3" ${String(data.position) === '3' ? 'selected' : ''}>Top 3</option>
            </select>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-ghost" data-action="cancel">Cancelar</button>
          <button type="submit" class="btn-solid">${isNew ? 'Adicionar' : 'Salvar alterações'}</button>
        </div>
      </form>
    </div>
  `
  document.body.appendChild(overlay)
  requestAnimationFrame(() => overlay.classList.add('show'))

  const photoInput = overlay.querySelector('#photoInput')
  const preview = overlay.querySelector('#photoPreview')
  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0]
    if (!file) return
    pendingFile = file
    preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="">`
  })

  function close() {
    overlay.classList.remove('show')
    setTimeout(() => overlay.remove(), 200)
  }
  overlay.addEventListener('click', e => { if (e.target === overlay) close() })
  overlay.querySelector('[data-action="cancel"]').addEventListener('click', close)

  overlay.querySelector('#winnerForm').addEventListener('submit', async e => {
    e.preventDefault()
    const form = e.target
    const payload = {
      name: form.name.value.trim(),
      date: form.date.value || '',
      position: form.position.value ? Number(form.position.value) : null,
      photoUrl: data.photoUrl || '',
      photoPath: data.photoPath || ''
    }
    if (!payload.name) { showToast('Informe o nome do ganhador.', 'error'); return }

    setLoading(true, pendingFile ? 'Enviando foto...' : 'Salvando...')
    try {
      // Se outro ganhador já ocupa a posição escolhida, libera a posição dele (vira histórico).
      if (payload.position) {
        const occupied = winners.find(w => Number(w.position) === payload.position && w.id !== winner?.id)
        if (occupied) await updateWinner(occupied.id, { position: null })
      }

      if (pendingFile) {
        const { url, path } = await uploadWinnerPhoto(pendingFile, winner?.id)
        payload.photoUrl = url
        payload.photoPath = path
      }

      if (isNew) { await addWinner(payload) } else { await updateWinner(winner.id, payload) }
      showToast(isNew ? 'Ganhador adicionado!' : 'Ganhador atualizado!', 'success')
      close()
    } catch (err) {
      showToast(err.message || 'Erro ao salvar.', 'error')
    } finally {
      setLoading(false)
    }
  })
}
