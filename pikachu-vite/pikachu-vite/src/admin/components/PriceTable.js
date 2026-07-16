import { subscribePrices, savePrices } from '../../services/data.js'
import { showToast, setLoading, confirmModal, escapeHtml } from '../ui.js'
import { maskCurrencyInput } from '../../utils/currency.js'

let state = { pikachu: null, equipe: null }
let activeTab = 'pikachu'

export function renderPriceTable(root) {
  root.innerHTML = `<div class="admin-loading">Carregando tabela de preços...</div>`

  // Pega o valor atual uma única vez (edição fica só local até clicar em Salvar).
  let received = false
  const unsubscribe = subscribePrices(data => {
    if (!received) {
      received = true
      state = { pikachu: clone(data.pikachu), equipe: clone(data.equipe) }
      draw(root)
    }
  })
  // Agenda o cancelamento da inscrição para o próximo microtask: funciona
  // tanto se o primeiro valor chegar de forma síncrona quanto assíncrona.
  Promise.resolve().then(() => unsubscribe())
}

function clone(obj) { return JSON.parse(JSON.stringify(obj || { services: [], combos: [] })) }

function draw(root) {
  const data = state[activeTab]

  root.innerHTML = `
    <div class="admin-tabs">
      <button type="button" class="admin-tab ${activeTab === 'pikachu' ? 'active' : ''}" data-tab="pikachu">Com o Pikachu</button>
      <button type="button" class="admin-tab ${activeTab === 'equipe' ? 'active' : ''}" data-tab="equipe">Com a Equipe</button>
    </div>

    <div class="admin-card">
      <div class="admin-card-head">
        <h3>Serviços</h3>
        <button type="button" class="btn-ghost btn-sm" id="addServiceBtn">+ Adicionar serviço</button>
      </div>
      <div class="editable-rows" id="servicesRows"></div>
    </div>

    <div class="admin-card">
      <div class="admin-card-head">
        <h3>Combos</h3>
        <button type="button" class="btn-ghost btn-sm" id="addComboBtn">+ Adicionar combo</button>
      </div>
      <div class="editable-rows" id="combosRows"></div>
    </div>

    <div class="admin-save-bar">
      <button type="button" class="btn-solid" id="savePricesBtn">Salvar alterações</button>
    </div>
  `

  root.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', () => { activeTab = btn.dataset.tab; draw(root) })
  })

  drawServiceRows(root, data.services)
  drawComboRows(root, data.combos)

  root.querySelector('#addServiceBtn').addEventListener('click', () => {
    data.services.push({ id: 'srv-' + Date.now(), name: '', note: '', price: '0,00', from: false })
    drawServiceRows(root, data.services)
  })
  root.querySelector('#addComboBtn').addEventListener('click', () => {
    data.combos.push({ id: 'combo-' + Date.now(), name: '', price: '0,00' })
    drawComboRows(root, data.combos)
  })

  root.querySelector('#savePricesBtn').addEventListener('click', async () => {
    setLoading(true)
    try {
      await savePrices(activeTab, state[activeTab])
      showToast('Tabela de preços atualizada!', 'success')
    } catch (err) {
      showToast(err.message || 'Erro ao salvar.', 'error')
    } finally {
      setLoading(false)
    }
  })
}

function drawServiceRows(root, services) {
  const wrap = root.querySelector('#servicesRows')
  wrap.innerHTML = services.map((row, i) => `
    <div class="editable-row" data-i="${i}">
      <input type="text" class="row-name" placeholder="Nome do serviço" value="${escapeHtml(row.name)}">
      <input type="text" class="row-note" placeholder="Observação (opcional)" value="${escapeHtml(row.note || '')}">
      <label class="row-from">
        <input type="checkbox" class="row-from-check" ${row.from ? 'checked' : ''}>
        <span>a partir de</span>
      </label>
      <div class="row-price">
        <span>R$</span>
        <input type="text" class="row-price-input" inputmode="numeric" placeholder="0,00" value="${escapeHtml(row.price)}">
      </div>
      <button type="button" class="row-remove" title="Remover">✕</button>
    </div>
  `).join('') || `<p class="admin-empty">Nenhum serviço cadastrado.</p>`

  wireRows(wrap, services, () => drawServiceRows(root, services))
}

function drawComboRows(root, combos) {
  const wrap = root.querySelector('#combosRows')
  wrap.innerHTML = combos.map((row, i) => `
    <div class="editable-row" data-i="${i}">
      <input type="text" class="row-name" placeholder="Nome do combo" value="${escapeHtml(row.name)}" style="flex:2;">
      <div class="row-price">
        <span>R$</span>
        <input type="text" class="row-price-input" inputmode="numeric" placeholder="0,00" value="${escapeHtml(row.price)}">
      </div>
      <button type="button" class="row-remove" title="Remover">✕</button>
    </div>
  `).join('') || `<p class="admin-empty">Nenhum combo cadastrado.</p>`

  wireRows(wrap, combos, () => drawComboRows(root, combos))
}

function wireRows(wrap, arr, redraw) {
  wrap.querySelectorAll('.editable-row').forEach(rowEl => {
    const i = Number(rowEl.dataset.i)
    const nameInput = rowEl.querySelector('.row-name')
    const noteInput = rowEl.querySelector('.row-note')
    const fromCheck = rowEl.querySelector('.row-from-check')
    const priceInput = rowEl.querySelector('.row-price-input')

    nameInput.addEventListener('input', () => { arr[i].name = nameInput.value })
    if (noteInput) noteInput.addEventListener('input', () => { arr[i].note = noteInput.value })
    if (fromCheck) fromCheck.addEventListener('change', () => { arr[i].from = fromCheck.checked })
    maskCurrencyInput(priceInput)
    priceInput.addEventListener('input', () => { arr[i].price = priceInput.value })

    rowEl.querySelector('.row-remove').addEventListener('click', async () => {
      const ok = await confirmModal('Remover este item da tabela?', { confirmLabel: 'Remover' })
      if (!ok) return
      arr.splice(i, 1)
      redraw()
    })
  })
}
