// Camada de dados: lê/escreve preços, planos e ganhadores no Firestore.
// Usada pelo site público (somente leitura, tempo real) e pelo painel /admin (leitura + escrita).
// Quando o Firebase não está configurado, cai nos dados padrão (src/data/defaultData.js).

import {
  collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, getDocs
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage, isFirebaseConfigured } from './firebase.js'
import { defaultPrices, defaultPlans, defaultWinners } from '../data/defaultData.js'

/* ----------------------------- PREÇOS ----------------------------- */

// callback recebe { pikachu: {services, combos}, equipe: {services, combos} }
export function subscribePrices(callback) {
  callback(defaultPrices) // mostra algo imediatamente

  if (!isFirebaseConfigured) return () => {}

  const result = { pikachu: null, equipe: null }
  const unsubPikachu = onSnapshot(doc(db, 'prices', 'pikachu'), snap => {
    result.pikachu = snap.exists() ? snap.data() : defaultPrices.pikachu
    if (result.equipe) callback({ ...result })
  }, err => console.error('[prices/pikachu]', err))

  const unsubEquipe = onSnapshot(doc(db, 'prices', 'equipe'), snap => {
    result.equipe = snap.exists() ? snap.data() : defaultPrices.equipe
    if (result.pikachu) callback({ ...result })
  }, err => console.error('[prices/equipe]', err))

  return () => { unsubPikachu(); unsubEquipe() }
}

export async function savePrices(tab, data) {
  if (!isFirebaseConfigured) throw new Error('Firebase não configurado. Veja o README.')
  await setDoc(doc(db, 'prices', tab), data)
}

/* ----------------------------- PLANOS ------------------------------ */

export function subscribePlans(callback) {
  callback(defaultPlans)

  if (!isFirebaseConfigured) return () => {}

  const q = query(collection(db, 'plans'), orderBy('order', 'asc'))
  const unsub = onSnapshot(q, snap => {
    if (snap.empty) { callback(defaultPlans); return }
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, err => console.error('[plans]', err))

  return unsub
}

export async function addPlan(planData) {
  if (!isFirebaseConfigured) throw new Error('Firebase não configurado. Veja o README.')
  await addDoc(collection(db, 'plans'), planData)
}

export async function updatePlan(id, planData) {
  if (!isFirebaseConfigured) throw new Error('Firebase não configurado. Veja o README.')
  await updateDoc(doc(db, 'plans', id), planData)
}

export async function deletePlan(id) {
  if (!isFirebaseConfigured) throw new Error('Firebase não configurado. Veja o README.')
  await deleteDoc(doc(db, 'plans', id))
}

/* --------------------------- GANHADORES ----------------------------- */

export function subscribeWinners(callback) {
  callback(defaultWinners)

  if (!isFirebaseConfigured) return () => {}

  const q = query(collection(db, 'winners'), orderBy('position', 'asc'))
  const unsub = onSnapshot(q, snap => {
    if (snap.empty) { callback(defaultWinners); return }
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, err => console.error('[winners]', err))

  return unsub
}

export async function addWinner(winnerData) {
  if (!isFirebaseConfigured) throw new Error('Firebase não configurado. Veja o README.')
  await addDoc(collection(db, 'winners'), winnerData)
}

export async function updateWinner(id, winnerData) {
  if (!isFirebaseConfigured) throw new Error('Firebase não configurado. Veja o README.')
  await updateDoc(doc(db, 'winners', id), winnerData)
}

export async function deleteWinner(id, photoPath) {
  if (!isFirebaseConfigured) throw new Error('Firebase não configurado. Veja o README.')
  await deleteDoc(doc(db, 'winners', id))
  if (photoPath) {
    try { await deleteObject(ref(storage, photoPath)) } catch { /* arquivo já pode não existir, ignora */ }
  }
}

export async function uploadWinnerPhoto(file, winnerId) {
  if (!isFirebaseConfigured) throw new Error('Firebase não configurado. Veja o README.')
  const path = `winners/${winnerId || Date.now()}-${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  return { url, path }
}

/* ------------------------ SEED (dados iniciais) ----------------------- */
// Usado pelo botão "Carregar dados padrão" no Dashboard do admin,
// para popular o Firestore na primeira configuração do projeto.

export async function seedDefaultsIfEmpty() {
  if (!isFirebaseConfigured) throw new Error('Firebase não configurado. Veja o README.')

  const results = { prices: false, plans: false, winners: false }

  const pikachuSnap = await getDocs(query(collection(db, 'prices')))
  if (pikachuSnap.empty) {
    await setDoc(doc(db, 'prices', 'pikachu'), defaultPrices.pikachu)
    await setDoc(doc(db, 'prices', 'equipe'), defaultPrices.equipe)
    results.prices = true
  }

  const plansSnap = await getDocs(collection(db, 'plans'))
  if (plansSnap.empty) {
    for (const plan of defaultPlans) {
      const { id, ...rest } = plan
      await setDoc(doc(db, 'plans', id), rest)
    }
    results.plans = true
  }

  const winnersSnap = await getDocs(collection(db, 'winners'))
  if (winnersSnap.empty) {
    for (const winner of defaultWinners) {
      const { id, ...rest } = winner
      await setDoc(doc(db, 'winners', id), rest)
    }
    results.winners = true
  }

  return results
}
