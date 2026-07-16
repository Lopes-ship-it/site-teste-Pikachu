// Autenticação do painel administrativo, via Firebase Authentication (e-mail/senha).
// Nenhuma senha fica escrita no front-end: o Firebase valida contra a conta criada
// no console do projeto. Veja o README para o passo a passo de criação do usuário admin.

import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase.js'

// O painel usa um "usuário" (ex.: Igorpikachu) só como um apelido amigável.
// Por baixo, o Firebase Auth exige um e-mail — então convertemos:
// "Igorpikachu"  ->  "igorpikachu@barbeariapikachu.admin"
// Esse e-mail (fictício, não precisa existir de verdade) é o que você cadastra
// no Firebase Console ao criar o usuário administrador.
export function usernameToEmail(username) {
  const clean = String(username || '').trim().toLowerCase().replace(/\s+/g, '')
  return `${clean}@barbeariapikachu.admin`
}

export async function login(username, password) {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase não configurado. Configure o .env antes de fazer login (veja o README).')
  }
  const email = usernameToEmail(username)
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function logout() {
  if (!isFirebaseConfigured) return
  await signOut(auth)
}

// Chama callback(user) sempre que o estado de login mudar (null = deslogado).
export function watchAuth(callback) {
  if (!isFirebaseConfigured) { callback(null); return () => {} }
  return onAuthStateChanged(auth, callback)
}
