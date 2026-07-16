import { login } from '../../services/auth.js'
import { showToast, setLoading } from '../ui.js'
import { isFirebaseConfigured } from '../../services/firebase.js'

export function renderLogin(root) {
  root.innerHTML = `
    <div class="admin-login">
      <form class="login-card" id="loginForm" novalidate>
        <img src="/img/logo.png" alt="Barbearia Pikachu" class="login-logo">
        <h1>Painel Administrativo</h1>
        <p class="login-sub">Barbearia Pikachu</p>

        ${!isFirebaseConfigured ? `
          <div class="login-warning">
            Firebase não configurado. Configure as variáveis de ambiente
            (arquivo <code>.env</code>) para poder entrar. Veja o README.
          </div>
        ` : ''}

        <label class="field">
          <span>Usuário</span>
          <input type="text" name="username" autocomplete="username" placeholder="Igorpikachu" required ${!isFirebaseConfigured ? 'disabled' : ''}>
        </label>
        <label class="field">
          <span>Senha</span>
          <input type="password" name="password" autocomplete="current-password" placeholder="••••••••" required ${!isFirebaseConfigured ? 'disabled' : ''}>
        </label>

        <button type="submit" class="btn-solid btn-block" ${!isFirebaseConfigured ? 'disabled' : ''}>Entrar</button>
        <p class="login-error" id="loginError" hidden></p>
      </form>
    </div>
  `

  const form = root.querySelector('#loginForm')
  const errorEl = root.querySelector('#loginError')

  form.addEventListener('submit', async e => {
    e.preventDefault()
    errorEl.hidden = true
    const username = form.username.value.trim()
    const password = form.password.value

    setLoading(true, 'Entrando...')
    try {
      await login(username, password)
      showToast('Login realizado com sucesso!', 'success')
      // onAuthStateChanged (em admin.js) cuida de trocar para o Dashboard
    } catch (err) {
      const msg = friendlyAuthError(err)
      errorEl.textContent = msg
      errorEl.hidden = false
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  })
}

function friendlyAuthError(err) {
  const code = err?.code || ''
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'Usuário ou senha incorretos.'
  }
  if (code.includes('too-many-requests')) {
    return 'Muitas tentativas. Aguarde um pouco e tente novamente.'
  }
  if (code.includes('network')) {
    return 'Falha de conexão. Verifique sua internet.'
  }
  return err?.message || 'Não foi possível entrar. Tente novamente.'
}
