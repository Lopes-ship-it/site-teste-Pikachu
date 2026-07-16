// Dados padrão (fallback).
// Usados enquanto o Firestore ainda não respondeu, quando o Firebase não está
// configurado (.env vazio) ou como referência para popular o banco pela primeira vez.
// O painel /admin escreve no Firestore; o site público lê de lá em tempo real.
// Se o Firestore estiver vazio, tanto o site quanto o admin caem nesses valores.

export const defaultPrices = {
  pikachu: {
    services: [
      { id: 'barba-express', name: 'Barba express', note: 'só maquininha', price: '15,00', from: false },
      { id: 'tinta-spray', name: 'Tinta spray color', note: '', price: '15,00', from: false },
      { id: 'hidratacao', name: 'Hidratação', note: '', price: '30,00', from: true },
      { id: 'higienizacao', name: 'Higienização de cabelo', note: '', price: '20,00', from: true },
      { id: 'selagem', name: 'Selagem / progressiva', note: '', price: '85,00', from: true },
      { id: 'mascara-negra', name: 'Máscara negra', note: '', price: '25,00', from: false },
      { id: 'pigmentacao', name: 'Pigmentação', note: '', price: '23,00', from: false },
      { id: 'platinado', name: 'Platinado', note: '', price: '80,00', from: true },
      { id: 'luzes', name: 'Luzes', note: '', price: '60,00', from: true },
      { id: 'barba', name: 'Barba', note: '', price: '35,00', from: false },
      { id: 'cabelo', name: 'Cabelo', note: '', price: '40,00', from: false },
      { id: 'acabamento', name: 'Acabamento', note: 'pezinho', price: '15,00', from: false },
      { id: 'sobrancelha-navalha', name: 'Sobrancelha', note: 'com navalha', price: '20,00', from: false },
      { id: 'sobrancelha-pinca', name: 'Sobrancelha', note: 'com pinça', price: '25,00', from: false }
    ],
    combos: [
      { id: 'combo-1', name: 'Cabelo + barba + sobrancelha', price: '85,00' },
      { id: 'combo-2', name: 'Cabelo + sobrancelha', price: '55,00' },
      { id: 'combo-3', name: 'Cabelo + barba', price: '69,00' }
    ]
  },
  equipe: {
    services: [
      { id: 'barba-express', name: 'Barba express', note: 'só maquininha', price: '15,00', from: false },
      { id: 'tinta-spray', name: 'Tinta spray color', note: '', price: '15,00', from: false },
      { id: 'hidratacao', name: 'Hidratação', note: '', price: '30,00', from: true },
      { id: 'higienizacao', name: 'Higienização de cabelo', note: '', price: '20,00', from: true },
      { id: 'selagem', name: 'Selagem / progressiva', note: '', price: '80,00', from: true },
      { id: 'mascara-negra', name: 'Máscara negra', note: '', price: '25,00', from: false },
      { id: 'pigmentacao', name: 'Pigmentação', note: '', price: '20,00', from: false },
      { id: 'platinado', name: 'Platinado', note: '', price: '80,00', from: true },
      { id: 'luzes', name: 'Luzes', note: '', price: '60,00', from: true },
      { id: 'barba', name: 'Barba', note: '', price: '28,00', from: false },
      { id: 'cabelo', name: 'Cabelo', note: '', price: '35,00', from: false },
      { id: 'acabamento', name: 'Acabamento', note: 'pezinho', price: '15,00', from: false },
      { id: 'sobrancelha-navalha', name: 'Sobrancelha', note: 'com navalha', price: '18,00', from: false },
      { id: 'sobrancelha-pinca', name: 'Sobrancelha', note: 'com pinça', price: '25,00', from: false }
    ],
    combos: [
      { id: 'combo-1', name: 'Cabelo + barba + sobrancelha', price: '73,00' },
      { id: 'combo-2', name: 'Cabelo + sobrancelha', price: '49,00' },
      { id: 'combo-3', name: 'Cabelo + barba', price: '59,00' }
    ]
  }
}

export const defaultPlans = [
  {
    id: 'plano-cabelo',
    order: 1,
    eyebrow: 'Assinatura',
    name: 'Cabelo',
    day: 'Quarta-feira',
    included: ['4 cortes de cabelo no mês'],
    bonusTags: [
      '🎁 Participação em sorteios mensais',
      'Economize R$ 30,00 e mantenha o estilo sempre em dia'
    ],
    oldPrice: '140,00',
    newPrice: '109,90',
    featured: false,
    badge: ''
  },
  {
    id: 'plano-barba',
    order: 2,
    eyebrow: 'Assinatura',
    name: 'Barba',
    day: 'Quarta-feira',
    included: ['4 aparos de barba'],
    bonusTags: [
      '🎁 Participação em sorteios mensais',
      'Barba sempre alinhada, economizando R$ 22,00'
    ],
    oldPrice: '112,00',
    newPrice: '89,90',
    featured: false,
    badge: ''
  },
  {
    id: 'plano-elite',
    order: 3,
    eyebrow: 'Plano',
    name: 'Elite',
    day: 'Seg · Ter · Qua',
    included: ['2 cortes de cabelo', '4 aparos de barba', '1 design de sobrancelhas'],
    bonusTags: [
      '🎁 2 acabamentos (pezinho) + 1 hidratação ou limpeza de pele',
      '5% off em outros procedimentos e produtos'
    ],
    oldPrice: '260,00',
    newPrice: '189,90',
    featured: true,
    badge: 'Mais completo'
  },
  {
    id: 'plano-familia',
    order: 4,
    eyebrow: 'Plano',
    name: 'Família',
    day: 'Até 3 pessoas · Seg, Ter e Qua',
    included: ['4 cortes de cabelo', '2 design de sobrancelhas'],
    bonusTags: [
      '🎁 1 hidratação ou 1 limpeza de pele',
      'Economize mais de R$ 40,00'
    ],
    oldPrice: '206,00',
    newPrice: '164,90',
    featured: false,
    badge: ''
  }
]

export const defaultWinners = [
  { id: 'top1', position: 1, name: '', photoUrl: '', date: '' },
  { id: 'top2', position: 2, name: '', photoUrl: '', date: '' },
  { id: 'top3', position: 3, name: '', photoUrl: '', date: '' }
]
