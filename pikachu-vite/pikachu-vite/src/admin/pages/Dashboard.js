import { subscribePrices, subscribePlans, subscribeWinners, seedDefaultsIfEmpty } from '../../services/data.js'
import { showToast, setLoading } from '../ui.js'
import { isFirebaseConfigured } from '../../services/firebase.js'

export function renderDashboard(root, { user }) {
  root.innerHTML = `
    ${!isFirebaseConfigured ? `
      <div class="login-warning" style="margin-bottom:24px;">
        Firebase não configurado — os números abaixo mostram apenas os dados padrão locais.
        Configure o <code>.env</code> para sincronizar de verdade com o Firestore (veja o README).
      </div>
    ` : ''}

    <div class="dash-grid">
      <div class="dash-card">
        <span class="dash-card-label">Serviços (Pikachu)</span>
        <span class="dash-card-value" id="statServicesPikachu">—</span>
      </div>
      <div class="dash-card">
        <span class="dash-card-label">Serviços (Equipe)</span>
        <span class="dash-card-value" id="statServicesEquipe">—</span>
      </div>
      <div class="dash-card">
        <span class="dash-card-label">Planos ativos</span>
        <span class="dash-card-value" id="statPlans">—</span>
      </div>
      <div class="dash-card">
        <span class="dash-card-label">Ganhadores no pódio</span>
        <span class="dash-card-value" id="statWinners">—</span>
      </div>
    </div>

    <div class="admin-card">
      <div class="admin-card-head"><h3>Bem-vindo, ${user}</h3></div>
      <p class="dash-welcome-text">
        Use o menu ao lado para editar a tabela de preços, os planos de assinatura e os ganhadores
        do sorteio mensal. Toda alteração salva aqui aparece automaticamente no site, em tempo real.
      </p>
      ${isFirebaseConfigured ? `
        <button type="button" class="btn-ghost btn-sm" id="seedBtn">Carregar dados padrão no Firestore</button>
        <p class="dash-hint">Use isso apenas na primeira configuração do projeto, se as coleções ainda estiverem vazias.</p>
      ` : ''}
    </div>
  `

  const unsubP = subscribePrices(data => {
    root.querySelector('#statServicesPikachu').textContent = data.pikachu?.services?.length ?? 0
    root.querySelector('#statServicesEquipe').textContent = data.equipe?.services?.length ?? 0
  })
  const unsubPl = subscribePlans(data => {
    root.querySelector('#statPlans').textContent = data.length
  })
  const unsubW = subscribeWinners(data => {
    root.querySelector('#statWinners').textContent = data.filter(w => w.position && w.name).length + ' / 3'
  })

  // guarda para limpar os listeners quando sair da tela (evita vazamento de memória)
  root._cleanup = () => { unsubP(); unsubPl(); unsubW() }

  const seedBtn = root.querySelector('#seedBtn')
  if (seedBtn) {
    seedBtn.addEventListener('click', async () => {
      setLoading(true, 'Carregando dados padrão...')
      try {
        const result = await seedDefaultsIfEmpty()
        const loaded = Object.entries(result).filter(([, v]) => v).map(([k]) => k)
        showToast(loaded.length ? `Dados carregados: ${loaded.join(', ')}` : 'Já havia dados salvos — nada foi sobrescrito.', 'success')
      } catch (err) {
        showToast(err.message || 'Erro ao carregar dados padrão.', 'error')
      } finally {
        setLoading(false)
      }
    })
  }
}
