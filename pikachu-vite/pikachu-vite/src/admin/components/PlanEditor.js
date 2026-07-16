import { subscribePlans, addPlan, updatePlan, deletePlan } from '../../services/data.js'
import { showToast, setLoading, confirmModal, escapeHtml } from '../ui.js'
import { maskCurrencyInput } from '../../utils/currency.js'

let plans = []
let unsub = null

export function renderPlanEditor(root) {
  root.innerHTML = `<div class="admin-loading">Carregando planos...</div>`
  if (unsub) unsub()
  unsub = subscribePlans(data => {
    plans = clone(data)
    draw(root)
  })
}

function clone(arr) { return JSON.parse(JSON.stringify(arr || [])) }

function draw(root) {
  root.innerHTML = `
    <div class="admin-card-head admin-card-head--top">
      <h3>Planos cadastrados</h3>
      <button type="button" class="btn-solid btn-sm" id="newPlanBtn">+ Novo plano</button>
    </div>
    <div class="plan-admin-grid">
      ${plans.map(plan => `
        <div class="plan-admin-card ${plan.featured ? 'featured' : ''}" data-id="${plan.id}">
          ${plan.featured ? `<span class="plan-admin-badge">${escapeHtml(plan.badge || 'Destaque')}</span>` : ''}
          <span class="plan-admin-eyebrow">${escapeHtml(plan.eyebrow || '')}</span>
          <h4>${escapeHtml(plan.name || '(sem nome)')}</h4>
          <p class="plan-admin-day">${escapeHtml(plan.day || '')}</p>
          <p class="plan-admin-price">R$ ${escapeHtml(plan.newPrice || '0,00')} <span>de R$ ${escapeHtml(plan.oldPrice || '')}</span></p>
          <div class="plan-admin-actions">
            <button type="button" class="btn-ghost btn-sm" data-action="edit">Editar</button>
            <button type="button" class="btn-ghost btn-sm btn-danger-text" data-action="delete">Excluir</button>
          </div>
        </div>
      `).join('') || '<p class="admin-empty">Nenhum plano cadastrado ainda. Clique em "Novo plano" ou carregue os dados padrão no Dashboard.</p>'}
    </div>
  `

  root.querySelector('#newPlanBtn').addEventListener('click', () => openPlanModal(null))
  root.querySelectorAll('.plan-admin-card').forEach(card => {
    const id = card.dataset.id
    card.querySelector('[data-action="edit"]').addEventListener('click', () => {
      openPlanModal(plans.find(p => p.id === id))
    })
    card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      const ok = await confirmModal('Excluir este plano permanentemente?', { confirmLabel: 'Excluir plano' })
      if (!ok) return
      setLoading(true)
      try {
        await deletePlan(id)
        showToast('Plano excluído.', 'success')
      } catch (err) {
        showToast(err.message || 'Erro ao excluir.', 'error')
      } finally {
        setLoading(false)
      }
    })
  })
}

function openPlanModal(plan) {
  const isNew = !plan
  const data = plan ? clone(plan) : {
    eyebrow: 'Assinatura', name: '', day: '', included: [''], bonusTags: [''],
    oldPrice: '', newPrice: '', featured: false, badge: '', order: (plans.length + 1) * 10
  }

  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.innerHTML = `
    <div class="modal-box modal-box--wide">
      <h3>${isNew ? 'Novo plano' : 'Editar plano'}</h3>
      <form id="planForm" class="admin-form">
        <div class="form-grid-2">
          <label class="field">
            <span>Tipo</span>
            <select name="eyebrow">
              <option value="Assinatura" ${data.eyebrow === 'Assinatura' ? 'selected' : ''}>Assinatura</option>
              <option value="Plano" ${data.eyebrow === 'Plano' ? 'selected' : ''}>Plano</option>
            </select>
          </label>
          <label class="field">
            <span>Nome do plano</span>
            <input type="text" name="name" value="${escapeHtml(data.name)}" placeholder="Ex.: Cabelo" required>
          </label>
        </div>

        <label class="field">
          <span>Dias válidos</span>
          <input type="text" name="day" value="${escapeHtml(data.day)}" placeholder="Ex.: Quarta-feira">
        </label>

        <div class="field">
          <span>Incluso (o que o plano oferece)</span>
          <div id="includedList" class="dynamic-list"></div>
          <button type="button" class="btn-ghost btn-sm" id="addIncluded">+ Adicionar item</button>
        </div>

        <div class="field">
          <span>Tags de bônus / vantagens</span>
          <div id="bonusList" class="dynamic-list"></div>
          <button type="button" class="btn-ghost btn-sm" id="addBonus">+ Adicionar tag</button>
        </div>

        <div class="form-grid-2">
          <label class="field">
            <span>Valor de (preço cheio)</span>
            <div class="row-price"><span>R$</span><input type="text" name="oldPrice" inputmode="numeric" value="${escapeHtml(data.oldPrice)}" placeholder="0,00"></div>
          </label>
          <label class="field">
            <span>Valor por (com desconto)</span>
            <div class="row-price"><span>R$</span><input type="text" name="newPrice" inputmode="numeric" value="${escapeHtml(data.newPrice)}" placeholder="0,00"></div>
          </label>
        </div>

        <div class="form-grid-2">
          <label class="field">
            <span>Ordem no carrossel</span>
            <input type="number" name="order" value="${data.order ?? 0}" min="0">
          </label>
          <label class="field field-checkbox">
            <input type="checkbox" name="featured" ${data.featured ? 'checked' : ''}>
            <span>Destacar como plano recomendado</span>
          </label>
        </div>

        <label class="field" id="badgeField" style="${data.featured ? '' : 'display:none;'}">
          <span>Selo do destaque</span>
          <input type="text" name="badge" value="${escapeHtml(data.badge || '')}" placeholder="Ex.: Mais completo">
        </label>

        <div class="modal-actions">
          <button type="button" class="btn-ghost" data-action="cancel">Cancelar</button>
          <button type="submit" class="btn-solid">${isNew ? 'Criar plano' : 'Salvar alterações'}</button>
        </div>
      </form>
    </div>
  `
  document.body.appendChild(overlay)
  requestAnimationFrame(() => overlay.classList.add('show'))

  const includedListEl = overlay.querySelector('#includedList')
  const bonusListEl = overlay.querySelector('#bonusList')
  renderDynamicList(includedListEl, data.included.length ? data.included : [''])
  renderDynamicList(bonusListEl, data.bonusTags.length ? data.bonusTags : [''])

  overlay.querySelector('#addIncluded').addEventListener('click', () => addDynamicItem(includedListEl))
  overlay.querySelector('#addBonus').addEventListener('click', () => addDynamicItem(bonusListEl))

  const featuredCheck = overlay.querySelector('[name="featured"]')
  const badgeField = overlay.querySelector('#badgeField')
  featuredCheck.addEventListener('change', () => { badgeField.style.display = featuredCheck.checked ? '' : 'none' })

  overlay.querySelectorAll('.row-price input').forEach(maskCurrencyInput)

  function close() {
    overlay.classList.remove('show')
    setTimeout(() => overlay.remove(), 200)
  }
  overlay.addEventListener('click', e => { if (e.target === overlay) close() })
  overlay.querySelector('[data-action="cancel"]').addEventListener('click', close)

  overlay.querySelector('#planForm').addEventListener('submit', async e => {
    e.preventDefault()
    const form = e.target
    const payload = {
      eyebrow: form.eyebrow.value,
      name: form.name.value.trim(),
      day: form.day.value.trim(),
      included: readDynamicList(includedListEl),
      bonusTags: readDynamicList(bonusListEl),
      oldPrice: form.oldPrice.value.trim(),
      newPrice: form.newPrice.value.trim(),
      order: Number(form.order.value) || 0,
      featured: form.featured.checked,
      badge: form.featured.checked ? form.badge.value.trim() : ''
    }
    if (!payload.name) { showToast('Dê um nome ao plano.', 'error'); return }

    setLoading(true)
    try {
      if (isNew) { await addPlan(payload) } else { await updatePlan(plan.id, payload) }
      showToast(isNew ? 'Plano criado!' : 'Plano atualizado!', 'success')
      close()
    } catch (err) {
      showToast(err.message || 'Erro ao salvar.', 'error')
    } finally {
      setLoading(false)
    }
  })
}

function renderDynamicList(container, items) {
  container.innerHTML = items.map(val => `
    <div class="dynamic-item">
      <input type="text" value="${escapeHtml(val)}" placeholder="Descreva o item...">
      <button type="button" class="row-remove" title="Remover">✕</button>
    </div>
  `).join('')
  wireDynamicList(container)
}

function addDynamicItem(container) {
  const div = document.createElement('div')
  div.className = 'dynamic-item'
  div.innerHTML = `<input type="text" value="" placeholder="Descreva o item..."><button type="button" class="row-remove" title="Remover">✕</button>`
  container.appendChild(div)
  wireDynamicList(container)
  div.querySelector('input').focus()
}

function wireDynamicList(container) {
  container.querySelectorAll('.row-remove').forEach(btn => {
    btn.onclick = () => {
      if (container.children.length > 1) btn.closest('.dynamic-item').remove()
      else btn.closest('.dynamic-item').querySelector('input').value = ''
    }
  })
}

function readDynamicList(container) {
  return Array.from(container.querySelectorAll('input'))
    .map(i => i.value.trim())
    .filter(Boolean)
}
