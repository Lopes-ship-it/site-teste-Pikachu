import './style.css'
import { subscribePrices, subscribePlans, subscribeWinners } from './services/data.js'

/* ------------------------------------------------------------------ */
/* NAV                                                                  */
/* ------------------------------------------------------------------ */

let lastY = window.scrollY
const nav = document.querySelector('.nav')
window.addEventListener('scroll', () => {
  const y = window.scrollY
  if (y > lastY && y > 120) { nav.style.transform = 'translateY(-100%)' }
  else { nav.style.transform = 'translateY(0)' }
  lastY = y
})

const burger = document.getElementById('navBurger')
const mobileMenu = document.getElementById('mobileMenu')
burger.addEventListener('click', () => {
  burger.classList.toggle('open')
  mobileMenu.classList.toggle('open')
})
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open')
    mobileMenu.classList.remove('open')
  })
})

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.price-panel').forEach(p => p.classList.remove('active'))
    btn.classList.add('active')
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active')
  })
})

/* ------------------------------------------------------------------ */
/* PREÇOS — renderizado a partir do Firestore (coleção "prices")        */
/* ------------------------------------------------------------------ */

function renderPriceRows(tbody, rows) {
  tbody.innerHTML = rows.map((row, i) => `
    <tr class="${i % 2 === 1 ? 'hl' : ''}">
      <td>${escapeHtml(row.name)}${row.note ? `<span class="price-note">${escapeHtml(row.note)}</span>` : ''}</td>
      <td>${row.from ? '<span class="price-from">a partir de</span>' : ''}R$ ${escapeHtml(row.price)}</td>
    </tr>
  `).join('')
}

function renderPrices(data) {
  if (data.pikachu) {
    renderPriceRows(document.getElementById('table-pikachu-services'), data.pikachu.services || [])
    renderPriceRows(document.getElementById('table-pikachu-combos'), data.pikachu.combos || [])
  }
  if (data.equipe) {
    renderPriceRows(document.getElementById('table-equipe-services'), data.equipe.services || [])
    renderPriceRows(document.getElementById('table-equipe-combos'), data.equipe.combos || [])
  }
}

subscribePrices(renderPrices)

/* ------------------------------------------------------------------ */
/* PLANOS — carrossel automático renderizado a partir do Firestore      */
/* (coleção "plans")                                                   */
/* ------------------------------------------------------------------ */

const planTrack = document.getElementById('planTrack')
const planDotsWrap = document.getElementById('planDots')
let planAutoplay = null
let planCurrent = 0

function whatsappPlanLink(planName) {
  const text = encodeURIComponent(`Olá, quero assinar o plano ${planName}.`)
  return `https://api.whatsapp.com/send/?phone=5538991625742&text=${text}&type=phone_number&app_absent=0`
}

function renderPlans(plans) {
  if (!plans || !plans.length) return

  planTrack.innerHTML = plans.map(plan => {
    const [newInt, newCents] = String(plan.newPrice || '0,00').split(',')
    return `
    <div class="plan-slide">
      <div class="plan-card ${plan.featured ? 'featured' : ''}">
        ${plan.featured && plan.badge ? `<span class="plan-badge">${escapeHtml(plan.badge)}</span>` : ''}
        <span class="plan-eyebrow">${escapeHtml(plan.eyebrow || '')}</span>
        <h3 class="plan-name">${escapeHtml(plan.name || '')}</h3>
        <span class="plan-day">${escapeHtml(plan.day || '')}</span>
        <div class="plan-section-label">Incluso</div>
        <ul class="plan-list">
          ${(plan.included || []).map(item => `<li>${item}</li>`).join('')}
        </ul>
        <div class="plan-tags">
          ${(plan.bonusTags || []).map(tag => `<span class="plan-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="plan-price-row">
          <span class="plan-old">de R$ ${escapeHtml(plan.oldPrice || '')}</span>
          <span class="plan-new">R$ ${escapeHtml(newInt || '0')}<small>,${escapeHtml(newCents || '00')}</small></span>
        </div>
        <a class="plan-cta" href="${whatsappPlanLink(plan.name || '')}" target="_blank" rel="noopener">Quero assinar</a>
      </div>
    </div>`
  }).join('')

  setupPlanCarousel()
}

function setupPlanCarousel() {
  clearInterval(planAutoplay)
  const slides = planTrack.querySelectorAll('.plan-slide')
  planDotsWrap.innerHTML = ''
  planCurrent = 0

  slides.forEach((_, i) => {
    const d = document.createElement('button')
    d.className = 'plan-dot' + (i === 0 ? ' active' : '')
    d.addEventListener('click', () => goToPlan(i))
    planDotsWrap.appendChild(d)
  })

  if (slides.length <= 1) return

  planAutoplay = setInterval(() => {
    goToPlan((planCurrent + 1) % slides.length)
  }, 4500)
}

function goToPlan(i) {
  const slides = planTrack.querySelectorAll('.plan-slide')
  const dots = planDotsWrap.querySelectorAll('.plan-dot')
  planCurrent = i
  planTrack.style.transform = `translateX(-${i * 100}%)`
  dots.forEach((d, idx) => d.classList.toggle('active', idx === i))
}

const carouselEl = document.querySelector('.plan-carousel')
carouselEl.addEventListener('mouseenter', () => clearInterval(planAutoplay))
carouselEl.addEventListener('mouseleave', () => {
  const slides = planTrack.querySelectorAll('.plan-slide')
  if (slides.length <= 1) return
  clearInterval(planAutoplay)
  planAutoplay = setInterval(() => goToPlan((planCurrent + 1) % slides.length), 4500)
})

subscribePlans(renderPlans)

/* ------------------------------------------------------------------ */
/* SORTEIO — pódio renderizado a partir do Firestore (coleção "winners")*/
/* ------------------------------------------------------------------ */

const personIcon = (size = 36) => `
  <svg class="winner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:${size}px;height:${size}px;">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7"/>
  </svg>`

function renderWinners(winners) {
  const wrap = document.querySelector('.winners')
  if (!wrap) return

  const byPos = { 1: null, 2: null, 3: null }
  winners.forEach(w => { if (w.position >= 1 && w.position <= 3) byPos[w.position] = w })

  // ordem visual do pódio: 3, 1, 2 (o 1º lugar fica maior, no centro via CSS order)
  const order = [3, 1, 2]
  wrap.innerHTML = order.map(pos => {
    const w = byPos[pos]
    const hasWinner = w && w.name
    const iconSize = pos === 1 ? 46 : 36
    const photo = hasWinner && w.photoUrl
      ? `<img src="${escapeHtml(w.photoUrl)}" alt="${escapeHtml(w.name)}" style="width:100%;height:100%;object-fit:cover;object-position:center 15%;border-radius:50%;">`
      : personIcon(iconSize)
    return `
      <div class="winner">
        <div class="winner-ring">
          ${photo}
          <span class="medal">${pos}</span>
        </div>
        <div class="winner-place">Top ${pos}</div>
        <div class="winner-name">${hasWinner ? escapeHtml(w.name) : 'Aguardando sorteio'}</div>
      </div>`
  }).join('')
}

subscribeWinners(renderWinners)

/* ------------------------------------------------------------------ */
/* util                                                                 */
/* ------------------------------------------------------------------ */

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
