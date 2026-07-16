// Máscara de valores em reais para inputs do painel admin.
// Guarda/edita sempre como string "0,00" (sem "R$"), que é como o site público espera.

export function maskCurrencyInput(inputEl) {
  inputEl.addEventListener('input', () => {
    let digits = inputEl.value.replace(/\D/g, '')
    if (!digits) { inputEl.value = ''; return }
    digits = digits.replace(/^0+(?=\d)/, '')
    while (digits.length < 3) digits = '0' + digits
    const cents = digits.slice(-2)
    const reais = digits.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    inputEl.value = `${reais},${cents}`
  })
}

export function formatBRL(value) {
  return `R$ ${value}`
}
