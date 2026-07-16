// Inicialização central do Firebase.
// Todas as chaves vêm de variáveis de ambiente (nunca fique com chaves fixas no código).
// Veja o README para o passo a passo de criação do projeto Firebase e do arquivo .env.

import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Se as variáveis de ambiente não estiverem configuradas, o site continua funcionando
// (mostra os dados padrão de src/data/defaultData.js), só não sincroniza com o painel.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
)

let app = null
let db = null
let auth = null
let storage = null

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
  storage = getStorage(app)
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '[Firebase] Variáveis de ambiente não configuradas — usando dados padrão (somente leitura, sem sincronização). ' +
    'Veja o README para configurar o .env.'
  )
}

export { app, db, auth, storage }
