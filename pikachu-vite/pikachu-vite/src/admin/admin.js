import './admin.css'
import { watchAuth } from '../services/auth.js'
import { renderLogin } from './pages/Login.js'
import { renderAdminLayout } from './components/AdminLayout.js'

const root = document.getElementById('admin-root')

watchAuth(user => {
  if (user) {
    root.className = 'admin-shell'
    const displayName = user.email?.split('@')[0] || 'Administrador'
    renderAdminLayout(root, { user: capitalize(displayName) })
  } else {
    root.className = 'admin-shell admin-shell--login'
    renderLogin(root)
  }
})

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
